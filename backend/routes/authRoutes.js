/**
 * Auth Routes
 * API endpoints for admin authentication
 */

const express = require('express');
const router = express.Router();
const { login, verify, logout } = require('../controllers/authController');

// Admin login
router.post('/login', login);

// Verify token
router.get('/verify', verify);

// Logout
router.post('/logout', logout);

module.exports = router;
