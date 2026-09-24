import { Asset } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface AssetFilter {
  category?: string;
  searchQuery?: string;
  sortBy?: 'recent' | 'price-high' | 'price-low' | 'name';
  page?: number;
  limit?: number;
}

export interface AssetResponse {
  assets: Asset[];
  total: number;
  page: number;
  totalPages: number;
}

export const assetService = {
  // Get user's assets with filtering and pagination
  async getUserAssets(filter: AssetFilter = {}): Promise<AssetResponse> {
    const queryParams = new URLSearchParams();
    if (filter.category) queryParams.append('category', filter.category);
    if (filter.searchQuery) queryParams.append('search', filter.searchQuery);
    if (filter.sortBy) queryParams.append('sortBy', filter.sortBy);
    if (filter.page) queryParams.append('page', filter.page.toString());
    if (filter.limit) queryParams.append('limit', filter.limit.toString());

    const response = await fetch(`${API_BASE_URL}/assets/my-assets?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch assets');
    return response.json();
  },

  // Get single asset details
  async getAssetById(id: string): Promise<Asset> {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`);
    if (!response.ok) throw new Error('Failed to fetch asset details');
    return response.json();
  },

  // Update asset details
  async updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update asset');
    return response.json();
  },

  // Delete an asset
  async deleteAsset(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete asset');
  },

  // Get asset categories
  async getCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/assets/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  // Verify asset
  async verifyAsset(id: string): Promise<Asset> {
    const response = await fetch(`${API_BASE_URL}/assets/${id}/verify`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to verify asset');
    return response.json();
  },

  // Get asset verification status
  async getVerificationStatus(id: string): Promise<{
    verified: boolean;
    verifiedAt?: string;
    verifiedBy?: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/assets/${id}/verification-status`);
    if (!response.ok) throw new Error('Failed to fetch verification status');
    return response.json();
  },
};