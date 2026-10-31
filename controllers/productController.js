
const fs = require("fs");
const path = require("path");

const { Product, Category } = require("../models");

// Helper: delete an uploaded image safely
const removeImage = (imagePath) => {
  if (!imagePath) return;

  const filename = path.basename(imagePath);
  const fullPath = path.join(__dirname, "../uploads", filename);

  fs.unlink(fullPath, (error) => {
    if (error && error.code !== "ENOENT") {
      console.error("Image deletion failed:", error.message);
    }
  });
};

// Helper: parse boolean values from JSON or FormData
const parseBoolean = (value, defaultValue) => {
  if (value === undefined) return defaultValue;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return null;
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const { name, description, price, categoryId } = req.body;

    if (!name || !name.trim() || !categoryId || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, price and category are required",
      });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid price",
      });
    }

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const isAvailable = parseBoolean(
      req.body.isAvailable,
      true
    );

    if (isAvailable === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability value",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description,
      price: numericPrice,
      categoryId: category.id,
      image: req.file ? req.file.filename : null,
      isAvailable,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    if (req.file) removeImage(req.file.filename);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const where = {};

    if (req.query.categoryId) {
      where.categoryId = req.query.categoryId;
    }

    const products = await Product.findAll({
      where,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE PRODUCT
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      if (req.file) removeImage(req.file.filename);

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const { name, description, price, categoryId, isAvailable } =
      req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid product name",
        });
      }

      product.name = name.trim();
    }

    if (description !== undefined) {
      product.description = description;
    }

    if (price !== undefined) {
      const numericPrice = Number(price);

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid price",
        });
      }

      product.price = numericPrice;
    }

    if (categoryId !== undefined) {
      const category = await Category.findByPk(categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      product.categoryId = category.id;
    }

    if (isAvailable !== undefined) {
      const parsed = parseBoolean(isAvailable, true);

      if (parsed === null) {
        return res.status(400).json({
          success: false,
          message: "Invalid availability value",
        });
      }

      product.isAvailable = parsed;
    }

    const oldImage = product.image;

    if (req.file) {
      product.image = req.file.filename;
    }

    await product.save();

    if (req.file && oldImage) {
      removeImage(oldImage);
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    if (req.file) removeImage(req.file.filename);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const oldImage = product.image;

    await product.destroy();

    if (oldImage) removeImage(oldImage);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
