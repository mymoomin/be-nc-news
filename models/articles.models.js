const db = require("../db/connection.js");

exports.fetchArticles = () => {
  return db
    .query(
      `SELECT
        a.author,
        a.title,
        a.article_id,
        a.topic,
        a.created_at,
        a.votes,
        a.article_img_url,
        COUNT(comments.comment_id)::INT as comment_count
      FROM 
        articles AS a 
        LEFT JOIN comments ON a.article_id = comments.article_id
      GROUP BY
        a.article_id
      ORDER BY
        created_at DESC`
    )
    .then(({ rows: articles }) => articles);
};

exports.fetchArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows: articles }) => {
      if (!articles.length) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return articles[0];
    });
};
