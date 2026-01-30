/**
 * Newsletter Controller
 * Handles all newsletter-related business logic
 */

const Newsletter = require('../models/Newsletter');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all newsletters
// @route   GET /api/newsletters
// @access  Public
exports.getAllNewsletters = async (req, res) => {
    try {
        // Query parameters for filtering
        const { category, limit = 10, page = 1, published } = req.query;

        // Build query
        const query = {};

        // Filter by category if provided
        if (category) {
            query.category = category;
        }

        // Filter by published status (default: only published)
        if (published !== 'all') {
            query.isPublished = true;
        }

        // Calculate skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Fetch newsletters
        const newsletters = await Newsletter.find(query)
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Newsletter.countDocuments(query);

        res.status(200).json({
            success: true,
            count: newsletters.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: newsletters
        });

    } catch (error) {
        console.error('Error fetching newsletters:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch newsletters',
            error: error.message
        });
    }
};

// @desc    Get single newsletter by ID
// @route   GET /api/newsletters/:id
// @access  Public
exports.getNewsletterById = async (req, res) => {
    try {
        const newsletter = await Newsletter.findById(req.params.id);

        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: 'Newsletter not found'
            });
        }

        res.status(200).json({
            success: true,
            data: newsletter
        });

    } catch (error) {
        console.error('Error fetching newsletter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch newsletter',
            error: error.message
        });
    }
};

// @desc    Create new newsletter
// @route   POST /api/newsletters
// @access  Private (Admin)
exports.createNewsletter = async (req, res) => {
    try {
        const { title, category, summary, content, author, isPublished } = req.body;

        // Validate required fields (image and content are now optional)
        if (!title || !category || !summary) {
            // Delete uploaded image if validation fails
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }

            return res.status(400).json({
                success: false,
                message: 'Please provide title, category, and summary'
            });
        }

        // Build newsletter data
        const newsletterData = {
            title,
            category,
            summary,
            content,
            author: author || 'J KRISHNAN & CO',
            isPublished: isPublished !== 'false',
            publishedAt: new Date()
        };

        // Add image data only if a file was uploaded
        if (req.file) {
            newsletterData.imageUrl = req.file.path;
            newsletterData.publicId = req.file.filename;
        }

        // Create newsletter
        const newsletter = await Newsletter.create(newsletterData);

        res.status(201).json({
            success: true,
            message: 'Newsletter created successfully',
            data: newsletter
        });

    } catch (error) {
        console.error('Error creating newsletter:', error);

        // Cleanup image on error
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename);
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create newsletter',
            error: error.message
        });
    }
};

// @desc    Update newsletter
// @route   PUT /api/newsletters/:id
// @access  Private (Admin)
exports.updateNewsletter = async (req, res) => {
    try {
        const { title, category, summary, content, imageUrl, author, isPublished } = req.body;

        // Find newsletter
        let newsletter = await Newsletter.findById(req.params.id);

        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: 'Newsletter not found'
            });
        }

        // Update fields
        newsletter.title = title || newsletter.title;
        newsletter.category = category || newsletter.category;
        newsletter.summary = summary || newsletter.summary;
        newsletter.author = author || newsletter.author;
        newsletter.isPublished = isPublished !== undefined ? isPublished : newsletter.isPublished;

        // Handle Image Update (File or URL)
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (newsletter.publicId) {
                await cloudinary.uploader.destroy(newsletter.publicId);
            }
            newsletter.imageUrl = req.file.path;
            newsletter.publicId = req.file.filename;
        } else if (imageUrl !== undefined) {
            // If explicit URL is provided (and no file), update it
            // If it's a new URL and we had a Cloudinary image, we might want to keep the old one or delete it
            // For simplicity, we just update the URL
            newsletter.imageUrl = imageUrl;
            // Clear publicId if it's an external URL
            if (imageUrl.startsWith('http') && !imageUrl.includes('cloudinary')) {
                newsletter.publicId = '';
            }
        }

        // Save updated newsletter
        await newsletter.save();

        res.status(200).json({
            success: true,
            message: 'Newsletter updated successfully',
            data: newsletter
        });

    } catch (error) {
        console.error('Error updating newsletter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update newsletter',
            error: error.message
        });
    }
};

// @desc    Delete newsletter
// @route   DELETE /api/newsletters/:id
// @access  Private (Admin)
exports.deleteNewsletter = async (req, res) => {
    try {
        const newsletter = await Newsletter.findById(req.params.id);

        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: 'Newsletter not found'
            });
        }

        // Delete image from Cloudinary if it exists
        if (newsletter.publicId) {
            try {
                await cloudinary.uploader.destroy(newsletter.publicId);
            } catch (err) {
                console.error('Error deleting image from Cloudinary:', err);
            }
        }

        await newsletter.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Newsletter deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting newsletter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete newsletter',
            error: error.message
        });
    }
};

// @desc    Get newsletter categories
// @route   GET /api/newsletters/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = [
            'GST Update',
            'Income Tax',
            'MCA & ROC',
            'Audit & Assurance',
            'Compliance Alert',
            'Advisory',
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

// @desc    Upload content image for newsletter body
// @route   POST /api/newsletters/upload-image
// @access  Private (Admin)
exports.uploadContentImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imageUrl: req.file.path,
                publicId: req.file.filename
            }
        });

    } catch (error) {
        console.error('Error uploading content image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
};
