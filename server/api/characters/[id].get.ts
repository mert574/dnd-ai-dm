import type { H3Event } from 'h3';
import { z } from 'zod';
import { auth } from '~/server/utils/better-auth';
import { characterService } from '~/server/services/character.service';
import { campaignService } from '~/server/services/campaign.service';
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

    // Allow access if user owns the character OR if the character is in a campaign the user participates in
    if (character.userId !== session.user.id) {
      // Check if the character is in any campaigns that the current user participates in
      const userCampaigns = await campaignService.getByUserId(session.user.id);
      const userCampaignIds = userCampaigns.map(campaign => campaign.id);
      
      // Check if this character is in any of the user's campaigns
      const isInSharedCampaign = character.campaignId && userCampaignIds.includes(character.campaignId);
      
      if (!isInSharedCampaign) {
        throw apiErrorCreators.forbidden('Access denied to this character');
      }
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