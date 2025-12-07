const express = require('express');
const githubService = require('../services/github.service');
const router = express.Router();

const Issue = require('../models/Issue');

router.post('/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { title, body } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const data = await githubService.createIssue(owner, repo, title, body);
    
    await Issue.create({
      userId: req.user.id,
      issueNumber: data.number,
      title: data.title,
      body: data.body,
      state: data.state,
      repoOwner: owner,
      repoName: repo,
      htmlUrl: data.html_url,
      createdBy: data.user.login
    });
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Create issue error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      message: error.response?.data?.message || 'Failed to create issue',
      error: error.response?.data
    });
  }
});

router.patch('/:owner/:repo/:issueNumber', async (req, res) => {
  try {
    const { owner, repo, issueNumber } = req.params;
    const data = await githubService.updateIssue(owner, repo, issueNumber, req.body);
    
    await Issue.findOneAndUpdate(
      { userId: req.user.id, repoOwner: owner, repoName: repo, issueNumber: parseInt(issueNumber) },
      { state: data.state, title: data.title, body: data.body },
      { new: true }
    );
    
    res.json(data);
  } catch (error) {
    console.error('Update issue error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      message: error.response?.data?.message || 'Failed to update issue',
      error: error.response?.data
    });
  }
});

module.exports = router;
