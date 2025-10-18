import base from './airtableClient';

const TABLE_NAME = 'Accounts';

// Fetch all accounts for a given user ID
export async function fetchAccounts(userId) {
  try {
    const records = await base(TABLE_NAME)
      .select({
        filterByFormula: `{userID} = '${userId}'`,
        sort: [{ field: 'createdAt', direction: 'desc' }],
      })
      .all();

    return records.map((r) => ({
      id: r.id,
      accountId: r.fields.accountID, // map to camelCase
      userId: r.fields.userID,
      name: r.fields.name,
      number: r.fields.number,
      balance: r.fields.balance || 0,
      currency: r.fields.currency || 'USD',
      createdAt: r.fields.createdAt,
    }));
  } catch (err) {
    console.error('Error fetching accounts:', err);
    throw err;
  }
}

// Create a new account in Airtable
export async function addAccount(userId, { name, number, balance, currency }) {
  const accountId = 'acc_' + Date.now(); // unique ID
  try {
    const record = await base(TABLE_NAME).create([
      {
        fields: {
          userID: userId,
          accountID: accountId, // matches Airtable field
          name,
          number,
          balance: parseFloat(balance) || 0,
          currency: currency || 'USD',
          createdAt: new Date().toISOString(),
        },
      },
    ]);

    const r = record[0];
    console.log('Account created:', record[0].fields);
    return {
      id: rec.id,
      accountId: rec.fields.accountID, // map to camelCase
      userId: rec.fields.userID,
      name: rec.fields.name,
      number: rec.fields.number,
      balance: rec.fields.balance || 0,
      currency: rec.fields.currency || 'USD',
      createdAt: rec.fields.createdAt,
    };
  } catch (err) {
    console.error('Error adding account to Airtable:', err);
    throw err;
  }
}

// Update an existing account
export async function updateAccount(accountId, updates) {
  try {
    const updated = await base(TABLE_NAME).update([
      {
        id: accountId,
        fields: updates,
      },
    ]);

    const r = updated[0];
    return {
      id: r.id,
      accountId: r.fields.accountID, // map to camelCase
      userId: r.fields.userID,
      name: r.fields.name,
      number: r.fields.number,
      balance: r.fields.balance || 0,
      currency: r.fields.currency || 'USD',
      createdAt: r.fields.createdAt,
    };
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
}

// Delete an account from Airtable
export async function deleteAccount(accountId) {
  try {
    await base(TABLE_NAME).destroy(accountId);
    return accountId;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}
