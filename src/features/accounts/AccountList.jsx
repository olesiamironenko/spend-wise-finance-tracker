export default function AccountList({ accounts, onEdit, onDelete }) {
  if (!accounts || accounts.length === 0) {
    return <p>You did not add any accounts yet.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
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
            alignItems: 'center',
          }}
        >
          <div>
            <strong>{acc.accountName}</strong> — {acc.accountType}
          </div>
          <div>
            <strong>${acc.balance?.toFixed(2)}</strong>
          </div>
          <div>
            <button onClick={() => onEdit(acc)} style={{ marginRight: 10 }}>
              Edit
            </button>
            <button onClick={() => onDelete(acc)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
