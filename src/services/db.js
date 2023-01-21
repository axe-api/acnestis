const db = require("knex")({
  client: "mysql",
  connection: {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "12345678",
    database: "xblog",
  },
});

module.exports = {
  db,
};
