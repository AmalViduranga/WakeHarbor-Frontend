import { ApiResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public data?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  // Read stored JWT if available in localStorage as fallback for cross-origin local dev
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("wakeharbor_token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Send HttpOnly cookie
  });

  if (response.status === 401) {
    // If not on login page, redirect
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      localStorage.removeItem("wakeharbor_token");
      window.location.href = "/login";
    }
  }

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new ApiError(response.status, `Network response error (HTTP ${response.status})`);
  }

  if (!response.ok || !json.success) {
    throw new ApiError(response.status, json.message || "An unexpected error occurred", json);
  }

  return json.data;
}
