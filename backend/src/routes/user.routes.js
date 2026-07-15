const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.patch('/profile', async (req, res) => {
  try {
    const { name, username, githubToken, avatarUrl } = req.body;
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    
    if (username !== undefined) {
      const targetUsername = username || null;
      if (targetUsername) {
        const existingUser = await User.findOne({ 
          username: targetUsername, 
          _id: { $ne: req.user.id } 
        });
        if (existingUser) {
          return res.status(400).json({ message: 'Username already taken' });
        }
      }
      updateData.username = targetUsername;
    }
    
    if (githubToken !== undefined) {
      updateData.githubToken = githubToken || null;
    }
    
    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl || null;
    }
    
    await User.findByIdAndUpdate(req.user.id, updateData);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.delete('/account', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    let githubProfile = null;
    
    if (user.githubToken) {
      try {
        const axios = require('axios');
        const { data } = await axios.get('https://api.github.com/user', {
          headers: { Authorization: `token ${user.githubToken}` }
        });
        githubProfile = {
          login: data.login,
          name: data.name,
          avatar_url: data.avatar_url
        };
      } catch (error) {
        githubProfile = null;
      }
    }
    
    res.json({ ...user.toObject(), githubProfile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

module.exports = router;
