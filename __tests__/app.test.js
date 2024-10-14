const request = require("supertest");

const db = require("../db/connection.js");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed.js");

const app = require("../app.js");

const endpointsFile = require("../endpoints.json");

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
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toStrictEqual(endpointsFile);
      });
  });
});

describe("/api/topics", () => {
  test("GET: 200 -- responds with an array of all topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug", expect.any(String));
          expect(topic).toHaveProperty("description", expect.any(String));
        });
      });
  });
});

describe("/api/articles", () => {
  test("GET: 200 -- responds with an array of all articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        articles.forEach((article) => {
          expect(article).toHaveProperty("author", expect.any(String));
          expect(article).toHaveProperty("title", expect.any(String));
          expect(article).toHaveProperty("article_id", expect.any(Number));
          expect(article).toHaveProperty("topic", expect.any(String));
          expect(article).toHaveProperty("created_at", expect.any(String));
          expect(new Date(article.created_at)).not.toBeNaN();
          expect(article).toHaveProperty("votes", expect.any(Number));
          expect(article).toHaveProperty("article_img_url", expect.any(String));
          expect(() => new URL(article.article_img_url)).not.toThrow();
          expect(article).toHaveProperty("comment_count", expect.any(Number));
          expect(article).not.toHaveProperty("body");
        });
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("GET: 200 -- responds with the article with the given ID", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toStrictEqual({
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          article_id: 1,
          body: "I find this existence challenging",
          topic: "mitch",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("GET: 404 -- responds with a 404 Not Found and appropriate error message when the article does not exist", () => {
    return request(app)
      .get("/api/articles/10000")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });
  test("GET: 400 -- responds with a 400 Bad Request and appropriate error message when the request is invalid", () => {
    return request(app)
      .get("/api/articles/not-a-number")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid input");
      });
  });
});

describe("/api/*", () => {
  test("ANY: 404 -- responds with a 404 Not Found and appropriate error message for an unknown url and/or method", () => {
    return request(app)
      .get("/api/not-an-endpoint")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("unknown endpoint");
      });
  });
});
