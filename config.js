const config = {
  baseUrl: 'https://your.bitbucket.com/',
  username: 'your.username', 
  password: 'your.password',
  target: {
    dateFrom: 'yyyy-MM-dd',
    user: 'his.username',
    repos: [{
      name: 'repo1',
      project: 'P1'
    },{
      name: 'repo2',
      project: 'P2'
    }]
  }
};

module.exports = config;