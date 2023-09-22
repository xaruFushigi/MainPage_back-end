const dotenv = require("dotenv").config();
const logUserInFunctionality = ({ username, password, bcrypt, sign, user }) => {
  // if password does not mathc/exits in the database
  bcrypt.compare(password, user.password).then((match) => {
    if (!match) {
      return false;
    }
    // Set the expiration time for the token (e.g., 1 day)
    const expiresIn = "1h";
    // jsonwebtoken
    const accessToken = sign(
      { username: user.username, id: user.id }, // user input information
      process.env.SESSION_SECRET, // session token secret
      { expiresIn }, // Options object including expiresIn
    );
    return { accessToken, id: user.id, username: user.username };
  });
};

module.exports = { logUserInFunctionality };
