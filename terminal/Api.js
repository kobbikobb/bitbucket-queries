const axios = require('axios');

const getPullRequstsUrl = (baseUrl, project, repo, start) =>
 `${baseUrl}/rest/api/1.0/projects/${project}/repos/${repo}/pull-requests?state=all&limit=100&start=${start}`;

 const getActivitiesUrl = (baseUrl, project, repo, pullRequestId) =>
 `${baseUrl}/rest/api/1.0/projects/${project}/repos/${repo}/pull-requests/${pullRequestId}/activities`;


class Api {

  constructor({baseUrl, username, password}) {
    this.baseUrl = baseUrl;
    this.headers = {auth: {
      username,
      password
    }};
  }

  validateRepo = (repo) => {
    if(!repo.project || !repo.name) {
      throw new Error('Project and repo name are required.');
    }
  }

  getPullRequests = async (repo, start = 0) => {
    this.validateRepo(repo);
    const url = getPullRequstsUrl(this.baseUrl, repo.project, repo.name, start);
    const response = await axios.get(url, this.headers);

    const page = response.data;
    const values = page.values;
    const nextPageStart = page.nextPageStart;
  
    if(nextPageStart >= 500) {
      return values;
    }
        
    const nextValues = await this.getPullRequests(repo, nextPageStart);
    return ([...values, ...nextValues]);
  };

  getActivities = async (repo, pullRequestId) => {
    this.validateRepo(repo);
    const url = getActivitiesUrl(this.baseUrl, repo.project, repo.name, pullRequestId);
    const response = await axios.get(url, this.headers);
    const page = response.data;
    return page.values;
  }

};

module.exports = Api;

