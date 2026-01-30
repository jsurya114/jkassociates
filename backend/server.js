/**
 * J KRISHNAN & CO - Backend Server
 * Production-ready Express server for Render deployment
 */

// ========================
// LOAD ENV VARIABLES
// ========================
require("dotenv").config()

// ========================
// IMPORTS
// ========================
const express = require("express")
const cors = require("cors")
const path = require("path")

// Database
const connectDB = require("./config/db")

// Routes
const newsletterRoutes = require("./routes/newsletterRoutes")
const galleryRoutes = require("./routes/galleryRoutes")
const authRoutes = require("./routes/authRoutes")

// ========================
// INITIALIZE APP
// ========================
const app = express()

// ========================
// CONNECT DATABASE
// ========================
connectDB()

// ========================
// GLOBAL MIDDLEWARE
// ========================

// CORS configuration (Render Static Site → Backend)
app.use(
  cors({
    origin: [
      "https://jkassociates.onrender.com", // Static frontend
      "http://localhost:3000",             // Local frontend (optional)
      "http://localhost:5000"              // Local testing
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
)

// Body parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ========================
// STATIC ADMIN PANEL
// ========================
app.use("/admin", express.static(path.join(__dirname, "public", "admin")))

// ========================
// API ROUTES
// ========================
app.use("/api/newsletters", newsletterRoutes)
app.use("/api/gallery", galleryRoutes)
app.use("/api/auth", authRoutes)

// ========================
// HEALTH CHECK (IMPORTANT FOR RENDER)
// ========================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

// ========================
// ROOT ROUTE
// ========================
app.get("/", (req, res) => {
  res.json({
    message: "J KRISHNAN & CO - Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      newsletters: "/api/newsletters",
      gallery: "/api/gallery",
      auth: "/api/auth",
      admin: "/admin"
    }
  })
})

// ========================
// 404 HANDLER
// ========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  })
})

// ========================
// GLOBAL ERROR HANDLER
// ========================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message)
  console.error(err.stack)

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  })
})

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 5000
const BASE_URL =
  process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   J KRISHNAN & CO - Backend Server Started     ║
╠════════════════════════════════════════════════╣
║   Environment : ${process.env.NODE_ENV || "production"}
║   Base URL    : ${BASE_URL}
║   API Base    : ${BASE_URL}/api
║   Admin Panel : ${BASE_URL}/admin
║   Health      : ${BASE_URL}/health
╚════════════════════════════════════════════════╝
  `)
})

module.exports = app