import base from './airtableClient';

/**
 * Fetch all categories belonging to a given user.
 * Supports parent–child structure via parentId (linked to same table).
 */
export async function fetchCategories(userId) {
  try {
    const records = await base('Categories')
      .select({
        filterByFormula: `{userId} = '${userId}'`,
        sort: [{ field: 'name', direction: 'asc' }],
        fields: ['name', 'userId', 'parentId'],
      })
      .all();

    return records.map((r) => ({
      id: r.id,
      name: r.fields.name || '',
      userId: Array.isArray(r.fields.userId)
        ? r.fields.userId[0]
        : r.fields.userId || null,
      parentId: Array.isArray(r.fields.parentId)
        ? r.fields.parentId[0]
        : r.fields.parentId || null,
    }));
  } catch (err) {
    console.error('Error fetching categories from Airtable:', err);
    return [];
  }
}

/*
 * Add a new category.
 * @param {Object} category - { name, userId, parentId? }
 */
export async function addCategory({ name, userId, parentId = null }) {
  try {
    const normalizedFields = {
      name,
      userId: userId ? [userId] : [],
      parentId: parentId ? [parentId] : [],
    };

    console.log('Creating category with fields:', normalizedFields);

    const record = await base('Categories').create([
      { fields: normalizedFields },
    ]);

    console.log('Category created:', record[0].fields);
    return record[0].fields;
  } catch (err) {
    console.error('Error adding category:', err);
    throw err;
  }
}

/*
 * Update an existing category.
 * @param {string} id - Airtable record ID.
 * @param {Object} fields - { name?, parentId? }
 */
export async function updateCategory(id, fields) {
  try {
    const normalizedFields = {
      ...(fields.name && { name: fields.name }),
      ...(fields.parentId !== undefined && {
        parentId: fields.parentId ? [fields.parentId] : [],
      }),
    };

    const record = await base('Categories').update([
      { id, fields: normalizedFields },
    ]);

    console.log('Category updated:', record[0].fields);
    return record[0].fields;
  } catch (err) {
    console.error('Error updating category:', err);
    throw err;
  }
}

/*
 * Delete a category by Airtable record ID.
 * NOTE: You may want to handle deleting subcategories first if they exist.
 */
export async function deleteCategory(id) {
  try {
    await base('Categories').destroy([id]);
    return true;
  } catch (err) {
    console.error('Error deleting category:', err);
    throw err;
  }
}
