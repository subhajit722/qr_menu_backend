
require("dotenv").config();

const bcrypt = require("bcryptjs");
const { sequelize } = require("./config/database");
const { SuperAdmin } = require("./models");

const createSuperAdmin = async () => {
  try {
    await sequelize.authenticate();

    const username = 'jitsuper';
    const password = "super1234"

    if (!username || !password || password.length < 7) {
      throw new Error(
        "Set a username and a password of at least 12 characters in .env"
      );
    }

    const existingAdmin = await SuperAdmin.findOne({
      where: { username },
    });

    if (existingAdmin) {
      console.log("Super Admin already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await SuperAdmin.create({
      username,
      password: hashedPassword,
    });

    console.log("Super Admin created successfully!");
  } catch (error) {
    console.error("Creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

createSuperAdmin();
