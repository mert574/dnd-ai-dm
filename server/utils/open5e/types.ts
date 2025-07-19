// API Response Types
export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Base URL and Endpoints
export const OPEN5E_BASE_URL = 'https://api.open5e.com/v1';

export enum Endpoint {
  Spells = 'spells',
  Monsters = 'monsters',
  Weapons = 'weapons',
  MagicItems = 'magicitems',
  Races = 'races',
  Classes = 'classes',
  Backgrounds = 'backgrounds',
  Feats = 'feats'
}

// API Data Types
export interface Document {
  slug: string;
  name: string;
  desc: string;
}

export interface Spell extends Document {
  level: number;
  school: string;
  casting_time: string;
  range: string;
  components: string;
  duration: string;
  classes: string;
}

export interface MagicItem extends Document {
  type: string;
  rarity: string;
  requires_attunement: string;
}

export interface Weapon extends Document {
  category: string;
  cost: string;
  damage_dice: string;
  damage_type: string;
  weight: string;
  properties: string[];
}

// Error Types
export class Open5eError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public context?: unknown
  ) {
    super(message);
    this.name = 'Open5eError';
  }
}

// Rate Limiting Types
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitState {
  requests: number;
  windowStart: number;
}

// Cache Types
export interface CacheEntry<T> {
  id: string;
  endpoint: Endpoint;
  data: T;
  created_at: Date;
  expires_at: Date;
}

export interface CacheMetadata {
  endpoint: Endpoint;
  last_updated: Date;
  total_items: number;
  version: string;
}

// Client Configuration
export interface Open5eClientConfig {
  baseUrl?: string;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  rateLimit?: RateLimitConfig;
  retryConfig?: {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
  };
} 