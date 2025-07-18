import { H3Event } from 'h3';
import { Open5eClient } from '~/server/utils/open5e/client';
import { Open5eCache } from '~/server/utils/open5e/cache';
import { Endpoint, Open5eError } from '~/server/utils/open5e/types';
import { createError } from '~/server/utils/api';
import ms from 'ms';

// Initialize client and cache
const client = new Open5eClient();
const cache = new Open5eCache();

// Get valid endpoint values
const validEndpoints = Object.values(Endpoint);

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Get endpoint type from URL
    const type = event.context.params?.type;
    if (!type || !validEndpoints.includes(type as Endpoint)) {
      throw createError.badRequest(`Invalid endpoint type: ${type}`);
    }

    const endpoint = type as Endpoint;

    // Get query parameters
    const query = getQuery(event);
    const { search, slug, limit } = query;

    // Generate cache key (include limit in the key)
    const cacheKey = slug 
      ? `${endpoint}:${slug}`
      : search
      ? `${endpoint}:search:${search}:${limit || 'all'}`
      : `${endpoint}:all:${limit || 'all'}`;

    // Try to get from cache first
    const cached = await cache.get<any[]>(cacheKey);
    if (cached) {
      return limit ? cached.slice(0, Number(limit)) : cached;
    }

    // Fetch from API based on query type
    let data: any[];
    if (slug) {
      data = [await client.fetchBySlug(endpoint, slug as string)];
    } else if (search) {
      data = await client.search(endpoint, search as string);
    } else {
      data = await client.fetchAll(endpoint);
    }

    // Cache the full result
    await cache.set(
      cacheKey,
      endpoint,
      data,
      ms('1d')
    );

    // Return limited result if requested
    return limit ? data.slice(0, Number(limit)) : data;
  } catch (error: unknown) {
    console.error('Open5e API Error:', error);
    
    if (error instanceof Open5eError) {
      throw createError.badRequest(error.message);
    }
    
    throw createError.internal('Failed to fetch D&D data');
  }
}); 