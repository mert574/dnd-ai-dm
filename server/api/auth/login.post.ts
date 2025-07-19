import { defineEventHandler, readBody, setCookie } from 'h3';
import { authSchemas } from '../../utils/validation';
import { apiErrorCreators, successResponse } from '../../utils/api';
import { queries } from '../../db/queries';
import { generateTokenPair } from '../../utils/jwt';
import { verifyPassword } from '../../utils/auth';
import { getAuthCookieOptions, COOKIE_NAMES } from '../../utils/auth/cookie';
import type { User } from '../../db/types';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const data = await authSchemas.login.parseAsync(body);

    try {
        const user = queries.getUserByEmail.get(data.email) as User;

        if (!user || !(await verifyPassword(data.password, user.password_hash))) {
            throw apiErrorCreators.unauthorized('Invalid email or password');
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
        });
    } catch (error) {
        console.error('Login error:', error);
        throw apiErrorCreators.unauthorized('Invalid email or password');
    }
}); 