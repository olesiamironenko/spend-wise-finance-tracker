import base from './airtableClient';
import { fetchAccounts } from './airtableAccounts'; // helper to get user's account IDs

// Fetch transactions for a user
export async function fetchTransactions(userId) {
  try {
    // Step 1: get all account record IDs for this user
    const userAccounts = await fetchAccounts(userId);
    // userAccounts = array of Airtable record IDs, e.g., ["recABC", "recDEF"]

    if (!userAccounts.length) return [];

    // Step 2: build filter formula for Transactions
    const formulaParts = [
      ...userAccounts.map((id) => `FIND("${id}", {accountId})`),
      `FIND("${userId}", {sharedWith})`,
    ];
    const formula = `OR(${formulaParts.join(',')})`;

    // Step 3: fetch transactions
    const records = await base('Transactions')
      .select({
        filterByFormula: formula,
        sort: [{ field: 'date', direction: 'desc' }],
      })
      .firstPage();

    // Flatten fields
    return records.map((r) => ({
      id: r.id,
      accountId: r.fields.accountId?.[0] || null, // linked record returns array
      sharedWith: r.fields.sharedWith || [], // array of linked user IDs
      amount: r.fields.amount || 0,
      date: r.fields.date || '',
      description: r.fields.description || '',
    }));
  } catch (err) {
    console.error('Error fetching transactions from Airtable:', err);
    return [];
  }
}
