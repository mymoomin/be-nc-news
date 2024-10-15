const { removeCommentById } = require("../models/comments.models");

exports.deleteCommentById = (request, response, next) => {
  const { comment_id } = request.params;
  return removeCommentById(comment_id)
    .then(() => response.status(204).send())
    .catch(next);
};
