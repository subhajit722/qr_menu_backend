const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin } = require("../models");

// CREATE ADMIN
const createAdmin = async (req, res) => {
  console.log("Create Admin Request Body:",req.body); // Debugging line
  try {
    const { username, password } = req.body;

    if (!username || !username.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const existingAdmin = await Admin.findOne({
      where: { username: username.trim() },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = await Admin.create({
      username: username.trim(),
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        id: newAdmin.id,
        username: newAdmin.username,
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create admin",
    });
  }
};

const loginAdmin = async (req, res) => {
   console.log("Login Admin Request Body:", req.body); // Debugging line
  try {
    const { username, password } = req.body;
   

    // 1. Validate input
    if (!username || !username.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // 2. Find admin by username
    const admin = await Admin.findOne({
      where: { username: username.trim() },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // 4. Generate JWT Token
    // Make sure to set JWT_SECRET in your .env file!
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "1d" }
    );

    // 5. Send success response with token
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// GET ADMIN PROFILE
const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.id, {
      attributes: ["id", "username", "createdAt"],
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin profile",
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
  createAdmin,
  getProfile,
  updateProfile,
  changePassword,
  loginAdmin,
  loginAdmin
};