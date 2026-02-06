import { create } from 'zustand';
import { api } from '@/lib/api';


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
    try {
      const data = await api.get<AdminStats>('/admin/dashboard');
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
    try {
      const pairs = await api.get<PairConfig[]>('/admin/pairs');
      set({ pairConfigs: pairs });
    } catch (e) {
      console.error('Failed to fetch pairs', e);
    }
  },

  createPair: async (symbol, payoutRate) => {
    set({ isLoading: true });
    try {
      await api.post('/admin/pairs', { symbol, payoutRate });
      await get().fetchPairs();
    } finally {
      set({ isLoading: false });
    }
  },

  updatePair: async (id, data) => {
    set({ isLoading: true });
    try {
      await api.patch(`/admin/pairs/${id}`, data);
      await get().fetchPairs();
    } finally {
      set({ isLoading: false });
    }
  },

  pauseTrading: async () => {
    await api.post('/admin/system/pause', {});
    await get().fetchPairs();
  },

  resumeTrading: async () => {
    await api.post('/admin/system/resume', {});
    await get().fetchPairs();
  },

  login: async (email, password) => {
    try {
      const response = await api.post<{
        admin: { id: string; email: string; role: string };
      }>('/admin-auth/login', { email, password });

      set({
        isAuthenticated: true,
        userRole: response.admin.role as 'admin' | 'operator' | 'viewer',
      });
      return true;
    } catch (error) {
      console.error('Admin login failed:', error);
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post('/admin-auth/logout', {});
    } catch (e) {
      console.error('Logout error', e);
    }
    set({ isAuthenticated: false, userRole: null });
  },
}));
