const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(notifications);
};

exports.createNotification = async (req, res) => {
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
};

exports.markAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }
  res.json(notification);
};

exports.deleteNotification = async (req, res) => {
  const result = await Notification.deleteOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.json({ message: "Notification deleted" });
};

exports.clearAllNotifications = async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });
  res.json({ message: "All notifications cleared" });
};
