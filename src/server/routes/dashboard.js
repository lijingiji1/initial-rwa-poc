const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Get dashboard data
router.get('/', (req, res) => {
  try {
    const { searchQuery, filterType } = req.query;
    
    // Get all assets
    let assets = Array.from(db.assets.values());
    
    // Apply search filter
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      assets = assets.filter(asset => 
        asset.title.toLowerCase().includes(term) ||
        asset.description.toLowerCase().includes(term)
      );
    }
    
    // Apply type filter
    if (filterType) {
      assets = assets.filter(asset => asset.category === filterType);
    }
    
    // Calculate stats
    const stats = {
      totalAssets: db.assets.size,
      totalValue: Array.from(db.assets.values()).reduce((sum, asset) => sum + asset.value, 0),
      pendingValidations: Array.from(db.assets.values()).filter(asset => asset.status === 'pending').length,
      actionRequired: Array.from(db.assets.values()).filter(asset => asset.status === 'action_required').length
    };
    
    res.json({
      stats,
      assets: assets.slice(0, 10) // Return first 10 for dashboard preview
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get pending validations
router.get('/pending-validations', (req, res) => {
  try {
    const pendingAssets = Array.from(db.assets.values())
      .filter(asset => asset.status === 'pending')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(pendingAssets);
  } catch (error) {
    console.error('Error fetching pending validations:', error);
    res.status(500).json({ error: 'Failed to fetch pending validations' });
  }
});

// Get assets requiring action
router.get('/action-required', (req, res) => {
  try {
    const actionRequiredAssets = Array.from(db.assets.values())
      .filter(asset => asset.status === 'action_required')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(actionRequiredAssets);
  } catch (error) {
    console.error('Error fetching action required assets:', error);
    res.status(500).json({ error: 'Failed to fetch action required assets' });
  }
});

// Get total portfolio value
router.get('/total-value', (req, res) => {
  try {
    const totalValue = Array.from(db.assets.values())
      .reduce((sum, asset) => sum + asset.value, 0);
    
    res.json({ totalValue });
  } catch (error) {
    console.error('Error fetching total value:', error);
    res.status(500).json({ error: 'Failed to fetch total value' });
  }
});

// Get user portfolio summary
router.get('/portfolio/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's assets
    const userAssets = Array.from(db.assets.values())
      .filter(asset => asset.owner.id === userId);
    
    // Get user's transactions
    const userTransactions = Array.from(db.transactions.values())
      .filter(transaction => 
        transaction.buyerId === userId || transaction.sellerId === userId
      );
    
    // Calculate portfolio metrics
    const portfolioValue = userAssets.reduce((sum, asset) => sum + asset.value, 0);
    const totalInvested = userTransactions
      .filter(t => t.buyerId === userId && t.status === 'completed')
      .reduce((sum, t) => sum + t.totalAmount, 0);
    
    const totalEarned = userTransactions
      .filter(t => t.sellerId === userId && t.status === 'completed')
      .reduce((sum, t) => sum + t.totalAmount, 0);
    
    res.json({
      portfolioValue,
      totalInvested,
      totalEarned,
      assetCount: userAssets.length,
      transactionCount: userTransactions.length,
      assets: userAssets,
      recentTransactions: userTransactions.slice(0, 5)
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Get market statistics
router.get('/market-stats', (req, res) => {
  try {
    const assets = Array.from(db.assets.values());
    
    // Calculate market statistics
    const totalMarketValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    const averageAssetValue = totalMarketValue / assets.length;
    
    // Category breakdown
    const categoryStats = {};
    assets.forEach(asset => {
      if (!categoryStats[asset.category]) {
        categoryStats[asset.category] = {
          count: 0,
          totalValue: 0,
          averageValue: 0
        };
      }
      categoryStats[asset.category].count++;
      categoryStats[asset.category].totalValue += asset.value;
    });
    
    // Calculate averages
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.averageValue = stats.totalValue / stats.count;
    });
    
    // Price range distribution
    const priceRanges = {
      '0-10000': 0,
      '10000-50000': 0,
      '50000-100000': 0,
      '100000-500000': 0,
      '500000+': 0
    };
    
    assets.forEach(asset => {
      const value = asset.value;
      if (value < 10000) priceRanges['0-10000']++;
      else if (value < 50000) priceRanges['10000-50000']++;
      else if (value < 100000) priceRanges['50000-100000']++;
      else if (value < 500000) priceRanges['100000-500000']++;
      else priceRanges['500000+']++;
    });
    
    res.json({
      totalMarketValue,
      averageAssetValue,
      totalAssets: assets.length,
      categoryStats,
      priceRanges,
      verifiedAssets: assets.filter(a => a.isVerified).length,
      pendingAssets: assets.filter(a => a.status === 'pending').length
    });
  } catch (error) {
    console.error('Error fetching market stats:', error);
    res.status(500).json({ error: 'Failed to fetch market statistics' });
  }
});

module.exports = router;
