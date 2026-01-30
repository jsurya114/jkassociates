/**
 * Gallery Controller
 * Handles all gallery-related business logic including image uploads
 */

const Gallery = require('../models/Gallery');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
exports.getAllImages = async (req, res) => {
    try {
        const { category, limit = 50, visible } = req.query;

        // Build query
        const query = {};

        // Filter by category if provided
        if (category) {
            query.category = category;
        }

        // Filter by visibility (default: only visible)
        if (visible !== 'all') {
            query.isVisible = true;
        }

        // Fetch images
        const images = await Gallery.find(query)
            .sort({ displayOrder: 1, createdAt: -1 })
            .limit(parseInt(limit));

        // Get total count
        const total = await Gallery.countDocuments(query);

        res.status(200).json({
            success: true,
            count: images.length,
            total,
            data: images
        });

    } catch (error) {
        console.error('Error fetching gallery images:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch gallery images',
            error: error.message
        });
    }
};

// @desc    Get single image by ID
// @route   GET /api/gallery/:id
// @access  Public
exports.getImageById = async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        res.status(200).json({
            success: true,
            data: image
        });

    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch image',
            error: error.message
        });
    }
};

// @desc    Upload new image to gallery
// @route   POST /api/gallery
// @access  Private (Admin)
exports.uploadImage = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }

        const { title, description, category, displayOrder } = req.body;

        // Validate title
        if (!title) {
            // Delete uploaded image from Cloudinary if validation fails
            await cloudinary.uploader.destroy(req.file.filename);

            return res.status(400).json({
                success: false,
                message: 'Please provide a title for the image'
            });
        }

        // Create gallery entry
        const image = await Gallery.create({
            title,
            description: description || '',
            imageUrl: req.file.path, // Cloudinary URL
            publicId: req.file.filename, // Cloudinary public ID
            category: category || 'Other',
            displayOrder: displayOrder ? parseInt(displayOrder) : 0,
            isVisible: true
        });

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            data: image
        });

    } catch (error) {
        console.error('Error uploading image:', error);

        // Try to delete uploaded image if there was an error
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (deleteError) {
                console.error('Error deleting orphaned image:', deleteError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
};

// @desc    Add image by URL (no file upload)
// @route   POST /api/gallery/url
// @access  Private (Admin)
exports.addImageByUrl = async (req, res) => {
    try {
        const { title, description, category, displayOrder, imageUrl } = req.body;

        // Validate required fields
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an image URL'
            });
        }

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a title for the image'
            });
        }

        // Validate URL format
        try {
            new URL(imageUrl);
        } catch (e) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid image URL'
            });
        }

        // Create gallery entry
        const image = await Gallery.create({
            title,
            description: description || '',
            imageUrl,
            publicId: null, // No Cloudinary ID for external URLs
            isExternalUrl: true,
            category: category || 'Other',
            displayOrder: displayOrder ? parseInt(displayOrder) : 0,
            isVisible: true
        });

        res.status(201).json({
            success: true,
            message: 'Image added successfully',
            data: image
        });

    } catch (error) {
        console.error('Error adding image by URL:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add image',
            error: error.message
        });
    }
};

// @desc    Update image details
// @route   PUT /api/gallery/:id
// @access  Private (Admin)
exports.updateImage = async (req, res) => {
    try {
        const { title, description, category, displayOrder, isVisible } = req.body;

        let image = await Gallery.findById(req.params.id);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Update fields
        image.title = title || image.title;
        image.description = description !== undefined ? description : image.description;
        image.category = category || image.category;
        image.displayOrder = displayOrder !== undefined ? parseInt(displayOrder) : image.displayOrder;
        image.isVisible = isVisible !== undefined ? isVisible : image.isVisible;

        await image.save();

        res.status(200).json({
            success: true,
            message: 'Image updated successfully',
            data: image
        });

    } catch (error) {
        console.error('Error updating image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update image',
            error: error.message
        });
    }
};

// @desc    Delete image
// @route   DELETE /api/gallery/:id
// @access  Private (Admin)
exports.deleteImage = async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Delete image from Cloudinary only if it has a publicId (not external URL)
        if (image.publicId && !image.isExternalUrl) {
            try {
                await cloudinary.uploader.destroy(image.publicId);
            } catch (cloudinaryError) {
                console.error('Error deleting from Cloudinary:', cloudinaryError);
                // Continue with database deletion even if Cloudinary fails
            }
        }

        // Delete from database
        await image.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image',
            error: error.message
        });
    }
};

// @desc    Get gallery categories
// @route   GET /api/gallery/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = [
            'Office',
            'Team',
            'Events',
            'Engagements',
            'Other'
        ];

        res.status(200).json({
            success: true,
            data: categories
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};
