import type { H3Event } from 'h3';
import { z } from 'zod';
import { auth } from '~/server/utils/better-auth';
import { campaignService } from '~/server/services/campaign.service';
import { apiErrorCreators, successResponse } from '~/server/utils/api';

const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100, 'Campaign name too long'),
});

export default defineEventHandler(async (event: H3Event) => {
  try {
    const session = await auth.api.getSession({ headers: event.headers });
    if (!session) {
      throw apiErrorCreators.unauthorized('Authentication required');
    }

    const body = await readBody(event);
    const validationResult = createCampaignSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw apiErrorCreators.validation('Invalid campaign data', validationResult.error.issues);
    }
    
    const { name } = validationResult.data;

    const campaign = await campaignService.create({
      name,
      userId: session.user.id
    });

    return successResponse(campaign, 201);
  } catch (error: unknown) {
    console.error('Create Campaign Error:', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    
    throw apiErrorCreators.internal('Failed to create campaign');
  }
});