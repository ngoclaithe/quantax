import { create } from 'zustand';
import { api } from '@/lib/api';

export interface AdminBankAccount {
    id: string;
    accountName: string;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    isActive: boolean;
}

interface AdminWalletState {
    banks: AdminBankAccount[];
    isLoading: boolean;
    fetchBanks: () => Promise<void>;
    createBank: (data: Omit<AdminBankAccount, 'id' | 'isActive'>) => Promise<void>;
    updateBank: (id: string, data: Partial<AdminBankAccount>) => Promise<void>;
    deleteBank: (id: string) => Promise<void>;
}

export const useAdminWalletStore = create<AdminWalletState>((set, get) => ({
    banks: [],
    isLoading: false,

    fetchBanks: async () => {
        set({ isLoading: true });
        try {
            const banks = await api.get<AdminBankAccount[]>('/admin/banks');
            set({ banks });
        } catch (e) {
            console.error('Failed to fetch admin banks', e);
        } finally {
            set({ isLoading: false });
        }
    },

    createBank: async (data) => {
        try {
            await api.post('/admin/banks', data);
            await get().fetchBanks();
        } catch (e) {
            console.error('Failed to create bank', e);
            throw e;
        }
    },

    updateBank: async (id, data) => {
        try {
            await api.put(`/admin/banks/${id}`, data);
            await get().fetchBanks();
        } catch (e) {
            console.error('Failed to update bank', e);
            throw e;
        }
    },

    deleteBank: async (id) => {
        try {
            await api.delete(`/admin/banks/${id}`);
            await get().fetchBanks();
        } catch (e) {
            console.error('Failed to delete bank', e);
            throw e;
        }
    },
}));
