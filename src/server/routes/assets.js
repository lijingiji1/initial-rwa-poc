const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { validateAsset, validateAssetUpdate } = require('../middleware/validation');

// Get all assets with optional filters
router.get('/', (req, res) => {
  try {
    const {
      category,
      status,
      verified,
      priceRange,
      searchTerm,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (verified !== undefined) filters.verified = verified === 'true';
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      filters.priceRange = { min, max };
    }
    if (searchTerm) filters.searchTerm = searchTerm;

    let assets = db.getAllAssets(filters);

    // Sort assets
    assets.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'price') {
        aValue = a.price.amount;
        bValue = b.price.amount;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedAssets = assets.slice(startIndex, endIndex);

    res.json({
      assets: paginatedAssets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(assets.length / limit),
        totalItems: assets.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Get asset by ID
router.get('/:id', (req, res) => {
  try {
    const asset = db.getAssetById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

// Create new asset
router.post('/', validateAsset, (req, res) => {
  try {
    const assetData = {
      ...req.body,
      ownerId: req.user?.id || 'anonymous', // In real app, get from auth middleware
    };
    
    const asset = db.createAsset(assetData);
    res.status(201).json(asset);
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// Update asset
router.patch('/:id', validateAssetUpdate, (req, res) => {
  try {
    const asset = db.updateAsset(req.params.id, req.body);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

// Get asset validation status
router.get('/:id/validation', (req, res) => {
  try {
    const asset = db.getAssetById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json({
      validationId: asset.validation?.id || null,
      status: asset.validation?.status || 'pending',
      validatorId: asset.validation?.validatedBy || null,
      comments: asset.validation?.comments || null,
      timestamp: asset.validation?.validatedAt || asset.createdAt
    });
  } catch (error) {
    console.error('Error fetching validation status:', error);
    res.status(500).json({ error: 'Failed to fetch validation status' });
  }
});

// Request validation for asset
router.post('/:id/validation-requests', (req, res) => {
  try {
    const { validatorId } = req.body;
    
    if (!validatorId) {
      return res.status(400).json({ error: 'Validator ID is required' });
    }
    
    const validator = db.getValidatorById(validatorId);
    if (!validator) {
      return res.status(404).json({ error: 'Validator not found' });
    }
    
    const asset = db.getAssetById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    const validationRequest = db.createValidationRequest({
      assetId: req.params.id,
      validatorId,
      requesterId: req.user?.id || 'anonymous',
      status: 'pending'
    });
    
    res.status(201).json(validationRequest);
  } catch (error) {
    console.error('Error creating validation request:', error);
    res.status(500).json({ error: 'Failed to create validation request' });
  }
});

// Get validators for asset category
router.get('/:id/validators', (req, res) => {
  try {
    const asset = db.getAssetById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    const validators = db.getAllValidators({ 
      expertise: asset.category,
      availability: true 
    });
    
    res.json(validators);
  } catch (error) {
    console.error('Error fetching validators:', error);
    res.status(500).json({ error: 'Failed to fetch validators' });
  }
});

module.exports = router;
