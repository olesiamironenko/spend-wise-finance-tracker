function CategoryListItem({
  category,
  categories,
  onEdit,
  onDelete,
  onAddChild,
}) {
  const isParent = !category.parentId;
  const children = categories.filter((c) => c.parentId === category.id);

  return (
    <li style={{ marginTop: 10, marginLeft: isParent ? 0 : 20 }}>
      {isParent ? (
        <strong>{category.name}</strong>
      ) : (
        <span>{category.name}</span>
      )}
      <button onClick={() => onEdit(category)} style={{ marginLeft: 10 }}>
        Edit
      </button>
      <button onClick={() => onDelete(category)} style={{ marginLeft: 5 }}>
        Delete
      </button>
      {isParent && (
        <button onClick={() => onAddChild(category)} style={{ marginLeft: 10 }}>
          + Add New Child Category
        </button>
      )}

      {children.length > 0 && (
        <ul style={{ marginLeft: 20 }}>
          {children.map((child) => (
            <CategoryListItem
              key={child.id}
              category={child}
              categories={categories}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default CategoryListItem;
