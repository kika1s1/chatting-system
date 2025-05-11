# Friends

**A modern, real‑time, one‑to‑one chat application featuring robust message management, secure authentication, user profiles, dynamic theming, and integrated video calling.**

This project delivers a comprehensive chat solution, enabling users to connect and communicate seamlessly with features like typing indicators, read receipts, image sharing, and video calls, all built upon a scalable and secure backend.

---

## 🌟 Key Features

-   **Real‑time Chat Engine:**
    -   Instant one‑to‑one messaging powered by Socket.IO.
    -   Live typing indicators and message read/seen receipts for an engaging user experience.
    -   Integrated video call functionality for face-to-face communication.
-   **Comprehensive Message Management:**
    -   Send text and image messages effortlessly.
    -   Full CRUD (Create, Read, Update, Delete) capabilities for messages.
    -   Automatic scrolling to the latest message ensures users never miss an update.
-   **Secure User Authentication & Management:**
    -   Robust JWT-based authentication (signup/login) with httpOnly cookies.
    -   Seamless Google OAuth integration via Firebase.
    -   User profile page with avatar update functionality (integrated with Cloudinary).
    -   Secure "Forgot Password" and reset flow using email verification (Nodemailer + Gmail SMTP).
-   **Interactive Contacts & Presence:**
    -   Sidebar listing all registered users (via `GET /api/v1/users`).
    -   Real-time online/offline status indicators using Socket.IO presence.
    -   Option to filter and display only online users.
-   **Dynamic UI & Theming:**
    -   Fully responsive Single Page Application (SPA) built with React and Vite.
    -   Modern UI styled with Tailwind CSS and DaisyUI components.
    -   Customizable user experience with light/dark modes and over 30 DaisyUI themes, managed via Zustand.
-   **Robust & Scalable Backend:**
    -   Powered by Node.js, Express 5, and Mongoose (MongoDB).
    -   Modular architecture with dedicated controllers and middleware (authentication, error handling).
    -   Comprehensive REST API for user and message operations.
    -   Dedicated Socket.IO server for handling all real-time events.
    -   Cloudinary integration for efficient image uploads and management.

---

## 🛠 Tech Stack

| Category          | Technologies                                                                 |
| :---------------- | :--------------------------------------------------------------------------- |
| **Backend**       | Node.js, Express.js, Mongoose (MongoDB), Socket.IO                           |
| **Frontend**      | React, Vite, Zustand, Tailwind CSS, DaisyUI, Socket.IO Client                |
| **Authentication**| JWT (httpOnly cookies), Firebase (Google OAuth)                              |
| **Cloud Storage** | Cloudinary (for image uploads)                                               |
| **Email Services**| Nodemailer (with Gmail SMTP for password resets)                             |
| **Dev Tools**     | ESLint, Prettier, React Testing Library (optional integration)               |

---

## 📁 Project Structure

```
/
├─ server/
│  ├─ src/
│  │  ├─ controllers/     # Handles REST API requests & real‑time Socket.IO events
│  │  ├─ models/          # Defines Mongoose schemas for database structure
│  │  ├─ routes/          # Configures Express.js routers for API endpoints
│  │  ├─ middleware/      # Custom middleware for authentication, error handling, etc.
│  │  ├─ lib/             # Utility functions, Socket.IO setup, Cloudinary config, AppError class
│  │  └─ config/          # Database connection and environment variable configuration
│  └─ index.js            # Server entry point, Express app initialization, static file serving
└─ client/
   ├─ src/
   │  ├─ components/      # Reusable UI components (e.g., ChatContainer, MessageInput, Sidebar)
   │  ├─ pages/           # Top-level view components (e.g., Login, Signup, Profile, Settings)
   │  ├─ store/           # Zustand global state management (for auth, chat state, themes)
   │  ├─ lib/             # Helper functions, Axios instance for API calls
   │  └─ main.jsx         # React application entry point
   ├─ tailwind.config.js  # Tailwind CSS configuration
   └─ vite.config.js      # Vite build tool configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed and configured:

-   Node.js (version 18 or higher)
-   MongoDB (a local instance or a cloud-hosted solution like MongoDB Atlas)
-   A Cloudinary account (for image storage)
-   A Firebase project (for Google OAuth integration)
-   A Gmail account (for sending password-reset emails via Nodemailer)

### Environment Configuration

1.  **Backend Setup:**
    Create a `.env` file in the project's root directory (`/`) with the following variables:

    ```bash
    # Server Configuration
    PORT=5000
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_strong_jwt_secret_key>
    CLIENT_URL=http://localhost:5173

    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
    CLOUDINARY_API_KEY=<your_cloudinary_api_key>
    CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>

    # Email Configuration (for password reset)
    EMAIL_USER=<your_gmail_address>
    EMAIL_PASS=<your_gmail_app_password> # Use a Gmail App Password
    ```

2.  **Frontend Setup:**
    Create a `.env` file in the `client/` directory (`client/.env`) with the following variables:

    ```bash
    VITE_API_URL=http://localhost:5000/api/v1 # Adjusted to typical server port
    VITE_FIREBASE_API_KEY=<your_firebase_project_api_key>
    ```
    *Note: Ensure `VITE_API_URL` correctly points to your backend server's address and port.*

### Installation & Running the Application

1.  **Install Dependencies:**
    ```bash
    # Install server dependencies
    npm install

    # Navigate to client directory and install client dependencies
    cd client
    npm install
    cd ..
    ```

2.  **Run Development Servers:**
    ```bash
    # Start the backend server (typically on PORT specified in .env)
    npm run server

    # Start the frontend Vite development server (typically on http://localhost:5173)
    npm run client
    ```

3.  **Run Both Concurrently:**
    For convenience, you can start both server and client with a single command:
    ```bash
    npm run dev
    ```

4.  **Access the Application:**
    Open your web browser and navigate to `http://localhost:5173` (or your `CLIENT_URL`).

### Production Build

To create a production-ready build of the client and run the server:

```bash
# Build the client application
npm run build

# Start the server, which will also serve the static client files
npm start
```

---

## 📖 API Reference

All API endpoints are prefixed with `/api/v1`.

### Authentication (`/auth`)

-   `POST /register`: Register a new user.
-   `POST /login`: Log in an existing user.
-   `POST /google`: Authenticate using Google OAuth.
-   `POST /logout`: Log out the current user.
-   `GET  /me`: Retrieve the profile of the currently authenticated user.

### Users (`/users`)

-   `GET /`: Fetch a list of all users (excluding the currently authenticated user).

### Messages (`/messages`)

-   `GET    /:id`: Retrieve the message history for a conversation with user `:id`.
-   `POST   /send/:id`: Send a new message to user `:id`.
-   `PUT    /:messageId`: Edit an existing message by its ID.
-   `DELETE /:messageId`: Delete a message by its ID.
-   `PATCH  /seen/:senderId`: Mark messages from `:senderId` as seen by the current user.

---

## 📡 Socket.IO Events

Real-time communication is handled via Socket.IO events:

### Client Emits → Server Listens

-   `typing`: Notifies the server that the user has started typing to a recipient.
-   `stopTyping`: Notifies the server that the user has stopped typing.

### Server Emits → Client Listens

-   `newMessage`: Broadcasts a newly sent message to relevant clients.
-   `messageDeleted`: Notifies clients that a message has been deleted.
-   `messageUpdated`: Notifies clients that a message has been edited.
-   `messagesSeen`: Informs a client that their sent messages have been seen by the recipient.
-   `typing`: Relays typing status to the recipient.
-   `stopTyping`: Relays stopped typing status to the recipient.
-   `getOnlineUsers`: Provides a list of currently online users.

---

## 👥 Contributing

Contributions are highly welcome and appreciated! To contribute:

1.  **Fork the Repository:** Create your own copy of this project.
2.  **Create a Feature Branch:**
    ```bash
    git checkout -b feat/your-amazing-feature
    ```
3.  **Develop:** Make your changes, ensuring you install dependencies and can run the application locally.
4.  **Lint and Test:**
    ```bash
    npm run lint
    # npm run test (if tests are configured)
    ```
5.  **Commit and Push:** Commit your changes with clear messages and push them to your forked repository.
6.  **Open a Pull Request:** Submit a PR against the main repository, detailing the changes you've made.

---

MIT © 2025 Kika