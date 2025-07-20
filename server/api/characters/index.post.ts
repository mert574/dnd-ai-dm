import type { H3Event } from 'h3';
import { z } from 'zod';
import { auth } from '~/server/utils/better-auth';
import { characterService } from '~/server/services/character.service';
import { apiErrorCreators, successResponse } from '~/server/utils/api';

const createCharacterSchema = z.object({
  name: z.string().min(1, 'Character name is required').max(100, 'Character name too long'),
  class: z.string().min(1, 'Character class is required'),
  race: z.string().min(1, 'Character race is required'),
  level: z.number().int().min(1).max(20),
  strength: z.number().int().min(1).max(30),
  dexterity: z.number().int().min(1).max(30),
  constitution: z.number().int().min(1).max(30),
  intelligence: z.number().int().min(1).max(30),
  wisdom: z.number().int().min(1).max(30),
  charisma: z.number().int().min(1).max(30),
  maxHp: z.number().int().min(1),
  armorClass: z.number().int().min(1),
  hitDice: z.string().min(1, 'Hit dice is required'),
});

export default defineEventHandler(async (event: H3Event) => {
  try {
    const session = await auth.api.getSession({ headers: event.headers });
    if (!session) {
      throw apiErrorCreators.unauthorized('Authentication required');
    }

    const body = await readBody(event);
    const validationResult = createCharacterSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw apiErrorCreators.validation('Invalid character data', validationResult.error.issues);
    }
    
    const characterData = {
      ...validationResult.data,
      userId: session.user.id
    };

    const character = await characterService.create(characterData);

    return successResponse(character, 201);
  } catch (error: unknown) {
    console.error('Create Character Error:', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    
    throw apiErrorCreators.internal('Failed to create character');
  }
});