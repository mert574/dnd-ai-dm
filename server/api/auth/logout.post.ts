import { successResponse } from '../../utils/api';

export default defineEventHandler((event) => {
    deleteCookie(event, 'auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });

    deleteCookie(event, 'refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });

    return successResponse({ message: 'Logged out successfully' });
}); 