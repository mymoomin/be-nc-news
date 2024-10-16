const db = require("../db/connection.js");
const format = require("pg-format");

exports.fetchArticles = (sort_by = "created_at", order = "desc") => {
  //greenlisting
  if (order !== "asc" && order !== "desc") {
    return Promise.reject({
      status: 400,
      msg: "Sort order must be 'asc' or 'desc'",
    });
  }
  const queryString = format(
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
    %I %s`,
    sort_by,
    order
  );
  return db.query(queryString).then(({ rows: articles }) => articles);
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
// If we ever make a GET /api/users/:username endpoint I'll move this there
const fetchUserByUsername = (username) => {
  return db
    .query("SELECT * FROM users WHERE username = $1", [username])
    .then(({ rows: users }) => {
      if (!users.length) {
        return Promise.reject({ status: 404, msg: "User not found" });
      }
      return users[0];
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
  // Check for properties
  const requiredProperties = ["username", "body"];
  const missingProperties = requiredProperties.filter(
    (property) => !(property in comment)
  );
  if (missingProperties.length) {
    return Promise.reject({
      status: 400,
      msg: `Missing required properties: ${missingProperties.join(", ")}`,
    });
  }

  // Only unpack once we've checked both properties exist
  const { username, body } = comment;

  // Check that the article and user both exist
  return Promise.all([
    fetchArticleById(article_id),
    fetchUserByUsername(username),
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

exports.incrementArticleVotesById = (article_id, inc_votes) => {
  if (inc_votes === undefined) {
    return Promise.reject({
      status: 400,
      msg: "Missing required property: inc_votes",
    });
  }
  return db
    .query(
      "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;",
      [inc_votes, article_id]
    )
    .then(({ rows: articles }) => {
      if (!articles.length) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }

      return articles[0];
    });
};
