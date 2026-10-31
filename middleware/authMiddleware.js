
// // const jwt = require("jsonwebtoken");

// // const authMiddleware = (req, res, next) => {
// //   try {
// //     const authHeader = req.headers.authorization;

// //     if (!authHeader || !authHeader.startsWith("Bearer ")) {
// //       return res.status(401).json({
// //         success: false,
// //         message: "Authentication token is required",
// //       });
// //     }

// //     const token = authHeader.split(" ")[1];

// //     const decoded = jwt.verify(
// //       token,
// //       process.env.JWT_SECRET
// //     );

// //     req.admin = {
// //       id: decoded.id,
// //       username: decoded.username,
// //     };

// //     next();

// //   } catch (error) {
// //     return res.status(401).json({
// //       success: false,
// //       message: "Invalid or expired token",
// //     });
// //   }
// // };

// // module.exports = authMiddleware;


// const jwt = require("jsonwebtoken");
// const { Admin, Restaurant } = require("../models");

// const adminMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication token is required.",
//       });
//     }

//     const token = authHeader.split(" ")[1];

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (decoded.role !== "admin" || !decoded.adminId) {
//       return res.status(403).json({
//         success: false,
//         message: "Invalid restaurant admin token.",
//       });
//     }

//     const admin = await Admin.findByPk(decoded.adminId, {
//       attributes: ["id", "username", "restaurantId"],
//       include: [
//         {
//           model: Restaurant,
//           as: "restaurant",
//           attributes: ["id", "name", "slug", "status"],
//         },
//       ],
//     });

//     if (!admin || !admin.restaurant) {
//       return res.status(401).json({
//         success: false,
//         message: "Admin account or restaurant not found.",
//       });
//     }

//     if (admin.restaurant.status !== "active") {
//       return res.status(403).json({
//         success: false,
//         message: "This restaurant account is inactive.",
//       });
//     }

//     req.admin = {
//       id: admin.id,
//       username: admin.username,
//       restaurantId: admin.restaurantId,
//       restaurant: admin.restaurant,
//     };

//     next();
//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message:
//         error.name === "TokenExpiredError"
//           ? "Session expired. Please log in again."
//           : "Invalid or expired authentication token.",
//     });
//   }
// };

// module.exports = adminMiddleware;


const jwt = require("jsonwebtoken");
const { Admin, Restaurant } = require("../models");

const adminMiddleware = async (req, res, next) => {
  // console.log("Admin Middleware: Checking authorization header", req.headers.authorization);
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin" || !decoded.adminId) {
      return res.status(403).json({
        success: false,
        message: "Invalid admin token",
      });
    }

    const admin = await Admin.findByPk(decoded.adminId, {
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
        message: "Admin account not found",
      });
    }

    if (!admin.restaurantId || !admin.restaurant) {
      return res.status(403).json({
        success: false,
        message: "Admin is not assigned to a restaurant",
      });
    }

    if (admin.restaurant.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Restaurant account is inactive",
      });
    }

    // Attach authenticated admin to request
    req.admin = {
      id: admin.id,
      username: admin.username,
      restaurantId: admin.restaurantId,
      restaurant: admin.restaurant,
    };

    next();
  } catch (error) {
    console.error("Admin middleware error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = adminMiddleware;
