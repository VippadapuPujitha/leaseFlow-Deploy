const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const requestRoutes = require("./routes/requestRoutes");
const reportRoutes = require("./routes/reportRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Auth Routes
app.use("/api/auth", authRoutes);

// Request Routes
app.use("/api/requests", requestRoutes);

// Report Routes
app.use("/api/reports", reportRoutes);

// Property Routes
app.use("/api/properties", propertyRoutes);

app.get("/", (req, res) => {
  res.send("LeaseFlow API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});