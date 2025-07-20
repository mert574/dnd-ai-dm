import { Open5eDataStore } from '../utils/open5e/store';
import type { LoadStatus, RaceRow, ClassRow, BackgroundRow, SpellRow, MonsterRow, WeaponRow, MagicItemRow, FeatRow, SearchResult } from '../utils/open5e/store';
import { mapKeys, camelCase } from 'lodash-es';
import { parseJson } from '../utils/json';

// Types for the data we return
export interface Race {
  slug: string;
  name: string;
  description: string;
  abilityScores: Array<{ attributes: string[]; value: number }>;
  age: string;
  alignment: string;
  size: string;
  speed: Record<string, number>;
  languages: string;
  vision: string;
  traits: string;
  subraces: Array<{ name: string; slug: string; desc: string; asi: Array<{ attributes: string[]; value: number }> }>;
}

export interface Class {
  slug: string;
  name: string;
  description: string;
  hitDice: string;
  hpAt1stLevel: string;
  hpAtHigherLevels: string;
  profArmor: string;
  profWeapons: string;
  profTools: string;
  profSavingThrows: string;
  profSkills: string;
  equipment: string;
  tableData: string;
  spellcastingAbility: string;
  subtypesName: string;
  archetypes: Array<{ name: string; slug: string; desc: string }>;
}

export interface Background {
  slug: string;
  name: string;
  description: string;
  skillProficiencies: string;
  toolProficiencies: string;
  languages: string;
  equipment: string;
  feature: string;
  featureDesc: string;
  suggestedCharacteristics: string;
}

export interface Spell {
  slug: string;
  name: string;
  description: string;
  higherLevel: string;
  range: string;
  components: string;
  material: string | null;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  castingTime: string;
  level: number;
  school: string;
  classes: string;
  spellLists: string[];
}

export interface Monster {
  slug: string;
  name: string;
  description: string;
  size: string;
  type: string;
  subtype: string | null;
  alignment: string;
  armorClass: number;
  armorDesc: string;
  hitPoints: number;
  hitDice: string;
  speed: Record<string, number>;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  challengeRating: string;
  cr: number;
  actions: Array<{ name: string; desc: string; attack_bonus?: number; damage_dice?: string }>;
  specialAbilities: Array<{ name: string; desc: string }>;

}

export interface Weapon {
  slug: string;
  name: string;
  description: string;
  category: string;
  cost: string;
  damageDice: string;
  damageType: string;
  weight: string;
  properties: string[];
}

export interface MagicItem {
  slug: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  requiresAttunement: string;
}

export interface Feat {
  slug: string;
  name: string;
  description: string;
  prerequisite: string | null;
  effects: string | null;
}

class Open5eService {
  private store: Open5eDataStore;

  constructor() {
    this.store = new Open5eDataStore();
  }

  // Races
  async getRaces(): Promise<Race[]> {
    const rows = this.store.getRaces();
    return rows.map(row => this.toRace(row));
  }

  async getRaceBySlug(slug: string): Promise<Race | null> {
    const row = this.store.getRaceBySlug(slug);
    return row ? this.toRace(row) : null;
  }

  // Classes
  async getClasses(): Promise<Class[]> {
    const rows = this.store.getClasses();
    return rows.map(row => this.toClass(row));
  }

  async getClassBySlug(slug: string): Promise<Class | null> {
    const row = this.store.getClassBySlug(slug);
    return row ? this.toClass(row) : null;
  }

  // Backgrounds
  async getBackgrounds(): Promise<Background[]> {
    const rows = this.store.getBackgrounds();
    return rows.map(row => this.toBackground(row));
  }

  async getBackgroundBySlug(slug: string): Promise<Background | null> {
    const row = this.store.getBackgroundBySlug(slug);
    return row ? this.toBackground(row) : null;
  }

  // Spells
  async getSpells(options?: { level?: number; school?: string; class?: string }): Promise<Spell[]> {
    const rows = this.store.getSpells(options);
    return rows.map(row => this.toSpell(row));
  }

  async getSpellBySlug(slug: string): Promise<Spell | null> {
    const row = this.store.getSpellBySlug(slug);
    return row ? this.toSpell(row) : null;
  }

  // Monsters
  async getMonsters(options?: { cr?: number; type?: string }): Promise<Monster[]> {
    const rows = this.store.getMonsters(options);
    return rows.map(row => this.toMonster(row));
  }

  async getMonsterBySlug(slug: string): Promise<Monster | null> {
    const row = this.store.getMonsterBySlug(slug);
    return row ? this.toMonster(row) : null;
  }

  // Weapons
  async getWeapons(category?: string): Promise<Weapon[]> {
    const rows = this.store.getWeapons(category);
    return rows.map(row => this.toWeapon(row));
  }

  async getWeaponBySlug(slug: string): Promise<Weapon | null> {
    const row = this.store.getWeaponBySlug(slug);
    return row ? this.toWeapon(row) : null;
  }

  // Magic Items
  async getMagicItems(rarity?: string): Promise<MagicItem[]> {
    const rows = this.store.getMagicItems(rarity);
    return rows.map(row => this.toMagicItem(row));
  }

  async getMagicItemBySlug(slug: string): Promise<MagicItem | null> {
    const row = this.store.getMagicItemBySlug(slug);
    return row ? this.toMagicItem(row) : null;
  }

  // Feats
  async getFeats(): Promise<Feat[]> {
    const rows = this.store.getFeats();
    return rows.map(row => this.toFeat(row));
  }

  async getFeatBySlug(slug: string): Promise<Feat | null> {
    const row = this.store.getFeatBySlug(slug);
    return row ? this.toFeat(row) : null;
  }

  // Search across all data
  async search(query: string): Promise<SearchResult[]> {
    return this.store.search(query);
  }

  // Status
  async getLoadStatus(): Promise<LoadStatus[]> {
    return this.store.getAllLoadStatus();
  }


  close() {
    this.store.close();
  }

  private toRace(row: RaceRow): Race {
    const mapped = mapKeys(row, (_, key) => camelCase(key));
    return {
      ...mapped,
      abilityScores: parseJson(row.ability_scores),
      speed: parseJson(row.speed),
      subraces: parseJson(row.subraces)
    } as Race;
  }

  private toClass(row: ClassRow): Class {
    const mapped = mapKeys(row, (_, key) => camelCase(key));
    return {
      ...mapped,
      archetypes: parseJson(row.archetypes)
    } as Class;
  }

  private toBackground(row: BackgroundRow): Background {
    return mapKeys(row, (_, key) => camelCase(key)) as unknown as Background;
  }

  private toSpell(row: SpellRow): Spell {
    const mapped = mapKeys(row, (_, key) => camelCase(key));
    return {
      ...mapped,
      ritual: Boolean(row.ritual),
      concentration: Boolean(row.concentration),
      spellLists: parseJson(row.spell_lists)
    } as Spell;
  }

  private toMonster(row: MonsterRow): Monster {
    const mapped = mapKeys(row, (_, key) => camelCase(key));
    return {
      ...mapped,
      speed: parseJson(row.speed),
      actions: parseJson(row.actions),
      specialAbilities: parseJson(row.special_abilities)
    } as Monster;
  }

  private toWeapon(row: WeaponRow): Weapon {
    const mapped = mapKeys(row, (_, key) => camelCase(key));
    return {
      ...mapped,
      properties: parseJson(row.properties)
    } as Weapon;
  }

  private toMagicItem(row: MagicItemRow): MagicItem {
    return mapKeys(row, (_, key) => camelCase(key)) as unknown as MagicItem;
  }

  private toFeat(row: FeatRow): Feat {
    return mapKeys(row, (_, key) => camelCase(key)) as unknown as Feat;
  }
}

// Export singleton instance
export const open5eService = new Open5eService();