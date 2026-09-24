import { create } from 'zustand';
import { 
  Asset, 
  AssetDocument, 
  ListingType,
  TokenizationType,
  AssetValidation,
  AssetFilter
} from '@/types';
import { useUserStore } from './userStore';

interface AssetState {
  assets: Asset[];
  selectedAsset: Asset | null;
  isLoading: boolean;
  error: string | null;
  filter: AssetFilter;
  
  // Asset Management
  createAsset: (asset: Omit<Asset, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAsset: (id: string, asset: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  getAsset: (id: string) => Asset | null;
  
  // Asset Listing
  listAsset: (id: string, listingDetails: {
    price: number;
    currency: string;
    listingType: ListingType;
    tokenizationType: TokenizationType;
    minBid?: number;
    endDate?: Date;
  }) => Promise<void>;
  unlistAsset: (id: string) => Promise<void>;
  
  // Asset Validation
  submitForValidation: (id: string, documents: AssetDocument[]) => Promise<void>;
  validateAsset: (id: string, isValid: boolean, notes?: string) => Promise<void>;
  
  // Asset Search & Filter
  setFilter: (filter: Partial<AssetFilter>) => void;
  clearFilter: () => void;
  getFilteredAssets: () => Asset[];
  
  // Asset Transactions
  placeBid: (assetId: string, amount: number, currency: string) => Promise<void>;
  acceptBid: (assetId: string) => Promise<void>;
  buyAsset: (assetId: string) => Promise<void>;
  
  // Asset Stats
  updateAssetStats: (id: string, stats: { views?: number; likes?: number }) => Promise<void>;
  
  // New methods
  loadMoreAssets: () => Promise<void>;
  initialLoad: () => Promise<void>;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  selectedAsset: null,
  isLoading: false,
  error: null,
  filter: {
    category: undefined,
    priceRange: undefined,
    location: undefined,
    listingType: undefined,
    tokenizationType: undefined,
    status: undefined,
    verified: undefined
  },

  createAsset: async (asset) => {
    set({ isLoading: true, error: null });
    try {
      const user = useUserStore.getState().user;
      if (!user) throw new Error('User not authenticated');

    const newAsset: Asset = {
      ...asset,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        owner: {
          id: user.id,
          name: user.name
        },
      createdAt: new Date(),
      updatedAt: new Date(),
        views: 0,
        likes: 0,
        value: asset.price.amount
    };

      set((state) => ({
        assets: [...state.assets, newAsset],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateAsset: async (id, assetUpdate) => {
    set({ isLoading: true, error: null });
    try {
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.id === id
            ? { ...asset, ...assetUpdate, updatedAt: new Date() }
          : asset
      ),
    }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAsset: async (id) => {
    set({ isLoading: true, error: null });
    try {
    set((state) => ({
      assets: state.assets.filter((asset) => asset.id !== id),
        selectedAsset: state.selectedAsset?.id === id ? null : state.selectedAsset,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  getAsset: (id) => {
    return get().assets.find((asset) => asset.id === id) || null;
  },

  listAsset: async (id, listingDetails) => {
    set({ isLoading: true, error: null });
    try {
      const asset = get().getAsset(id);
      if (!asset) throw new Error('Asset not found');

      const updatedAsset: Asset = {
        ...asset,
        status: 'pending',
        listingType: listingDetails.listingType,
        tokenization: {
          type: listingDetails.tokenizationType,
          totalTokens: 100, // Default value
          availableTokens: 100,
          pricePerToken: listingDetails.price / 100
        },
        price: {
          amount: listingDetails.price,
          currency: listingDetails.currency
        },
        auctionEndTime: listingDetails.endDate?.toISOString(),
        updatedAt: new Date()
      };

      set((state) => ({
        assets: state.assets.map((a) => (a.id === id ? updatedAsset : a)),
        selectedAsset: state.selectedAsset?.id === id ? updatedAsset : state.selectedAsset,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  unlistAsset: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const asset = get().getAsset(id);
      if (!asset) throw new Error('Asset not found');

      const updatedAsset: Asset = {
        ...asset,
        status: 'pending',
        listingType: 'fixed',
        auctionEndTime: undefined,
        updatedAt: new Date()
      };

      set((state) => ({
        assets: state.assets.map((a) => (a.id === id ? updatedAsset : a)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  submitForValidation: async (id, documents) => {
    set({ isLoading: true, error: null });
    try {
      const asset = get().getAsset(id);
      if (!asset) throw new Error('Asset not found');

      const updatedAsset: Asset = {
        ...asset,
        status: 'pending',
        documents: [...(asset.documents || []), ...documents],
        updatedAt: new Date()
      };

      set((state) => ({
        assets: state.assets.map((a) => (a.id === id ? updatedAsset : a)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  validateAsset: async (id, isValid, notes) => {
    set({ isLoading: true, error: null });
    try {
      const asset = get().getAsset(id);
      if (!asset) throw new Error('Asset not found');

      const validation: AssetValidation = {
        status: isValid ? 'validated' : 'rejected',
        validatedAt: new Date(),
        comments: notes,
      };

      const updatedAsset: Asset = {
        ...asset,
        status: isValid ? 'validated' : 'rejected',
        isVerified: isValid,
        validation,
        updatedAt: new Date()
      };

      set((state) => ({
        assets: state.assets.map((a) => (a.id === id ? updatedAsset : a)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  setFilter: (newFilter) => {
    set((state) => ({
      filter: { ...state.filter, ...newFilter },
    }));
  },

  clearFilter: () => {
    set({
      filter: {
        category: undefined,
        priceRange: undefined,
        location: undefined,
        listingType: undefined,
        tokenizationType: undefined,
        status: undefined,
        verified: undefined
      },
    });
  },

  getFilteredAssets: () => {
    const { assets, filter } = get();
    return assets.filter((asset) => {
      if (filter.category && asset.category !== filter.category) return false;
      if (filter.priceRange && (asset.price.amount < filter.priceRange[0] || asset.price.amount > filter.priceRange[1])) return false;
      if (filter.location && asset.location?.country !== filter.location) return false;
      if (filter.listingType && asset.listingType !== filter.listingType) return false;
      if (filter.tokenizationType && asset.tokenization.type !== filter.tokenizationType) return false;
      if (filter.status && asset.status !== filter.status) return false;
      if (filter.verified !== undefined && asset.isVerified !== filter.verified) return false;
      return true;
    });
  },

  placeBid: async (assetId, amount, currency) => {
    set({ isLoading: true, error: null });
    try {
      const user = useUserStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const asset = get().getAsset(assetId);
      if (!asset) throw new Error('Asset not found');
      if (asset.listingType !== 'auction') throw new Error('Asset is not in auction');

      // Update asset price
      const updatedAsset: Asset = {
        ...asset,
        price: {
          amount,
          currency
        },
        updatedAt: new Date()
      };

      set((state) => ({
        assets: state.assets.map((a) => (a.id === assetId ? updatedAsset : a)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  acceptBid: async (assetId) => {
    set({ isLoading: true, error: null });
    try {
      const user = useUserStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const asset = get().getAsset(assetId);
      if (!asset) throw new Error('Asset not found');
      if (asset.listingType !== 'auction') throw new Error('Asset is not in auction');

      // Update asset status and ownership
      const updatedAsset: Asset = {
        ...asset,
        status: 'validated',
        updatedAt: new Date()
      };

      set((state) => ({
        assets: state.assets.map((a) => (a.id === assetId ? updatedAsset : a)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  buyAsset: async (assetId) => {
    set({ isLoading: true, error: null });
    try {
      const user = useUserStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const asset = get().getAsset(assetId);
      if (!asset) throw new Error('Asset not found');
      if (asset.listingType !== 'fixed') throw new Error('Asset is not for sale');

      const updatedAsset: Asset = {
        ...asset,
        status: 'validated',
        owner: {
          id: user.id,
          name: user.name
        },
        updatedAt: new Date()
      };

      set((state) => ({
        assets: state.assets.map((a) => (a.id === assetId ? updatedAsset : a)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateAssetStats: async (id, stats) => {
    set({ isLoading: true, error: null });
    try {
      const asset = get().getAsset(id);
      if (!asset) throw new Error('Asset not found');

      const updatedAsset: Asset = {
        ...asset,
        views: stats.views ?? asset.views,
        likes: stats.likes ?? asset.likes,
        updatedAt: new Date()
      };

      set((state) => ({
        assets: state.assets.map((a) => (a.id === id ? updatedAsset : a)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  loadMoreAssets: async () => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set((state) => ({
        assets: [...state.assets, /* Add more assets here */],
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to load more assets', isLoading: false });
    }
  },

  initialLoad: async () => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({
        assets: [], // Add initial assets here
        isLoading: false
      });
    } catch (error) {
      set({ error: 'Failed to load assets', isLoading: false });
    }
  }
}));