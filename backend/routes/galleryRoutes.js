/**
 * Gallery Routes
 * API endpoints for gallery management including image uploads
 */

const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const {
    getAllImages,
    getImageById,
    uploadImage,
    addImageByUrl,
    updateImage,
    deleteImage,
    getCategories
} = require('../controllers/galleryController');

// Get all categories (before :id route to avoid conflict)
router.get('/categories', getCategories);

// Get all images
router.get('/', getAllImages);

// Get single image
router.get('/:id', getImageById);

// Add image by URL (Admin only) - no file upload
router.post('/url', addImageByUrl);

// Upload new image (Admin only) - uses Multer middleware
router.post('/', upload.single('image'), uploadImage);

// Update image details (Admin only)
router.put('/:id', updateImage);

// Delete image (Admin only)
router.delete('/:id', deleteImage);

module.exports = router;
