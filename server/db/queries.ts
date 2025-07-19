import { getDatabase } from './connection';

const db = getDatabase();

export const queries = {
    // User queries
    createUser: db.prepare(`
        INSERT INTO users (name, email, password_hash)
        VALUES (@name, @email, @password_hash)
        RETURNING *
    `),

    getUserById: db.prepare(`
        SELECT * FROM users WHERE id = ?
    `),

    getUserByEmail: db.prepare(`
        SELECT * FROM users WHERE email = ?
    `),

    // Campaign queries
    createCampaign: db.prepare(`
        INSERT INTO campaigns (id, name, status, user_id)
        VALUES (@campaignCode, @name, @status, @userId)
        RETURNING *
    `),

    getCampaignById: db.prepare(`
        SELECT c.*, u.name as dm_name
        FROM campaigns c
        JOIN users u ON u.id = c.user_id
        WHERE c.id = ?
    `),

    updateCampaignStatus: db.prepare(`
        UPDATE campaigns
        SET status = @status, updated_at = CURRENT_TIMESTAMP
        WHERE id = @campaignId
        RETURNING *
    `),

    // Character queries
    createCharacter: db.prepare(`
        INSERT INTO characters (
            name, class, race, level,
            strength, dexterity, constitution,
            intelligence, wisdom, charisma,
            max_hp, current_hp, armor_class,
            hit_dice, user_id
        ) VALUES (
            @name, @class, @race, @level,
            @strength, @dexterity, @constitution,
            @intelligence, @wisdom, @charisma,
            @maxHp, @maxHp, @armorClass,
            @hitDice, @userId
        )
        RETURNING *
    `),

    getCharacterById: db.prepare(`
        SELECT * FROM characters WHERE id = ?
    `),

    getCharactersInCampaign: db.prepare(`
        SELECT c.*, u.name as owner_name
        FROM characters c
        JOIN users u ON u.id = c.user_id
        WHERE c.campaign_id = ?
    `),

    updateCharacterHp: db.prepare(`
        UPDATE characters
        SET current_hp = @currentHp,
            temporary_hp = @temporaryHp,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @characterId
        RETURNING *
    `),

    // Message queries
    createMessage: db.prepare(`
        INSERT INTO messages (content, type, campaign_id)
        VALUES (@content, @type, @campaignId)
        RETURNING *
    `),

    getCampaignMessages: db.prepare(`
        SELECT * FROM messages
        WHERE campaign_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    `),

    // Helper function to generate campaign codes
    generateCampaignCode: () => {
        const adjectives = ['BRAVE', 'DARK', 'MYSTIC', 'WILD', 'EPIC', 'MIGHTY'];
        const nouns = ['DRAGON', 'QUEST', 'SWORD', 'SPELL', 'REALM', 'TALE'];
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        
        return `${adj}_${noun}${num}`;
    }
};

// Type-safe transaction helper
export function transaction<T>(callback: (q: typeof queries) => T): T {
    const transaction = db.transaction(callback);
    return transaction(queries);
} 