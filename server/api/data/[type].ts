import type { H3Event } from 'h3';
import { z } from 'zod';
import { Open5eClient } from '~/server/utils/open5e/client';
import { Open5eCache } from '~/server/utils/open5e/cache';
import { Endpoint, Open5eError } from '~/server/utils/open5e/types';
import { apiErrorCreators } from '~/server/utils/api';
import ms from 'ms';

// Initialize client and cache
const client = new Open5eClient();
const cache = new Open5eCache();

// Get valid endpoint values
const validEndpoints = Object.values(Endpoint);

// Query parameter validation schema
const querySchema = z.object({
  search: z.string().optional(),
  slug: z.string().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(
    z.number().min(1).max(100)
  ).optional()
}).refine(
  (data) => {
    // Can't have both search and slug
    return !(data.search && data.slug);
  },
  { message: "Cannot specify both 'search' and 'slug' parameters" }
);

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Get endpoint type from URL
    const type = event.context.params?.type;
    if (!type || !validEndpoints.includes(type as Endpoint)) {
      throw apiErrorCreators.badRequest(`Invalid endpoint type: ${type}`);
    }

    const endpoint = type as Endpoint;

    // Get and validate query parameters
    const rawQuery = getQuery(event);
    const validationResult = querySchema.safeParse(rawQuery);
    
    if (!validationResult.success) {
      throw apiErrorCreators.validation('Invalid query parameters', validationResult.error.issues);
    }
    
    const { search, slug, limit } = validationResult.data;

    // Generate cache key (include limit in the key)
    const cacheKey = slug 
      ? `${endpoint}:${slug}`
      : search
      ? `${endpoint}:search:${search}:${limit ?? 'all'}`
      : `${endpoint}:all:${limit ?? 'all'}`;

    // Try to get from cache first
    const cached = await cache.get<unknown[]>(cacheKey);
    if (cached) {
      return limit ? cached.slice(0, Number(limit)) : cached;
    }

    // Fetch from API based on query type
    let data: unknown[];
    if (slug) {
      data = [await client.fetchBySlug(endpoint, slug)];
    } else if (search) {
      data = await client.search(endpoint, search);
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
    return limit ? data.slice(0, limit) : data;
  } catch (error: unknown) {
    console.error('Open5e API Error:', error);
    
    if (error instanceof Open5eError) {
      throw apiErrorCreators.badRequest(error.message);
    }
    
    throw apiErrorCreators.internal('Failed to fetch D&D data');
  }
}); 