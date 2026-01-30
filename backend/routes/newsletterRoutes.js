/**
 * Newsletter Routes
 * API endpoints for newsletter management
 */

const express = require('express');
const router = express.Router();
const {
    getAllNewsletters,
    getNewsletterById,
    createNewsletter,
    updateNewsletter,
    deleteNewsletter,
    getCategories,
    uploadContentImage
} = require('../controllers/newsletterController');

const { upload } = require('../config/cloudinary');

// Get all categories (before :id route to avoid conflict)
router.get('/categories', getCategories);

// Get all newsletters
router.get('/', getAllNewsletters);

// Get single newsletter
router.get('/:id', getNewsletterById);

// Create new newsletter (Admin only) - now with image upload
router.post('/', upload.single('image'), createNewsletter);

// Update newsletter (Admin only)
router.put('/:id', upload.single('image'), updateNewsletter);

// Delete newsletter (Admin only)
router.delete('/:id', deleteNewsletter);

module.exports = router;
