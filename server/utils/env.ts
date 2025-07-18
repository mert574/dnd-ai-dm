import { z } from 'zod';

const envSchema = z.object({
    // JWT Configuration
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
    
    // Server Configuration
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('3000'),
    
    // Database Configuration
    DATABASE_PATH: z.string().default('data/game.db'),
    
    // Security Configuration
    BCRYPT_ROUNDS: z.string().transform(Number).default('10'),
    SESSION_CODE_LENGTH: z.string().transform(Number).default('6'),
    
    // External APIs
    OPEN5E_API_URL: z.string().url().default('https://api.open5e.com'),
    OPEN5E_RATE_LIMIT: z.string().transform(Number).default('100'),
});

type Env = z.infer<typeof envSchema>;

let parsedEnv: Env | null = null;

export function getEnv(): Env {
    if (parsedEnv) return parsedEnv;
    
    try {
        // In production, require proper JWT secrets
        if (process.env.NODE_ENV === 'production') {
            if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-this-in-production') {
                throw new Error('JWT_SECRET must be set in production');
            }
            if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === 'change-this-in-production') {
                throw new Error('JWT_REFRESH_SECRET must be set in production');
            }
        }
        
        // In development, generate random secrets if not provided
        if (process.env.NODE_ENV !== 'production') {
            if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-this-in-production') {
                process.env.JWT_SECRET = generateRandomSecret();
                console.warn('⚠️  JWT_SECRET not set, using random value for development');
            }
            if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === 'change-this-in-production') {
                process.env.JWT_REFRESH_SECRET = generateRandomSecret();
                console.warn('⚠️  JWT_REFRESH_SECRET not set, using random value for development');
            }
        }
        
        parsedEnv = envSchema.parse(process.env);
        return parsedEnv;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Environment validation failed:');
            error.errors.forEach(err => {
                console.error(`   - ${err.path.join('.')}: ${err.message}`);
            });
            throw new Error('Invalid environment configuration');
        }
        throw error;
    }
}

function generateRandomSecret(): string {
    // Generate a cryptographically secure random string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let secret = '';
    for (let i = 0; i < 64; i++) {
        secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
}

// Initialize on module load to catch configuration errors early
if (process.env.NODE_ENV !== 'test') {
    getEnv();
}