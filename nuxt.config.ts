// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  css: ['~/assets/css/tailwind.css'],
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],

  pinia: {
    storesDirs: ['./stores/**'],
  },

  app: {
    head: {
      title: 'D&D AI DM',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'D&D AI Dungeon Master - An AI-powered D&D gaming platform' }
      ]
    }
  },

  typescript: {
    strict: true,
    typeCheck: true
  },

  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },
  compatibilityDate: '2025-02-03'
})