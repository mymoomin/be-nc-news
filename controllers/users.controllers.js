const { fetchUsers, fetchUserByUsername } = require("../models/users.models");

exports.getUsers = (request, response, next) => {
  return fetchUsers()
    .then((users) => response.status(200).send({ users }))
    .catch(next);
};

exports.getUserByUsername = (request, response, next) => {
  const { username } = request.params;
  return fetchUserByUsername(username)
    .then((user) => response.status(200).send({ user }))
    .catch(next);
};
