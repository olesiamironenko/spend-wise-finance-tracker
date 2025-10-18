import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  fetchAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
} from '../utils/airtableAccounts';

function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [editAccountId, setEditAccountId] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setNewAccountName('');
    setNewAccountNumber('');
    setNewAccountBalance('');
    setShowForm(false);
    setEditAccountId(null);
  };

  // Load user accounts (fetch accounts)
  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);
    fetchAccounts(user.id)
      .then((records) => {
        // Map Airtable fields to frontend-friendly camelCase
        const mappedAccounts = records.map((r) => ({
          id: r.id, // Airtable record ID
          accountId: r.fields.accountID, // map Airtable field to camelCase
          ...r.fields,
        }));
        setAccounts(mappedAccounts);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Handle Add Account
  const handleAddAccount = async () => {
    if (!newAccountName) return;

    try {
      const record = await addAccount(user.id, {
        name: newAccountName,
        number: newAccountNumber,
        balance: parseFloat(newAccountBalance) || 0,
        currency: 'USD',
      });

      setAccounts((prev) => [
        ...prev,
        {
          id: record.id,
          accountId: record.fields.accountID,
          ...record.fields,
        },
      ]);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  // Open form for edditing the account
  const handleEdit = (acc) => {
    setNewAccountName(acc.name);
    setNewAccountNumber(acc.number);
    setNewAccountBalance(acc.balance);
    setEditAccountId(acc.accountId); // mark this account for updating
    setShowForm(true); // show the form
  };

  // Handle Update Account
  const handleUpdateAccount = async () => {
    if (!newAccountName || !editAccountId) return;

    const accountToUpdate = accounts.find(
      (acc) => acc.accountId === editAccountId
    );
    if (!accountToUpdate) return;

    try {
      const updated = await updateAccount(accountToUpdate.id, {
        name: newAccountName,
        number: newAccountNumber,
        balance: parseFloat(newAccountBalance) || 0,
      });

      const updatedAcc = {
        id: updated.id,
        accountId: updated.fields.accountID, // map Airtable field
        ...updated.fields,
      };

      setAccounts((prev) =>
        prev.map((acc) => (acc.accountId === editAccountId ? updatedAcc : acc))
      );
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Account
  const handleDelete = async (acc) => {
    if (!window.confirm(`Delete account "${acc.name}"?`)) return;
    try {
      await deleteAccount(acc.id); // call Airtable helper
      setAccounts((prev) => prev.filter((a) => a.accountId !== acc.accountId));
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
              key={acc.accountId}
              style={{
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: 6,
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{acc.name}</span>
              <strong>${acc.balance.toFixed(2)}</strong>

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

      {/* Toggle Add Account Form */}
      <button
        onClick={() => {
          setShowForm((prev) => !prev);
          if (!showForm) resetForm(); // reset when opening
        }}
      >
        {showForm ? 'Cancel' : 'Add New Account'}
      </button>

      {showForm && (
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Account Name"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            style={{ marginRight: 10 }}
          />
          <input
            type="text"
            placeholder="Account Number"
            value={newAccountNumber}
            onChange={(e) => setNewAccountNumber(e.target.value)}
            style={{ marginRight: 10, width: 150 }}
          />
          <input
            type="number"
            placeholder="Starting Balance"
            value={newAccountBalance}
            onChange={(e) => setNewAccountBalance(e.target.value)}
            style={{ marginRight: 10, width: 120 }}
          />
          <button
            onClick={editAccountId ? handleUpdateAccount : handleAddAccount}
          >
            {editAccountId ? 'Update' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}

export default AccountsPage;
