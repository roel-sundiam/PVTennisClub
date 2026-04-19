const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Reservation = require("../models/Reservation");
const Rates = require("../models/Rates");

const PEAK_SLOTS = new Set(["5am", "6pm", "7pm", "8pm", "9pm"]);

const router = express.Router();

// GET /api/reservations/availability?court=1&date=2026-04-20
router.get("/availability", auth, async (req, res) => {
  try {
    const { court, date } = req.query;
    if (!court || !date) {
      return res.status(400).json({ error: "court and date are required" });
    }
    const courtNum = Number(court);
    if (courtNum !== 1 && courtNum !== 2) {
      return res.status(400).json({ error: "court must be 1 or 2" });
    }
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    const booked = await Reservation.find({
      court: courtNum,
      date: { $gte: start, $lte: end },
      status: "confirmed",
    }).select("timeSlot -_id");

    res.json({ bookedSlots: booked.map((r) => r.timeSlot) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/reservations/schedule — all confirmed reservations visible to any player
router.get("/schedule", auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ status: "confirmed" })
      .populate("player", "name")
      .populate("players", "name")
      .sort({ date: 1, court: 1, timeSlot: 1 })
      .lean();
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/reservations/my — player's own reservations
router.get("/my", auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ player: req.user.userId })
      .populate("players", "name email")
      .sort({ date: -1, timeSlot: 1 })
      .lean();
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/reservations — all reservations (admin)
router.get("/", auth, admin, async (req, res) => {
  try {
    const { date, court } = req.query;
    const filter = {};
    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }
    if (court) {
      const courtNum = Number(court);
      if (courtNum === 1 || courtNum === 2) filter.court = courtNum;
    }
    const reservations = await Reservation.find(filter)
      .populate("player", "name email")
      .populate("players", "name email")
      .sort({ date: -1, court: 1, timeSlot: 1 })
      .lean();
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/reservations — book a slot (player)
router.post("/", auth, async (req, res) => {
  try {
    const { court, date, timeSlot, players = [] } = req.body;
    if (!court || !date || !timeSlot) {
      return res.status(400).json({ error: "court, date, and timeSlot are required" });
    }
    const courtNum = Number(court);
    if (courtNum !== 1 && courtNum !== 2) {
      return res.status(400).json({ error: "court must be 1 or 2" });
    }

    const parsedDate = new Date(date);
    parsedDate.setUTCHours(0, 0, 0, 0);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (parsedDate < today) {
      return res.status(400).json({ error: "Cannot book a past date" });
    }

    // Remove duplicates and exclude the booking owner from the players list
    const additionalPlayers = [...new Set(
      (Array.isArray(players) ? players : [])
        .map(String)
        .filter((id) => id && id !== String(req.user.userId)),
    )];

    // Fetch current rates and compute court fee server-side
    const rawRates = await Rates.collection.findOne({ _id: "court_rates" });
    const peakRate = Number(rawRates?.reservationPeakRate ?? 0);
    const nonPeakRate = Number(rawRates?.reservationNonPeakRate ?? 0);
    const isPeak = PEAK_SLOTS.has(timeSlot);
    const courtFee = isPeak ? peakRate : nonPeakRate;

    const reservation = await Reservation.create({
      court: courtNum,
      date: parsedDate,
      timeSlot,
      player: req.user.userId,
      players: additionalPlayers,
      courtFee,
      ratesUsed: { peakRate, nonPeakRate },
    });

    res.status(201).json(reservation);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "That slot is already booked" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/reservations/:id/cancel — cancel (owner or admin)
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ error: "Reservation not found" });

    const isOwner = reservation.player.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Access denied" });

    reservation.status = "cancelled";
    await reservation.save();
    res.json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/reservations/:id — hard delete (admin)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ error: "Reservation not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
