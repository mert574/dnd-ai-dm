<template>
  <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
    <h3 class="text-xl font-bold text-blue-500 mb-4">Your Characters</h3>
    <div v-if="loading" class="text-gray-400">
      Loading characters...
    </div>
    <p v-else-if="!characters?.length" class="text-gray-400">
      No characters found. Create your first character to get started!
    </p>
    <div v-else class="space-y-4">
      <div 
        v-for="character in characters" 
        :key="character.id"
        class="bg-gray-700 rounded-lg p-4 border border-gray-600"
      >
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-semibold text-white">{{ character.name }}</h4>
            <p class="text-sm text-gray-400">
              Level {{ character.level }} {{ character.race }} {{ character.class }}
            </p>
            <div class="flex gap-4 mt-2 text-xs text-gray-500">
              <span>HP: {{ character.currentHp }}/{{ character.maxHp }}</span>
              <span>AC: {{ character.armorClass }}</span>
            </div>
            <span 
              class="inline-block px-2 py-1 text-xs rounded-full mt-2"
              :class="{
                'bg-green-900 text-green-300': character.isActive,
                'bg-gray-900 text-gray-300': !character.isActive
              }"
            >
              {{ character.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="flex gap-2">
            <button 
              class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              View
            </button>
            <button 
              class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
              @click="$emit('deleteCharacter', character.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '~/server/db/types';

interface Props {
  characters?: Character[];
  loading: boolean;
}

defineProps<Props>();
defineEmits<{
  deleteCharacter: [id: number];
}>();
</script>