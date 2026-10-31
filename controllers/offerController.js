
const { Product, ProductOffer } = require("../models");

// Validate discount and date values
const validateOffer = (body, productPrice) => {
  const { discountType, discountValue, startAt, endAt, status } = body;

  if (!["percentage", "fixed"].includes(discountType)) {
    return "Discount type must be percentage or fixed";
  }

  const value = Number(discountValue);

  if (!Number.isFinite(value) || value <= 0) {
    return "Discount value must be greater than zero";
  }

  if (discountType === "percentage" && value > 100) {
    return "Percentage discount cannot exceed 100%";
  }

  if (discountType === "fixed" && value >= Number(productPrice)) {
    return "Fixed discount must be less than the product price";
  }

  const start = new Date(startAt);
  const end = new Date(endAt);

  if (
    !startAt ||
    !endAt ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return "Valid offer start and end dates are required";
  }

  if (start >= end) {
    return "Offer end date must be after start date";
  }

  if (status !== undefined && !["active", "inactive"].includes(status)) {
    return "Invalid offer status";
  }

  return null;
};

// CREATE OFFER
exports.createOffer = async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;
    const { productId, discountType, discountValue, startAt, endAt } =
      req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findOne({
      where: {
        id: productId,
        restaurantId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found in your restaurant",
      });
    }

    const existingOffer = await ProductOffer.findOne({
      where: {
        productId: product.id,
        restaurantId,
      },
    });

    if (existingOffer) {
      return res.status(409).json({
        success: false,
        message: "An offer already exists for this product. Update it instead.",
      });
    }

    const validationError = validateOffer(
      { ...req.body, discountType, discountValue, startAt, endAt },
      product.price
    );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const offer = await ProductOffer.create({
      restaurantId,
      productId: product.id,
      discountType,
      discountValue: Number(discountValue),
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      status: req.body.status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Offer created successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Create offer error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create offer",
    });
  }
};

// GET ALL RESTAURANT OFFERS
exports.getOffers = async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;

    const offers = await ProductOffer.findAll({
      where: { restaurantId },
      include: [
        {
          model: Product,
          as: "product",
          attributes: [
            "id",
            "name",
            "price",
            "image",
            "isAvailable",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    console.error("Get offers error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch offers",
    });
  }
};

// UPDATE OFFER
exports.updateOffer = async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;

    const offer = await ProductOffer.findOne({
      where: {
        id: req.params.id,
        restaurantId,
      },
      include: [
        {
          model: Product,
          as: "product",
        },
      ],
    });

    if (!offer || !offer.product) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    const updatedData = {
      discountType: req.body.discountType ?? offer.discountType,
      discountValue: req.body.discountValue ?? offer.discountValue,
      startAt: req.body.startAt ?? offer.startAt,
      endAt: req.body.endAt ?? offer.endAt,
      status: req.body.status ?? offer.status,
    };

    const validationError = validateOffer(
      updatedData,
      offer.product.price
    );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    offer.discountType = updatedData.discountType;
    offer.discountValue = Number(updatedData.discountValue);
    offer.startAt = new Date(updatedData.startAt);
    offer.endAt = new Date(updatedData.endAt);
    offer.status = updatedData.status;

    await offer.save();

    return res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Update offer error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update offer",
    });
  }
};

// DELETE OFFER
exports.deleteOffer = async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;

    const offer = await ProductOffer.findOne({
      where: {
        id: req.params.id,
        restaurantId,
      },
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    await offer.destroy();

    return res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Delete offer error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete offer",
    });
  }
};
