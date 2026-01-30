/**
 * Newsletter Model
 * Mongoose schema for storing newsletter/blog articles
 */

const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
    // Title of the newsletter article
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },

    // Category/Tag for the newsletter (e.g., GST Update, Income Tax, etc.)
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        enum: {
            values: ['GST Update', 'Income Tax', 'MCA & ROC', 'Audit & Assurance', 'Compliance Alert', 'Advisory', 'Other'],
            message: 'Invalid category'
        },
        default: 'Other'
    },

    // Short summary/excerpt for the newsletter listing
    summary: {
        type: String,
        required: [true, 'Summary is required'],
        trim: true,
        maxlength: [500, 'Summary cannot exceed 500 characters']
    },

    // Full content of the newsletter (optional)
    content: {
        type: String,
        default: ''
    },

    // Optional featured image URL
    imageUrl: {
        type: String,
        default: ''
    },

    // Optional Cloudinary public ID
    publicId: {
        type: String,
        default: ''
    },

    // Author name (optional)
    author: {
        type: String,
        default: 'J KRISHNAN & CO',
        trim: true
    },

    // Publication status
    isPublished: {
        type: Boolean,
        default: true
    },

    // Publication date
    publishedAt: {
        type: Date,
        default: Date.now
    }

}, {
    // Add timestamps for createdAt and updatedAt
    timestamps: true
});

// Index for faster queries
newsletterSchema.index({ publishedAt: -1 });
newsletterSchema.index({ category: 1 });
newsletterSchema.index({ isPublished: 1 });

// Virtual for formatted date
newsletterSchema.virtual('formattedDate').get(function () {
    return this.publishedAt.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Ensure virtuals are included when converting to JSON
newsletterSchema.set('toJSON', { virtuals: true });
newsletterSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Newsletter', newsletterSchema);
