
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SuperAdmin = sequelize.define(
  "SuperAdmin",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "super_admins",
    timestamps: true,
  }
);

module.exports = SuperAdmin;
