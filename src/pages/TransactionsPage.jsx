import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchTransactions } from '../utils/airtableTransactions';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);

  // Fetch transactions
  useEffect(() => {
    if (!user?.id) return;

    const loadTransactions = async () => {
      const txs = await fetchTransactions(user.id);
      setTransactions(txs);
    };

    loadTransactions();
  }, [user]);

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>🧾 Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Account</th>
              <th>Shared?</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td style={{ color: t.amount >= 0 ? 'green' : 'red' }}>
                  ${t.amount.toFixed(2)}
                </td>
                <td>{t.description}</td>
                <td>{t.accountId}</td>
                <td>{t.sharedWith.length > 0 ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
