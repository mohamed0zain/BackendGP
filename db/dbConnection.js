const mysql = require("mysql");
const util = require('util');
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "demobackend3",
  port: "3306",
});
connection.query = util.promisify(connection.query);
connection.connect((err) => {
  if (err) throw err;
  console.log("DB CONNECTED");
});

module.exports = connection;
