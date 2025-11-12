# 🚀 RepoPilot – GitHub Explorer & Issue Tracker

> **A unified platform for developers and project managers to explore repositories, manage issues, and monitor GitHub activity — all in one place.**

---

## 🧩 1. Project Title
**RepoPilot – GitHub Explorer & Issue Tracker**

---

## 💡 2. Problem Statement
Developers and project managers often face difficulties managing multiple GitHub repositories — navigating between pages to track issues, bookmarks, and project activities reduces productivity and increases oversight gaps.

**RepoPilot** bridges this gap by offering a **centralized dashboard** that enables users to:
- Search and explore repositories in real time  
- Track and manage issues using CRUD operations  
- Bookmark frequently used repositories  
- View project summaries and activity overviews  

---

## 🏗️ 3. System Architecture

**Flow:**  
`Frontend → Backend (API) → Database → GitHub API`

| Layer | Description |
|--------|-------------|
| **Frontend** | Built with **Next.js (React)** for modern routing and fast rendering. Styled using **TailwindCSS** for a sleek, responsive UI. |
| **Backend** | Developed with **Node.js + Express**, providing REST APIs for authentication, CRUD operations, and GitHub API integration. |
| **Database** | Hosted on **MongoDB Atlas**, enabling secure and scalable data storage. |
| **Authentication** | **JWT-based authentication** for secure login and signup. GitHub OAuth optional. |

---

## ⚙️ 4. Key Features

| Category | Features |
|-----------|-----------|
| 🧑‍💻 **Authentication** | Login/Signup using JWT, secure password hashing, optional GitHub OAuth |
| 📦 **Repository Explorer** | Search, sort, filter, and paginate repositories in one place |
| 🐞 **Issue Tracker** | Full CRUD (Create, Read, Update, Delete) operations with pagination |
| 📊 **Dashboard** | View recent project activity, open issues, and quick stats |
| ⭐ **Bookmarks** | Mark and organize favorite repositories for easy access |
| 🧭 **Pages** | Home, Login, Dashboard, Repositories, Repository Details, Issues, Bookmarks |

---

## 🧠 5. Tech Stack

| Layer | Technologies |
|--------|--------------|
| **Frontend** | Next.js, React, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Primary) |
| **Authentication** | JWT (Primary), GitHub OAuth (Optional) |
| **Hosting** | Netlify (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## 🧾 6. API Overview

| Endpoint | Method | Description | Access |
|-----------|--------|-------------|---------|
| `/api/auth/login` | **POST** | Login and generate JWT | Public |
| `/api/auth/signup` | **POST** | Create new user with hashed password | Public |
| `/api/user/repos?search=&sort=&filter=&page=` | **GET** | Fetch repositories with search, sort, filter, pagination | Authenticated |
| `/api/repos/:id` | **GET** | Get details of a specific repository | Authenticated |
| `/api/repos/:id/issues?page=&filter=` | **GET** | Fetch repository issues | Authenticated |
| `/api/repos/:id/issues` | **POST** | Create a new issue | Authenticated |
| `/api/issues/:id` | **PATCH** | Update/close an issue | Authenticated |
| `/api/issues/:id` | **DELETE** | Delete an issue | Authenticated |
| `/api/repos/:id/bookmarks` | **POST** | Add repo to bookmarks | Authenticated |
| `/api/bookmarks` | **GET** | Retrieve all user bookmarks | Authenticated |
| `/api/repos/:id/bookmarks` | **DELETE** | Remove repo from bookmarks | Authenticated |

---

## 🌐 7. Deployment Details

| Layer | Platform | URL |
|--------|-----------|-----|
| **Frontend (Next.js)** | Netlify | 🔗 [https://repopilot-by-mausam.netlify.app](https://repopilot-by-mausam.netlify.app) |
| **Backend (Express API)** | Render | 🔗 [https://repopilot-backend.onrender.com](https://repopilot-backend.onrender.com) |
| **Database (MongoDB Atlas)** | MongoDB Cloud | 🔐 Production Cluster (private) |

---

## 🔐 8. Authentication Flow

1. **User Signup:**  
   - Email and password sent to `/api/auth/signup`
   - Password is hashed using **bcrypt**
   - JWT generated upon success  

2. **User Login:**  
   - Validates credentials via `/api/auth/login`
   - JWT returned and stored in `localStorage`  
   - Token used for all subsequent API requests  

3. **Protected Routes:**  
   - JWT verified using `Authorization` header  
   - Expired or invalid tokens return `401 Unauthorized`

---

## 📊 9. Folder Structure (Simplified)

RepoPilot/
├── frontend/ # Next.js (client)
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Next.js pages (Home, Auth, Dashboard, etc.)
│ │ ├── lib/axios.js # Axios API instance
│ │ └── styles/ # Global Tailwind styles
│ └── package.json
│
├── backend/ # Express.js (API)
│ ├── src/
│ │ ├── routes/ # API route definitions
│ │ ├── controllers/ # Logic for each route
│ │ ├── config/ # DB and environment config
│ │ └── server.js # Entry point
│ └── package.json
│
└── README.md

---

##  👨‍💻 12. Made By

**Mausam Kumar Dwivedi**  
🖥️ Built with **Next.js**, **Express**, and **MongoDB**  
💙 Hosted with **Netlify** & **Render**

---

## ⭐ 13. Live Demo

🔗 [https://repopilot-by-mausam.netlify.app](https://repopilot-by-mausam.netlify.app)