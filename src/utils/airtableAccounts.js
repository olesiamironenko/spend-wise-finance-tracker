import base from './airtableClient';
import { nanoid } from 'nanoid';

// Return array of account record IDs linked to this user
export async function fetchAccounts(userId) {
  try {
    const records = await base('Accounts')
      .select({
        filterByFormula: `{userId} = "${userId}"`,
      })
      .firstPage();

    return records.map((r) => ({
      id: r.id,
      accountId: r.fields.accountId,
      userId: r.fields.userId,
      account_name: r.fields.account_name,
      account_number: r.fields.account_number,
      account_type: r.fields.account_type,
      balance: r.fields.balance,
    })); // return Airtable record IDs
  } catch (err) {
    console.error('Error fetching user accounts from Airtable:', err);
    return [];
  }
}

// Add a new account
export async function addAccount({
  account_name,
  account_number,
  account_type,
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
          accountId: nanoid(8), // generate unique ID
          account_name,
          account_number,
          account_type,
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
