import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import type { Endpoint, CacheEntry, CacheMetadata } from './types';


export class Open5eCache {
  private db: Database.Database;
  private memoryCache: Map<string, CacheEntry<unknown>>;

  constructor() {
    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      mkdir(dataDir, { recursive: true }).catch(error => {
        console.error('Failed to create data directory:', error);
      });
    }

    // Initialize SQLite database
    this.db = new Database(join(dataDir, 'open5e-cache.db'));
    this.memoryCache = new Map();

    // Create tables if they don't exist
    this.initializeTables();
  }

  /**
   * Get cached data for a specific key
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memCached = this.memoryCache.get(key);
    if (memCached && memCached.expires_at > new Date()) {
      return memCached.data as T;
    }

    // Check SQLite cache
    const stmt = this.db.prepare(
      "SELECT * FROM open5e_cache WHERE id = ? AND expires_at > datetime('now')"
    );
    const result = stmt.get(key) as { 
      id: string;
      endpoint: string;
      data: string;
      created_at: string;
      expires_at: string;
    } | undefined;

    if (result) {
      try {
        const parsed = {
          ...result,
          data: JSON.parse(result.data),
          created_at: new Date(result.created_at),
          expires_at: new Date(result.expires_at)
        } as CacheEntry<T>;

        // Update memory cache
        this.memoryCache.set(key, parsed);
        return parsed.data;
      } catch (error) {
        console.error('Failed to parse cached data:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * Set data in cache
   */
  async set<T>(
    key: string,
    endpoint: Endpoint,
    data: T,
    ttlMs: number
  ): Promise<void> {
    try {
      const now = new Date();
      const expires = new Date(now.getTime() + ttlMs);

      const entry: CacheEntry<T> = {
        id: key,
        endpoint,
        data,
        created_at: now,
        expires_at: expires
      };

      // Update SQLite cache
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO open5e_cache (
          id, endpoint, data, created_at, expires_at
        ) VALUES (
          @id, @endpoint, @data, @created_at, @expires_at
        )
      `);

      const serialized = JSON.stringify(data, null, 0);
      if (!serialized) {
        throw new Error('Failed to serialize data');
      }

      stmt.run({
        id: entry.id,
        endpoint: entry.endpoint,
        data: serialized,
        created_at: entry.created_at.toISOString(),
        expires_at: entry.expires_at.toISOString()
      });

      // Update memory cache
      this.memoryCache.set(key, entry);

      // Update metadata
      await this.updateMetadata(endpoint);
    } catch (error) {
      console.error('Failed to cache data:', error);
      throw error;
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpired(): Promise<void> {
    // Clear from SQLite
    const stmt = this.db.prepare(
      "DELETE FROM open5e_cache WHERE expires_at <= datetime('now')"
    );
    stmt.run();

    // Clear from memory cache
    const now = new Date();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expires_at <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries for an endpoint
   */
  async clearEndpoint(endpoint: Endpoint): Promise<void> {
    // Clear from SQLite
    const stmt = this.db.prepare('DELETE FROM open5e_cache WHERE endpoint = ?');
    stmt.run(endpoint);

    // Clear from memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.endpoint === endpoint) {
        this.memoryCache.delete(key);
      }
    }

    // Update metadata
    await this.updateMetadata(endpoint);
  }

  /**
   * Get cache metadata for an endpoint
   */
  async getMetadata(endpoint: Endpoint): Promise<CacheMetadata | null> {
    const stmt = this.db.prepare('SELECT * FROM open5e_metadata WHERE endpoint = ?');
    return stmt.get(endpoint) as CacheMetadata | null;
  }

  private async updateMetadata(endpoint: Endpoint): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO open5e_metadata (
        endpoint, last_updated, total_items, version
      ) VALUES (
        @endpoint,
        datetime('now'),
        (SELECT COUNT(*) FROM open5e_cache WHERE endpoint = @endpoint),
        @version
      )
    `);

    stmt.run({
      endpoint,
      version: '1.0.0' // Update this when cache format changes
    });
  }

  /**
   * Clear all cache data
   */
  async clearAll(): Promise<void> {
    try {
      // Clear SQLite tables
      this.db.exec('DELETE FROM open5e_cache');
      this.db.exec('DELETE FROM open5e_metadata');
      
      // Clear memory cache
      this.memoryCache.clear();
      
      console.log('Cleared all cache data');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  private initializeTables(): void {
    // Create cache table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS open5e_cache (
        id TEXT PRIMARY KEY,
        endpoint TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      )
    `);

    // Create metadata table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS open5e_metadata (
        endpoint TEXT PRIMARY KEY,
        last_updated TIMESTAMP,
        total_items INTEGER,
        version TEXT
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_cache_endpoint ON open5e_cache(endpoint);
      CREATE INDEX IF NOT EXISTS idx_cache_expires ON open5e_cache(expires_at);
    `);
  }
} 