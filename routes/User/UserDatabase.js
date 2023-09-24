const dotenv = require("dotenv").config();
// checks database for username column before completing registration process
const checkExistingUsernameBeforeRegistration = async ({ username, Users }) => {
  const user = await Users.findOne({ where: { username: username } });
  return user;
};
// registers new user in database
const createNewUserInDatabase = async ({
  username,
  password,
  firstname,
  lastname,
  isAdmin,
  Users,
  bcrypt,
}) => {
  // hashing user's password and creating new user
  const userRegistration = bcrypt.hash(password, 10).then((hash) => {
    Users.create({
      username: username,
      password: hash,
      firstname: firstname,
      lastname: lastname,
      isAdmin: isAdmin || false, // set isAdmin based on request or default to false
    });
  });

  return userRegistration;
};
// logs in user
const logUserIn = async ({ username, password, Users, bcrypt, sign }) => {
  try {
    const user = await Users.findOne({ where: { username: username } });
    // if username does not exist in the database
    if (!user) {
      return false;
    }
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
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createNewUserInDatabase,
  checkExistingUsernameBeforeRegistration,
  logUserIn,
};
