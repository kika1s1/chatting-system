# Friends Chat App

A modern, real‑time one‑to‑one chat application with full CRUD on messages, typing indicators, read receipts, user profiles, theming—and secure authentication.

---

## 🚀 Features

- **Real‑time Chat**  
  – One‑to‑one messaging via Socket.IO  
  – Typing indicators (`typing`/`stopTyping` events)  
  – Read/seen receipts  

- **Message Management**  
  – Send text & image messages  
  – Edit & delete your own messages  
  – “Edited” badge when a message is updated  
  – Auto‑scroll to newest message  

- **User Management**  
  – JWT‑based signup/login & Google OAuth (Firebase)  
  – HTTP‑only cookie storage of tokens  
  – Profile page: update avatar (Cloudinary)  
  – “Forget password” & secure reset flow (email + token)  

- **Contacts Sidebar**  
  – List all users (`GET /api/v1/users`)  
  – Online/offline status via Socket.IO presence  
  – “Show online only” toggle  

- **UI & Theming**  
  – Responsive React + Vite SPA  
  – Tailwind CSS + DaisyUI components  
  – Light/dark & 30+ DaisyUI themes via Zustand store  

- **Robust Backend**  
  – Node.js + Express 5 + Mongoose (MongoDB)  
  – Modular controllers & middleware (auth, error‑handler)  
  – REST API for messages & users  
  – Socket.IO server for real‑time events  
  – Cloudinary integration for image uploads  

---

## 🛠 Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Server     | Node.js, Express, Mongoose (MongoDB), Socket.IO |
| Client     | React, Vite, Zustand, Tailwind CSS, DaisyUI, Socket.IO‑client |
| Auth       | JWT (httpOnly cookies), Firebase Google OAuth |
| Storage    | Cloudinary for images                        |
| Email      | Nodemailer (Gmail SMTP)                      |
| Testing & Linting | ESLint, Prettier, React Testing Library (optional) |

---

## 📁 Repository Structure

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
- Gmail account (for password‑reset emails)

### Environment Variables

Create a `.env` in project root:

```bash
# Server
PORT=5000
MONGO_URI=<mongo‑connection‑string>
JWT_SECRET=<your_jwt_secret>
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>

EMAIL_USER=<gmail_address>
EMAIL_PASS=<gmail_app_password>
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