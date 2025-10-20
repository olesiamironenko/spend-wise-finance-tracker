import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../utils/airtableTransactions';
import { fetchAccounts } from '../utils/airtableAccounts'; // helper to get user's account IDs for form dropdown

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTransactionId, setEditTransactionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    transactionType: '',
    category: '',
    shared: '',
    sharedWith: '',
    date: '',
    description: '',
    accountId: '', // Airtable Account record ID
  });

  const [accounts, setAccounts] = useState([]); // ✅ user accounts list

  // Fetch user's accounts for dropdown
  useEffect(() => {
    if (!user?.id) return;
    fetchAccounts(user.id)
      .then((data) => setAccounts(data))
      .catch((err) => console.error('Error loading accounts:', err));
  }, [user]);

  const resetForm = () => {
    setNewTransaction({
      amount: '',
      transactionType: '',
      category: '',
      shared: false,
      sharedWith: '',
      date: '',
      description: '',
      accountId: '',
    });
    setShowForm(false);
    setEditTransactionId(null);
  };

  // Fetch transactions on page load
  useEffect(() => {
    if (!user?.id) return;
    console.log('Fetching transactions for user ID:', user.id);
    setLoading(true);

    fetchTransactions(user.id)
      .then(setTransactions)
      .catch((err) => console.error('Error fetching transactions:', err))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <p>Loading transactions...</p>;

  // Add Transaction
  const handleAddTransaction = async () => {
    console.log('Creating transaction with:', {
      userId: user?.id,
      type: newTransaction.transactionType,
    });

    if (!newTransaction.accountId) {
      alert('Please select an account for this transaction.');
      return;
    }

    try {
      await addTransaction({
        accountId: newTransaction.accountId,
        amount: parseFloat(newTransaction.amount) || 0,
        transactionType: newTransaction.transactionType,
        category: newTransaction.category,
        shared: newTransaction.shared,
        sharedWith: newTransaction.sharedWith,
        date: newTransaction.date,
        description: newTransaction.description,
      });

      const refreshed = await fetchTransactions(user.id);
      setTransactions(refreshed);
      resetForm();
    } catch (err) {
      console.error('Error creating transaction:', err);
    }
  };

  // Edit Transaction
  const handleEdit = (t) => {
    setNewTransaction({ ...t });
    setEditTransactionId(t.id);
    setShowForm(true);
  };

  // Update Transaction
  const handleUpdate = async () => {
    try {
      await updateTransaction(editTransactionId, {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount) || 0,
      });

      const refreshed = await fetchTransactions(user.id);
      setTransactions(refreshed);
      resetForm();
    } catch (err) {
      console.error('Error updating Transaction:', err);
    }
  };

  // Delete Transaction
  const handleDelete = async (t) => {
    if (!window.confirm(`Delete transaction "${t.amount}" on "${t.date}"?`))
      return;
    try {
      await deleteTransaction(t.id);
      setTransactions((prev) => prev.filter((x) => x.id !== t.id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🧾 Transactions</h2>

      {loading && <p>Loading transactions...</p>}

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
              <th>Actions</th>
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
                <td>
                  <button
                    onClick={() => handleEdit(t)}
                    style={{ marginRight: 10 }}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDelete(acc)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add / Edit Form */}
      {!showForm && (
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          ➕ Add New Transaction
        </button>
      )}

      {showForm && (
        <div style={{ marginTop: 20 }}>
          {/* Amount */}
          <input
            type="number"
            placeholder="Amount"
            value={newTransaction.amount}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, amount: e.target.value })
            }
            style={{ marginRight: 10 }}
          />

          {/* Transaction Type */}
          <select
            value={newTransaction.transactionType}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                transactionType: e.target.value,
              })
            }
            style={{ marginRight: 10 }}
          >
            <option value="">Select Type</option>
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>

          {/* Category */}
          <input
            type="text"
            placeholder="Category"
            value={newTransaction.category}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, category: e.target.value })
            }
            style={{ marginRight: 10 }}
          />

          {/* Account ID Dropdown */}
          <select
            value={newTransaction.accountId}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                accountId: e.target.value,
              })
            }
            style={{ marginRight: 10 }}
          >
            <option value="">Select Account</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.accountName} ({acc.currency})
              </option>
            ))}
          </select>

          {/* Date */}
          <input
            type="date"
            value={newTransaction.date}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, date: e.target.value })
            }
            style={{ marginRight: 10 }}
          />

          {/* Shared checkbox */}
          <label style={{ marginRight: 10 }}>
            <input
              type="checkbox"
              checked={newTransaction.shared}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  shared: e.target.checked,
                })
              }
            />{' '}
            Shared
          </label>

          {/* SharedWith input */}
          <input
            type="text"
            placeholder="Shared with (comma-separated IDs or emails)"
            value={newTransaction.sharedWith}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                sharedWith: e.target.value,
              })
            }
            style={{ marginRight: 10, width: '250px' }}
          />

          <button
            onClick={editTransactionId ? handleUpdate : handleAddTransaction}
            style={{ marginRight: 10 }}
          >
            {editTransactionId ? 'Update Transaction' : 'Save Transaction'}
          </button>
          <button onClick={resetForm}>Cancel</button>
        </div>
      )}
    </div>
  );
}
