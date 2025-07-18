# Database Setup PRD

## Overview
Set up a SQLite database using better-sqlite3 for the D&D AI DM project. Direct SQL queries will be used for maximum control and transparency.

## Requirements

### Core Features
1. **Database Setup**
   - SQLite for local development
   - better-sqlite3 integration
   - Database connection handling
   - Environment configuration

2. **Schema Design**
   - User management
   - Game sessions
   - Characters
   - Game state
   - Messages

3. **Migrations**
   - SQL-based migrations
   - Version tracking table
   - Simple up/down scripts
   - Initial seed data

4. **Database Operations**
   - Prepared statements
   - Transaction support
   - Error handling
   - Input validation

## Implementation

### Tech Stack
- **Database**: SQLite
- **Driver**: better-sqlite3
- **Framework**: Nuxt 3
- **Types**: TypeScript

### Schema Design
```sql
-- Schema version tracking
CREATE TABLE schema_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game Sessions
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,  -- For session codes like "DRAGON42"
    name TEXT NOT NULL,
    status TEXT NOT NULL, -- active, paused, completed
    game_state JSON,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Characters
CREATE TABLE characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,

    -- Basic Info
    class TEXT NOT NULL,      -- Primary class (e.g., Fighter, Wizard)
    race TEXT NOT NULL,       -- Character race (e.g., Human, Elf)
    background TEXT,          -- Character background (e.g., Soldier, Sage)
    alignment TEXT,           -- Moral compass (e.g., Lawful Good, Chaotic Neutral)
    level INTEGER DEFAULT 1,  -- Current character level
    experience INTEGER DEFAULT 0, -- Total XP earned

    -- Core Stats (Base ability scores, 3-18 initially)
    strength INTEGER NOT NULL,     -- Physical power, melee attacks
    dexterity INTEGER NOT NULL,    -- Agility, ranged attacks, initiative
    constitution INTEGER NOT NULL,  -- Health, stamina, HP bonus
    intelligence INTEGER NOT NULL,  -- Knowledge, memory, wizard spells
    wisdom INTEGER NOT NULL,       -- Insight, perception, cleric spells
    charisma INTEGER NOT NULL,     -- Personality, leadership, social skills

    -- Health System
    max_hp INTEGER NOT NULL,       -- Maximum hit points (base + constitution bonus + class dice)
    current_hp INTEGER,            -- Current hit points (reduces with damage, increases with healing)
    temporary_hp INTEGER DEFAULT 0, -- Temporary buffer HP from spells/abilities (doesn't stack, disappears after rest)

    -- Combat Stats
    armor_class INTEGER NOT NULL,  -- How hard to hit (base 10 + armor + dexterity)
    initiative INTEGER,            -- Combat turn order bonus (usually dexterity modifier)
    speed INTEGER,                 -- Movement speed in feet (usually from race)
    hit_dice TEXT NOT NULL,        -- Recoverable HP dice (e.g., "1d8" for clerics)

    -- Proficiencies & Features
    proficiency_bonus INTEGER,     -- Added to rolls you're proficient in (based on level)
    saving_throws JSON,            -- Which ability saves you're good at (from class)
    skill_proficiencies JSON,      -- Which skills you're trained in
    languages JSON,                -- Languages you can speak/read
    features JSON,                 -- Special abilities from class/race/background

    -- Equipment & Resources
    armor JSON,                    -- Equipped armor and shields
    weapons JSON,                  -- Equipped weapons and attack stats
    inventory JSON,                -- Backpack contents and equipment
    currency JSON,                 -- Money by type (pp, gp, ep, sp, cp)

    -- Magic System
    spellcasting_ability TEXT,     -- Which stat powers your spells (INT/WIS/CHA)
    spell_slots JSON,              -- Available/max spell slots per spell level
    spells_known JSON,             -- All spells you know how to cast
    prepared_spells JSON,          -- Spells you've prepared for the day

    -- Personality (from background)
    personality_traits TEXT,        -- Behavioral characteristics
    ideals TEXT,                   -- Core beliefs and motivations
    bonds TEXT,                    -- Connections to people/places
    flaws TEXT,                    -- Character weaknesses

    -- Metadata
    user_id INTEGER NOT NULL,
    session_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Messages
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    type TEXT NOT NULL, -- chat, action, system
    session_id TEXT NOT NULL,  -- Updated to match sessions.id type
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_characters_user ON characters(user_id);
CREATE INDEX idx_characters_session ON characters(session_id);
CREATE INDEX idx_messages_session ON messages(session_id);

-- Additional indexes for character queries
CREATE INDEX idx_characters_level ON characters(level);
CREATE INDEX idx_characters_class ON characters(class);
CREATE INDEX idx_characters_race ON characters(race);
CREATE INDEX idx_characters_active ON characters(is_active);
```

### Directory Structure
```
server/
├── db/
│   ├── migrations/
│   │   ├── 001_initial.sql
│   │   └── 002_indexes.sql
│   ├── connection.ts    # Database connection
│   ├── queries.ts      # SQL queries
│   └── types.ts        # TypeScript types
└── api/
    └── [...].ts        # API routes
```

### Implementation Steps
1. **Initial Setup**
   ```bash
   npm install better-sqlite3
   npm install @types/better-sqlite3 --save-dev
   ```

2. **Database Connection**
   ```typescript
   // connection.ts
   import Database from 'better-sqlite3';
   
   export function createConnection() {
     const db = new Database('game.db');
     db.pragma('journal_mode = WAL');
     db.pragma('foreign_keys = ON');
     return db;
   }
   ```

3. **Example Queries**
   ```typescript
   // queries.ts
   export const queries = {
     createUser: db.prepare(`
       INSERT INTO users (name, email)
       VALUES (@name, @email)
     `),
     
     getUserById: db.prepare(`
       SELECT * FROM users WHERE id = ?
     `),
     
     createSession: db.prepare(`
       INSERT INTO sessions (id, name, status, user_id)
       VALUES (@sessionCode, @name, @status, @userId)
     `),

     getCharactersInSession: db.prepare(`
       SELECT c.*, u.name as owner_name 
       FROM characters c
       JOIN users u ON u.id = c.user_id
       WHERE c.session_id = ?
     `),

     // Helper function to generate session codes
     generateSessionCode: () => {
       const adjectives = ['BRAVE', 'DARK', 'MYSTIC', 'WILD'];
       const nouns = ['DRAGON', 'QUEST', 'SWORD', 'SPELL'];
       const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
       const noun = nouns[Math.floor(Math.random() * nouns.length)];
       const num = Math.floor(Math.random() * 100);
       return `${adj}_${noun}${num}`;
     }
   };
   ```

## Testing Strategy
1. **Schema Testing**
   - Table creation
   - Foreign key constraints
   - Index effectiveness

2. **Query Testing**
   - CRUD operations
   - Complex joins
   - Transaction rollbacks
   - Error handling

3. **Performance Testing**
   - Query execution time
   - Index usage
   - Connection pooling

## Success Metrics
- All tables created successfully
- Indexes properly utilized
- Query performance < 50ms
- Successful transaction handling
- Type safety maintained

## Dependencies
- better-sqlite3
- TypeScript types

## Timeline (1 day)
- **Hour 1-2**: Database and schema setup
- **Hour 3-4**: Migration system
- **Hour 5-6**: Query implementation
- **Hour 7-8**: Testing and documentation

## Risks & Mitigations
1. **Data Integrity**
   - Use transactions for multi-table operations
   - Implement proper foreign key constraints
   - Regular backups

2. **Performance**
   - Efficient indexing
   - Prepared statements
   - Query optimization

3. **Type Safety**
   - Custom type definitions
   - Runtime validation
   - Error handling

---

This PRD will be updated as we implement and gather feedback.