import base from './airtableClient';
import { fetchAccounts } from './airtableAccounts'; // helper to get user's account IDs

export async function fetchTransactions(userId) {
  try {
    const accounts = await fetchAccounts(userId);
    console.log('Fetched accounts for user:', userId, accounts);

    const accountMap = Object.fromEntries(
      accounts.map((a) => [a.id, a.userId])
    );
    const accountIds = accounts.map((a) => a.id);
    console.log('Account IDs to search for:', accountIds);

    if (!accountIds.length) {
      console.warn('No accounts found for this user.');
      return [];
    }

    const formula = `OR(${accountIds.map((id) => `FIND("${id}", {accountId})`).join(',')})`;
    console.log('Airtable formula:', formula);

    const records = await base('Transactions')
      .select({
        filterByFormula: formula,
        sort: [{ field: 'date', direction: 'desc' }],
        fields: [
          'amount',
          'transactionType',
          'categoryId',
          'categoryName',
          'shared',
          'sharedWith',
          'date',
          'description',
          'accountId',
          'accountName',
        ],
      })
      .firstPage();

    console.log(
      'Fetched transactions:',
      records.length,
      records.map((r) => r.fields)
    );

    return records.map((r) => {
      const accountId = Array.isArray(r.fields.accountId)
        ? r.fields.accountId[0]
        : r.fields.accountId || null;

      // Find which user owns this account
      const account = accounts.find((a) => a.id === accountId);
      const ownerId = account ? account.userId?.[0] || account.userId : userId;

      return {
        id: r.id,
        userId: ownerId,
        accountId,
        accountName: Array.isArray(r.fields.accountName)
          ? r.fields.accountName[0]
          : r.fields.accountName || '—',
        amount: r.fields.amount || 0,
        transactionType: r.fields.transactionType || '',
        categoryId: Array.isArray(r.fields.categoryId)
          ? r.fields.categoryId[0]
          : r.fields.categoryId || null,
        categoryName: r.fields.categoryName || '—',
        shared: r.fields.shared || false,
        sharedWith: Array.isArray(r.fields.sharedWith)
          ? r.fields.sharedWith
          : [],
        date: r.fields.date || '',
        description: r.fields.description || '',
      };
    });
  } catch (err) {
    console.error('Error fetching transactions from Airtable:', err);
    return [];
  }
}

// Add a new transaction
export async function addTransaction({
  accountId,
  amount,
  transactionType,
  categoryId,
  shared,
  sharedWith,
  date,
  description,
}) {
  console.log('Creating transaction with:', {
    accountId,
    amount,
    transactionType,
    sharedWith,
  });

  try {
    if (!accountId) {
      throw new Error('Missing accountId — must be a valid Airtable record ID');
    }

    const normalizedFields = {
      amount,
      transactionType,
      date,
      description,
      shared,
      // linked records:
      accountId: accountId ? [accountId] : [],
      categoryId: categoryId ? [categoryId] : [],
      sharedWith: Array.isArray(sharedWith) ? sharedWith : [],
    };

    console.log('Creating transaction with:', normalizedFields);

    const record = await base('Transactions').create([
      { fields: normalizedFields },
    ]);
    return record[0].fields;
  } catch (err) {
    console.error('Error adding transaction:', err);
    throw err;
  }
}

export async function updateTransaction(id, fields) {
  try {
    // Normalize sharedWith field before sending to Airtable
    const normalizedFields = {
      amount: fields.amount,
      transactionType: fields.transactionType,
      date: fields.date,
      description: fields.description,
      shared: fields.shared,
      accountId: fields.accountId ? [fields.accountId] : [],
      categoryId: fields.categoryId ? [fields.categoryId] : [],
      sharedWith: Array.isArray(fields.sharedWith) ? fields.sharedWith : [],
    };

    const record = await base('Transactions').update([
      { id, fields: normalizedFields },
    ]);

    console.log('Transaction updated successfully:', record[0].fields);
    return record[0].fields;
  } catch (err) {
    console.error('Error updating transaction:', err);
    throw err;
  }
}

// Delete a transaction by Airtable record ID
export async function deleteTransaction(id) {
  try {
    await base('Transactions').destroy([id]);
    return true;
  } catch (err) {
    console.error('Error deleting transaction:', err);
    throw err;
  }
}

export function normalizeTransactionAmount(transactionType, amount) {
  const value = parseFloat(amount);
  if (isNaN(value)) return 0;
  return transactionType === 'Expense' ? -Math.abs(value) : Math.abs(value);
}
