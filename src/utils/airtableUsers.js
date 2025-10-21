import base from './airtableClient';

// Create a new user
export async function createUser(email, password) {
  const userId = 'u' + Date.now();

  // Check if email already exists
  const existing = await base('Users')
    .select({ filterByFormula: `{email} = "${email}"` })
    .firstPage();

  if (existing.length > 0) {
    throw new Error('Email already exists');
  }

  const record = await base('Users').create([{ fields: { email, password } }]);

  const r = record[0];
  return {
    id: r.id,
    email: r.fields.email,
    password: r.fields.password,
  };
}

// Find a user by email & password
export async function findUserByEmailAndPassword(email, password) {
  const records = await base('Users')
    .select({
      filterByFormula: `AND({email} = "${email}", {password} = "${password}")`,
      maxRecords: 1,
    })
    .firstPage();

  if (records.length === 0) return null;

  const r = records[0];
  return {
    id: r.id,
    userId: r.fields.userId,
    email: r.fields.email,
    password: r.fields.password,
  };
}

export async function fetchUsers() {
  try {
    const records = await base('Users')
      .select({
        fields: ['email', 'name'],
      })
      .all();

    return records.map((r) => ({
      id: r.id,
      email: r.fields.email,
      name: r.fields.name,
    }));
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
}
