import { defineEventHandler } from 'h3';
import { resetCache } from '~/server/utils/open5e/warmup';
import { apiErrorCreators } from '~/server/utils/api';

export default defineEventHandler(async (_event) => {
  try {
    await resetCache();
    return { success: true, message: 'Cache reset complete' };
  } catch (error) {
    console.error('Failed to reset cache:', error);
    throw apiErrorCreators.internal('Failed to reset cache');
  }
}); 