const getAdminProfile = async (req, res) => {
  try {
    if (!req.admin || !req.admin.restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      admin: {
        id: req.admin.id,
        username: req.admin.username,
      },
      restaurant: {
        id: req.admin.restaurant.id,
        name: req.admin.restaurant.name,
        slug: req.admin.restaurant.slug,
        logo: req.admin.restaurant.logo,
      },
    });
  } catch (error) {
    console.error("Admin profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load admin profile",
    });
  }
};

module.exports = { getAdminProfile };