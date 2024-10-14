const {
  fetchArticleById,
  fetchArticles,
  fetchCommentsByArticleId,
  insertCommentByArticleId,
} = require("../models/articles.models");

exports.getArticleById = (request, response, next) => {
  const { article_id } = request.params;
  fetchArticleById(article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (request, response, next) => {
  fetchArticles()
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
  insertCommentByArticleId(article_id, comment)
    .then((comment) => {
      response.status(201).send({ comment });
    })
    .catch(next);
};
