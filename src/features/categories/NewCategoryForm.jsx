import { useState } from 'react';

export default function NewCategoryForm({
  onSave,
  onCancel,
  parentCategoryId = null,
  parentCategoryName = '',
}) {
  const [name, setName] = useState('');

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
    });

    setName('');
  };

  return (
    <div style={{ marginTop: 10 }}>
      <h4>
        {parentCategoryId
          ? `Add New Child Category under "${parentCategoryName}"`
          : 'Add New Parent Category'}
      </h4>
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
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: 10 }}>
          Cancel
        </button>
      </form>
    </div>
  );
}
