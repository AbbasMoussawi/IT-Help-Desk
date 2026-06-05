const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");

const categoryRoutes = require("./routes/categoryRoutes");
const priorityRoutes = require("./routes/priorityRoutes");
const statusRoutes = require("./routes/statusRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

const app = express();

app.use(cors());
app.use(express.json());

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.log("DB ERROR:", err);
  } else {
    console.log("DB WORKS:", res.rows);
  }
});

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

app.use("/api/categories", categoryRoutes);
app.use("/api/priorities", priorityRoutes);
app.use("/api/statuses", statusRoutes);
app.use("/api/tickets", ticketRoutes);

const PORT = process.env.PORT || 5050;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});