
const fs = require("fs");
const path = require("path");

const { Product, Category } = require("../models");

// DELETE UPLOADED IMAGE
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

// BOOLEAN PARSER
const parseBoolean = (value, defaultValue) => {
  if (value === undefined) return defaultValue;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;

  return null;
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;

    const { name, description, price, categoryId } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      !categoryId ||
      price === undefined
    ) {
      if (req.file) removeImage(req.file.filename);

      return res.status(400).json({
        success: false,
        message: "Name, price and category are required",
      });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      if (req.file) removeImage(req.file.filename);

      return res.status(400).json({
        success: false,
        message: "Enter a valid price",
      });
    }

    // Verify category belongs to logged-in restaurant
    const category = await Category.findOne({
      where: {
        id: categoryId,
        restaurantId,
      },
    });

    if (!category) {
      if (req.file) removeImage(req.file.filename);

      return res.status(404).json({
        success: false,
        message: "Category not found in your restaurant",
      });
    }

    const isAvailable = parseBoolean(
      req.body.isAvailable,
      true
    );

    if (isAvailable === null) {
      if (req.file) removeImage(req.file.filename);

      return res.status(400).json({
        success: false,
        message: "Invalid availability value",
      });
    }

    const product = await Product.create({
      restaurantId,
      name: name.trim(),
      description,
      price: numericPrice,
      categoryId: category.id,
      image: req.file ? req.file.filename : null,
      isAvailable,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    if (req.file) removeImage(req.file.filename);

    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create product",
    });
  }
};

// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;

    const where = { restaurantId };

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

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch products",
    });
  }
};

// GET SINGLE PRODUCT
const getProductById = async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;

    const product = await Product.findOne({
      where: {
        id: req.params.id,
        restaurantId,
      },
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

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch product",
    });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;

    const product = await Product.findOne({
      where: {
        id: req.params.id,
        restaurantId,
      },
    });

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
        if (req.file) removeImage(req.file.filename);

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
        if (req.file) removeImage(req.file.filename);

        return res.status(400).json({
          success: false,
          message: "Enter a valid price",
        });
      }

      product.price = numericPrice;
    }

    if (categoryId !== undefined) {
      const category = await Category.findOne({
        where: {
          id: categoryId,
          restaurantId,
        },
      });

      if (!category) {
        if (req.file) removeImage(req.file.filename);

        return res.status(404).json({
          success: false,
          message: "Category not found in your restaurant",
        });
      }

      product.categoryId = category.id;
    }

    if (isAvailable !== undefined) {
      const parsed = parseBoolean(isAvailable);

      if (parsed === null) {
        if (req.file) removeImage(req.file.filename);

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

    // Delete old image only after successful database update
    if (req.file && oldImage) {
      removeImage(oldImage);
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    if (req.file) removeImage(req.file.filename);

    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update product",
    });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;

    const product = await Product.findOne({
      where: {
        id: req.params.id,
        restaurantId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const oldImage = product.image;

    await product.destroy();

    if (oldImage) {
      removeImage(oldImage);
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete product",
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
