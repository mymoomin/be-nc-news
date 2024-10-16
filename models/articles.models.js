const db = require("../db/connection.js");
const format = require("pg-format");

exports.fetchArticles = (sort_by = "created_at", order = "desc", topic) => {
  //greenlisting
  if (order !== "asc" && order !== "desc") {
    return Promise.reject({
      status: 400,
      msg: "Sort order must be 'asc' or 'desc'",
    });
  }

  let whereClause = "";
  if (topic !== undefined) {
    whereClause = format("WHERE topic = %L", topic);
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
    ${whereClause}
    GROUP BY
      a.article_id
    ORDER BY
      %I %s`,
    sort_by,
    order
  );
  articlesPromise = db.query(queryString);
  topicPromise = whereClause ? fetchTopicBySlug(topic) : true;
  return Promise.all([articlesPromise, topicPromise]).then(
    ([{ rows: articles }]) => articles
  );
};

const fetchArticleById = (article_id) => {
  return db
    .query(
      "SELECT articles.*, COUNT(comments.comment_id)::INT as comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id",
      [article_id]
    )
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

// rejects if the topic doesn't exist
// If we ever make a GET /api/topic/:slug endpoint I'll move this there
const fetchTopicBySlug = (slug) => {
  return db
    .query("SELECT * FROM topics WHERE slug = $1", [slug])
    .then(({ rows: users }) => {
      if (!users.length) {
        return Promise.reject({ status: 404, msg: "Topic not found" });
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
