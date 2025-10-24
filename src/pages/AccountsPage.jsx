import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  fetchAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
} from '../utils/airtableAccounts';
import AccountForm from '../features/accounts/AccountForm';

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editAccountId, setEditAccountId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newAccount, setNewAccount] = useState({
    accountName: '',
    accountType: '',
    balance: '',
    currency: 'USD',
  });

  const resetForm = () => {
    setNewAccount({
      accountName: '',
      accountType: '',
      balance: '',
      currency: 'USD',
    });
    setShowForm(false);
    setEditAccountId(null);
  };

  console.log('User from context:', user);

  // Load user accounts
  useEffect(() => {
    if (!user?.id) return;

    console.log('Fetching accounts for user ID:', user.id);

    setLoading(true);
    fetchAccounts(user.id)
      .then((records) => {
        console.log('Mapped accounts ready for UI:', records);
        setAccounts(records);
      })
      .catch((err) => {
        console.error('Error fetching accounts:', err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Add Account
  const handleAddAccount = async () => {
    console.log('Creating account with:', {
      userRecordId: user?.id,
      type: newAccount.accountType,
    });

    if (!user?.id) {
      alert('Missing user Airtable ID!');
      return;
    }

    try {
      await addAccount({
        accountName: newAccount.accountName,
        accountType: newAccount.accountType,
        balance: parseFloat(newAccount.balance) || 0,
        currency: newAccount.currency,
        userRecordId: user.id,
      });

      const refreshed = await fetchAccounts(user.id);
      setAccounts(refreshed);
      resetForm();
    } catch (err) {
      console.error('Error creating account:', err);
    }
  };

  // Edit Account
  const handleEdit = (acc) => {
    setNewAccount({
      accountName: acc.accountName || '',
      accountType: acc.accountType || '',
      balance: acc.balance || '',
      currency: acc.currency || 'USD',
    });
    setEditAccountId(acc.id);
    setShowForm(true);
  };

  // Update Account
  const handleUpdateAccount = async () => {
    try {
      await updateAccount(editAccountId, {
        accountName: newAccount.accountName,
        accountType: newAccount.accountType,
        balance: parseFloat(newAccount.balance) || 0,
        currency: newAccount.currency,
      });

      const refreshed = await fetchAccounts(user.id);
      setAccounts(refreshed);
      resetForm();
    } catch (err) {
      console.error('Error updating account:', err);
    }
  };

  // Delete Account
  const handleDelete = async (acc) => {
    if (!window.confirm(`Delete account "${acc.accountName}"?`)) return;
    try {
      await deleteAccount(acc.id);
      setAccounts((prev) => prev.filter((a) => a.id !== acc.id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>💼 Accounts</h2>

      {loading && <p>Loading accounts...</p>}

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <p>You did not add any accounts yet.</p>
      ) : (
        <ul>
          {accounts.map((acc) => (
            <li
              key={acc.id}
              style={{
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: 6,
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong>{acc.accountName}</strong> — {acc.accountType}
              </div>
              <div>
                <strong>${acc.balance?.toFixed(2)}</strong>
              </div>
              <div>
                <button
                  onClick={() => handleEdit(acc)}
                  style={{ marginRight: 10 }}
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(acc)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add / Edit Form */}
      {!showForm && (
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          ➕ Add New Account
        </button>
      )}

      {showForm && (
        <AccountForm
          newAccount={newAccount}
          setNewAccount={setNewAccount}
          onSubmit={editAccountId ? handleUpdateAccount : handleAddAccount}
          onCancel={resetForm}
          isEditing={!!editAccountId}
        />
      )}
    </div>
  );
}
