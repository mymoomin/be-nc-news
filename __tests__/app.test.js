const request = require("supertest");

const app = require("../app.js");

describe("/api/*", () => {
  test("ANY: 404 -- responds with a 404 Not Found and appropriate error message for an unknown url and/or method", () => {
    return request(app)
      .get("/api/not-an-endpoint")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("unknown endpoint");
      });
  });
});
