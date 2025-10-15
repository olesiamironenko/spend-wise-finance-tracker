import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockTransactions, mockAccounts } from '../utils/mockData';

function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0], // today's date by defaul
    amount: '',
    description: '',
    type: 'expense',
    shared: false,
    accountId: '',
  });

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTransaction((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();

    let amountValue = parseFloat(newTransaction.amount);
    if (newTransaction.type === 'expense') {
      amountValue = -Math.abs(amountValue); // ensure expense is negative
    } else {
      amountValue = Math.abs(amountValue); // ensure income is positive
    }

    const newTx = {
      id: `t${Date.now()}`,
      userId: user.id,
      accountId: newTransaction.accountId,
      amount: amountValue,
      type: newTransaction.type,
      description: newTransaction.description,
      shared: newTransaction.shared,
      date: newTransaction.date || new Date().toISOString().split('T')[0],
    };

    setTransactions((prev) => [newTx, ...prev]);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      type: 'expense',
      shared: false,
      accountId: '',
    });
    setShowForm(false);
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

      <button
        onClick={() => setShowForm((prev) => !prev)}
        style={{ marginBottom: 20 }}
      >
        {showForm ? 'Cancel' : 'Add New Transaction'}
      </button>

      {showForm && (
        <form
          onSubmit={handleAddTransaction}
          style={{
            display: 'grid',
            gap: '10px',
            marginBottom: 20,
            border: '1px solid #ccc',
            padding: 16,
            borderRadius: 8,
            background: '#f9f9f9',
          }}
        >
          <label>
            Date:
            <input
              type="date"
              name="date"
              max={new Date().toISOString().split('T')[0]} // prevent future dates
              value={
                newTransaction.date || new Date().toISOString().split('T')[0]
              } // default to today
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Amount:
            <input
              type="number"
              name="amount"
              step="0.01"
              value={newTransaction.amount}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Description:
            <input
              type="text"
              name="description"
              value={newTransaction.description}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Type:
            <select
              name="type"
              value={newTransaction.type}
              onChange={handleChange}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>

          <label>
            Shared:
            <input
              type="checkbox"
              name="shared"
              checked={newTransaction.shared}
              onChange={handleChange}
            />
          </label>

          <label>
            Account:
            <select
              name="accountId"
              value={newTransaction.accountId}
              onChange={handleChange}
              required
            >
              <option value="">Select account</option>
              {mockAccounts
                .filter((a) => a.userId === user.id)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (••••{a.number.slice(-4)})
                  </option>
                ))}
            </select>
          </label>

          <button type="submit">Save Transaction</button>
        </form>
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
