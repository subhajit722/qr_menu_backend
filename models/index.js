
const Admin = require("./Admin");
const SuperAdmin = require("./SuperAdmin");
const Restaurant = require("./Restaurant");
const Category = require("./Category");
const Product = require("./Product");
const ProductOffer = require("./ProductOffer");

// Restaurant - Admin
Restaurant.hasOne(Admin, {
  foreignKey: "restaurantId",
  as: "admin",
  onDelete: "CASCADE",
});

Admin.belongsTo(Restaurant, {
  foreignKey: "restaurantId",
  as: "restaurant",
});

// Restaurant - Categories
Restaurant.hasMany(Category, {
  foreignKey: "restaurantId",
  as: "categories",
  onDelete: "CASCADE",
});

Category.belongsTo(Restaurant, {
  foreignKey: "restaurantId",
  as: "restaurant",
});

// Restaurant - Products
Restaurant.hasMany(Product, {
  foreignKey: "restaurantId",
  as: "products",
  onDelete: "CASCADE",
});

Product.belongsTo(Restaurant, {
  foreignKey: "restaurantId",
  as: "restaurant",
});

// Category - Products
Category.hasMany(Product, {
  foreignKey: "categoryId",
  as: "products",
  onDelete: "RESTRICT",
});

Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

// Restaurant - Offers
Restaurant.hasMany(ProductOffer, {
  foreignKey: "restaurantId",
  as: "offers",
  onDelete: "CASCADE",
});

ProductOffer.belongsTo(Restaurant, {
  foreignKey: "restaurantId",
  as: "restaurant",
});

// Product - Offers
Product.hasOne(ProductOffer, {
  foreignKey: "productId",
  as: "offer",
  onDelete: "CASCADE",
});

ProductOffer.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

module.exports = {
  Admin,
  SuperAdmin,
  Restaurant,
  Category,
  Product,
  ProductOffer,
};
