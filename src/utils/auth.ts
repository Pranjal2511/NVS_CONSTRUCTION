/* src/utils/auth.ts */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
}

/**
 * Simple authentication utility functions for the NVS Buildcon portfolio.
 * Uses the cookie-based session backend, synchronized to localized local storage helper state.
 */
export const storeRole = (role: 'admin' | 'user') => {
  localStorage.setItem('authRole', role);
};

export const clearAuth = () => {
  localStorage.removeItem('authRole');
};

export const getRole = (): 'admin' | 'user' | null => {
  return localStorage.getItem('authRole') as 'admin' | 'user' | null;
};

export const isAuthenticated = (): boolean => !!getRole();

export const isAdmin = (): boolean => getRole() === 'admin';

// API wrappers
export const loginUser = async (email: string, password: string): Promise<AuthUser> => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }
  const data = await res.json();
  if (data.user?.role) {
    storeRole(data.user.role);
  }
  return data.user;
};

export const registerUser = async (name: string, email: string, phone: string, password: string): Promise<AuthUser> => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Registration failed');
  }
  const data = await res.json();
  if (data.user?.role) {
    storeRole(data.user.role);
  }
  return data.user;
};

export const loginAdmin = async (email: string, password: string): Promise<AuthUser> => {
  const res = await fetch('/api/auth/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Admin login failed');
  }
  const data = await res.json();
  if (data.user?.role) {
    storeRole(data.user.role);
  }
  return data.user;
};

export const fetchUserProfile = async (): Promise<AuthUser | null> => {
  try {
    const res = await fetch('/api/auth/profile');
    if (!res.ok) {
      clearAuth();
      return null;
    }
    const result = await res.json();
    if (result.success && result.data) {
      storeRole(result.data.role);
      return {
        id: result.data.id || result.data._id,
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone,
        role: result.data.role
      };
    }
    clearAuth();
    return null;
  } catch (err) {
    clearAuth();
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (err) {
    console.error('Logout request failed', err);
  } finally {
    clearAuth();
  }
};
