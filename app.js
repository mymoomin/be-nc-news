const express = require("express");

const endpoints = require("./endpoints.json");
const { getTopics } = require("./controllers/topics.controllers.js");
const { getArticleById } = require("./controllers/articles.controllers.js");

const app = express();

app.get("/api", (request, response, next) => {
  response.status(200).send({ endpoints });
});

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

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
  console.log(error);
  response.status(500).send({ msg: `Unknown error: ${error}` });
});

module.exports = app;
