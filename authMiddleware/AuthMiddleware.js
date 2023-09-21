const { verify } = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const AuthMiddleware = (req, res, next) => {
  const accessToken = req.header("accessToken");

  if (!accessToken) {
    return res.status(405).json({ error: "Log in to make comments" });
  } else {
    try {
      if (accessToken && accessToken !== "null") {
        const validToken = verify(accessToken, process.env.SESSION_SECRET, {
          expiresIn: "120s",
        });
        if (validToken) {
          // Token is still valid
          req.user = validToken;
          return next();
        } else {
          return res.status(405).json({ error: "Token has expired" });
        }
      } else {
        return res.status(405).json({ error: "Log in to make comments" });
      }
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
};

module.exports = { AuthMiddleware };
