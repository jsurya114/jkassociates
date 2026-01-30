/**
 * J KRISHNAN & CO - Backend Server
 * Main entry point for the Express server
 */

// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import database connection
const connectDB = require('./config/db');

// Import routes
const newsletterRoutes = require('./routes/newsletterRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const authRoutes = require('./routes/authRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ========================
// MIDDLEWARE
// ========================

// Enable CORS for all origins (adjust in production)
app.use(cors({
    origin: '*', // In production, replace with your domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public folder (Admin Panel)
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// ========================
// API ROUTES
// ========================

// Newsletter routes
app.use('/api/newsletters', newsletterRoutes);

// Gallery routes
app.use('/api/gallery', galleryRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

// ========================
// ROOT ROUTE
// ========================
app.get('/', (req, res) => {
    res.json({
        message: 'J KRISHNAN & CO - Backend API',
        version: '1.0.0',
        endpoints: {
            newsletters: '/api/newsletters',
            gallery: '/api/gallery',
            auth: '/api/auth',
            admin: '/admin'
        }
    });
});

// ========================
// ERROR HANDLING
// ========================

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║   J KRISHNAN & CO - Backend Server Started     ║
╠════════════════════════════════════════════════╣
║   Port: ${PORT}                                    ║
║   Admin Panel: http://localhost:${PORT}/admin      ║
║   API Base: http://localhost:${PORT}/api           ║
╚════════════════════════════════════════════════╝
    `);
});

module.exports = app;
