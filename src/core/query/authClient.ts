import { useAuthStore } from "../../features/auth/auth.store";

// export const API_BASE = "http://localhost:3002";
export const API_BASE = "https://zephyr-np09.onrender.com";


export async function authFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // 🔐 Read JWT directly from Zustand (safe outside React)
  const accessToken = useAuthStore.getState().accessToken;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}), // ← Move this to the end
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed : ${text}`);
  }
  return res.json() as Promise<T>;
}
