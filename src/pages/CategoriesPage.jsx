import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../utils/airtableCategories';
import CategoryForm from '../features/categories/CategoryForm';
import CategoryList from '../features/categories/CategoryList';

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
    const children = categories.filter((c) => c.parentId === category.id);

    // Prevent deleting parent categories with children
    if (children.length > 0) {
      alert(
        `Category "${category.name}" has ${children.length} child categories.\n` +
          `Please delete or reassign them before deleting this category.`
      );
      return;
    }

    // Deleting parent category without children
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await deleteCategory(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📂 Categories</h2>
      {loading && <p>Loading categories...</p>}
      {!loading && categories.length === 0 && <p>No categories yet.</p>}

      {!showForm && (
        <button onClick={handleAddCategory}>+ Add New Parent Category</button>
      )}

      {/* Category List */}
      <CategoryList
        categories={categories}
        onEdit={handleEditCategory}
        onDelete={handleDelete}
        onAddChild={(parent) => {
          setEditCategory({ name: '', parentId: parent.id, userId: user.id });
          setShowForm(true);
        }}
      />

      {/* Form */}
      {showForm && (
        <CategoryForm
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
        ></CategoryForm>
      )}
    </div>
  );
}
