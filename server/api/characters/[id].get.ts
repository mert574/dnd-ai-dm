import type { H3Event } from 'h3';
import { z } from 'zod';
import { auth } from '~/server/utils/better-auth';
import { characterService } from '~/server/services/character.service';
import { apiErrorCreators, successResponse } from '~/server/utils/api';

export default defineEventHandler(async (event: H3Event) => {
  try {
    const session = await auth.api.getSession({ headers: event.headers });
    if (!session) {
      throw apiErrorCreators.unauthorized('Authentication required');
    }

    const characterId = getRouterParam(event, 'id');
    const parsedId = z.coerce.number().int().positive().safeParse(characterId);
    
    if (!parsedId.success) {
      throw apiErrorCreators.badRequest('Invalid character ID');
    }

    const character = await characterService.getById(parsedId.data);
    
    if (!character) {
      throw apiErrorCreators.notFound('Character not found');
    }

    if (character.userId !== session.user.id) {
      throw apiErrorCreators.forbidden('Access denied to this character');
    }

    return successResponse(character);
  } catch (error: unknown) {
    console.error('Get Character Error:', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    
    throw apiErrorCreators.internal('Failed to retrieve character');
  }
});