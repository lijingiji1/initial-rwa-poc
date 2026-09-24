const request = require('supertest');
const app = require('../src/server/server');

describe('Asset API Endpoints', () => {
  // Test GET /api/assets
  describe('GET /api/assets', () => {
    it('should return list of assets', async () => {
      const res = await request(app)
        .get('/api/assets')
        .expect(200);

      expect(res.body).toHaveProperty('assets');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.assets)).toBe(true);
    });

    it('should filter assets by category', async () => {
      const res = await request(app)
        .get('/api/assets?category=watches')
        .expect(200);

      expect(res.body.assets.every(asset => asset.category === 'watches')).toBe(true);
    });

    it('should filter assets by status', async () => {
      const res = await request(app)
        .get('/api/assets?status=validated')
        .expect(200);

      expect(res.body.assets.every(asset => asset.status === 'validated')).toBe(true);
    });

    it('should filter assets by price range', async () => {
      const res = await request(app)
        .get('/api/assets?priceRange=10000-50000')
        .expect(200);

      res.body.assets.forEach(asset => {
        expect(asset.price.amount).toBeGreaterThanOrEqual(10000);
        expect(asset.price.amount).toBeLessThanOrEqual(50000);
      });
    });

    it('should search assets by title', async () => {
      const res = await request(app)
        .get('/api/assets?searchTerm=Rolex')
        .expect(200);

      expect(res.body.assets.length).toBeGreaterThan(0);
      expect(res.body.assets.some(asset => 
        asset.title.toLowerCase().includes('rolex')
      )).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/assets?page=1&limit=2')
        .expect(200);

      expect(res.body.assets.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.itemsPerPage).toBe(2);
    });
  });

  // Test GET /api/assets/:id
  describe('GET /api/assets/:id', () => {
    it('should return specific asset', async () => {
      const res = await request(app)
        .get('/api/assets/1')
        .expect(200);

      expect(res.body).toHaveProperty('id', '1');
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('category');
      expect(res.body).toHaveProperty('price');
    });

    it('should return 404 for non-existent asset', async () => {
      await request(app)
        .get('/api/assets/nonexistent')
        .expect(404);
    });

    it('should increment views when accessing asset', async () => {
      const res1 = await request(app)
        .get('/api/assets/1')
        .expect(200);

      const initialViews = res1.body.views;

      const res2 = await request(app)
        .get('/api/assets/1')
        .expect(200);

      expect(res2.body.views).toBeGreaterThan(initialViews);
    });
  });

  // Test POST /api/assets
  describe('POST /api/assets', () => {
    const validAssetData = {
      title: 'Test Asset',
      description: 'This is a test asset for unit testing',
      category: 'watches',
      price: {
        amount: 10000,
        currency: 'USDT'
      },
      tokenization: {
        type: 'fractional',
        totalTokens: 100,
        availableTokens: 100,
        pricePerToken: 100
      },
      listingType: 'fixed',
      images: ['https://example.com/image.jpg']
    };

    it('should create new asset with valid data', async () => {
      const res = await request(app)
        .post('/api/assets')
        .send(validAssetData)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(validAssetData.title);
      expect(res.body.status).toBe('pending');
      expect(res.body.views).toBe(0);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        title: 'Test Asset'
        // Missing required fields
      };

      await request(app)
        .post('/api/assets')
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for invalid category', async () => {
      const invalidData = {
        ...validAssetData,
        category: 'invalid-category'
      };

      await request(app)
        .post('/api/assets')
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for invalid price', async () => {
      const invalidData = {
        ...validAssetData,
        price: {
          amount: -1000, // Negative price
          currency: 'USDT'
        }
      };

      await request(app)
        .post('/api/assets')
        .send(invalidData)
        .expect(400);
    });
  });

  // Test PATCH /api/assets/:id
  describe('PATCH /api/assets/:id', () => {
    it('should update asset with valid data', async () => {
      const updateData = {
        title: 'Updated Asset Title',
        description: 'Updated description'
      };

      const res = await request(app)
        .patch('/api/assets/1')
        .send(updateData)
        .expect(200);

      expect(res.body.title).toBe(updateData.title);
      expect(res.body.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent asset', async () => {
      await request(app)
        .patch('/api/assets/nonexistent')
        .send({ title: 'Updated' })
        .expect(404);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = {
        price: {
          amount: -1000 // Invalid negative price
        }
      };

      await request(app)
        .patch('/api/assets/1')
        .send(invalidData)
        .expect(400);
    });
  });

  // Test GET /api/assets/:id/validation
  describe('GET /api/assets/:id/validation', () => {
    it('should return validation status', async () => {
      const res = await request(app)
        .get('/api/assets/1/validation')
        .expect(200);

      expect(res.body).toHaveProperty('validationId');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should return 404 for non-existent asset', async () => {
      await request(app)
        .get('/api/assets/nonexistent/validation')
        .expect(404);
    });
  });

  // Test POST /api/assets/:id/validation-requests
  describe('POST /api/assets/:id/validation-requests', () => {
    it('should create validation request', async () => {
      const requestData = {
        validatorId: 'validator1'
      };

      const res = await request(app)
        .post('/api/assets/1/validation-requests')
        .send(requestData)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('assetId', '1');
      expect(res.body).toHaveProperty('validatorId', 'validator1');
      expect(res.body).toHaveProperty('status', 'pending');
    });

    it('should return 400 for missing validator ID', async () => {
      await request(app)
        .post('/api/assets/1/validation-requests')
        .send({})
        .expect(400);
    });

    it('should return 404 for non-existent asset', async () => {
      await request(app)
        .post('/api/assets/nonexistent/validation-requests')
        .send({ validatorId: 'validator1' })
        .expect(404);
    });

    it('should return 404 for non-existent validator', async () => {
      await request(app)
        .post('/api/assets/1/validation-requests')
        .send({ validatorId: 'nonexistent' })
        .expect(404);
    });
  });

  // Test GET /api/assets/:id/validators
  describe('GET /api/assets/:id/validators', () => {
    it('should return validators for asset category', async () => {
      const res = await request(app)
        .get('/api/assets/1/validators')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(validator => {
        expect(validator).toHaveProperty('id');
        expect(validator).toHaveProperty('name');
        expect(validator).toHaveProperty('expertise');
        expect(validator.expertise).toContain('watches');
      });
    });

    it('should return 404 for non-existent asset', async () => {
      await request(app)
        .get('/api/assets/nonexistent/validators')
        .expect(404);
    });
  });
});
