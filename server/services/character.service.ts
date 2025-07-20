import { CharacterDataStore, type CharacterRow, type CreateCharacterParams, type UpdateCharacterHpParams, type JoinCampaignParams } from '../datastores/character.datastore';
import type { Character } from '../db/types';
import { mapKeys, camelCase } from 'lodash-es';
import { parseJson } from '../utils/json';

export interface CreateCharacterData {
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

export interface UpdateCharacterHpData {
  characterId: number;
  currentHp: number;
  temporaryHp: number;
}

export interface JoinCampaignData {
  campaignId: string;
  characterId: number;
  userId: string;
}

export class CharacterService {
  private dataStore: CharacterDataStore;

  constructor() {
    this.dataStore = new CharacterDataStore();
  }

  async create(data: CreateCharacterData): Promise<Character> {
    const params: CreateCharacterParams = {
      name: data.name,
      class: data.class,
      race: data.race,
      level: data.level,
      strength: data.strength,
      dexterity: data.dexterity,
      constitution: data.constitution,
      intelligence: data.intelligence,
      wisdom: data.wisdom,
      charisma: data.charisma,
      maxHp: data.maxHp,
      armorClass: data.armorClass,
      hitDice: data.hitDice,
      userId: data.userId
    };

    const row = this.dataStore.create(params);
    return this.toCharacter(row);
  }

  async getById(id: number): Promise<Character | null> {
    const row = this.dataStore.getById(id);
    return row ? this.toCharacter(row) : null;
  }

  async getByUserId(userId: string): Promise<Character[]> {
    const rows = this.dataStore.getByUserId(userId);
    return rows.map(row => this.toCharacter(row));
  }

  async getByCampaignId(campaignId: string): Promise<Character[]> {
    const rows = this.dataStore.getByCampaignId(campaignId);
    return rows.map(row => this.toCharacter(row));
  }

  async updateHp(data: UpdateCharacterHpData): Promise<Character | null> {
    const params: UpdateCharacterHpParams = {
      characterId: data.characterId,
      currentHp: data.currentHp,
      temporaryHp: data.temporaryHp
    };

    const row = this.dataStore.updateHp(params);
    return row ? this.toCharacter(row) : null;
  }

  async joinToCampaign(data: JoinCampaignData): Promise<Character | null> {
    const params: JoinCampaignParams = {
      campaignId: data.campaignId,
      characterId: data.characterId,
      userId: data.userId
    };

    const row = this.dataStore.joinToCampaign(params);
    return row ? this.toCharacter(row) : null;
  }

  async removeFromCampaign(characterId: number, userId: string): Promise<Character | null> {
    const row = this.dataStore.removeFromCampaign(characterId, userId);
    return row ? this.toCharacter(row) : null;
  }

  async deleteById(characterId: number, userId: string): Promise<boolean> {
    return this.dataStore.deleteById(characterId, userId);
  }

  private toCharacter(row: CharacterRow): Character {
    const mapped = mapKeys(row, (_, key) => camelCase(key));
    return {
      ...mapped,
      savingThrows: parseJson(row.saving_throws),
      skillProficiencies: parseJson(row.skill_proficiencies),
      languages: parseJson(row.languages),
      features: parseJson(row.features),
      armor: parseJson(row.armor),
      weapons: parseJson(row.weapons),
      inventory: parseJson(row.inventory),
      spellSlots: parseJson(row.spell_slots),
      spellsKnown: parseJson(row.spells_known),
      preparedSpells: parseJson(row.prepared_spells)
    } as Character;
  }
}

export const characterService = new CharacterService();