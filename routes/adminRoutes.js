
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  changePassword,
  createAdmin,
  loginAdmin
} = require("../controllers/adminController");


router.post("/create", createAdmin);
router.post("/login", loginAdmin);
// All admin routes require authentication
router.use(authMiddleware);

router.get("/profile", getProfile);

router.put("/profile", updateProfile);

router.put("/change-password", changePassword);

module.exports = router;
