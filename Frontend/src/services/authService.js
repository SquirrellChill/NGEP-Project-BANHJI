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

export const verifyEmail = ({ email, code }) =>
  nodeApi.post('/auth/verify-email', { email, code });

export const resendVerification = ({ email }) =>
  nodeApi.post('/auth/resend-verification', { email });

export const forgotPassword = ({ email }) =>
  nodeApi.post('/auth/forgot-password', { email });

export const resetPassword = ({ token, password }) =>
  nodeApi.post('/auth/reset-password', { token, password });

export const getErrorMessage = (error) =>
  error?.response?.data?.detail || 'Something went wrong. Please try again.';