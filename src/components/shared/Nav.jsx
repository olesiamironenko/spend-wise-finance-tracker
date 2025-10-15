import { NavLink } from 'react-router-dom';

export default function Nav({ onClose, onLogout }) {
  return (
    <ul className="dropdown">
      <li>
        <NavLink to="/app" onClick={onClose}>
          Dashboard
        </NavLink>
      </li>
      <li>
        <NavLink to="/app/accounts" onClick={onClose}>
          Accounts
        </NavLink>
      </li>
      <li>
        <NavLink to="/app/transactions" onClick={onClose}>
          Transactions
        </NavLink>
      </li>
      <li>
        <NavLink to="/app/shared" onClick={onClose}>
          Shared Expenses
        </NavLink>
      </li>
      <li>
        <button onClick={onLogout}>Logout</button>
      </li>
    </ul>
  );
}
