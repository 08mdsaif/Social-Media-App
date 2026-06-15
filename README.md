# 📱 Social Media Post App

A full-stack social media application built with the **MERN stack** (MongoDB, Express.js, React, Node.js) that allows users to register, log in, create posts with text and images, and interact through likes and comments on a public feed.

---

## 🚀 Features

- **User Authentication** — Secure signup and login with JWT-based authentication (tokens valid for 7 days). Passwords are hashed using bcryptjs before storage.
- **Public Feed** — A cursor-based paginated feed that displays posts in reverse chronological order (newest first). Accessible to everyone without login.
- **Create Posts** — Authenticated users can create posts with text (up to 2,000 characters), an image upload, or both.
- **Image Uploads** — Supports JPEG, PNG, GIF, and WebP image formats with a maximum file size of 5MB. Handled via Multer.
- **Like / Unlike** — Toggle likes on any post. The app tracks which users have liked each post.
- **Comments** — Add comments (up to 500 characters) on any post. Comments are stored as embedded sub-documents within each post.
- **Delete Posts** — Authors can delete their own posts (authorization enforced server-side).
- **Persistent Sessions** — Auth tokens and user data are stored in localStorage, so users stay logged in across browser sessions.
- **Protected Routes** — Frontend route guards prevent unauthenticated users from accessing restricted pages.
- **Database Seeder** — A seed script to populate the database with sample Indian users, posts, likes, and comments for testing.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** — UI library
- **Vite 8** — Build tool and dev server
- **Material UI (MUI) v9** — Component library and theming
- **React Router v7** — Client-side routing
- **Axios** — HTTP client for API requests
- **Emotion** — CSS-in-JS styling (used by MUI)

### Backend
- **Node.js** — Runtime environment
- **Express.js v5** — Web framework
- **MongoDB** — NoSQL database
- **Mongoose v9** — MongoDB ODM (Object Data Modeling)
- **JSON Web Token (JWT)** — Authentication tokens
- **bcryptjs** — Password hashing
- **Multer** — File upload handling
- **CORS** — Cross-origin resource sharing
- **dotenv** — Environment variable management

### Deployment
- **Vercel** — Serverless deployment (configured via `vercel.json`)

---

## 📁 Project Structure

```
post-app/
│
├── backend/
│   ├── api/
│   │   └── index.js              # Express app entry point (Vercel serverless)
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── models/
│   │   ├── User.js               # User schema (username, email, password, avatar)
│   │   └── Post.js               # Post schema (text, image, likes, comments)
│   ├── routes/
│   │   ├── auth.js               # Authentication routes (signup, login, profile)
│   │   └── posts.js              # Post CRUD, like, and comment routes
│   ├── uploads/                  # Directory for uploaded images
│   ├── .env                      # Environment variables (not committed to git)
│   ├── .gitignore                # Git ignore rules
│   ├── package.json              # Backend dependencies and scripts
│   ├── seed.js                   # Database seeder script
│   └── server.js                 # Local development server (listens on PORT)
│
├── frontend/
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # Axios instance with base URL and auth headers
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Top navigation bar with auth actions
│   │   │   ├── PostCard.jsx      # Individual post display (text, image, likes, comments)
│   │   │   ├── CreatePost.jsx    # Post creation form with image upload
│   │   │   ├── CommentSection.jsx# Comment list and input for adding comments
│   │   │   └── ProtectedRoute.jsx# Route guard for authenticated-only pages
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state (user, token, login, signup, logout)
│   │   ├── pages/
│   │   │   ├── FeedPage.jsx      # Main feed page with post list and create post
│   │   │   ├── LoginPage.jsx     # User login form
│   │   │   └── SignupPage.jsx    # User registration form
│   │   ├── App.jsx               # Root component with Router and ThemeProvider
│   │   ├── main.jsx              # React DOM entry point
│   │   ├── index.css             # Global CSS styles
│   │   └── theme.js              # Custom MUI theme configuration
│   ├── index.html                # HTML template
│   ├── vite.config.js            # Vite configuration
│   ├── eslint.config.js          # ESLint configuration
│   └── package.json              # Frontend dependencies and scripts
│
├── vercel.json                   # Vercel deployment configuration
├── .gitignore                    # Root git ignore rules
└── README.md                     # This file
```

---

## ⚙️ Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas account** or a local MongoDB instance — [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Git** — [Download](https://git-scm.com/)

---

## 🏁 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/08mdsaif/Social-Media-App.git
cd Social-Media-App
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

> **Note:** Replace `your_mongodb_connection_string` with your actual MongoDB Atlas connection URI and `your_secret_key_here` with a strong, random secret string for signing JWT tokens.

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

### 4. Seed the Database (Optional)

To populate the database with sample users, posts, likes, and comments:

```bash
cd ../backend
node seed.js
```

This creates 8 sample users (all with password `password123`) along with 15 posts, random likes, and comments with Indian-themed content.

### 5. Run the Application

Open two terminal windows:

**Terminal 1 — Start the Backend:**
```bash
cd backend
npm start
```
The backend server will start at `http://localhost:5000`.

**Terminal 2 — Start the Frontend:**
```bash
cd frontend
npm run dev
```
The frontend dev server will start at `http://localhost:5173` (default Vite port).

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint          | Access  | Description                  |
|--------|-------------------|---------|------------------------------|
| POST   | `/api/auth/signup` | Public  | Register a new user          |
| POST   | `/api/auth/login`  | Public  | Login and receive JWT token  |
| GET    | `/api/auth/me`     | Private | Get current user's profile   |

### Posts

| Method | Endpoint                   | Access  | Description                     |
|--------|----------------------------|---------|---------------------------------|
| GET    | `/api/posts`               | Public  | Get paginated feed of posts     |
| POST   | `/api/posts`               | Private | Create a new post (text/image)  |
| PUT    | `/api/posts/:id/like`      | Private | Toggle like on a post           |
| POST   | `/api/posts/:id/comment`   | Private | Add a comment to a post         |
| DELETE | `/api/posts/:id`           | Private | Delete your own post            |

### Health Check

| Method | Endpoint       | Access | Description             |
|--------|----------------|--------|-------------------------|
| GET    | `/api/health`  | Public | Server health check     |

### Query Parameters (GET /api/posts)

- `limit` — Number of posts to return per page (default: 10)
- `before` — ISO timestamp cursor for pagination (returns posts created before this time)

### Authentication Header

For all **Private** endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📦 Data Models

### User

| Field      | Type     | Constraints                              |
|------------|----------|------------------------------------------|
| username   | String   | Required, unique, 3–30 characters        |
| email      | String   | Required, unique, valid email format     |
| password   | String   | Required, min 6 characters, hashed       |
| avatar     | String   | Optional, default empty                  |
| createdAt  | Date     | Auto-generated                           |
| updatedAt  | Date     | Auto-generated                           |

### Post

| Field      | Type           | Constraints                             |
|------------|----------------|-----------------------------------------|
| author     | ObjectId (ref) | Required, references User               |
| text       | String         | Max 2,000 characters, trimmed           |
| image      | String         | File path to uploaded image             |
| likes      | Array          | Embedded like sub-documents             |
| comments   | Array          | Embedded comment sub-documents          |
| createdAt  | Date           | Auto-generated, indexed for pagination  |
| updatedAt  | Date           | Auto-generated                          |

> **Validation:** Every post must have at least text or an image (enforced via pre-validate hook).

### Like (embedded in Post)

| Field    | Type           | Description          |
|----------|----------------|----------------------|
| user     | ObjectId (ref) | User who liked       |
| username | String         | Username of the liker|

### Comment (embedded in Post)

| Field     | Type           | Description                  |
|-----------|----------------|------------------------------|
| user      | ObjectId (ref) | User who commented           |
| username  | String         | Username of the commenter    |
| text      | String         | Comment text, max 500 chars  |
| createdAt | Date           | Auto-generated               |

---

## 🔐 Authentication Flow

1. **Signup:** User submits username, email, and password → password is hashed via bcryptjs pre-save hook → user document is created → JWT token is generated and returned.
2. **Login:** User submits email and password → server finds user by email → compares password hash → returns JWT token on success.
3. **Session Persistence:** Token and user data are saved to `localStorage` on the client. On app load, the `AuthContext` calls `/api/auth/me` to verify the stored token and load user data.
4. **Protected Requests:** The auth middleware extracts the JWT from the `Authorization: Bearer <token>` header, verifies it, looks up the user, and attaches `req.user` to the request.

---

## 🌐 Deployment (Vercel)

The project is configured for deployment on Vercel using `vercel.json`:

- **Frontend** is served from the `frontend/` directory using Vite at the root path (`/`).
- **Backend** is deployed as a serverless function from `backend/api/index.js`.

To deploy:

1. Push the project to GitHub.
2. Import the repository on [Vercel](https://vercel.com/).
3. Add the environment variables (`MONGODB_URI`, `JWT_SECRET`) in the Vercel project settings.
4. Deploy.

---

## 🧪 Sample Seed Data

Running `node seed.js` creates the following test data:

- **8 Users** — Indian-themed usernames (e.g., `aarav_sharma`, `priya_patel`, `rohan_gupta`)
- **15 Posts** — Indian-context content (festivals, food, travel, cricket, startups)
- **Random Likes** — Each post gets 2–7 random likes from different users
- **Random Comments** — Each post gets 1–4 random comments

All seeded users share the password: `password123`

---

## 📄 License

ISC

---

## 👤 Author

**MD Saif** — [GitHub](https://github.com/08mdsaif)
