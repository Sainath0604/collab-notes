const http = require("http");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Create HTTP server
const server = http.createServer(app);

// ========== Socket.IO Setup ==========
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this
    methods: ["GET", "POST"],
  },
});

// ========== Socket Authentication Middleware ==========
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("[Socket Auth] Token received:", token);

  if (!token) {
    console.error("[Socket Auth] ❌ Missing token");
    return next(new Error("Authentication token missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[Socket Auth] ✅ Token decoded:", decoded);

    // socket.user = decoded;
    socket.user = { ...decoded, _id: decoded.id };
    socket.join(decoded.id.toString());
    console.log(`[Socket Auth] 🟢 User ${decoded.id} joined personal room`);
    next();
  } catch (err) {
    console.error("[Socket Auth] ❌ Invalid token:", err.message);
    return next(new Error("Authentication error"));
  }
});

// ========== Socket Events ==========
io.on("connection", (socket) => {
  const userId = socket.user?.id;
  console.log(
    `[Socket Auth] 🟢 Socket Events- userId: ${userId}, socketId: ${socket.id}`
  );
  if (userId) {
    console.log(
      `✅ [Socket Connected] User ${userId} connected with socket ${socket.id}`
    );
    socket.join(userId.toString());
  } else {
    console.warn("⚠️ [Socket Connected] Connected without a valid user");
  }

  socket.on("join-note", (noteId) => {
    socket.join(noteId);
    console.log(
      `📝 [join-note] Socket ${socket.id} joined note room: ${noteId}`
    );
  });

  socket.on("send-update", ({ noteId, updatedContent }) => {
    console.log(
      `📤 [send-update] Broadcasting update to note ${noteId} from ${socket.id}`
    );
    console.log(`📤 [send-update] updatedContent:`, updatedContent);
    socket.to(noteId).emit("receive-update", updatedContent);
  });

  socket.on("disconnect", () => {
    console.log(
      `❌ [Socket Disconnected] User ${userId || "unknown"} (socket: ${
        socket.id
      })`
    );
  });
});

// ========== Share `io` with Controllers ==========
app.set("io", io);

// ========== MongoDB ==========
const db_name = "collabNotes";
const mongoUrl =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL
    : `mongodb://0.0.0.0:27017/${db_name}`;

mongoose
  .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((e) => console.error("❌ MongoDB connection error:", e));

// ========== Routes & Middleware ==========
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

// ========== Start Server ==========
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
