import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import SharedExpensesPage from './pages/SharedExpensesPage.jsx';
import NotFoundPage from './pages/NotFoundPage';

import PublicLayout from './components/shared/PublicLayout';
import PrivateLayout from './components/shared/PrivateLayout';

import { testAirtable } from './utils/testAirtable';

import './App.css';

export default function App() {
  const isAuthenticated = localStorage.getItem('currentUser');

  useEffect(() => {
    testAirtable();
  }, []);

  return (
    <div>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Public 404 fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Private (authenticated) routes */}
        <Route path="/app" element={<PrivateLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="shared" element={<SharedExpensesPage />} />
          <Route path="categories" element={<CategoriesPage />} />

          {/* Private 404 fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  );
}
