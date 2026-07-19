/* src/utils/auth.ts */

import { apiFetch } from './api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  avatar?: string | null;
  isVerified?: boolean;
}

export interface OtpChallenge {
  otpRequired: true;
  identifier: string;
  channel: 'email' | 'phone';
  expiresInSeconds: number;
  devOtp?: string;
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

export const sendLoginOtp = async (identifier: string, role: 'admin' | 'user' = 'user'): Promise<OtpChallenge> => {
  const res = await apiFetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, role })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to send OTP');
  }
  const result = await res.json();
  return result.data;
};

export const verifyLoginOtp = async (identifier: string, otp: string, role: 'admin' | 'user' = 'user'): Promise<AuthUser> => {
  const res = await apiFetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, otp, role })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'OTP verification failed');
  }
  const data = await res.json();
  if (data.user?.role) {
    storeRole(data.user.role);
  }
  return data.user;
};

export const loginUser = async (identifier: string): Promise<OtpChallenge> => sendLoginOtp(identifier, 'user');

export const loginWithPassword = async (email: string, password: string): Promise<AuthUser> => {
  const res = await apiFetch('/api/auth/login-password', {
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

export const forgotPasswordRequest = async (email: string): Promise<string> => {
  const res = await apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Forgot password request failed');
  }
  const data = await res.json();
  return data.message || 'If an account exists, a reset link has been sent.';
};

export const resetPassword = async (token: string, newPassword: string): Promise<string> => {
  const res = await apiFetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Reset password failed');
  }
  const data = await res.json();
  return data.message || 'Password reset successfully';
};

export const registerUser = async (firstName: string, lastName: string, email: string, phone: string): Promise<OtpChallenge> => {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      email,
      phone
    })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Registration failed');
  }
  const result = await res.json();
  return result.data;
};

export const loginAdmin = async (identifier: string): Promise<OtpChallenge> => sendLoginOtp(identifier, 'admin');

export const fetchUserProfile = async (): Promise<AuthUser | null> => {
  try {
    const res = await apiFetch('/api/auth/profile');
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
        role: result.data.role,
        avatar: result.data.avatar || result.data.profileImage,
        isVerified: result.data.isVerified
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
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Logout network failure is non-critical; local auth state is still cleared below
  } finally {
    clearAuth();
  }
};

export const signOutAllDevices = async (): Promise<void> => {
  try {
    await apiFetch('/api/auth/sign-out-all', { method: 'POST' });
  } catch {
    // Ignore network error
  } finally {
    clearAuth();
  }
};
