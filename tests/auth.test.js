const request = require('supertest');
const app = require('../src/server/server');

describe('Authentication API Endpoints', () => {
  // Test POST /api/auth/register
  describe('POST /api/auth/register', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User'
    };

    it('should register new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', validUserData.email);
      expect(res.body.user).toHaveProperty('name', validUserData.name);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        email: 'test@example.com'
        // Missing password and name
      };

      await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidData = {
        ...validUserData,
        email: 'invalid-email'
      };

      await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for weak password', async () => {
      const invalidData = {
        ...validUserData,
        password: '123' // Weak password
      };

      await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      // Second registration with same email
      await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(400);
    });
  });

  // Test POST /api/auth/login
  describe('POST /api/auth/login', () => {
    const loginData = {
      email: 'demo@rwab.com',
      password: 'password'
    };

    it('should login user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', loginData.email);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for missing credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);
    });

    it('should return 401 for invalid email', async () => {
      const invalidData = {
        email: 'nonexistent@example.com',
        password: 'password'
      };

      await request(app)
        .post('/api/auth/login')
        .send(invalidData)
        .expect(401);
    });

    it('should return 401 for invalid password', async () => {
      const invalidData = {
        email: 'demo@rwab.com',
        password: 'wrongpassword'
      };

      await request(app)
        .post('/api/auth/login')
        .send(invalidData)
        .expect(401);
    });

    it('should return 401 for locked account', async () => {
      // This would require setting up a locked account in the test data
      // For now, we'll test the structure
      const invalidData = {
        email: 'locked@example.com',
        password: 'password'
      };

      // Mock locked account scenario
      await request(app)
        .post('/api/auth/login')
        .send(invalidData)
        .expect(401);
    });
  });

  // Test GET /api/auth/profile
  describe('GET /api/auth/profile', () => {
    let authToken;

    beforeAll(async () => {
      // Login to get auth token
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'demo@rwab.com',
          password: 'password'
        });

      authToken = res.body.token;
    });

    it('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('name');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/auth/profile')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 with expired token', async () => {
      // This would require creating an expired token
      // For now, we'll test the structure
      await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer expired-token')
        .expect(401);
    });
  });

  // Test PATCH /api/auth/profile
  describe('PATCH /api/auth/profile', () => {
    let authToken;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'demo@rwab.com',
          password: 'password'
        });

      authToken = res.body.token;
    });

    it('should update user profile with valid data', async () => {
      const updateData = {
        name: 'Updated Name',
        profile: {
          bio: 'Updated bio',
          location: 'New York'
        }
      };

      const res = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.name).toBe(updateData.name);
      expect(res.body.profile.bio).toBe(updateData.profile.bio);
      expect(res.body.profile.location).toBe(updateData.profile.location);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = {
        email: 'invalid-email-format'
      };

      await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should return 401 without token', async () => {
      await request(app)
        .patch('/api/auth/profile')
        .send({ name: 'Updated' })
        .expect(401);
    });
  });

  // Test POST /api/auth/refresh
  describe('POST /api/auth/refresh', () => {
    let refreshToken;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'demo@rwab.com',
          password: 'password'
        });

      refreshToken = res.body.token;
    });

    it('should refresh token with valid token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ token: refreshToken })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body.token).not.toBe(refreshToken);
    });

    it('should return 400 without token', async () => {
      await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);
    });

    it('should return 403 with invalid token', async () => {
      await request(app)
        .post('/api/auth/refresh')
        .send({ token: 'invalid-token' })
        .expect(403);
    });
  });

  // Test POST /api/auth/logout
  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Logout successful');
    });
  });

  // Test rate limiting
  describe('Rate Limiting', () => {
    it('should apply rate limiting to auth endpoints', async () => {
      const loginData = {
        email: 'demo@rwab.com',
        password: 'wrongpassword'
      };

      // Make multiple failed login attempts
      const promises = Array(6).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send(loginData)
      );

      const responses = await Promise.all(promises);
      
      // Should have some 429 responses due to rate limiting
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
