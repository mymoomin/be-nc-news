const db = require("../db/connection.js");

exports.removeCommentById = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING comment_id;", [
      comment_id,
    ])
    .then(({ rows: comments }) => {
      if (!comments.length) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    });
};
