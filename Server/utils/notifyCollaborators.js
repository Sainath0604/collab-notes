const Notification = require("../models/Notification");

const notifyCollaborators = async (note, actorId) => {
  const collaborators = note.collaborators || [];

  const notifications = collaborators
    .filter((c) => c.userId.toString() !== actorId.toString())
    .map((c) => ({
      user: c.userId,
      note: note._id,
      type: "updated",
      message: `Note "${note.title}" was updated.`,
    }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }
};

module.exports = notifyCollaborators;
