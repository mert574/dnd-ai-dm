import { authSchemas } from '../../utils/validation';
import { createError, successResponse } from '../../utils/api';
import { queries } from '../../db/queries';
import { generateTokenPair } from '../../utils/jwt';
import { verifyPassword } from '../../utils/auth';
import type { User } from '../../db/types';
import ms from 'ms';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const data = await authSchemas.login.parseAsync(body);

    try {
        const user = queries.getUserByEmail.get(data.email) as User;

        if (!user || !(await verifyPassword(data.password, user.password_hash))) {
            throw createError.unauthorized('Invalid email or password');
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
        });
    } catch (error) {
        console.error('Login error:', error);
        throw createError.unauthorized('Invalid email or password');
    }
}); 