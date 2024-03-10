const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const receivedToken = req.headers.authorization.replace("Bearer ", "");

  const owner = await User.findOne({ token: receivedToken });

  if (owner) {
    req.user = owner;

    next();
  } else {
    return res.status(401).json("Unauthorized");
  }
};

module.exports = isAuthenticated;
