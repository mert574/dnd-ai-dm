import { getDatabase } from '../db/connection';
import type { SpellcastingAbility } from '../db/types';

export interface CharacterRow {
  id: number;
  name: string;
  class: string;
  race: string;
  background?: string;
  alignment?: string;
  level: number;
  experience: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  max_hp: number;
  current_hp: number;
  temporary_hp: number;
  armor_class: number;
  initiative: number;
  speed: number;
  hit_dice: string;
  proficiency_bonus: number;
  saving_throws: string | null;
  skill_proficiencies: string | null;
  languages: string | null;
  features: string | null;
  armor: string | null;
  weapons: string | null;
  inventory: string | null;
  gold: number;
  spellcasting_ability?: SpellcastingAbility;
  spell_slots: string | null;
  spells_known: string | null;
  prepared_spells: string | null;
  personality_traits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  user_id: string;
  campaign_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner_name?: string;
}

export interface CreateCharacterParams {
  name: string;
  class: string;
  race: string;
  level: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  maxHp: number;
  armorClass: number;
  hitDice: string;
  userId: string;
}

export interface UpdateCharacterHpParams {
  characterId: number;
  currentHp: number;
  temporaryHp: number;
}

export interface JoinCampaignParams {
  campaignId: string;
  characterId: number;
  userId: string;
}

export class CharacterDataStore {
  private db = getDatabase();

  private createCharacterStmt = this.db.prepare(`
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
  `);

  private getCharacterByIdStmt = this.db.prepare(`
    SELECT * FROM characters WHERE id = ?
  `);

  private getCharactersByUserStmt = this.db.prepare(`
    SELECT * FROM characters 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `);

  private getCharactersInCampaignStmt = this.db.prepare(`
    SELECT c.*, u.name as owner_name
    FROM characters c
    JOIN user u ON u.id = c.user_id
    WHERE c.campaign_id = ?
  `);

  private updateCharacterHpStmt = this.db.prepare(`
    UPDATE characters
    SET current_hp = @currentHp,
        temporary_hp = @temporaryHp,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = @characterId
    RETURNING *
  `);

  private joinCharacterToCampaignStmt = this.db.prepare(`
    UPDATE characters
    SET campaign_id = @campaignId, updated_at = CURRENT_TIMESTAMP
    WHERE id = @characterId AND user_id = @userId
    RETURNING *
  `);

  private removeCharacterFromCampaignStmt = this.db.prepare(`
    UPDATE characters
    SET campaign_id = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
    RETURNING *
  `);

  private deleteCharacterStmt = this.db.prepare(`
    DELETE FROM characters
    WHERE id = ? AND user_id = ?
  `);

  create(params: CreateCharacterParams): CharacterRow {
    return this.createCharacterStmt.get(params) as CharacterRow;
  }

  getById(id: number): CharacterRow | undefined {
    return this.getCharacterByIdStmt.get(id) as CharacterRow | undefined;
  }

  getByUserId(userId: string): CharacterRow[] {
    return this.getCharactersByUserStmt.all(userId) as CharacterRow[];
  }

  getByCampaignId(campaignId: string): CharacterRow[] {
    return this.getCharactersInCampaignStmt.all(campaignId) as CharacterRow[];
  }

  updateHp(params: UpdateCharacterHpParams): CharacterRow | undefined {
    return this.updateCharacterHpStmt.get(params) as CharacterRow | undefined;
  }

  joinToCampaign(params: JoinCampaignParams): CharacterRow | undefined {
    return this.joinCharacterToCampaignStmt.get(params) as CharacterRow | undefined;
  }

  removeFromCampaign(characterId: number, userId: string): CharacterRow | undefined {
    return this.removeCharacterFromCampaignStmt.get(characterId, userId) as CharacterRow | undefined;
  }

  deleteById(characterId: number, userId: string): boolean {
    const result = this.deleteCharacterStmt.run(characterId, userId);
    return result.changes > 0;
  }
}