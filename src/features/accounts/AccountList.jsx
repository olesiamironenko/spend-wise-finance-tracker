import AccountItem from './AccountItem';

export default function AccountList({ accounts, onEdit, onDelete }) {
  if (!accounts || accounts.length === 0) {
    return <p>You did not add any accounts yet.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {accounts.map((acc) => (
        <AccountItem
          key={acc.id}
          account={acc}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
