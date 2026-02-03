import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
    id: string;
    walletAddress: string;
    nickname?: string;
    role: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (walletAddress: string, signature: string) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (walletAddress: string, signature: string) => {
                set({ isLoading: true });
                try {
                    const res = await api.post<{ accessToken: string }>('/auth/wallet/login', {
                        walletAddress,
                        signature,
                    });
                    set({ token: res.accessToken, isAuthenticated: true });
                    await get().fetchUser();
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
                try {
                    const user = await api.get<User>('/users/me', token);
                    set({ user });
                } catch {
                    set({ token: null, user: null, isAuthenticated: false });
                }
            },
        }),
        {
            name: 'auth-store',
            partialize: (state) => ({ token: state.token }),
        }
    )
);
