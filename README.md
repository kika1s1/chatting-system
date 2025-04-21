# Friends Chat App

A modern, real‑time one‑to‑one chat application built with Node.js, Express, MongoDB, Socket.IO and React.

## Features

- 📩 Real‑time messaging  
- ✏️ Send, edit & delete messages  
- 👀 Read/seen receipts  
- ⌨️ Typing indicators  
- 🔐 JWT‑based authentication & Google OAuth  
- 🌄 Profile management with avatar upload (Cloudinary)  
- 🎨 Responsive UI with Tailwind CSS & DaisyUI  
- ⚙️ Light / Dark theme switcher  

## Tech Stack

- **Server:** Node.js, Express, Mongoose (MongoDB), Socket.IO  
- **Client:** React, Vite, Zustand, Tailwind CSS, DaisyUI, Socket.IO‑client  
- **Auth:** JWT (HTTP‑only cookies), Firebase Google OAuth  
- **Storage:** Cloudinary for images  

## Repository Structure

```
/  
├─ server/  
│  ├─ src/  
│  │  ├─ controllers/     # REST & real‑time handlers  
│  │  ├─ models/          # Mongoose schemas  
│  │  ├─ routes/          # Express routers  
│  │  ├─ middleware/      # Authentication & error handling  
│  │  ├─ lib/             # Socket setup, Cloudinary, AppError, utilities  
│  │  └─ config/          # Database & environment configuration  
│  └─ index.js            # Server entry point + static file serving  
└─ client/  
   ├─ src/  
   │  ├─ components/      # UI: ChatContainer, MessageInput, Sidebar…  
   │  ├─ pages/           # Views: Login, Signup, Profile, Settings  
   │  ├─ store/           # Zustand stores (auth & chat)  
   │  ├─ lib/             # Axios instance, helper functions  
   │  └─ main.jsx         # React application entry  
   ├─ tailwind.config.js  
   └─ vite.config.js  
```

## Getting Started

### Prerequisites

- Node.js 18+  
- MongoDB (local or Atlas)  
- Cloudinary account  
- Firebase project for Google OAuth  

### Environment Variables

At the project root, create a `.env` file:

```bash
# Server
PORT=3000
MONGO_URI=mongodb://localhost:27017/chatting-system
JWT_SECRET=<your_jwt_secret>
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

In `client/.env`:

```bash
VITE_API_URL=http://localhost:3000/api/v1
VITE_FIREBASE_API_KEY=<your_firebase_api_key>
```

### Installation & Run

```bash
# Install dependencies
npm install
cd client
npm install
cd ..

# Start server (runs on PORT)
npm run server

# Start client (Vite dev server)
npm run client

# Or run both concurrently
npm run dev
```

Open your browser at `http://localhost:5173`.

For production build:

```bash
npm run build      # Builds client
npm start          # Serves API and static client files
```

## API Reference

Base URL: `/api/v1`

### Authentication

- `POST /auth/register`  — Register a new user  
- `POST /auth/login`     — Log in  
- `POST /auth/google`    — Google OAuth  
- `POST /auth/logout`    — Log out  
- `GET  /auth/me`        — Get current user profile  

### Users

- `GET /users`           — List all users (excluding yourself)  

### Messages

- `GET    /messages/:id`        — Get conversation with user `:id`  
- `POST   /messages/send/:id`   — Send a message to `:id`  
- `PUT    /messages/:messageId`  — Edit a message  
- `DELETE /messages/:messageId`  — Delete a message  
- `PATCH  /messages/seen/:senderId` — Mark messages as seen  

## Socket.IO Events

- Client → Server:  
  - `typing`, `stopTyping`  
- Server → Client:  
  - `newMessage`, `messageDeleted`, `messageUpdated`, `messagesSeen`  
  - `typing`, `stopTyping`  

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork this repository.  
2. Create a feature branch:
   ```bash
   git checkout -b feat/<feature-name>
   ```
3. Install dependencies and run the application locally.  
4. Run linting and tests:
   ```bash
   npm run lint
   npm run test
   ```
5. Commit your changes and push to your fork.  
6. Open a Pull Request describing your changes.  

---

MIT © 2025 Kika