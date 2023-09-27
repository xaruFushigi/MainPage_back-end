const express = require("express");
const expressSession = require("express-session");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "accessToken"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
const db = require("./models"); // goes to 'models' folder and creates table based on JS files (except for 'index.js' file which is sequelize JS file)
// ---------------- END OF MIDDLEWARES
const UserLinkRoute = require("./routes/UserLinkRoute");
app.use("/auth", UserLinkRoute);
const ProjecLinkRoute = require("./routes/ProjectLinkRoute");
app.use("/project", ProjecLinkRoute);
const NotesRoute = require("./routes/NotesRoute.js");
app.use("/note", NotesRoute);
const FolderRoute = require("./routes/FolderRoute.js");
app.use("/folder", FolderRoute);
// ---------------- END OF ROUTES
db.sequelize.sync().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});
