
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// Public read access
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Protected admin operations
router.post("/", verifyToken, createCategory);
router.put("/:id", verifyToken, updateCategory);
router.delete("/:id", verifyToken, deleteCategory);

module.exports = router;
