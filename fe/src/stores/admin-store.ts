import { create } from 'zustand';
import { api } from '@/lib/api';
import { useAuthStore } from './auth-store';

export interface AdminStats {
  totalUsers: number;
  totalTrades: number;
  exposure: number;
  recentTrades: unknown[];
}

export interface PairConfig {
  id: string;
  symbol: string;
  payoutRate: number;
  isActive: boolean;
}

export interface RiskData {
  poolBalance: number;
  totalExposure: number;
  exposureByPair: { pair: string; amount: number }[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AdminState {
  isAuthenticated: boolean;
  userRole: 'admin' | 'operator' | 'viewer' | null;
  stats: AdminStats;
  pairConfigs: PairConfig[];
  riskData: RiskData;
  isLoading: boolean;

  fetchDashboard: () => Promise<void>;
  fetchPairs: () => Promise<void>;
  createPair: (symbol: string, payoutRate: number) => Promise<void>;
  updatePair: (id: string, data: { payoutRate?: number; isActive?: boolean }) => Promise<void>;
  pauseTrading: () => Promise<void>;
  resumeTrading: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  isAuthenticated: false,
  userRole: null,
  isLoading: false,

  stats: {
    totalUsers: 0,
    totalTrades: 0,
    exposure: 0,
    recentTrades: [],
  },

  pairConfigs: [],

  riskData: {
    poolBalance: 5000000,
    totalExposure: 0,
    exposureByPair: [],
    riskLevel: 'low',
  },

  fetchDashboard: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      const data = await api.get<AdminStats>('/admin/dashboard', token);
      set({
        stats: data,
        riskData: {
          ...get().riskData,
          totalExposure: Number(data.exposure),
          riskLevel: Number(data.exposure) > 100000 ? 'high' : Number(data.exposure) > 50000 ? 'medium' : 'low',
        },
      });
    } catch (e) {
      console.error('Failed to fetch dashboard', e);
    }
  },

  fetchPairs: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      const pairs = await api.get<PairConfig[]>('/admin/pairs', token);
      set({ pairConfigs: pairs });
    } catch (e) {
      console.error('Failed to fetch pairs', e);
    }
  },

  createPair: async (symbol, payoutRate) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    set({ isLoading: true });
    try {
      await api.post('/admin/pairs', { symbol, payoutRate }, token);
      await get().fetchPairs();
    } finally {
      set({ isLoading: false });
    }
  },

  updatePair: async (id, data) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    set({ isLoading: true });
    try {
      await api.patch(`/admin/pairs/${id}`, data, token);
      await get().fetchPairs();
    } finally {
      set({ isLoading: false });
    }
  },

  pauseTrading: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    await api.post('/admin/system/pause', {}, token);
    await get().fetchPairs();
  },

  resumeTrading: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    await api.post('/admin/system/resume', {}, token);
    await get().fetchPairs();
  },

  login: async (username, password) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (username === 'admin' && password === 'admin') {
      set({ isAuthenticated: true, userRole: 'admin' });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ isAuthenticated: false, userRole: null });
  },
}));
