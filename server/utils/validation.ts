import { z } from 'zod';
import { createError } from './api';

// Common validation schemas
export const commonSchemas = {
    id: z.number().int().positive(),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    sessionCode: z.string().regex(/^[A-Z]+_[A-Z]+\d{2}$/),
    pagination: z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20)
    })
};

// Validate data against a Zod schema
export async function validate<T>(schema: z.Schema<T>, data: unknown): Promise<T> {
    try {
        return await schema.parseAsync(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw createError.validation('Validation failed', {
                errors: error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        throw error;
    }
}

// Auth schemas
export const authSchemas = {
    login: z.object({
        email: commonSchemas.email,
        password: commonSchemas.password
    })
};

// User schemas
export const userSchemas = {
    create: z.object({
        name: z.string().min(2).max(100),
        email: commonSchemas.email,
        password: commonSchemas.password
    }),

    update: z.object({
        name: z.string().min(2).max(100).optional(),
        email: commonSchemas.email.optional(),
        password: commonSchemas.password.optional()
    })
};

// Session schemas
export const sessionSchemas = {
    create: z.object({
        name: z.string().min(3).max(100)
    }),

    update: z.object({
        name: z.string().min(3).max(100).optional(),
        status: z.enum(['active', 'paused', 'completed']).optional(),
        game_state: z.record(z.unknown()).optional()
    })
};

// Character schemas
export const characterSchemas = {
    create: z.object({
        name: z.string().min(2).max(100),
        class: z.string(),
        race: z.string(),
        level: z.number().int().min(1).max(20),
        strength: z.number().int().min(1).max(30),
        dexterity: z.number().int().min(1).max(30),
        constitution: z.number().int().min(1).max(30),
        intelligence: z.number().int().min(1).max(30),
        wisdom: z.number().int().min(1).max(30),
        charisma: z.number().int().min(1).max(30),
        max_hp: z.number().int().positive(),
        armor_class: z.number().int().min(0),
        hit_dice: z.string()
    }),

    update: z.object({
        name: z.string().min(2).max(100).optional(),
        level: z.number().int().min(1).max(20).optional(),
        current_hp: z.number().int().optional(),
        temporary_hp: z.number().int().min(0).optional(),
        experience: z.number().int().min(0).optional(),
        gold: z.number().int().min(0).optional(),
        inventory: z.array(z.unknown()).optional(),
        spells_known: z.array(z.string()).optional(),
        prepared_spells: z.array(z.string()).optional()
    })
}; 