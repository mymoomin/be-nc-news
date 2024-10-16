const express = require("express");

const apiRouter = require("./routers/api.router.js");

const app = express();

app.use(express.json());

// Logging for render.com
app.use((request, response, next) => {
  if (process.env.NODE_ENV === "production") {
    console.log(request.method, request.url);
  }
  next();
});

// All API routes
app.use("/api", apiRouter);

// This has to stay in app.js because we need a 404 for all pages outside of /api/
app.all("*", (request, response, next) => {
  response.status(404).send({ msg: "unknown endpoint" });
});

// Handles custom errors
app.use((error, request, response, next) => {
  if (error.status && error.msg) {
    response.status(error.status).send({ msg: error.msg });
  } else {
    next(error);
  }
});

// Handles Postgres errors
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

// Handles unforeseen errors. If anything reaches here it's a bug.
app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send({ msg: `Unknown error: ${error}` });
});

module.exports = app;
