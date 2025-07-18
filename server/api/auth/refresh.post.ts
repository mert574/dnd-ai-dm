import ms from 'ms';
import { createError, successResponse } from '../../utils/api';
import { refreshAccessToken } from '../../utils/jwt';

export default defineEventHandler(async (event) => {
    const refreshToken = getCookie(event, 'refresh_token');
    if (!refreshToken) {
        throw createError.unauthorized('No refresh token');
    }

    try {
        const { token, refreshToken: newRefreshToken, expiresIn } = refreshAccessToken(refreshToken);

        setCookie(event, 'auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: expiresIn / 1000
        });

        setCookie(event, 'refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/api/auth',
            maxAge: ms('30d') / 1000
        });

        return successResponse({ token, expiresIn });
    } catch (error) {
        console.error('Token refresh error:', error);
        throw createError.unauthorized('Invalid refresh token');
    }
}); 