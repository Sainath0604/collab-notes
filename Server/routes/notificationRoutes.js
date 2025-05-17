const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../controllers/notificationController");

router.get("/", authMiddleware, getNotifications);
router.post("/", authMiddleware, createNotification);
router.patch("/:id/read", authMiddleware, markAsRead);
router.delete("/:id", authMiddleware, deleteNotification);
router.delete("/", authMiddleware, clearAllNotifications);

module.exports = router;
