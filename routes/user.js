const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const fileUpload = require("express-fileupload");

router.post("/user/signup", async (req, res) => {
  console.log("hello");
  try {
    const salt = uid2(16);
    const hash = SHA256(req.body.password + salt).toString(encBase64);
    const token = uid2(64);
    const checkEmail = await User.findOne({ email: req.body.email });
    if (checkEmail) {
      return res.status(400).json("This email is already being used!");
    }
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
    });

    await newSignup.save();
    res.json({
      _id: newSignup._id,
      token: newSignup.token,
      account: newSignup.account,
    });
  } catch (error) {}
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
  } catch (error) {}
});

module.exports = router;
