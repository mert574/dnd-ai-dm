-- Up Migration
-- Drop old cache tables if they exist
DROP TABLE IF EXISTS open5e_cache;
DROP TABLE IF EXISTS open5e_metadata;

-- Create new Open5e data tables
CREATE TABLE open5e_races (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    -- Example: {"DEX"= 2, "WIS"= 1}
    ability_scores TEXT NOT NULL,
    age TEXT,
    alignment TEXT,
    size TEXT NOT NULL,
    -- Example: {"walk"= 30}
    speed TEXT NOT NULL,
    languages TEXT,
    vision TEXT,
    traits TEXT,
    subraces TEXT,
    document_slug TEXT,
    document_title TEXT,
    document_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE open5e_classes (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    hit_dice TEXT NOT NULL,  -- "1d10"
    hp_at_1st_level TEXT,
    hp_at_higher_levels TEXT,
    prof_armor TEXT,
    prof_weapons TEXT,
    prof_tools TEXT,
    prof_saving_throws TEXT,
    prof_skills TEXT,
    equipment TEXT,
    table_data TEXT,  -- Markdown table
    spellcasting_ability TEXT,
    subtypes_name TEXT,
    archetypes TEXT,
    document_slug TEXT,
    document_title TEXT,
    document_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE open5e_backgrounds (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    skill_proficiencies TEXT,
    tool_proficiencies TEXT,
    languages TEXT,
    equipment TEXT,
    feature TEXT,
    feature_desc TEXT,
    suggested_characteristics TEXT,
    document_slug TEXT,
    document_title TEXT,
    document_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE open5e_spells (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    higher_level TEXT,
    range TEXT NOT NULL,
    components TEXT NOT NULL,
    material TEXT,
    ritual BOOLEAN DEFAULT FALSE,
    duration TEXT NOT NULL,
    concentration BOOLEAN DEFAULT FALSE,
    casting_time TEXT NOT NULL,
    level INTEGER NOT NULL,
    school TEXT NOT NULL,
    classes TEXT,  -- Comma-separated list
    spell_lists TEXT,  -- Array of spell lists
    document_slug TEXT,
    document_title TEXT,
    document_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE open5e_monsters (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    size TEXT NOT NULL,
    type TEXT NOT NULL,
    subtype TEXT,
    alignment TEXT,
    armor_class INTEGER NOT NULL,
    armor_desc TEXT,
    hit_points INTEGER NOT NULL,
    hit_dice TEXT NOT NULL,
    -- Example: {"walk"= 30, "swim"= 20}
    speed TEXT NOT NULL,
    
    -- Ability scores
    strength INTEGER NOT NULL,
    dexterity INTEGER NOT NULL,
    constitution INTEGER NOT NULL,
    intelligence INTEGER NOT NULL,
    wisdom INTEGER NOT NULL,
    charisma INTEGER NOT NULL,
    
    -- Saving throws (nullable)
    strength_save INTEGER,
    dexterity_save INTEGER,
    constitution_save INTEGER,
    intelligence_save INTEGER,
    wisdom_save INTEGER,
    charisma_save INTEGER,
    
    -- Skills, resistances, etc.
    skills TEXT,
    damage_vulnerabilities TEXT,
    damage_resistances TEXT,
    damage_immunities TEXT,
    condition_immunities TEXT,
    senses TEXT,
    languages TEXT,
    challenge_rating TEXT NOT NULL,
    cr REAL NOT NULL,
    
    -- Actions and abilities
    actions TEXT,
    bonus_actions TEXT,
    reactions TEXT,
    legendary_desc TEXT,
    legendary_actions TEXT,
    special_abilities TEXT,
    spell_list TEXT,
    
    -- Metadata
    environments TEXT,
    document_slug TEXT,
    document_title TEXT,
    document_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE open5e_weapons (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    cost TEXT,
    damage_dice TEXT NOT NULL,
    damage_type TEXT NOT NULL,
    weight TEXT,
    properties TEXT,  -- Array of properties
    document_slug TEXT,
    document_title TEXT,
    document_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE open5e_magic_items (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    rarity TEXT NOT NULL,
    requires_attunement TEXT,
    document_slug TEXT,
    document_title TEXT,
    document_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE open5e_feats (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    prerequisite TEXT,
    effects TEXT,
    document_slug TEXT,
    document_title TEXT,
    document_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create metadata table to track what data has been loaded
CREATE TABLE open5e_load_status (
    data_type TEXT PRIMARY KEY,
    item_count INTEGER NOT NULL,
    last_loaded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version TEXT DEFAULT '1.0.0'
);

-- Create indexes for performance
CREATE INDEX idx_races_name ON open5e_races(name);
CREATE INDEX idx_classes_name ON open5e_classes(name);
CREATE INDEX idx_backgrounds_name ON open5e_backgrounds(name);
CREATE INDEX idx_spells_name ON open5e_spells(name);
CREATE INDEX idx_spells_level ON open5e_spells(level);
CREATE INDEX idx_spells_school ON open5e_spells(school);
CREATE INDEX idx_monsters_name ON open5e_monsters(name);
CREATE INDEX idx_monsters_type ON open5e_monsters(type);
CREATE INDEX idx_monsters_cr ON open5e_monsters(cr);
CREATE INDEX idx_weapons_name ON open5e_weapons(name);
CREATE INDEX idx_weapons_category ON open5e_weapons(category);
CREATE INDEX idx_magic_items_name ON open5e_magic_items(name);
CREATE INDEX idx_magic_items_rarity ON open5e_magic_items(rarity);
CREATE INDEX idx_feats_name ON open5e_feats(name);

-- Down Migration
DROP INDEX IF EXISTS idx_feats_name;
DROP INDEX IF EXISTS idx_magic_items_rarity;
DROP INDEX IF EXISTS idx_magic_items_name;
DROP INDEX IF EXISTS idx_weapons_category;
DROP INDEX IF EXISTS idx_weapons_name;
DROP INDEX IF EXISTS idx_monsters_cr;
DROP INDEX IF EXISTS idx_monsters_type;
DROP INDEX IF EXISTS idx_monsters_name;
DROP INDEX IF EXISTS idx_spells_school;
DROP INDEX IF EXISTS idx_spells_level;
DROP INDEX IF EXISTS idx_spells_name;
DROP INDEX IF EXISTS idx_backgrounds_name;
DROP INDEX IF EXISTS idx_classes_name;
DROP INDEX IF EXISTS idx_races_name;

DROP TABLE IF EXISTS open5e_load_status;
DROP TABLE IF EXISTS open5e_feats;
DROP TABLE IF EXISTS open5e_magic_items;
DROP TABLE IF EXISTS open5e_weapons;
DROP TABLE IF EXISTS open5e_monsters;
DROP TABLE IF EXISTS open5e_spells;
DROP TABLE IF EXISTS open5e_backgrounds;
DROP TABLE IF EXISTS open5e_classes;
DROP TABLE IF EXISTS open5e_races;