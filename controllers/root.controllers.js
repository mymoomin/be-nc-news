const endpoints = require("../endpoints.json");

exports.getRoot = (request, response, next) => {
  response.status(200).send({ endpoints });
};
