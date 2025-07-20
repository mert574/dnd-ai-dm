<template>
  <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
    <h3 class="text-xl font-bold text-red-500 mb-4">Recent Campaigns</h3>
    <div v-if="loading" class="text-gray-400">
      Loading campaigns...
    </div>
    <p v-else-if="!campaigns?.length" class="text-gray-400">
      No recent campaigns found. Create a new campaign to get started!
    </p>
    <div v-else class="space-y-4">
      <div 
        v-for="campaign in campaigns" 
        :key="campaign.id"
        class="bg-gray-700 rounded-lg p-4 border border-gray-600"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h4 class="font-semibold text-white">{{ campaign.name }}</h4>
            <p class="text-sm text-gray-400">Code: {{ campaign.id }}</p>
            <span 
              class="inline-block px-2 py-1 text-xs rounded-full mt-2"
              :class="{
                'bg-green-900 text-green-300': campaign.status === 'active',
                'bg-yellow-900 text-yellow-300': campaign.status === 'paused',
                'bg-gray-900 text-gray-300': campaign.status === 'completed'
              }"
            >
              {{ campaign.status }}
            </span>
            
            <!-- Characters section -->
            <div v-if="campaign.characters?.length" class="mt-3">
              <p class="text-xs text-gray-500 mb-2">Characters:</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="character in campaign.characters"
                  :key="character.id"
                  class="inline-flex items-center px-2 py-1 rounded text-xs transition-colors cursor-pointer"
                  :class="{
                    'bg-red-900 text-red-300 border border-red-700': character.userId === user?.id,
                    'bg-gray-900 text-gray-300 border border-gray-700 hover:bg-gray-800': character.userId !== user?.id
                  }"
                  @click="handleCharacterClick(character.id)"
                >
                  {{ character.name }}
                  <span class="ml-1 text-gray-500">
                    ({{ character.class }} {{ character.level }})
                  </span>
                </button>
              </div>
            </div>
          </div>
          <button 
            v-if="campaign.status === 'active'"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors ml-4"
          >
            Enter Campaign
          </button>
        </div>
      </div>
    </div>

    <!-- Character Modal -->
    <CharacterModal 
      :is-open="isModalOpen"
      :character-id="selectedCharacterId"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import type { Campaign } from '~/server/db/types';
import CharacterModal from '~/components/CharacterModal.vue';

interface Props {
  campaigns?: Campaign[];
  loading: boolean;
}

defineProps<Props>();

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const isModalOpen = ref(false);
const selectedCharacterId = ref<number | null>(null);

function handleCharacterClick(characterId: number) {
  selectedCharacterId.value = characterId;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  selectedCharacterId.value = null;
}
</script>