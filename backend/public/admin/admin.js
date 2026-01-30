/**
 * Admin Panel JavaScript
 * Handles all admin functionality including authentication, CRUD operations, and UI interactions
 */

// ========================
// CONFIGURATION
// ========================
const API_BASE_URL = window.location.origin + '/api';
let authToken = localStorage.getItem('adminToken') || null;

// ========================
// INITIALIZATION
// ========================
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (authToken) {
        verifyToken();
    } else {
        showLogin();
    }

    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Newsletter form
    document.getElementById('addNewsletterBtn').addEventListener('click', showNewsletterForm);
    document.getElementById('cancelNewsletterBtn').addEventListener('click', hideNewsletterForm);
    document.getElementById('newsletterForm').addEventListener('submit', handleNewsletterSubmit);

    // Image form
    document.getElementById('imageForm').addEventListener('submit', handleImageSubmit);
    document.getElementById('imageFile').addEventListener('change', handleImagePreview);
    document.getElementById('resetImageBtn').addEventListener('click', resetImageForm);

    // Newsletter Image
    document.getElementById('newsletterFile').addEventListener('change', handleNewsletterImagePreview);

    // File upload label click handlers (fallback for cross-browser support)
    document.querySelectorAll('.file-input-label').forEach(label => {
        label.addEventListener('click', (e) => {
            const wrapper = e.target.closest('.file-input-wrapper');
            if (wrapper) {
                const fileInput = wrapper.querySelector('input[type="file"]');
                if (fileInput) {
                    fileInput.click();
                }
            }
        });
    });

    // Confirm dialog
    document.getElementById('confirmNo').addEventListener('click', hideConfirmDialog);
}

// ========================
// AUTHENTICATION
// ========================
async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showDashboard(data.data.username);
        } else {
            handleLogout();
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        handleLogout();
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.data.token;
            localStorage.setItem('adminToken', authToken);
            showDashboard(data.data.username);
            showToast('Login successful!', 'success');
        } else {
            errorDiv.textContent = data.message || 'Login failed';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Connection error. Please try again.';
        errorDiv.classList.add('show');
    }
}

function handleLogout() {
    authToken = null;
    localStorage.removeItem('adminToken');
    showLogin();
    showToast('Logged out successfully');
}

function showLogin() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').classList.remove('show');
}

function showDashboard(username) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    document.getElementById('adminUsername').innerHTML = `<i class="fas fa-user-circle"></i> ${username}`;

    // Load initial data
    loadNewsletters();
    loadImages();
}

// ========================
// TAB NAVIGATION
// ========================
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('active', section.id === `${tabName}Section`);
    });
}

// ========================
// NEWSLETTER CRUD
// ========================
async function loadNewsletters() {
    const listContainer = document.getElementById('newsletterList');
    listContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading newsletters...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/newsletters?published=all&limit=100`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            listContainer.innerHTML = data.data.map(newsletter => `
                <div class="list-item" data-id="${newsletter._id}">
                    <div class="item-info">
                        <h4>${escapeHtml(newsletter.title)}</h4>
                        <p>${escapeHtml(newsletter.summary.substring(0, 100))}...</p>
                        <div class="item-meta">
                            <span class="badge">${newsletter.category}</span>
                            <span class="badge ${newsletter.isPublished ? 'badge-success' : 'badge-warning'}">
                                ${newsletter.isPublished ? 'Published' : 'Draft'}
                            </span>
                            <span><i class="fas fa-calendar"></i> ${formatDate(newsletter.publishedAt)}</span>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-sm btn-secondary" onclick="editNewsletter('${newsletter._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmDeleteNewsletter('${newsletter._id}', '${escapeHtml(newsletter.title)}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <p>No newsletters yet. Click "Add Newsletter" to create one.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading newsletters:', error);
        listContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load newsletters. Please check your connection.</p>
            </div>
        `;
    }
}

function showNewsletterForm(newsletter = null) {
    document.getElementById('newsletterFormContainer').style.display = 'block';
    document.getElementById('newsletterImageGroup').style.display = 'block';

    if (newsletter) {
        document.getElementById('newsletterId').value = newsletter._id || newsletter.id || '';
        document.getElementById('newsletterTitle').value = newsletter.title || '';
        document.getElementById('newsletterCategory').value = newsletter.category || '';
        document.getElementById('newsletterSummary').value = newsletter.summary || '';
        document.getElementById('newsletterImage').value = newsletter.imageUrl || '';
        document.getElementById('newsletterAuthor').value = newsletter.author || 'J KRISHNAN & CO';
        document.getElementById('newsletterPublished').checked = newsletter.isPublished !== false;

        // Show current image preview if editing
        if (newsletter.imageUrl) {
            document.getElementById('newsletterPreviewContainer').innerHTML = `<img src="${newsletter.imageUrl}" alt="Current Image">`;
        }
    } else {
        document.getElementById('newsletterForm').reset();
        document.getElementById('newsletterId').value = '';
        document.getElementById('newsletterPublished').checked = true;
        document.getElementById('newsletterAuthor').value = 'J KRISHNAN & CO';
        document.getElementById('newsletterPreviewContainer').innerHTML = '';
    }

    // Scroll to form
    document.getElementById('newsletterFormContainer').scrollIntoView({ behavior: 'smooth' });
}

function handleNewsletterImagePreview(e) {
    const file = e.target.files[0];
    const previewContainer = document.getElementById('newsletterPreviewContainer');

    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            previewContainer.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    } else {
        previewContainer.innerHTML = '';
    }
}

function hideNewsletterForm() {
    document.getElementById('newsletterFormContainer').style.display = 'none';
    document.getElementById('newsletterForm').reset();
}

async function editNewsletter(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/newsletters/${id}`);
        const data = await response.json();

        if (data.success) {
            showNewsletterForm(data.data);
        } else {
            showToast('Failed to load newsletter', 'error');
        }
    } catch (error) {
        console.error('Error loading newsletter:', error);
        showToast('Failed to load newsletter', 'error');
    }
}

async function handleNewsletterSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('newsletterId').value;
    const saveBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = saveBtn.innerHTML;

    // Show loading state
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        let response;

        if (id && id !== 'undefined') {
            // Update existing (FormData to support image upload)
            const fileInput = document.getElementById('newsletterFile');
            const formData = new FormData();

            if (fileInput.files[0]) {
                formData.append('image', fileInput.files[0]);
            }
            formData.append('title', document.getElementById('newsletterTitle').value);
            formData.append('category', document.getElementById('newsletterCategory').value);
            formData.append('summary', document.getElementById('newsletterSummary').value);
            formData.append('author', document.getElementById('newsletterAuthor').value);
            formData.append('isPublished', document.getElementById('newsletterPublished').checked);

            response = await fetch(`${API_BASE_URL}/newsletters/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData
            });
        } else {
            // Create new (FormData for optional file upload)
            const fileInput = document.getElementById('newsletterFile');

            const formData = new FormData();
            // Only append image if one was selected
            if (fileInput.files[0]) {
                formData.append('image', fileInput.files[0]);
            }
            formData.append('title', document.getElementById('newsletterTitle').value);
            formData.append('category', document.getElementById('newsletterCategory').value);
            formData.append('summary', document.getElementById('newsletterSummary').value);
            formData.append('author', document.getElementById('newsletterAuthor').value);
            formData.append('isPublished', document.getElementById('newsletterPublished').checked);

            response = await fetch(`${API_BASE_URL}/newsletters`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData
            });
        }

        const data = await response.json();

        if (data.success) {
            console.log('Newsletter saved successfully:', data.data);
            showToast('newsletter added successfully', 'success');
            hideNewsletterForm();
            loadNewsletters();
        } else {
            console.error('Newsletter save failed:', data);
            showToast(data.message || 'Failed to save newsletter', 'error');
        }
    } catch (error) {
        console.error('Error saving newsletter:', error);
        showToast('Failed to save newsletter', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalBtnText;
    }
}

function confirmDeleteNewsletter(id, title) {
    showConfirmDialog(
        'Delete Newsletter',
        `Are you sure you want to delete "${title}"? This action cannot be undone.`,
        () => deleteNewsletter(id)
    );
}

async function deleteNewsletter(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/newsletters/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showToast('Newsletter deleted!', 'success');
            loadNewsletters();
        } else {
            showToast(data.message || 'Failed to delete newsletter', 'error');
        }
    } catch (error) {
        console.error('Error deleting newsletter:', error);
        showToast('Failed to delete newsletter', 'error');
    }

    hideConfirmDialog();
}

// ========================
// GALLERY CRUD
// ========================
async function loadImages() {
    const gridContainer = document.getElementById('galleryList');
    gridContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading images...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/gallery?visible=all&limit=100`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            gridContainer.innerHTML = data.data.map(image => `
                <div class="gallery-item" data-id="${image._id}">
                    <div class="gallery-image">
                        <img src="${image.imageUrl}" alt="${escapeHtml(image.title)}" loading="lazy">
                    </div>
                    <div class="gallery-info">
                        <h4>${escapeHtml(image.title)}</h4>
                        <p>${escapeHtml(image.description || image.category)}</p>
                        <div class="gallery-actions">
                            <button class="btn btn-sm btn-secondary" onclick="editImage('${image._id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="confirmDeleteImage('${image._id}', '${escapeHtml(image.title)}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            gridContainer.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-images"></i>
                    <p>No images yet. Click "Upload Image" to add one.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading images:', error);
        gridContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load images. Please check your connection.</p>
            </div>
        `;
    }
}

function resetImageForm(showMsg = true) {
    document.getElementById('imageForm').reset();
    document.getElementById('imageId').value = '';
    document.getElementById('imageUrl').value = '';
    document.getElementById('imagePreviewContainer').innerHTML = '';
    document.getElementById('imageUploadGroup').style.display = 'block';
    document.getElementById('imageFile').value = '';
    if (showMsg) showToast('Form reset');
}

function showEditImageForm(image) {
    document.getElementById('imageUploadGroup').style.display = 'none';
    document.getElementById('imageId').value = image._id || image.id || '';
    document.getElementById('imageTitle').value = image.title || '';
    document.getElementById('imageCategory').value = image.category || 'Other';
    document.getElementById('imageDescription').value = image.description || '';
    document.getElementById('imageOrder').value = image.displayOrder || 0;
    document.getElementById('imageFormContainer').scrollIntoView({ behavior: 'smooth' });
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    const previewContainer = document.getElementById('imagePreviewContainer');

    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            previewContainer.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    } else {
        previewContainer.innerHTML = '';
    }
}

async function editImage(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/gallery/${id}`);
        const data = await response.json();

        if (data.success) {
            showEditImageForm(data.data);
        } else {
            showToast('Failed to load image', 'error');
        }
    } catch (error) {
        console.error('Error loading image:', error);
        showToast('Failed to load image', 'error');
    }
}

async function handleImageSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('imageId').value;
    const uploadBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = uploadBtn.innerHTML;

    // Show loading state
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    if (id && id !== 'undefined') {
        // Update existing image
        const imageData = {
            title: document.getElementById('imageTitle').value,
            category: document.getElementById('imageCategory').value,
            description: document.getElementById('imageDescription').value,
            displayOrder: parseInt(document.getElementById('imageOrder').value) || 0
        };

        try {
            const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(imageData)
            });

            const data = await response.json();

            if (data.success) {
                showToast('Image updated!', 'success');
                resetImageForm();
                loadImages();
            } else {
                showToast(data.message || 'Failed to update image', 'error');
            }
        } catch (error) {
            console.error('Error updating image:', error);
            showToast('Failed to update image', 'error');
        }
    } else {
        // Create new image
        const fileInput = document.getElementById('imageFile');
        const urlInput = document.getElementById('imageUrl');
        const title = document.getElementById('imageTitle').value;
        const category = document.getElementById('imageCategory').value;
        const description = document.getElementById('imageDescription').value;
        const displayOrder = document.getElementById('imageOrder').value;

        if (!fileInput.files[0] && !urlInput.value.trim()) {
            showToast('Please select a file or enter an image URL', 'error');
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = originalBtnText;
            return;
        }

        try {
            let response;
            if (fileInput.files[0]) {
                // File upload
                const formData = new FormData();
                formData.append('image', fileInput.files[0]);
                formData.append('title', title);
                formData.append('category', category);
                formData.append('description', description);
                formData.append('displayOrder', displayOrder);

                response = await fetch(`${API_BASE_URL}/gallery`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: formData
                });
            } else {
                // URL based upload
                const imageData = {
                    title,
                    category,
                    description,
                    imageUrl: urlInput.value.trim(),
                    displayOrder: parseInt(displayOrder) || 0
                };

                response = await fetch(`${API_BASE_URL}/gallery/url`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(imageData)
                });
            }

            const data = await response.json();

            if (data.success) {
                console.log('Gallery image added successfully:', data.data);
                showToast('image added successfully in galary', 'success');
                resetImageForm(false);
                loadImages();
            } else {
                console.error('Gallery addition failed:', data);
                showToast(data.message || 'Failed to add image', 'error');
            }
        } catch (error) {
            console.error('Error in handleImageSubmit (create):', error);
            showToast('Failed to add image. Check console for details.', 'error');
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = originalBtnText;
        }
    }
}

function confirmDeleteImage(id, title) {
    showConfirmDialog(
        'Delete Image',
        `Are you sure you want to delete "${title}"? This will also remove it from Cloudinary.`,
        () => deleteImage(id)
    );
}

async function deleteImage(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showToast('Image deleted!', 'success');
            loadImages();
        } else {
            showToast(data.message || 'Failed to delete image', 'error');
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        showToast('Failed to delete image', 'error');
    }

    hideConfirmDialog();
}

// ========================
// UI UTILITIES
// ========================
function showToast(message, type = 'default') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showConfirmDialog(title, message, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmDialog').classList.add('show');

    const confirmBtn = document.getElementById('confirmYes');
    confirmBtn.onclick = onConfirm;
}

function hideConfirmDialog() {
    document.getElementById('confirmDialog').classList.remove('show');
}

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
        month: 'short',
        day: 'numeric'
    });
}
