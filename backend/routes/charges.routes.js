const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Charge = require("../models/Charge");

const router = express.Router();

// GET /api/charges/my - get player's own charges
router.get("/my", auth, async (req, res) => {
  try {
    console.log("Fetching charges for user:", req.user.userId);
    const charges = await Charge.find({ playerId: req.user.userId })
      .populate("reservationId", "date court timeSlot")
      .populate("sessionId", "date startTime ballBoyUsed")
      .sort({ createdAt: -1 })
      .lean();
    console.log("Found charges:", charges.length);
    res.json(charges);
  } catch (err) {
    console.error("Error fetching charges:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// GET /api/charges/:id - get single charge (player owner or admin)
router.get("/:id", auth, async (req, res) => {
  try {
    const charge = await Charge.findById(req.params.id)
      .populate("playerId", "name email")
      .populate("reservationId", "date court timeSlot")
      .populate("sessionId", "date startTime endTime ballBoyUsed");

    if (!charge) {
      return res.status(404).json({ error: "Charge not found" });
    }

    // Check access: own charge or admin
    const isOwner = charge.playerId._id.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(charge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/charges/:id/pay - mark charge as paid (player or admin)
router.patch("/:id/pay", auth, async (req, res) => {
  try {
    console.log("PATCH /charges/:id/pay received");
    console.log("Charge ID:", req.params.id);
    console.log("User ID:", req.user.userId);
    console.log("Request body:", req.body);

    const { paymentMethod } = req.body;

    if (!paymentMethod || !["GCash", "Cash", "Bank Transfer"].includes(paymentMethod)) {
      console.error("Invalid payment method:", paymentMethod);
      return res.status(400).json({ error: "Valid paymentMethod required (GCash, Cash, Bank Transfer)" });
    }

    const charge = await Charge.findById(req.params.id);
    console.log("Charge found:", charge ? "yes" : "no");

    if (!charge) {
      return res.status(404).json({ error: "Charge not found" });
    }

    // Check access: own charge or admin
    const isOwner = charge.playerId.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";

    console.log("Is owner:", isOwner, "Is admin:", isAdmin);
    console.log("Charge playerId:", charge.playerId.toString(), "User ID:", req.user.userId);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (charge.status === "paid") {
      return res.status(400).json({ error: "Charge already marked as paid" });
    }

    charge.status = "paid";
    charge.paymentMethod = paymentMethod;
    charge.paidAt = new Date();

    await charge.save();
    console.log("Charge saved successfully:", charge._id);

    res.json({ message: "Payment logged successfully", charge });
  } catch (err) {
    console.error("Error in PATCH /charges/:id/pay:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// GET /api/charges - list all charges (admin)
router.get("/", auth, admin, async (req, res) => {
  try {
    const { playerId, status } = req.query;
    const filter = {};

    if (playerId) filter.playerId = playerId;
    if (status && ["paid", "unpaid"].includes(status)) filter.status = status;

    const charges = await Charge.find(filter)
      .populate("playerId", "name email username")
      .populate("reservationId", "date court timeSlot")
      .populate("sessionId", "date startTime ballBoyUsed")
      .sort({ createdAt: -1 })
      .lean();

    res.json(charges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
