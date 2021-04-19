const config = require('./config');
const Api = require('./Api')
const Utils = require('./Utils')

console.log('Read config:', config);
const api = new Api(config);
const utils = new Utils(api);

const doReport = async () => {
  const comments = await utils.getAllComments(config.target);
  comments.forEach(c => {
    console.log(new Date(c.createdDate), c.pullRequestId);
    console.log(c.pullRequestUrl);
    console.log(c.comment);
  });
  // TODO: console log PR count
  console.log(`Comments where ${config.target.user} is a reviwer: ${comments.length}`);
  console.log(`Unique PRs with comments: ${(new Set(comments.map(c => c.pullRequestUrl)).size)}`)
};

doReport();
