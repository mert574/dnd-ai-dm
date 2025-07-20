import type { H3Event } from 'h3';
import { auth } from '~/server/utils/better-auth';
import { characterService } from '~/server/services/character.service';
import { apiErrorCreators, successResponse } from '~/server/utils/api';

export default defineEventHandler(async (event: H3Event) => {
  try {
    const session = await auth.api.getSession({ headers: event.headers });
    if (!session) {
      throw apiErrorCreators.unauthorized('Authentication required');
    }

    const characters = await characterService.getByUserId(session.user.id);

    return successResponse(characters);
  } catch (error: unknown) {
    console.error('Get Characters Error:', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    
    throw apiErrorCreators.internal('Failed to retrieve characters');
  }
});