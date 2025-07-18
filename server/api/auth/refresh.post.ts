import { createError, successResponse } from '../../utils/api';
import { refreshAccessToken } from '../../utils/jwt';
import { getAuthCookieOptions, COOKIE_NAMES } from '../../utils/auth/cookie';

export default defineEventHandler(async (event) => {
    const refreshToken = getCookie(event, COOKIE_NAMES.REFRESH_TOKEN);
    if (!refreshToken) {
        throw createError.unauthorized('No refresh token');
    }

    try {
        const { token, refreshToken: newRefreshToken, expiresIn } = refreshAccessToken(refreshToken);

        setCookie(event, COOKIE_NAMES.ACCESS_TOKEN, token, getAuthCookieOptions('access'));
        setCookie(event, COOKIE_NAMES.REFRESH_TOKEN, newRefreshToken, getAuthCookieOptions('refresh'));

        return successResponse({ token, expiresIn });
    } catch (error) {
        console.error('Token refresh error:', error);
        throw createError.unauthorized('Invalid refresh token');
    }
}); 