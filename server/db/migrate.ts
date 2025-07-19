import { getDatabase } from './connection';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const db = getDatabase();

function runMigration() {
    try {
        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Read and execute the migration file
        const migration = readFileSync(
            join(__dirname, 'migrations', '001_initial.sql'),
            'utf8'
        );

        // Split and run the migration
        const [upMigration] = migration.split('-- Down Migration');
        const statements = upMigration
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            db.exec(`${statement  };`);
        }

        // Record the migration
        db.exec(`
            INSERT INTO schema_versions (version)
            VALUES ('001_initial')
        `);

        // Commit transaction
        db.exec('COMMIT');

        console.log('Migration completed successfully');
    } catch (error) {
        // Rollback on error
        db.exec('ROLLBACK');
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
runMigration(); 