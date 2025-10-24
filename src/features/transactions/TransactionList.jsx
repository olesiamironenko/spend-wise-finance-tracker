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
          <tr key={t.id}>
            <td>{t.date}</td>
            <td style={{ color: t.amount >= 0 ? 'green' : 'red' }}>
              ${t.amount.toFixed(2)}
            </td>
            <td>{t.description}</td>
            <td>{t.accountName || '—'}</td>
            <td>{t.categoryName || '—'}</td>
            <td>{t.sharedWith?.length > 0 ? 'Yes' : 'No'}</td>
            <td>
              <button onClick={() => onEdit(t)}>Edit</button>
              <button onClick={() => onDelete(t)} style={{ marginLeft: 10 }}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
