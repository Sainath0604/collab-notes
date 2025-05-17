const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  note: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
  // type: { type: String, enum: ["updated"], required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["shared", "updated"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

module.exports = mongoose.model("Notification", notificationSchema);
