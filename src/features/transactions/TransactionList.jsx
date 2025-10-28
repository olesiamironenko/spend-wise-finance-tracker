import TransactionItem from './TransactionItem';

export default function TransactionList({
  transactions,
  loading,
  onEdit,
  onDelete,
}) {
  if (loading) return <p>Loading transactions...</p>;
  if (!transactions || transactions.length === 0)
    return <p>No transactions yet.</p>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Amount</th>
          <th>Description</th>
          <th>Account</th>
          <th>Category</th>
          <th>Shared?</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <TransactionItem
            key={t.id}
            transaction={t}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  );
}
