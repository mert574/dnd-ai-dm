<template>
  <div class="flex flex-col items-center gap-4">
    <p class="text-gray-300 text-lg text-center">
      Sign in or create an account to start your adventure
    </p>
    <div class="flex gap-4">
      <NuxtLink
        to="/auth/login"
        class="bg-red-700 hover:bg-red-800 text-white px-8 py-4 rounded-lg font-medium transition-colors"
      >
        Sign In
      </NuxtLink>
      <NuxtLink
        to="/auth/register"
        class="bg-stone-600 hover:bg-stone-700 text-white px-8 py-4 rounded-lg font-medium transition-colors"
      >
        Create Account
      </NuxtLink>
    </div>
  </div>
</template> 