const Joi = require('joi');

// Asset validation schemas
const assetSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  category: Joi.string().valid('real-estate', 'art', 'watches', 'jewelry', 'collectibles', 'vehicles', 'other').required(),
  price: Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().valid('USDT', 'ETH', 'BTC', 'USD').required()
  }).required(),
  tokenization: Joi.object({
    type: Joi.string().valid('fractional', 'whole').required(),
    totalTokens: Joi.number().integer().positive().required(),
    availableTokens: Joi.number().integer().min(0).required(),
    pricePerToken: Joi.number().positive().required()
  }).required(),
  listingType: Joi.string().valid('fixed', 'auction', 'swap').required(),
  location: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    country: Joi.string().optional(),
    coordinates: Joi.object({
      lat: Joi.number().min(-90).max(90).optional(),
      lng: Joi.number().min(-180).max(180).optional()
    }).optional()
  }).optional(),
  specifications: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
  videos: Joi.array().items(Joi.string().uri()).optional(),
  documents: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    type: Joi.string().valid('title_deed', 'certificate', 'valuation_report', 'other').required(),
    url: Joi.string().uri().required(),
    name: Joi.string().required(),
    verified: Joi.boolean().required(),
    uploadedAt: Joi.date().required()
  })).optional(),
  auctionEndTime: Joi.date().greater('now').optional()
});

const assetUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(2000).optional(),
  price: Joi.object({
    amount: Joi.number().positive().optional(),
    currency: Joi.string().valid('USDT', 'ETH', 'BTC', 'USD').optional()
  }).optional(),
  tokenization: Joi.object({
    type: Joi.string().valid('fractional', 'whole').optional(),
    totalTokens: Joi.number().integer().positive().optional(),
    availableTokens: Joi.number().integer().min(0).optional(),
    pricePerToken: Joi.number().positive().optional()
  }).optional(),
  listingType: Joi.string().valid('fixed', 'auction', 'swap').optional(),
  location: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    country: Joi.string().optional(),
    coordinates: Joi.object({
      lat: Joi.number().min(-90).max(90).optional(),
      lng: Joi.number().min(-180).max(180).optional()
    }).optional()
  }).optional(),
  specifications: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  images: Joi.array().items(Joi.string().uri()).min(1).optional(),
  videos: Joi.array().items(Joi.string().uri()).optional(),
  auctionEndTime: Joi.date().greater('now').optional()
});

// User validation schemas
const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  name: Joi.string().min(2).max(100).required()
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Transaction validation schemas
const purchaseSchema = Joi.object({
  assetId: Joi.string().required(),
  buyerId: Joi.string().required(),
  paymentMethod: Joi.string().valid('crypto', 'fiat').required(),
  amount: Joi.number().positive().required(),
  tokens: Joi.number().integer().positive().optional()
});

const bidSchema = Joi.object({
  assetId: Joi.string().required(),
  bidderId: Joi.string().required(),
  bidAmount: Joi.number().positive().required(),
  autoBidLimit: Joi.number().positive().optional()
});

// Validator validation schemas
const validatorApplicationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  expertise: Joi.array().items(Joi.string().valid('real-estate', 'art', 'watches', 'jewelry', 'collectibles', 'vehicles', 'other')).min(1).required(),
  jurisdiction: Joi.string().min(2).max(100).required(),
  credentials: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    documentUrl: Joi.string().uri().required()
  })).min(1).required(),
  verificationFee: Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().valid('USDT', 'ETH', 'BTC', 'USD').required()
  }).required()
});

// Validation middleware functions
const validateAsset = (req, res, next) => {
  const { error } = assetSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details.map(detail => detail.message) 
    });
  }
  next();
};

const validateAssetUpdate = (req, res, next) => {
  const { error } = assetUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details.map(detail => detail.message) 
    });
  }
  next();
};

const validateUserRegistration = (req, res, next) => {
  const { error } = userRegistrationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details.map(detail => detail.message) 
    });
  }
  next();
};

const validateUserLogin = (req, res, next) => {
  const { error } = userLoginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details.map(detail => detail.message) 
    });
  }
  next();
};

const validatePurchase = (req, res, next) => {
  const { error } = purchaseSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details.map(detail => detail.message) 
    });
  }
  next();
};

const validateBid = (req, res, next) => {
  const { error } = bidSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details.map(detail => detail.message) 
    });
  }
  next();
};

const validateValidatorApplication = (req, res, next) => {
  const { error } = validatorApplicationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details.map(detail => detail.message) 
    });
  }
  next();
};

// Generic validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.details.map(detail => detail.message) 
      });
    }
    next();
  };
};

module.exports = {
  validateAsset,
  validateAssetUpdate,
  validateUserRegistration,
  validateUserLogin,
  validatePurchase,
  validateBid,
  validateValidatorApplication,
  validate,
  schemas: {
    assetSchema,
    assetUpdateSchema,
    userRegistrationSchema,
    userLoginSchema,
    purchaseSchema,
    bidSchema,
    validatorApplicationSchema
  }
};
