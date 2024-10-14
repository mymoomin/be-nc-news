const express = require("express");

const app = express();

app.all("*", (request, response, next) => {
  response.status(404).send({ msg: "unknown endpoint" });
});

app.use((error, request, response, next) => {
  if (error.status && error.msg) {
    response.status(error.status).send({ msg: error.msg });
  }
});

app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send({ msg: `Unknown error: ${error}` });
});

module.exports = app;
