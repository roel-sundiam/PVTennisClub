const mongoose = require("mongoose");

const ratesSchema = new mongoose.Schema({
  _id: { type: String, default: "court_rates" },
  withoutLightRate: { type: Number, required: true, min: 0 },
  lightRate: { type: Number, required: true, min: 0 },
  training2WithoutLightRate: { type: Number, required: true, min: 0 },
  training2LightRate: { type: Number, required: true, min: 0 },
  ballBoyRate: { type: Number, required: true, min: 0 },
  reservationPeakRate: { type: Number, default: 0, min: 0 },
  reservationNonPeakRate: { type: Number, default: 0, min: 0 },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Rates", ratesSchema);
