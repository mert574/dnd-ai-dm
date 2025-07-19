<template>
  <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
    <h3 class="text-xl font-bold text-red-500 mb-4">{{ title }}</h3>
    <div v-if="loading" class="text-gray-400 text-center py-4">
      Loading {{ itemType }}s...
    </div>
    <div v-else-if="error" class="text-red-400 text-center py-4">
      {{ error }}
    </div>
    <div v-else-if="items?.length" class="space-y-4">
      <div v-for="item in items" :key="item.slug" class="border-b border-gray-700 last:border-0 pb-4 last:pb-0">
        <h4 class="font-semibold text-gray-100">{{ item.name }}</h4>
        <!-- Spell details -->
        <template v-if="itemType === 'spell'">
          <p class="text-sm text-gray-400">Level {{ (item as Spell).level }} {{ (item as Spell).school }}</p>
        </template>
        <!-- Magic item details -->
        <template v-else-if="itemType === 'item'">
          <p class="text-sm text-gray-400">{{ (item as MagicItem).type }} ({{ (item as MagicItem).rarity }})</p>
        </template>
        <!-- Weapon details -->
        <template v-else-if="itemType === 'weapon'">
          <p class="text-sm text-gray-400">
            {{ (item as Weapon).category }} • {{ (item as Weapon).damage_dice }} {{ (item as Weapon).damage_type }}
          </p>
        </template>
        <p class="text-sm text-gray-300 mt-1">
          {{ item.desc?.slice(0, 100) || 'No description available' }}{{ item.desc?.length > 100 ? '...' : '' }}
        </p>
      </div>
    </div>
    <div v-else class="text-gray-400 text-center py-4">
      No {{ itemType }}s found
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Spell, MagicItem, Weapon } from '~/server/utils/open5e/types';

interface Props {
  title: string;
  loading: boolean;
  error: string | null;
  items: Spell[] | MagicItem[] | Weapon[] | null | undefined;
  itemType: 'spell' | 'item' | 'weapon';
}

defineProps<Props>();
</script> 