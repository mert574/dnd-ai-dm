import type { H3Event } from 'h3';
import { auth } from '~/server/utils/better-auth';
import { campaignService } from '~/server/services/campaign.service';
import { apiErrorCreators, successResponse } from '~/server/utils/api';

export default defineEventHandler(async (event: H3Event) => {
  try {
    const session = await auth.api.getSession({ headers: event.headers });
    if (!session) {
      throw apiErrorCreators.unauthorized('Authentication required');
    }

    const campaigns = await campaignService.getByUserId(session.user.id);

    return successResponse(campaigns);
  } catch (error: unknown) {
    console.error('Get User Campaigns Error:', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    
    throw apiErrorCreators.internal('Failed to fetch campaigns');
  }
});