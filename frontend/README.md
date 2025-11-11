# 🚀 RepoPilot – GitHub Explorer & Issue Tracker

## 🧩 1. Project Title
**RepoPilot – GitHub Explorer & Issue Tracker**

---

## 💡 2. Problem Statement
Developers and project managers struggle to manage multiple GitHub repositories, track issues, and monitor updates in one place.  
Navigating between pages reduces productivity and increases oversight gaps.

**RepoPilot** solves this by providing a **unified dashboard** to search repositories, track issues, bookmark repos, and manage project activity with **real-time data**, **CRUD operations**, and **API-based workflows**.

---

## 🏗️ 3. System Architecture
**Architecture Flow:**  
`Frontend → Backend (API) → Database → GitHub API`

### **Frontend**
- Built with **Next.js (React)** for modern routing and dynamic UI.  
- Uses **Axios** for API calls and **TailwindCSS** for styling.

### **Backend**
- **Node.js + Express** REST API for authentication, CRUD operations, and GitHub API integration.

### **Database**
- **MongoDB Atlas (Non-relational)**  

### **Authentication**
- **JWT-based login/signup (Primary)**  

### **Hosting**
| Layer | Service |
|-------|----------|
| Frontend | Netlify |
| Backend | Railway |
| Database | MongoDB Atlas |

---

## ⚙️ 4. Key Features

| Category | Features |
|-----------|-----------|
| **Authentication** | Login/Logout with JWT, optional GitHub OAuth, role-based access |
| **Repository Explorer** | List repositories with search, sort, filter, and pagination |
| **Issue Tracker** | CRUD (View, Create, Update, Delete) issues with filter & pagination |
| **Dashboard** | Overview of open issues and recent activity |
| **Bookmarks** | Mark repositories as favourites for quick access |
| **Pages** | Home, Login, Dashboard, Repositories, Repository Details, Issues, Bookmarks |

---

## 🧠 5. Tech Stack

| Layer | Technologies |
|--------|--------------|
| **Frontend** | Next.js, React, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Primary) / PostgreSQL / MySQL |
| **Authentication** | JWT (Primary) / OAuth |
| **Hosting** | Netlify (Frontend), Railway (Backend), MongoDB Atlas (DB) |

---

## 🧾 6. API Overview

| Endpoint | Method | Description | Access |
|-----------|--------|-------------|---------|
| `/api/auth/login` | **POST** | Authenticate using JWT | Public |
| `/api/auth/github` | **POST** | Optional GitHub OAuth login | Public |
| `/api/user/repos?search=&sort=&filter=&page=` | **GET** | Retrieve GitHub repositories with search, sort, filter, pagination | Authenticated |
| `/api/repos/:id` | **GET** | Repository details | Authenticated |
| `/api/repos/:id/issues?page=&filter=` | **GET** | List issues with filter + pagination | Authenticated |
| `/api/repos/:id/issues` | **POST** | Create a new issue | Authenticated |
| `/api/issues/:id` | **PATCH** | Update/close issue | Authenticated |
| `/api/issues/:id` | **DELETE** | Delete issue | Authenticated |
| `/api/repos/:id/bookmarks` | **POST** | Add selected repo to bookmarks | Authenticated |
| `/api/bookmarks` | **GET** | Fetch user bookmarks | Authenticated |
| `/api/repos/:id/bookmarks` | **DELETE** | Remove selected repo bookmark | Authenticated |

---

## 🌐 7. Deployment

| Layer | Platform | URL |
|--------|-----------|-----|
| **Frontend** | Netlify | *(add your deployed URL here)* |
| **Backend** | Railway | *(add your deployed URL here)* |
| **Database** | MongoDB Atlas | *(production cluster connection)* |

---

## 👨‍💻 Author
**Mausam Kumar Dwivedi**  
Built with ❤️ using **Next.js**, **Express**, and **MongoDB**.
