const axios = require('axios');

const getClient = (userToken = null, raw = false) => {
  const headers = {
    'Accept': raw ? 'application/vnd.github.v3.raw' : 'application/vnd.github.v3+json',
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
  async getReadme(owner, repo, userToken = null) {
    try {
      const { data } = await getClient(userToken, true).get(`/repos/${owner}/${repo}/readme`);
      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // No readme found
      }
      throw error;
    }
  },

  async getFileTree(owner, repo, branch = 'main', userToken = null) {
    try {
      // Get the default branch if branch is not provided
      if (branch === 'main') {
        const repoData = await getClient(userToken).get(`/repos/${owner}/${repo}`);
        branch = repoData.data.default_branch || 'main';
      }
      
      const { data } = await getClient(userToken).get(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
      return data.tree; // returns an array of file paths
    } catch (error) {
      console.error('Error fetching file tree:', error.message);
      return [];
    }
  },

  async getFile(owner, repo, path, userToken = null) {
    try {
      const { data } = await getClient(userToken, true).get(`/repos/${owner}/${repo}/contents/${path}`);
      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }
};
