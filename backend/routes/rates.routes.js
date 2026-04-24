const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Rates = require("../models/Rates");

const router = express.Router();

// GET /api/rates
router.get("/", auth, async (req, res) => {
  try {
    const rawRates = await Rates.collection.findOne({ _id: "court_rates" });

    const safe = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

    const normalizedRates = {
      withoutLightRate: safe(rawRates?.withoutLightRate ?? rawRates?.gameRate),
      lightRate: safe(rawRates?.lightRate ?? rawRates?.withLightRate),
      training2WithoutLightRate: safe(rawRates?.training2WithoutLightRate),
      training2LightRate: safe(rawRates?.training2LightRate),
      ballBoyRate: safe(rawRates?.ballBoyRate ?? rawRates?.ballboyRate),
      reservationWeekdayRate: safe(rawRates?.reservationWeekdayRate ?? rawRates?.reservationPeakRate ?? rawRates?.reservationNonPeakRate),
      reservationWeekendRate: safe(rawRates?.reservationWeekendRate ?? rawRates?.reservationPeakRate ?? rawRates?.reservationNonPeakRate),
      reservationHolidayRate: safe(rawRates?.reservationHolidayRate ?? rawRates?.reservationPeakRate ?? rawRates?.reservationNonPeakRate),
      reservationGuestFee: safe(rawRates?.reservationGuestFee),
      rentalBalls50Rate: safe(rawRates?.rentalBalls50Rate),
      rentalBalls100Rate: safe(rawRates?.rentalBalls100Rate),
      rentalBallMachineRate: safe(rawRates?.rentalBallMachineRate),
      rentalRacketRate: safe(rawRates?.rentalRacketRate),
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
    const training2WithoutLightRate = Number(req.body.training2WithoutLightRate);
    const training2LightRate = Number(req.body.training2LightRate);
    const ballBoyRate = Number(req.body.ballBoyRate);
    const reservationWeekdayRate = Number(req.body.reservationWeekdayRate ?? 0);
    const reservationWeekendRate = Number(req.body.reservationWeekendRate ?? 0);
    const reservationHolidayRate = Number(req.body.reservationHolidayRate ?? 0);
    const reservationGuestFee = Number(req.body.reservationGuestFee ?? 0);
    const rentalBalls50Rate = Number(req.body.rentalBalls50Rate ?? 0);
    const rentalBalls100Rate = Number(req.body.rentalBalls100Rate ?? 0);
    const rentalBallMachineRate = Number(req.body.rentalBallMachineRate ?? 0);
    const rentalRacketRate = Number(req.body.rentalRacketRate ?? 0);
    const allRates = [
      withoutLightRate, lightRate,
      training2WithoutLightRate, training2LightRate,
      ballBoyRate,
      reservationWeekdayRate, reservationWeekendRate, reservationHolidayRate,
      reservationGuestFee,
      rentalBalls50Rate, rentalBalls100Rate, rentalBallMachineRate, rentalRacketRate,
    ];

    if (allRates.some((r) => !Number.isFinite(r))) {
      return res.status(400).json({ error: "All rate fields are required and must be numbers" });
    }
    if (allRates.some((r) => r < 0)) {
      return res.status(400).json({ error: "Rates must be non-negative" });
    }

    const rates = await Rates.findByIdAndUpdate(
      "court_rates",
      {
        withoutLightRate, lightRate,
        training2WithoutLightRate, training2LightRate,
        ballBoyRate,
        reservationWeekdayRate, reservationWeekendRate, reservationHolidayRate,
        reservationGuestFee,
        rentalBalls50Rate, rentalBalls100Rate, rentalBallMachineRate, rentalRacketRate,
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
