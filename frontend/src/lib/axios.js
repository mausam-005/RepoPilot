import axios from "axios";

const base = process.env.NEXT_PUBLIC_API_BASE;
if (!base) {
  // Helps you catch the problem immediately in the browser console
  console.error("NEXT_PUBLIC_API_BASE is not set");
}

const api = axios.create({
  baseURL: base,
  withCredentials: true,
});

export default api;
