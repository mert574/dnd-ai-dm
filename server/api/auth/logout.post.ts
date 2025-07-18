import { successResponse } from '../../utils/api';
import { getAuthCookieOptions, COOKIE_NAMES } from '../../utils/auth/cookie';

export default defineEventHandler((event) => {
    deleteCookie(event, COOKIE_NAMES.ACCESS_TOKEN, getAuthCookieOptions('access'));
    deleteCookie(event, COOKIE_NAMES.REFRESH_TOKEN, getAuthCookieOptions('refresh'));

    return successResponse({ message: 'Logged out successfully' });
}); 