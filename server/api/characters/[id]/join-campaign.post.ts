import type { H3Event } from 'h3';
import { z } from 'zod';
import { auth } from '~/server/utils/better-auth';
import { characterService } from '~/server/services/character.service';
import { apiErrorCreators, successResponse } from '~/server/utils/api';

const joinCampaignSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
});

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

    const body = await readBody(event);
    const validationResult = joinCampaignSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw apiErrorCreators.validation('Invalid campaign data', validationResult.error.issues);
    }

    // Check if character exists and belongs to user
    const existingCharacter = await characterService.getById(parsedId.data);
    
    if (!existingCharacter) {
      throw apiErrorCreators.notFound('Character not found');
    }

    if (existingCharacter.userId !== session.user.id) {
      throw apiErrorCreators.forbidden('Access denied to this character');
    }

    // Check if character is already in a campaign
    if (existingCharacter.campaignId) {
      throw apiErrorCreators.badRequest('Character is already in a campaign');
    }

    const joinData = {
      campaignId: validationResult.data.campaignId,
      characterId: parsedId.data,
      userId: session.user.id
    };

    const character = await characterService.joinToCampaign(joinData);
    
    if (!character) {
      throw apiErrorCreators.internal('Failed to join campaign');
    }

    return successResponse(character);
  } catch (error: unknown) {
    console.error('Join Campaign Error:', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    
    throw apiErrorCreators.internal('Failed to join campaign');
  }
});