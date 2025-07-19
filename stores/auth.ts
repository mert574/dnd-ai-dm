import { defineStore } from 'pinia'
import { createAuthClient } from 'better-auth/vue'

interface User {
    id: string
    name: string
    email: string
}

interface AuthState {
    user: User | null
    loading: boolean
    error: string | null
}

const authClient = createAuthClient({
    baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
})

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        loading: false,
        error: null
    }),

    persist: {
        pick: ['user']
    },

    getters: {
        isAuthenticated: state => !!state.user,
        isLoading: state => state.loading
    },

    actions: {
        async login(email: string, password: string) {
            this.loading = true
            this.error = null

            try {
                const { data, error } = await authClient.signIn.email({
                    email,
                    password
                })

                if (error) {
                    this.error = error.message || 'Login failed'
                    throw new Error(error.message || 'Login failed')
                }

                if (data?.user) {
                    this.user = {
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email
                    }
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to login'
                this.error = errorMessage
                throw error
            } finally {
                this.loading = false
            }
        },

        async register(name: string, email: string, password: string) {
            this.loading = true
            this.error = null

            try {
                const { data, error } = await authClient.signUp.email({
                    name,
                    email,
                    password
                })

                if (error) {
                    this.error = error.message || 'Registration failed'
                    throw new Error(error.message || 'Registration failed')
                }

                if (data?.user) {
                    this.user = {
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email
                    }
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to register'
                this.error = errorMessage
                throw error
            } finally {
                this.loading = false
            }
        },

        async logout() {
            this.loading = true
            this.error = null

            try {
                const { error } = await authClient.signOut()
                
                if (error) {
                    this.error = error.message || 'Logout failed'
                    throw new Error(error.message || 'Logout failed')
                }

                this.user = null
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to logout'
                this.error = errorMessage
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchCurrentUser() {
            if (this.loading) return
            this.loading = true
            this.error = null

            try {
                const { data } = await authClient.getSession()
                
                if (data?.user) {
                    this.user = {
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email
                    }
                } else {
                    this.user = null
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user'
                this.error = errorMessage
                this.user = null
            } finally {
                this.loading = false
            }
        },

        async initAuth() {
            await this.fetchCurrentUser()
        }
    }
}) 