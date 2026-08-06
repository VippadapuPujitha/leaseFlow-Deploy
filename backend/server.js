const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cron = require("node-cron");
const { deleteExpiredRequests } = require("./controllers/requestController");



connectDB();

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("API Secret exists:", !!process.env.CLOUDINARY_API_SECRET);

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://lease-flow-deploy-git-main-vippadapu-pujitha.vercel.app",
    ],
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

// Property Routes
app.use("/api/properties", propertyRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("LeaseFlow API Working");
});
cron.schedule("* * * * *", async () => {
  console.log("Checking expired rental requests...");
  await deleteExpiredRequests();
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get("/check-server", (req, res) => {
  res.send("SERVER WORKING");
});