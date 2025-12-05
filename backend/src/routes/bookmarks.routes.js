const express = require('express');
const Bookmark = require('../models/Bookmark');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookmarks' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { repoId, repoName, repoFullName, repoUrl, description, language, stars } = req.body;
    const existing = await Bookmark.findOne({ userId: req.user._id, repoId });
    if (existing) return res.status(400).json({ message: 'Already bookmarked' });
    
    const bookmark = await Bookmark.create({
      userId: req.user._id,
      repoId, repoName, repoFullName, repoUrl, description, language, stars
    });
    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create bookmark' });
  }
});

router.delete('/:repoId', async (req, res) => {
  try {
    await Bookmark.deleteOne({ userId: req.user._id, repoId: req.params.repoId });
    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete bookmark' });
  }
});

module.exports = router;
