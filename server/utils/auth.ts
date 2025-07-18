import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
    if (!password) {
        throw new Error('Password is required');
    }
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
        return false;
    }
    return bcrypt.compare(password, hash);
}