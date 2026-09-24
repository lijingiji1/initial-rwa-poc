import { create } from 'zustand';
import { User, KYCStatus, AssetDocument, UserRole } from '@/types';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Authentication
  login: (email: string, password: string) => Promise<void>;
  loginWithWallet: (address: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  
  // KYC
  submitKYC: (documents: {
    idVerification: File;
    addressProof: File;
    additionalDocs?: File[];
  }) => Promise<void>;
  getKYCStatus: () => KYCStatus;
  
  // Profile Management
  updateProfile: (profile: Partial<User['profile']>) => Promise<void>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  connectWallet: (address: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  linkBankAccount: (accountDetails: {
    accountNumber: string;
    routingNumber: string;
    accountType: string;
  }) => Promise<void>;
  
  // Role Management
  hasRole: (role: UserRole) => boolean;
  addRole: (role: UserRole) => Promise<void>;
  
  // Stats
  updateStats: (stats: Partial<User['stats']>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement actual API call
      const mockUser: User = {
        id: '1',
        email,
        name: 'John Doe',
        roles: ['buyer'],
        kyc: {
          status: 'pending',
          documents: {},
        },
        wallet: {
          address: '',
          balance: 0,
          currency: 'USD',
        },
        stats: {
          assetsListed: 0,
          assetsSold: 0,
          assetsBought: 0,
          totalValue: 0,
          rating: 0,
          reviews: 0,
        },
        preferences: {
          notifications: true,
          newsletter: true,
          twoFactorEnabled: false,
          categories: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set({ user: mockUser });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithWallet: async (address: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement wallet authentication
      const mockUser: User = {
        id: '1',
        email: `${address.slice(0, 6)}...${address.slice(-4)}@wallet.eth`,
        name: `${address.slice(0, 6)}...${address.slice(-4)}`,
        roles: ['buyer'],
        kyc: {
          status: 'pending',
          documents: {},
        },
        wallet: {
          address,
          balance: 0,
          currency: 'ETH',
        },
        stats: {
          assetsListed: 0,
          assetsSold: 0,
          assetsBought: 0,
          totalValue: 0,
          rating: 0,
          reviews: 0,
        },
        preferences: {
          notifications: true,
          newsletter: true,
          twoFactorEnabled: false,
          categories: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set({ user: mockUser });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement actual logout
      set({ user: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement actual registration
      const mockUser: User = {
        id: '1',
        email,
        name,
        roles: ['buyer'],
        kyc: {
          status: 'pending',
          documents: {},
        },
        wallet: {
          address: '',
          balance: 0,
          currency: 'USD',
        },
        stats: {
          assetsListed: 0,
          assetsSold: 0,
          assetsBought: 0,
          totalValue: 0,
          rating: 0,
          reviews: 0,
        },
        preferences: {
          notifications: true,
          newsletter: true,
          twoFactorEnabled: false,
          categories: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set({ user: mockUser });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  submitKYC: async (documents) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement KYC submission
      const user = get().user;
      if (!user) throw new Error('User not found');

      set({
        user: {
          ...user,
          kyc: {
            ...user.kyc,
            status: 'pending',
          },
        },
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  getKYCStatus: () => {
    const user = get().user;
    return user?.kyc.status || 'pending';
  },

  updateProfile: async (profile) => {
    set({ isLoading: true, error: null });
    try {
      const user = get().user;
      if (!user) throw new Error('User not found');

      set({
        user: {
          ...user,
          profile: {
            ...user.profile,
            ...profile,
          },
        },
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updatePreferences: async (preferences) => {
    set({ isLoading: true, error: null });
    try {
      const user = get().user;
      if (!user) throw new Error('User not found');

      set({
        user: {
          ...user,
          preferences: {
            ...user.preferences,
            ...preferences,
          },
        },
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  connectWallet: async (address: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = get().user;
      if (!user) throw new Error('User not found');

      set({
        user: {
          ...user,
          wallet: {
            ...user.wallet,
            address,
          },
        },
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  disconnectWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = get().user;
      if (!user) throw new Error('User not found');

      set({
        user: {
          ...user,
          wallet: {
            ...user.wallet,
            address: '',
          },
        },
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  linkBankAccount: async (accountDetails) => {
    set({ isLoading: true, error: null });
    try {
      const user = get().user;
      if (!user) throw new Error('User not found');

      set({
        user: {
          ...user,
          bankAccount: {
            verified: false,
            last4: accountDetails.accountNumber.slice(-4),
            type: accountDetails.accountType,
          },
        },
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  hasRole: (role: UserRole) => {
    const user = get().user;
    return user?.roles.includes(role) || false;
  },

  addRole: async (role: UserRole) => {
    set({ isLoading: true, error: null });
    try {
      const user = get().user;
      if (!user) throw new Error('User not found');

      if (!user.roles.includes(role)) {
        set({
          user: {
            ...user,
            roles: [...user.roles, role],
          },
        });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateStats: async (stats) => {
    set({ isLoading: true, error: null });
    try {
      const user = get().user;
      if (!user) throw new Error('User not found');

      set({
        user: {
          ...user,
          stats: {
            ...user.stats,
            ...stats,
          },
        },
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
})); 