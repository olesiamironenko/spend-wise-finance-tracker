import { useState } from 'react';

export default function AccountForm({
  newAccount,
  setNewAccount,
  onSubmit,
  onCancel,
  isEditing = false,
}) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!newAccount.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    }
    if (!newAccount.accountType) {
      newErrors.accountType = 'Please select an account type';
    }
    if (newAccount.balance === '') {
      newErrors.balance = 'Starting balance is required';
    } else if (isNaN(newAccount.balance)) {
      newErrors.balance = 'Balance must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit();
    }
  };

  return (
    <div
      style={{
        marginTop: 20,
        padding: 16,
        border: '1px solid #ccc',
        borderRadius: 8,
        maxWidth: 400,
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Account Name"
          value={newAccount.accountName}
          onChange={(e) =>
            setNewAccount({ ...newAccount, accountName: e.target.value })
          }
          style={{ width: '100%', padding: 8 }}
        />
        {errors.accountName && (
          <small style={{ color: 'red' }}>{errors.accountName}</small>
        )}
      </div>

      <div style={{ marginBottom: 10 }}>
        <select
          value={newAccount.accountType}
          onChange={(e) =>
            setNewAccount({ ...newAccount, accountType: e.target.value })
          }
          style={{ width: '100%', padding: 8 }}
        >
          <option value="">Select Type</option>
          <option value="Checking">Checking</option>
          <option value="Savings">Savings</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Debit Card">Debit Card</option>
        </select>
        {errors.accountType && (
          <small style={{ color: 'red' }}>{errors.accountType}</small>
        )}
      </div>

      <div style={{ marginBottom: 10 }}>
        <input
          type="number"
          placeholder="Starting Balance"
          value={newAccount.balance}
          onChange={(e) =>
            setNewAccount({ ...newAccount, balance: e.target.value })
          }
          style={{ width: '100%', padding: 8 }}
        />
        {errors.balance && (
          <small style={{ color: 'red' }}>{errors.balance}</small>
        )}
      </div>

      <div>
        <button
          onClick={handleSubmit}
          style={{ marginRight: 10, padding: '6px 12px' }}
        >
          {isEditing ? 'Update Account' : 'Save Account'}
        </button>
        <button onClick={onCancel} style={{ padding: '6px 12px' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
