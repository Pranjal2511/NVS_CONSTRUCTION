const API_BASE_URL = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

let refreshPending: Promise<Response> | null = null;
export const apiFetch = async (path: string, init?: RequestInit): Promise<Response> => {
  const request = () => fetch(apiUrl(path), { ...init, credentials: 'include' });
  const response = await request();
  if (response.status !== 401 || /\/api\/auth\/(login|admin-login|register|send-otp|verify-otp|refresh|forgot-password|reset-password)/.test(path)) return response;
  if (!refreshPending) refreshPending = fetch(apiUrl('/api/auth/refresh'), { method: 'POST', credentials: 'include' }).finally(() => { refreshPending = null; });
  const refreshed = await refreshPending;
  return refreshed.ok ? request() : response;
};
