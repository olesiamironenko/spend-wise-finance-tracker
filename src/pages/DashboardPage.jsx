import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getPersonalBalance,
  getPersonalIncome,
  getPersonalExpenses,
  getSharedBalance,
  getRecentTransactions,
} from '../utils/mockCalculations';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [personalBalance, setPersonalBalance] = useState(0);
  const [personalIncome, setPersonalIncome] = useState(0);
  const [personalExpenses, setPersonalExpenses] = useState(0);
  const [sharedSummary, setSharedSummary] = useState({
    owes: 0,
    owedTo: 0,
    net: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (user?.id) {
      setPersonalBalance(getPersonalBalance(user.id));
      setSharedSummary(getSharedBalance(user.id));
    }
  }, [user]);

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <header>
        <h2>Dashboard</h2>
        <h3>Welcome, {user?.email}</h3>
        <p>This is your dashboard. More finance features coming soon!</p>
      </header>
      <section>
        <h2>💰 Personal Balance</h2>
        <p className="text-lg font-bold">${personalBalance.toFixed(2)}</p>
      </section>
      <section>
        <h2>👥 Shared Transactions Summary</h2>
        <ul>
          <li>Owes others: ${sharedSummary.owes.toFixed(2)}</li>
          <li>Owed by others: ${sharedSummary.owedTo.toFixed(2)}</li>
          <li>
            <strong>Net:</strong>{' '}
            <span style={{ color: sharedSummary.net >= 0 ? 'green' : 'red' }}>
              ${sharedSummary.net.toFixed(2)}{' '}
              {sharedSummary.net >= 0 ? 'owed to you' : 'you owe'}
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
