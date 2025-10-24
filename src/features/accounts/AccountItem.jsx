export default function AccountItem({ account, onEdit, onDelete }) {
  return (
    <li
      style={{
        padding: '12px 16px',
        border: '1px solid #ddd',
        borderRadius: 6,
        marginBottom: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <strong>{account.accountName}</strong> — {account.accountType}
      </div>
      <div>
        <strong>${account.balance?.toFixed(2)}</strong>
      </div>
      <div>
        <button onClick={() => onEdit(account)} style={{ marginRight: 10 }}>
          Edit
        </button>
        <button onClick={() => onDelete(account)}>Delete</button>
      </div>
    </li>
  );
}
