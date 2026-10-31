const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin, Restaurant } = require("../models");

// RESTAURANT ADMIN LOGIN
const loginAdmin = async (req, res) => {
  try {
 const username =
  typeof req.body.username === "string"
    ? req.body.username.trim()
    : "";

const password =
  typeof req.body.password === "string"
    ? req.body.password
    : "";

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const admin = await Admin.findOne({
      where: {
        username: username.trim(),
      },
      include: [
        {
          model: Restaurant,
          as: "restaurant",
        },
      ],
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    if (!admin.restaurant || admin.restaurant.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your restaurant account is inactive.",
      });
    }

    const token = jwt.sign(
      {
        adminId: admin.id,
        restaurantId: admin.restaurantId,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        restaurantId: admin.restaurantId,
        restaurant: {
          id: admin.restaurant.id,
          name: admin.restaurant.name,
          slug: admin.restaurant.slug,
          logo: admin.restaurant.logo,
        },
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// GET LOGGED-IN ADMIN PROFILE
const getAdminProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      admin: req.admin,
    });
  } catch (error) {
    console.error("Admin profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch admin profile.",
    });
  }
};

// UPDATE ADMIN USERNAME
const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const admin = await Admin.findByPk(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const existingAdmin = await Admin.findOne({
      where: { username: username.trim() },
    });

    if (existingAdmin && existingAdmin.id !== admin.id) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    admin.username = username.trim();
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
};

// CHANGE ADMIN PASSWORD
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both passwords are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const admin = await Admin.findByPk(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      admin.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    admin.password = await bcrypt.hash(newPassword, 12);
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Password change failed",
    });
  }
};

module.exports = {
  loginAdmin,
  getAdminProfile,
  changePassword,
  updateProfile,
};