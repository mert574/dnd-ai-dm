import { scheduleWarmup, scheduleCleanup } from '../utils/open5e/warmup';

export default defineNitroPlugin(() => {
  // Start cache warmup schedule (every 12 hours)
  scheduleWarmup();

  // Start cache cleanup schedule (every hour)
  scheduleCleanup();

  console.log('Open5e cache management initialized');
}); 