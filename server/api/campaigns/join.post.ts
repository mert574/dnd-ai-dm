import type { H3Event } from 'h3';
import { z } from 'zod';
import { auth } from '~/server/utils/better-auth';
import { campaignService } from '~/server/services/campaign.service';
import { characterService } from '~/server/services/character.service';
import { apiErrorCreators, successResponse } from '~/server/utils/api';

const joinCampaignSchema = z.object({
  campaignCode: z.string().min(1, 'Campaign code is required'),
  characterId: z.number().int().positive('Valid character ID is required'),
});

export default defineEventHandler(async (event: H3Event) => {
  try {
    const session = await auth.api.getSession({ headers: event.headers });
    if (!session) {
      throw apiErrorCreators.unauthorized('Authentication required');
    }

    const body = await readBody(event);
    const validationResult = joinCampaignSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw apiErrorCreators.validation('Invalid join data', validationResult.error.issues);
    }
    
    const { campaignCode, characterId } = validationResult.data;

    const campaign = await campaignService.getById(campaignCode);
    if (!campaign) {
      throw apiErrorCreators.notFound('Campaign not found');
    }

    if (campaign.status !== 'active') {
      throw apiErrorCreators.badRequest('Campaign is not accepting new players');
    }

    const character = await characterService.getById(characterId);
    if (!character) {
      throw apiErrorCreators.notFound('Character not found');
    }

    if (character.userId !== session.user.id) {
      throw apiErrorCreators.forbidden('You can only join campaigns with your own characters');
    }

    if (character.campaignId) {
      throw apiErrorCreators.badRequest('Character is already in a campaign');
    }

    const updatedCharacter = await characterService.joinToCampaign({
      campaignId: campaignCode,
      characterId,
      userId: session.user.id
    });

    if (!updatedCharacter) {
      throw apiErrorCreators.internal('Failed to join campaign');
    }

    return successResponse({
      campaign,
      character: updatedCharacter
    });
  } catch (error: unknown) {
    console.error('Join Campaign Error:', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    
    throw apiErrorCreators.internal('Failed to join campaign');
  }
});