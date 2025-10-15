import { mockTransactions } from './mockStorage';

// Calculate total personal balance for a user
export function getPersonalBalance(userId) {
  const accounts = getAccountsByUser(userId);
  return accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
}

// Calculate net of transactions only (for analytics)
export function getNetFromTransactions(userId) {
  const userTransactions = mockTransactions.filter(
    (t) =>
      t.userId === userId ||
      (t.shared && t.participants?.some((p) => p.userId === userId))
  );

  return userTransactions.reduce((sum, t) => {
    // For shared transactions, adjust based on who paid / who owes
    if (t.shared && t.participants) {
      const userShare = t.participants.find((p) => p.userId === userId);

      // If userShare.amount is positive, user owes (subtract)
      // If userShare.amount is negative, user is owed (add)
      return sum - (userShare?.amount ?? 0);
    }

    // Regular personal transaction
    return sum + t.amount;
  }, 0);
}

export const getPersonalExpenses = (userId) => {
  return mockTransactions
    .filter((t) => t.userId === userId && !t.shared && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

// Calculate shared balances: owes, owedTo, net
export function getSharedBalance(userId) {
  const sharedTxns = getSharedTransactions(userId);

  let totalOwes = 0;
  let totalOwedTo = 0;

  sharedTxns.forEach((txn) => {
    const userShare =
      txn.amount * txn.participants.find((p) => p.userId === userId)?.share;
    const totalAmount = txn.amount;

    // If the user paid, others owe them
    if (txn.payer === userId) {
      const othersOwe = txn.participants
        .filter((p) => p.userId !== userId)
        .reduce((sum, p) => sum + totalAmount * p.share, 0);
      totalOwedTo += Math.abs(othersOwe);
    } else {
      // User owes part of a shared transaction someone else paid
      totalOwes += Math.abs(userShare);
    }
  });

  return {
    owes: parseFloat(totalOwes.toFixed(2)),
    owedTo: parseFloat(totalOwedTo.toFixed(2)),
    net: parseFloat((totalOwedTo - totalOwes).toFixed(2)),
  };
}

export const getRecentTransactions = (userId, limit = 5) => {
  const transactions = mockTransactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return transactions.slice(0, limit);
};
