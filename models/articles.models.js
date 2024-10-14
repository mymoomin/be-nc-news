const db = require("../db/connection.js");
const { articleData } = require("../db/data/test-data/index.js");

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

const fetchArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows: articles }) => {
      if (!articles.length) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return articles[0];
    });
};

exports.fetchArticleById = fetchArticleById;

// rejects if the user doesn't exist
const checkUserExists = (username) => {
  return db
    .query("SELECT * FROM users WHERE username = $1", [username])
    .then(({ rows: users }) => {
      if (!users.length)
        return Promise.reject({ status: 404, msg: "User not found" });
    });
};

exports.fetchCommentsByArticleId = (article_id) => {
  // `fetchArticleById` will reject with a 404 if the article doesn't exist
  return Promise.all([
    db.query(
      "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;",
      [article_id]
    ),
    fetchArticleById(article_id),
  ]).then(([{ rows: comments }]) => {
    return comments;
  });
};

exports.insertCommentByArticleId = (article_id, comment) => {
  const requiredProperties = ["username", "body"];
  if (
    requiredProperties.some((property) => !comment.hasOwnProperty(property))
  ) {
    return Promise.reject({ status: 400, msg: "Missing required property" });
  }
  const { username, body } = comment;
  return Promise.all([
    checkArticleExists(article_id),
    checkUserExists(username),
  ])
    .then(() =>
      db.query(
        "INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *;",
        [article_id, username, body]
      )
    )
    .then(({ rows: comments }) => {
      return comments[0];
    });
};
