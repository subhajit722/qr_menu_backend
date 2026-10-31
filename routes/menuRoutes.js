
const express = require("express");
const router = express.Router();
const { getPublicRestaurantProfile } = require("../controllers/restaurantProfileController");

const {
  getPublicMenu,
} = require("../controllers/menuController");

// Public customer menu
router.get("/", getPublicMenu);
router.get("/:slug", getPublicMenu);
router.get(
  "/restaurant/:slug",
  getPublicRestaurantProfile
);
module.exports = router;
