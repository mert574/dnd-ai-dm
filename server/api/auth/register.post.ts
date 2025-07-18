import { userSchemas } from '../../utils/validation';
import { createError, successResponse, HTTP_STATUS } from '../../utils/api';
import { queries } from '../../db/queries';
import { generateTokenPair } from '../../utils/jwt';
import { hashPassword } from '../../utils/auth';
import type { User } from '../../db/types';
import ms from 'ms';

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

        setCookie(event, 'auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: expiresIn / 1000,
            path: '/'
        });

        setCookie(event, 'refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: ms('30d') / 1000
        });

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