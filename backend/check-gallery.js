const mongoose = require('mongoose');
require('dotenv').config();
const Gallery = require('./models/Gallery');

async function checkGallery() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const count = await Gallery.countDocuments();
        console.log(`Total images in gallery: ${count}`);

        const latest = await Gallery.find().sort({ createdAt: -1 }).limit(5);
        console.log('Latest 5 images:');
        latest.forEach(img => {
            console.log(`- Title: ${img.title}, Created: ${img.createdAt}, Visible: ${img.isVisible}, URL: ${img.imageUrl}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkGallery();
