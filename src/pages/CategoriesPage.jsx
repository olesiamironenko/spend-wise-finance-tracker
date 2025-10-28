import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../utils/airtableCategories';

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [editCategory, setEditCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch user categories (parents + children)
  const loadCategories = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchCategories(user.id);
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // --- Form handlers ---
  const handleAddCategory = () => {
    setEditCategory({
      name: '',
      parentId: '',
    });
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setEditCategory(category);
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editCategory.name.trim()) return alert('Category name is required.');

    try {
      await addCategory({
        name: editCategory.name.trim(),
        parentId: editCategory.parentId || null,
        userId: user.id,
      });
      await loadCategories();
      setEditCategory(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  const handleUpdate = async () => {
    if (!editCategory.name.trim()) return alert('Category name is required.');

    try {
      const { id, ...fields } = editCategory;
      await updateCategory(id, fields);
      await loadCategories();
      setEditCategory(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await deleteCategory(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
    } catch (err) {
      console.error(err);
    }
  };

  // --- Helpers to show categories grouped by parent ---
  const parentCategories = categories.filter((c) => !c.parentId);
  const childCategories = (parentId) =>
    categories.filter((c) => c.parentId === parentId);

  return (
    <div style={{ padding: 20 }}>
      <h2>📂 Categories</h2>
      {loading && <p>Loading categories...</p>}
      {!loading && categories.length === 0 && <p>No categories yet.</p>}

      {!showForm && (
        <button onClick={handleAddCategory}>➕ Add New Category</button>
      )}

      {/* Category List */}
      <ul>
        {parentCategories.map((parent) => (
          <li key={parent.id} style={{ marginTop: 10 }}>
            <strong>{parent.name}</strong>
            <button
              onClick={() => handleEditCategory(parent)}
              style={{ marginLeft: 10 }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(parent)}
              style={{ marginLeft: 5 }}
            >
              Delete
            </button>

            <ul style={{ marginLeft: 20 }}>
              {childCategories(parent.id).map((child) => (
                <li key={child.id}>
                  {child.name}
                  <button
                    onClick={() => handleEditCategory(child)}
                    style={{ marginLeft: 10 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(child)}
                    style={{ marginLeft: 5 }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {/* Form */}
      {showForm && (
        <div style={{ marginTop: 20 }}>
          <h3>{editCategory?.id ? 'Edit Category' : 'Add Category'}</h3>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={editCategory.name}
              onChange={handleInputChange}
              style={{ marginLeft: 10 }}
            />
          </label>

          <br />
          <label style={{ marginTop: 10, display: 'block' }}>
            Parent Category:
            <select
              name="parentId"
              value={editCategory.parentId || ''}
              onChange={handleInputChange}
              style={{ marginLeft: 10 }}
            >
              <option value="">None (top-level)</option>
              {parentCategories.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <div style={{ marginTop: 10 }}>
            {editCategory.id ? (
              <button onClick={handleUpdate}>💾 Update</button>
            ) : (
              <button onClick={handleSave}>💾 Save</button>
            )}
            <button
              onClick={() => setShowForm(false)}
              style={{ marginLeft: 10 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
