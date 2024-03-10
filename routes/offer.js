const express = require("express");
const cloudinary = require("cloudinary").v2;

const router = express.Router();

const fileUpload = require("express-fileupload");

const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/converToBase64");

const Offer = require("../models/Offer");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      console.log(req.files.picture);
      const convertedFile = convertToBase64(req.files.picture);
      const uploadResult = await cloudinary.uploader.upload(convertedFile, {
        folder: "vinted",
      });
      console.log(req.body);

      const newOffer = new Offer({
        product_name: req.body.marque,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: req.body.details,
        product_image: uploadResult,
        owner: req.user,
      });
      await newOffer.save();

      res.json({ newOffer });

      res.json();
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    let skip = 0;
    let limit = 20;
    const filter = {};
    if (req.query.title) {
      filter.product_description = new RegExp(req.query.title, "i");
    }
    if (!req.query.priceMin) {
      req.query.priceMin = 0;
    }
    if (req.query.priceMin || req.query.priceMax) {
      filter.product_price = {
        $gte: req.query.priceMin,
        $lte: req.query.priceMax,
      };
    }
    const sort = {};
    if (req.query.sort === "price-desc") {
      sort.product_price = "desc";
    } else {
      sort.product_price = "asc";
    }
    if (req.query.page) {
      limit = 3;
      skip = limit * (req.query.page - 1);
    }

    console.log(skip);
    // if (req.query.sort === "price-asc") {
    //   filter.product_price = { product_price: "asc" };
    // }
    // if(req.query.page){filter.Offer = { product_price: "desc" }}

    const offers = await Offer.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("owner", "account")
      .select("product_name product_description");

    // console.log(req.query);
    const count = await Offer.countDocuments(filter);

    res.json({
      count: count,
      offers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("offers/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const offer = await Offer.findById(id).populate("owner", "account");
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
