-- Up Migration
CREATE TABLE schema_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id TEXT PRIMARY KEY,  -- For session codes like "DRAGON42"
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed')),
    game_state JSON,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,

    -- Basic Info
    class TEXT NOT NULL,
    race TEXT NOT NULL,
    background TEXT,
    alignment TEXT,
    level INTEGER DEFAULT 1 CHECK (level BETWEEN 1 AND 20),
    experience INTEGER DEFAULT 0 CHECK (experience >= 0),

    -- Core Stats (Base ability scores, 3-18 initially)
    strength INTEGER NOT NULL CHECK (strength BETWEEN 1 AND 30),
    dexterity INTEGER NOT NULL CHECK (dexterity BETWEEN 1 AND 30),
    constitution INTEGER NOT NULL CHECK (constitution BETWEEN 1 AND 30),
    intelligence INTEGER NOT NULL CHECK (intelligence BETWEEN 1 AND 30),
    wisdom INTEGER NOT NULL CHECK (wisdom BETWEEN 1 AND 30),
    charisma INTEGER NOT NULL CHECK (charisma BETWEEN 1 AND 30),

    -- Health System
    max_hp INTEGER NOT NULL CHECK (max_hp > 0),
    current_hp INTEGER CHECK (current_hp <= max_hp),
    temporary_hp INTEGER DEFAULT 0 CHECK (temporary_hp >= 0),

    -- Combat Stats
    armor_class INTEGER NOT NULL CHECK (armor_class >= 0),
    initiative INTEGER,
    speed INTEGER CHECK (speed >= 0),
    hit_dice TEXT NOT NULL,

    -- Proficiencies & Features
    proficiency_bonus INTEGER CHECK (proficiency_bonus >= 0),
    saving_throws JSON,
    skill_proficiencies JSON,
    languages JSON,
    features JSON,

    -- Equipment & Resources
    armor JSON,
    weapons JSON,
    inventory JSON,
    gold INTEGER DEFAULT 0 CHECK (gold >= 0),  -- Gold pieces (gp)

    -- Magic System
    spellcasting_ability TEXT CHECK (spellcasting_ability IN ('STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA')),
    spell_slots JSON,
    spells_known JSON,
    prepared_spells JSON,

    -- Personality
    personality_traits TEXT,
    ideals TEXT,
    bonds TEXT,
    flaws TEXT,

    -- Metadata
    user_id TEXT NOT NULL,
    session_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('chat', 'action', 'system')),
    session_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Indexes
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_characters_user ON characters(user_id);
CREATE INDEX idx_characters_session ON characters(session_id);
CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_characters_level ON characters(level);
CREATE INDEX idx_characters_class ON characters(class);
CREATE INDEX idx_characters_race ON characters(race);
CREATE INDEX idx_characters_active ON characters(is_active);

-- Down Migration
DROP INDEX IF EXISTS idx_characters_active;
DROP INDEX IF EXISTS idx_characters_race;
DROP INDEX IF EXISTS idx_characters_class;
DROP INDEX IF EXISTS idx_characters_level;
DROP INDEX IF EXISTS idx_messages_session;
DROP INDEX IF EXISTS idx_characters_session;
DROP INDEX IF EXISTS idx_characters_user;
DROP INDEX IF EXISTS idx_sessions_user;

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS characters;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS schema_versions; 