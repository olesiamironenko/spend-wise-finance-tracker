import { fetchTransactions } from './airtableTransactions';
import { fetchAccounts } from './airtableAccounts'; // similar helper to get accounts from Airtable

// Total balance from accounts
export async function getTotalBalance(userId) {
  const accounts = await fetchAccounts(userId);
  return accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
}

// Total income
export async function getTotalIncome(userId) {
  const transactions = await fetchTransactions(userId);
  return transactions
    .filter(
      (t) =>
        (t.userId === userId ||
          (t.shared && t.sharedWith?.some((p) => p.userId === userId))) &&
        t.amount > 0
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

// Total expenses
export async function getTotalExpenses(userId) {
  const transactions = await fetchTransactions(userId);
  return transactions
    .filter(
      (t) =>
        (t.userId === userId ||
          (t.shared && t.sharedWith?.some((p) => p.userId === userId))) &&
        t.amount < 0
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

export async function getSharedTotals(userRecId) {
  const transactions = await fetchTransactions(userRecId);

  // Filter transactions that are shared and involve the user
  const shared = transactions.filter(
    (t) =>
      t.shared &&
      ((Array.isArray(t.sharedWith) &&
        t.sharedWith.some((p) => p.userId === userRecId)) ||
        t.userId === userRecId)
  );

  let totalShared = 0;
  let totalPaid = 0;
  let totalOwed = 0;

  shared.forEach((t) => {
    const perUserAmount = Math.abs(t.amount) / (t.sharedWith?.length || 1);
    totalShared += Math.abs(t.amount);

    if (t.userId === userRecId) {
      // The current user owns this transaction → they paid for it
      totalPaid += perUserAmount * (t.sharedWith?.length || 1);
    } else {
      // The user is one of the shared participants → they owe their share
      totalOwed += perUserAmount;
    }
  });

  return { totalShared, totalPaid, totalOwed };
}
