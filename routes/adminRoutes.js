
const express = require("express");
const router = express.Router();

const adminMiddleware = require("../middleware/authMiddleware");
const restaurantUpload = require("../middleware/restaurantUpload");
const { getAdminProfile } = require("../controllers/adminProfileController");
const {
  getRestaurantProfile,
  updateRestaurantProfile,
   resetRestaurantProfile
} = require("../controllers/restaurantProfileController");
const {
  loginAdmin,


  changePassword,
} = require("../controllers/adminController");

// Public route
router.post("/login", loginAdmin);

// All routes below require restaurant admin authentication
router.use(adminMiddleware);
// router.get("/profile", getAdminProfile);
// router.get("/profile", getAdminProfile);


router.get("/profile", getRestaurantProfile);

router.put(
  "/profile",
  restaurantUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
    { name: "offerBoxImage", maxCount: 1 },
  ]),
  updateRestaurantProfile
);
router.post(
  "/profile/reset",

  resetRestaurantProfile
);

router.put("/change-password", changePassword);

module.exports = router;
