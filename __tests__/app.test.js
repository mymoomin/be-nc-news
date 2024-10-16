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

  test("GET?sort_by=: 200 -- responds with an array sorted by the given column", () => {
    // possibly more tests than necessary
    return Promise.all([
      request(app)
        .get("/api/articles?sort_by=created_at")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(13);
          expect(articles).toBeSortedBy("created_at", { descending: true });
        }),
      request(app)
        .get("/api/articles?sort_by=author")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(13);
          expect(articles).toBeSortedBy("author", { descending: true });
        }),
      request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(13);
          expect(articles).toBeSortedBy("title", { descending: true });
        }),
      request(app)
        .get("/api/articles?sort_by=article_id")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(13);
          expect(articles).toBeSortedBy("article_id", { descending: true });
        }),
      request(app)
        .get("/api/articles?sort_by=topic")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(13);
          expect(articles).toBeSortedBy("topic", { descending: true });
        }),
      request(app)
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(13);
          expect(articles).toBeSortedBy("votes", { descending: true });
        }),
      request(app)
        .get("/api/articles?sort_by=article_img_url")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(13);
          expect(articles).toBeSortedBy("article_img_url", {
            descending: true,
          });
        }),
      request(app)
        .get("/api/articles?sort_by=comment_count")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(13);
          expect(articles).toBeSortedBy("comment_count", { descending: true });
        }),
    ]);
  });
  test("GET?sort_by=: 400 -- responds with 400 Bad Request and an appropriate error message when the column name is invalid or missing", () => {
    return Promise.all([
      request(app)
        .get("/api/articles?sort_by=created_date")
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe("Unknown column name")),
      request(app)
        .get("/api/articles?sort_by=1")
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe("Unknown column name")),
      request(app)
        .get("/api/articles?sort_by={'a': 'b'}")
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe("Unknown column name")),
      request(app)
        .get("/api/articles?sort_by")
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe("Missing column name")),
      request(app)
        .get("/api/articles?sort_by=")
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe("Missing column name")),
    ]);
  });

  test("GET?order=: 200 -- responds with an array sorted in the given order", () => {
    return Promise.all([
      request(app)
        .get("/api/articles?order=desc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(13);
          expect(articles).toBeSortedBy("created_at", { descending: true });
        }),
      request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(13);
          expect(articles).toBeSortedBy("created_at", { descending: false });
        }),
    ]);
  });
  test("GET?order=: 400 -- responds with 400 Bad Request and an appropriate error message when the sort order is invalid or missing", () => {
    return Promise.all([
      request(app)
        .get("/api/articles?order=ascending")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Sort order must be 'asc' or 'desc'");
        }),
      request(app)
        .get("/api/articles?order=desc; SELECT * FROM users; --")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Sort order must be 'asc' or 'desc'");
        }),
      request(app)
        .get("/api/articles?order")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Sort order must be 'asc' or 'desc'");
        }),
    ]);
  });

  test("GET?topic=: 200 -- responds with an array of all articles with the given topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(12);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("GET?topic=: 200 -- responds with an empty array when no articles have that topic", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body: { articles } }) => expect(articles).toHaveLength(0));
  });

  test("GET?topic=: 404 -- responds 404 Not Found when the topic doesn't exist", () => {
    return Promise.all([
      request(app)
        .get("/api/articles?topic=not-a-topic")
        .expect(404)
        .then(({ body: { msg } }) => expect(msg).toBe("Topic not found")),
      request(app)
        .get("/api/articles?topic=")
        .expect(404)
        .then(({ body: { msg } }) => expect(msg).toBe("Topic not found")),
    ]);
  });
});

describe("/api/articles/:article_id", () => {
  test("GET: 200 -- responds with the article with the given ID", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          article_id: 1,
          body: "I find this existence challenging",
          topic: "mitch",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: 11,
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

  test("PATCH: 200 -- updates the article's votes and responds with the article data", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -40 })
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          article_id: 1,
          body: "I find this existence challenging",
          topic: "mitch",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 60,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("PATCH: 404 -- responds with 404 Not Found and an appropriate error message when the article does not exist", () => {
    return request(app)
      .patch("/api/articles/1000")
      .send({ inc_votes: -40 })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });
  test("PATCH: 400 -- responds with 400 Bad Request and an appropriate error message when the body is missing its `inc_votes` property", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ increment_votes: -40 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Missing required property: inc_votes");
      });
  });
  test("PATCH: 400 -- responds with 400 Bad Request and an appropriate error message when the `inc_votes` property isn't a valid number", () => {
    return Promise.all([
      request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: "hii" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid input");
        }),
      request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: Infinity })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid input");
        }),
      request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: NaN })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid input");
        }),
    ]);
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("GET: 200 -- responds with an array of the comments on the article with the given ID", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(2);
        comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id", expect.any(Number));
          expect(comment).toHaveProperty("votes", expect.any(Number));
          expect(comment).toHaveProperty("created_at", expect.any(String));
          expect(new Date(comment.created_at)).not.toBeNaN();
          expect(comment).toHaveProperty("author", expect.any(String));
          expect(comment).toHaveProperty("body", expect.any(String));
          expect(comment).toHaveProperty("article_id", 3);
        });
        expect(comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("GET: 200 -- responds with an empty array if the article has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toStrictEqual([]);
      });
  });
  test("GET: 404 -- responds with 404 Not Found and an appropriate error message when the article does not exist", () => {
    return request(app)
      .get("/api/articles/10000/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });
  test("GET: 400 -- responds with 400 Bad Request and an appropriate error message when the request is invalid", () => {
    return request(app)
      .get("/api/articles/not-a-number/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid input");
      });
  });

  test("POST: 201 -- inserts the comment into the database and responds with the new comment", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ username: "lurker", body: "This is a comment" })
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toHaveProperty("comment_id", 19);
        expect(comment).toHaveProperty("votes", 0);
        expect(comment).toHaveProperty("created_at", expect.any(String));
        expect(new Date(comment.created_at)).not.toBeNaN();
        expect(comment).toHaveProperty("author", "lurker");
        expect(comment).toHaveProperty("body", "This is a comment");
        expect(comment).toHaveProperty("article_id", 1);
      });
  });

  test("POST: 404 -- responds with 404 Not Found and an appropriate error message when the article does not exist", () => {
    return request(app)
      .post("/api/articles/10000/comments")
      .send({ username: "lurker", body: "This is a comment" })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });
  test("POST: 404 -- responds with 404 Not Found and an appropriate error message when the user does not exist", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ username: "NotAUser", body: "This is a comment" })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("User not found");
      });
  });

  test("POST: 400 -- responds with 400 Bad Request and an appropriate error message when the article ID is invalid", () => {
    return request(app)
      .post("/api/articles/not-a-number/comments")
      .send({ username: "lurker", body: "This is a comment" })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid input");
      });
  });
  test("POST: 400 -- responds with 400 Bad Request and an appropriate error message when the post body is missing required properties", () => {
    return Promise.all([
      request(app)
        .post("/api/articles/1/comments")
        .send({ body: "This is a comment" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Missing required properties: username");
        }),
      request(app)
        .post("/api/articles/1/comments")
        .send({ username: "lurker" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Missing required properties: body");
        }),
      request(app)
        .post("/api/articles/1/comments")
        .send({})
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Missing required properties: username, body");
        }),
    ]);
  });
});

describe("/api/comments/:comment_id", () => {
  test("DELETE: 204 -- deletes the comment from the database", () => {
    return request(app)
      .delete("/api/comments/3")
      .expect(204)
      .then(() => db.query("SELECT * FROM comments WHERE comment_id = 3"))
      .then(({ rows: comments }) => expect(comments).toHaveLength(0));
  });
  test("DELETE: 404 -- responds with 404 Not Found and an appropriate error message when the comment does not exist", () => {
    return request(app)
      .delete("/api/comments/1000")
      .expect(404)
      .then(({ body: { msg } }) => expect(msg).toBe("Comment not found"));
  });
  test("DELETE: 400 -- responds with 400 Bad Request and an appropriate error message when the comment ID is invalid", () => {
    return request(app)
      .delete("/api/comments/not-a-number")
      .expect(400)
      .then(({ body: { msg } }) => expect(msg).toBe("Invalid input"));
  });
});

describe("/api/users", () => {
  test("GET: 200 -- responds with an array containing every user", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toHaveProperty("username", expect.any(String));
          expect(user).toHaveProperty("name", expect.any(String));
          expect(user).toHaveProperty("avatar_url", expect.any(String));
          expect(() => new URL(user.avatar_url)).not.toThrow();
        });
      });
  });
});

describe("/api/users/:username", () => {
  test("GET: 200 -- responds with the user with the given username", () => {
    return request(app)
      .get("/api/users/icellusedkars")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toMatchObject({
          username: "icellusedkars",
          name: "sam",
          avatar_url:
            "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
        });
      });
  });
  test("GET: 404 -- responds with a 404 Not Found and appropriate error message when the user does not exist", () => {
    return request(app)
      .get("/api/users/not-a-user")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("User not found");
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
