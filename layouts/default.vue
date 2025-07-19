<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-gray-800 border-b border-red-900">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <NuxtLink to="/" class="text-2xl font-bold text-red-500">D&D AI DM</NuxtLink>

        <div class="flex items-center gap-4">
          <template v-if="auth.isAuthenticated">
            <span class="text-gray-300">{{ auth.user?.name }}</span>
            <button
              class="text-gray-300 hover:text-red-500 transition-colors"
              :disabled="isLoggingOut"
              @click="handleLogout"
            >
              {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
            </button>
          </template>
          <template v-else>
            <NuxtLink
              to="/auth/login"
              class="text-gray-300 hover:text-red-500 transition-colors"
            >
              Login
            </NuxtLink>
            <NuxtLink
              to="/auth/register"
              class="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign Up
            </NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-grow container mx-auto px-4 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 border-t border-red-900 mt-auto">
      <div class="container mx-auto px-4 py-4 text-center text-sm text-gray-400">
        <p>&copy; 2024 D&D AI DM</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();
const isLoggingOut = ref(false);

async function handleLogout() {
  if (isLoggingOut.value) return;
  
  try {
    isLoggingOut.value = true;
    
    // Call the logout API
    const response = await $fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.success) {
      throw new Error('Logout failed');
    }
    
    // Clear auth store state
    await auth.$reset();

    // Clear all auth-related cookies
    const authToken = useCookie('auth_token');
    const refreshToken = useCookie('refresh_token');

    authToken.value = null;
    refreshToken.value = null;

    localStorage.removeItem('auth');
    localStorage.removeItem('pinia');

    window.location.reload();
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    isLoggingOut.value = false;
  }
}

// Check auth state on mount
onMounted(() => {
  auth.fetchCurrentUser();
});
</script>