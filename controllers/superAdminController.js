
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sequelize } = require("../config/database");

const {
  SuperAdmin,
  Restaurant,
  Admin,
} = require("../models");


const createSlug = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const generateUniqueSlug = async (name, transaction) => {
  const baseSlug = createSlug(name) || "restaurant";
  let slug = baseSlug;
  let counter = 1;

  while (
    await Restaurant.findOne({
      where: { slug },
      transaction,
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

exports.createClient = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      restaurantName,
      username,
      password,
      phone,
      address,
    } = req.body;

    // Validation
    if (!restaurantName || !username || !password) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Restaurant name, username and password are required",
      });
    }

    if (password.length < 12) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Password must contain at least 12 characters",
      });
    }

    if (username.length > 100) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Username cannot exceed 100 characters",
      });
    }

    // Check username
    const existingAdmin = await Admin.findOne({
      where: { username },
      transaction,
    });

    if (existingAdmin) {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Generate unique restaurant slug
    const slug = await generateUniqueSlug(
      restaurantName,
      transaction
    );

    // Hash password
    const bcrypt = require("bcryptjs");

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create restaurant
    const restaurant = await Restaurant.create(
      {
        name: restaurantName.trim(),
        slug,
        phone: phone || null,
        address: address || null,
        status: "active",
      },
      { transaction }
    );

    // Create restaurant admin
    const admin = await Admin.create(
      {
        username: username.trim(),
        password: hashedPassword,
        restaurantId: restaurant.id,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Restaurant client created successfully",

      client: {
        adminId: admin.id,
        username: admin.username,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantSlug: restaurant.slug,
        restaurantUrl: `/menu/${restaurant.slug}`,
        status: restaurant.status,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Create Client Error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Username or restaurant slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create restaurant client",
    });
  }
};


exports.getAllClients = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      include: [
        {
          model: Admin,
          as: "admin",
          attributes: ["id", "username", "createdAt"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      total: restaurants.length,
      clients: restaurants,
    });
  } catch (error) {
    console.error("Get Clients Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
    });
  }
};


// Super Admin Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const superAdmin = await SuperAdmin.findOne({
      where: { username },
    });

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      superAdmin.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        id: superAdmin.id,
        role: "super_admin",
      },
      process.env.SUPPER_KYE,
      {
        expiresIn: "1d",
      }
    
    );
  console.log("Super Admin Login: Token generated", token)
    return res.status(200).json({
      success: true,
      message: "Super Admin login successful",
      token,
      user: {
        id: superAdmin.id,
        username: superAdmin.username,
        role: "super_admin",
      },
    });
  } catch (error) {
    console.error("Super Admin Login:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get Super Admin Profile
exports.profile = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findByPk(
      req.user.id,
      {
        attributes: ["id", "username", "createdAt"],
      }
    );

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      user: superAdmin,
    });
  } catch (error) {
    console.error("Super Admin Profile:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
