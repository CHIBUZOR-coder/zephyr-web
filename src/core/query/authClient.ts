import { useAuthStore } from "../../features/auth/auth.store";

// export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002";
export const API_BASE = "https://zephyr-np09.onrender.com";

// This promise acts as a "wait room" for concurrent 401s
let refreshPromise: Promise<string | null> | null = null;

/**
 * Custom Error class to pass status codes to the UI
 */
export class APIError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "APIError";
    this.message = message;
    this.status = status;
  }
}

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

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();
    if (data.success && data.user) {
      const { setAuth } = useAuthStore.getState();
      setAuth(data.user, data.accessToken || null);
      return data.accessToken || null;
    }
    return null;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
}

export async function authFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken, logout } = useAuthStore.getState();

  const makeRequest = async (token: string | null) => {
    return fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  };

  let res: Response;
  try {
    res = await makeRequest(accessToken);
  } catch {
    throw new APIError("Network error. Please check your internet connection.");
  }

  // Handle 401 Unauthorized
  if (res.status === 401) {
    // If a refresh is already in progress, wait for it instead of failing
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken();
    }

    const newToken = await refreshPromise;
    
    // Clear the promise once finished so the next cycle can start fresh
    if (refreshPromise) refreshPromise = null;

    if (newToken) {
      // Retry the original request with the new token
      res = await makeRequest(newToken);
    } else {
      logout();
      throw new APIError("Session expired. Please sign in again.", 401);
    }
  }

  // Final status check
  if (!res.ok) {
    // Attempt to get error message from server if available
    let errorMessage = "Unable to complete request.";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      /* fallback to default */
    }
    throw new APIError(errorMessage, res.status);
  }

  // Safe JSON parsing
  try {
    return await res.json() as T;
  } catch {
    throw new APIError("Server returned an invalid response.");
  }
}