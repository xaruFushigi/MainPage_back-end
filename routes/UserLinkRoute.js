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
// handles registration route
router.post("/register", async (req, res) => {
  const { username, password, firstname, lastname, isAdmin } = req.body;
  // hashing user's password and creating new user
  bcrypt.hash(password, 10).then((hash) => {
    Users.create({
      username: username,
      password: hash,
      firstname: firstname,
      lastname: lastname,
      isAdmin: isAdmin || false, // set isAdmin based on request or default to false
    });
  });
  // sending 200 status
  res.status(200).json({
    success: `User: ${username} has been created. Welcome to the Site!!! `,
  });
});
// checks username before proceeding to confirmation page
router.post("/register/checkUserInfo", async (req, res, next) => {
  const { username } = req.body;
  const user = await Users.findOne({ where: { username: username } });
  if (user) {
    return res.status(400).json({ error: "username should be unique" });
  }
  res.status(200).json({});
});
// handles login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await Users.findOne({ where: { username: username } });
  // if username does not exist in the database
  if (!user) {
    return res.status(404).json({ error: "Wrong Username Or Password" });
  }
  // if password does not mathc/exits in the database
  bcrypt.compare(password, user.password).then((match) => {
    if (!match) {
      return res.status(405).json({ error: "Wrong Username Or Password" });
    }
    // Set the expiration time for the token (e.g., 1 day)
    const expiresIn = "1";
    // jsonwebtoken
    const accessToken = sign(
      { username: user.username, id: user.id },
      process.env.SESSION_SECRET, // session token secret
      { expiresIn }, // Options object including expiresIn
    );
    // sending 200 status
    return res.status(200).json({
      success: `Logged In!!! Welcome back ${username} We missed You :)`,
      accessToken: accessToken,
      username: user.username,
      id: user.id,
    });
  });
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
