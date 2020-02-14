const { Client } = require("pg");
const client = new Client({
  connectionString: "postgres://u8abtc187h14lj:pdd45f5983896cccea970dbea9b7c2be60a12bfbdabf6cb4ac61d9071b76da1f1@ec2-52-21-77-248.compute-1.amazonaws.com:5432/d4dpqs4699s6cg"
  //connectionString: process.env.DATABASE_URL
});

client.connect();

module.exports = client;