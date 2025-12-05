const express = require('express');
const githubService = require('../services/github.service');
const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q, sort, order, page, per_page } = req.query;
    const data = await githubService.searchRepos(q || 'stars:>1', sort, order, page, per_page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search repositories' });
  }
});

router.get('/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const data = await githubService.getRepo(owner, repo);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Repository not found' });
  }
});

router.get('/:owner/:repo/issues', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state, page, per_page } = req.query;
    const data = await githubService.getRepoIssues(owner, repo, state, page, per_page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
});

module.exports = router;
