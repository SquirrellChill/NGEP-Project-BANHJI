import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import ProtectedRoute from './ProtectedRoute';

// Pages directly under src/pages/
import LandingPage from '../pages/LandingPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import TermsPage from '../pages/TermsPage.jsx';
import PrivacyPage from '../pages/PrivacyPage.jsx';
import HistoryScreen from '../pages/dashboard/HistoryScreen.jsx';
import TransactionsScreen from '../pages/dashboard/TransactionsScreen.jsx';
import VoiceScreen from '../pages/dashboard/VoiceScreen.jsx';
import ProfileScreen from '../pages/dashboard/ProfileScreen.jsx';
import EditProfileScreen from '../pages/dashboard/EditProfileScreen.jsx';
import ChangePasswordScreen from '../pages/dashboard/ChangePasswordScreen.jsx';

// Pages inside src/pages/auth/
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage.jsx';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/history"
                element={
                  <ProtectedRoute>
                    <HistoryScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/transactions"
                element={
                  <ProtectedRoute>
                    <TransactionsScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/voice"
                element={
                  <ProtectedRoute>
                    <VoiceScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/profile"
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/profile/edit"
                element={
                  <ProtectedRoute>
                    <EditProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/profile/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePasswordScreen />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
