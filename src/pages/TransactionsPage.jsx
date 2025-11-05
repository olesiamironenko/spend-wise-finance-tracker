import { useEffect, useState, useCallback } from 'react';
import Papa from 'papaparse';
import { useAuth } from '../hooks/useAuth';
import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  normalizeTransactionAmount,
} from '../utils/airtableTransactions';
import { fetchAccounts, addAccount } from '../utils/airtableAccounts'; // helper to get user's account IDs for form dropdown
import { fetchCategories, addCategory } from '../utils/airtableCategories'; // helper to get user's categories IDs for form dropdown
import { fetchUsers } from '../utils/airtableUsers';
import TransactionForm from '../features/transactions/TransactionForm';
import TransactionList from '../features/transactions/TransactionList';
import TransactionCard from '../features/transactions/TransactionCard';
import AccountForm from '../features/accounts/AccountForm';

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

  const [newAccount, setNewAccount] = useState({
    accountName: '',
    accountType: '',
    balance: '',
  });
  const [pendingFile, setPendingFile] = useState(null);

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [prefilledAccountName, setPrefilledAccountName] = useState('');

  // Fetch categories
  useEffect(() => {
    if (!user?.id) return;
    fetchCategories(user.id).then(setCategories).catch(console.error);
  }, [user]);

  // Fetch accounts
  const loadAccounts = useCallback(async () => {
    if (!user?.id) return;
    const fetched = await fetchAccounts(user.id);
    setAccounts(fetched);
  }, [user?.id]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

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

  const handleCSVUpload = useCallback(
    async (e, accountsList) => {
      const file = e.target.files[0];
      if (!file) return;

      // Extract account name from file name
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, ''); // remove extension
      const match = fileNameWithoutExt.match(/([^ ]+)$/); // keep only last word of the file name
      const accountNameFromFile = match ? match[1].trim() : fileNameWithoutExt;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const rows = results.data;
          console.log('Parsed CSV rows:', rows);

          if (!user?.id) {
            alert('Please log in first.');
            return;
          }

          // Build account/category lookup maps
          const freshAccounts = accountsList || (await fetchAccounts(user.id)); // fetch latest directly
          const categoryMap = Object.fromEntries(
            categories.map((c) => [c.name, c.id])
          );

          // Find account ID by file name, create new if does not exist
          const accountObj = freshAccounts.find(
            (a) => a.accountName === accountNameFromFile
          );

          if (!accountObj) {
            // Trigger AccounForm
            setPrefilledAccountName(accountNameFromFile);
            setShowAccountForm(true);
            setPendingFile(file); // save file for later reupload
            alert(
              `Account "${accountNameFromFile}" not found. Please create it first.`
            );
            return;
          }

          const accountId = accountObj.id;

          let createdCount = 0;

          for (const row of rows) {
            try {
              const categoryId = categoryMap[row.categoryName] || null;

              // Ensure amount is a number
              let amountStr = String(row.amount).trim();

              // Handle parentheses as negative values
              const isNegative =
                amountStr.includes('(') && amountStr.includes(')');
              amountStr = amountStr.replace(/[^0-9.-]+/g, '');

              let amountRaw = parseFloat(amountStr);
              if (isNegative) amountRaw = -Math.abs(amountRaw);

              if (isNaN(amountRaw)) {
                console.warn('Skipping row with invalid amount:', row);
                continue;
              }

              // Determine type based on sign
              let transactionType;
              if (
                ['Checking', 'Savings', 'Cash'].includes(accountObj.accountType)
              ) {
                transactionType = amountRaw < 0 ? 'Expense' : 'Income';
              } else if (accountObj.accountType === 'Credit Card') {
                transactionType = amountRaw < 0 ? 'Payment' : 'Charge';
              } else {
                transactionType = 'Expense';
              }

              // Normalize sign before saving
              let finalAmount = Math.abs(amountRaw);
              if (
                transactionType === 'Expense' ||
                transactionType === 'Payment'
              ) {
                finalAmount = -finalAmount;
              }

              const transactionData = {
                userId: user.id,
                accountId,
                categoryId,
                amount: normalizeTransactionAmount(
                  transactionType,
                  Math.abs(amountRaw)
                ),
                transactionType,
                date: row.date,
                description: row.description || '',
                shared: row.shared?.toLowerCase() === 'true',
                sharedWith: row.sharedWith
                  ? row.sharedWith.split(',').map((s) => s.trim())
                  : [],
              };

              await addTransaction(transactionData);
              createdCount++;
            } catch (err) {
              console.error('Error importing row:', row, err);
            }
          }

          alert(`Imported ${createdCount} transactions from CSV.`);
          await loadTransactions();

          // Clear file input after processing
          e.target.value = '';
        },
        error: (err) => {
          console.error('Error parsing CSV:', err);
          alert('Failed to parse CSV file.');
        },
      });
    },
    [user?.id, categories, loadTransactions]
  );

  // Handle account form submission
  const handleAccountSubmit = async () => {
    try {
      const newRec = await addAccount({
        userId: user.id,
        accountName: newAccount.accountName,
        accountType: newAccount.accountType,
        balance: newAccount.balance === '' ? 0 : parseFloat(newAccount.balance),
      });

      await loadAccounts();
      setShowAccountForm(false);

      const createdName = newRec.fields?.accountName || newRec.accountName;
      console.log('Account created:', createdName);
      alert(`Account "${createdName}" created!`);

      // Auto-retry pending CSV upload
      if (pendingFile) {
        const freshAccounts = await fetchAccounts(user.id);
        setTimeout(() => {
          console.log('Retrying CSV upload for:', createdName);
          handleCSVUpload({ target: { files: [pendingFile] } }, freshAccounts);
          setPendingFile(null);
        }, 500);
      }
    } catch (err) {
      console.error('Error creating account:', err);
    }
  };

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

      {/* Add Transaction and CSV Upload */}
      {!showForm && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '20px',
          }}
        >
          <button onClick={handleAddTransaction}>+ Add New Transaction</button>
          <label
            style={{
              display: 'inline-block',
              background: '#4f46e5',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
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

      {/* Account Form Modal */}
      {showAccountForm && (
        <div style={{ marginTop: 20 }}>
          <h3>Create New Account</h3>
          <AccountForm
            newAccount={newAccount}
            setNewAccount={setNewAccount}
            onSubmit={handleAccountSubmit}
            onCancel={() => {
              setShowAccountForm(false);
              setPendingFile(null);
            }}
            defaultName={prefilledAccountName}
          />
        </div>
      )}
    </div>
  );
}
