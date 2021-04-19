class Utils {

  constructor(api) {
    this.api = api;
  }

  getPullRequestsByUser = async (repo, user) => {
    const pullRequests = await this.api.getPullRequests(repo); 
    return pullRequests.filter(pullRequest => 
      pullRequest.reviewers.filter(reviewer => reviewer.user.name === user)
      .length == 1);
  };

  getSubComments = comments => {
    let subComments = comments.map(comment => {
      return {
        createdDate: comment.createdDate,
        comment: comment.text,
        user: comment.author.name,
      };
    });
    comments.forEach(comment => {
      if(comment.comments.length > 0) {
        subComments = [...subComments, ...this.getSubComments(comment.comments)];
      }
    })
    return subComments;
  }

  getCommentsForPullRequest = async (repo, pullRequest, user) => {
    const activites = await this.api.getActivities(repo, pullRequest.id);
    const commentActivites = activites.filter(
      activity => activity.action === "COMMENTED" && activity.comment
    );
    let comments = commentActivites.filter(
      activity => activity.user.name === user
    ).map(activity => {
      return {
        createdDate: activity.createdDate,
        comment: activity.comment.text,
        pullRequestId: pullRequest.id,
        pullRequestUrl: pullRequest.links.self[0].href,
      };
    });

    commentActivites.forEach(activity => {
      const subComments = this.getSubComments(activity.comment.comments)
      .filter(comment => comment.user === user)
      .map(comment => {
        return {
          createdDate: comment.createdDate,
          comment: comment.comment,
          pullRequestId: pullRequest.id,
          pullRequestUrl: pullRequest.links.self[0].href,
        };
      });
      comments = [...comments, ...subComments];
    });
    return comments;
  }

  getCommentsForRepo = async (repo, user, dateFrom) => {
    const allPullRequests = await this.getPullRequestsByUser(repo, user);
    const targetPullRequests = allPullRequests.filter(pullRequest =>
      new Date(pullRequest.createdDate) > new Date(dateFrom)
    );
    const commentsPerPullRequest = await Promise.all(targetPullRequests.map(pullRequest => {
      return this.getCommentsForPullRequest(repo, pullRequest, user); 
    }));
    const allComments = [].concat(...commentsPerPullRequest);
    return allComments;
  }

  getAllComments = async ({repos, user, dateFrom}) => {
    const commentsPerRepo = await Promise.all(repos.map(repo => {
      return this.getCommentsForRepo(repo, user, dateFrom); 
    }));
    const allComments = [].concat(...commentsPerRepo);
    return allComments;
  };
};

module.exports = Utils;
