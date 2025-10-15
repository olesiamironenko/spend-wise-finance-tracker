import { mockUsers, mockAccounts, mockTransactions } from './mockData';

// Seed mock data once
export function seedMocks() {
  if (!localStorage.getItem('mock_users')) {
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem('mock_accounts')) {
    localStorage.setItem('mock_accounts', JSON.stringify(mockAccounts));
  }
  if (!localStorage.getItem('mock_transactions')) {
    localStorage.setItem('mock_transactions', JSON.stringify(mockTransactions));
  }
}

// Clear mock data (optional)
export function clearMocks() {
  ['mock_users', 'mock_accounts', 'mock_transactions'].forEach((key) =>
    localStorage.removeItem(key)
  );
}

// --- Helper functions ---

export function getUsers() {
  const raw = localStorage.getItem('mock_users');
  return raw ? JSON.parse(raw) : [];
}

export function getAccountsByUser(userId) {
  const raw = localStorage.getItem('mock_accounts');
  const all = raw ? JSON.parse(raw) : [];
  return all.filter((acc) => acc.userId === userId);
}

export function getTransactionsForAccount(accountId) {
  const raw = localStorage.getItem('mock_transactions');
  const all = raw ? JSON.parse(raw) : [];
  return all.filter((t) => t.accountId === accountId);
}

export function getSharedTransactions(userId) {
  const raw = localStorage.getItem('mock_transactions');
  const all = raw ? JSON.parse(raw) : [];
  return all.filter(
    (t) =>
      t.type === 'shared' && t.participants?.some((p) => p.userId === userId)
  );
}
