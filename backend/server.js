const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
require("dotenv").config();

const { Server } = require("socket.io");
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
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= DB TEST ================= */
pool.query("SELECT NOW()")
  .then((res) => console.log("DB WORKS:", res.rows))
  .catch((err) => console.log("DB ERROR:", err));

app.get("/", (req, res) => {
  res.send("IT Help Desk API is running");
});
app.get("/health", (req, res) => {
  res.json({ message: "Backend server is working" });
});
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(`user_${Number(userId)}`);
    console.log("Joined room:", `user_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
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
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
server.on("error", (error) => {
  console.error("Server error:", error);
});