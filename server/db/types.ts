// Basic types
export type Timestamp = string;

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

// Game state types
export interface GameState {
    currentTurn?: number;
    initiative?: InitiativeEntry[];
    combatActive?: boolean;
    conditions?: CharacterCondition[];
    notes?: string[];
    customData?: Record<string, unknown>;
}

export interface InitiativeEntry {
    characterId: number;
    name: string;
    initiative: number;
    isNPC?: boolean;
}

export interface CharacterCondition {
    characterId: number;
    condition: string;
    duration?: number;
    description?: string;
}

// Complex JSON types
export interface Currency {
    pp: number; // Platinum
    gp: number; // Gold
    ep: number; // Electrum
    sp: number; // Silver
    cp: number; // Copper
}

export interface SavingThrow {
    ability: keyof AbilityScores;
    proficient: boolean;
    bonus?: number;
}

export interface AbilityScores {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
}

export interface Skill {
    name: string;
    ability: keyof AbilityScores;
    proficient: boolean;
    expertise?: boolean;
}

export interface Feature {
    name: string;
    description: string;
    source?: string;
    level?: number;
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
    game_state: GameState | null;
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
    saving_throws: SavingThrow[] | null;
    skill_proficiencies: Skill[] | null;
    languages: string[] | null;
    features: Feature[] | null;

    // Equipment
    armor: Armor[] | null;
    weapons: Weapon[] | null;
    inventory: Equipment[] | null;
    gold: number;  // Gold pieces (gp)

    // Magic
    spellcasting_ability?: SpellcastingAbility;
    spell_slots: SpellSlots | null;
    spells_known: string[] | null;
    prepared_spells: string[] | null;

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