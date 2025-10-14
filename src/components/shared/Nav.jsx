import { NavLink } from 'react-router-dom';

export default function Nav({ onClose, onLogout }) {
  return (
    <ul className="dropdown">
      <li>
        <NavLink to="/dashboard" onClick={onClose}>
          Dashboard
        </NavLink>
      </li>
      <li>
        <NavLink to="/accounts" onClick={onClose}>
          Accounts
        </NavLink>
      </li>
      <li>
        <NavLink to="/transactions" onClick={onClose}>
          Transactions
        </NavLink>
      </li>
      <li>
        <NavLink to="/shared" onClick={onClose}>
          Shared Expenses
        </NavLink>
      </li>
      <li>
        <button onClick={onLogout}>Logout</button>
      </li>
    </ul>
  );
}
