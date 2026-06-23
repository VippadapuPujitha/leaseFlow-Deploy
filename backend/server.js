const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");


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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Auth Routes
app.use("/api/auth", authRoutes);

// User Routes
app.use("/api/users", userRoutes);

// Request Routes
app.use("/api/requests", requestRoutes);
console.log("REQUEST ROUTES IMPORTED");

// Property Routes
app.use("/api/properties", propertyRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("ACE TEST 123");
});

const PORT = process.env.PORT || 5000;
console.log("SERVER FILE UPDATED");
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get("/check-server", (req, res) => {
  res.send("SERVER WORKING");
});