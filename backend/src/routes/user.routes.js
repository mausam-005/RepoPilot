const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.patch('/github-token', async (req, res) => {
  try {
    const { githubToken } = req.body;
    await User.findByIdAndUpdate(req.user.id, { githubToken });
    res.json({ message: 'GitHub token updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update GitHub token' });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

module.exports = router;
