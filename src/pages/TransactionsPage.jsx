import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../utils/airtableTransactions';
import { fetchAccounts } from '../utils/airtableAccounts'; // helper to get user's account IDs for form dropdown
import { fetchCategories } from '../utils/airtableCategories'; // helper to get user's categories IDs for form dropdown

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null); // single state for create/edit
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]); // user accounts list

  // Fetch categories
  useEffect(() => {
    if (!user?.id) return;
    fetchCategories(user.id).then(setCategories).catch(console.error);
  }, [user]);

  // Fetch accounts
  useEffect(() => {
    if (!user?.id) return;
    fetchAccounts(user.id).then(setAccounts).catch(console.error);
  }, [user]);

  // Fetch transactions
  const loadTransactions = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchTransactions(user.id);
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [user]);

  // Open form for new transaction
  const handleAddTransaction = () => {
    setEditTransaction({
      amount: '',
      transactionType: '',
      accountId: '',
      categoryId: '',
      date: '',
      description: '',
      shared: false,
      sharedWith: '',
    });
    setShowForm(true);
  };

  // Update Transaction
  // Open form for editing existing transaction
  const handleEditTransaction = (transaction) => {
    setEditTransaction(transaction);
    setShowForm(true);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditTransaction((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Save new transaction
  const handleSave = async () => {
    if (!editTransaction.accountId)
      return alert('Account is required. Please select an account.');

    try {
      // Normalize sharedWith
      let sharedWithArray = [];
      if (Array.isArray(editTransaction.sharedWith)) {
        sharedWithArray = editTransaction.sharedWith;
      } else if (typeof editTransaction.sharedWith === 'string') {
        sharedWithArray = editTransaction.sharedWith
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      await addTransaction({
        ...editTransaction,
        userId: user.id,
        amount: parseFloat(editTransaction.amount) || 0,
        sharedWith: sharedWithArray,
      });

      await loadTransactions(); // refresh list
      setEditTransaction(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error saving transaction:', err);
    }
  };

  // Update existing transaction
  const handleUpdate = async () => {
    if (!editTransaction.accountId)
      return alert('Account is required. Please select an account.');

    try {
      const { id, ...fields } = editTransaction;

      // Normalize sharedWith
      let sharedWithArray = [];
      if (Array.isArray(fields.sharedWith)) {
        sharedWithArray = fields.sharedWith;
      } else if (typeof fields.sharedWith === 'string') {
        sharedWithArray = fields.sharedWith
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      await updateTransaction(id, {
        ...fields,
        amount: parseFloat(fields.amount) || 0,
        sharedWith: sharedWithArray,
      });

      await loadTransactions(); // refresh list
      setEditTransaction(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error updating transaction:', err);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setEditTransaction(null);
    setShowForm(false);
  };

  // Delete transaction
  const handleDelete = async (transaction) => {
    if (!window.confirm(`Delete transaction "${transaction.description}"?`))
      return;
    try {
      await deleteTransaction(transaction.id);
      setTransactions((prev) => prev.filter((t) => t.id !== transaction.id));
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
              <th>Category</th>
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
                <td>{t.accountName || '—'}</td>
                <td>{t.categoryName || '—'}</td>
                <td>{t.sharedWith?.length > 0 ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => handleEditTransaction(t)}>Edit</button>
                  <button
                    onClick={() => handleDelete(t)}
                    style={{ marginLeft: 10 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!showForm && (
        <button onClick={handleAddTransaction}>➕ Add New Transaction</button>
      )}
      {/* Form */}
      {showForm && editTransaction && (
        <div style={{ marginTop: 20 }}>
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={editTransaction.amount}
            onChange={handleInputChange}
            style={{ marginRight: 10 }}
          />

          <select
            name="transactionType"
            value={editTransaction.transactionType || ''}
            onChange={handleInputChange}
            style={{ marginRight: 10 }}
          >
            <option value="">Select Type</option>
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>

          <select
            name="categoryId"
            value={editTransaction.categoryId || ''}
            onChange={handleInputChange}
            style={{ marginRight: 10 }}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.categoryName}
              </option>
            ))}
          </select>

          <select
            name="accountId"
            value={editTransaction.accountId || ''}
            onChange={handleInputChange}
            required
            style={{ marginRight: 10 }}
          >
            <option value="">Select Account</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.accountName} ({acc.currency})
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date"
            value={editTransaction.date || ''}
            onChange={handleInputChange}
            style={{ marginRight: 10 }}
          />

          <label style={{ marginRight: 10 }}>
            <input
              type="checkbox"
              name="shared"
              checked={editTransaction.shared || false}
              onChange={handleInputChange}
            />{' '}
            Shared
          </label>

          <input
            type="text"
            name="sharedWith"
            placeholder="Shared with (comma-separated)"
            value={editTransaction.sharedWith || ''}
            onChange={handleInputChange}
            style={{ marginRight: 10, width: '250px' }}
          />

          <input
            type="text"
            name="description"
            placeholder="Description"
            value={editTransaction.description || ''}
            onChange={handleInputChange}
            style={{ marginRight: 10 }}
          />

          {editTransaction.id ? (
            <button onClick={handleUpdate} style={{ marginRight: 10 }}>
              Update Transaction
            </button>
          ) : (
            <button onClick={handleSave} style={{ marginRight: 10 }}>
              Save Transaction
            </button>
          )}

          <button onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
