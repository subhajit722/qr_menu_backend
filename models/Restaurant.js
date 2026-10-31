
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Restaurant = sequelize.define(
  "Restaurant",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Restaurant branding
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    bannerImage: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    // Theme colors
    primaryColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#35251c",
    },

    secondaryColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#c58b45",
    },

    sidebarColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#211a17",
    },

    navColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#ffffff",
    },

    // Special offer box
    offerBoxColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#fff3e0",
    },

    offerBoxText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    offerBoxImage: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    tableName: "restaurants",
    timestamps: true,
  }
);

module.exports = Restaurant;
