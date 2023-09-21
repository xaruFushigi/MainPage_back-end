const { verify } = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const AuthMiddleware = (req, res, next) => {
  const accessToken = req.header("accessToken");

  if (!accessToken) {
    return res
      .status(405)
      .json({ error: "Log In to be able to access portfolio" });
  } else {
    try {
      if (accessToken !== "null") {
        const validToken = verify(accessToken, process.env.SESSION_SECRET);
        const expirationTime = Math.floor(Date.now() / 1000); // Token expires in 30 seconds
        if (validToken.exp > expirationTime) {
          req.user = validToken;
          return next();
        }
      } else {
        return res
          .status(405)
          .json({ error: "Log In to be able to access portfolio" });
      }
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  }
  // verifies jsonwebtoken
};

module.exports = { AuthMiddleware };
