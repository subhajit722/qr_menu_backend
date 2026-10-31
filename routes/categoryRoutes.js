
const express = require("express");
const router = express.Router();

const adminMiddleware = require("../middleware/authMiddleware");

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// Protect ALL category routes

router.use(adminMiddleware);

// Category CRUD
router.post("/", createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
