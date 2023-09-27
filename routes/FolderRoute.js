const express = require("express");
const router = express.Router();
// database: Users table
const { db } = require("../models"); // database
const Folder = db.Folder;

//handle folder route

// create folder
router.post("/", async (req, res) => {
  try {
    const CreateFolder = await Folder.create({
      folder_name: req.body.folderName,
    });
    if (!CreateFolder) {
      return res.status(500).json({ message: "failed to create folder" });
    }
    return res.status(200).json({
      message: "successfully created folder",
      folderId: CreateFolder.id,
    });
  } catch (error) {
    throw error;
  }
});
// delete folder
router.delete("/deleteFolder/:folderId", async (req, res) => {
  try {
    const DeleteFolder = await Folder.destroy({
      where: { id: req.params.folderId },
    });
    if (!DeleteFolder) {
      return res.status(500).json({ message: "failed to delete folder" });
    }
    return res.status(200).json({ message: "successfully deleted folder" });
  } catch (error) {
    throw error;
  }
});
// edit folder
router.put("/editFolder/:id", async (req, res) => {
  try {
    const EditFolder = await Folder.update(
      {
        folder_name: req.body.newFolderName,
      },
      { where: { id: req.params.id } },
    );

    if (!EditFolder) {
      return res.status(500).json({ message: "failed to update folder name" });
    }
    return res
      .status(200)
      .json({ message: "successfully updated folder name" });
  } catch (error) {
    throw error;
  }
});
// get folders
router.get("/getFolders", async (req, res) => {
  try {
    const GetFolder = await Folder.findAll();
    if (!GetFolder || GetFolder.length === 0) {
      return res.status(404).json({ message: "No folders found" });
    }

    return res.status(200).json({ folders: GetFolder });
  } catch (error) {
    throw error;
  }
});

module.exports = router;
