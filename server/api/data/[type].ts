import type { H3Event } from 'h3';
import { z } from 'zod';
import { open5eService } from '~/server/services/open5e.service';
import { apiErrorCreators } from '~/server/utils/api';

// Map URL types to our data types
const typeMapping: Record<string, string> = {
  'spells': 'spells',
  'monsters': 'monsters',
  'weapons': 'weapons',
  'magicitems': 'magic-items',
  'magic-items': 'magic-items',
  'races': 'races',
  'classes': 'classes',
  'backgrounds': 'backgrounds',
  'feats': 'feats'
};

// Query parameter validation schema
const querySchema = z.object({
  search: z.string().optional(),
  slug: z.string().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(
    z.number().min(1).max(100)
  ).optional(),
  // Spell-specific filters
  level: z.string().regex(/^\d+$/).transform(Number).optional(),
  school: z.string().optional(),
  class: z.string().optional(),
  // Monster-specific filters
  cr: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  type: z.string().optional(),
  // Weapon/Magic item filters
  category: z.string().optional(),
  rarity: z.string().optional()
}).refine(
  (data) => {
    // Can't have both search and slug
    return !(data.search && data.slug);
  },
  { message: "Cannot specify both 'search' and 'slug' parameters" }
);

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Get data type from URL
    const urlType = event.context.params?.type;
    if (!urlType || !typeMapping[urlType]) {
      throw apiErrorCreators.badRequest(`Invalid data type: ${urlType}`);
    }

    const dataType = typeMapping[urlType];

    // Get and validate query parameters
    const rawQuery = getQuery(event);
    const validationResult = querySchema.safeParse(rawQuery);
    
    if (!validationResult.success) {
      throw apiErrorCreators.validation('Invalid query parameters', validationResult.error.issues);
    }
    
    const query = validationResult.data;
    const { slug, search, limit } = query;

    // If searching by slug, return single item
    if (slug) {
      let result;
      switch (dataType) {
        case 'races':
          result = await open5eService.getRaceBySlug(slug);
          break;
        case 'classes':
          result = await open5eService.getClassBySlug(slug);
          break;
        case 'backgrounds':
          result = await open5eService.getBackgroundBySlug(slug);
          break;
        case 'spells':
          result = await open5eService.getSpellBySlug(slug);
          break;
        case 'monsters':
          result = await open5eService.getMonsterBySlug(slug);
          break;
        case 'weapons':
          result = await open5eService.getWeaponBySlug(slug);
          break;
        case 'magic-items':
          result = await open5eService.getMagicItemBySlug(slug);
          break;
        case 'feats':
          result = await open5eService.getFeatBySlug(slug);
          break;
      }
      
      if (!result) {
        throw apiErrorCreators.notFound(`${dataType} with slug '${slug}' not found`);
      }
      
      return result;
    }

    // If searching across all data
    if (search) {
      const results = await open5eService.search(search);
      const filteredResults = results.filter(r => r.type === dataType.replace('-', '_'));
      return limit ? filteredResults.slice(0, limit) : filteredResults;
    }

    // Otherwise, get list of items
    let results;
    switch (dataType) {
      case 'races':
        results = await open5eService.getRaces();
        break;
      case 'classes':
        results = await open5eService.getClasses();
        break;
      case 'backgrounds':
        results = await open5eService.getBackgrounds();
        break;
      case 'spells':
        results = await open5eService.getSpells({
          level: query.level,
          school: query.school,
          class: query.class
        });
        break;
      case 'monsters':
        results = await open5eService.getMonsters({
          cr: query.cr,
          type: query.type
        });
        break;
      case 'weapons':
        results = await open5eService.getWeapons(query.category);
        break;
      case 'magic-items':
        results = await open5eService.getMagicItems(query.rarity);
        break;
      case 'feats':
        results = await open5eService.getFeats();
        break;
      default:
        throw apiErrorCreators.badRequest(`Unknown data type: ${dataType}`);
    }

    // Apply limit if requested
    return limit ? results.slice(0, limit) : results;
  } catch (error: unknown) {
    console.error('Open5e Data Error:', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    
    throw apiErrorCreators.internal('Failed to fetch D&D data');
  }
});