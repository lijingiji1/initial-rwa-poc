const { v4: uuidv4 } = require('uuid');

// User model with extended functionality
class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.avatar = data.avatar;
    this.roles = data.roles || ['buyer'];
    this.kyc = data.kyc || {
      status: 'pending',
      documents: {},
      verifiedAt: null
    };
    this.wallet = data.wallet || {
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      balance: 0,
      currency: 'USDT'
    };
    this.profile = data.profile || {
      bio: '',
      location: '',
      website: '',
      social: {}
    };
    this.stats = data.stats || {
      assetsListed: 0,
      assetsSold: 0,
      assetsBought: 0,
      totalValue: 0,
      rating: 0,
      reviews: 0
    };
    this.preferences = data.preferences || {
      notifications: true,
      newsletter: true,
      twoFactorEnabled: false,
      categories: []
    };
    this.bankAccount = data.bankAccount;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.lastLoginAt = data.lastLoginAt;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.emailVerified = data.emailVerified || false;
    this.twoFactorSecret = data.twoFactorSecret;
    this.loginAttempts = data.loginAttempts || 0;
    this.lockedUntil = data.lockedUntil;
  }

  // Check if account is locked
  isLocked() {
    return !!(this.lockedUntil && this.lockedUntil > Date.now());
  }

  // Increment login attempts
  incLoginAttempts() {
    if (this.lockedUntil && this.lockedUntil < Date.now()) {
      return this.update({
        $unset: { loginAttempts: 1, lockedUntil: 1 }
      });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
      updates.$set = { lockedUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }
    
    return this.update(updates);
  }

  // Reset login attempts
  resetLoginAttempts() {
    return this.update({
      $unset: { loginAttempts: 1, lockedUntil: 1 }
    });
  }

  // Update user data
  update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date();
    return this;
  }

  // Get public profile (without sensitive data)
  getPublicProfile() {
    const { password, twoFactorSecret, loginAttempts, lockedUntil, ...publicProfile } = this;
    return publicProfile;
  }
}

// Asset model with extended functionality
class Asset {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.description = data.description;
    this.category = data.category;
    this.status = data.status || 'pending';
    this.imageUrl = data.imageUrl;
    this.images = data.images || [];
    this.videos = data.videos || [];
    this.documents = data.documents || [];
    this.price = data.price;
    this.tokenization = data.tokenization;
    this.listingType = data.listingType;
    this.isVerified = data.isVerified || false;
    this.location = data.location;
    this.specifications = data.specifications || {};
    this.owner = data.owner;
    this.validation = data.validation;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.auctionEndTime = data.auctionEndTime;
    this.views = data.views || 0;
    this.likes = data.likes || 0;
    this.value = data.value;
    this.tokenId = data.tokenId;
    this.tags = data.tags || [];
    this.featured = data.featured || false;
    this.promoted = data.promoted || false;
    this.metadata = data.metadata || {};
    this.blockchainData = data.blockchainData || {};
  }

  // Increment views
  incrementViews() {
    this.views += 1;
    this.updatedAt = new Date();
    return this;
  }

  // Toggle like
  toggleLike(userId) {
    if (!this.likes) this.likes = [];
    const index = this.likes.indexOf(userId);
    if (index > -1) {
      this.likes.splice(index, 1);
    } else {
      this.likes.push(userId);
    }
    this.updatedAt = new Date();
    return this;
  }

  // Update status
  updateStatus(status, validatorId = null) {
    this.status = status;
    this.updatedAt = new Date();
    
    if (validatorId) {
      this.validation = {
        ...this.validation,
        status,
        validatedBy: validatorId,
        validatedAt: new Date()
      };
    }
    
    return this;
  }

  // Add document
  addDocument(document) {
    this.documents.push({
      id: uuidv4(),
      ...document,
      uploadedAt: new Date()
    });
    this.updatedAt = new Date();
    return this;
  }

  // Update metadata
  updateMetadata(metadata) {
    this.metadata = { ...this.metadata, ...metadata };
    this.updatedAt = new Date();
    return this;
  }
}

// Transaction model
class Transaction {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.assetId = data.assetId;
    this.listingId = data.listingId;
    this.buyerId = data.buyerId;
    this.sellerId = data.sellerId;
    this.type = data.type; // 'purchase', 'bid', 'transfer', 'refund'
    this.tokens = data.tokens;
    this.pricePerToken = data.pricePerToken;
    this.totalAmount = data.totalAmount;
    this.currency = data.currency;
    this.paymentMethod = data.paymentMethod;
    this.paymentStatus = data.paymentStatus || 'pending';
    this.transactionHash = data.transactionHash;
    this.status = data.status || 'pending';
    this.createdAt = data.createdAt || new Date();
    this.completedAt = data.completedAt;
    this.metadata = data.metadata || {};
    this.fees = data.fees || {};
    this.refundReason = data.refundReason;
    this.originalTransactionId = data.originalTransactionId;
  }

  // Update status
  updateStatus(status, metadata = {}) {
    this.status = status;
    this.updatedAt = new Date();
    
    if (status === 'completed') {
      this.completedAt = new Date();
    }
    
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }

  // Add transaction hash
  addTransactionHash(hash) {
    this.transactionHash = hash;
    this.updatedAt = new Date();
    return this;
  }

  // Calculate fees
  calculateFees() {
    const platformFee = this.totalAmount * 0.025; // 2.5% platform fee
    const validatorFee = this.totalAmount * 0.01; // 1% validator fee
    
    this.fees = {
      platform: platformFee,
      validator: validatorFee,
      total: platformFee + validatorFee,
      netAmount: this.totalAmount - platformFee - validatorFee
    };
    
    return this.fees;
  }
}

// Validator model
class Validator {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.avatar = data.avatar;
    this.expertise = data.expertise || [];
    this.reputation = data.reputation || 0;
    this.jurisdiction = data.jurisdiction;
    this.validationCount = data.validationCount || 0;
    this.verificationFee = data.verificationFee;
    this.availability = data.availability !== undefined ? data.availability : true;
    this.responseTime = data.responseTime;
    this.contactInfo = data.contactInfo || {};
    this.credentials = data.credentials || [];
    this.specializations = data.specializations || [];
    this.languages = data.languages || ['English'];
    this.timezone = data.timezone || 'UTC';
    this.workingHours = data.workingHours || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.rating = data.rating || 0;
    this.reviews = data.reviews || [];
    this.completedValidations = data.completedValidations || 0;
    this.pendingValidations = data.pendingValidations || 0;
  }

  // Update availability
  updateAvailability(available, nextAvailableSlot = null) {
    this.availability = available;
    this.nextAvailableSlot = nextAvailableSlot;
    this.updatedAt = new Date();
    return this;
  }

  // Add review
  addReview(review) {
    this.reviews.push({
      id: uuidv4(),
      ...review,
      createdAt: new Date()
    });
    
    // Recalculate rating
    this.rating = this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
    this.updatedAt = new Date();
    return this;
  }

  // Increment validation count
  incrementValidationCount() {
    this.validationCount += 1;
    this.completedValidations += 1;
    this.updatedAt = new Date();
    return this;
  }

  // Update response time
  updateResponseTime(responseTime) {
    this.responseTime = responseTime;
    this.updatedAt = new Date();
    return this;
  }
}

// Notification model
class Notification {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.userId = data.userId;
    this.type = data.type; // 'transaction', 'validation', 'system', 'marketing'
    this.title = data.title;
    this.message = data.message;
    this.data = data.data || {};
    this.read = data.read || false;
    this.createdAt = data.createdAt || new Date();
    this.readAt = data.readAt;
    this.expiresAt = data.expiresAt;
    this.priority = data.priority || 'normal'; // 'low', 'normal', 'high', 'urgent'
    this.channel = data.channel || 'in-app'; // 'in-app', 'email', 'sms', 'push'
  }

  // Mark as read
  markAsRead() {
    this.read = true;
    this.readAt = new Date();
    return this;
  }

  // Check if expired
  isExpired() {
    return this.expiresAt && this.expiresAt < new Date();
  }

  // Update priority
  updatePriority(priority) {
    this.priority = priority;
    return this;
  }
}

module.exports = {
  User,
  Asset,
  Transaction,
  Validator,
  Notification
};
