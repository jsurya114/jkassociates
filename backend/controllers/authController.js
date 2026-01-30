/**
 * Auth Controller
 * Handles basic admin authentication
 */

const bcrypt = require('bcryptjs');

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username and password'
            });
        }

        // Get admin credentials from environment variables
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Check credentials
        if (username === adminUsername && password === adminPassword) {
            // Generate a simple token (in production, use JWT)
            const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    username
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// @desc    Verify token/session
// @route   GET /api/auth/verify
// @access  Private
exports.verify = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        // Decode and verify token (basic verification)
        try {
            const decoded = Buffer.from(token, 'base64').toString('ascii');
            const [username, timestamp] = decoded.split(':');

            // Check if token is not too old (24 hours)
            const tokenAge = Date.now() - parseInt(timestamp);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            if (tokenAge > maxAge) {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Token valid',
                data: { username }
            });

        } catch (decodeError) {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed',
            error: error.message
        });
    }
};

// @desc    Logout (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logout successful. Please remove token from client.'
    });
};
