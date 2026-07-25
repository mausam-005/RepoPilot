const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const githubService = require('../services/github.service');

// GET /api/analytics
router.get('/', async (req, res) => {
  try {
    const token = req.user ? req.user.githubToken : null;
    const bookmarks = await Bookmark.find({ userId: req.user._id });
    
    // Aggregate Languages
    const languageMap = {};
    let totalStars = 0;
    
    bookmarks.forEach(b => {
      if (b.language) {
        languageMap[b.language] = (languageMap[b.language] || 0) + 1;
      }
      totalStars += (b.stars || 0);
    });

    const languageData = Object.entries(languageMap).map(([name, value]) => ({ name, value }));

    // Compute basic velocity metrics from GitHub if token is available
    let totalOpenIssues = 0;
    let totalRepos = bookmarks.length;
    let activityTimeline = [];

    if (totalRepos > 0) {
      // Fetch data for top 3 repos to avoid rate limits
      const topRepos = [...bookmarks].sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, 3);
      
      const timelineMap = {};
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        timelineMap[d.toISOString().split('T')[0]] = 0;
      }

      await Promise.all(topRepos.map(async (repo) => {
        try {
          const [owner, name] = repo.repoFullName.split('/');
          
          // Fetch repo details to get open issues
          const repoDetails = await githubService.getRepo(owner, name, token);
          totalOpenIssues += repoDetails.open_issues_count;

          // Fetch recent issues as a proxy for "activity"
          const issues = await githubService.getRepoIssues(owner, name, 'all', 1, 30, token);
          
          issues.forEach(issue => {
            const dateStr = new Date(issue.created_at).toISOString().split('T')[0];
            if (timelineMap[dateStr] !== undefined) {
              timelineMap[dateStr] += 1;
            }
          });
        } catch (err) {
          console.error(`Failed to fetch analytics for ${repo.repoFullName}:`, err.message);
        }
      }));
      
      activityTimeline = Object.entries(timelineMap).map(([date, count]) => ({
        date: date.substring(5), // MM-DD
        activity: count
      }));
    }

    res.json({
      metrics: {
        totalRepos,
        totalStars,
        totalOpenIssues,
        healthScore: totalRepos === 0 ? 0 : Math.max(1, 10 - Math.min(9, Math.floor(totalOpenIssues / (Math.max(totalRepos, 1) * 5))))
      },
      languageData,
      activityTimeline
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
