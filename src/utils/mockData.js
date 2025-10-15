// === USERS ===
export const mockUsers = [
  {
    id: 'user_1',
    name: 'Olesia',
    email: 'olesia@example.com',
    password: '1234',
  },
  {
    id: 'user_2',
    name: 'Alex',
    email: 'alex@example.com',
    password: '1234',
  },
];

// === ACCOUNTS ===
// Each account belongs to one user (ownerId)
export const mockAccounts = [
  {
    id: 'acc_1',
    userId: 'user_1',
    name: 'Checking',
    balance: 2500.0,
    number: '123456789012',
  },
  {
    id: 'acc_2',
    userId: 'user_1',
    name: 'Savings',
    balance: 3200.0,
    number: '987654321098',
  },
  {
    id: 'acc_3',
    userId: 'user_2',
    name: 'Checking',
    balance: 1800.0,
    number: '567890123456',
  },
  {
    id: 'acc_4',
    userId: 'user_2',
    name: 'Travel Fund',
    balance: 900.0,
    number: '967298123456',
  },
];

// === TRANSACTIONS ===
// Shared transactions include participants (array of user IDs)
export const mockTransactions = [
  // ---- Olesia personal ----
  {
    id: 't1',
    userId: 'user_1',
    accountId: 'acc_1',
    amount: 500,
    type: 'income',
    description: 'Freelance payment',
    shared: false,
    date: '2025-10-14',
  },
  {
    id: 't2',
    userId: 'user_1',
    accountId: 'acc_1',
    amount: -80,
    type: 'expense',
    description: 'Groceries',
    shared: false,
    date: '2025-10-13',
  },
  {
    id: 't3',
    userId: 'user_1',
    accountId: 'acc_1',
    amount: -40,
    type: 'expense',
    description: 'Internet',
    shared: false,
    date: '2025-10-12',
  },

  // ---- Alex personal ----
  {
    id: 't6',
    userId: 'user_2',
    accountId: 'acc_2',
    amount: 1200,
    type: 'income',
    description: 'Salary',
    shared: false,
    date: '2025-10-14',
  },
  {
    id: 't7',
    userId: 'user_2',
    accountId: 'acc_2',
    amount: -100,
    type: 'expense',
    description: 'Gym',
    shared: false,
    date: '2025-10-13',
  },

  // ---- Shared expenses ----
  {
    id: 't4',
    userId: 'user_1',
    accountId: 'acc_1',
    amount: -60,
    type: 'expense',
    description: 'Dinner split',
    shared: true,
    sharedWith: 'user_2',
    date: '2025-10-14',
  },
  {
    id: 't5',
    userId: 'user_2',
    accountId: 'acc_2',
    amount: -60,
    type: 'expense',
    description: 'Dinner split',
    shared: true,
    sharedWith: 'user_1',
    date: '2025-10-14',
  },
];
