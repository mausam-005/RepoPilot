const express = require('express');
const githubService = require('../services/github.service');
const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q, sort, order, page, per_page } = req.query;
    const token = req.user ? req.user.githubToken : null;
    
    let searchQuery = q || 'stars:>1';
    if (!searchQuery.includes('fork:')) {
      searchQuery += ' fork:true';
    }

    const data = await githubService.searchRepos(searchQuery, sort, order, page, per_page, token);
    res.json(data);
  } catch (error) {
    console.error('Search error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to search repositories' });
  }
});

router.get('/user/:username/issues', async (req, res) => {
  try {
    const { username } = req.params;
    const token = req.user ? req.user.githubToken : null;
    const data = await githubService.searchUserIssues(username, token);
    res.json(data);
  } catch (error) {
    console.error('User issues error:', error.message);
    res.status(500).json({ message: 'Failed to fetch user issues', error: error.message });
  }
});

router.get('/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = req.user ? req.user.githubToken : null;
    const data = await githubService.getRepo(owner, repo, token);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Repository not found' });
  }
});

router.get('/:owner/:repo/issues', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state, page, per_page } = req.query;
    const token = req.user ? req.user.githubToken : null;
    const data = await githubService.getRepoIssues(owner, repo, state, page, per_page, token);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
});

router.get('/:owner/:repo/pulls', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state, page, per_page } = req.query;
    const token = req.user ? req.user.githubToken : null;
    const data = await githubService.getRepoPullRequests(owner, repo, state, page, per_page, token);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pull requests' });
  }
});

module.exports = router;
