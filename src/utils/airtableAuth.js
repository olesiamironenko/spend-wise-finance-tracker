import base from './airtableClient';

// Find user by email & password in Airtable Users table
export async function findUserByEmailAndPassword(email, password) {
  try {
    // Filter by email (exact match)
    const records = await base('Users')
      .select({
        filterByFormula: `{Email} = '${email}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length === 0) {
      return null; // user not found
    }

    const user = records[0].fields;

    // Simple password check (plaintext – only for testing!)
    if (user.Password === password) {
      return {
        id: records[0].id, // Airtable record ID
        ...user,
      };
    }

    return null; // password mismatch
  } catch (err) {
    console.error('Error finding user in Airtable:', err);
    throw err;
  }
}
