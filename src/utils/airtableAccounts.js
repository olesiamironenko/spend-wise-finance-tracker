import base from './airtableClient';

const TABLE_NAME = 'Accounts';

// Fetch all accounts for a given user ID
export async function fetchAccounts(userId) {
  try {
    const records = await base(TABLE_NAME)
      .select({
        filterByFormula: `{userId} = '${userId}'`,
        sort: [{ field: 'createdAt', direction: 'desc' }],
      })
      .all();

    return records.map((r) => ({
      id: r.id,
      userId: r.fields.userId,
      name: r.fields.name,
      balance: r.fields.balance || 0,
      number: r.fields.number || '',
      currency: r.fields.currency || 'USD',
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
          userId,
          accountId, // matches Airtable field
          name,
          number,
          balance: parseFloat(balance) || 0,
          currency: currency || 'USD',
          createdAt: new Date().toISOString(),
        },
      },
    ]);

    console.log('Account created:', record[0].fields);
    return record[0];
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

    const record = updated[0];
    return {
      id: record.id,
      ...record.fields,
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
