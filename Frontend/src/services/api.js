import axios from 'axios';

// Backend — the FastAPI service handling auth, transactions, and voice
export const nodeApi = axios.create({
  baseURL: import.meta.env.VITE_NODE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Kept as a separate client shape for compatibility with existing callers.
export const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_API_URL,
});

// core/dependencies.py uses HTTPBearer — expects "Authorization: Bearer <token>"
nodeApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('kc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 means decode_access_token failed (expired/invalid/missing) —
// clear local state so the app falls back to logged-out instead of looping.
nodeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kc_token');
      localStorage.removeItem('kc_user');
    }
    return Promise.reject(error);
  }
);
