const endpoints = require("../endpoints.json");

exports.getRoot = (request, response, next) => {
  return response.status(200).send({ endpoints });
};
