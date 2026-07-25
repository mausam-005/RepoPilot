const express = require('express');
const router = express.Router();
const githubService = require('../services/github.service');

// GET /api/ci/:owner/:repo/runs
router.get('/:owner/:repo/runs', async (req, res) => {
  try {
    const token = req.user ? req.user.githubToken : null;
    const { owner, repo } = req.params;
    
    const data = await githubService.getRepoActionsRuns(owner, repo, 1, 10, token);
    res.json(data);
  } catch (error) {
    console.error('Fetch CI runs error:', error.message);
    if (error.response && error.response.status === 404) {
      // Actions might be disabled or not exist
      return res.json({ workflow_runs: [] });
    }
    res.status(500).json({ error: 'Failed to fetch CI runs' });
  }
});

module.exports = router;
