import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './context/AuthContext.jsx';

import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import SharedExpensesPage from './pages/SharedExpensesPage.jsx';
import NotFoundPage from './pages/NotFoundPage';

import PublicLayout from './components/shared/PublicLayout';
import PrivateLayout from './components/shared/PrivateLayout';

import './App.css';

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicLayout>
              <LoginPage />
            </PublicLayout>
          }
        />

        <Route
          path="/register"
          element={
            <PublicLayout>
              <RegisterPage />
            </PublicLayout>
          }
        />

        <Route
          path="*"
          element={
            <PublicLayout>
              <LoginPage />
            </PublicLayout>
          }
        />

        {/* Private (authenticated) routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateLayout>
              <DashboardPage />
            </PrivateLayout>
          }
        />

        <Route
          path="/accounts"
          element={
            <PrivateLayout>
              <AccountsPage />
            </PrivateLayout>
          }
        />

        <Route
          path="/transactions"
          element={
            <PrivateLayout>
              <TransactionsPage />
            </PrivateLayout>
          }
        />

        <Route
          path="/shared"
          element={
            <PrivateLayout>
              <SharedExpensesPage />
            </PrivateLayout>
          }
        />

        <Route
          path="/*"
          element={
            <PrivateLayout>
              <NotFoundPage />
            </PrivateLayout>
          }
        />

        <Route
          path="/"
          element={
            <PrivateLayout>
              <Navigate to="/dashboard" replace />
            </PrivateLayout>
          }
        />
      </Routes>
    </div>
  );
}
