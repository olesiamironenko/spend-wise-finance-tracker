export default function TransactionForm({
  editTransaction,
  categories,
  accounts,
  allUsers,
  onChange,
  onSharedWithChange,
  onSave,
  onUpdate,
  onCancel,
}) {
  return (
    <div style={{ marginTop: 20 }}>
      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={editTransaction.amount}
        onChange={onChange}
        style={{ marginRight: 10 }}
      />

      <select
        name="transactionType"
        value={editTransaction.transactionType || ''}
        onChange={onChange}
        style={{ marginRight: 10 }}
      >
        <option value="">Select Type</option>
        <option value="Expense">Expense</option>
        <option value="Income">Income</option>
      </select>

      <select
        name="categoryId"
        value={editTransaction.categoryId || ''}
        onChange={onChange}
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
        onChange={onChange}
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
        onChange={onChange}
        style={{ marginRight: 10 }}
      />

      <label style={{ marginRight: 10 }}>
        <input
          type="checkbox"
          name="shared"
          checked={editTransaction.shared || false}
          onChange={onChange}
        />{' '}
        Shared
      </label>

      <label style={{ marginRight: 10 }}>
        Shared with:
        <select
          multiple
          name="sharedWith"
          value={editTransaction.sharedWith || []}
          onChange={onSharedWithChange}
          style={{ width: 250, marginRight: 10 }}
        >
          {allUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </label>

      <input
        type="text"
        name="description"
        placeholder="Description"
        value={editTransaction.description || ''}
        onChange={onChange}
        style={{ marginRight: 10 }}
      />

      {editTransaction.id ? (
        <button onClick={onUpdate} style={{ marginRight: 10 }}>
          Update Transaction
        </button>
      ) : (
        <button onClick={onSave} style={{ marginRight: 10 }}>
          Save Transaction
        </button>
      )}

      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}
