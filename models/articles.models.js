const db = require("../db/connection.js");

exports.fetchArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows: articles }) => {
      return articles[0];
    });
};
