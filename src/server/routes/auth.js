import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken, authenticateToken } from '../middleware/auth.js';
import { standardLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Simple in-memory user storage (in production, use a database)
const users = new Map();

// Default demo user
users.set('demo', {
  id: 'demo',
  username: 'demo',
  passwordHash: bcrypt.hashSync('demo123', 10),
  createdAt: new Date().toISOString()
});

/**
 * POST /api/auth/login - Login user
 */
router.post('/login', standardLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = users.get(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ 
      id: user.id, 
      username: user.username 
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username
      },
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/register - Register new user
 */
router.post('/register', standardLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (users.has(username)) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: username, // Simple ID scheme
      username,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    users.set(username, newUser);

    const token = generateToken({ 
      id: newUser.id, 
      username: newUser.username 
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        username: newUser.username
      },
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * GET /api/auth/me - Get current user info
 */
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username
    }
  });
});

/**
 * POST /api/auth/refresh - Refresh token
 */
router.post('/refresh', authenticateToken, (req, res) => {
  const token = generateToken({ 
    id: req.user.id, 
    username: req.user.username 
  });

  res.json({
    success: true,
    token,
    expiresIn: '24h'
  });
});

/**
 * POST /api/auth/guest - Get guest token
 */
router.post('/guest', standardLimiter, (req, res) => {
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const token = generateToken({ 
    id: guestId, 
    username: 'Guest',
    isGuest: true 
  }, '1h'); // Shorter expiry for guests

  res.json({
    success: true,
    token,
    user: {
      id: guestId,
      username: 'Guest',
      isGuest: true
    },
    expiresIn: '1h'
  });
});

export default router;