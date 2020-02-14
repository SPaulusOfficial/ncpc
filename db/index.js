const { Client } = require("pg");
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  sll: true
});

client.connect();

module.exports = client;