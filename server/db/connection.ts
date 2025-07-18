import Database from 'better-sqlite3';
import { join } from 'path';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
    if (db) return db;

    // Initialize database
    db = new Database(join(process.cwd(), 'data/game.db'), {
        // Verbose logging in development
        verbose: process.dev ? console.log : undefined
    });

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Use Write-Ahead Logging for better concurrency
    db.pragma('journal_mode = WAL');

    // Enforce data integrity
    db.pragma('synchronous = FULL');

    return db;
}

export function closeDatabase(): void {
    if (db) {
        db.close();
        db = null;
    }
}

// Ensure database is closed on process exit
process.on('exit', closeDatabase);
process.on('SIGHUP', closeDatabase);
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase); 