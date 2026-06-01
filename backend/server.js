const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/db");

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.log("DB ERROR:", err);
  } else {
    console.log("DB WORKS:", res.rows);
  }
});

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("IT Help Desk API is running");
});

app.get("/health", (req, res) => {
  res.json({
    message: "Backend server is working",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);

const PORT = process.env.PORT || 5050;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});