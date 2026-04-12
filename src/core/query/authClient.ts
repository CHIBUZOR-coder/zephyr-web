import { useAuthStore } from "../../features/auth/auth.store";

// export const API_BASE = "http://localhost:3002";
export const API_BASE = "https://zephyr-np09.onrender.com";

let isRefreshing = false;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.success && data.accessToken) {
      const { setAuth, user } = useAuthStore.getState();
      setAuth(user!, data.accessToken);
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

export async function authFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401 && !isRefreshing) {
    isRefreshing = true;
    
    const newToken = await refreshAccessToken();
    
    isRefreshing = false;
    
    if (newToken) {
      return authFetch(path, options);
    } else {
      const { logout } = useAuthStore.getState();
      logout();
      throw new Error("Session expired. Please sign in again.");
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed : ${text}`);
  }
  return res.json() as Promise<T>;
}
