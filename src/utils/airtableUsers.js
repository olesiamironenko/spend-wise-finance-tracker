import base from './airtableClient';

// Create a new user record
export async function createUser(userData) {
  try {
    const records = await base('Users').create([
      {
        fields: {
          email,
          password,
        },
      },
    ]);
    console.log('User added to Airtable:', records[0].fields);
    return records[0];
  } catch (error) {
    console.error('Error adding user to Airtable:', error);
    throw error;
  }
}
