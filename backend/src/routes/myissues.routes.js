const express = require('express');
const Issue = require('../models/Issue');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Issue.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Issue deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete issue' });
  }
});

module.exports = router;
