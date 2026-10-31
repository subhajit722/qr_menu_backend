
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Admin = sequelize.define(
  "Admin",
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

   restaurantId: {
  type: DataTypes.INTEGER,
  allowNull: false,
},
  },
  {
    tableName: "admins",
    timestamps: true,
  }
);

module.exports = Admin;
