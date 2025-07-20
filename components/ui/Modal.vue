<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
      <h3 class="text-xl font-bold text-white mb-4">{{ title }}</h3>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
  title: string;
}

defineProps<Props>();
</script>