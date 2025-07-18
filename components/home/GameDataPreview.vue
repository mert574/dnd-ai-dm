<template>
  <div class="grid md:grid-cols-3 gap-8">
    <!-- Spells -->
    <DataCard
      title="Featured Spells"
      :loading="spellsLoading"
      :error="spellsError"
      :items="spells"
      item-type="spell"
    />

    <!-- Magic Items -->
    <DataCard
      title="Magic Items"
      :loading="itemsLoading"
      :error="itemsError"
      :items="magicItems"
      item-type="item"
    />

    <!-- Weapons -->
    <DataCard
      title="Weapons"
      :loading="weaponsLoading"
      :error="weaponsError"
      :items="weapons"
      item-type="weapon"
    />
  </div>
</template>

<script setup lang="ts">
import type { Spell, MagicItem, Weapon } from '~/server/utils/open5e/types';
import DataCard from '~/components/home/DataCard.vue';

// Error states
const spellsError = ref<string | null>(null);
const itemsError = ref<string | null>(null);
const weaponsError = ref<string | null>(null);

// Fetch data from Open5e
const { data: spells, error: spellsFetchError } = await useFetch<Spell[]>('/api/data/spells', {
  query: { limit: 5 },
  timeout: 30000,
  immediate: true,
  watch: false
});

const { data: magicItems, error: itemsFetchError } = await useFetch<MagicItem[]>('/api/data/magicitems', {
  query: { limit: 5 },
  timeout: 30000,
  immediate: true,
  watch: false
});

const { data: weapons, error: weaponsFetchError } = await useFetch<Weapon[]>('/api/data/weapons', {
  query: { limit: 5 },
  timeout: 30000,
  immediate: true,
  watch: false
});

// Watch for errors
watch(spellsFetchError, (error) => {
  if (error) spellsError.value = 'Failed to load spells';
});

watch(itemsFetchError, (error) => {
  if (error) itemsError.value = 'Failed to load magic items';
});

watch(weaponsFetchError, (error) => {
  if (error) weaponsError.value = 'Failed to load weapons';
});

// Loading states
const spellsLoading = computed(() => !spells.value && !spellsError.value);
const itemsLoading = computed(() => !magicItems.value && !itemsError.value);
const weaponsLoading = computed(() => !weapons.value && !weaponsError.value);
</script> 