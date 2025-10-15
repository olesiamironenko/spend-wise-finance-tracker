import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockTransactions, mockAccounts } from '../utils/mockData';

function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (user?.id) {
      // Get all transactions for this user:
      const userTx = mockTransactions.filter(
        (t) => t.userId === user.id || (t.shared && t.sharedWith === user.id)
      );

      // Sort by date descending
      const sorted = userTx.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(sorted);
    }
  }, [user]);

  if (!user) return <p>Loading...</p>;

  // Helper to get last 4 digits of account number
  const getAccountLast4 = (accountId) => {
    const account = mockAccounts.find((a) => a.id === accountId);
    if (!account || !account.number) return '----';
    return account.number.slice(-4);
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <h2>🧾 Transactions</h2>

      {transactions.length === 0 ? (
        <p>You did not add any transactions tet.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: 20,
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Account Last 4</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={tdStyle}>{t.date}</td>
                <td
                  style={{
                    ...tdStyle,
                    color: t.amount >= 0 ? 'green' : 'red',
                    fontWeight: 'bold',
                  }}
                >
                  ${t.amount.toFixed(2)}
                </td>
                <td style={tdStyle}>{t.description}</td>
                <td style={tdStyle}>{t.shared ? 'Shared' : 'Personal'}</td>
                <td style={tdStyle}>{getAccountLast4(t.accountId)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Simple table styles
const thStyle = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '2px solid #ccc',
};

const tdStyle = {
  padding: '8px 12px',
};

export default TransactionsPage;
