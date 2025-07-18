import jwt from 'jsonwebtoken';
import { createError } from './api';
import type { User } from '../db/types';
import type { Secret } from 'jsonwebtoken';
import ms from 'ms';
import assert from 'node:assert';

const {
    JWT_SECRET = 'change-this-in-production',
    JWT_EXPIRES_IN = '7d',
    JWT_REFRESH_SECRET = 'change-this-in-production',
    JWT_REFRESH_EXPIRES_IN = '30d'
} = process.env;

export interface JwtPayload {
    userId: number;
    email: string;
    type?: 'access' | 'refresh';
}

export interface TokenPair {
    token: string;
    refreshToken: string;
    expiresIn: number;
}

export function generateTokenPair(user: User): TokenPair {
    assert(JWT_SECRET, 'JWT_SECRET is not set');
    assert(JWT_EXPIRES_IN, 'JWT_EXPIRES_IN is not set');
    assert(JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET is not set');
    assert(JWT_REFRESH_EXPIRES_IN, 'JWT_REFRESH_EXPIRES_IN is not set');

    const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        type: 'access'
    };

    const refreshPayload: JwtPayload = {
        userId: user.id,
        email: user.email,
        type: 'refresh'
    };

    const token = jwt.sign(payload, JWT_SECRET as Secret, {
        expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
    });

    const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET as Secret, {
        expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn']
    });

    // @ts-expect-error - ms types are too strict, we validate the result
    const expiresInMs = ms(JWT_EXPIRES_IN);
    if (typeof expiresInMs !== 'number') {
        throw new Error('Invalid expiration time');
    }

    return {
        token,
        refreshToken,
        expiresIn: expiresInMs
    };
}

export function verifyToken(token: string, type: 'access' | 'refresh' = 'access'): JwtPayload {
    try {
        const secret = type === 'access' ? JWT_SECRET : JWT_REFRESH_SECRET;
        const payload = jwt.verify(token, secret as Secret) as JwtPayload;

        if (payload.type && payload.type !== type) {
            throw createError.unauthorized('Invalid token type');
        }

        return payload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw createError.unauthorized('Token expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw createError.unauthorized('Invalid token');
        }
        throw error;
    }
}

export function refreshAccessToken(refreshToken: string): TokenPair {
    const payload = verifyToken(refreshToken, 'refresh');
    const user = { id: payload.userId, email: payload.email } as User;
    return generateTokenPair(user);
}

export function parseAuthHeader(authHeader?: string): string {
    if (!authHeader) {
        throw createError.unauthorized('No token provided');
    }

    const [type, token] = authHeader.split(' ');
    
    if (type !== 'Bearer' || !token) {
        throw createError.unauthorized('Invalid token format');
    }

    return token;
} 