import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchAccounts, addAccount } from '../utils/airtableAccounts'; // fetch accounts by user

function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Load user accounts
  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);
    fetchAccounts(user.id)
      .then(setAccounts)
      .finally(() => setLoading(false));
  }, [user]);

  // Handle Add Account
  const handleAddAccount = () => {
    if (!newAccountName) return;

    addAccount(user.id, {
      name: newAccountName,
      number: newAccountNumber,
      balance: parseFloat(newAccountBalance) || 0,
      currency: 'USD',
    })
      .then((record) => {
        setAccounts((prev) => [...prev, { id: record.id, ...record.fields }]);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setNewAccountName('');
        setNewAccountBalance('');
        setNewAccountNumber('');
        setShowForm(false);
      });
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>💼 Accounts</h2>

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
              <span>{acc.name}</span>
              <strong>${acc.balance.toFixed(2)}</strong>
            </li>
          ))}
        </ul>
      )}

      {/* Toggle Add Account Form */}
      <button
        onClick={() => setShowForm((prev) => !prev)}
        style={{ marginBottom: 20 }}
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
          <button onClick={handleAddAccount}>Save</button>
        </div>
      )}
    </div>
  );
}

export default AccountsPage;
