const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const User = require("../models/User");

const fileUpload = require("express-fileupload");
const convertToBase64 = require("../utils/converToBase64");

router.post("/user/signup", fileUpload(), async (req, res) => {
  console.log("hello");
  try {
    if (!req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).json("Missing parameters");
    }
    const checkEmail = await User.findOne({ email: req.body.email });
    if (checkEmail) {
      return res.status(400).json("This email is already being used!");
    }
    const convertedFile = convertToBase64(req.files.avatar);
    const uploadResult = await cloudinary.uploader.upload(convertedFile, {
      folder: "vinted/users",
    });

    const salt = uid2(16);
    const hash = SHA256(req.body.password + salt).toString(encBase64);
    const token = uid2(64);

    const newSignup = new User({
      email: req.body.email,
      account: {
        username: req.body.username,
        //avatar: Object, // nous verrons plus tard comment uploader une image
      },
      newsletter: req.body.newsletter,
      token: token,
      hash: hash,
      salt: salt,

      avatar: uploadResult,
    });

    await newSignup.save();
    res.json({
      _id: newSignup._id,
      token: newSignup.token,
      account: newSignup.account,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/user/logins", async (req, res) => {
  try {
    const userMatch = await User.findOne({ email: req.body.email });
    if (userMatch === null) {
      return res.json("it's all wrong mate! try again!");
    }

    const hash2 = SHA256(req.body.password + userMatch.salt).toString(
      encBase64
    );

    if (hash2 === userMatch.hash) {
      res.json({
        _id: userMatch._id,
        token: userMatch.token,
        account: userMatch.account,
      });
    } else {
      res.json("it's all wrong mate! try again!");
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
