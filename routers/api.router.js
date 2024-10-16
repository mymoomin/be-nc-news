const { getApi } = require("../controllers/api.controllers.js");

const articlesRouter = require("./articles.router.js");
const commentsRouter = require("./comments.router.js");
const topicsRouter = require("./topics.router.js");
const usersRouter = require("./users.router.js");

const apiRouter = require("express").Router();

apiRouter.get("/", getApi);

apiRouter.use("/articles", articlesRouter);

apiRouter.use("/topics", topicsRouter);

apiRouter.use("/comments", commentsRouter);

apiRouter.use("/users", usersRouter);

module.exports = apiRouter;
