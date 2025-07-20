import { Open5eDataStore } from '../utils/open5e/store';
import type { LoadStatus, RaceRow, ClassRow, BackgroundRow, SpellRow, MonsterRow, WeaponRow, MagicItemRow, FeatRow, SearchResult } from '../utils/open5e/store';

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
  // ... other fields as needed
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
    return rows.map(this.mapRace);
  }

  async getRaceBySlug(slug: string): Promise<Race | null> {
    const row = this.store.getRaceBySlug(slug);
    return row ? this.mapRace(row) : null;
  }

  // Classes
  async getClasses(): Promise<Class[]> {
    const rows = this.store.getClasses();
    return rows.map(this.mapClass);
  }

  async getClassBySlug(slug: string): Promise<Class | null> {
    const row = this.store.getClassBySlug(slug);
    return row ? this.mapClass(row) : null;
  }

  // Backgrounds
  async getBackgrounds(): Promise<Background[]> {
    const rows = this.store.getBackgrounds();
    return rows.map(this.mapBackground);
  }

  async getBackgroundBySlug(slug: string): Promise<Background | null> {
    const row = this.store.getBackgroundBySlug(slug);
    return row ? this.mapBackground(row) : null;
  }

  // Spells
  async getSpells(options?: { level?: number; school?: string; class?: string }): Promise<Spell[]> {
    const rows = this.store.getSpells(options);
    return rows.map(this.mapSpell);
  }

  async getSpellBySlug(slug: string): Promise<Spell | null> {
    const row = this.store.getSpellBySlug(slug);
    return row ? this.mapSpell(row) : null;
  }

  // Monsters
  async getMonsters(options?: { cr?: number; type?: string }): Promise<Monster[]> {
    const rows = this.store.getMonsters(options);
    return rows.map(this.mapMonster);
  }

  async getMonsterBySlug(slug: string): Promise<Monster | null> {
    const row = this.store.getMonsterBySlug(slug);
    return row ? this.mapMonster(row) : null;
  }

  // Weapons
  async getWeapons(category?: string): Promise<Weapon[]> {
    const rows = this.store.getWeapons(category);
    return rows.map(this.mapWeapon);
  }

  async getWeaponBySlug(slug: string): Promise<Weapon | null> {
    const row = this.store.getWeaponBySlug(slug);
    return row ? this.mapWeapon(row) : null;
  }

  // Magic Items
  async getMagicItems(rarity?: string): Promise<MagicItem[]> {
    const rows = this.store.getMagicItems(rarity);
    return rows.map(this.mapMagicItem);
  }

  async getMagicItemBySlug(slug: string): Promise<MagicItem | null> {
    const row = this.store.getMagicItemBySlug(slug);
    return row ? this.mapMagicItem(row) : null;
  }

  // Feats
  async getFeats(): Promise<Feat[]> {
    const rows = this.store.getFeats();
    return rows.map(this.mapFeat);
  }

  async getFeatBySlug(slug: string): Promise<Feat | null> {
    const row = this.store.getFeatBySlug(slug);
    return row ? this.mapFeat(row) : null;
  }

  // Search across all data
  async search(query: string): Promise<SearchResult[]> {
    return this.store.search(query);
  }

  // Status
  async getLoadStatus(): Promise<LoadStatus[]> {
    return this.store.getAllLoadStatus();
  }

  // Mapping functions
  private mapRace(row: RaceRow): Race {
    return {
      slug: row.slug,
      name: row.name,
      description: row.description,
      abilityScores: JSON.parse(row.ability_scores || '[]'),
      age: row.age,
      alignment: row.alignment,
      size: row.size,
      speed: JSON.parse(row.speed || '{}'),
      languages: row.languages,
      vision: row.vision,
      traits: row.traits,
      subraces: JSON.parse(row.subraces || '[]')
    };
  }

  private mapClass(row: ClassRow): Class {
    return {
      slug: row.slug,
      name: row.name,
      description: row.description,
      hitDice: row.hit_dice,
      hpAt1stLevel: row.hp_at_1st_level,
      hpAtHigherLevels: row.hp_at_higher_levels,
      profArmor: row.prof_armor,
      profWeapons: row.prof_weapons,
      profTools: row.prof_tools,
      profSavingThrows: row.prof_saving_throws,
      profSkills: row.prof_skills,
      equipment: row.equipment,
      tableData: row.table_data,
      spellcastingAbility: row.spellcasting_ability,
      subtypesName: row.subtypes_name,
      archetypes: JSON.parse(row.archetypes || '[]')
    };
  }

  private mapBackground(row: BackgroundRow): Background {
    return {
      slug: row.slug,
      name: row.name,
      description: row.description,
      skillProficiencies: row.skill_proficiencies,
      toolProficiencies: row.tool_proficiencies,
      languages: row.languages,
      equipment: row.equipment,
      feature: row.feature,
      featureDesc: row.feature_desc,
      suggestedCharacteristics: row.suggested_characteristics
    };
  }

  private mapSpell(row: SpellRow): Spell {
    return {
      slug: row.slug,
      name: row.name,
      description: row.description,
      higherLevel: row.higher_level,
      range: row.range,
      components: row.components,
      material: row.material,
      ritual: Boolean(row.ritual),
      duration: row.duration,
      concentration: Boolean(row.concentration),
      castingTime: row.casting_time,
      level: row.level,
      school: row.school,
      classes: row.classes,
      spellLists: JSON.parse(row.spell_lists || '[]')
    };
  }

  private mapMonster(row: MonsterRow): Monster {
    return {
      slug: row.slug,
      name: row.name,
      description: row.description,
      size: row.size,
      type: row.type,
      subtype: row.subtype,
      alignment: row.alignment,
      armorClass: row.armor_class,
      armorDesc: row.armor_desc,
      hitPoints: row.hit_points,
      hitDice: row.hit_dice,
      speed: JSON.parse(row.speed || '{}'),
      strength: row.strength,
      dexterity: row.dexterity,
      constitution: row.constitution,
      intelligence: row.intelligence,
      wisdom: row.wisdom,
      charisma: row.charisma,
      challengeRating: row.challenge_rating,
      cr: row.cr,
      actions: JSON.parse(row.actions || '[]'),
      specialAbilities: JSON.parse(row.special_abilities || '[]')
    };
  }

  private mapWeapon(row: WeaponRow): Weapon {
    return {
      slug: row.slug,
      name: row.name,
      description: row.description,
      category: row.category,
      cost: row.cost,
      damageDice: row.damage_dice,
      damageType: row.damage_type,
      weight: row.weight,
      properties: JSON.parse(row.properties || '[]')
    };
  }

  private mapMagicItem(row: MagicItemRow): MagicItem {
    return {
      slug: row.slug,
      name: row.name,
      description: row.description,
      type: row.type,
      rarity: row.rarity,
      requiresAttunement: row.requires_attunement
    };
  }

  private mapFeat(row: FeatRow): Feat {
    return {
      slug: row.slug,
      name: row.name,
      description: row.description,
      prerequisite: row.prerequisite,
      effects: row.effects
    };
  }

  close() {
    this.store.close();
  }
}

// Export singleton instance
export const open5eService = new Open5eService();