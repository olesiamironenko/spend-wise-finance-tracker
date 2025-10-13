import { useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from './context/AuthContext.jsx';

import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import SharedExpensesPage from './pages/SharedExpensesPage.jsx';
import NotFoundPage from './pages/NotFoundPage';

import PrivateRoute from './router/PrivateRoute';

import './App.css';

export default function App() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <header>
        <nav style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {user ? (
              <>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{ cursor: 'pointer' }}
                >
                  {user.email} ▼
                </button>
                {showDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      background: 'white',
                      border: '1px solid #ccc',
                      padding: '0.5rem',
                    }}
                  >
                    <NavLink
                      to="/dashboard"
                      onClick={() => setShowDropdown(false)}
                    >
                      Dashboard
                    </NavLink>
                    <br />
                    <NavLink
                      to="/accounts"
                      onClick={() => setShowDropdown(false)}
                    >
                      Accounts
                    </NavLink>
                    <br />
                    <NavLink
                      to="/transactions"
                      onClick={() => setShowDropdown(false)}
                    >
                      Transactions
                    </NavLink>
                    <br />
                    <NavLink
                      to="/shared"
                      onClick={() => setShowDropdown(false)}
                    >
                      Shared Expenses
                    </NavLink>
                    <br />
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink> |{' '}
                <NavLink to="/register">Register</NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<LoginPage />} />
            </>
          ) : (
            <>
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/accounts"
                element={
                  <PrivateRoute>
                    <AccountsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <PrivateRoute>
                    <TransactionsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/shared"
                element={
                  <PrivateRoute>
                    <SharedExpensesPage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}
