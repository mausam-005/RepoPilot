import axios from "axios";

const base = process.env.NEXT_PUBLIC_API_BASE;
if (!base) {
  console.error("NEXT_PUBLIC_API_BASE is not set");
}

console.log('API Base URL:', base);

const api = axios.create({
  baseURL: base,
  withCredentials: true,
});

export default api;
