import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../utils/airtableTransactions';
import { fetchAccounts, fetchAllAccounts } from '../utils/airtableAccounts'; // helper to get user's account IDs for form dropdown
import { fetchCategories } from '../utils/airtableCategories'; // helper to get user's categories IDs for form dropdown
import { fetchUsers } from '../utils/airtableUsers';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null); // single state for create/edit
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]); // user accounts list
  const [allUsers, setAllUsers] = useState([]); // all users for sharedWith dropdown

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

  // Fetch all users
  useEffect(() => {
    fetchUsers().then(setAllUsers).catch(console.error);
  }, []);

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

  // Load Transactions
  useEffect(() => {
    loadTransactions();
  }, [user]);

  // Handle multi-select for sharedWith
  const handleSharedWithChange = (e) => {
    const options = Array.from(e.target.selectedOptions);
    const selectedIds = options.map((o) => o.value);
    setEditTransaction((prev) => ({
      ...prev,
      sharedWith: selectedIds,
    }));
  };
  // Convert comma-separated emails into Airtable record IDs
  const resolveSharedWithIds = (sharedWithInput) => {
    if (!sharedWithInput) return [];

    const emails = Array.isArray(sharedWithInput)
      ? sharedWithInput
      : sharedWithInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    return emails
      .map((email) =>
        allAccounts.find(
          (acc) => acc.email?.toLowerCase() === email.toLowerCase()
        )
      )
      .filter(Boolean)
      .map((acc) => acc.id);
  };

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
      sharedWith: [],
    });
    setShowForm(true);
  };

  // Update Transaction
  // Open form for editing existing transaction
  const handleEditTransaction = (transaction) => {
    setEditTransaction({
      ...transaction,
      sharedWith: transaction.sharedWith || [],
    });
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
    if (!editTransaction.accountId) {
      return alert('Account is required.');
    }

    try {
      await addTransaction({
        ...editTransaction,
        userId: user.id,
        amount: parseFloat(editTransaction.amount) || 0,
        sharedWith: editTransaction.sharedWith,
      });
      await loadTransactions();
      setEditTransaction(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error saving transaction:', err);
    }
  };

  // Update existing transaction
  // Update existing transaction
  const handleUpdate = async () => {
    if (!editTransaction.accountId) {
      return alert('Account is required.');
    }

    try {
      const { id, ...fields } = editTransaction;
      await updateTransaction(id, {
        ...fields,
        amount: parseFloat(fields.amount) || 0,
        sharedWith: fields.sharedWith,
      });
      await loadTransactions();
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

          <label style={{ marginRight: 10 }}>
            Shared with:
            <select
              multiple
              name="sharedWith"
              value={editTransaction.sharedWith || []}
              onChange={(e) => {
                const selectedIds = Array.from(e.target.selectedOptions).map(
                  (option) => option.value
                );
                setEditTransaction((prev) => ({
                  ...prev,
                  sharedWith: selectedIds,
                }));
              }}
              style={{ marginLeft: 10, width: 250, height: 100 }}
            >
              {allUsers
                .filter((u) => u.id !== user.id) // exclude current user
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email}
                  </option>
                ))}
            </select>
          </label>

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
