<div align="center">
  <h1>🚀 RepoPilot</h1>
  <p><strong>A sleek, centralized dashboard to explore GitHub repositories and track issues.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Project-RepoPilot-88b04b?style=flat" alt="Project" />
    <img src="https://img.shields.io/badge/Domain-Web_Development-3b82f6?style=flat" alt="Domain" />
    <img src="https://img.shields.io/badge/Tools-Next.js_%7C_Node.js_%7C_MongoDB-e36209?style=flat" alt="Tools" />
    <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=flat" alt="Status" />
  </p>
  
  <br />

  <p>
    <a href="https://repopilot-by-mausam.netlify.app">
      <img src="https://img.shields.io/badge/Live_Demo-Click_Here-FF4154?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
    </a>
    <a href="#%EF%B8%8F-4-key-features">
      <img src="https://img.shields.io/badge/Key_Features-Explore-007EC6?style=for-the-badge" alt="Key Features" />
    </a>
    <a href="#-5-tech-stack">
      <img src="https://img.shields.io/badge/Tech_Stack-View-9C27B0?style=for-the-badge" alt="Tech Stack" />
    </a>
  </p>
</div>

<br />

RepoPilot simplifies how you interact with GitHub. Instead of opening dozens of tabs to check repo stats or manage issues, you can do it all from one fast, responsive dashboard.

---

## 🧩 1. Project Title

**RepoPilot – GitHub Explorer & Issue Tracker**

---

## 💡 2. Problem Statement

Developers and project managers often face difficulties managing multiple GitHub repositories — navigating between pages to track issues, bookmarks, and project activities reduces productivity and increases oversight gaps.

**RepoPilot** bridges this gap by offering a centralized dashboard that enables users to:

- Search and explore repositories in real time
- Track and manage issues using CRUD operations
- Bookmark frequently used repositories
- View project summaries and activity overviews

---

## 🏗️ 3. System Architecture

**Flow:**  
`Frontend → Backend (API) → Database → GitHub API`

| Layer              | Description                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Frontend**       | Built with Next.js (React) for modern routing and fast rendering. Styled using TailwindCSS for a sleek, responsive UI. |
| **Backend**        | Developed with Node.js + Express, providing REST APIs for authentication, CRUD operations, and GitHub API integration. |
| **Database**       | Hosted on MongoDB Atlas, enabling secure and scalable data storage.                                                    |
| **Authentication** | JWT-based authentication for secure login and signup. GitHub OAuth optional.                                           |

---

## ⚙️ 4. Key Features

| Category                    | Features                                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 🧑‍💻 **Authentication**       | Login/Signup using JWT, secure password hashing, optional GitHub OAuth                                               |
| 🤖 **AI Copilot**           | Chat with an AI assistant that understands the entire repository context using Groq                                  |
| 🛡️ **Security Scans**       | AI-powered vulnerability scanning and dependency analysis                                                            |
| 🧠 **AI Code Reviews**      | Context-aware PR reviews that check GitHub CI status and merge conflicts before making highly deterministic verdicts |
| 📈 **Analytics Dashboard**  | Glassmorphic dashboard with Recharts plotting language distribution and 30-day commit velocity                       |
| ⚡ **Real-Time WebSockets** | Live Activity Feed powered by Socket.io and a custom GitHub event background poller                                  |
| 🚀 **CI/CD Deployments**    | Monitor native GitHub Actions workflows and scaffold production apps with One-Click Deployments to Vercel and Render |
| 📦 **Repository Explorer**  | Search, sort, filter, and paginate repositories in one place                                                         |
| 🐞 **Issue Tracker**        | Full CRUD operations with pagination                                                                                 |
| ⭐ **Bookmarks**            | Mark and organize favorite repositories for easy access                                                              |

---

## 🧠 5. Tech Stack

| Layer              | Technologies                                                    |
| ------------------ | --------------------------------------------------------------- |
| **Frontend**       | Next.js, React, Tailwind CSS, Axios, Recharts, Socket.io-client |
| **Backend**        | Node.js, Express.js, Socket.io                                  |
| **Database**       | MongoDB Atlas (Primary)                                         |
| **Authentication** | JWT (Primary), GitHub OAuth (Optional)                          |
| **AI Integration** | Groq API (LLaMA 3.3 70B) with Few-Shot Prompting                |
| **CI/CD**          | GitHub Actions Integration, Vercel/Render Magic Deploy URLs     |
| **Hosting**        | Netlify (Frontend), Render (Backend), MongoDB Atlas (Database)  |

---

## 🧾 6. API Overview

| Endpoint                                      | Method     | Description                                              | Access        |
| --------------------------------------------- | ---------- | -------------------------------------------------------- | ------------- |
| `/api/auth/login`                             | **POST**   | Login and generate JWT                                   | Public        |
| `/api/auth/signup`                            | **POST**   | Create new user with hashed password                     | Public        |
| `/api/user/repos?search=&sort=&filter=&page=` | **GET**    | Fetch repositories with search, sort, filter, pagination | Authenticated |
| `/api/repos/:id`                              | **GET**    | Get details of a specific repository                     | Authenticated |
| `/api/repos/:id/issues?page=&filter=`         | **GET**    | Fetch repository issues                                  | Authenticated |
| `/api/repos/:id/issues`                       | **POST**   | Create a new issue                                       | Authenticated |
| `/api/issues/:id`                             | **PATCH**  | Update/close an issue                                    | Authenticated |
| `/api/issues/:id`                             | **DELETE** | Delete an issue                                          | Authenticated |
| `/api/repos/:id/bookmarks`                    | **POST**   | Add repo to bookmarks                                    | Authenticated |
| `/api/bookmarks`                              | **GET**    | Retrieve all user bookmarks                              | Authenticated |
| `/api/repos/:id/bookmarks`                    | **DELETE** | Remove repo from bookmarks                               | Authenticated |

---

## 🌐 7. Deployment Details

| Layer                        | Platform      | URL                                                                                    |
| ---------------------------- | ------------- | -------------------------------------------------------------------------------------- |
| **Frontend (Next.js)**       | Netlify       | 🔗 [https://repopilot-by-mausam.netlify.app](https://repopilot-by-mausam.netlify.app/) |
| **Backend (Express API)**    | Render        | 🔗 [https://repopilot-backend.onrender.com](https://repopilot-backend.onrender.com/)   |
| **Database (MongoDB Atlas)** | MongoDB Cloud | 🔐 Production Cluster (private)                                                        |

---

## 🔐 8. Authentication Flow

1. **User Signup:**
   - Email and password sent to `/api/auth/signup`
   - Password is hashed using bcrypt
   - JWT generated upon success
2. **User Login:**
   - Validates credentials via `/api/auth/login`
   - JWT returned and stored in `localStorage`
   - Token used for all subsequent API requests
3. **Protected Routes:**
   - JWT verified using `Authorization` header
   - Expired or invalid tokens return `401 Unauthorized`

---

## 👨‍💻 9. Author

**Mausam Kumar Dwivedi**  
🖥️ Built with Next.js, Express, and MongoDB  
💙 Hosted with Netlify & Render

---

## ⭐ 10. Live Demo

Live Preview - [RepoPilot](https://repopilot-by-mausam.netlify.app/)
