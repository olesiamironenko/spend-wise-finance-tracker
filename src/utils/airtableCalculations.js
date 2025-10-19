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

// Shared totals
export async function getSharedTotals(userId) {
  const transactions = await fetchTransactions(userId);
  const shared = transactions.filter(
    (t) => t.shared && t.sharedWith?.some((p) => p.userId === userId)
  );

  let totalShared = 0;
  let totalPaid = 0;
  let totalOwed = 0;

  shared.forEach((t) => {
    totalShared += Math.abs(t.amount);

    const participant = t.sharedWith.find((p) => p.userId === userId);
    if (participant) {
      if (participant.amount < 0) totalPaid += Math.abs(participant.amount);
      else totalOwed += Math.abs(participant.amount);
    }
  });

  return { totalShared, totalPaid, totalOwed };
}
