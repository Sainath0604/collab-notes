const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/auth");

// router.get("/", authMiddleware, async (req, res) => {
//   const notifications = await Notification.find({ user: req.user._id }).sort({
//     createdAt: -1,
//   });
//   res.json(notifications);
// });

router.post("/", authMiddleware, async (req, res) => {
  const { userId, message, noteId } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const notification = new Notification({
    user: userId,
    message,
    note: noteId || null,
  });

  await notification.save();

  // Optionally emit real-time notification via Socket.IO
  if (req.app.get("io")) {
    req.app
      .get("io")
      .to(userId.toString())
      .emit("new_notification", notification);
  }

  res.status(201).json(notification);
});

module.exports = router;

// ✅ Test Flow in Postman:
// 1) Login with 2 users.
// 2) User A creates a note.
// 3) User A shares the note with User B (write permission).
// 4) User B updates the note.
// 5) Notifications will be logged for User A.
// 6) Hit GET /api/notifications as User A.
