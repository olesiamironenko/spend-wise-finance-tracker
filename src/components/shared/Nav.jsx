import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaWallet,
  FaExchangeAlt,
  FaUsers,
  FaList,
  FaSignOutAlt,
} from 'react-icons/fa';
import './Nav.css';

export default function Nav({ onLogout }) {
  const links = [
    { to: '/app', label: 'Dashboard', icon: <FaTachometerAlt />, end: true },
    { to: '/app/accounts', label: 'Accounts', icon: <FaWallet /> },
    { to: '/app/transactions', label: 'Transactions', icon: <FaExchangeAlt /> },
    { to: '/app/shared', label: 'Shared Expenses', icon: <FaUsers /> },
    { to: '/app/categories', label: 'Categories', icon: <FaList /> },
  ];

  return (
    <nav className="nav">
      {links.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          {icon && <span className="nav-icon">{icon}</span>}
          {label}
        </NavLink>
      ))}

      <button onClick={onLogout} className="logout-btn">
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </nav>
  );
}
