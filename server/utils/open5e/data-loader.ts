import { Open5eClient } from './client';
import { Open5eDataStore } from './store';
import type { 
  Open5eRace, 
  Open5eClass, 
  Open5eBackground, 
  Open5eSpell, 
  Open5eMonster, 
  Open5eWeapon, 
  Open5eMagicItem, 
  Open5eFeat 
} from './store';
import { Endpoint } from './types';

/**
 * Initialize Open5e data store with D&D data
 * This runs only once when the database is empty
 */
export async function initializeOpen5eData() {
  const store = new Open5eDataStore();
  const client = new Open5eClient();

  try {
    // Check if all data has been loaded
    const statuses = store.getAllLoadStatus();
    const loadedTypes = new Set(statuses.map(s => s.data_type));
    const expectedTypes = ['races', 'classes', 'backgrounds', 'spells', 'monsters', 'weapons', 'magic_items', 'feats'];
    const missingTypes = expectedTypes.filter(type => !loadedTypes.has(type));
    
    if (missingTypes.length === 0) {
      console.log('Open5e data already loaded, skipping initialization');
      return;
    }
    
    console.log(`Missing data types: ${missingTypes.join(', ')}`);
    console.log('Initializing Open5e data store...');
    
    // Load missing data types
    if (missingTypes.includes('races')) await loadRaces(client, store);
    if (missingTypes.includes('classes')) await loadClasses(client, store);
    if (missingTypes.includes('backgrounds')) await loadBackgrounds(client, store);
    if (missingTypes.includes('spells')) await loadSpells(client, store);
    if (missingTypes.includes('monsters')) await loadMonsters(client, store);
    if (missingTypes.includes('weapons')) await loadWeapons(client, store);
    if (missingTypes.includes('magic_items')) await loadMagicItems(client, store);
    if (missingTypes.includes('feats')) await loadFeats(client, store);
    
    console.log('Open5e data initialization complete!');
    
    // Display summary
    const finalStatuses = store.getAllLoadStatus();
    console.log('\nData load summary:');
    finalStatuses.forEach(status => {
      console.log(`  ${status.data_type}: ${status.item_count} items`);
    });
  } catch (error) {
    console.error('Failed to initialize Open5e data:', error);
    throw error;
  } finally {
    store.close();
  }
}

async function loadRaces(client: Open5eClient, store: Open5eDataStore) {
  console.log('Loading races...');
  const races = await client.fetchAll<Open5eRace>(Endpoint.Races);
  store.storeRaces(races);
  console.log(`  Loaded ${races.length} races`);
}

async function loadClasses(client: Open5eClient, store: Open5eDataStore) {
  console.log('Loading classes...');
  const classes = await client.fetchAll<Open5eClass>(Endpoint.Classes);
  store.storeClasses(classes);
  console.log(`  Loaded ${classes.length} classes`);
}

async function loadBackgrounds(client: Open5eClient, store: Open5eDataStore) {
  console.log('Loading backgrounds...');
  const backgrounds = await client.fetchAll<Open5eBackground>(Endpoint.Backgrounds);
  store.storeBackgrounds(backgrounds);
  console.log(`  Loaded ${backgrounds.length} backgrounds`);
}

async function loadSpells(client: Open5eClient, store: Open5eDataStore) {
  console.log('Loading spells...');
  const spells = await client.fetchAll<Open5eSpell>(Endpoint.Spells);
  store.storeSpells(spells);
  console.log(`  Loaded ${spells.length} spells`);
}

async function loadMonsters(client: Open5eClient, store: Open5eDataStore) {
  console.log('Loading monsters...');
  const monsters = await client.fetchAll<Open5eMonster>(Endpoint.Monsters);
  store.storeMonsters(monsters);
  console.log(`  Loaded ${monsters.length} monsters`);
}

async function loadWeapons(client: Open5eClient, store: Open5eDataStore) {
  console.log('Loading weapons...');
  const weapons = await client.fetchAll<Open5eWeapon>(Endpoint.Weapons);
  store.storeWeapons(weapons);
  console.log(`  Loaded ${weapons.length} weapons`);
}

async function loadMagicItems(client: Open5eClient, store: Open5eDataStore) {
  console.log('Loading magic items...');
  const items = await client.fetchAll<Open5eMagicItem>(Endpoint.MagicItems);
  store.storeMagicItems(items);
  console.log(`  Loaded ${items.length} magic items`);
}

async function loadFeats(client: Open5eClient, store: Open5eDataStore) {
  console.log('Loading feats...');
  const feats = await client.fetchAll<Open5eFeat>(Endpoint.Feats);
  store.storeFeats(feats);
  console.log(`  Loaded ${feats.length} feats`);
}

