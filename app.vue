<template>
  <div class="min-h-screen bg-gray-900">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();

// Try to restore auth state and set up refresh timer
onMounted(() => {
  auth.initAuth();
  auth.fetchCurrentUser();
});
</script>
