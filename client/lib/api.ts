// Centralized API client. Every call to the backend goes through here so
// the base URL, credentials (cookies), and error handling are consistent
// in one place instead of repeated across every page/component.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

async function request<T = ApiResponse>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include", // send/receive the session_token cookie
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok && !("success" in data)) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return data as T;
}

export const api = {
  // --- Auth ---
  register: (body: { email: string; name: string; password: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  logout: () => request("/auth/logout", { method: "POST" }),

  me: () => request("/auth/me"),

  // --- SMTP Config ---
  getSmtpConfigs: () => request("/config/smtp"),

  createSmtpConfig: (body: {
    name: string;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromEmail: string;
    fromName?: string;
    isDefault?: boolean;
  }) => request("/config/smtp", { method: "POST", body: JSON.stringify(body) }),

  deleteSmtpConfig: (configId: string) =>
    request(`/config/smtp/${configId}`, { method: "DELETE" }),

  setDefaultSmtpConfig: (configId: string) =>
    request(`/config/smtp/${configId}/default`, { method: "POST" }),

  testSmtpConfig: (body: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  }) => request("/config/smtp/test", { method: "POST", body: JSON.stringify(body) }),

  // --- Send ---
  sendEmail: (formData: FormData) =>
    request("/send", { method: "POST", body: formData }),

  // --- Dashboard ---
  getDashboardData: () => request("/dashboard/data"),
};
