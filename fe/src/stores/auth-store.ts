import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
    id: string;
    email: string;
    nickname?: string;
    role: string;
    balance?: number;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isHydrated: boolean;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, nickname: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
    setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isHydrated: false,

            loginWithEmail: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const res = await api.post<{ user: User }>('/auth/login', {
                        email,
                        password,
                    });
                    set({
                        user: res.user,
                        isAuthenticated: true
                    });
                } finally {
                    set({ isLoading: false });
                }
            },

            register: async (email: string, password: string, nickname: string) => {
                set({ isLoading: true });
                try {
                    const res = await api.post<{ user: User }>('/auth/register', {
                        email,
                        password,
                        nickname,
                    });
                    set({
                        user: res.user,
                        isAuthenticated: true
                    });
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: async () => {
                try {
                    await api.post('/auth/logout', {});
                } catch (e) {
                    console.error('Logout failed', e);
                }
                set({ user: null, isAuthenticated: false });
            },

            fetchUser: async () => {
                // Try fetching user to see if cookie is valid
                set({ isLoading: true });
                try {
                    const user = await api.get<User>('/users/me');
                    set({ user, isAuthenticated: true });
                } catch {
                    set({ user: null, isAuthenticated: false });
                } finally {
                    set({ isLoading: false });
                }
            },

            setHydrated: (hydrated: boolean) => {
                set({ isHydrated: hydrated });
            },
        }),
        {
            name: 'quantax-auth',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHydrated(true);
                    if (state.isAuthenticated) {
                        state.fetchUser();
                    }
                }
            },
        }
    )
);
