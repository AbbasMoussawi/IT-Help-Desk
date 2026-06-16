const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on("connect", () => {
  console.log("PostgreSQL connected successfully");
});

pool.on("error", (error) => {
  console.error("PostgreSQL connection error:", error);
});

module.exports = pool;