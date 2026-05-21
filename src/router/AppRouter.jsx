import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layouts
import MainLayout from '../layouts/MainLayout';

// Pages
import LoginPage from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import UsersPage from '../pages/UsersPage';
import DrawsPage from '../pages/DrawsPage';
import ActivitiesPage from '../pages/ActivitiesPage';
import LogsPage from '../pages/LogsPage';
import PaymentsPage from '../pages/PaymentsPage';
import RecoveryDashboardPage from '../pages/RecoveryDashboardPage';
import DLQViewerPage from '../pages/DLQViewerPage';
import SettingsPage from '../pages/SettingsPage';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader-ring" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader-ring" />
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Public Authentication Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />

        {/* Private Dashboard Console Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="draws" element={<DrawsPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="recovery" element={<RecoveryDashboardPage />} />
          <Route path="dlq" element={<DLQViewerPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback Catch-All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;