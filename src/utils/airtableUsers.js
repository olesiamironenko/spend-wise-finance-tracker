import base from './airtableClient';

// Create a new user record
export async function createUser(email, password) {
  const userID = 'u' + Date.now(); // unique user ID generator
  try {
    const record = await base('Users').create([
      {
        fields: {
          userID,
          email: email,
          password: password,
        },
      },
    ]);
    console.log('User created:', record[0].fields);
    return record[0];
  } catch (err) {
    console.error('Error adding user to Airtable:', err);
    throw err;
  }
}
