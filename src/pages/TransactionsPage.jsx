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
import TransactionForm from '../features/transactions/TransactionForm';

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
        <TransactionForm
          editTransaction={editTransaction}
          categories={categories}
          accounts={accounts}
          allUsers={allUsers}
          onChange={handleInputChange}
          onSharedWithChange={handleSharedWithChange}
          onSave={handleSave}
          onUpdate={handleUpdate}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
