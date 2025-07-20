<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black bg-opacity-50" 
      @click="closeModal"
    />
    
    <!-- Modal Content -->
    <div class="relative bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-white">Character Details</h2>
        <button 
          class="text-gray-400 hover:text-white transition-colors"
          @click="closeModal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="text-gray-400">Loading character details...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <div class="text-red-400">{{ error }}</div>
        <button 
          class="mt-2 text-blue-400 hover:text-blue-300 transition-colors"
          @click="fetchCharacter"
        >
          Try Again
        </button>
      </div>

      <!-- Character Details -->
      <div v-else-if="character" class="space-y-6">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-700 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-red-400 mb-3">Basic Information</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Name:</span>
                <span class="text-white">{{ character.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Class:</span>
                <span class="text-white">{{ character.class }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Race:</span>
                <span class="text-white">{{ character.race }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Level:</span>
                <span class="text-white">{{ character.level }}</span>
              </div>
              <div v-if="character.background" class="flex justify-between">
                <span class="text-gray-400">Background:</span>
                <span class="text-white">{{ character.background }}</span>
              </div>
              <div v-if="character.alignment" class="flex justify-between">
                <span class="text-gray-400">Alignment:</span>
                <span class="text-white">{{ character.alignment }}</span>
              </div>
            </div>
          </div>

          <!-- Health & Combat -->
          <div class="bg-gray-700 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-red-400 mb-3">Health & Combat</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Hit Points:</span>
                <span class="text-white">{{ character.currentHp }}/{{ character.maxHp }}</span>
              </div>
              <div v-if="character.temporaryHp" class="flex justify-between">
                <span class="text-gray-400">Temp HP:</span>
                <span class="text-blue-400">{{ character.temporaryHp }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Armor Class:</span>
                <span class="text-white">{{ character.armorClass }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Initiative:</span>
                <span class="text-white">+{{ character.initiative }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Speed:</span>
                <span class="text-white">{{ character.speed }} ft</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Hit Dice:</span>
                <span class="text-white">{{ character.hitDice }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Ability Scores -->
        <div class="bg-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-red-400 mb-3">Ability Scores</h3>
          <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
            <div class="text-center">
              <div class="text-xs text-gray-400 uppercase tracking-wide">STR</div>
              <div class="text-lg font-bold text-white">{{ getModifier(character.strength) }}</div>
              <div class="text-xs text-gray-500">({{ character.strength }})</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400 uppercase tracking-wide">DEX</div>
              <div class="text-lg font-bold text-white">{{ getModifier(character.dexterity) }}</div>
              <div class="text-xs text-gray-500">({{ character.dexterity }})</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400 uppercase tracking-wide">CON</div>
              <div class="text-lg font-bold text-white">{{ getModifier(character.constitution) }}</div>
              <div class="text-xs text-gray-500">({{ character.constitution }})</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400 uppercase tracking-wide">INT</div>
              <div class="text-lg font-bold text-white">{{ getModifier(character.intelligence) }}</div>
              <div class="text-xs text-gray-500">({{ character.intelligence }})</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400 uppercase tracking-wide">WIS</div>
              <div class="text-lg font-bold text-white">{{ getModifier(character.wisdom) }}</div>
              <div class="text-xs text-gray-500">({{ character.wisdom }})</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400 uppercase tracking-wide">CHA</div>
              <div class="text-lg font-bold text-white">{{ getModifier(character.charisma) }}</div>
              <div class="text-xs text-gray-500">({{ character.charisma }})</div>
            </div>
          </div>
        </div>

        <!-- Features -->
        <div v-if="character.features?.length" class="bg-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-red-400 mb-3">Features & Traits</h3>
          <div class="space-y-3">
            <div v-for="feature in character.features" :key="feature.name" class="border-b border-gray-600 last:border-b-0 pb-2 last:pb-0">
              <div class="font-medium text-white">{{ feature.name }}</div>
              <div class="text-sm text-gray-300 mt-1">{{ feature.description }}</div>
              <div v-if="feature.source" class="text-xs text-gray-500 mt-1">Source: {{ feature.source }}</div>
            </div>
          </div>
        </div>

        <!-- Equipment -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Weapons -->
          <div v-if="character.weapons?.length" class="bg-gray-700 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-red-400 mb-3">Weapons</h3>
            <div class="space-y-2">
              <div v-for="weapon in character.weapons" :key="weapon.name" class="text-sm">
                <div class="font-medium text-white">{{ weapon.name }}</div>
                <div class="text-gray-400">{{ weapon.damage }} {{ weapon.damageType }}</div>
                <div v-if="weapon.properties?.length" class="text-xs text-gray-500">{{ weapon.properties.join(', ') }}</div>
              </div>
            </div>
          </div>

          <!-- Armor -->
          <div v-if="character.armor?.length" class="bg-gray-700 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-red-400 mb-3">Armor</h3>
            <div class="space-y-2">
              <div v-for="armor in character.armor" :key="armor.name" class="text-sm">
                <div class="font-medium text-white">{{ armor.name }}</div>
                <div class="text-gray-400">AC: {{ armor.armorClass }} ({{ armor.type }})</div>
                <div v-if="armor.stealthDisadvantage" class="text-xs text-yellow-500">Stealth Disadvantage</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Personality -->
        <div v-if="hasPersonality" class="bg-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-red-400 mb-3">Personality</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div v-if="character.personalityTraits">
              <div class="font-medium text-gray-300 mb-1">Personality Traits</div>
              <div class="text-gray-400">{{ character.personalityTraits }}</div>
            </div>
            <div v-if="character.ideals">
              <div class="font-medium text-gray-300 mb-1">Ideals</div>
              <div class="text-gray-400">{{ character.ideals }}</div>
            </div>
            <div v-if="character.bonds">
              <div class="font-medium text-gray-300 mb-1">Bonds</div>
              <div class="text-gray-400">{{ character.bonds }}</div>
            </div>
            <div v-if="character.flaws">
              <div class="font-medium text-gray-300 mb-1">Flaws</div>
              <div class="text-gray-400">{{ character.flaws }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '~/server/db/types';

interface Props {
  isOpen: boolean;
  characterId: number | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const character = ref<Character | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const hasPersonality = computed(() => {
  return character.value?.personalityTraits || 
         character.value?.ideals || 
         character.value?.bonds || 
         character.value?.flaws;
});

function getModifier(score: number): string {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

function closeModal() {
  emit('close');
}

async function fetchCharacter() {
  if (!props.characterId) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await $fetch(`/api/characters/${props.characterId}`);
    if (response?.data) {
      character.value = response.data;
    }
  } catch (err) {
    console.error('Failed to fetch character:', err);
    error.value = 'Failed to load character details';
  } finally {
    loading.value = false;
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.characterId) {
    fetchCharacter();
  } else {
    character.value = null;
    error.value = null;
  }
});

onMounted(() => {
  if (props.isOpen && props.characterId) {
    fetchCharacter();
  }
});
</script>