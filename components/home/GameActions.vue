<template>
  <div class="space-y-8">
    <!-- Action Buttons -->
    <div class="flex gap-4">
      <button class="bg-red-700 hover:bg-red-800 text-white px-8 py-4 rounded-lg font-medium transition-colors">
        Create New Campaign
      </button>
      <button class="bg-stone-600 hover:bg-stone-700 text-white px-8 py-4 rounded-lg font-medium transition-colors">
        Join Campaign
      </button>
    </div>

    <!-- Recent Campaigns -->
    <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h3 class="text-xl font-bold text-red-500 mb-4">Recent Campaigns</h3>
      <p v-if="!campaigns?.length" class="text-gray-400">
        No recent campaigns found. Create a new campaign to get started!
      </p>
      <div v-else class="space-y-4">
        <!-- Campaign cards will go here -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const campaigns = ref([]);
</script> 