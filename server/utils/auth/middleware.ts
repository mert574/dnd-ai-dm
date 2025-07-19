import type { H3Event } from 'h3';
import { apiErrorCreators } from '../api';
import { queries } from '../../db/queries';
import { verifyToken, parseAuthHeader, refreshAccessToken } from '../jwt';
import { getAuthCookieOptions, COOKIE_NAMES } from './cookie';
import type { User, Session, Character } from '../../db/types';

export async function getUser(event: H3Event): Promise<User | null> {
    try {
        // Check for auth token in cookie or header
        const authCookie = getCookie(event, COOKIE_NAMES.ACCESS_TOKEN);
        const authHeader = getHeader(event, 'Authorization');
        
        if (!authCookie && !authHeader) {
            return null;
        }

        const token = authCookie ?? (authHeader ? parseAuthHeader(authHeader) : null);
        if (!token) {
            return null;
        }

        try {
            // Try to verify the current token
            const payload = verifyToken(token);
            return queries.getUserById.get(payload.userId) as User;
        } catch (error) {
            // If token is expired and we have a refresh token, try to refresh
            if (error instanceof Error && error.message === 'Token expired') {
                const refreshToken = getCookie(event, COOKIE_NAMES.REFRESH_TOKEN);
                if (!refreshToken) {
                    return null;
                }

                try {
                    // Get new tokens
                    const { token: newToken } = refreshAccessToken(refreshToken);
                    
                    // Set new auth token cookie
                    setCookie(event, COOKIE_NAMES.ACCESS_TOKEN, newToken, getAuthCookieOptions('access'));

                    // Verify new token and get user
                    const payload = verifyToken(newToken);
                    return queries.getUserById.get(payload.userId) as User;
                } catch {
                    // If refresh fails, clear all auth cookies
                    deleteCookie(event, COOKIE_NAMES.ACCESS_TOKEN, getAuthCookieOptions('access'));
                    deleteCookie(event, COOKIE_NAMES.REFRESH_TOKEN, getAuthCookieOptions('refresh'));
                    return null;
                }
            }
            return null;
        }
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

export async function requireAuth(event: H3Event): Promise<User> {
    const user = await getUser(event);
    if (!user) {
        throw apiErrorCreators.unauthorized();
    }
    return user;
}

export async function requireDM(event: H3Event): Promise<{ user: User; session: Session }> {
    const user = await requireAuth(event);
    const sessionId = event.context.params?.sessionId;
    
    if (!sessionId) {
        throw apiErrorCreators.badRequest('Session ID is required');
    }

    try {
        const session = queries.getSessionById.get(sessionId) as Session;
        if (!session || session.user_id !== user.id) {
            throw apiErrorCreators.forbidden('Only the DM can perform this action');
        }
        return { user, session };
    } catch (error) {
        console.error('Error checking DM role:', error);
        throw apiErrorCreators.internal();
    }
}

export async function requireParticipant(event: H3Event): Promise<{
    user: User;
    session: Session;
    character?: Character;
    role: 'dm' | 'player';
}> {
    const user = await requireAuth(event);
    const sessionId = event.context.params?.sessionId;
    
    if (!sessionId) {
        throw apiErrorCreators.badRequest('Session ID is required');
    }

    try {
        const session = queries.getSessionById.get(sessionId) as Session;
        if (!session) {
            throw apiErrorCreators.notFound('Session not found');
        }

        if (session.user_id === user.id) {
            return { user, session, role: 'dm' };
        }

        const characters = queries.getCharactersInSession.all(sessionId) as Character[];
        const character = characters.find(c => c.user_id === user.id);

        if (!character) {
            throw apiErrorCreators.forbidden('You are not a participant in this session');
        }

        return { user, session, character, role: 'player' };
    } catch (error) {
        console.error('Error checking session participation:', error);
        throw apiErrorCreators.internal();
    }
} 