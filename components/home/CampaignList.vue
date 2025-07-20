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
</template>

<script setup lang="ts">
import type { Campaign } from '~/server/db/types';

interface Props {
  campaigns?: Campaign[];
  loading: boolean;
}

defineProps<Props>();
</script>