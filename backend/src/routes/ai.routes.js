const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');
const ChatHistory = require('../models/ChatHistory');

// All routes here should be protected by the auth middleware in server.js

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { owner, repo, question, history } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Missing required question parameter' });
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

// POST /api/ai/review-pr
router.post('/review-pr', async (req, res) => {
  try {
    const { owner, repo, pullNumber } = req.body;
    if (!owner || !repo || !pullNumber) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const token = req.user ? req.user.githubToken : null;
    
    const review = await aiService.reviewPullRequest(owner, repo, pullNumber, token);
    res.json({ review });
  } catch (error) {
    console.error('Review PR endpoint error:', error);
    res.status(500).json({ error: 'Failed to generate PR review' });
  }
});

// GET /api/ai/history
router.get('/history', async (req, res) => {
  try {
    const history = await ChatHistory.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(history);
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// POST /api/ai/history
router.post('/history', async (req, res) => {
  try {
    const { owner, repo, isGlobal, messages } = req.body;
    let chat = await ChatHistory.findOne({ user: req.user._id, owner: owner || null, repo: repo || null, isGlobal });
    
    if (chat) {
      chat.messages = messages;
      await chat.save();
    } else {
      chat = await ChatHistory.create({
        user: req.user._id,
        owner: owner || null,
        repo: repo || null,
        isGlobal,
        messages
      });
    }
    res.json(chat);
  } catch (error) {
    console.error('Save history error:', error);
    res.status(500).json({ error: 'Failed to save chat history' });
  }
});

// DELETE /api/ai/history/:id
router.delete('/history/:id', async (req, res) => {
  try {
    await ChatHistory.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({ error: 'Failed to delete chat history' });
  }
});

module.exports = router;
