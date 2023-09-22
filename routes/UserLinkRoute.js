const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const multer = require("multer");
// database: Users table
const { db } = require("../models"); // database
const Users = db.Users; // Users model from database
const Project = db.Project; // Project model from database
const Resume = db.Resume; // Resumes model from database
// jwb token validation middleware
const { AuthMiddleware } = require("../authMiddleware/AuthMiddleware");
const { sign } = require("jsonwebtoken");
// a storage strategy for multer which is used for image
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });
// mail
const nodemailer = require("nodemailer");
// email service configuration
const transporter = nodemailer.createTransport({
  // Specifying email service configuration (SMTP settings, etc.)
  service: process.env.EMAIL_SERVER,
  auth: {
    user: process.env.EMAIL_ADDRESS_SENDER,
    pass: process.env.EMAIL_PASSWORD_SENDER,
  },
});
// User Management
const { logUserInFunctionality } = require("./User/User");
const {
  createNewUserInDatabase,
  checkExistingUsernameBeforeRegistration,
  logUserIn,
} = require("./User/UserDatabase");
// handles registration route
router.post("/register", async (req, res) => {
  try {
    // registering new user
    createNewUserInDatabase({
      username: req.body.username,
      password: req.body.password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      isAdmin: req.body.isAdmin,
      Users,
      bcrypt,
    });
    if (createNewUserInDatabase) {
      // sending 200 status
      res.status(200).json({
        success: `User: ${req.body.username} has been created. Welcome to the Site!!! `,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "unexpected error occured" });
  }
});
// checks username before proceeding to confirmation page
router.post("/register/checkUserInfo", async (req, res) => {
  try {
    checkExistingUsernameBeforeRegistration({
      username: req.body.username,
      Users,
    });

    if (!checkExistingUsernameBeforeRegistration) {
      return res.status(400).json({ error: "username should be unique" });
    } else {
      res
        .status(200)
        .json({ message: `username ${req.body.username} is available` });
    }
  } catch (error) {
    res.status(500).json({ message: "unexpected error occured" });
  }
});
// handles login route
router.post("/login", async (req, res) => {
  try {
    const user = logUserIn({
      username: req.body.username,
      Users,
    });
    if (user) {
      const logProcess = logUserInFunctionality({
        username: req.body.username,
        password: req.body.password,
        bcrypt,
        sign,
        user,
      });
      // sending 200 status
      return res.status(200).json({
        success: `Logged In!!! Welcome back ${result.username} We missed You :)`,
        accessToken: result.accessToken,
        username: result.username,
        id: result.id,
      });
    } else {
      return res.status(405).json({ error: "Wrong Username Or Password" });
    }
  } catch (error) {
    res.status(500).json({ message: "unexpected error occured" });
  }
});
// handles user profile page
router.get("/profile/byId/:profileId", async (req, res) => {
  const profileId = req.params.profileId;
  const profileInfo = await Users.findByPk(profileId, {
    attributes: { exclude: ["password", "isAdmin"] },
  }); // attribute field excludes selected column

  res.status(200).json({ profileInfo: profileInfo });
});
// validate Token
router.get("/validToken", AuthMiddleware, async (req, res) => {
  const { username } = req.user;
  const isAdmin = await Users.findOne({
    where: { username: username },
    attributes: { exclude: ["password", "createdAt", "updatedAt"] },
  });
  if (isAdmin.isAdmin) {
    res.status(200).json(isAdmin);
  } else {
    res.status(200).json(req.user);
  }
  //res.json(req.user);
});
// handle change password
router.put("/changePassword", AuthMiddleware, async (req, res) => {
  const { oldPassword, newPassword, userId } = req.body;
  const user = await Users.findOne({ where: { id: userId } });
  bcrypt.compare(oldPassword, user.password).then((match) => {
    // if oldPassword does not match
    if (!match) {
      return res.status(405).json({ error: true });
    }
    // if odlPasswor and newPassword are same
    else if (match && oldPassword === newPassword) {
      return res.status(400).json({
        error: false,
        same: true,
        message: "New Password can not be same as Old Password",
      });
    }
    // if above all false
    else {
      bcrypt.hash(newPassword, 10).then((hash) => {
        Users.update({ password: hash }, { where: { id: userId } });
      });

      return res.status(200).json({
        error: false,
      });
    }
  });
});
// add project
router.post(
  "/addProject",
  upload.single("imageOfProject"),
  async (req, res) => {
    const { nameOfProject, urlOfProject } = req.body;
    const imageOfProject = req.file.buffer;
    try {
      const addProject = await Project.create({
        nameOfProject,
        urlOfProject,
        imageOfProject,
      });
      res.status(200).json({ message: "Project added successfully" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occured while adding the project" });
    }
  },
);
// resume upload
router.post(
  "/uploadResume",
  upload.single("uploadResume"),
  async (req, res) => {
    const { typeOfResume, nameOfResume } = req.body;
    const uploadResume = req.file.buffer;
    try {
      const UploadedResume = await Resume.create({
        nameOfResume,
        typeOfResume,
        uploadResume,
      });
      res
        .status(200)
        .json({ message: "Resume has been uploaded successfully" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occured while adding the project" });
    }
  },
);
//download resume
router.get("/downloadResume", async (req, res) => {
  const resumeType = req.query.resumeType; // Retrieve the resumeType query parameter

  // Logic to send the CV English file
  const resume = await Resume.findOne({
    where: { typeOfResume: resumeType },
  });
  if (!resume) {
    return res.status(404).send("File not found");
  }
  if (!resume.uploadResume || !resume.nameOfResume) {
    return res.status(500).send("Invalid resume data");
  }
  const contentType = resume.contentType || "application/octet-stream";
  // Set response headers for download

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${resume.nameOfResume}"`,
  );
  // Send the file data as the response
  res.send(resume.uploadResume);
});
// delete user account
router.delete("/deleteAccount/:profileId", async (req, res) => {
  try {
    const profileId = req.params.profileId;
    const profile = await Users.destroy({ where: { id: profileId } });
    if (profile === 0) {
      console.log(`No record with ID ${profileId} found.`);
    } else {
      console.log(`Record with ID ${profileId} deleted successfully.`);
      res
        .status(200)
        .json({ message: "Account has been deleted successfully" });
    }
  } catch (error) {
    console.log(error);
  }
});
// email functionality
router.post("/sendMessage", (req, res) => {
  const { name, email, subject, message } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS_SENDER, // replace with your email address
    to: process.env.EMAIL_ADDRESS_RECEIVER, // replace with Santa Claus's email address
    subject: subject,
    text: `Email from ${name} \n 
          ${name}'s email address: ${email}
          message : ${message}`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
  return res
    .status(200)
    .json(
      "You Message has been sent. Bokhodir will try to reply to your message as soons as possible. Thank you for your patience",
    );
});

module.exports = router;
