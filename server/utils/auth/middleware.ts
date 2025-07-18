import { H3Event } from 'h3';
import { createError } from '../api';
import { queries } from '../../db/queries';
import { verifyToken, parseAuthHeader, refreshAccessToken } from '../jwt';
import type { User, Session, Character } from '../../db/types';

export async function getUser(event: H3Event): Promise<User | null> {
    try {
        // Check for auth token in cookie or header
        const authCookie = getCookie(event, 'auth_token');
        const authHeader = getHeader(event, 'Authorization');
        
        if (!authCookie && !authHeader) {
            return null;
        }

        const token = authCookie || (authHeader ? parseAuthHeader(authHeader) : null);
        if (!token) {
            return null;
        }

        try {
            // Try to verify the current token
            const payload = verifyToken(token);
            return queries.getUserById.get(payload.userId) as User;
        } catch (error: any) {
            // If token is expired and we have a refresh token, try to refresh
            if (error.message === 'Token expired') {
                const refreshToken = getCookie(event, 'refresh_token');
                if (!refreshToken) {
                    return null;
                }

                try {
                    // Get new tokens
                    const { token: newToken, expiresIn } = refreshAccessToken(refreshToken);
                    
                    // Set new auth token cookie
                    setCookie(event, 'auth_token', newToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        path: '/',
                        maxAge: expiresIn / 1000
                    });

                    // Verify new token and get user
                    const payload = verifyToken(newToken);
                    return queries.getUserById.get(payload.userId) as User;
                } catch {
                    // If refresh fails, clear all auth cookies
                    deleteCookie(event, 'auth_token', { path: '/' });
                    deleteCookie(event, 'refresh_token', { path: '/' });
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
        throw createError.unauthorized();
    }
    return user;
}

export async function requireDM(event: H3Event): Promise<{ user: User; session: Session }> {
    const user = await requireAuth(event);
    const sessionId = event.context.params?.sessionId;
    
    if (!sessionId) {
        throw createError.badRequest('Session ID is required');
    }

    try {
        const session = queries.getSessionById.get(sessionId) as Session;
        if (!session || session.user_id !== user.id) {
            throw createError.forbidden('Only the DM can perform this action');
        }
        return { user, session };
    } catch (error) {
        console.error('Error checking DM role:', error);
        throw createError.internal();
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
        throw createError.badRequest('Session ID is required');
    }

    try {
        const session = queries.getSessionById.get(sessionId) as Session;
        if (!session) {
            throw createError.notFound('Session not found');
        }

        if (session.user_id === user.id) {
            return { user, session, role: 'dm' };
        }

        const characters = queries.getCharactersInSession.all(sessionId) as Character[];
        const character = characters.find(c => c.user_id === user.id);

        if (!character) {
            throw createError.forbidden('You are not a participant in this session');
        }

        return { user, session, character, role: 'player' };
    } catch (error) {
        console.error('Error checking session participation:', error);
        throw createError.internal();
    }
} 