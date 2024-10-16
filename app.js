const express = require("express");

const { getTopics } = require("./controllers/topics.controllers.js");
const { getRoot } = require("./controllers/root.controllers.js");
const {
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
} = require("./controllers/articles.controllers.js");
const { deleteCommentById } = require("./controllers/comments.controllers.js");
const { getUsers } = require("./controllers/users.controllers.js");

const app = express();

app.use(express.json());

app.use((request, response, next) => {
  if (process.env.NODE_ENV === "production") {
    console.log(request.method, request.url);
  }
  next();
});

app.get("/api", getRoot);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.patch("/api/articles/:article_id", patchArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.get("/api/users", getUsers);

app.all("*", (request, response, next) => {
  response.status(404).send({ msg: "unknown endpoint" });
});

app.use((error, request, response, next) => {
  if (error.status && error.msg) {
    response.status(error.status).send({ msg: error.msg });
  } else {
    next(error);
  }
});

app.use((error, request, response, next) => {
  // 22P02: wrong type, 23502: unexpected null
  if (error.code === "22P02" || error.code === "23502") {
    response.status(400).send({ msg: "Invalid input" });
  } else if (error.code === "42703") {
    response.status(400).send({ msg: "Unknown column name" });
  } else if (error.code === "42601") {
    response.status(400).send({ msg: "Missing column name" });
  } else {
    next(error);
  }
});

app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send({ msg: `Unknown error: ${error}` });
});

module.exports = app;
