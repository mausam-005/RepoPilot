const axios = require('axios');

const githubAPI = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'RepoPilot-App'
  }
});

if (process.env.GITHUB_TOKEN) {
  githubAPI.defaults.headers.common['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  console.log('✅ GitHub token loaded:', process.env.GITHUB_TOKEN.substring(0, 10) + '...');
} else {
  console.warn('⚠️  No GitHub token found - rate limits will be low');
}

module.exports = {
  async searchRepos(query, sort = 'stars', order = 'desc', page = 1, perPage = 30) {
    const { data } = await githubAPI.get('/search/repositories', {
      params: { q: query, sort, order, page, per_page: perPage }
    });
    return data;
  },

  async getRepo(owner, repo) {
    const { data } = await githubAPI.get(`/repos/${owner}/${repo}`);
    return data;
  },

  async getRepoIssues(owner, repo, state = 'all', page = 1, perPage = 30) {
    const { data } = await githubAPI.get(`/repos/${owner}/${repo}/issues`, {
      params: { state, page, per_page: perPage }
    });
    return data;
  },

  async createIssue(owner, repo, title, body) {
    const { data } = await githubAPI.post(`/repos/${owner}/${repo}/issues`, { title, body });
    return data;
  },

  async updateIssue(owner, repo, issueNumber, updateData) {
    const { data } = await githubAPI.patch(`/repos/${owner}/${repo}/issues/${issueNumber}`, updateData);
    return data;
  }
};
