<template>
  <div class="space-y-8">
    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-4">
      <button 
        :disabled="loading"
        class="bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-medium transition-colors"
        @click="createModal.open()"
      >
        Create New Campaign
      </button>
      <button 
        :disabled="loading"
        class="bg-stone-600 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-medium transition-colors"
        @click="joinModal.open()"
      >
        Join Campaign
      </button>
      <NuxtLink 
        to="/characters/builder"
        class="bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-lg font-medium transition-colors inline-block"
      >
        Create Character
      </NuxtLink>
    </div>

    <!-- Error Display -->
    <div v-if="error || charactersError" class="bg-red-900/50 border border-red-700 rounded-lg p-4">
      <p v-if="error" class="text-red-300">{{ error }}</p>
      <p v-if="charactersError" class="text-red-300">{{ charactersError }}</p>
    </div>

    <!-- Campaign and Character Lists -->
    <CampaignList :campaigns="campaigns" :loading="loading" />
    <CharacterList 
      :characters="characters" 
      :loading="charactersLoading" 
      @delete-character="handleDeleteCharacter"
    />

    <!-- Modals -->
    <CreateCampaignModal
      :is-open="createModal.isOpen.value"
      :loading="loading"
      @create="handleCreateCampaign"
      @cancel="createModal.close()"
    />
    <JoinCampaignModal
      :is-open="joinModal.isOpen.value"
      :loading="loading"
      :characters="characters"
      @join="handleJoinCampaign"
      @cancel="joinModal.close()"
    />
  </div>
</template>

<script setup lang="ts">
const { createCampaign, joinCampaign, fetchUserCampaigns, campaigns, loading, error } = useCampaign();
const { 
  fetchUserCharacters, 
  deleteCharacter, 
  characters, 
  loading: charactersLoading, 
  error: charactersError 
} = useCharacters();

const createModal = useModal();
const joinModal = useModal();

async function handleCreateCampaign(data: { name: string }) {
  const campaign = await createCampaign(data);
  if (campaign) {
    createModal.close();
  }
}

async function handleJoinCampaign(data: { campaignCode: string; characterId: number }) {
  const result = await joinCampaign(data);
  if (result) {
    joinModal.close();
  }
}

async function handleDeleteCharacter(id: number) {
  if (confirm('Are you sure you want to delete this character?')) {
    await deleteCharacter(id);
  }
}

onMounted(() => {
  fetchUserCampaigns();
  fetchUserCharacters();
});
</script> 