/**
 * Newsletter Page Dynamic Content
 * Fetches and displays newsletters from the backend API
 * 
 * Include this script in your newsletter.html page
 */

// API Configuration - Update this URL when deploying
const API_URL = 'http://localhost:5000/api';

// ========================
// FETCH AND DISPLAY NEWSLETTERS
// ========================
document.addEventListener('DOMContentLoaded', function () {
    const isSinglePage = window.location.pathname.includes('newsletter-single');

    if (isSinglePage) {
        loadSingleNewsletter();
    } else if (document.querySelector('.newsletter-grid')) {
        loadNewsletters();
    }
});

async function loadNewsletters() {
    const container = document.querySelector('.newsletter-grid');

    if (!container) {
        console.error('Newsletter container not found');
        return;
    }

    // Show loading state
    container.innerHTML = `
        <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 30px; color: #298cbe;"></i>
            <p style="margin-top: 15px; color: #666;">Loading newsletters...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/newsletters?limit=20`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            container.innerHTML = data.data.map(newsletter => `
                <article class="newsletter-card">
                    <img src="${newsletter.imageUrl || 'images/default-newsletter.jpg'}" alt="${escapeHtml(newsletter.title)}">
                    <div class="newsletter-content">
                        <span class="newsletter-tag">${escapeHtml(newsletter.category)}</span>
                        <h3>${escapeHtml(newsletter.title)}</h3>
                        <p>${escapeHtml(newsletter.summary)}</p>
                        <a href="newsletter-single.html?id=${newsletter._id}" class="read-more">Read More →</a>
                    </div>
                </article>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-newspaper" style="font-size: 50px; color: #ddd;"></i>
                    <p style="margin-top: 20px; color: #666;">No newsletters available yet. Check back soon!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading newsletters:', error);
        container.innerHTML = `
            <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 50px; color: #ef4444;"></i>
                <p style="margin-top: 20px; color: #666;">Unable to load newsletters. Please try again later.</p>
            </div>
        `;
    }
}

// ========================
// SINGLE NEWSLETTER PAGE
// ========================
async function loadSingleNewsletter() {
    const urlParams = new URLSearchParams(window.location.search);
    const newsletterId = urlParams.get('id');

    if (!newsletterId) {
        console.error('No newsletter ID provided');
        return;
    }

    // Find the container - adjust selector based on your HTML structure
    const container = document.querySelector('.newsletter-article') || document.querySelector('.newsletter-single-content') || document.querySelector('main');

    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/newsletters/${newsletterId}`);
        const data = await response.json();

        if (data.success) {
            const newsletter = data.data;

            // Update page title
            document.title = `${newsletter.title} | J KRISHNAN & CO`;

            // Update content - adjust selectors based on your HTML
            const titleEl = document.querySelector('.newsletter-title') || document.querySelector('h1');
            const categoryEl = document.querySelector('.newsletter-category');
            const dateEl = document.querySelector('.newsletter-date');
            const contentEl = document.querySelector('.newsletter-body') || document.querySelector('.newsletter-content');
            const imageEl = document.querySelector('.newsletter-featured-image img');

            if (titleEl) titleEl.textContent = newsletter.title;
            if (categoryEl) categoryEl.textContent = newsletter.category;
            if (dateEl) dateEl.textContent = formatDate(newsletter.publishedAt);
            if (contentEl) {
                // Render content as HTML, converting newlines to <br>
                let content = newsletter.content;

                // Render [[IMAGE:URL]] placeholders as real images
                content = content.replace(/\[\[IMAGE:(.*?)\]\]/g, (match, url) => {
                    return `<div class="article-content-image" style="text-align: center; margin: 25px 0;">
                                <img src="${url}" alt="Article Image" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                            </div>`;
                });

                contentEl.innerHTML = content.replace(/\n/g, '<br>');
            }
            if (imageEl && newsletter.imageUrl) imageEl.src = newsletter.imageUrl;

        } else {
            container.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <h2>Newsletter Not Found</h2>
                    <p>The requested newsletter could not be found.</p>
                    <a href="newsletter.html" class="btn">Back to Newsletters</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading newsletter:', error);
    }
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Initial detection moved to the top DOMContentLoaded listener

