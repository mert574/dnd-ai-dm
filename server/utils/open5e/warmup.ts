import { Open5eClient } from './client';
import { Open5eCache } from './cache';
import { Endpoint } from './types';
import ms from 'ms';

const client = new Open5eClient();
const cache = new Open5eCache();

/**
 * Warm up cache with frequently accessed data
 */
export async function warmupCache() {
  try {
    console.log('Starting cache warmup...');

    // Core data that should always be cached
    const coreEndpoints = [
      Endpoint.Races,
      Endpoint.Classes,
      Endpoint.Backgrounds
    ];

    // Common game data with limits
    const gameData = [
      { endpoint: Endpoint.Spells, limit: 20 },
      { endpoint: Endpoint.Weapons, limit: 20 },
      { endpoint: Endpoint.MagicItems, limit: 20 }
    ];

    // Fetch core data first (blocking)
    for (const endpoint of coreEndpoints) {
      console.log(`Warming up ${endpoint}...`);
      const data = await client.fetchAll(endpoint);
      await cache.set(
        `${endpoint}:all:all`,
        endpoint,
        data,
        ms('7d')
      );
    }

    // Fetch limited game data in parallel (non-blocking)
    const promises = gameData.map(async ({ endpoint, limit }) => {
      try {
        console.log(`Warming up ${endpoint} (limit: ${limit})...`);
        const data = await client.fetchAll(endpoint);
        // Cache both limited and full data
        await Promise.all([
          cache.set(
            `${endpoint}:all:${limit}`,
            endpoint,
            data.slice(0, limit),
            ms('1d')
          ),
          cache.set(
            `${endpoint}:all:all`,
            endpoint,
            data,
            ms('1d')
          )
        ]);
      } catch (error) {
        console.error(`Failed to warm up ${endpoint}:`, error);
      }
    });

    await Promise.allSettled(promises);
    console.log('Cache warmup complete');
  } catch (error) {
    console.error('Cache warmup failed:', error);
  }
}

/**
 * Schedule periodic cache warmup
 */
export function scheduleWarmup(intervalMs = ms('12h')) {
  // Initial warmup
  warmupCache();

  // Schedule periodic warmup
  setInterval(() => {
    warmupCache();
  }, intervalMs);
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache() {
  try {
    await cache.clearExpired();
    console.log('Cleared expired cache entries');
  } catch (error) {
    console.error('Failed to clear expired cache:', error);
  }
}

/**
 * Schedule periodic cache cleanup
 */
export function scheduleCleanup(intervalMs = ms('1h')) {
  setInterval(() => {
    clearExpiredCache();
  }, intervalMs);
}

/**
 * Reset cache and restart warmup
 */
export async function resetCache(): Promise<void> {
  try {
    console.log('Resetting cache...');
    await cache.clearAll();
    await warmupCache();
    console.log('Cache reset complete');
  } catch (error) {
    console.error('Failed to reset cache:', error);
    throw error;
  }
} 