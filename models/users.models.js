const db = require("../db/connection.js");

exports.fetchUsers = () => {
  return db.query("SELECT * FROM users;").then(({ rows: users }) => users);
};

exports.fetchUserByUsername = (username) => {
  return db
    .query("SELECT * FROM users WHERE username = $1", [username])
    .then(({ rows: users }) => {
      if (!users.length) {
        return Promise.reject({ status: 404, msg: "User not found" });
      }
      return users[0];
    });
};
