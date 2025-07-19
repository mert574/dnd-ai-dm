import { defineStore } from 'pinia';

interface User {
    id: number;
    name: string;
    email: string;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    backgroundLoading: boolean;
    error: string | null;
    tokenExpiresAt: number | null;
    refreshTimer: NodeJS.Timeout | null;
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        loading: false,
        backgroundLoading: false,
        error: null,
        tokenExpiresAt: null,
        refreshTimer: null
    }),

    getters: {
        isAuthenticated: state => !!state.user,
        isLoading: state => state.loading,
        isBackgroundLoading: state => state.backgroundLoading
    },

    actions: {
        setTokenExpiration(expiresIn: number) {
            this.tokenExpiresAt = Date.now() + expiresIn;
            
            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer);
            }

            const refreshDelay = expiresIn - 60_000;
            if (refreshDelay > 0) {
                this.refreshTimer = setTimeout(async () => {
                    this.backgroundLoading = true;
                    try {
                        await this.refreshToken();
                    } finally {
                        this.backgroundLoading = false;
                    }
                }, refreshDelay);
            }
        },

        clearAuth() {
            this.user = null;
            this.tokenExpiresAt = null;
            this.backgroundLoading = false;
            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer);
                this.refreshTimer = null;
            }
        },

        initAuth() {
            if (this.user && this.tokenExpiresAt) {
                const now = Date.now();
                if (this.tokenExpiresAt > now) {
                    this.setTokenExpiration(this.tokenExpiresAt - now);
                } else {
                    this.backgroundLoading = true;
                    this.refreshToken()
                        .catch(() => this.clearAuth())
                        .finally(() => {
                            this.backgroundLoading = false;
                        });
                }
            }
        },

        async login(email: string, password: string) {
            this.loading = true;
            this.error = null;

            try {
                const response = await $fetch<{ 
                    success: boolean; 
                    data: { 
                        user: User; 
                        token: string;
                        refreshToken: string;
                        expiresIn: number;
                    } 
                }>('/api/auth/login', {
                    method: 'POST',
                    body: { email, password }
                });

                if (response.success) {
                    this.user = response.data.user;
                    this.setTokenExpiration(response.data.expiresIn);
                }
            } catch (error: any) {
                this.error = error.data?.error?.message ?? 'Failed to login';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async register(name: string, email: string, password: string) {
            this.loading = true;
            this.error = null;

            try {
                const response = await $fetch<{ 
                    success: boolean; 
                    data: { 
                        user: User; 
                        token: string;
                        refreshToken: string;
                        expiresIn: number;
                    } 
                }>('/api/auth/register', {
                    method: 'POST',
                    body: { name, email, password }
                });

                if (response.success) {
                    this.user = response.data.user;
                    this.setTokenExpiration(response.data.expiresIn);
                }
            } catch (error: any) {
                this.error = error.data?.error?.message ?? 'Failed to register';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            this.loading = true;
            this.error = null;

            try {
                await $fetch('/api/auth/logout', { method: 'POST' });
                this.clearAuth();
            } catch (error: any) {
                this.error = error.data?.error?.message ?? 'Failed to logout';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchCurrentUser() {
            if (this.loading) return;
            this.loading = true;
            this.error = null;

            try {
                const response = await $fetch<{ success: boolean; data: User }>('/api/auth/me');
                if (response.success) {
                    this.user = response.data;
                }
            } catch (error: any) {
                if (error.status === 401) {
                    try {
                        const refreshed = await this.refreshToken();
                        if (refreshed) {
                            const response = await $fetch<{ success: boolean; data: User }>('/api/auth/me');
                            if (response.success) {
                                this.user = response.data;
                            }
                        } else {
                            this.clearAuth();
                        }
                    } catch {
                        this.error = 'Session expired. Please login again.';
                        this.clearAuth();
                    }
                } else {
                    this.error = error.data?.error?.message ?? 'Failed to fetch user';
                    this.clearAuth();
                }
            } finally {
                this.loading = false;
            }
        },

        async refreshToken() {
            try {
                const response = await $fetch<{ 
                    success: boolean; 
                    data: { 
                        token: string; 
                        expiresIn: number;
                    } 
                }>('/api/auth/refresh', {
                    method: 'POST'
                });

                if (response.success) {
                    this.setTokenExpiration(response.data.expiresIn);
                    return true;
                }
                return false;
            } catch (error) {
                this.clearAuth();
                throw error;
            }
        }
    },
}); 