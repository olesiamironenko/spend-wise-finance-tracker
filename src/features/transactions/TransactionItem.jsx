export default function TransactionItem({ transaction, onEdit, onDelete }) {
  return (
    <tr>
      <td>{transaction.date}</td>
      <td style={{ color: transaction.amount >= 0 ? 'green' : 'red' }}>
        ${transaction.amount.toFixed(2)}
      </td>
      <td>{transaction.description}</td>
      <td>{transaction.accountName || '—'}</td>
      <td>{transaction.categoryName || '—'}</td>
      <td>{transaction.sharedWith?.length > 0 ? 'Yes' : 'No'}</td>
      <td>
        <button onClick={() => onEdit(transaction)}>Edit</button>
        <button
          onClick={() => onDelete(transaction)}
          style={{ marginLeft: 10 }}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
