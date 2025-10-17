import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import {
  getTotalBalance,
  getTotalIncome,
  getTotalExpenses,
  getSharedTotals,
} from '../utils/mockCalculations';
import { mockTransactions } from '../utils/mockData';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [totals, setTotals] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [shared, setShared] = useState({
    totalShared: 0,
    totalPaid: 0,
    totalOwed: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (user?.id) {
      setTotals({
        balance: getTotalBalance(user.id),
        income: getTotalIncome(user.id),
        expenses: getTotalExpenses(user.id),
      });
      setShared(getSharedTotals(user.id));

      // Recent 5 transactions (shared + personal)
      const userTx = mockTransactions.filter(
        (t) =>
          t.userId === user.id ||
          (t.shared && t.participants?.some((p) => p.userId === user.id))
      );

      const sorted = userTx
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      setRecentTransactions(sorted);
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
      {/* --- TOTAL TOTALS --- */}
      <section style={{ marginBottom: 30 }}>
        <h2>💰 Overall Totals</h2>
        <ul>
          <li>
            <strong>Total Balance:</strong> ${totals.balance.toFixed(2)}
          </li>
          <li>
            <strong>Total Income:</strong> ${totals.income.toFixed(2)}
          </li>
          <li>
            <strong>Total Expenses:</strong> ${totals.expenses.toFixed(2)}
          </li>
        </ul>
      </section>

      {/* --- SHARED TOTALS --- */}
      <section style={{ marginBottom: 30 }}>
        <h2>👥 Shared Totals</h2>
        <ul>
          <li>
            <strong>Total Shared:</strong> ${shared.totalShared.toFixed(2)}
          </li>
          <li>
            <strong>Total Paid:</strong> ${shared.totalPaid.toFixed(2)}
          </li>
          <li>
            <strong>Total Owed:</strong> ${shared.totalOwed.toFixed(2)}
          </li>
        </ul>
      </section>

      {/* --- RECENT TRANSACTIONS --- */}
      <section>
        <h2>🧾 Recent Transactions</h2>
        <ul>
          {recentTransactions.map((t) => (
            <li
              key={t.id}
              style={{
                marginBottom: 8,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 6,
                backgroundColor: t.shared ? '#f8faff' : '#fff',
              }}
            >
              <strong>{t.description}</strong> — ${t.amount.toFixed(2)}{' '}
              <em>
                ({t.shared ? 'shared' : 'personal'}{' '}
                {t.amount > 0 ? '· income' : '· expense'})
              </em>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
