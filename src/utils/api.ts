const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const apiFetch = (path: string, init?: RequestInit) => {
  return fetch(apiUrl(path), {
    credentials: 'include',
    ...init,
  });
};
