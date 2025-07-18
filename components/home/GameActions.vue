<template>
  <div class="space-y-8">
    <!-- Action Buttons -->
    <div class="flex gap-4">
      <button class="bg-red-700 hover:bg-red-800 text-white px-8 py-4 rounded-lg font-medium transition-colors">
        Create New Session
      </button>
      <button class="bg-stone-600 hover:bg-stone-700 text-white px-8 py-4 rounded-lg font-medium transition-colors">
        Join Session
      </button>
    </div>

    <!-- Recent Sessions -->
    <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h3 class="text-xl font-bold text-red-500 mb-4">Recent Sessions</h3>
      <p v-if="!sessions?.length" class="text-gray-400">
        No recent sessions found. Create a new session to get started!
      </p>
      <div v-else class="space-y-4">
        <!-- Session cards will go here -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const sessions = ref([]);
</script> 