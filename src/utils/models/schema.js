// Reusable validators
const isValidDate = (value) =>
  !value || !isNaN(Date.parse(value)) || 'Invalid date format';

// Reusable fields definition
const timestamps = {
  createdAt: { type: 'string', required: 'false', validate: isValidDate },
  updatedAt: { type: 'string', required: 'false', validate: isValidDate },
};

// Main schema
export const schemas = {
  users: {
    userId: { type: 'string', required: true }, // Airtable record ID (primary key)

    firstName: {
      type: 'string',
      required: false,
      maxLength: 50,
      pattern: /^[A-Za-z]+$/, // only letters
    },

    lastName: {
      type: 'string',
      required: false,
      maxLength: 50,
      pattern: /^[A-Za-z]+$/, // only letters
    },

    avatar: {
      type: 'string',
      required: false, // can be a URL or Airtable attachment reference
    },

    email: {
      type: 'string',
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // simple email validation
    },

    password: {
      type: 'string',
      required: true,
      minLength: 6, // enforce minimal password length
    },

    role: {
      type: 'string',
      required: false,
      enum: ['user', 'admin'],
      default: 'user',
    },

    lastLogin: {
      type: 'string', // can store as ISO date string
      required: false,
      validate: isValidDate,
    },

    ...timestamps,
  },

  accounts: {
    accountId: { type: 'string', required: false, readonly: true }, // Airtable auto-generates record ID
    userId: { type: 'string', required: true }, // foreign key to Users
    accountName: { type: 'string', required: true, maxLength: 50 },
    accountNumber: { type: 'string', required: true, pattern: /^[0-9]{16}$/ },
    accountType: {
      type: 'string',
      required: true,
      enum: ['Checking', 'Savings', 'Credit Card', 'Cash'],
    },
    accountCurrency: {
      type: 'string',
      required: true,
      enum: ['USD', 'EUR', 'GBP', 'CAD'],
    },
    beginningBalance: {
      type: 'string',
      required: true,
      pattern: /^-?\d{1,3}(,\d{3})*(\.\d+)?$|^-?\d+(\.\d+)?$/, // e.g. "-1,234.56" or "100.50"
    },
    currentBalance: { type: 'number', required: false, readonly: true }, // calculated, not editable

    ...timestamps,
  },

  transactions: {
    transactionId: { type: 'string', required: false, readonly: true }, // Airtable record ID
    accountId: { type: 'string', required: true }, // foreign key to Accounts
    amount: {
      type: 'string',
      required: true,
      pattern: /^-?\d{1,3}(,\d{3})*(\.\d+)?$|^-?\d+(\.\d+)?$/, // accepts "-1,234.56" or "1234.56"
    },
    transactionType: {
      type: 'string',
      required: true,
      enum: ['Expense', 'Income', 'Charge', 'Payment'],
    },
    categoryId: { type: 'string', required: true }, // foreign key to Categories
    shared: { type: 'boolean', required: false, default: false },
    sharedWith: {
      type: 'string',
      requiredIf: (data) => data.shared === true, // only required if shared
      pattern: /^([a-zA-Z0-9_-]+)(,\s*[a-zA-Z0-9_-]+)*$/, // comma-separated user IDs
    },
    date: {
      type: 'string', // store as ISO string in Airtable
      required: true,
      notFuture: true, // custom rule below
    },
    description: { type: 'string', required: true, maxLength: 250 },
    notes: { type: 'string', required: false, maxLength: 250 },
    ...timestamps,
  },

  categories: {
    categoryId: { type: 'string', required: true }, // Airtable record ID (primary key)
    userId: { type: 'string', required: true }, // belongs to Users table
    categoryName: {
      type: 'string',
      required: true,
      maxLength: 50,
    },
    parentId: {
      type: 'string',
      required: false, // optional, can be empty
      validate: (value, record) => {
        if (value && value === record.categoryId) {
          return 'parentId cannot be the same as categoryId';
        }
        return true;
      },
    },
    ...timestamps,
  },
};
