require("dotenv").config();
const express = require("express");
const cors = require("cors");

const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const isAuthenticated = require("./middlewares/isAuthenticated");
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost/vinted");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});

app.listen(PROCESS.ENV.PORT, () => {
  console.log("Server started");
});
