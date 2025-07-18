import Database from 'better-sqlite3';
import { join } from 'path';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
    if (db) return db;

    try {
        // Initialize database
        db = new Database(join(process.cwd(), 'data/game.db'), {
            // Verbose logging in development
            verbose: process.dev ? console.log : undefined,
            // Better performance with larger timeout
            timeout: 5000,
            // Read-only mode protection
            readonly: false,
            // Better handling of busy databases
            fileMustExist: false
        });

        // Enable foreign keys
        db.pragma('foreign_keys = ON');

        // Use Write-Ahead Logging for better concurrency
        db.pragma('journal_mode = WAL');

        // Optimize for performance while maintaining safety
        db.pragma('synchronous = NORMAL');

        // Increase cache size for better performance (10MB)
        db.pragma('cache_size = -10240');

        // Enable query planner optimizations
        db.pragma('optimize');

        return db;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
}

export function closeDatabase(): void {
    if (db) {
        try {
            // Checkpoint WAL file before closing
            db.pragma('wal_checkpoint(TRUNCATE)');
            db.close();
        } catch (error) {
            console.error('Error closing database:', error);
        } finally {
            db = null;
        }
    }
}

// Graceful shutdown handling
async function handleShutdown(signal: string): Promise<void> {
    console.log(`Received ${signal}, closing database...`);
    closeDatabase();
    process.exit(0);
}

// Ensure database is closed on process exit
process.on('exit', closeDatabase);
process.on('SIGHUP', () => handleShutdown('SIGHUP'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM')); 