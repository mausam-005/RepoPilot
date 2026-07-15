const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
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

    const avatarUrl = `https://picsum.photos/seed/${username}/200/200`;
    const user = new User({ email, password, name, username, avatarUrl });
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

router.get('/github', (req, res) => {
  const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback';
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=repo,user`;
  res.redirect(url);
});

router.post('/github/callback', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'No code provided' });
    }

    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: {
        Accept: 'application/json'
      }
    });

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(400).json({ message: 'Failed to retrieve access token from GitHub' });
    }

    // Fetch user details from GitHub
    const githubUserRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` }
    });
    const githubUser = githubUserRes.data;

    const githubEmailsRes = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `token ${accessToken}` }
    });
    
    // Find primary email
    const primaryEmailObj = githubEmailsRes.data.find(e => e.primary) || githubEmailsRes.data[0];
    const email = primaryEmailObj ? primaryEmailObj.email : null;

    if (!email) {
      return res.status(400).json({ message: 'No email associated with this GitHub account' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user with github token
      user.githubToken = accessToken;
      await user.save();
    } else {
      // Create new user with a random secure password
      const randomPassword = require('crypto').randomBytes(16).toString('hex');
      
      // Ensure unique username
      let username = githubUser.login;
      let usernameExists = await User.findOne({ username });
      if (usernameExists) {
        username = `${username}_${Math.floor(Math.random() * 10000)}`;
      }

      const avatarUrl = githubUser.avatar_url || `https://picsum.photos/seed/${username}/200/200`;
      user = new User({
        email,
        password: randomPassword,
        name: githubUser.name || githubUser.login,
        username,
        githubToken: accessToken,
        avatarUrl
      });
      await user.save();
    }

    // Generate JWTs
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      token: jwtToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        githubToken: accessToken
      }
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error.message);
    res.status(500).json({ message: 'Failed to authenticate with GitHub' });
  }
});

module.exports = router;