const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');

// All routes here should be protected by the auth middleware in server.js

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { owner, repo, question, history } = req.body;
    if (!owner || !repo || !question) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Fallback to guest if auth middleware is not applied, but ideally it is.
    const token = req.user ? req.user.githubToken : null;
    
    const response = await aiService.chatWithRepo(owner, repo, question, history || [], token);
    res.json({ response });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI' });
  }
});

// POST /api/ai/security-scan
router.post('/security-scan', async (req, res) => {
  try {
    const { owner, repo } = req.body;
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const token = req.user ? req.user.githubToken : null;
    
    const report = await aiService.scanSecurity(owner, repo, token);
    res.json(report);
  } catch (error) {
    console.error('Security scan endpoint error:', error);
    res.status(500).json({ error: 'Failed to run security scan' });
  }
});

// POST /api/ai/repo-health
router.post('/repo-health', async (req, res) => {
  try {
    const { owner, repo } = req.body;
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const token = req.user ? req.user.githubToken : null;
    
    const health = await aiService.getRepoHealth(owner, repo, token);
    res.json(health);
  } catch (error) {
    console.error('Repo health endpoint error:', error);
    res.status(500).json({ error: 'Failed to get repo health' });
  }
});

module.exports = router;
