const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, username } = req.body;

    if (!email || !password || !name || !username) {
      return res.status(400).json({ message: 'All fields (name, username, email, password) are required' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters long' });
    }

    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username })
    ]);

    if (existingEmail) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const user = new User({ email, password, name, username });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('[signup] error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid input data' });
    }
    if (error.name === 'MongoNotConnectedError' || error.message?.includes('buffering timed out') || error.message?.includes('ENOTFOUND')) {
      return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
    }
    res.status(500).json({ message: 'Server error occurred' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'No account found with this email or username' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('[login] error:', error.message);
    if (error.name === 'MongoNotConnectedError' || error.message?.includes('buffering timed out') || error.message?.includes('ENOTFOUND')) {
      return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
    }
    res.status(500).json({ message: 'Server error occurred' });
  }
});

module.exports = router;