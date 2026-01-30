# Backend for J KRISHNAN & CO Website

This is the Node.js backend for managing newsletters and gallery images for the J KRISHNAN & CO website.

## 📋 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```
MONGODB_URI=mongodb://localhost:27017/jkrishnan
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### 3. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`
Admin Panel: `http://localhost:5000/admin`

---

## 📦 Installed Packages

| Package | Purpose |
|---------|---------|
| `express` | Web framework for Node.js |
| `mongoose` | MongoDB object modeling (ODM) |
| `dotenv` | Load environment variables from .env file |
| `cors` | Enable Cross-Origin Resource Sharing |
| `multer` | Handle file uploads |
| `cloudinary` | Cloud image storage service |
| `multer-storage-cloudinary` | Multer storage engine for Cloudinary |
| `bcryptjs` | Password hashing (for future use) |
| `nodemon` | Auto-restart server during development |

---

## 📁 Folder Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── cloudinary.js      # Cloudinary + Multer config
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── galleryController.js   # Gallery CRUD operations
│   └── newsletterController.js # Newsletter CRUD operations
├── models/
│   ├── Gallery.js         # Gallery schema
│   └── Newsletter.js      # Newsletter schema
├── public/
│   └── admin/
│       ├── index.html     # Admin panel HTML
│       ├── admin.css      # Admin panel styles
│       └── admin.js       # Admin panel JavaScript
├── routes/
│   ├── authRoutes.js      # Auth API routes
│   ├── galleryRoutes.js   # Gallery API routes
│   └── newsletterRoutes.js # Newsletter API routes
├── .env.example           # Environment template
├── package.json           # Dependencies
├── README.md              # This file
└── server.js              # Main entry point
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/auth/verify` | Verify token |
| POST | `/api/auth/logout` | Logout |

### Newsletters
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/newsletters` | Get all newsletters |
| GET | `/api/newsletters/:id` | Get single newsletter |
| POST | `/api/newsletters` | Create newsletter |
| PUT | `/api/newsletters/:id` | Update newsletter |
| DELETE | `/api/newsletters/:id` | Delete newsletter |
| GET | `/api/newsletters/categories` | Get categories |

### Gallery
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gallery` | Get all images |
| GET | `/api/gallery/:id` | Get single image |
| POST | `/api/gallery` | Upload image (multipart) |
| PUT | `/api/gallery/:id` | Update image details |
| DELETE | `/api/gallery/:id` | Delete image |
| GET | `/api/gallery/categories` | Get categories |

---

## 🖥️ Integration with Frontend

### Newsletter Page
Add this to your `newsletter.html`:
```html
<script src="js/newsletter-api.js"></script>
```

### Gallery Page
Add this to your `gallery.html`:
```html
<script src="js/gallery-api.js"></script>
```

**Important:** Update the `API_URL` in both files to match your backend URL when deploying.

---

## ☁️ Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard to find your credentials
3. Copy Cloud Name, API Key, and API Secret to `.env`

---

## 🗄️ MongoDB Setup

### Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/jkrishnan`

### MongoDB Atlas (Cloud)
1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string and add to `.env`

---

## 👤 Default Admin Credentials

- **Username:** admin
- **Password:** admin123

⚠️ **Change these in production!** Update `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`

---

## 🚀 Deployment

1. Set `NODE_ENV=production` in environment
2. Use a process manager like PM2
3. Setup reverse proxy with Nginx
4. Enable HTTPS

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name "jkrishnan-backend"
```
