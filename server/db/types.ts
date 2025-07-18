// Basic types
export type Timestamp = string;
export type JSON = any; // We'll refine this for specific use cases

// Enums
export enum SessionStatus {
    Active = 'active',
    Paused = 'paused',
    Completed = 'completed'
}

export enum MessageType {
    Chat = 'chat',
    Action = 'action',
    System = 'system'
}

export enum SpellcastingAbility {
    STR = 'STR',
    DEX = 'DEX',
    CON = 'CON',
    INT = 'INT',
    WIS = 'WIS',
    CHA = 'CHA'
}

// Complex JSON types
export interface Currency {
    pp: number; // Platinum
    gp: number; // Gold
    ep: number; // Electrum
    sp: number; // Silver
    cp: number; // Copper
}

export interface CharacterStats {
    baseValue: number;
    modifier: number;
    savingThrow: {
        proficient: boolean;
        bonus: number;
    };
}

export interface Equipment {
    name: string;
    description: string;
    quantity: number;
    weight: number;
    value: number;  // In gold pieces (gp)
}

export interface Weapon extends Equipment {
    damage: string;
    damageType: string;
    properties: string[];
}

export interface Armor extends Equipment {
    armorClass: number;
    type: 'light' | 'medium' | 'heavy' | 'shield';
    stealthDisadvantage: boolean;
}

export interface SpellSlots {
    [level: number]: {
        total: number;
        used: number;
    };
}

// Main table interfaces
export interface User {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface Session {
    id: string;
    name: string;
    status: SessionStatus;
    game_state: JSON;
    user_id: number;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface Character {
    id: number;
    name: string;

    // Basic Info
    class: string;
    race: string;
    background?: string;
    alignment?: string;
    level: number;
    experience: number;

    // Core Stats
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;

    // Health
    max_hp: number;
    current_hp: number;
    temporary_hp: number;

    // Combat
    armor_class: number;
    initiative: number;
    speed: number;
    hit_dice: string;

    // Proficiencies & Features
    proficiency_bonus: number;
    saving_throws: CharacterStats[];
    skill_proficiencies: { [skill: string]: boolean };
    languages: string[];
    features: { [name: string]: string };

    // Equipment
    armor: Armor[];
    weapons: Weapon[];
    inventory: Equipment[];
    gold: number;  // Gold pieces (gp)

    // Magic
    spellcasting_ability?: SpellcastingAbility;
    spell_slots?: SpellSlots;
    spells_known?: string[];
    prepared_spells?: string[];

    // Personality
    personality_traits?: string;
    ideals?: string;
    bonds?: string;
    flaws?: string;

    // Metadata
    user_id: number;
    session_id?: string;
    is_active: boolean;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface Message {
    id: number;
    content: string;
    type: MessageType;
    session_id: string;
    created_at: Timestamp;
} 