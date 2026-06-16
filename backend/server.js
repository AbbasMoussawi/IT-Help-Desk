const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const assignedTicketRoutes = require("./routes/assignedTicketRoutes");
const commentRoutes = require("./routes/commentRoutes");
const myTicketRoutes = require("./routes/myTicketRoutes");
const attachmentRoutes = require("./routes/attachmentRoutes");
const ticketManagementRoutes = require("./routes/ticketManagementRoutes");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

pool.query("SELECT NOW()")
  .then((res) => {
    console.log("DB WORKS:", res.rows);
  })
  .catch((err) => {
    console.log("DB ERROR:", err);
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
app.use("/api/password", passwordRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/assigned-tickets", assignedTicketRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/my-tickets", myTicketRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/ticket-management", ticketManagementRoutes);

const PORT = process.env.PORT || 5050;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});