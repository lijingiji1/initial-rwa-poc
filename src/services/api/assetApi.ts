import { Asset, AssetCategory, ListingType, TokenizationType } from '@/types';

// API base URL - replace with your actual API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

// Asset API service
export const assetApi = {
  // Fetch all assets with optional filters
  getAssets: async (params?: {
    category?: AssetCategory;
    priceRange?: [number, number];
    verifiedOnly?: boolean;
    searchQuery?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'priceRange') {
            queryParams.append('minPrice', value[0].toString());
            queryParams.append('maxPrice', value[1].toString());
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/assets?${queryParams}`);
    return handleResponse(response);
  },

  // Get single asset by ID
  getAssetById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`);
    return handleResponse(response);
  },

  // Create new asset listing
  createAsset: async (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch(`${API_BASE_URL}/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(asset),
    });
    return handleResponse(response);
  },

  // Update existing asset
  updateAsset: async (id: string, asset: Partial<Asset>) => {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(asset),
    });
    return handleResponse(response);
  },

  // Delete asset
  deleteAsset: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Place bid on auction asset
  placeBid: async (assetId: string, bidAmount: number) => {
    const response = await fetch(`${API_BASE_URL}/assets/${assetId}/bids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: bidAmount }),
    });
    return handleResponse(response);
  },

  // Purchase asset (for fixed price listings)
  purchaseAsset: async (assetId: string, paymentMethod: 'crypto' | 'fiat') => {
    const response = await fetch(`${API_BASE_URL}/assets/${assetId}/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentMethod }),
    });
    return handleResponse(response);
  },

  // Get asset transaction history
  getAssetHistory: async (assetId: string) => {
    const response = await fetch(`${API_BASE_URL}/assets/${assetId}/history`);
    return handleResponse(response);
  },

  // Get user's assets
  getUserAssets: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/assets`);
    return handleResponse(response);
  },

  // Verify asset authenticity
  verifyAsset: async (assetId: string, validatorId: string) => {
    const response = await fetch(`${API_BASE_URL}/assets/${assetId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ validatorId }),
    });
    return handleResponse(response);
  },

  // Get asset categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return handleResponse(response);
  },

  // Search assets
  searchAssets: async (query: string) => {
    const response = await fetch(`${API_BASE_URL}/assets/search?q=${encodeURIComponent(query)}`);
    return handleResponse(response);
  },

  // Get featured assets
  getFeaturedAssets: async () => {
    const response = await fetch(`${API_BASE_URL}/assets/featured`);
    return handleResponse(response);
  },

  // Get similar assets
  getSimilarAssets: async (assetId: string) => {
    const response = await fetch(`${API_BASE_URL}/assets/${assetId}/similar`);
    return handleResponse(response);
  },
};