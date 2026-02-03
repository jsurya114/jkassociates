/**
 * Gallery Page Dynamic Content
 * Fetches and displays gallery images from the backend API
 * 
 * Include this script in your gallery.html page
 */

// API Configuration - Update this URL when deploying
const API_URL = 'https://api.jkrishnan.co.in/api';

// ========================
// FETCH AND DISPLAY GALLERY IMAGES
// ========================
document.addEventListener('DOMContentLoaded', function () {
    loadGalleryImages();
});

async function loadGalleryImages() {
    const container = document.querySelector('.gallery-grid');

    if (!container) {
        console.error('Gallery container not found');
        return;
    }

    // Show loading state
    container.innerHTML = `
        <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 30px; color: #298cbe;"></i>
            <p style="margin-top: 15px; color: #666;">Loading gallery...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/gallery?limit=50`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            container.innerHTML = data.data.map(image => `
                <div class="gallery-item" onclick="openLightbox('${image.imageUrl}', '${escapeHtml(image.title)}', '${escapeHtml(image.description || '')}')">
                    <div class="gallery-image">
                        <img src="${image.imageUrl}" alt="${escapeHtml(image.title)}" loading="lazy">
                    </div>
                    <div class="gallery-content">
                        <span class="gallery-category">${escapeHtml(image.category)}</span>
                        <h4 class="gallery-title">${escapeHtml(image.title)}</h4>
                        ${image.description ? `<p class="gallery-desc">${escapeHtml(image.description)}</p>` : ''}
                    </div>
                </div>
            `).join('');

            // Add lightbox to the page if it doesn't exist
            addLightbox();
        } else {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-images" style="font-size: 50px; color: #ddd;"></i>
                    <p style="margin-top: 20px; color: #666;">No images available yet. Check back soon!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
        container.innerHTML = `
            <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 50px; color: #ef4444;"></i>
                <p style="margin-top: 20px; color: #666;">Unable to load gallery. Please try again later.</p>
            </div>
        `;
    }
}

// ========================
// LIGHTBOX FUNCTIONALITY
// ========================
function addLightbox() {
    // Check if lightbox already exists
    if (document.getElementById('galleryLightbox')) return;

    const lightboxHTML = `
        <div id="galleryLightbox" class="gallery-lightbox" onclick="closeLightbox()">
            <span class="lightbox-close" onclick="closeLightbox()">&times;</span>
            <img class="lightbox-image" id="lightboxImage" src="" alt="">
            <div class="lightbox-caption" id="lightboxCaption"></div>
        </div>
        <style>
            .gallery-lightbox {
                display: none;
                position: fixed;
                z-index: 9999;
                padding: 20px;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0,0,0,0.95);
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }
            .gallery-lightbox.show {
                display: flex;
            }
            .lightbox-close {
                position: absolute;
                top: 20px;
                right: 35px;
                color: #fff;
                font-size: 40px;
                font-weight: bold;
                cursor: pointer;
                z-index: 10000;
            }
            .lightbox-close:hover {
                color: #298cbe;
            }
            .lightbox-image {
                max-width: 90%;
                max-height: 80vh;
                object-fit: contain;
                animation: zoomIn 0.3s ease;
            }
            .lightbox-caption {
                color: #fff;
                text-align: center;
                padding: 15px 20px;
                font-size: 16px;
            }
            @keyframes zoomIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    // Close on escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLightbox();
    });
}

function openLightbox(imageUrl, title, description) {
    const lightbox = document.getElementById('galleryLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');

    if (lightbox && lightboxImage) {
        lightboxImage.src = imageUrl;
        // Show title and description if available
        let captionText = title;
        if (description && description.trim()) {
            captionText += ` — ${description}`;
        }
        lightboxCaption.textContent = captionText;
        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('galleryLightbox');
    if (lightbox) {
        lightbox.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// ========================
// CATEGORY FILTER (Optional)
// ========================
function filterGallery(category) {
    const items = document.querySelectorAll('.gallery-item');

    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// ========================
// UTILITIES
// ========================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
