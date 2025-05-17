const Note = require("../models/Note");
const notifyCollaborators = require("../utils/notifyCollaborators");
const { authenticateToken } = require("./authUtils");

exports.createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = new Note({
      title,
      content,
      createdBy: req.user._id,
      collaborators: [{ userId: req.user._id, permission: "write" }],
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Note creation failed", error: err.message });
  }
};

exports.getMyNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { createdBy: req.user._id },
        { collaborators: { $elemMatch: { userId: req.user._id } } },
      ],
    };

    const totalCount = await Note.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    // If requested page exceeds total pages, return empty
    if (page > totalPages && totalCount !== 0) {
      return res.status(200).json({
        currentPage: page,
        totalPages,
        totalNotes: totalCount,
        notes: [],
        message: "No notes found for this page",
      });
    }

    const notes = await Note.find(filter)
      .sort({ updatedAt: 1 }) // ascending order by updatedAt
      .skip(skip)
      .limit(limit);

    res.json({
      currentPage: page,
      totalPages,
      totalNotes: totalCount,
      notesPerPageLimit: limit,
      notes,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch notes with pagination",
      error: err.message,
    });
  }
};

exports.getSharedWithMeNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    // Filter: collaborator is user but NOT creator
    const filter = {
      createdBy: { $ne: req.user._id }, // NOT created by current user
      collaborators: { $elemMatch: { userId: req.user._id } },
    };

    const totalCount = await Note.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    if (page > totalPages && totalCount !== 0) {
      return res.status(200).json({
        currentPage: page,
        totalPages,
        totalNotes: totalCount,
        notes: [],
        message: "No notes found for this page",
      });
    }

    const notes = await Note.find(filter)
      .sort({ updatedAt: -1 }) // descending to get latest updated first
      .skip(skip)
      .limit(limit);

    res.json({
      currentPage: page,
      totalPages,
      totalNotes: totalCount,
      notesPerPageLimit: limit,
      notes,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch shared notes with pagination",
      error: err.message,
    });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content } = req.body;

    // console.log("Updating note:", noteId, "by user:", req.user._id);

    const note = await Note.findById(noteId);
    if (!note) {
      console.error("Note not found:", noteId);
      return res.status(404).json({ message: "Note not found" });
    }

    const isOwner = note.createdBy.toString() === req.user._id.toString();
    const isCollaborator = note.collaborators.some(
      (collab) =>
        collab.userId.toString() === req.user._id.toString() &&
        collab.permission === "write"
    );

    if (!isOwner && !isCollaborator) {
      console.warn("Permission denied for user:", req.user._id);
      return res.status(403).json({ message: "Permission denied" });
    }

    note.title = title;
    note.content = content;
    note.lastUpdated = new Date();
    await note.save();

    // Notify the owner if someone else updated their note
    if (!isOwner) {
      const Notification = require("../models/Notification");

      const message = `${
        req.user.name || "A collaborator"
      } updated your note "${note.title}"`;

      const notification = new Notification({
        user: note.createdBy,
        note: note._id,
        message,
        type: "updated", // ✅ Required to pass validation
      });

      await notification.save();
      // console.log("Notification saved:", notification);

      // Emit via Socket.IO
      const io = req.app.get("io");
      if (io) {
        // console.log(
        //   "Emitting socket notification to:",
        //   note.createdBy.toString()
        // );
        io.to(note.createdBy.toString()).emit("new_notification", {
          _id: notification._id,
          user: notification.user,
          message: notification.message,
          note: notification.note,
          createdAt: notification.createdAt,
          type: notification.type,
        });
      }
    }

    await notifyCollaborators(note, req.user._id);
    res.json(note);
  } catch (err) {
    console.error("Update failed error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the creator can delete the note" });
    }

    await note.deleteOne();
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};

exports.shareNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { userId, permission } = req.body;

    const note = await Note.findById(noteId)
      .populate("createdBy", "name")
      .populate("collaborators.userId", "name");
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.createdBy._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the creator can share the note" });
    }

    const existingIndex = note.collaborators.findIndex(
      (c) => c.userId.toString() === userId
    );

    if (existingIndex >= 0) {
      // Update permission if different
      if (note.collaborators[existingIndex].permission !== permission) {
        note.collaborators[existingIndex].permission = permission;
      }
    } else {
      // Add new collaborator
      note.collaborators.push({ userId, permission });
    }

    await note.save();

    const Notification = require("../models/Notification");
    const User = require("../models/User");

    const collaboratorUser = await User.findById(userId);
    if (collaboratorUser) {
      const message = `You were added to the note "${note.title}" by ${
        note.createdBy.name || "the owner"
      }`;

      const notification = new Notification({
        user: userId,
        message,
        note: note._id,
        type: "shared",
      });

      await notification.save();

      // ✅ Emit notification via Socket.IO
      const io = req.app.get("io");
      if (io) {
        console.log(`[Backend] Emitting notification to user: ${userId}`);
        console.log("[Backend] Notification payload:", {
          _id: notification._id,
          user: userId,
          message,
          note: note._id,
          createdAt: notification.createdAt,
        });

        io.to(userId.toString()).emit("new_notification", {
          _id: notification._id,
          user: userId,
          message,
          note: note._id,
          createdAt: notification.createdAt,
        });
      } else {
        console.warn("[Backend] Socket.IO instance not found");
      }
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Share failed", error: err.message });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const note = await Note.findById(noteId).populate(
      "collaborators.userId",
      "name email"
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Optional: Check if the requesting user has permission to view this note
    // e.g., check if req.user._id is either creator or collaborator

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Failed to get note", error: err.message });
  }
};
