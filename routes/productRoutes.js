
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const upload = require("../config/multer");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// All product management routes require admin login
router.use(verifyToken);

router.post("/", upload.single("image"), createProduct);

router.get("/", getProducts);

router.get("/:id", getProductById);

router.put("/:id", upload.single("image"), updateProduct);

router.delete("/:id", deleteProduct);

module.exports = router;
