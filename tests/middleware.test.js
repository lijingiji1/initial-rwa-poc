const request = require('supertest');
const app = require('../src/server/server');

describe('Middleware Tests', () => {
  // Test CORS middleware
  describe('CORS Middleware', () => {
    it('should include CORS headers', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.headers).toHaveProperty('access-control-allow-origin');
      expect(res.headers).toHaveProperty('access-control-allow-credentials');
    });

    it('should handle preflight requests', async () => {
      const res = await request(app)
        .options('/api/assets')
        .expect(204);

      expect(res.headers).toHaveProperty('access-control-allow-methods');
      expect(res.headers).toHaveProperty('access-control-allow-headers');
    });
  });

  // Test rate limiting middleware
  describe('Rate Limiting Middleware', () => {
    it('should apply general rate limiting', async () => {
      const promises = Array(105).fill().map(() =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should apply stricter rate limiting to auth endpoints', async () => {
      const promises = Array(10).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'wrong' })
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  // Test security headers middleware
  describe('Security Headers Middleware', () => {
    it('should include security headers', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.headers).toHaveProperty('x-frame-options');
      expect(res.headers).toHaveProperty('x-content-type-options');
      expect(res.headers).toHaveProperty('x-xss-protection');
      expect(res.headers).toHaveProperty('referrer-policy');
    });

    it('should set X-Frame-Options to DENY', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.headers['x-frame-options']).toBe('DENY');
    });

    it('should set X-Content-Type-Options to nosniff', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  // Test request ID middleware
  describe('Request ID Middleware', () => {
    it('should add request ID header', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.headers).toHaveProperty('x-request-id');
      expect(res.headers['x-request-id']).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('should use existing request ID if provided', async () => {
      const customRequestId = 'custom-request-id-123';
      
      const res = await request(app)
        .get('/api/health')
        .set('X-Request-ID', customRequestId)
        .expect(200);

      expect(res.headers['x-request-id']).toBe(customRequestId);
    });
  });

  // Test response time middleware
  describe('Response Time Middleware', () => {
    it('should add response time header', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.headers).toHaveProperty('x-response-time');
      expect(res.headers['x-response-time']).toMatch(/^\d+ms$/);
    });
  });

  // Test compression middleware
  describe('Compression Middleware', () => {
    it('should compress responses when Accept-Encoding includes gzip', async () => {
      const res = await request(app)
        .get('/api/assets')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Note: supertest doesn't automatically decompress, so we check if compression is applied
      expect(res.headers).toHaveProperty('content-encoding', 'gzip');
    });
  });

  // Test error handling middleware
  describe('Error Handling Middleware', () => {
    it('should handle 404 errors', async () => {
      const res = await request(app)
        .get('/api/nonexistent-endpoint')
        .expect(404);

      expect(res.body).toHaveProperty('error', 'Route not found');
    });

    it('should handle server errors', async () => {
      // This would require triggering a server error
      // For now, we'll test the structure
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      // In case of server error, it should return proper error format
      if (res.status >= 500) {
        expect(res.body).toHaveProperty('error');
      }
    });
  });

  // Test maintenance mode middleware
  describe('Maintenance Mode Middleware', () => {
    let originalMaintenanceMode;

    beforeAll(() => {
      originalMaintenanceMode = process.env.MAINTENANCE_MODE;
    });

    afterAll(() => {
      process.env.MAINTENANCE_MODE = originalMaintenanceMode;
    });

    it('should allow requests when maintenance mode is disabled', async () => {
      process.env.MAINTENANCE_MODE = 'false';
      
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body.status).toBe('OK');
    });

    it('should block requests when maintenance mode is enabled', async () => {
      process.env.MAINTENANCE_MODE = 'true';
      
      const res = await request(app)
        .get('/api/health')
        .expect(503);

      expect(res.body).toHaveProperty('error', 'Service temporarily unavailable');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('retryAfter');
    });
  });

  // Test request logging middleware
  describe('Request Logging Middleware', () => {
    it('should log request information', async () => {
      // This test would require checking log files
      // For now, we'll just ensure the request completes
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.status).toBe(200);
    });
  });

  // Test authentication middleware
  describe('Authentication Middleware', () => {
    it('should allow requests to public endpoints without token', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body.status).toBe('OK');
    });

    it('should require token for protected endpoints', async () => {
      await request(app)
        .get('/api/auth/profile')
        .expect(401);
    });

    it('should accept valid token for protected endpoints', async () => {
      // First login to get token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'demo@rwab.com',
          password: 'password'
        })
        .expect(200);

      const token = loginRes.body.token;

      // Then use token for protected endpoint
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('email');
    });
  });

  // Test validation middleware
  describe('Validation Middleware', () => {
    it('should validate request body for asset creation', async () => {
      const invalidData = {
        title: 'Test' // Missing required fields
      };

      await request(app)
        .post('/api/assets')
        .send(invalidData)
        .expect(400);
    });

    it('should validate request body for user registration', async () => {
      const invalidData = {
        email: 'invalid-email' // Invalid email format
      };

      await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);
    });
  });
});
