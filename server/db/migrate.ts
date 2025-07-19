import { getDatabase } from './connection';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const db = getDatabase();

function initializeSchemaVersions() {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS schema_versions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version TEXT NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (error) {
        console.error('Failed to initialize schema_versions table:', error);
        throw error;
    }
}

function getAppliedMigrations(): string[] {
    const result = db.prepare(`
        SELECT version FROM schema_versions ORDER BY version
    `).all() as { version: string }[];
    
    return result.map(row => row.version);
}

function getAllMigrations(): string[] {
    const migrationsDir = join(__dirname, 'migrations');
    const files = readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
    
    return files.map(file => file.replace('.sql', ''));
}

function runMigration(migrationName: string) {
    try {
        console.log(`Applying migration: ${migrationName}`);
        
        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Read and execute the migration file
        const migrationPath = join(__dirname, 'migrations', `${migrationName}.sql`);
        const migration = readFileSync(migrationPath, 'utf8');

        // Split and run the migration
        const [upMigration] = migration.split('-- Down Migration');
        if (!upMigration) {
            throw new Error(`Invalid migration file: missing up migration section in ${migrationName}`);
        }
        
        const statements = upMigration
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                db.exec(`${statement};`);
            }
        }

        // Record the migration
        db.prepare(`
            INSERT INTO schema_versions (version)
            VALUES (?)
        `).run(migrationName);

        // Commit transaction
        db.exec('COMMIT');

        console.log(`Migration ${migrationName} completed successfully`);
    } catch (error) {
        // Rollback on error
        db.exec('ROLLBACK');
        console.error(`Migration ${migrationName} failed:`, error);
        throw error;
    }
}

function runMigrations() {
    try {
        // Initialize schema versions table
        initializeSchemaVersions();
        
        // Get applied and available migrations
        const appliedMigrations = getAppliedMigrations();
        const allMigrations = getAllMigrations();
        
        // Find pending migrations
        const pendingMigrations = allMigrations.filter(
            migration => !appliedMigrations.includes(migration)
        );
        
        if (pendingMigrations.length === 0) {
            console.log('No pending migrations to run');
            return;
        }
        
        console.log(`Found ${pendingMigrations.length} pending migrations`);
        
        // Run each pending migration
        for (const migration of pendingMigrations) {
            runMigration(migration);
        }
        
        console.log('All migrations completed successfully');
    } catch (error) {
        console.error('Migration process failed:', error);
        process.exit(1);
    }
}

// Run migrations
runMigrations(); 