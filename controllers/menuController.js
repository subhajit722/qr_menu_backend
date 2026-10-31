const { Category, Product } = require("../models");

const getPublicMenu = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { status: true },
      attributes: ["id", "name"],
      include: [
        {
          model: Product,
          as: "products",
          attributes: [
            "id",
            "name",
            "description",
            "price",
            "image",
            "isAvailable",
            "categoryId",
          ],
        },
      ],
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Public menu error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load menu",
    });
  }
};

module.exports = { getPublicMenu };