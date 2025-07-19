import { createPersistedState } from 'pinia-plugin-persistedstate'
import type { Pinia } from 'pinia'

export default defineNuxtPlugin(nuxtApp => {
  (nuxtApp.$pinia as Pinia).use(createPersistedState({
    storage: localStorage
  }))
})