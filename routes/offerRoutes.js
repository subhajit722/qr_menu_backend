
const express = require("express");
const router = express.Router();

const adminMiddleware = require("../middleware/authMiddleware");

const {
  createOffer,
  getOffers,
  updateOffer,
  deleteOffer,
} = require("../controllers/offerController");

router.use(adminMiddleware);

router.post("/", createOffer);
router.get("/", getOffers);
router.put("/:id", updateOffer);
router.delete("/:id", deleteOffer);

module.exports = router;
