require('dotenv').config();
const githubService = require('./src/services/github.service');

githubService.searchRepos('react')
  .then(res => console.log('Success:', res.items ? res.items.length : 'no items'))
  .catch(err => console.error('Error:', err.response ? err.response.data : err.message));
