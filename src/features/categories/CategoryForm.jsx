import { useState, useEffect } from 'react';

export default function CategoryForm({
  onSave,
  onCancel,
  parentCategoryId = null,
  parentCategoryName = '',
  editCategory = '',
}) {
  const [name, setName] = useState('');

  // Prefill name if editing
  useEffect(() => {
    if (editCategory?.name) {
      setName(editCategory.name);
    } else {
      setName('');
    }
  }, [editCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Category name is required');
      return;
    }

    // Parent / Child category creation
    await onSave({
      name: name.trim(),
      parentId: parentCategoryId || null,
      id: editCategory?.id,
    });

    setName('');
  };

  // Determine the title
  const title = editCategory?.id
    ? `Edit "${editCategory.name}"`
    : parentCategoryId
      ? `Add New Child Category under "${parentCategoryName}"`
      : 'Add New Parent Category';

  return (
    <div style={{ marginTop: 10 }}>
      <h4>{title}</h4>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={
            parentCategoryId
              ? 'Child Category Name (required)'
              : 'Parent Category Name (required)'
          }
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: 10 }}
          required
        />
        <button type="submit">{editCategory ? 'Update' : 'Save'}</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: 10 }}>
          Cancel
        </button>
      </form>
    </div>
  );
}
