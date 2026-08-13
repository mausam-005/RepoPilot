# 🛡️ Security Policy

## Supported Versions

Currently, the following versions of **RepoPilot** are receiving security updates:

| Version | Supported          | Description                               |
| ------- | ------------------ | ----------------------------------------- |
| `1.x.x` | :white_check_mark: | Active development & stable releases      |
| `< 1.0` | :x:                | Beta / Alpha versions (No longer updated) |

---

## 🐞 Reporting a Vulnerability

We take the security of RepoPilot and its users very seriously. If you discover a security vulnerability within RepoPilot, we appreciate your help in disclosing it to us in a responsible manner.

### How to Report

Please **do not** open a public issue on GitHub for security vulnerabilities. Instead, follow these steps:

1. **Email:** Send an email directly to the project maintainer at `security@repopilot.com`.
2. **Details:** Include a detailed description of the vulnerability, steps to reproduce it, and any potential impact it may have.
3. **Response:** You should receive a confirmation of receipt within 48 hours, and we will keep you updated on the progress of the fix.

### What to Expect

- We will work closely with you to understand the nature of the issue and ensure we have all the required information.
- A fix will be developed and tested as quickly as possible.
- Once the vulnerability is patched, we will publicly acknowledge your contribution (if you desire) when releasing the update.

---

## 🔒 Security Practices in RepoPilot

We strive to ensure that RepoPilot is built with security in mind. Our current practices include:

- **JWT Authentication:** Secure token-based authentication for all protected routes.
- **Password Hashing:** Storing all user passwords securely using strong `bcrypt` hashing.
- **Input Validation:** Ensuring all user inputs and API requests are validated before processing.
- **Dependency Scanning:** Regularly monitoring and updating `npm` packages to prevent supply chain vulnerabilities.
- **Environment Variables:** Keeping all sensitive credentials and API keys out of the codebase.

Thank you for helping keep RepoPilot safe!
