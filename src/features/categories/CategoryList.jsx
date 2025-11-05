import CategoryListItem from './CategoryListItem';

function CategoryList({ categories, onEdit, onDelete, onAddChild }) {
  // Helpers to show categories grouped by parent
  const parentCategories = categories.filter((c) => !c.parentId);

  return (
    <ul>
      {parentCategories.map((parent) => (
        <CategoryListItem
          key={parent.id}
          category={parent}
          categories={categories}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </ul>
  );
}

export default CategoryList;
