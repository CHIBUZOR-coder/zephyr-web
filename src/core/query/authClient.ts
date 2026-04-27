import { useAuthStore } from "../../features/auth/auth.store";

// export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002";
export const API_BASE = "https://zephyr-np09.onrender.com";

let isRefreshing = false;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
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

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers || {}),
      },
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // Network error (no internet, server down, etc.)
    throw new Error("Unable to connect. Please check your internet connection.");
  }

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
    // Don't expose internal API details - return user-friendly message
    throw new Error("Unable to complete request. Please check your connection and try again.");
  }
  return res.json() as Promise<T>;
}
