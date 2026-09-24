import { NextApiRequest, NextApiResponse } from 'next';
import { Asset } from '@/types';
import { mockAssets } from '@/data/mockData';

// Helper function to filter and sort assets
const filterAndSortAssets = (
  assets: Asset[],
  category?: string,
  searchQuery?: string,
  sortBy?: string
) => {
  let result = [...assets];

  // Apply category filter
  if (category) {
    result = result.filter(asset => asset.category === category);
  }

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(asset =>
      asset.title.toLowerCase().includes(query) ||
      asset.description.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  switch (sortBy) {
    case 'recent':
      result = result.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
      break;
    case 'price-high':
      result = result.sort((a, b) => b.price.amount - a.price.amount);
      break;
    case 'price-low':
      result = result.sort((a, b) => a.price.amount - b.price.amount);
      break;
    case 'name':
      result = result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break;
  }

  return result;
};

// GET /api/assets/my-assets
export async function getMyAssets(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { category, search, sortBy, page = '1', limit = '10' } = req.query;

    // Filter and sort assets
    const filteredAssets = filterAndSortAssets(
      mockAssets,
      category as string,
      search as string,
      sortBy as string
    );

    // Pagination
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;
    const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

    res.status(200).json({
      assets: paginatedAssets,
      total: filteredAssets.length,
      page: pageNumber,
      totalPages: Math.ceil(filteredAssets.length / limitNumber)
    });
  } catch (error) {
    console.error('Error in getMyAssets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
}

// GET /api/assets/[id]
export async function getAssetById(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const asset = mockAssets.find(a => a.id === id);

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.status(200).json(asset);
  } catch (error) {
    console.error('Error in getAssetById:', error);
    res.status(500).json({ error: 'Failed to fetch asset details' });
  }
}

// PATCH /api/assets/[id]
export async function updateAsset(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const updates = req.body;

    const assetIndex = mockAssets.findIndex(a => a.id === id);
    if (assetIndex === -1) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Update asset
    const updatedAsset = {
      ...mockAssets[assetIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    mockAssets[assetIndex] = updatedAsset;

    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error('Error in updateAsset:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
}

// DELETE /api/assets/[id]
export async function deleteAsset(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const assetIndex = mockAssets.findIndex(a => a.id === id);

    if (assetIndex === -1) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    mockAssets.splice(assetIndex, 1);
    res.status(204).end();
  } catch (error) {
    console.error('Error in deleteAsset:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
}

// GET /api/assets/categories
export async function getCategories(req: NextApiRequest, res: NextApiResponse) {
  try {
    const categories = Array.from(new Set(mockAssets.map(asset => asset.category)));
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

// POST /api/assets/[id]/verify
export async function verifyAsset(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const assetIndex = mockAssets.findIndex(a => a.id === id);

    if (assetIndex === -1) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Update verification status
    const updatedAsset = {
      ...mockAssets[assetIndex],
      verified: true,
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'System Validator' // In real implementation, this would be the actual validator
    };
    mockAssets[assetIndex] = updatedAsset;

    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error('Error in verifyAsset:', error);
    res.status(500).json({ error: 'Failed to verify asset' });
  }
}

// GET /api/assets/[id]/verification-status
export async function getVerificationStatus(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const asset = mockAssets.find(a => a.id === id);

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.status(200).json({
      verified: asset.verified || false,
      verifiedAt: asset.verifiedAt,
      verifiedBy: asset.verifiedBy
    });
  } catch (error) {
    console.error('Error in getVerificationStatus:', error);
    res.status(500).json({ error: 'Failed to fetch verification status' });
  }
}