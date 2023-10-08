const express = require("express");
const router = express.Router();
// database: Users table
const { db } = require("../models"); // database
const Notes = db.Notes;

// create note
router.post("/:folderId/createNote", async (req, res) => {
  try {
    const CreateNote = await Notes.create({
      note_title: req.body.noteTitle,
      note_content: req.body.noteContent,
      FolderId: req.params.folderId,
      status: req.body.status || "incomplete",
    });

    if (!CreateNote) {
      return res.status(500).json({ message: "failed to create folder" });
    }
    return res.status(200).json({
      message: "successfully created note",
      noteId: CreateNote.id,
    });
  } catch (error) {
    throw error;
  }
});
// delete note
router.delete("/:folderId/deleteNote/:noteId", async (req, res) => {
  try {
    const DeleteNote = await Notes.destroy({
      where: { id: req.params.noteId, FolderId: req.params.folderId },
    });
    if (!DeleteNote || DeleteNote === 0) {
      return res.status(500).json({ message: "failed to delete note" });
    }
    return res.status(200).json({ message: "successfully deleted note" });
  } catch (error) {
    throw error;
  }
});
// edit note
router.put("/:folderId/editNote/:noteId", async (req, res) => {
  try {
    const EditNote = await Notes.update(
      {
        note_title: req.body.updatedNoteTitle,
        note_content: req.body.updatedNoteContent,
      },
      {
        where: { id: req.params.noteId, FolderId: req.params.folderId },
      },
    );
    if (!EditNote || EditNote === 0) {
      return res.status(500).json({ message: "failed to edit note" });
    }
    return res.status(200).json({ message: "successfully edited note" });
  } catch (error) {
    throw error;
  }
});
// get notes
router.get("/getNotes/:folderId", async (req, res) => {
  try {
    const GetNotes = await Notes.findAll({
      where: { FolderId: req.params.folderId },
    });
    if (!GetNotes || GetNotes.length === 0) {
      return res.status(404).json({ message: "No folders found" });
    }

    return res.status(200).json({ folders: GetNotes });
  } catch (error) {
    throw error;
  }
});
// get note
router.get("/getNote/:noteId", async (req, res) => {
  try {
    const GetNote = await Notes.findOne({
      where: { id: req.params.noteId },
      attributes: { exclude: ["created_at"] },
    });
    if (!GetNote || GetNote.length === 0) {
      return res.status(404).json({ message: "No folders found" });
    }

    return res.status(200).json({ noteSingle: GetNote });
  } catch (error) {
    throw error;
  }
});
// ping
router.get("/", async (req, res) => {
  res.status(200).json({ message: "server is responsing" });
});

module.exports = router;
