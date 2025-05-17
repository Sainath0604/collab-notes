const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const noteController = require("../controllers/noteController");

router.post("/", auth, noteController.createNote);
router.get("/", auth, noteController.getMyNotes);
router.get("/shared-with-me", auth, noteController.getSharedWithMeNotes);
router.put("/:noteId", auth, noteController.updateNote);
router.delete("/:noteId", auth, noteController.deleteNote);
router.post("/:noteId/share", auth, noteController.shareNote);
router.get("/:noteId", auth, noteController.getNoteById);

module.exports = router;
