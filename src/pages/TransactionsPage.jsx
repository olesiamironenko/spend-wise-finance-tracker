import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  normalizeTransactionAmount,
} from '../utils/airtableTransactions';
import { fetchAccounts } from '../utils/airtableAccounts'; // helper to get user's account IDs for form dropdown
import { fetchCategories, addCategory } from '../utils/airtableCategories'; // helper to get user's categories IDs for form dropdown
import { fetchUsers } from '../utils/airtableUsers';
import TransactionForm from '../features/transactions/TransactionForm';
import TransactionList from '../features/transactions/TransactionList';
import TransactionCard from '../features/transactions/TransactionCard';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null); // single state for create/edit
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]); // user accounts list
  const [allUsers, setAllUsers] = useState([]); // all users for sharedWith dropdown
  const [selectedTransaction, setSelectedTransaction] = useState(null); // for view details

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
  const loadTransactions = useCallback(async () => {
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
  }, [user?.id]);

  // Load Transactions
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const loadCategories = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await fetchCategories(user.id);
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Handle multi-select for sharedWith
  const handleSharedWithChange = (e) => {
    const options = Array.from(e.target.selectedOptions);
    const selectedIds = options.map((o) => o.value);
    setEditTransaction((prev) => ({
      ...prev,
      sharedWith: selectedIds,
    }));
  };

  // Open form for new transaction
  const handleAddTransaction = useCallback(() => {
    setEditTransaction({
      amount: '',
      transactionType: '',
      accountId: '',
      categoryId: '',
      newCategoryName: '',
      newCategoryParentId: '',
      date: '',
      description: '',
      shared: false,
      sharedWith: [],
    });
    setShowForm(true);
  }, []);

  // Update Transaction
  // Open form for editing existing transaction
  const handleEditTransaction = useCallback((transaction) => {
    setEditTransaction({
      ...transaction,
      sharedWith: transaction.sharedWith || [],
    });
    setShowForm(true);
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setEditTransaction((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'shared' && !checked ? { sharedWith: [] } : {}),
    }));
  }, []);

  const handleNewCategorySave = useCallback(
    async ({ name, parentId }) => {
      try {
        const newCategory = await addCategory({
          name,
          userId: user.id,
          parentId: parentId || null,
        });

        await loadCategories();

        if (parentId) {
          setEditTransaction((prev) => ({
            ...prev,
            categoryId: newCategory.id,
          }));
        } else {
          setEditTransaction((prev) => ({
            ...prev,
            parentCategoryId: newCategory.id,
          }));
        }
      } catch (err) {
        console.error('Error saving category:', err);
      }
    },
    [user?.id, loadCategories]
  );

  // Save new transaction
  const handleSave = useCallback(async () => {
    if (!editTransaction.accountId) {
      return alert('Account is required.');
    }

    try {
      let parentCategoryId = editTransaction.parentCategoryId;
      let categoryId = editTransaction.categoryId;

      // --- Step 1: Create parent category if new ---
      if (parentCategoryId === '__new__parent__') {
        if (!editTransaction.newParentCategoryName?.trim()) {
          alert('Please enter a parent category name');
          return;
        }

        const newParent = await addCategory({
          name: editTransaction.newParentCategoryName.trim(),
          userId: user.id,
          parentId: null,
        });

        parentCategoryId = newParent.id;
      }

      // --- Step 2: Create child category if new ---
      if (categoryId === '__new__child__') {
        if (!editTransaction.newChildCategoryName?.trim()) {
          alert('Please enter a child category name');
          return;
        }

        const newChild = await addCategory({
          name: editTransaction.newChildCategoryName.trim(),
          userId: user.id,
          parentId: parentCategoryId,
        });

        categoryId = newChild.id;
      }

      // --- Step 3: Save transaction ---
      await addTransaction({
        ...editTransaction,
        userId: user.id,
        categoryId,
        amount: normalizeTransactionAmount(
          editTransaction.transactionType,
          editTransaction.amount
        ),
        sharedWith: editTransaction.sharedWith,
      });

      await loadTransactions();
      setEditTransaction(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error saving transaction:', err);
    }
  }, [editTransaction, user?.id, loadTransactions]);

  // Update existing transaction
  const handleUpdate = useCallback(async () => {
    if (!editTransaction.accountId) {
      return alert('Account is required.');
    }

    try {
      const { id, ...fields } = editTransaction;
      await updateTransaction(id, {
        ...fields,
        amount: normalizeTransactionAmount(
          fields.transactionType,
          fields.amount
        ),
        sharedWith: fields.sharedWith,
      });
      await loadTransactions();
      setEditTransaction(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error updating transaction:', err);
    }
  }, [editTransaction, loadTransactions]);

  // Delete transaction
  const handleDelete = useCallback(async (transaction) => {
    if (!window.confirm(`Delete transaction "${transaction.description}"?`))
      return;
    try {
      await deleteTransaction(transaction.id);
      setTransactions((prev) => prev.filter((t) => t.id !== transaction.id));
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🧾 Transactions</h2>
      {loading && <p>Loading transactions...</p>}
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <TransactionList
          transactions={transactions}
          loading={loading}
          onEdit={handleEditTransaction}
          onDelete={handleDelete}
          categories={categories}
          handleNewCategorySave={handleNewCategorySave}
          onView={(transaction) => setSelectedTransaction(transaction)}
        />
      )}

      {selectedTransaction && (
        <div style={{ marginTop: 20 }}>
          <TransactionCard
            transaction={selectedTransaction}
            categories={categories}
            accounts={accounts}
            allUsers={allUsers}
          />
          <button onClick={() => setSelectedTransaction(null)}>Close</button>
        </div>
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
          handleNewCategorySave={handleNewCategorySave}
        />
      )}
    </div>
  );
}
