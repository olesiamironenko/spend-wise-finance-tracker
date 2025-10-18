import base from './airtableClient';

export async function testAirtable() {
  try {
    const records = await base('Users').select({ maxRecords: 3 }).firstPage();
    console.log(
      'Airtable connected! Sample users:',
      records.map((r) => r.fields)
    );
  } catch (error) {
    console.error('Airtable connection failed:', error);
  }
}
