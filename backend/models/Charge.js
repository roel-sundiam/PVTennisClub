const mongoose = require("mongoose");

const chargeSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    amount: { type: Number, required: true },
    breakdown: {
      withoutLightFee: { type: Number, required: true },
      lightFee: { type: Number, required: true },
      ballBoyFee: { type: Number, required: true },
    },
    status: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
    paymentMethod: { type: String, enum: ["GCash", "Cash", "Bank Transfer"] },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Charge", chargeSchema);
