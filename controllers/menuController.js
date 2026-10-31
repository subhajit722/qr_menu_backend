
const { Op } = require("sequelize");

const {
  Category,
  Product,
  ProductOffer,
  Restaurant,
} = require("../models");

const getPublicMenu = async (req, res) => {
  try {
    // Get restaurant slug from URL or query parameter
    const slug = req.params.slug || req.query.slug;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Restaurant slug is required",
      });
    }

    // Find restaurant
    const restaurant = await Restaurant.findOne({
      where: {
        slug,
        status: "active",
      },
      attributes: [    "id",
        "name",
        "slug",
        "phone",
        "address",
        "logo",
        "description",
        "bannerImage",
        "primaryColor",
        "secondaryColor",
        "sidebarColor",
        "navColor",
        "offerBoxColor",
        "offerBoxText",
        "offerBoxImage",],
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found or inactive",
      });
    }

    const restaurantId = restaurant.id;
    const currentDate = new Date();

    // Get restaurant categories and products
    const categories = await Category.findAll({
      where: {
        restaurantId,
        status: 1,
      },

      attributes: ["id", "name"],

      include: [
        {
          model: Product,
          as: "products",

          where: {
            restaurantId,
          },

          required: false,

          attributes: [
            "id",
            "name",
            "description",
            "price",
            "image",
            "isAvailable",
            "categoryId",
          ],

          include: [
            {
              model: ProductOffer,
              as: "offer",

              required: false,

              where: {
                restaurantId,
                status: "active",
                startAt: {
                  [Op.lte]: currentDate,
                },
                endAt: {
                  [Op.gte]: currentDate,
                },
              },

              attributes: [
                "id",
                "discountType",
                "discountValue",
                "startAt",
                "endAt",
              ],
            },
          ],
        },
      ],

      order: [["id", "ASC"]],
    });

    // Calculate discounted prices
    const formattedCategories = categories.map((category) => {
      const categoryData = category.toJSON();

      categoryData.products = categoryData.products.map((product) => {
        const originalPrice = Number(product.price);
        let discountedPrice = originalPrice;

        const offer = product.offer;

        if (offer) {
          const discountValue = Number(offer.discountValue);

          if (offer.discountType === "percentage") {
            discountedPrice =
              originalPrice -
              (originalPrice * discountValue) / 100;
          } else if (offer.discountType === "fixed") {
            discountedPrice = originalPrice - discountValue;
          }
        }

        discountedPrice = Math.max(
          0,
          Number(discountedPrice.toFixed(2))
        );

        return {
          ...product,
          originalPrice,
          discountedPrice,
          hasActiveOffer: Boolean(offer),
          offer: offer
            ? {
                ...offer,
                discountValue: Number(offer.discountValue),
              }
            : null,
        };
      });

      return categoryData;
    });

    return res.status(200).json({
      success: true,
      restaurant,
      categories: formattedCategories,
    });
  } catch (error) {
    console.error("Public menu error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load menu",
    });
  }
};

module.exports = { getPublicMenu };
