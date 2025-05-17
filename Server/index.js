const http = require("http");
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
require("dotenv").config();

app.use(express.json());
app.use(cors());

const server = http.createServer(app); // Create HTTP server for socket.io

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict to your frontend domain
    methods: ["GET", "POST"],
  },
});

// ✅ Add middleware BEFORE any socket events
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // or JWT_SECRET if imported
    socket.user = decoded;
    socket.join(decoded._id.toString()); // 👈 Join personal room
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// ========== Socket.io Events ==========
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId); // So we can emit to this user
    console.log(`User ${userId} joined their room`);
  });

  // Join a room for a specific note
  socket.on("join-note", (noteId) => {
    socket.join(noteId);
    console.log(`Socket ${socket.id} joined note room: ${noteId}`);
  });

  // Receive an update and broadcast it to others
  socket.on("send-update", ({ noteId, updatedContent }) => {
    // Broadcast update to everyone else in the room
    socket.to(noteId).emit("receive-update", updatedContent);
    console.log(`Update sent to note ${noteId} from ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.set("io", io);

// ========== MongoDB and API Routes ==========
const db_name = "collabNotes";
const mongoUrl =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL
    : `mongodb://0.0.0.0:27017/${db_name}`;

mongoose
  .connect(mongoUrl, { useNewUrlParser: true })
  .then(() => console.log("Connected to Database"))
  .catch((e) => console.log(e));

// Routes and middleware
const authRoutes = require("./routes/auth");
const noteRoutes = require("./routes/notes");
const notificationRoutes = require("./routes/notificationRoutes");
const apiLimiter = require("./middleware/rateLimiter");
const archiveOldNotesJob = require("./jobs/archiveOldNotes");

archiveOldNotesJob();

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/notifications", notificationRoutes);

// Start server (attach HTTP server, not app)
server.listen(5000, () => {
  console.log("Server started on port 5000");
});
