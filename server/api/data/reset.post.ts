import { resetCache } from '~/server/utils/open5e/warmup';
import { createError } from '~/server/utils/api';

export default defineEventHandler(async (event) => {
  try {
    await resetCache();
    return { success: true, message: 'Cache reset complete' };
  } catch (error) {
    console.error('Failed to reset cache:', error);
    throw createError.internal('Failed to reset cache');
  }
}); 