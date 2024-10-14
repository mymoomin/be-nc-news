const request = require("supertest");

const db = require("../db/connection.js");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed.js");

const app = require("../app.js");

const endpoints = require("../endpoints.json");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  db.end();
});

describe("/api", () => {
  test("GET: 200 -- responds with a json representation of all the available endpoints of the api", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((res) => {
        expect(res.body.endpoints).toStrictEqual(endpoints);
      });
  });
});

describe("/api/topics", () => {
  test("GET: 200 -- responds with an array of all topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((res) => {
        const topics = res.body.topics;
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug", expect.any(String));
          expect(topic).toHaveProperty("description", expect.any(String));
        });
      });
  });
});

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
