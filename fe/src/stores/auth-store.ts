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
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isHydrated: boolean;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, nickname: string) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
    setToken: (token: string | null) => void;
    setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isHydrated: false,

            loginWithEmail: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const res = await api.post<{ accessToken: string; user: User }>('/auth/login', {
                        email,
                        password,
                    });
                    set({
                        token: res.accessToken,
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
                    const res = await api.post<{ accessToken: string; user: User }>('/auth/register', {
                        email,
                        password,
                        nickname,
                    });
                    set({
                        token: res.accessToken,
                        user: res.user,
                        isAuthenticated: true
                    });
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: () => {
                set({ token: null, user: null, isAuthenticated: false });
            },

            fetchUser: async () => {
                const token = get().token;
                if (!token) return;
                set({ isLoading: true });
                try {
                    const user = await api.get<User>('/users/me', token);
                    set({ user, isAuthenticated: true });
                } catch {
                    set({ token: null, user: null, isAuthenticated: false });
                } finally {
                    set({ isLoading: false });
                }
            },

            setToken: (token: string | null) => {
                set({ token, isAuthenticated: !!token });
            },

            setHydrated: (hydrated: boolean) => {
                set({ isHydrated: hydrated });
            },
        }),
        {
            name: 'quantax-auth',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHydrated(true);
                    if (state.token) {
                        state.fetchUser();
                    }
                }
            },
        }
    )
);
