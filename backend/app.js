const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const ratesRoutes = require("./routes/rates.routes");
const sessionsRoutes = require("./routes/sessions.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const reservationsRoutes = require("./routes/reservations.routes");
const chargesRoutes = require("./routes/charges.routes");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:4200", "http://localhost:4201"],
    credentials: true,
  }),
);
app.use(express.json());

// DB connection (cached for serverless warm invocations)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    res.status(503).json({ error: "Database unavailable" });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/rates", ratesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api/charges", chargesRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

module.exports = app;
