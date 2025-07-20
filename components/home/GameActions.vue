<template>
  <div class="space-y-8">
    <!-- Action Buttons -->
    <div class="flex gap-4">
      <button 
        :disabled="loading"
        class="bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-medium transition-colors"
        @click="showCreateModal = true"
      >
        Create New Campaign
      </button>
      <button 
        :disabled="loading"
        class="bg-stone-600 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-medium transition-colors"
        @click="showJoinModal = true"
      >
        Join Campaign
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="bg-red-900/50 border border-red-700 rounded-lg p-4">
      <p class="text-red-300">{{ error }}</p>
    </div>

    <!-- Recent Campaigns -->
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
            <div>
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
            </div>
            <button 
              v-if="campaign.status === 'active'"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Enter Campaign
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Campaign Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <h3 class="text-xl font-bold text-white mb-4">Create New Campaign</h3>
        <form @submit.prevent="handleCreateCampaign">
          <div class="mb-4">
            <label class="block text-gray-300 text-sm font-medium mb-2">
              Campaign Name
            </label>
            <input 
              v-model="createForm.name"
              type="text"
              required
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
              placeholder="Enter campaign name"
            >
          </div>
          <div class="flex gap-3">
            <button 
              type="submit"
              :disabled="loading || !createForm.name.trim()"
              class="flex-1 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Create Campaign
            </button>
            <button 
              type="button"
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
              @click="closeCreateModal"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Join Campaign Modal -->
    <div v-if="showJoinModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <h3 class="text-xl font-bold text-white mb-4">Join Campaign</h3>
        <form @submit.prevent="handleJoinCampaign">
          <div class="mb-4">
            <label class="block text-gray-300 text-sm font-medium mb-2">
              Campaign Code
            </label>
            <input 
              v-model="joinForm.campaignCode"
              type="text"
              required
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
              placeholder="Enter campaign code"
            >
          </div>
          <div class="mb-4">
            <label class="block text-gray-300 text-sm font-medium mb-2">
              Character ID
            </label>
            <input 
              v-model.number="joinForm.characterId"
              type="number"
              required
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
              placeholder="Enter character ID"
            >
          </div>
          <div class="flex gap-3">
            <button 
              type="submit"
              :disabled="loading || !joinForm.campaignCode.trim() || !joinForm.characterId"
              class="flex-1 bg-stone-600 hover:bg-stone-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Join Campaign
            </button>
            <button 
              type="button"
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
              @click="closeJoinModal"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { createCampaign, joinCampaign, fetchUserCampaigns, campaigns, loading, error } = useCampaign();

const showCreateModal = ref(false);
const showJoinModal = ref(false);

const createForm = ref({
  name: ''
});

const joinForm = ref({
  campaignCode: '',
  characterId: 0
});

async function handleCreateCampaign() {
  const campaign = await createCampaign(createForm.value);
  if (campaign) {
    closeCreateModal();
  }
}

async function handleJoinCampaign() {
  const result = await joinCampaign(joinForm.value);
  if (result) {
    closeJoinModal();
  }
}

function closeCreateModal() {
  showCreateModal.value = false;
  createForm.value.name = '';
}

function closeJoinModal() {
  showJoinModal.value = false;
  joinForm.value.campaignCode = '';
  joinForm.value.characterId = 0;
}

onMounted(() => {
  fetchUserCampaigns();
});
</script> 