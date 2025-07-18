import { userSchemas } from '../../utils/validation';
import { createError, successResponse, HTTP_STATUS } from '../../utils/api';
import { queries } from '../../db/queries';
import { generateTokenPair } from '../../utils/jwt';
import { hashPassword } from '../../utils/auth';
import { getAuthCookieOptions, COOKIE_NAMES } from '../../utils/auth/cookie';
import type { User } from '../../db/types';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    try {
        const data = await userSchemas.create.parseAsync(body);

        const existingUser = queries.getUserByEmail.get(data.email);
        if (existingUser) {
            throw createError.badRequest('Email already registered');
        }

        const password_hash = await hashPassword(data.password);
        if (!password_hash) {
            throw createError.internal('Failed to hash password');
        }

        const user = queries.createUser.get({
            name: data.name,
            email: data.email,
            password_hash
        }) as User;

        if (!user) {
            throw createError.internal('Failed to create user');
        }

        const { token, refreshToken, expiresIn } = generateTokenPair(user);

        setCookie(event, COOKIE_NAMES.ACCESS_TOKEN, token, getAuthCookieOptions('access'));
        setCookie(event, COOKIE_NAMES.REFRESH_TOKEN, refreshToken, getAuthCookieOptions('refresh'));

        return successResponse({
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token,
            refreshToken,
            expiresIn
        }, HTTP_STATUS.CREATED);
    } catch (error) {
        console.error('Registration error:', error);

        if (error instanceof Error) {
            if (error.message === 'Email already registered') {
                throw createError.badRequest(error.message);
            }
            
            if (error.message.includes('Failed to hash password')) {
                throw createError.internal('Error processing password');
            }
        }
        
        throw createError.internal('Failed to create user');
    }
}); 