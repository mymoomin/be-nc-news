const { getTopics } = require("../controllers/topics.controllers.js");

const topicsRouter = require("express").Router();

topicsRouter.get("/", getTopics);

module.exports = topicsRouter;
