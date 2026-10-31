
const jwt = require("jsonwebtoken");
const { SuperAdmin } = require("../models");

const superAdminMiddleware = async (req, res, next) => {
    console.log("Super Admin Middleware: Checking authorization header", req.headers.authorization);
  try {
    const authHeader = req.headers.authorization;

     if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.SUPPER_KYE
    );
 console.log("Super Admin Middleware: Token decoded", decoded);
    if (decoded.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin access only",
      });
    }

    const superAdmin = await SuperAdmin.findByPk(decoded.id);

    if (!superAdmin) {
        console.log("Super Admin Middleware: Super Admin not found with ID", decoded.id);
      return res.status(401).json({
        success: false,
        message: "Super Admin account not found",
      });
    }

    req.user = {
      id: superAdmin.id,
      role: "super_admin",
    };

   next();
  } catch (error) {
    console.error("Super Admin Middleware: Error verifying token", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = superAdminMiddleware;
