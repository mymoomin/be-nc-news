const {
  fetchArticleById,
  fetchArticles,
  fetchCommentsByArticleId,
  insertCommentByArticleId,
  incrementArticleVotesById,
} = require("../models/articles.models");

exports.getArticleById = (request, response, next) => {
  const { article_id } = request.params;
  return fetchArticleById(article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (request, response, next) => {
  const { sort_by, order } = request.query;
  return fetchArticles(sort_by, order)
    .then((articles) => {
      response.status(200).send({ articles });
    })
    .catch(next);
};

exports.getCommentsByArticleId = (request, response, next) => {
  const { article_id } = request.params;
  return fetchCommentsByArticleId(article_id)
    .then((comments) => {
      response.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentByArticleId = (request, response, next) => {
  const { article_id } = request.params;
  const comment = request.body;
  return insertCommentByArticleId(article_id, comment)
    .then((comment) => {
      response.status(201).send({ comment });
    })
    .catch(next);
};

exports.patchArticleById = (request, response, next) => {
  const { article_id } = request.params;
  const { inc_votes } = request.body;
  return incrementArticleVotesById(article_id, inc_votes)
    .then((article) => response.status(200).send({ article }))
    .catch(next);
};
