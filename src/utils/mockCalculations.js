import { mockTransactions } from './mockData';
import { getAccountsByUser } from './mockStorage';

// Total balance from accounts
export function getTotalBalance(userId) {
  const accounts = getAccountsByUser(userId);
  return accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
}

// Total income across all transactions
export function getTotalIncome(userId) {
  return mockTransactions
    .filter(
      (t) =>
        (t.userId === userId ||
          (t.shared && t.participants?.some((p) => p.userId === userId))) &&
        t.amount > 0
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

// Total expenses across all transactions
export function getTotalExpenses(userId) {
  return mockTransactions
    .filter(
      (t) =>
        (t.userId === userId ||
          (t.shared && t.participants?.some((p) => p.userId === userId))) &&
        t.amount < 0
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

// Shared totals
export function getSharedTotals(userId) {
  const shared = mockTransactions.filter(
    (t) => t.shared && t.participants?.some((p) => p.userId === userId)
  );

  let totalShared = 0;
  let totalPaid = 0;
  let totalOwed = 0;

  shared.forEach((t) => {
    totalShared += Math.abs(t.amount);

    const participant = t.participants.find((p) => p.userId === userId);
    if (participant) {
      if (participant.amount < 0) totalPaid += Math.abs(participant.amount);
      else totalOwed += Math.abs(participant.amount);
    }
  });

  return { totalShared, totalPaid, totalOwed };
}
