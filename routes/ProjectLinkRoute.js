const express = require("express");
const router = express.Router();

const { db } = require("../models"); // database
const Project = db.Project; // Project model from database

router.get("/allProjects", async (req, res) => {
  // fetches all data from Project model
  const allProjects = await Project.findAll({});
  // to send image along with other data
  const projectsWithImage = allProjects.map((project) => {
    return {
      nameOfProject: project.nameOfProject,
      urlOfProject: project.urlOfProject,
      imageOfProject: project.imageOfProject.toString("Base64"),
    };
  });
  res.status(200).json({ projectsFromDatabase: projectsWithImage });
});

module.exports = router;
