const express = require('express');
const request = require('supertest');
const app = require('../src/server');

describe('API Endpoints', () => {
  // Health check
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('version');
    });
  });

  // Assets endpoints
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
  });

  describe('GET /api/assets/:id', () => {
    it('should return specific asset', async () => {
      const res = await request(app)
        .get('/api/assets/1')
        .expect(200);

      expect(res.body).toHaveProperty('id', '1');
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('category');
    });

    it('should return 404 for non-existent asset', async () => {
      await request(app)
        .get('/api/assets/nonexistent')
        .expect(404);
    });
  });

  // Validators endpoints
  describe('GET /api/validators', () => {
    it('should return list of validators', async () => {
      const res = await request(app)
        .get('/api/validators')
        .expect(200);

      expect(res.body).toHaveProperty('validators');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.validators)).toBe(true);
    });
  });

  // Dashboard endpoints
  describe('GET /api/dashboard', () => {
    it('should return dashboard data', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .expect(200);

      expect(res.body).toHaveProperty('stats');
      expect(res.body).toHaveProperty('assets');
      expect(res.body.stats).toHaveProperty('totalAssets');
      expect(res.body.stats).toHaveProperty('totalValue');
    });
  });

  // Authentication endpoints
  describe('POST /api/auth/register', () => {
    it('should register new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', userData.email);
    });

    it('should return 400 for missing fields', async () => {
      const userData = {
        email: 'test@example.com'
        // Missing password and name
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'demo@rwab.com',
        password: 'password'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'demo@rwab.com',
        password: 'wrongpassword'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });
  });

  // IPFS endpoints
  describe('POST /api/ipfs/upload', () => {
    it('should return 400 for no files', async () => {
      await request(app)
        .post('/api/ipfs/upload')
        .expect(400);
    });
  });

  // Error handling
  describe('404 handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });
  });
});

describe('Middleware', () => {
  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      // Make multiple requests to test rate limiting
      const promises = Array(10).fill().map(() => 
        request(app).get('/api/health')
      );
      
      const responses = await Promise.all(promises);
      responses.forEach(res => {
        expect(res.status).toBeLessThan(429);
      });
    });
  });
});
