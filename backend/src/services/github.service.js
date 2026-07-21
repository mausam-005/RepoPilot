const axios = require('axios');

const getClient = (userToken = null) => {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'RepoPilot-App'
  };
  
  if (userToken) {
    headers['Authorization'] = `token ${userToken}`;
  } else if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  
  return axios.create({
    baseURL: 'https://api.github.com',
    headers
  });
};

module.exports = {
  async searchRepos(query, sort = 'stars', order = 'desc', page = 1, perPage = 30, userToken = null) {
    const { data } = await getClient(userToken).get('/search/repositories', {
      params: { q: query, sort, order, page, per_page: perPage }
    });
    return data;
  },

  async getRepo(owner, repo, userToken = null) {
    const { data } = await getClient(userToken).get(`/repos/${owner}/${repo}`);
    return data;
  },

  async getRepoIssues(owner, repo, state = 'all', page = 1, perPage = 30, userToken = null) {
    const { data } = await getClient(userToken).get(`/repos/${owner}/${repo}/issues`, {
      params: { state, page, per_page: perPage }
    });
    return data;
  },

  async createIssue(owner, repo, title, body, userToken = null) {
    const { data } = await getClient(userToken).post(`/repos/${owner}/${repo}/issues`, { title, body });
    return data;
  },

  async updateIssue(owner, repo, issueNumber, updateData, userToken = null) {
    const { data } = await getClient(userToken).patch(`/repos/${owner}/${repo}/issues/${issueNumber}`, updateData);
    return data;
  },

  async searchUserIssues(username, userToken = null) {
    const { data } = await getClient(userToken).get('/search/issues', {
      params: { q: `author:${username} type:issue`, sort: 'created', order: 'desc' }
    });
    return data.items;
  }
};
