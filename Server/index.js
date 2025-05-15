require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

app.use(express.json());
app.use(cors());

// DB connection
const db_name = "collabNotes";
const isProduction = process.env.NODE_ENV === "production";
const mongoUrl = isProduction
  ? process.env.DATABASE_URL
  : `mongodb://0.0.0.0:27017/${db_name}`;

mongoose
  .connect(mongoUrl, { useNewUrlParser: true })
  .then(() => console.log("Connected to Database"))
  .catch((e) => console.log(e));

// Use auth routes
const authRoutes = require("./routes/auth");
const noteRoutes = require("./routes/notes");
const notificationRoutes = require("./routes/notificationRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/notifications", notificationRoutes);

// Server start
app.listen(5000, () => {
  console.log("Server started on port 5000");
});
