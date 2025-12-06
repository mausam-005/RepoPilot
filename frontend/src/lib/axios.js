import axios from "axios";

const base = process.env.NEXT_PUBLIC_API_BASE || 'https://repopilot-backend.onrender.com/api';

console.log('API Base URL:', base);
console.log('Environment:', process.env.NODE_ENV);

const api = axios.create({
  baseURL: base,
  withCredentials: true,
});

export default api;
