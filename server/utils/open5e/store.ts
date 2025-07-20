import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Open5e API response types
export interface Open5eRace {
  slug: string;
  name: string;
  desc: string;
  asi: Record<string, unknown>;
  age: string;
  alignment: string;
  size: string;
  speed: Record<string, unknown>;
  languages: string;
  vision: string;
  traits: string;
  subraces: unknown[];
  document__slug: string;
  document__title: string;
  document__url: string;
}

export interface Open5eClass {
  slug: string;
  name: string;
  desc: string;
  hit_dice: string;
  hp_at_1st_level: string;
  hp_at_higher_levels: string;
  prof_armor: string;
  prof_weapons: string;
  prof_tools: string;
  prof_saving_throws: string;
  prof_skills: string;
  equipment: string;
  table: string;
  spellcasting_ability: string;
  subtypes_name: string;
  archetypes: unknown[];
  document__slug: string;
  document__title: string;
  document__url: string;
}

export interface Open5eSpell {
  slug: string;
  name: string;
  desc: string;
  higher_level: string;
  range: string;
  components: string;
  material?: string;
  can_be_cast_as_ritual: boolean;
  duration: string;
  requires_concentration: boolean;
  casting_time: string;
  level_int: number;
  school: string;
  dnd_class: string;
  spell_lists: unknown[];
  document__slug: string;
  document__title: string;
  document__url: string;
}

export interface Open5eMonster {
  slug: string;
  name: string;
  desc: string;
  size: string;
  type: string;
  subtype: string;
  alignment: string;
  armor_class: number;
  armor_desc: string;
  hit_points: number;
  hit_dice: string;
  speed: Record<string, unknown>;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  strength_save: number;
  dexterity_save: number;
  constitution_save: number;
  intelligence_save: number;
  wisdom_save: number;
  charisma_save: number;
  skills: Record<string, unknown>;
  damage_vulnerabilities: string;
  damage_resistances: string;
  damage_immunities: string;
  condition_immunities: string;
  senses: string;
  languages: string;
  challenge_rating: string;
  cr: number;
  actions: unknown[];
  bonus_actions: unknown[];
  reactions: unknown[];
  legendary_desc: string;
  legendary_actions: unknown[];
  special_abilities: unknown[];
  spell_list: unknown[];
  environments: unknown[];
  document__slug: string;
  document__title: string;
  document__url: string;
}

export interface Open5eWeapon {
  slug: string;
  name: string;
  desc: string;
  category: string;
  cost: string;
  damage_dice: string;
  damage_type: string;
  weight: string;
  properties: unknown[];
  document__slug: string;
  document__title: string;
  document__url: string;
}

export interface Open5eMagicItem {
  slug: string;
  name: string;
  desc: string;
  type: string;
  rarity: string;
  requires_attunement: string;
  document__slug: string;
  document__title: string;
  document__url: string;
}

export interface Open5eBackground {
  slug: string;
  name: string;
  desc: string;
  skill_proficiencies: string;
  tool_proficiencies: string;
  languages: string;
  equipment: string;
  feature: string;
  feature_desc: string;
  suggested_characteristics: string;
  document__slug: string;
  document__title: string;
  document__url: string;
}

export interface Open5eFeat {
  slug: string;
  name: string;
  desc: string;
  prerequisite: string;
  effects: string;
  document__slug: string;
  document__title: string;
  document__url: string;
}

export interface LoadStatus {
  data_type: string;
  item_count: number;
  last_loaded: string;
  version: string;
}

// Database row types
export interface RaceRow {
  slug: string;
  name: string;
  description: string;
  ability_scores: string;
  age: string;
  alignment: string;
  size: string;
  speed: string;
  languages: string;
  vision: string;
  traits: string;
  subraces: string;
  document_slug: string;
  document_title: string;
  document_url: string;
}

export interface ClassRow {
  slug: string;
  name: string;
  description: string;
  hit_dice: string;
  hp_at_1st_level: string;
  hp_at_higher_levels: string;
  prof_armor: string;
  prof_weapons: string;
  prof_tools: string;
  prof_saving_throws: string;
  prof_skills: string;
  equipment: string;
  table_data: string;
  spellcasting_ability: string;
  subtypes_name: string;
  archetypes: string;
  document_slug: string;
  document_title: string;
  document_url: string;
}

export interface BackgroundRow {
  slug: string;
  name: string;
  description: string;
  skill_proficiencies: string;
  tool_proficiencies: string;
  languages: string;
  equipment: string;
  feature: string;
  feature_desc: string;
  suggested_characteristics: string;
  document_slug: string;
  document_title: string;
  document_url: string;
}

export interface SpellRow {
  slug: string;
  name: string;
  description: string;
  higher_level: string;
  range: string;
  components: string;
  material: string | null;
  ritual: number;
  duration: string;
  concentration: number;
  casting_time: string;
  level: number;
  school: string;
  classes: string;
  spell_lists: string;
  document_slug: string;
  document_title: string;
  document_url: string;
}

export interface MonsterRow {
  slug: string;
  name: string;
  description: string;
  size: string;
  type: string;
  subtype: string | null;
  alignment: string;
  armor_class: number;
  armor_desc: string;
  hit_points: number;
  hit_dice: string;
  speed: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  strength_save: number | null;
  dexterity_save: number | null;
  constitution_save: number | null;
  intelligence_save: number | null;
  wisdom_save: number | null;
  charisma_save: number | null;
  skills: string;
  damage_vulnerabilities: string;
  damage_resistances: string;
  damage_immunities: string;
  condition_immunities: string;
  senses: string;
  languages: string;
  challenge_rating: string;
  cr: number;
  actions: string;
  bonus_actions: string;
  reactions: string;
  legendary_desc: string;
  legendary_actions: string;
  special_abilities: string;
  spell_list: string;
  environments: string;
  document_slug: string;
  document_title: string;
  document_url: string;
}

export interface WeaponRow {
  slug: string;
  name: string;
  description: string;
  category: string;
  cost: string;
  damage_dice: string;
  damage_type: string;
  weight: string;
  properties: string;
  document_slug: string;
  document_title: string;
  document_url: string;
}

export interface MagicItemRow {
  slug: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  requires_attunement: string;
  document_slug: string;
  document_title: string;
  document_url: string;
}

export interface FeatRow {
  slug: string;
  name: string;
  description: string;
  prerequisite: string | null;
  effects: string | null;
  document_slug: string;
  document_title: string;
  document_url: string;
}

export interface SearchResult {
  slug: string;
  name: string;
  description: string;
  type: string;
}

export class Open5eDataStore {
  private db: Database.Database;

  constructor() {
    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      mkdir(dataDir, { recursive: true }).catch(error => {
        console.error('Failed to create data directory:', error);
      });
    }

    // Use the game database
    this.db = new Database(join(dataDir, 'game.db'));
    this.db.pragma('journal_mode = WAL');
  }

  /**
   * Store races data
   */
  storeRaces(races: Open5eRace[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO open5e_races (
        slug, name, description, ability_scores, age, alignment, 
        size, speed, languages, vision, traits, subraces,
        document_slug, document_title, document_url
      ) VALUES (
        @slug, @name, @description, @ability_scores, @age, @alignment,
        @size, @speed, @languages, @vision, @traits, @subraces,
        @document_slug, @document_title, @document_url
      )
    `);

    const insertMany = this.db.transaction((races: Open5eRace[]) => {
      for (const race of races) {
        stmt.run({
          slug: race.slug,
          name: race.name,
          description: race.desc,
          ability_scores: JSON.stringify(race.asi),
          age: race.age,
          alignment: race.alignment,
          size: race.size,
          speed: JSON.stringify(race.speed),
          languages: race.languages,
          vision: race.vision,
          traits: race.traits,
          subraces: JSON.stringify(race.subraces),
          document_slug: race.document__slug,
          document_title: race.document__title,
          document_url: race.document__url
        });
      }
    });

    insertMany(races);
    this.updateLoadStatus('races', races.length);
  }

  /**
   * Store classes data
   */
  storeClasses(classes: Open5eClass[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO open5e_classes (
        slug, name, description, hit_dice, hp_at_1st_level, hp_at_higher_levels,
        prof_armor, prof_weapons, prof_tools, prof_saving_throws, prof_skills,
        equipment, table_data, spellcasting_ability, subtypes_name, archetypes,
        document_slug, document_title, document_url
      ) VALUES (
        @slug, @name, @description, @hit_dice, @hp_at_1st_level, @hp_at_higher_levels,
        @prof_armor, @prof_weapons, @prof_tools, @prof_saving_throws, @prof_skills,
        @equipment, @table_data, @spellcasting_ability, @subtypes_name, @archetypes,
        @document_slug, @document_title, @document_url
      )
    `);

    const insertMany = this.db.transaction((classes: Open5eClass[]) => {
      for (const cls of classes) {
        stmt.run({
          slug: cls.slug,
          name: cls.name,
          description: cls.desc,
          hit_dice: cls.hit_dice,
          hp_at_1st_level: cls.hp_at_1st_level,
          hp_at_higher_levels: cls.hp_at_higher_levels,
          prof_armor: cls.prof_armor,
          prof_weapons: cls.prof_weapons,
          prof_tools: cls.prof_tools,
          prof_saving_throws: cls.prof_saving_throws,
          prof_skills: cls.prof_skills,
          equipment: cls.equipment,
          table_data: cls.table,
          spellcasting_ability: cls.spellcasting_ability,
          subtypes_name: cls.subtypes_name,
          archetypes: JSON.stringify(cls.archetypes),
          document_slug: cls.document__slug,
          document_title: cls.document__title,
          document_url: cls.document__url
        });
      }
    });

    insertMany(classes);
    this.updateLoadStatus('classes', classes.length);
  }

  /**
   * Store spells data
   */
  storeSpells(spells: Open5eSpell[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO open5e_spells (
        slug, name, description, higher_level, range, components, material,
        ritual, duration, concentration, casting_time, level, school,
        classes, spell_lists, document_slug, document_title, document_url
      ) VALUES (
        @slug, @name, @description, @higher_level, @range, @components, @material,
        @ritual, @duration, @concentration, @casting_time, @level, @school,
        @classes, @spell_lists, @document_slug, @document_title, @document_url
      )
    `);

    const insertMany = this.db.transaction((spells: Open5eSpell[]) => {
      for (const spell of spells) {
        stmt.run({
          slug: spell.slug,
          name: spell.name,
          description: spell.desc,
          higher_level: spell.higher_level,
          range: spell.range,
          components: spell.components,
          material: spell.material || null,
          ritual: spell.can_be_cast_as_ritual ? 1 : 0,
          duration: spell.duration,
          concentration: spell.requires_concentration ? 1 : 0,
          casting_time: spell.casting_time,
          level: spell.level_int,
          school: spell.school,
          classes: spell.dnd_class,
          spell_lists: Array.isArray(spell.spell_lists) ? JSON.stringify(spell.spell_lists) : '[]',
          document_slug: spell.document__slug,
          document_title: spell.document__title,
          document_url: spell.document__url
        });
      }
    });

    insertMany(spells);
    this.updateLoadStatus('spells', spells.length);
  }

  /**
   * Store monsters data
   */
  storeMonsters(monsters: Open5eMonster[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO open5e_monsters (
        slug, name, description, size, type, subtype, alignment,
        armor_class, armor_desc, hit_points, hit_dice, speed,
        strength, dexterity, constitution, intelligence, wisdom, charisma,
        strength_save, dexterity_save, constitution_save, intelligence_save, wisdom_save, charisma_save,
        skills, damage_vulnerabilities, damage_resistances, damage_immunities,
        condition_immunities, senses, languages, challenge_rating, cr,
        actions, bonus_actions, reactions, legendary_desc, legendary_actions,
        special_abilities, spell_list, environments,
        document_slug, document_title, document_url
      ) VALUES (
        @slug, @name, @description, @size, @type, @subtype, @alignment,
        @armor_class, @armor_desc, @hit_points, @hit_dice, @speed,
        @strength, @dexterity, @constitution, @intelligence, @wisdom, @charisma,
        @strength_save, @dexterity_save, @constitution_save, @intelligence_save, @wisdom_save, @charisma_save,
        @skills, @damage_vulnerabilities, @damage_resistances, @damage_immunities,
        @condition_immunities, @senses, @languages, @challenge_rating, @cr,
        @actions, @bonus_actions, @reactions, @legendary_desc, @legendary_actions,
        @special_abilities, @spell_list, @environments,
        @document_slug, @document_title, @document_url
      )
    `);

    const insertMany = this.db.transaction((monsters: Open5eMonster[]) => {
      for (const monster of monsters) {
        stmt.run({
          slug: monster.slug,
          name: monster.name,
          description: monster.desc,
          size: monster.size,
          type: monster.type,
          subtype: monster.subtype,
          alignment: monster.alignment,
          armor_class: monster.armor_class,
          armor_desc: monster.armor_desc,
          hit_points: monster.hit_points,
          hit_dice: monster.hit_dice,
          speed: JSON.stringify(monster.speed),
          strength: monster.strength,
          dexterity: monster.dexterity,
          constitution: monster.constitution,
          intelligence: monster.intelligence,
          wisdom: monster.wisdom,
          charisma: monster.charisma,
          strength_save: monster.strength_save,
          dexterity_save: monster.dexterity_save,
          constitution_save: monster.constitution_save,
          intelligence_save: monster.intelligence_save,
          wisdom_save: monster.wisdom_save,
          charisma_save: monster.charisma_save,
          skills: JSON.stringify(monster.skills),
          damage_vulnerabilities: monster.damage_vulnerabilities,
          damage_resistances: monster.damage_resistances,
          damage_immunities: monster.damage_immunities,
          condition_immunities: monster.condition_immunities,
          senses: monster.senses,
          languages: monster.languages,
          challenge_rating: monster.challenge_rating,
          cr: monster.cr,
          actions: JSON.stringify(monster.actions),
          bonus_actions: JSON.stringify(monster.bonus_actions),
          reactions: JSON.stringify(monster.reactions),
          legendary_desc: monster.legendary_desc,
          legendary_actions: JSON.stringify(monster.legendary_actions),
          special_abilities: JSON.stringify(monster.special_abilities),
          spell_list: JSON.stringify(monster.spell_list),
          environments: JSON.stringify(monster.environments),
          document_slug: monster.document__slug,
          document_title: monster.document__title,
          document_url: monster.document__url
        });
      }
    });

    insertMany(monsters);
    this.updateLoadStatus('monsters', monsters.length);
  }

  /**
   * Store weapons data
   */
  storeWeapons(weapons: Open5eWeapon[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO open5e_weapons (
        slug, name, description, category, cost, damage_dice,
        damage_type, weight, properties,
        document_slug, document_title, document_url
      ) VALUES (
        @slug, @name, @description, @category, @cost, @damage_dice,
        @damage_type, @weight, @properties,
        @document_slug, @document_title, @document_url
      )
    `);

    const insertMany = this.db.transaction((weapons: Open5eWeapon[]) => {
      for (const weapon of weapons) {
        stmt.run({
          slug: weapon.slug,
          name: weapon.name,
          description: weapon.desc,
          category: weapon.category,
          cost: weapon.cost,
          damage_dice: weapon.damage_dice,
          damage_type: weapon.damage_type,
          weight: weapon.weight,
          properties: JSON.stringify(weapon.properties),
          document_slug: weapon.document__slug,
          document_title: weapon.document__title,
          document_url: weapon.document__url
        });
      }
    });

    insertMany(weapons);
    this.updateLoadStatus('weapons', weapons.length);
  }

  /**
   * Store magic items data
   */
  storeMagicItems(items: Open5eMagicItem[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO open5e_magic_items (
        slug, name, description, type, rarity, requires_attunement,
        document_slug, document_title, document_url
      ) VALUES (
        @slug, @name, @description, @type, @rarity, @requires_attunement,
        @document_slug, @document_title, @document_url
      )
    `);

    const insertMany = this.db.transaction((items: Open5eMagicItem[]) => {
      for (const item of items) {
        stmt.run({
          slug: item.slug,
          name: item.name,
          description: item.desc,
          type: item.type,
          rarity: item.rarity,
          requires_attunement: item.requires_attunement,
          document_slug: item.document__slug,
          document_title: item.document__title,
          document_url: item.document__url
        });
      }
    });

    insertMany(items);
    this.updateLoadStatus('magic_items', items.length);
  }

  /**
   * Store backgrounds data
   */
  storeBackgrounds(backgrounds: Open5eBackground[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO open5e_backgrounds (
        slug, name, description, skill_proficiencies, tool_proficiencies,
        languages, equipment, feature, feature_desc, suggested_characteristics,
        document_slug, document_title, document_url
      ) VALUES (
        @slug, @name, @description, @skill_proficiencies, @tool_proficiencies,
        @languages, @equipment, @feature, @feature_desc, @suggested_characteristics,
        @document_slug, @document_title, @document_url
      )
    `);

    const insertMany = this.db.transaction((backgrounds: Open5eBackground[]) => {
      for (const bg of backgrounds) {
        stmt.run({
          slug: bg.slug,
          name: bg.name,
          description: bg.desc,
          skill_proficiencies: bg.skill_proficiencies,
          tool_proficiencies: bg.tool_proficiencies,
          languages: bg.languages,
          equipment: bg.equipment,
          feature: bg.feature,
          feature_desc: bg.feature_desc,
          suggested_characteristics: bg.suggested_characteristics,
          document_slug: bg.document__slug,
          document_title: bg.document__title,
          document_url: bg.document__url
        });
      }
    });

    insertMany(backgrounds);
    this.updateLoadStatus('backgrounds', backgrounds.length);
  }

  /**
   * Store feats data
   */
  storeFeats(feats: Open5eFeat[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO open5e_feats (
        slug, name, description, prerequisite, effects,
        document_slug, document_title, document_url
      ) VALUES (
        @slug, @name, @description, @prerequisite, @effects,
        @document_slug, @document_title, @document_url
      )
    `);

    const insertMany = this.db.transaction((feats: Open5eFeat[]) => {
      for (const feat of feats) {
        stmt.run({
          slug: feat.slug,
          name: feat.name,
          description: feat.desc,
          prerequisite: feat.prerequisite,
          effects: feat.effects,
          document_slug: feat.document__slug,
          document_title: feat.document__title,
          document_url: feat.document__url
        });
      }
    });

    insertMany(feats);
    this.updateLoadStatus('feats', feats.length);
  }

  /**
   * Get races
   */
  getRaces(): RaceRow[] {
    const stmt = this.db.prepare(`
      SELECT * FROM open5e_races ORDER BY name
    `);
    return stmt.all() as RaceRow[];
  }

  /**
   * Get race by slug
   */
  getRaceBySlug(slug: string): RaceRow | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM open5e_races WHERE slug = ?
    `);
    return stmt.get(slug) as RaceRow | undefined;
  }

  /**
   * Get classes
   */
  getClasses(): ClassRow[] {
    const stmt = this.db.prepare(`
      SELECT * FROM open5e_classes ORDER BY name
    `);
    return stmt.all() as ClassRow[];
  }

  /**
   * Get class by slug
   */
  getClassBySlug(slug: string): ClassRow | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM open5e_classes WHERE slug = ?
    `);
    return stmt.get(slug) as ClassRow | undefined;
  }

  /**
   * Get backgrounds
   */
  getBackgrounds(): BackgroundRow[] {
    const stmt = this.db.prepare(`
      SELECT * FROM open5e_backgrounds ORDER BY name
    `);
    return stmt.all() as BackgroundRow[];
  }

  /**
   * Get background by slug
   */
  getBackgroundBySlug(slug: string): BackgroundRow | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM open5e_backgrounds WHERE slug = ?
    `);
    return stmt.get(slug) as BackgroundRow | undefined;
  }

  /**
   * Get spells with optional filters
   */
  getSpells(filters?: { level?: number; school?: string; class?: string }): SpellRow[] {
    let query = 'SELECT * FROM open5e_spells WHERE 1=1';
    const params: (string | number)[] = [];

    if (filters?.level !== undefined) {
      query += ' AND level = ?';
      params.push(filters.level);
    }

    if (filters?.school) {
      query += ' AND school = ?';
      params.push(filters.school);
    }

    if (filters?.class) {
      query += ' AND classes LIKE ?';
      params.push(`%${filters.class}%`);
    }

    query += ' ORDER BY level, name';
    const stmt = this.db.prepare(query);
    return stmt.all(...params) as SpellRow[];
  }

  /**
   * Get spell by slug
   */
  getSpellBySlug(slug: string): SpellRow | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM open5e_spells WHERE slug = ?
    `);
    return stmt.get(slug) as SpellRow | undefined;
  }

  /**
   * Get monsters with optional filters
   */
  getMonsters(filters?: { cr?: number; type?: string }): MonsterRow[] {
    let query = 'SELECT * FROM open5e_monsters WHERE 1=1';
    const params: (string | number)[] = [];

    if (filters?.cr !== undefined) {
      query += ' AND cr = ?';
      params.push(filters.cr);
    }

    if (filters?.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    query += ' ORDER BY cr, name';
    const stmt = this.db.prepare(query);
    return stmt.all(...params) as MonsterRow[];
  }

  /**
   * Get monster by slug
   */
  getMonsterBySlug(slug: string): MonsterRow | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM open5e_monsters WHERE slug = ?
    `);
    return stmt.get(slug) as MonsterRow | undefined;
  }

  /**
   * Get weapons with optional category filter
   */
  getWeapons(category?: string): WeaponRow[] {
    if (category) {
      const stmt = this.db.prepare(`
        SELECT * FROM open5e_weapons WHERE category = ? ORDER BY name
      `);
      return stmt.all(category) as WeaponRow[];
    }
    const stmt = this.db.prepare(`
      SELECT * FROM open5e_weapons ORDER BY category, name
    `);
    return stmt.all() as WeaponRow[];
  }

  /**
   * Get weapon by slug
   */
  getWeaponBySlug(slug: string): WeaponRow | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM open5e_weapons WHERE slug = ?
    `);
    return stmt.get(slug) as WeaponRow | undefined;
  }

  /**
   * Get magic items with optional rarity filter
   */
  getMagicItems(rarity?: string): MagicItemRow[] {
    if (rarity) {
      const stmt = this.db.prepare(`
        SELECT * FROM open5e_magic_items WHERE rarity = ? ORDER BY name
      `);
      return stmt.all(rarity) as MagicItemRow[];
    }
    const stmt = this.db.prepare(`
      SELECT * FROM open5e_magic_items ORDER BY rarity, name
    `);
    return stmt.all() as MagicItemRow[];
  }

  /**
   * Get magic item by slug
   */
  getMagicItemBySlug(slug: string): MagicItemRow | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM open5e_magic_items WHERE slug = ?
    `);
    return stmt.get(slug) as MagicItemRow | undefined;
  }

  /**
   * Get feats
   */
  getFeats(): FeatRow[] {
    const stmt = this.db.prepare(`
      SELECT * FROM open5e_feats ORDER BY name
    `);
    return stmt.all() as FeatRow[];
  }

  /**
   * Get feat by slug
   */
  getFeatBySlug(slug: string): FeatRow | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM open5e_feats WHERE slug = ?
    `);
    return stmt.get(slug) as FeatRow | undefined;
  }

  /**
   * Search across all tables
   */
  search(query: string, limit = 10): SearchResult[] {
    const results: SearchResult[] = [];
    const searchTerm = `%${query}%`;
    
    const tables = [
      { table: 'open5e_races', type: 'race' },
      { table: 'open5e_classes', type: 'class' },
      { table: 'open5e_backgrounds', type: 'background' },
      { table: 'open5e_spells', type: 'spell' },
      { table: 'open5e_monsters', type: 'monster' },
      { table: 'open5e_weapons', type: 'weapon' },
      { table: 'open5e_magic_items', type: 'magic_item' },
      { table: 'open5e_feats', type: 'feat' }
    ];
    
    for (const { table, type } of tables) {
      const stmt = this.db.prepare(`
        SELECT slug, name, description
        FROM ${table}
        WHERE name LIKE ? OR description LIKE ?
        LIMIT ?
      `);
      
      const rows = stmt.all(searchTerm, searchTerm, limit) as Array<{ slug: string; name: string; description: string }>;
      results.push(...rows.map(row => ({ ...row, type })));
    }
    
    return results;
  }

  /**
   * Get load status for a data type
   */
  getLoadStatus(dataType: string): LoadStatus | null {
    const stmt = this.db.prepare(
      'SELECT * FROM open5e_load_status WHERE data_type = ?'
    );
    return stmt.get(dataType) as LoadStatus | null;
  }

  /**
   * Get all load statuses
   */
  getAllLoadStatus(): LoadStatus[] {
    const stmt = this.db.prepare('SELECT * FROM open5e_load_status');
    return stmt.all() as LoadStatus[];
  }

  /**
   * Check if data has been loaded
   */
  isDataLoaded(): boolean {
    const statuses = this.getAllLoadStatus();
    const requiredTypes = ['races', 'classes', 'backgrounds'];
    
    for (const type of requiredTypes) {
      const status = statuses.find(s => s.data_type === type);
      if (!status || status.item_count === 0) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    const tables = [
      'open5e_races', 'open5e_classes', 'open5e_backgrounds',
      'open5e_spells', 'open5e_monsters', 'open5e_weapons',
      'open5e_magic_items', 'open5e_feats', 'open5e_load_status'
    ];

    for (const table of tables) {
      this.db.exec(`DELETE FROM ${table}`);
    }
    
    console.log('Cleared all Open5e data');
  }

  private updateLoadStatus(dataType: string, count: number): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO open5e_load_status (
        data_type, item_count, last_loaded, version
      ) VALUES (
        @dataType, @count, CURRENT_TIMESTAMP, @version
      )
    `);

    stmt.run({
      dataType,
      count,
      version: '1.0.0'
    });
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}