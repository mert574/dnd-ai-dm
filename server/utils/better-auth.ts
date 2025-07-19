import { betterAuth } from 'better-auth'
import Database from 'better-sqlite3'
import ms from 'ms'

if (!process.env.BETTER_AUTH_SECRET || !process.env.BETTER_AUTH_URL) {
    throw new Error('BETTER_AUTH_SECRET and BETTER_AUTH_URL must be set')
}

export const auth = betterAuth({
    database: new Database('./data/game.db'),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    // Convert milliseconds to seconds
    session: {
        expiresIn: ms('7d') / 1000, 
        updateAge: ms('1d') / 1000,
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    advanced: {
        database: {
            generateId: () => Math.random().toString(36).substring(2, 15),
        },
    },
})

export type AuthSession = typeof auth.$Infer.Session.session
export type AuthUser = typeof auth.$Infer.Session.user
