const mongoose = require("mongoose");
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  const receivedToken = req.headers.authorization.replace("Bearer ", "");
  // console.log(receivedToken);

  const owner = await User.findOne({ token: receivedToken });

  if (owner) {
    req.user = owner;
    //   "Regardez j'ai créé une nouvelle clef dans l'objet req, et je lui ai assigné une valeur"
    next();
  } else {
    return res.status(401).json("Unauthorized");
  }
};

module.exports = isAuthenticated;
