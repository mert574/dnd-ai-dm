import type { CookieOptions } from 'h3';
import { getEnv } from '../env';

export interface AuthCookieOptions {
    httpOnly?: boolean;
    sameSite?: CookieOptions['sameSite'];
    secure?: boolean;
    path?: string;
}

export function getAuthCookieOptions(type: 'access' | 'refresh'): CookieOptions {
    const env = getEnv();
    const isProduction = env.NODE_ENV === 'production';
    
    const baseOptions: CookieOptions = {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        path: '/'
    };
    
    if (type === 'access') {
        return {
            ...baseOptions,
            maxAge: 60 * 15 // 15 minutes
        };
    } else {
        return {
            ...baseOptions,
            maxAge: 60 * 60 * 24 * 30 // 30 days
        };
    }
}

export const COOKIE_NAMES = {
    ACCESS_TOKEN: 'auth-token',
    REFRESH_TOKEN: 'refresh-token'
} as const;