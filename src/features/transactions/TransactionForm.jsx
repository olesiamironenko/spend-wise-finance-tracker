import NewCategoryForm from '../categories/NewCategoryForm';

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
  handleNewCategorySave,
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

      {/* --- Parent Category --- */}
      <select
        name="parentCategoryId"
        value={editTransaction.parentCategoryId || ''}
        onChange={onChange}
        style={{ marginRight: 10 }}
      >
        <option value="">Select Parent Category</option>
        {categories
          .filter((c) => !c.parentId) // only top-level categories
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        <option value="__new__parent__">➕ Add New Parent Category</option>
      </select>

      {/* Inline new parent category form */}
      {editTransaction.parentCategoryId === '__new__parent__' && (
        <NewCategoryForm
          onSave={handleNewCategorySave}
          onCancel={() =>
            onChange({
              target: { name: 'parentCategoryId', value: '' },
            })
          }
        />
      )}

      <select
        name="categoryId"
        value={editTransaction.categoryId || ''}
        onChange={onChange}
        style={{ marginRight: 10 }}
      >
        <option value="">Select Child Category</option>

        {/* Only show categories whose parentId matches the selected parent */}
        {categories
          .filter((c) => c.parentId === editTransaction.parentCategoryId)
          .map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}

        <option value="__new__child__">➕ Add New Child Category</option>
      </select>

      {editTransaction.categoryId === '__new__child__' && (
        <NewCategoryForm
          parentCategoryId={editTransaction.parentCategoryId}
          onSave={handleNewCategorySave}
          onCancel={() =>
            onChange({ target: { name: 'categoryId', value: '' } })
          }
        />
      )}

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
        />
        Shared
      </label>
      {editTransaction.shared && (
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
      )}
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
