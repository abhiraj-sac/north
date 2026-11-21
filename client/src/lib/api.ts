import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("north_token") ??
    sessionStorage.getItem("north_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// If the login token is rejected (expired or invalid), clear the session and
// send the user back to sign in instead of leaving the page in a failed state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";
    const isAuthRequest = url.includes("/api/auth/");
    const alreadyOnSignIn = window.location.pathname.startsWith("/signin");

    if (status === 401 && !isAuthRequest && !alreadyOnSignIn) {
      try {
        localStorage.removeItem("north_token");
        localStorage.removeItem("north_user");
        sessionStorage.removeItem("north_token");
        sessionStorage.removeItem("north_user");
      } catch {
        // storage unavailable; redirect anyway
      }
      window.location.assign("/signin");
    }

    return Promise.reject(error);
  },
);

