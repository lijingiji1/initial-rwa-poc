const express = require('express');
const router = express.Router();
const db = require('../models/database');
const {rateLimit} = require('../middleware/rateLimiting');

router.get('/', (req, res) => {
  try {
    const {
      expertise,
      jurisdiction,
      availability,
      searchTerm,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {};
    if (expertise) filters.expertise = expertise;
    if (jurisdiction) filters.jurisdiction = jurisdiction;
    if (availability !== undefined) filters.availability = availability === 'true';


    let validators = db.getAllValidators(filters);

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      validators = validators.filter(validator => 
        validator.name.toLowerCase().includes(term) ||
        validator.jurisdiction.toLowerCase().includes(term)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedValidators = validators.slice(startIndex, endIndex);

    res.json({
      validators: paginatedValidators,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(validators.length / limit),
        totalItems: validators.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching validators:', error);
    res.status(500).json({ error: 'Failed to fetch validators' });
  }
});

// Get validator by ID
router.get('/:id', (req, res) => {
  try {
    const validator = db.getValidatorById(req.params.id);
    if (!validator) {
      return res.status(404).json({ error: 'Validator not found' });
    }
    res.json(validator);
  } catch (error) {
    console.error('Error fetching validator:', error);
    res.status(500).json({ error: 'Failed to fetch validator' });
  }
});


// Get validator's validation history
router.get('/:id/history', (req, res) => {
  try {
    const validator = db.getValidatorById(req.params.id);
    if (!validator) {
      return res.status(404).json({ error: 'Validator not found' });
    }

    // In a real app, this would fetch from a separate history table
    const history = [
      {
        id: 'hist1',
        assetId: '1',
        assetTitle: 'Rolex Daytona 2023',
        status: 'completed',
        requestedAt: new Date('2024-01-10'),
        completedAt: new Date('2024-01-15'),
        comments: 'Authentic Rolex Daytona with complete documentation.'
      },
      {
        id: 'hist2',
        assetId: '2',
        assetTitle: 'Abstract Composition #7',
        status: 'completed',
        requestedAt: new Date('2024-01-05'),
        completedAt: new Date('2024-01-10'),
        comments: 'Authentic artwork with proper provenance.'
      }
    ];

    res.json(history);
  } catch (error) {
    console.error('Error fetching validator history:', error);
    res.status(500).json({ error: 'Failed to fetch validator history' });
  }
});

// Get validator availability
router.get('/:id/availability', (req, res) => {
  try {
    const validator = db.getValidatorById(req.params.id);
    if (!validator) {
      return res.status(404).json({ error: 'Validator not found' });
    }

    res.json({
      available: validator.availability,
      nextAvailableSlot: validator.availability ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error fetching validator availability:', error);
    res.status(500).json({ error: 'Failed to fetch validator availability' });
  }
});

// Get validator fees for specific category
router.get('/:id/fees', (req, res) => {
  try {
    const { category } = req.query;
    const validator = db.getValidatorById(req.params.id);
    
    if (!validator) {
      return res.status(404).json({ error: 'Validator not found' });
    }

    if (!category) {
      return res.status(400).json({ error: 'Category parameter is required' });
    }

    // Check if validator has expertise in this category
    if (!validator.expertise.includes(category)) {
      return res.status(400).json({ error: 'Validator does not have expertise in this category' });
    }

    res.json({
      amount: validator.verificationFee.amount,
      currency: validator.verificationFee.currency,
      estimatedTime: validator.responseTime
    });
  } catch (error) {
    console.error('Error fetching validator fees:', error);
    res.status(500).json({ error: 'Failed to fetch validator fees' });
  }
});


// Submit validator application
router.post('/apply', (req, res) => {
  try {
    const {
      name,
      expertise,
      jurisdiction,
      credentials,
      verificationFee
    } = req.body;

    // Validate required fields
    if (!name || !expertise || !jurisdiction || !verificationFee) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, expertise, jurisdiction, verificationFee' 
      });
    }

    // In a real app, this would create a pending application
    const applicationId = `app_${Date.now()}`;
    
    res.status(201).json({
      applicationId,
      status: 'pending',
      message: 'Application submitted successfully. You will be notified once reviewed.'
    });
  } catch (error) {
    console.error('Error submitting validator application:', error);
    res.status(500).json({ error: 'Failed to submit validator application' });
  }
});

// Get validator application status
router.get('/applications/:applicationId', (req, res) => {
  try {
    const { applicationId } = req.params;
    
    // In a real app, this would fetch from applications table
    res.json({
      status: 'pending',
      feedback: 'Your application is under review. We will contact you within 5-7 business days.',
      nextSteps: [
        'Complete background verification',
        'Submit additional documentation if requested',
        'Wait for approval notification'
      ]
    });
  } catch (error) {
    console.error('Error fetching application status:', error);
    res.status(500).json({ error: 'Failed to fetch application status' });
  }
});

module.exports = router;
