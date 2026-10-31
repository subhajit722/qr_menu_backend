
const Admin = require("./Admin");
const Category = require("./Category");
const Product = require("./Product");

// One category has many products
Category.hasMany(Product, {
  foreignKey: "categoryId",
  as: "products",
  onDelete: "RESTRICT",
});

// One product belongs to one category
Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

module.exports = {
  Admin,
  Category,
  Product,
};
