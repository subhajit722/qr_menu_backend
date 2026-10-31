
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ProductOffer = sequelize.define(
  "ProductOffer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    discountType: {
      type: DataTypes.ENUM("percentage", "fixed"),
      allowNull: false,
    },

    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    startAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    endAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    tableName: "product_offers",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["productId"],
      },
      {
        fields: ["restaurantId"],
      },
      {
        fields: ["startAt", "endAt"],
      },
    ],
  }
);

module.exports = ProductOffer;
