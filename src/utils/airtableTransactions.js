import base from './airtableClient';
import { fetchAccounts } from './airtableAccounts'; // helper to get user's account IDs

// Fetch transactions for a user's accounts
export async function fetchTransactions(userId) {
  try {
    // Step 1: get all account record IDs for this user
    const userAccounts = await fetchAccounts(userId);
    const accountIds = userAccounts.map((a) => a.id); // Airtable record IDs

    if (!accountIds.length) return [];

    // Step 2: build filter formula for Transactions
    const formula = `OR(${accountIds.map((id) => `FIND("${id}", {accountId})`).join(',')})`;

    // Step 3: fetch transactions
    const records = await base('Transactions')
      .select({
        filterByFormula: formula,
        sort: [{ field: 'date', direction: 'desc' }],
        fields: [
          'amount',
          'transactionType',
          'categoryId',
          'categoryName', // lookup
          'shared',
          'sharedWith',
          'date',
          'description',
          'accountId',
          'accountName', // lookup
        ],
      })
      .firstPage();

    // Step 4: normalize results
    return records.map((r) => ({
      id: r.id,
      accountId: r.fields.accountId?.[0] || null,
      accountName: r.fields['accountName'] || '—',
      amount: r.fields.amount || 0,
      transactionType: r.fields.transactionType || '',
      categoryId: r.fields.categoryId?.[0] || null,
      categoryName: r.fields['categoryName'] || '—',
      shared: r.fields.shared || false,
      sharedWith: Array.isArray(r.fields.sharedWith)
        ? r.fields.sharedWith
        : r.fields.sharedWith
          ? [r.fields.sharedWith]
          : [],
      date: r.fields.date || '',
      description: r.fields.description || '',
    }));
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
      sharedWith: Array.isArray(sharedWith)
        ? sharedWith
        : sharedWith
          ? sharedWith.split(',').map((s) => s.trim())
          : [],
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
      sharedWith: Array.isArray(fields.sharedWith)
        ? fields.sharedWith
        : fields.sharedWith
          ? fields.sharedWith.split(',').map((s) => s.trim())
          : [],
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
