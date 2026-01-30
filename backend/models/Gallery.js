/**
 * Gallery Model
 * Mongoose schema for storing gallery images
 */

const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    // Title/Caption for the image
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [150, 'Title cannot exceed 150 characters']
    },

    // Description of the image (optional)
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },

    // Cloudinary image URL
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required']
    },

    // Cloudinary public ID (needed for deletion) - optional for external URLs
    publicId: {
        type: String,
        default: null
    },

    // Whether this is an external URL (not uploaded to Cloudinary)
    isExternalUrl: {
        type: Boolean,
        default: false
    },

    // Image category for filtering (optional)
    category: {
        type: String,
        trim: true,
        enum: {
            values: ['Office', 'Team', 'Events', 'Engagements', 'Other'],
            message: 'Invalid category'
        },
        default: 'Other'
    },

    // Display order (lower number = show first)
    displayOrder: {
        type: Number,
        default: 0
    },

    // Whether to show in gallery
    isVisible: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

// Index for display order
gallerySchema.index({ displayOrder: 1 });
gallerySchema.index({ category: 1 });
gallerySchema.index({ isVisible: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);
