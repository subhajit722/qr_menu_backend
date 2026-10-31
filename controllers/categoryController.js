
const { Category, Product } = require("../models");

// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;
    const { name, description } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const category = await Category.create({
      restaurantId,
      name: name.trim(),
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "This category already exists in your restaurant",
      });
    }

    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create category",
    });
  }
};

// GET ALL CATEGORIES
const getCategories = async (req, res) => {

  try {
    const restaurantId = req.admin.restaurantId;

    const categories = await Category.findAll({
      where: { restaurantId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch categories",
    });
  }
};

// GET SINGLE CATEGORY
const getCategoryById = async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;

    const category = await Category.findOne({
      where: {
        id: req.params.id,
        restaurantId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch category",
    });
  }
};

// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;
    const { name, description, status } = req.body;

    const category = await Category.findOne({
      where: {
        id: req.params.id,
        restaurantId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty",
        });
      }

      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category status",
        });
      }

      category.status = status;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "This category name already exists",
      });
    }

    console.error("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update category",
    });
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;

    const category = await Category.findOne({
      where: {
        id: req.params.id,
        restaurantId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const productCount = await Product.count({
      where: {
        categoryId: category.id,
        restaurantId,
      },
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Delete or move products before deleting this category",
      });
    }

    await category.destroy();

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete category",
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
