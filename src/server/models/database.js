const { v4: uuidv4 } = require('uuid');

// Mock database - in production, this would be replaced with a real database
class MockDatabase {
  constructor() {
    this.assets = new Map();
    this.validators = new Map();
    this.users = new Map();
    this.transactions = new Map();
    this.validationRequests = new Map();
    this.initializeData();
  }

  initializeData() {
    // Initialize with mock data
    this.initializeAssets();
    this.initializeValidators();
    this.initializeUsers();
  }

  initializeAssets() {
    const mockAssets = [
      {
        id: '1',
        title: 'Rolex Daytona 2023',
        description: 'Limited edition Rolex Daytona with platinum case and ceramic bezel. Complete with original box and papers, purchase date January 2023.',
        category: 'watches',
        status: 'validated',
        imageUrl: '/assets/watches/rolex-daytona.jpg',
        images: ['/assets/watches/rolex-daytona.jpg'],
        price: {
          amount: 30000,
          currency: 'USDT',
        },
        tokenization: {
          type: 'fractional',
          totalTokens: 1000,
          availableTokens: 750,
          pricePerToken: 30,
        },
        listingType: 'auction',
        isVerified: true,
        location: {
          address: 'Geneva, Switzerland',
          city: 'Geneva',
          country: 'Switzerland',
        },
        specifications: {
          'Brand': 'Rolex',
          'Model': 'Daytona',
          'Reference Number': '116506',
          'Movement': 'Automatic',
          'Case Material': 'Platinum',
          'Bracelet Material': 'Platinum',
          'Year': '2023',
          'Condition': 'Mint',
        },
        owner: {
          id: 'user1',
          name: 'John Smith',
          rating: 4.8,
        },
        validation: {
          status: 'validated',
          validatedBy: 'validator1',
          validatedAt: new Date('2024-01-15'),
          comments: 'Authentic Rolex Daytona with complete documentation.',
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        auctionEndTime: '2025-12-01T13:00:00Z',
        views: 1250,
        likes: 89,
        value: 30000,
        tokenId: '12345',
      },
      {
        id: '2',
        title: 'Abstract Composition #7',
        description: 'Original canvas painting by emerging artist Maya Lin. Certificate of authenticity included.',
        category: 'art',
        status: 'validated',
        imageUrl: '/assets/art/abstract-1.jpg',
        images: ['/assets/art/abstract-1.jpg'],
        price: {
          amount: 15000,
          currency: 'USDT',
        },
        tokenization: {
          type: 'fractional',
          totalTokens: 500,
          availableTokens: 500,
          pricePerToken: 30,
        },
        listingType: 'fixed',
        isVerified: true,
        owner: {
          id: 'user2',
          name: 'Sarah Johnson',
          rating: 4.6,
        },
        validation: {
          status: 'validated',
          validatedBy: 'validator2',
          validatedAt: new Date('2024-01-10'),
          comments: 'Authentic artwork with proper provenance.',
        },
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-10'),
        views: 890,
        likes: 67,
        value: 15000,
        tokenId: '12346',
      },
      {
        id: '3',
        title: 'First Edition "The Great Gatsby"',
        description: 'First edition, first printing of F. Scott Fitzgerald\'s masterpiece, published in 1925. In good condition with original dust jacket.',
        category: 'collectibles',
        status: 'pending',
        imageUrl: '/assets/collectibles/baseball-cards.png',
        images: ['/assets/collectibles/baseball-cards.png'],
        price: {
          amount: 7500,
          currency: 'USDT',
        },
        tokenization: {
          type: 'whole',
          totalTokens: 1,
          availableTokens: 1,
          pricePerToken: 7500,
        },
        listingType: 'fixed',
        isVerified: false,
        owner: {
          id: 'user3',
          name: 'Michael Brown',
          rating: 4.2,
        },
        validation: {
          status: 'pending',
        },
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        views: 234,
        likes: 12,
        value: 7500,
        tokenId: '12347',
      },
      {
        id: '4',
        title: 'Diamond Necklace 18K Gold',
        description: '18K gold necklace with 3-carat total weight diamonds, GIA certified.',
        category: 'jewelry',
        status: 'validated',
        imageUrl: '/assets/jewelry/diamond-ring-1.jpg',
        images: ['/assets/jewelry/diamond-ring-1.jpg'],
        price: {
          amount: 12000,
          currency: 'USDT',
        },
        tokenization: {
          type: 'fractional',
          totalTokens: 400,
          availableTokens: 400,
          pricePerToken: 30,
        },
        listingType: 'auction',
        isVerified: true,
        owner: {
          id: 'user4',
          name: 'Emily Davis',
          rating: 4.9,
        },
        validation: {
          status: 'validated',
          validatedBy: 'validator3',
          validatedAt: new Date('2024-01-12'),
          comments: 'GIA certified diamonds with proper documentation.',
        },
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-12'),
        auctionEndTime: '2025-11-15T13:00:00Z',
        views: 567,
        likes: 45,
        value: 12000,
        tokenId: '12348',
      },
      {
        id: '5',
        title: 'Luxury Beachfront Villa',
        description: 'Spectacular 5-bedroom beachfront villa in Malibu with direct ocean access, infinity pool, and smart home features.',
        category: 'real-estate',
        status: 'validated',
        imageUrl: '/assets/real-estate/villa-1.jpg.svg',
        images: ['/assets/real-estate/villa-1.jpg.svg'],
        price: {
          amount: 2500000,
          currency: 'USDT',
        },
        tokenization: {
          type: 'fractional',
          totalTokens: 10000,
          availableTokens: 10000,
          pricePerToken: 250,
        },
        listingType: 'fixed',
        isVerified: true,
        location: {
          address: '123 Ocean Drive, Malibu, CA',
          city: 'Malibu',
          country: 'USA',
          coordinates: {
            lat: 34.0259,
            lng: -118.7798,
          },
        },
        owner: {
          id: 'user5',
          name: 'Robert Wilson',
          rating: 4.7,
        },
        validation: {
          status: 'validated',
          validatedBy: 'validator4',
          validatedAt: new Date('2024-01-18'),
          comments: 'Property verified with proper title and valuation.',
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-18'),
        views: 2100,
        likes: 156,
        value: 2500000,
        tokenId: '12349',
      },
    ];

    mockAssets.forEach(asset => {
      this.assets.set(asset.id, asset);
    });
  }

  initializeValidators() {
    const mockValidators = [
      {
        id: 'validator1',
        name: 'Swiss Watch Authority',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
        expertise: ['watches'],
        reputation: 4.9,
        jurisdiction: 'Switzerland',
        validationCount: 287,
        verificationFee: {
          amount: 500,
          currency: 'USDT',
        },
        availability: true,
        responseTime: '24-48 hours',
      },
      {
        id: 'validator2',
        name: 'Modern Art Verifiers',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        expertise: ['art'],
        reputation: 4.7,
        jurisdiction: 'USA',
        validationCount: 153,
        verificationFee: {
          amount: 300,
          currency: 'USDT',
        },
        availability: true,
        responseTime: '48-72 hours',
      },
      {
        id: 'validator3',
        name: 'Gem Certification Institute',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        expertise: ['jewelry'],
        reputation: 4.8,
        jurisdiction: 'Global',
        validationCount: 412,
        verificationFee: {
          amount: 400,
          currency: 'USDT',
        },
        availability: true,
        responseTime: '24-48 hours',
      },
      {
        id: 'validator4',
        name: 'Global Property Validators',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
        expertise: ['real-estate'],
        reputation: 4.6,
        jurisdiction: 'International',
        validationCount: 89,
        verificationFee: {
          amount: 1000,
          currency: 'USDT',
        },
        availability: true,
        responseTime: '72-96 hours',
      },
      {
        id: 'validator5',
        name: 'Collectibles Authentication Board',
        avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
        expertise: ['collectibles'],
        reputation: 4.5,
        jurisdiction: 'USA, EU',
        validationCount: 342,
        verificationFee: {
          amount: 200,
          currency: 'USDT',
        },
        availability: true,
        responseTime: '48-72 hours',
      },
    ];

    mockValidators.forEach(validator => {
      this.validators.set(validator.id, validator);
    });
  }

  initializeUsers() {
    const mockUsers = [
      {
        id: 'user1',
        email: 'john@example.com',
        name: 'John Smith',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
        roles: ['seller'],
        kyc: {
          status: 'verified',
          documents: {
            idVerification: {
              id: 'doc1',
              type: 'id_verification',
              url: '/documents/user1/id.pdf',
              name: 'ID Verification',
              verified: true,
              uploadedAt: new Date('2024-01-01'),
            },
          },
          verifiedAt: new Date('2024-01-01'),
        },
        wallet: {
          address: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
          balance: 50000,
          currency: 'USDT',
        },
        stats: {
          assetsListed: 3,
          assetsSold: 1,
          assetsBought: 0,
          totalValue: 45000,
          rating: 4.8,
          reviews: 12,
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-20'),
      },
    ];

    mockUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }

  // Asset methods
  getAllAssets(filters = {}) {
    let assets = Array.from(this.assets.values());
    
    if (filters.category) {
      assets = assets.filter(asset => asset.category === filters.category);
    }
    
    if (filters.status) {
      assets = assets.filter(asset => asset.status === filters.status);
    }
    
    if (filters.verified !== undefined) {
      assets = assets.filter(asset => asset.isVerified === filters.verified);
    }
    
    if (filters.priceRange) {
      assets = assets.filter(asset => 
        asset.price.amount >= filters.priceRange.min && 
        asset.price.amount <= filters.priceRange.max
      );
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      assets = assets.filter(asset => 
        asset.title.toLowerCase().includes(term) ||
        asset.description.toLowerCase().includes(term)
      );
    }
    
    return assets;
  }

  getRecentHistory(limit = 5) {

    const allAssets = Array.from(this.assets.values());
    const sortedAssets = allAssets.sort(
      (a, b) => b.updatedAt - a.updatedAt
    );

    return sortedAssets.slice(0, limit);
  }

  getAssetById(id) {
    return this.assets.get(id);
  }

  createAsset(assetData) {
    const id = uuidv4();
    const asset = {
      id,
      ...assetData,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      likes: 0,
      status: 'pending',
      isVerified: false,
    };
    this.assets.set(id, asset);
    return asset;
  }

  updateAsset(id, updateData) {
    const asset = this.assets.get(id);
    if (!asset) return null;
    
    const updatedAsset = {
      ...asset,
      ...updateData,
      updatedAt: new Date(),
    };
    this.assets.set(id, updatedAsset);
    return updatedAsset;
  }

  // Validator methods
  getAllValidators(filters = {}) {
    let validators = Array.from(this.validators.values());
    
    if (filters.expertise) {
      validators = validators.filter(validator => 
        validator.expertise.includes(filters.expertise)
      );
    }
    
    if (filters.jurisdiction) {
      validators = validators.filter(validator => 
        validator.jurisdiction.toLowerCase().includes(filters.jurisdiction.toLowerCase())
      );
    }
    
    if (filters.availability !== undefined) {
      validators = validators.filter(validator => 
        validator.availability === filters.availability
      );
    }
    
    return validators;
  }

  getValidatorById(id) {
    return this.validators.get(id);
  }

  // Transaction methods
  createTransaction(transactionData) {
    const id = uuidv4();
    const transaction = {
      id,
      ...transactionData,
      createdAt: new Date(),
      status: 'pending',
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  getTransactionsByUserId(userId) {
    return Array.from(this.transactions.values()).filter(
      transaction => transaction.buyerId === userId || transaction.sellerId === userId
    );
  }

  // Validation request methods
  createValidationRequest(requestData) {
    const id = uuidv4();
    const request = {
      id,
      ...requestData,
      status: 'pending',
      requestedAt: new Date(),
    };
    this.validationRequests.set(id, request);
    return request;
  }

  getValidationRequestById(id) {
    return this.validationRequests.get(id);
  }

  updateValidationRequest(id, updateData) {
    const request = this.validationRequests.get(id);
    if (!request) return null;
    
    const updatedRequest = {
      ...request,
      ...updateData,
      updatedAt: new Date(),
    };
    this.validationRequests.set(id, updatedRequest);
    return updatedRequest;
  }
}

module.exports = new MockDatabase();
