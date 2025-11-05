function TransactionCard({ transaction, categories, allUsers }) {
  console.log('Transaction:', transaction);
  console.log('Account:', transaction.account);
  console.log('Account:', transaction.categoryId);

  const sharedUsers = allUsers.filter((u) =>
    transaction.sharedWith?.includes(u.id)
  );

  const category = categories.find((c) => c.id === transaction.categoryId);

  // Determine parent vs child
  let parentCategory = null;
  let childCategory = null;

  if (category) {
    if (category.parentId) {
      parentCategory = categories.find(
        (c) => c.id === category.parentId || c.recordId === category.parentId
      );
      childCategory = category;
    } else {
      parentCategory = category;
    }
  }

  return (
    <div className="transaction-card">
      <div className="transaction-header">
        <h3>
          {parentCategory && childCategory
            ? `${parentCategory.name} › ${childCategory.name}`
            : parentCategory?.name || 'Uncategorized'}
        </h3>
        <span className={`type ${transaction.transactionType.toLowerCase()}`}>
          {transaction.transactionType}
        </span>
      </div>

      <div className="transaction-body">
        <p>
          <strong>Amount:</strong> ${transaction.amount.toFixed(2)}
        </p>
        <p>
          <strong>Account:</strong> {transaction.accountName}
        </p>
        <p>
          <strong>Date:</strong>{' '}
          {new Date(transaction.date).toLocaleDateString()}
        </p>
        {transaction.description && (
          <p>
            <strong>Description:</strong> {transaction.description}
          </p>
        )}
        {transaction.shared && (
          <p>
            <strong>Shared with:</strong>{' '}
            {sharedUsers.length > 0
              ? sharedUsers.map((u) => u.name || u.email).join(', ')
              : '—'}
          </p>
        )}
      </div>
    </div>
  );
}

export default TransactionCard;
