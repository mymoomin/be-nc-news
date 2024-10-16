# Northcoders News API

This project is an example API for a fake news site. You can interact with the API online [here](https://be-nc-news-rjwo.onrender.com/api/).

## Setup

1. Make sure you have Node.js version 14 or higher and Postgres version 16 or higher installed
2. Clone the repo
3. Create a `.env.development` file with the line `PGDATABASE=nc_news` and a `.env.test` file with the line `PGDATABASE=nc_news_test`
4. Run `npm run setup_dbs` to create the databases
5. Run `npm seed` to seed the development database
6. You can now use `npm test` to run the tests and `npm start` to start the server on port 9090

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
