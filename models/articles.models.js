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

/**
 * Returns all comments associated with a given article.
 * Responds with status 404 if the article does not exist.
 *
 * @param {number} article_id
 * @returns
 */
exports.fetchCommentsByArticleId = (article_id) => {
  /*
  We need to reject if the article isn't in the database.
  A simple way to do this would be to first get all comments for the article with
  `db.query("SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;")`,
  and then, if there aren't any, check whether the article exists with
  `db.query("SELECT * FROM articles WHERE article_id = $1;")`.
  This works but requires two queries.

  We can use a right join on `article_id` to do it in one.
  With this query, all existing articles will have at least one row, so we reject if there aren't any.
  An article with no comments will have one row which is all nulls, so we return an empty array.
  Otherwise, we return the response as normal.
  */
  return db
    .query(
      `SELECT
        comments.*
      FROM
        comments
        RIGHT JOIN articles ON articles.article_id = comments.article_id
      WHERE
        articles.article_id = $1
      ORDER BY
        comments.created_at DESC
      ;`,
      [article_id]
    )
    .then(({ rows: comments }) => {
      if (!comments.length) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      if (comments.length === 1 && comments[0].comment_id === null) {
        return [];
      }
      return comments;
    });
};
