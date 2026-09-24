const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models/database');

// Mock user for authentication (in production, this would be a real user database)
const mockUser = {
  id: 'user1',
  email: 'demo@rwab.com',
  password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'password'
  name: 'Demo User',
  roles: ['buyer', 'seller']
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, password, name' 
      });
    }

    // Check if user already exists
    const existingUser = Array.from(db.users.values()).find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      roles: ['buyer'],
      kyc: {
        status: 'pending',
        documents: {}
      },
      wallet: {
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        balance: 0,
        currency: 'USDT'
      },
      stats: {
        assetsListed: 0,
        assetsSold: 0,
        assetsBought: 0,
        totalValue: 0,
        rating: 0,
        reviews: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store user (in production, save to database)
    db.users.set(newUser.id, newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      user: userResponse,
      token,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, password' 
      });
    }

    // Find user (in production, query database)
    const user = Array.from(db.users.values()).find(u => u.email === email) || mockUser;
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      user: userResponse,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to login user' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = db.users.get(req.user.userId) || mockUser;
    const { password: _, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.patch('/profile', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const user = db.users.get(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = {
      ...user,
      ...req.body,
      updatedAt: new Date()
    };

    db.users.set(userId, updatedUser);
    
    const { password: _, ...userResponse } = updatedUser;
    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Verify JWT token middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Refresh token
router.post('/refresh', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }

      // Generate new token
      const newToken = jwt.sign(
        { userId: user.userId, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({ token: newToken });
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
