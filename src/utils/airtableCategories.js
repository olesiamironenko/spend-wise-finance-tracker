import base from './airtableClient';

// Fetch categories for a user
export async function fetchCategories(userRecordId) {
  try {
    const records = await base('Categories')
      .select({
        filterByFormula: `{userId} = "${userRecordId}"`,
        sort: [{ field: 'categoryName', direction: 'asc' }],
      })
      .firstPage();

    return records.map((r) => ({
      id: r.id, // Airtable record ID
      categoryId: r.fields.categoryId,
      categoryName: r.fields.categoryName,
      parentCategory: r.fields.parentCategory || null,
    }));
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}
