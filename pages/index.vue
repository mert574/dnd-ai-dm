<template>
  <NuxtLayout name="default">
    <div class="space-y-8">
      <WelcomeSection />
      <AuthSection v-if="!auth.isAuthenticated" />
      <GameActions v-else />
      <GameDataPreview />
      <FeaturesGrid />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import WelcomeSection from '~/components/home/WelcomeSection.vue';
import AuthSection from '~/components/home/AuthSection.vue';
import GameActions from '~/components/home/GameActions.vue';
import GameDataPreview from '~/components/home/GameDataPreview.vue';
import FeaturesGrid from '~/components/home/FeaturesGrid.vue';

const auth = useAuthStore();
</script>