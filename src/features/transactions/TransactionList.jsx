import TransactionListItem from './TransactionListItem';

export default function TransactionList({
  transactions,
  loading,
  onEdit,
  onDelete,
  onView,
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
          <th>Shared?</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <TransactionListItem
            key={t.id}
            transaction={t}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </tbody>
    </table>
  );
}
