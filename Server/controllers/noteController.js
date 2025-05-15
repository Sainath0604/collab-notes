const Note = require("../models/Note");

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
    const notes = await Note.find({
      $or: [
        { createdBy: req.user._id },
        { collaborators: { $elemMatch: { userId: req.user._id } } },
      ],
    }).sort({ lastUpdated: -1 });

    res.json(notes);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch notes", error: err.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content } = req.body;

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const isOwner = note.createdBy.toString() === req.user._id.toString();
    const isCollaborator = note.collaborators.some(
      (collab) =>
        collab.userId.toString() === req.user._id.toString() &&
        collab.permission === "write"
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: "Permission denied" });
    }

    note.title = title;
    note.content = content;
    note.lastUpdated = new Date();
    await note.save();

    await notifyCollaborators(note, req.user._id); // 🔔 Log notifications

    res.json(note);
  } catch (err) {
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

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the creator can share the note" });
    }

    const existing = note.collaborators.find(
      (c) => c.userId.toString() === userId
    );

    if (existing) {
      existing.permission = permission;
    } else {
      note.collaborators.push({ userId, permission });
    }

    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Share failed", error: err.message });
  }
};
