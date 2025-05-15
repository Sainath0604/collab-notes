const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  collaborators: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      permission: { type: String, enum: ["read", "write"], default: "read" },
    },
  ],
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Note", noteSchema);
