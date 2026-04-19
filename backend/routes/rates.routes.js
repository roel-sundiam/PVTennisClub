const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Rates = require("../models/Rates");

const router = express.Router();

// GET /api/rates
router.get("/", auth, async (req, res) => {
  try {
    const rawRates = await Rates.collection.findOne({ _id: "court_rates" });

    const withoutLightRate = Number(
      rawRates?.withoutLightRate ?? rawRates?.gameRate ?? 0,
    );
    const lightRate = Number(
      rawRates?.lightRate ?? rawRates?.withLightRate ?? 0,
    );
    const training2WithoutLightRate = Number(
      rawRates?.training2WithoutLightRate ?? 0,
    );
    const training2LightRate = Number(rawRates?.training2LightRate ?? 0);
    const ballBoyRate = Number(
      rawRates?.ballBoyRate ?? rawRates?.ballboyRate ?? 0,
    );
    const reservationPeakRate = Number(rawRates?.reservationPeakRate ?? 0);
    const reservationNonPeakRate = Number(rawRates?.reservationNonPeakRate ?? 0);

    const normalizedRates = {
      withoutLightRate: Number.isFinite(withoutLightRate) ? withoutLightRate : 0,
      lightRate: Number.isFinite(lightRate) ? lightRate : 0,
      training2WithoutLightRate: Number.isFinite(training2WithoutLightRate) ? training2WithoutLightRate : 0,
      training2LightRate: Number.isFinite(training2LightRate) ? training2LightRate : 0,
      ballBoyRate: Number.isFinite(ballBoyRate) ? ballBoyRate : 0,
      reservationPeakRate: Number.isFinite(reservationPeakRate) ? reservationPeakRate : 0,
      reservationNonPeakRate: Number.isFinite(reservationNonPeakRate) ? reservationNonPeakRate : 0,
    };

    const rates = await Rates.findByIdAndUpdate(
      "court_rates",
      { ...normalizedRates, updatedAt: new Date() },
      { new: true, upsert: true },
    );

    res.json(rates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/rates (admin only)
router.put("/", auth, admin, async (req, res) => {
  try {
    const withoutLightRate = Number(req.body.withoutLightRate);
    const lightRate = Number(req.body.lightRate);
    const training2WithoutLightRate = Number(
      req.body.training2WithoutLightRate,
    );
    const training2LightRate = Number(req.body.training2LightRate);
    const ballBoyRate = Number(req.body.ballBoyRate);
    const reservationPeakRate = Number(req.body.reservationPeakRate ?? 0);
    const reservationNonPeakRate = Number(req.body.reservationNonPeakRate ?? 0);

    if (
      !Number.isFinite(withoutLightRate) ||
      !Number.isFinite(lightRate) ||
      !Number.isFinite(training2WithoutLightRate) ||
      !Number.isFinite(training2LightRate) ||
      !Number.isFinite(ballBoyRate) ||
      !Number.isFinite(reservationPeakRate) ||
      !Number.isFinite(reservationNonPeakRate)
    ) {
      return res.status(400).json({ error: "All rate fields are required and must be numbers" });
    }
    if (
      withoutLightRate < 0 || lightRate < 0 ||
      training2WithoutLightRate < 0 || training2LightRate < 0 ||
      ballBoyRate < 0 || reservationPeakRate < 0 || reservationNonPeakRate < 0
    ) {
      return res.status(400).json({ error: "Rates must be non-negative" });
    }

    const rates = await Rates.findByIdAndUpdate(
      "court_rates",
      {
        withoutLightRate, lightRate,
        training2WithoutLightRate, training2LightRate,
        ballBoyRate, reservationPeakRate, reservationNonPeakRate,
        updatedAt: new Date(),
      },
      { new: true, upsert: true },
    );

    res.json(rates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
