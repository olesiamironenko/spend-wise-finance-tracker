import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../utils/airtableCategories';
import NewCategoryForm from '../features/categories/NewCategoryForm';

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
      userId: user.id,
    });
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setEditCategory(category);
    setShowForm(true);
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
        <button onClick={handleAddCategory}>+ Add New Parent Category</button>
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
            <button
              onClick={() => {
                setEditCategory({
                  name: '',
                  parentId: parent.id,
                  userId: user.id,
                });
                setShowForm(true);
                setEditCategory({ parentId: parent.id });
              }}
              style={{ marginLeft: 10 }}
            >
              + Add New Child Category
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
        <NewCategoryForm
          parentCategoryId={editCategory?.parentId || null}
          parentCategoryName={
            categories.find((c) => c.id === editCategory?.parentId)?.name
          }
          onSave={async ({ name, parentId }) => {
            try {
              if (editCategory?.id) {
                await updateCategory(editCategory.id, { name, parentId });
              } else {
                await addCategory({
                  name,
                  parentId,
                  userId: user.id,
                });
              }
              await loadCategories();
              setShowForm(false);
              setEditCategory(null);
            } catch (err) {
              console.error('Error saving category:', err);
            }
          }}
          onCancel={() => setShowForm(false)}
        ></NewCategoryForm>
      )}
    </div>
  );
}
