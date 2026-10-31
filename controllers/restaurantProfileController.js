
const { Restaurant } = require("../models");
const fs = require("fs");
const path = require("path");




// Reset restaurant profile
const resetRestaurantProfile = async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;

    const restaurant = await Restaurant.findByPk(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    // Keep the current restaurant name and slug.
    const oldImages = [
      restaurant.logo,
      restaurant.bannerImage,
      restaurant.offerBoxImage,
    ].filter(Boolean);

    // Reset profile fields and branding.
    await restaurant.update({
      phone: "",
      address: "",
      description: "",

      logo: null,
      bannerImage: null,
      offerBoxImage: null,

      primaryColor: "#35251c",
      secondaryColor: "#c58b45",
      sidebarColor: "#211a17",
      navColor: "#ffffff",
      offerBoxColor: "#fff3e0",

      offerBoxText: "",
    });

    // Delete only the image files linked to this restaurant.
    // Assumes this controller is inside the controllers folder
    // and uploads is in the backend root folder.
    const uploadDirectory = path.resolve(__dirname, "../uploads");

    for (const image of oldImages) {
      const safeFilename = path.basename(image);
      const imagePath = path.join(uploadDirectory, safeFilename);

      try {
        await fs.unlink(imagePath);
      } catch (fileError) {
        if (fileError.code !== "ENOENT") {
          console.error("Image deletion failed:", imagePath, fileError);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Restaurant profile reset successfully.",
      restaurant,
    });

  } catch (error) {
    console.error("Reset restaurant profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset restaurant profile.",
    });
  }
};




const getRestaurantProfile = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(
      req.admin.restaurantId,
      {
        attributes: [
          "id",
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
          "offerBoxImage",
        ],
      }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Get restaurant profile:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load restaurant profile",
    });
  }
};


 const getPublicRestaurantProfile = async (req, res) => {
  try {
    const { slug } = req.params;

    const restaurant = await Restaurant.findOne({
      where: { slug },
      attributes: [
        "id",
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
        "offerBoxImage",
      ],
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      restaurant,
    });

  } catch (error) {
    console.error("Public restaurant profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant profile",
    });
  }
};

const updateRestaurantProfile = async (req, res) => {
    console.log("Update Restaurant Profile: Request body", req.body);
    console.log("UPLOADED FILES:", req.files);

  try {
    const restaurant = await Restaurant.findByPk(
      req.admin.restaurantId
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const {
      name,
      phone,
      address,
      description,
      primaryColor,
      secondaryColor,
      sidebarColor,
      navColor,
      offerBoxColor,
      offerBoxText,
    } = req.body;

    const colorFields = {
      primaryColor,
      secondaryColor,
      sidebarColor,
      navColor,
      offerBoxColor,
    };

    for (const [field, value] of Object.entries(colorFields)) {
      if (
        value !== undefined &&
        !/^#[0-9A-Fa-f]{6}$/.test(value)
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid color value for ${field}`,
        });
      }
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name is required",
      });
    }

    const updates = {
      ...(name !== undefined && { name: name.trim() }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(description !== undefined && { description }),
      ...(primaryColor !== undefined && { primaryColor }),
      ...(secondaryColor !== undefined && { secondaryColor }),
      ...(sidebarColor !== undefined && { sidebarColor }),
      ...(navColor !== undefined && { navColor }),
      ...(offerBoxColor !== undefined && { offerBoxColor }),
      ...(offerBoxText !== undefined && { offerBoxText }),
    };

    const uploadedFiles = req.files || {};

    const imageFields = [
      "logo",
      "bannerImage",
      "offerBoxImage",
    ];

    for (const field of imageFields) {
      if (uploadedFiles[field]?.[0]) {
        const oldImage = restaurant[field];

        updates[field] = uploadedFiles[field][0].filename;

        // Remove previous uploaded image after a replacement.
        if (oldImage) {
          const oldPath = path.join(
            __dirname,
            "../uploads",
            path.basename(oldImage)
          );

          if (fs.existsSync(oldPath)) {
            fs.unlink(oldPath, (error) => {
              if (error) {
                console.error("Old image cleanup error:", error);
              }
            });
          }
        }
      }
    }

    await restaurant.update(updates);

    const updatedRestaurant = await Restaurant.findByPk(
      restaurant.id,
      {
        attributes: [
          "id",
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
          "offerBoxImage",
        ],
      }
    );

    return res.status(200).json({
      success: true,
      message: "Restaurant profile updated successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error("Update restaurant profile:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update restaurant profile",
    });
  }
};

module.exports = {
  getRestaurantProfile,
  updateRestaurantProfile,
  getPublicRestaurantProfile,
    resetRestaurantProfile,
};
