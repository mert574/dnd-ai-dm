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

function runMigration(migrationName: string, direction: 'up' | 'down' = 'up') {
    try {
        console.log(`${direction === 'up' ? 'Applying' : 'Rolling back'} migration: ${migrationName}`);
        
        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Read and execute the migration file
        const migrationPath = join(__dirname, 'migrations', `${migrationName}.sql`);
        const migration = readFileSync(migrationPath, 'utf8');

        // Split the migration into up and down parts
        const parts = migration.split('-- Down Migration');
        const upMigration = parts[0];
        const downMigration = parts[1];
        

        if (direction === 'up' && !upMigration) {
            throw new Error(`Invalid migration file: missing up migration section in ${migrationName}`);
        }
        if (direction === 'down' && !downMigration) {
            throw new Error(`Invalid migration file: missing down migration section in ${migrationName}`);
        }
        
        const migrationContent = direction === 'up' ? upMigration : downMigration;
        if (!migrationContent) {
            throw new Error(`Migration content is empty for ${direction} migration in ${migrationName}`);
        }
        const rawStatements = migrationContent.split(';');
        const trimmedStatements = rawStatements.map(s => s.trim());
        
        const statements = [];
        for (const s of trimmedStatements) {
            if (s.length === 0) continue;
            
            // Split by newlines to check if there's SQL after comments
            const lines = s.split('\n').filter(line => line.trim().length > 0);
            
            // Check if any line doesn't start with -- (i.e., contains actual SQL)
            const hasSQL = lines.some(line => !line.trim().startsWith('--'));
            
            if (hasSQL) {
                // Remove comment lines from the beginning
                const sqlLines = [];
                let foundSQL = false;
                for (const line of lines) {
                    if (!line.trim().startsWith('--') || foundSQL) {
                        sqlLines.push(line);
                        foundSQL = true;
                    }
                }
                statements.push(sqlLines.join('\n'));
            }
        }
        console.log(`Found ${statements.length} statements to execute`);
        
        for (const statement of statements) {
            if (statement.trim()) {
                db.exec(`${statement};`);
            }
        }

        // Record or remove the migration
        if (direction === 'up') {
            db.prepare(`
                INSERT INTO schema_versions (version)
                VALUES (?)
            `).run(migrationName);
        } else {
            db.prepare(`
                DELETE FROM schema_versions WHERE version = ?
            `).run(migrationName);
        }

        // Commit transaction
        db.exec('COMMIT');

        console.log(`Migration ${migrationName} ${direction === 'up' ? 'completed' : 'rolled back'} successfully`);
    } catch (error) {
        // Rollback on error
        db.exec('ROLLBACK');
        console.error(`Migration ${migrationName} ${direction} failed:`, error);
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
            runMigration(migration, 'up');
        }
        
        console.log('All migrations completed successfully');
    } catch (error) {
        console.error('Migration process failed:', error);
        process.exit(1);
    }
}

function rollbackMigration(migrationName?: string) {
    try {
        // Initialize schema versions table if needed
        initializeSchemaVersions();
        
        // Get applied migrations
        const appliedMigrations = getAppliedMigrations();
        
        if (appliedMigrations.length === 0) {
            console.log('No migrations to rollback');
            return;
        }
        
        if (migrationName) {
            // Rollback specific migration
            if (!appliedMigrations.includes(migrationName)) {
                console.error(`Migration ${migrationName} is not applied`);
                process.exit(1);
            }
            runMigration(migrationName, 'down');
        } else {
            // Rollback last applied migration
            const lastMigration = appliedMigrations[appliedMigrations.length - 1];
            if (!lastMigration) {
                console.error('No migrations to rollback');
                process.exit(1);
            }
            console.log(`Rolling back last migration: ${lastMigration}`);
            runMigration(lastMigration, 'down');
        }
        
        console.log('Rollback completed successfully');
    } catch (error) {
        console.error('Rollback process failed:', error);
        process.exit(1);
    }
}

function rollbackAllMigrations() {
    try {
        // Initialize schema versions table if needed
        initializeSchemaVersions();
        
        // Get applied migrations in reverse order
        const appliedMigrations = getAppliedMigrations().reverse();
        
        if (appliedMigrations.length === 0) {
            console.log('No migrations to rollback');
            return;
        }
        
        console.log(`Rolling back ${appliedMigrations.length} migrations`);
        
        // Rollback each migration
        for (const migration of appliedMigrations) {
            runMigration(migration, 'down');
        }
        
        console.log('All migrations rolled back successfully');
    } catch (error) {
        console.error('Rollback all process failed:', error);
        process.exit(1);
    }
}

// Parse command line arguments
const command = process.argv[2];
const migrationName = process.argv[3];

switch (command) {
    case 'up':
        runMigrations();
        break;
    case 'down':
        rollbackMigration(migrationName);
        break;
    case 'down:all':
        rollbackAllMigrations();
        break;
    default:
        // Default to running migrations up
        runMigrations();
} 