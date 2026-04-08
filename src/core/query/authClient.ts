// const API_BASE = "http://localhost:4000"; // mock for now

// export async function authFetch<T>(
//   path: string,
//   options?: RequestInit,
// ): Promise<T> {
//   const res = await fetch(`${API_BASE}${path}`, {
//     credentials: "include", // cookies / session
//     headers: {
//       "Content-Type": "application/json",
//     },
//     ...options,
//   });

//   if (!res.ok) {
//     throw new Error("Auth request failed");
//   }

//   return res.json();
// }

// const API_BASE = "http://localhost:3000"; // mock for now

// export async function authFetch<T>(
//   path: string,
//   options: RequestInit = {},
// ): Promise<T> {
//   const res = await fetch(`${API_BASE}${path}`, {
//     credentials: "include", // 🔐 JWT cookie (required)
//     headers: {
//       "Content-Type": "application/json",
//       ...(options.headers || {}),
//     },
//     ...options,
//   });

//   if (!res.ok) {
//     throw new Error(`Auth request failed: ${res.status}`);
//   }

//   return res.json();
// }

// core/query/authClient.ts

// ✅ Change this to your production backend when ready
// core/query/authClient.ts
import { useAuthStore } from "../../features/auth/auth.store";

// ✅ Reverting for debugging
// export const API_BASE = "https://153c-102-91-92-142.ngrok-free.app"
// export const API_BASE = "http://localhost:3002";
export const API_BASE = "https://zephyr-np09.onrender.com";



export async function authFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // 🔐 Read JWT directly from Zustand (safe outside React)
  const accessToken = useAuthStore.getState().accessToken;
  console.log("tok:", accessToken);
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
