import base from './airtableClient';

// Return array of account record IDs linked to this user
export async function fetchAccounts(userId) {
  try {
    const records = await base('Accounts')
      .select({
        filterByFormula: `{userId} = '${userId}'`,
      })
      .firstPage();

    console.log('Airtable raw records:', records);

    return records.map((r) => ({
      id: r.id,
      accountId: r.fields.accountId, // if you still store a unique ID
      userId: r.fields.userId,
      accountName: r.fields.accountName,
      accountNumber: r.fields.accountNumber,
      accountType: r.fields.accountType,
      balance: r.fields.balance,
      currency: r.fields.currency,
    }));
  } catch (err) {
    console.error('Error fetching user accounts from Airtable:', err);
    return [];
  }
}

// Add a new account
export async function addAccount({
  accountName,
  accountNumber,
  accountType,
  balance,
  currency,
  userRecordId,
}) {
  console.log('Creating account with:', {
    userRecordId,
    type: typeof userRecordId,
  });

  try {
    const record = await base('Accounts').create([
      {
        fields: {
          accountName,
          accountNumber,
          accountType,
          balance,
          currency,
          userId: [userRecordId],
        },
      },
    ]);

    return record[0].fields;
  } catch (err) {
    console.error('Error adding account:', err);
    throw err;
  }
}

export async function updateAccount(accountId, updatedFields) {
  try {
    const record = await base('Accounts').update([
      {
        id: accountId,
        fields: updatedFields,
      },
    ]);
    return record[0].fields; // return updated fields
  } catch (err) {
    console.error('Error updating account:', err);
    throw err;
  }
}

// Delete an account by Airtable record ID
export async function deleteAccount(accountId) {
  try {
    await base('Accounts').destroy([accountId]);
    return true;
  } catch (err) {
    console.error('Error deleting account:', err);
    throw err;
  }
}
