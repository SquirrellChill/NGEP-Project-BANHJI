import { nodeApi } from './api';

export const register = ({ firstName, lastName, phoneNumber, email, password }) =>
  nodeApi.post('/auth/register', {
    first_name: firstName,
    last_name: lastName,
    phone_number: phoneNumber,
    email,
    password,
  });

export const login = ({ email, password }) =>
  nodeApi.post('/auth/login', { email, password });

export const logout = () => nodeApi.post('/auth/logout');

export const getMe = () => nodeApi.get('/auth/me');

export const updateMe = ({ firstName, lastName, phoneNumber, email }) =>
  nodeApi.put('/auth/me', {
    first_name: firstName,
    last_name: lastName,
    phone_number: phoneNumber,
    email: email || null,
  });

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return nodeApi.post('/auth/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const changePassword = ({ currentPassword, newPassword }) =>
  nodeApi.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });

// Standard flow: Send 6-digit OTP after verifying current password
export const requestPasswordChangeOTP = ({ currentPassword }) =>
  nodeApi.post('/auth/change-password/request-otp', {
    current_password: currentPassword,
  });

// Standard flow: Verify current password + OTP and set new password
export const verifyChangePasswordWithOTP = ({ currentPassword, code, newPassword }) =>
  nodeApi.post('/auth/change-password/verify', {
    current_password: currentPassword,
    code,
    new_password: newPassword,
  });

// In-session reset: Verify registered email and send OTP to logged-in user
export const requestForgotCurrentPasswordOTP = ({ email }) =>
  nodeApi.post('/auth/change-password/forgot-current-otp', { email });

// In-session reset: Verify OTP and update password directly
export const resetWithOtpAuthenticated = ({ code, newPassword }) =>
  nodeApi.post('/auth/change-password/reset-with-otp', {
    code,
    new_password: newPassword,
  });

export const verifyEmail = ({ email, code }) =>
  nodeApi.post('/auth/verify-email', { email, code });

export const resendVerification = ({ email }) =>
  nodeApi.post('/auth/resend-verification', { email });

export const forgotPassword = ({ email }) =>
  nodeApi.post('/auth/forgot-password', { email });

export const resetPassword = ({ token, password }) =>
  nodeApi.post('/auth/reset-password', { token, password });

export const getErrorMessage = (error) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((entry) => entry?.msg || entry?.message).filter(Boolean).join(' ');
  }
  return error?.message || 'Something went wrong. Please try again.';
};