
const express = require("express");
const router = express.Router();

const {
  login,
  profile,
  createClient,
  getAllClients,
} = require("../controllers/superAdminController");

const superAdminMiddleware = require("../middleware/superAdminMiddleware");

// Public login
router.post("/login", login);

// Protected routes
router.get("/profile", superAdminMiddleware, profile);

// Client management
router.post("/clients", superAdminMiddleware, createClient);
router.get("/clients", superAdminMiddleware, getAllClients);

module.exports = router;
