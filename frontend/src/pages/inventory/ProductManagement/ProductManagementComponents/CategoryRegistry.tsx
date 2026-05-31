import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CategoryTree from './SubComponents/CategoryTree';
import ProductImageUploader from './SubComponents/ProductImageUploader';

type SubCategoryNode = {
  id: string;
  name: string;
  productsCount?: number;
};

type CategoryItem = {
  id: string;
  name: string;
  icon: string;
  image: string;
  status: string;
  statusClass: string;
  skus: number;
  health: string;
  children: SubCategoryNode[];
  description?: string;
};

type CategoryRegistryProps = {
  categories: CategoryItem[];
  onViewProducts: (categoryName: string) => void;
  onAddCategory: (newCategory: { name: string; description: string; hierarchy: 'parent' | 'sub'; parentId: string; image?: string | null }) => void;
  onEditCategory: (id: string, name: string, description: string, image?: string | null) => void;
  onAddSubcategory: (parentCat: CategoryItem) => void;
  onArchiveCategory: (id: string) => void;
};

export default function CategoryRegistry({
  categories,
  onViewProducts,
  onAddCategory,
  onEditCategory,
  onArchiveCategory
}: CategoryRegistryProps) {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [hierarchy, setHierarchy] = useState<'parent' | 'sub'>('parent');
  const [parentCatId, setParentCatId] = useState('');
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [categoryImage, setCategoryImage] = useState<string | null>(null);

  // Active taxonomy views: parents -> drill down subcategories -> drill down product listings
  const [activeView, setActiveView] = useState<'parents' | 'children'>('parents');
  const [selectedParent, setSelectedParent] = useState<CategoryItem | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-open modal if navigated via deep link from NewProductForm
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsModalOpen(true);
      setHierarchy('parent');
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Sync parent category state for dropdown options
  useEffect(() => {
    if (categories.length > 0 && !parentCatId) {
      setParentCatId(categories[0].id);
    }
  }, [categories, parentCatId]);

  // Reactive KPI Calculations
  const kpis = useMemo(() => {
    const totalCategories = categories.length;
    const totalSubcategories = categories.reduce((sum, cat) => sum + cat.children.length, 0);
    const categorizedProducts = categories.reduce((sum, cat) => sum + cat.skus, 0);
    const uncategorizedProducts = 0; // standard default bound for POS

    return { totalCategories, totalSubcategories, categorizedProducts, uncategorizedProducts };
  }, [categories]);

  const handleOpenAddModal = (mode: 'parent' | 'sub', defaultParentId?: string) => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setCategoryImage(null);
    setDuplicateError(null);
    setHierarchy(mode);
    if (defaultParentId) {
      setParentCatId(defaultParentId);
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description || '');
    setCategoryImage(cat.image || null);
    setDuplicateError(null);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const trimmed = categoryName.trim();
    if (!trimmed) {
      alert('Please enter a valid category name.');
      return;
    }

    // Duplicate Check
    let isDuplicate = false;
    if (editingCategory) {
      // Check if renamed to an existing parent category name
      isDuplicate = categories.some(
        (c) => c.id !== editingCategory.id && c.name.toLowerCase() === trimmed.toLowerCase()
      );
    } else {
      if (hierarchy === 'parent') {
        isDuplicate = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
      } else {
        const parent = categories.find((c) => c.id === parentCatId);
        if (parent) {
          isDuplicate = parent.children.some((sub) => sub.name.toLowerCase() === trimmed.toLowerCase());
        }
      }
    }

    if (isDuplicate) {
      setDuplicateError(`The category "${trimmed}" already exists.`);
      return;
    }

    if (editingCategory) {
      onEditCategory(editingCategory.id, trimmed, categoryDescription.trim(), categoryImage);
    } else {
      onAddCategory({
        name: trimmed,
        description: categoryDescription.trim(),
        hierarchy,
        parentId: hierarchy === 'sub' ? parentCatId : '',
        image: categoryImage,
      });
    }
    setCategoryName('');
    setCategoryDescription('');
    setCategoryImage(null);
    setDuplicateError(null);
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* 1. Category KPI Cards Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* KPI: Total Categories */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Total Categories</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-on-surface leading-none">{kpis.totalCategories}</span>
            <span className="text-xs font-bold text-outline-variant mb-0.5">departments</span>
          </div>
        </div>

        {/* KPI: Total Subcategories */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Total Subcategories</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-on-surface leading-none">{kpis.totalSubcategories}</span>
            <span className="text-xs font-bold text-outline-variant mb-0.5">shelves</span>
          </div>
        </div>

        {/* KPI: Categorized Products */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Categorized Products</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-primary leading-none">{kpis.categorizedProducts}</span>
            <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full mb-0.5">
              Active
            </span>
          </div>
        </div>

        {/* KPI: Uncategorized Products */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Uncategorized Items</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-on-surface-variant leading-none">
              {kpis.uncategorizedProducts}
            </span>
            <span className="text-xs font-medium text-outline mb-0.5">0.00%</span>
          </div>
        </div>

      </div>

      {/* 2. Unified Grid Layout with CategoryTree on side */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Column: Category Hierarchy tree panel */}
        <div className="lg:col-span-1">
          <CategoryTree
            categories={categories}
            onSelectSubcategory={(parent) => {
              // Deep-linking: clicking category/subcategory toggles viewing products of that category!
              onViewProducts(parent);
            }}
          />
        </div>

        {/* Right Column: Dynamic Category Cards Directory */}
        <div className="lg:col-span-3 space-y-4">

          {/* Section Breadcrumbs / Header bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <button
                onClick={() => setActiveView('parents')}
                className={`transition-colors ${activeView === 'parents' ? 'text-primary font-black' : 'text-outline hover:text-on-surface'}`}
              >
                All Categories
              </button>
              {activeView === 'children' && selectedParent && (
                <>
                  <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
                  <span className="text-on-surface-variant">{selectedParent.name} sub-shelves</span>
                </>
              )}
            </div>

            <button
              onClick={() => handleOpenAddModal(activeView === 'parents' ? 'parent' : 'sub', selectedParent?.id)}
              className="flex items-center gap-1 text-primary text-xs font-bold hover:underline"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add {activeView === 'parents' ? 'Category' : 'Sub-category'}
            </button>
          </div>

          {activeView === 'parents' ? (
            /* Parents Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-primary/40 transition-all duration-200 group"
                >
                  {/* Photo Overlay Banner */}
                  <div className="h-28 relative">
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <span className={`absolute bottom-3 left-3 ${category.statusClass} text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider`}>
                      {category.status}
                    </span>
                  </div>

                  {/* Info details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-bold text-on-surface flex items-center gap-1.5 truncate">
                          <span>{category.icon}</span>
                          <span className="truncate">{category.name}</span>
                        </h4>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditModal(category)}
                            title="Edit Category"
                            className="p-1 rounded text-outline-variant hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => onArchiveCategory(category.id)}
                            title="Archive Category"
                            className="p-1 rounded text-outline-variant hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">archive</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-outline mt-1">{category.children.length} subcategories registered</p>
                      <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-1.5 leading-relaxed">
                        {category.description || 'No description provided for this catalog category.'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-on-surface-variant mb-1">
                          <span>Department Skus</span>
                          <span>{category.skus} Products</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${category.statusClass} rounded-full`} style={{ width: category.health }}></div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1 border-t border-slate-50">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedParent(category);
                            setActiveView('children');
                          }}
                          className="flex-1 bg-secondary-container hover:bg-secondary-container/80 text-primary py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-sm">segment</span>
                          Sub-shelves
                        </button>
                        <button
                          type="button"
                          onClick={() => onViewProducts(category.name)}
                          className="flex-1 bg-primary text-white py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1 shadow-sm"
                        >
                          Products
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Parent Category Card trigger */}
              <button
                type="button"
                onClick={() => handleOpenAddModal('parent')}
                className="border-2 border-dashed border-outline-variant hover:border-primary/60 rounded-xl flex flex-col items-center justify-center p-6 text-center text-outline hover:text-primary hover:bg-primary/5 transition-all duration-200 min-h-[220px]"
              >
                <span className="material-symbols-outlined text-3xl text-outline-variant hover:text-primary mb-2">add</span>
                <span className="text-xs font-bold text-on-surface-variant">Add Parent Category</span>
                <span className="text-[10px] text-outline mt-1 max-w-[140px]">Create top-level inventory departments.</span>
              </button>

            </div>
          ) : (
            /* Sub-category Children views */
            <div className="space-y-4 animate-in fade-in duration-100">

              {/* Back navigation header button */}
              <button
                type="button"
                onClick={() => setActiveView('parents')}
                className="flex items-center gap-1 text-xs text-outline hover:text-on-surface font-bold mb-2 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Departments
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedParent?.children.map((child) => (
                  <div
                    key={child.id}
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="w-9 h-9 bg-primary/5 text-primary rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm">category</span>
                        </div>
                        <span className="bg-slate-100 text-on-surface-variant px-2.5 py-0.5 rounded text-[10px] font-bold">
                          Sub-shelf
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-on-surface">{child.name}</h4>
                      <p className="text-[10px] text-outline mt-1">BELONGS TO: {selectedParent.name}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onViewProducts(selectedParent.name)}
                      className="mt-6 w-full border border-outline-variant py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      Browse Products
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                ))}

                {/* Add Subcategory card trigger */}
                <button
                  type="button"
                  onClick={() => handleOpenAddModal('sub', selectedParent?.id)}
                  className="border-2 border-dashed border-outline-variant hover:border-primary/60 rounded-xl flex flex-col items-center justify-center p-6 text-center text-outline hover:text-primary hover:bg-primary/5 transition-all duration-200 min-h-[140px]"
                >
                  <span className="material-symbols-outlined text-2xl mb-1">add</span>
                  <span className="text-xs font-bold text-on-surface-variant">Add Subcategory</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* 3. Manage Category Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">category</span>
                <h2 className="text-lg font-bold text-on-surface">
                  {editingCategory ? 'Edit Category Node' : 'Manage Category Nodes'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setCategoryName('');
                  setCategoryDescription('');
                  setEditingCategory(null);
                }}
                className="text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">

              {/* Category Name input */}
              <div>
                <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (duplicateError) setDuplicateError(null);
                  }}
                  placeholder="e.g. Soft Drinks, Fresh Pastas, Laundry"
                  className={`w-full px-4 py-2.5 bg-background border rounded-lg text-sm text-on-surface outline-none focus:ring-2 transition-colors ${duplicateError
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-outline-variant focus:ring-primary'
                    }`}
                />
                {duplicateError && (
                  <p className="text-[10px] font-bold text-red-500 mt-1.5 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {duplicateError}
                  </p>
                )}
              </div>

              {/* Category Description input */}
              <div>
                <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-2">
                  Category Description
                </label>
                <textarea
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Describe shelves, aisle locations, temperature setups..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary placeholder:text-outline-variant resize-none"
                />
              </div>

              {/* Category Image Uploader */}
              {hierarchy === 'parent' && (
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-2">
                    Department Image
                  </label>
                  <ProductImageUploader imageUrl={categoryImage} setImageUrl={setCategoryImage} />
                </div>
              )}

              {/* Hierarchy placement selection - only on create */}
              {!editingCategory && (
                <>
                  {/* Hierarchy toggles */}
                  <div>
                    <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-2">
                      Hierarchy Placement
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Option 1: Parent Department */}
                      <button
                        type="button"
                        onClick={() => setHierarchy('parent')}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-colors ${hierarchy === 'parent' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-outline'
                          }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${hierarchy === 'parent' ? 'border-primary' : 'border-outline'
                          }`}>
                          {hierarchy === 'parent' && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-on-surface">Parent Node</h5>
                          <p className="text-[10px] text-outline mt-0.5">Top-level department</p>
                        </div>
                      </button>

                      {/* Option 2: Subcategory placement */}
                      <button
                        type="button"
                        onClick={() => setHierarchy('sub')}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-colors ${hierarchy === 'sub' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-outline'
                          }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${hierarchy === 'sub' ? 'border-primary' : 'border-outline'
                          }`}>
                          {hierarchy === 'sub' && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-on-surface">Subcategory</h5>
                          <p className="text-[10px] text-outline mt-0.5">Fits under a parent</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Parent category selector (only if subcategory hierarchy active) */}
                  {hierarchy === 'sub' && (
                    <div>
                      <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-2">
                        Select Parent Department
                      </label>
                      <div className="relative">
                        <select
                          value={parentCatId}
                          onChange={(e) => setParentCatId(e.target.value)}
                          className="w-full appearance-none pl-4 pr-10 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px] pointer-events-none">
                          expand_more
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-outline-variant/60">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setCategoryName('');
                  setCategoryDescription('');
                  setEditingCategory(null);
                }}
                className="px-4 py-2 bg-white border border-outline rounded-lg text-xs font-bold text-on-surface-variant hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-sm"
              >
                Save Category Node
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
