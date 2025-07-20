import { createAuthClient } from 'better-auth/vue'

interface AuthUser {
  id: string
  name: string
  email: string
}

interface AuthResponse {
  user?: AuthUser
}

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    try {
      const headers = useRequestHeaders(['cookie'])
      const response = await $fetch<AuthResponse>('/api/auth/session', {
        headers
      })
      
      if (!response?.user) {
        return navigateTo('/auth/login')
      }
    } catch {
      return navigateTo('/auth/login')
    }
  } else {
    const authClient = createAuthClient({
      baseURL: window.location.origin
    })
    
    try {
      const { data } = await authClient.getSession()
      if (!data?.user) {
        return navigateTo('/auth/login')
      }
    } catch {
      return navigateTo('/auth/login')
    }
  }
})