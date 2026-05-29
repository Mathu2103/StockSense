import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import InventoryHeader from './Components/InventoryHeader';

// Import our modular subcomponents
import ProductsRegistry, { ProductItem } from './Components/product-catalog/ProductsRegistry';
import CategoryRegistry from './Components/product-catalog/CategoryRegistry';
import NewProductForm from './Components/product-catalog/NewProductForm';

// Initial preloaded mock supermarket categories matching specifications
const initialCategories = [
  {
    id: 'dairy',
    name: 'Dairy Products',
    icon: '🥛',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=600&auto=format&fit=crop',
    status: 'In Stock',
    statusClass: 'bg-emerald-600',
    skus: 14,
    health: '90%',
    children: [
      { id: 'milk', name: 'Milk Products' },
      { id: 'cheese', name: 'Cheese Products' },
      { id: 'yogurt', name: 'Yogurt & Cream' },
    ]
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: '🥤',
    image: 'https://images.unsplash.com/photo-1559553156-2e97137af16f?q=80&w=600&auto=format&fit=crop',
    status: 'In Stock',
    statusClass: 'bg-emerald-600',
    skus: 48,
    health: '95%',
    children: [
      { id: 'soft-drinks', name: 'Soft Drinks' },
      { id: 'fruit-juices', name: 'Juice' },
      { id: 'water', name: 'Water' },
    ]
  },
  {
    id: 'household',
    name: 'Household Items',
    icon: '🧼',
    image: 'https://images.unsplash.com/photo-1585906560946-17b5f13426e2?q=80&w=600&auto=format&fit=crop',
    status: 'Low Stock',
    statusClass: 'bg-[#d97706]',
    skus: 23,
    health: '45%',
    children: [
      { id: 'cleaning', name: 'Cleaning Products' },
      { id: 'tissue', name: 'Tissue Paper' },
    ]
  },
  {
    id: 'personal',
    name: 'Personal Care Products',
    icon: '🧴',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=600&auto=format&fit=crop',
    status: 'In Stock',
    statusClass: 'bg-emerald-600',
    skus: 32,
    health: '80%',
    children: [
      { id: 'shampoo', name: 'Shampoo' },
      { id: 'soap', name: 'Soap' },
      { id: 'toothpaste', name: 'Toothpaste' },
    ]
  }
];

// Initial preloaded mock supermarket products matching specifications
const initialProducts: ProductItem[] = [
  {
    id: '1',
    name: 'Anchor Milk Powder 400g',
    sku: 'DAI-005',
    barcode: '4790012948577',
    category: 'Dairy Products',
    subcategory: 'Milk Products',
    supplier: 'FreshFarm Supplies',
    unitType: 'Pack',
    stock: 240,
    reorderLevel: 30,
    costPrice: 450.00,
    sellingPrice: 520.00,
    status: 'Active',
    lastUpdated: 'May 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Coca-Cola 1L',
    sku: 'BEV-001',
    barcode: '0038847291101',
    category: 'Beverages',
    subcategory: 'Soft Drinks',
    supplier: 'Golden Crust Bakery',
    unitType: 'Bottle',
    stock: 8, // Low stock since reorderLevel is 15
    reorderLevel: 15,
    costPrice: 120.00,
    sellingPrice: 150.00,
    status: 'Active',
    lastUpdated: 'May 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Sunlight Soap',
    sku: 'HOU-012',
    barcode: '0099221188334',
    category: 'Household Items',
    subcategory: 'Cleaning Products',
    supplier: 'Ocean Harvest',
    unitType: 'Piece',
    stock: 142,
    reorderLevel: 25,
    costPrice: 85.00,
    sellingPrice: 105.00,
    status: 'Active',
    lastUpdated: 'May 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1607006342411-b01354cc792a?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'Signal Toothpaste',
    sku: 'PER-009',
    barcode: '0044556677882',
    category: 'Personal Care Products',
    subcategory: 'Toothpaste',
    supplier: 'FreshFarm Supplies',
    unitType: 'Piece',
    stock: 0, // Out of stock
    reorderLevel: 20,
    costPrice: 140.00,
    sellingPrice: 175.00,
    status: 'Active',
    lastUpdated: 'May 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '5',
    name: 'Munchee Chocolate Biscuit',
    sku: 'SNA-042',
    barcode: '4790012948600',
    category: 'Personal Care Products', // using personal care as placeholder
    subcategory: 'Soap',
    supplier: 'Golden Crust Bakery',
    unitType: 'Pack',
    stock: 90,
    reorderLevel: 15,
    costPrice: 180.00,
    sellingPrice: 210.00,
    status: 'Active',
    lastUpdated: 'May 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=200&auto=format&fit=crop'
  }
];

export default function ProductManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'products';

  // React shared inventory states
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);

  // Filter redirection state
  const [initialSearch, setInitialSearch] = useState('');
  const [initialCategory, setInitialCategory] = useState('All Categories');

  // Edit target state
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  // Dynamic values for category and supplier dropdown lists
  const categoryNamesList = useMemo(() => categories.map((cat) => cat.name), [categories]);
  const suppliersMockList = [
    { id: '1', name: 'FreshFarm Supplies' },
    { id: '2', name: 'Golden Crust Bakery' },
    { id: '3', name: 'Ocean Harvest' }
  ];
  const supplierNamesList = useMemo(() => suppliersMockList.map((sup) => sup.name), []);

  // View tabs toggles
  const handleTabChange = (tabName: 'products' | 'categories' | 'new-product') => {
    if (tabName !== 'new-product') {
      setEditingProduct(null);
    }
    setSearchParams({ tab: tabName });
  };

  // Add category handler
  const handleAddCategoryNode = (newCat: { name: string; hierarchy: 'parent' | 'sub'; parentId: string }) => {
    if (newCat.hierarchy === 'parent') {
      const added = {
        id: `cat_${Date.now()}`,
        name: newCat.name,
        icon: '📦',
        image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop',
        status: 'In Stock',
        statusClass: 'bg-emerald-600',
        skus: 0,
        health: '100%',
        children: []
      };
      setCategories((prev) => [...prev, added]);
      showToast(`Category "${newCat.name}" added successfully.`);
    } else {
      setCategories((prev) =>
        prev.map((parent) => {
          if (parent.id === newCat.parentId) {
            return {
              ...parent,
              children: [...parent.children, { id: `sub_${Date.now()}`, name: newCat.name }]
            };
          }
          return parent;
        })
      );
      showToast(`Subcategory "${newCat.name}" added under parent successfully.`);
    }
  };

  // Archive Category
  const handleArchiveCategory = (id: string) => {
    if (window.confirm('Are you sure you want to archive this category?')) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast('Category archived successfully.', 'info');
    }
  };

  // Save product (handles both Create and Edit)
  const handleSaveProduct = (formData: any) => {
    setLoading(true);
    window.setTimeout(() => {
      if (editingProduct) {
        // Edit flow
        setProducts((prev) =>
          prev.map((p) => (p.id === formData.id ? { ...p, ...formData } : p))
        );
        showToast(`Product "${formData.name}" updated successfully.`);
      } else {
        // Create flow
        setProducts((prev) => [formData, ...prev]);
        showToast(`Product "${formData.name}" created successfully.`);
      }
      setEditingProduct(null);
      setLoading(false);
      handleTabChange('products');
    }, 400);
  };

  // Row Action Handlers
  const handleEditProduct = (product: ProductItem) => {
    setEditingProduct(product);
    handleTabChange('new-product');
  };

  const handleDuplicateProduct = (product: ProductItem) => {
    const duplicated: ProductItem = {
      ...product,
      id: `copy_${Date.now()}`,
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-COPY`,
      barcode: `BAR-${Math.floor(100000 + Math.random() * 900000)}`,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setProducts((prev) => [duplicated, ...prev]);
    showToast(`Duplicated "${product.name}" successfully.`);
  };

  const handleArchiveProduct = (id: string) => {
    if (window.confirm('Are you sure you want to archive this product? This will mark its status as Discontinued.')) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'Discontinued' } : p))
      );
      showToast('Product marked as Discontinued successfully.', 'info');
    }
  };

  // View Category Products redirects: swiches to products tab and sets filter
  const handleViewCategoryProducts = (categoryName: string) => {
    setInitialCategory(categoryName);
    handleTabChange('products');
  };

  // Export Products Registry as CSV
  const handleExportCSV = () => {
    const headers = 'Product Name,SKU,Barcode,Category,Subcategory,Supplier,Unit Type,Stock,Reorder Level,Cost Price,Selling Price,Status,Last Updated\n';
    const rows = products
      .map(
        (p) =>
          `"${p.name}","${p.sku}","${p.barcode}","${p.category}","${p.subcategory}","${p.supplier}","${p.unitType}",${p.stock},${p.reorderLevel},${p.costPrice},${p.sellingPrice},"${p.status}","${p.lastUpdated}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `StockSense_Products_Catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Product Catalog exported as CSV successfully.', 'info');
  };

  const handleImportPlaceholder = () => {
    showToast('Import products wizard launched (mock).', 'info');
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background font-sans text-on-surface">
      {/* Shared Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Unified Inventory Header block (Consistent with all other inventory pages) */}
        <InventoryHeader />

        {/* Page Content View Scroll container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background px-4 py-6 sm:px-6 lg:px-8 relative">

          {/* Dynamic Toast popup */}
          {toast && (
            <div className="fixed top-20 right-8 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-bold animate-bounce border border-slate-700">
              <span className="material-symbols-outlined text-emerald-400 text-sm">
                {toast.type === 'success' ? 'check_circle' : 'info'}
              </span>
              <span>{toast.message}</span>
            </div>
          )}

          <div className="max-w-[1200px] mx-auto space-y-6">
            
            {/* Breadcrumb mapping */}
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs font-bold text-outline">
              <span className="hover:text-on-surface transition-colors cursor-pointer">Inventory</span>
              <span className="material-symbols-outlined text-sm text-outline-variant">chevron_right</span>
              <span className="text-primary font-black">Product Catalog</span>
            </div>

            {/* Core Header description */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-outline-variant pb-4">
              <div>
                <h1 className="text-2xl font-black text-on-surface tracking-tight sm:text-3xl">Product Catalog</h1>
                <p className="text-on-surface-variant text-xs mt-1 max-w-[800px] leading-relaxed">
                  Manage supermarket products, categories, supplier assignments, stock settings, and pricing information from a centralized catalog workspace.
                </p>
              </div>

              {/* Action Buttons & Tabs Row */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {/* Standard Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleImportPlaceholder}
                    className="px-3.5 py-1.5 bg-white border border-outline rounded-lg text-xs font-bold text-on-surface-variant hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">file_upload</span>
                    Import
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3.5 py-1.5 bg-white border border-outline rounded-lg text-xs font-bold text-on-surface-variant hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">file_download</span>
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('new-product')}
                    className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-extrabold hover:opacity-90 transition-all shadow-sm flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Product
                  </button>
                </div>

                <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                {/* Segmented control tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 gap-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleTabChange('products')}
                    className={`px-4 py-1.5 rounded-md transition-all ${
                      activeTab === 'products' ? 'bg-white text-primary shadow-sm font-black' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Products Registry
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('categories')}
                    className={`px-4 py-1.5 rounded-md transition-all ${
                      activeTab === 'categories' ? 'bg-white text-primary shadow-sm font-black' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Category Registry
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('new-product')}
                    className={`px-4 py-1.5 rounded-md transition-all ${
                      activeTab === 'new-product' ? 'bg-white text-primary shadow-sm font-black' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </button>
                </div>
              </div>
            </div>

            {/* Active view state router */}
            {activeTab === 'products' && (
              <ProductsRegistry
                products={products}
                loading={loading}
                onEdit={handleEditProduct}
                onDuplicate={handleDuplicateProduct}
                onArchive={handleArchiveProduct}
                categories={categoryNamesList}
                suppliers={supplierNamesList}
                initialSearch={initialSearch}
                initialCategory={initialCategory}
              />
            )}

            {activeTab === 'categories' && (
              <CategoryRegistry
                categories={categories}
                onViewProducts={handleViewCategoryProducts}
                onAddCategory={handleAddCategoryNode}
                onEditCategory={() => {}}
                onAddSubcategory={() => {}}
                onArchiveCategory={handleArchiveCategory}
              />
            )}

            {activeTab === 'new-product' && (
              <NewProductForm
                categories={categories}
                suppliers={suppliersMockList}
                onSave={handleSaveProduct}
                onCancel={(discarded) => {
                  if (discarded) showToast('Product form discarded.', 'info');
                  handleTabChange('products');
                }}
                initialProduct={editingProduct}
              />
            )}

          </div>

        </main>
      </div>

    </div>
  );
}
