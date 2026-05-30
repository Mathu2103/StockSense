import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import InventoryHeader from './Components/InventoryHeader';

// Import our modular subcomponents
import ProductsRegistry, { ProductItem } from './Components/product-catalog/ProductsRegistry';
import CategoryRegistry from './Components/product-catalog/CategoryRegistry';
import NewProductForm from './Components/product-catalog/NewProductForm';
import BrandRegistry, { BrandItem } from './Components/product-catalog/BrandRegistry';
import { SupplierItem } from './Components/product-catalog/SupplierRegistry';

// Initial preloaded mock supermarket categories matching specifications
const initialCategories = [
  {
    id: 'grocery',
    name: 'Grocery',
    icon: '🛒',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
    status: 'In Stock',
    statusClass: 'bg-emerald-600',
    skus: 64,
    health: '92%',
    description: 'Staples, pulses, grains, flour, spices, and dried foods.',
    children: [
      { id: 'rice-flour', name: 'Rice & Flour' },
      { id: 'spices', name: 'Spices & Condiments' },
      { id: 'biscuits', name: 'Biscuits & Snacks' },
    ]
  },
  {
    id: 'dairy',
    name: 'Dairy',
    icon: '🥛',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=600&auto=format&fit=crop',
    status: 'In Stock',
    statusClass: 'bg-emerald-600',
    skus: 14,
    health: '90%',
    description: 'Fresh milk, block cheese, salted butter, and fresh cream.',
    children: [
      { id: 'milk', name: 'Milk Products' },
      { id: 'cheese', name: 'Cheese Products' },
      { id: 'yogurt', name: 'Yogurt & Cream' },
    ]
  },
  {
    id: 'bakery',
    name: 'Bakery',
    icon: '🍞',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
    status: 'In Stock',
    statusClass: 'bg-emerald-600',
    skus: 12,
    health: '94%',
    description: 'Freshly baked loaves of bread, chocolate chip cookies, and tea buns.',
    children: [
      { id: 'bread', name: 'Loaf Bread' },
      { id: 'cookies', name: 'Cookies & Pastries' },
      { id: 'buns', name: 'Buns & Cakes' },
    ]
  },
  {
    id: 'frozen',
    name: 'Frozen Foods',
    icon: '❄️',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop',
    status: 'In Stock',
    statusClass: 'bg-emerald-600',
    skus: 28,
    health: '88%',
    description: 'Frozen ice cream tubs, meat cuts, frozen seafood, and mixed veggies.',
    children: [
      { id: 'ice-cream', name: 'Ice Cream' },
      { id: 'meat-seafood', name: 'Frozen Meat & Seafood' },
      { id: 'veg', name: 'Frozen Vegetables' },
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
    description: 'Carbonated soda pop, energy drinks, bottled mineral water, and fruit juices.',
    children: [
      { id: 'soft-drinks', name: 'Soft Drinks' },
      { id: 'fruit-juices', name: 'Juice' },
      { id: 'water', name: 'Water' },
    ]
  },
  {
    id: 'household',
    name: 'Household',
    icon: '🧼',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=600&auto=format&fit=crop',
    status: 'In Stock',
    statusClass: 'bg-emerald-600',
    skus: 22,
    health: '91%',
    description: 'Laundry detergents, dish soaps, garbage bins, and cleaning brushes.',
    children: [
      { id: 'detergent', name: 'Detergents & Soaps' },
      { id: 'utensils', name: 'Cleaning Utensils' },
      { id: 'paper-goods', name: 'Tissues & Wipes' },
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
    category: 'Dairy',
    subcategory: 'Milk Products',
    supplier: 'FreshFarm Supplies',
    brand: 'Anchor',
    unitType: 'Pack',
    stock: 240,
    reorderLevel: 30,
    costPrice: 450.00,
    sellingPrice: 520.00,
    status: 'Active',
    description: 'Premium milk powder manufactured in New Zealand and packed locally in Sri Lanka.',
    mfgDate: '2026-04-10',
    expiryDate: '2027-04-10',
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
    supplier: 'Ceylon Beverage Distributors',
    brand: 'Coca-Cola',
    unitType: 'Bottle',
    stock: 8, // Low stock since reorderLevel is 15
    reorderLevel: 15,
    costPrice: 120.00,
    sellingPrice: 150.00,
    status: 'Active',
    description: 'Refreshing carbonated soft drink bottle, best served chilled.',
    mfgDate: '2026-05-01',
    expiryDate: '2026-11-01',
    lastUpdated: 'May 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Sunlight Soap',
    sku: 'HOU-012',
    barcode: '0099221188334',
    category: 'Household',
    subcategory: 'Detergents & Soaps',
    supplier: 'FreshFarm Supplies',
    brand: 'Sunlight',
    unitType: 'Piece',
    stock: 142,
    reorderLevel: 25,
    costPrice: 85.00,
    sellingPrice: 105.00,
    status: 'Active',
    description: 'Multi-purpose household laundry and dishwashing soap cake.',
    mfgDate: '2026-03-20',
    expiryDate: '2028-03-20',
    lastUpdated: 'May 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1607006342411-b01354cc792a?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'Signal Toothpaste',
    sku: 'GRO-009',
    barcode: '0044556677882',
    category: 'Grocery',
    subcategory: 'Spices & Condiments',
    supplier: 'FreshFarm Supplies',
    brand: 'Signal',
    unitType: 'Piece',
    stock: 0, // Out of stock
    reorderLevel: 20,
    costPrice: 140.00,
    sellingPrice: 175.00,
    status: 'Active',
    description: 'Double active fluoride toothpaste for strong cavity protection.',
    mfgDate: '2026-02-12',
    expiryDate: '2028-02-12',
    lastUpdated: 'May 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '5',
    name: 'Munchee Chocolate Biscuit',
    sku: 'GRO-042',
    barcode: '4790012948600',
    category: 'Grocery',
    subcategory: 'Biscuits & Snacks',
    supplier: 'Golden Crust Bakery',
    brand: 'Munchee',
    unitType: 'Pack',
    stock: 90,
    reorderLevel: 15,
    costPrice: 180.00,
    sellingPrice: 210.00,
    status: 'Active',
    description: 'Crispy chocolate biscuits with rich chocolate cream filling.',
    mfgDate: '2026-05-10',
    expiryDate: '2026-11-10',
    lastUpdated: 'May 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=200&auto=format&fit=crop'
  }
];

export default function ProductManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'products';

  // React shared catalog states
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);

  // preloaded brands directory
  const [brands, setBrands] = useState<BrandItem[]>([
    { id: 'b-1', name: 'Anchor', description: 'Premium dairy products and milk powders.', productCount: 1 },
    { id: 'b-2', name: 'Coca-Cola', description: 'Carbonated soft drinks and beverages.', productCount: 1 },
    { id: 'b-3', name: 'Sunlight', description: 'Leading household cleaning and laundry brands.', productCount: 1 },
    { id: 'b-4', name: 'Signal', description: 'Oral healthcare and toothpastes.', productCount: 1 },
    { id: 'b-5', name: 'Munchee', description: 'Biscuits, wafers, and bakery snacks.', productCount: 1 },
  ]);

  // preloaded suppliers directory
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([
    { id: 's-1', name: 'FreshFarm Supplies', phone: '+94 77 123 4567', email: 'sales@freshfarm.lk', address: '45 Orchard Lane, Colombo 03', status: 'Active' },
    { id: 's-2', name: 'Golden Crust Bakery', phone: '+94 11 234 5678', email: 'orders@goldencrust.lk', address: '12 Bakery Lane, Kandy', status: 'Active' },
    { id: 's-3', name: 'Ocean Harvest', phone: '+94 91 345 6789', email: 'supply@oceanharvest.lk', address: '78 Fishery Pier, Galle', status: 'Active' },
    { id: 's-4', name: 'Ceylon Beverage Distributors', phone: '+94 71 456 7890', email: 'info@ceylonbev.lk', address: '102 Industrial Zone, Orugodawatta', status: 'Active' }
  ]);

  // Filter redirection state
  const [initialSearch] = useState('');
  const [initialCategory, setInitialCategory] = useState('All Categories');

  // Edit target state
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  // Dynamic lists derived for dropdown selectors
  const categoryNamesList = useMemo(() => categories.map((cat) => cat.name), [categories]);
  const supplierNamesList = useMemo(() => suppliers.map((sup) => sup.name), [suppliers]);

  // View tabs toggles
  const handleTabChange = (tabName: string) => {
    if (tabName !== 'new-product') {
      setEditingProduct(null);
    }
    setSearchParams({ tab: tabName });
  };

  // Add category handler
  const handleAddCategoryNode = (newCat: { name: string; description: string; hierarchy: 'parent' | 'sub'; parentId: string; image?: string | null }) => {
    if (newCat.hierarchy === 'parent') {
      const added = {
        id: `cat_${Date.now()}`,
        name: newCat.name,
        icon: '📦',
        image: newCat.image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop',
        status: 'In Stock',
        statusClass: 'bg-emerald-600',
        skus: 0,
        health: '100%',
        description: newCat.description,
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

  // Edit Category node
  const handleEditCategoryNode = (id: string, updatedName: string, updatedDescription: string, updatedImage?: string | null) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: updatedName, description: updatedDescription, ...(updatedImage !== undefined ? { image: updatedImage || c.image } : {}) } : c))
    );
    showToast('Category updated successfully.');
  };

  // Brand registry handlers
  const handleAddBrand = (brandData: Omit<BrandItem, 'id' | 'productCount'>) => {
    const newBrand: BrandItem = {
      ...brandData,
      id: `brand_${Date.now()}`,
      productCount: 0
    };
    setBrands((prev) => [...prev, newBrand]);
    showToast(`Brand "${brandData.name}" registered successfully.`);
  };

  const handleEditBrand = (id: string, updatedFields: Partial<BrandItem>) => {
    setBrands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updatedFields } : b))
    );
    showToast(`Brand details updated successfully.`);
  };

  const handleDeleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    showToast('Brand deleted successfully.', 'info');
  };

  // Supplier registry handlers
  const handleAddSupplier = (supplierData: Omit<SupplierItem, 'id'>) => {
    const newSup: SupplierItem = {
      ...supplierData,
      id: `sup_${Date.now()}`
    };
    setSuppliers((prev) => [...prev, newSup]);
    showToast(`Supplier "${supplierData.name}" registered successfully.`);
  };

  const handleEditSupplier = (id: string, updatedFields: Partial<SupplierItem>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
    showToast(`Supplier details updated successfully.`);
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    showToast('Supplier deleted successfully.', 'info');
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
      barcode: `479${Math.floor(1000000000 + Math.random() * 9000000000)}`,
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
            <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
              <span className={`material-symbols-outlined ${toast.type === 'success' ? 'text-primary' : 'text-blue-600'}`}>
                {toast.type === 'success' ? 'check_circle' : 'info'}
              </span>
              <span className="text-xs font-extrabold text-on-surface">{toast.message}</span>
            </div>
          )}

          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header controls section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl font-black tracking-tight text-on-surface sm:text-2xl">
                  Supermarket Product Catalog
                </h1>
                <p className="text-xs text-outline mt-1 font-medium">
                  Add, edit, delete, and visual search through all supermarket catalog nodes, brands registry, and suppliers.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleImportPlaceholder}
                  className="flex items-center gap-1.5 px-3 py-2 border border-outline rounded-lg text-xs font-bold text-on-surface-variant hover:bg-slate-50 transition-colors shadow-sm bg-white"
                >
                  <span className="material-symbols-outlined text-sm">publish</span>
                  Import CSV
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 border border-outline rounded-lg text-xs font-bold text-on-surface-variant hover:bg-slate-50 transition-colors shadow-sm bg-white"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Export Catalog
                </button>
              </div>
            </div>

            {/* Segment Controls Navigation Tab Bar */}
            <div className="border-b border-outline-variant pb-px">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="inline-flex p-1 bg-surface-container-low border border-outline-variant/60 rounded-lg text-xs font-medium w-full sm:w-auto overflow-x-auto gap-1">
                  <button
                    type="button"
                    onClick={() => handleTabChange('products')}
                    className={`px-4 py-1.5 rounded-md transition-all whitespace-nowrap ${
                      activeTab === 'products' ? 'bg-white text-primary shadow-sm font-black' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Products Registry
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('categories')}
                    className={`px-4 py-1.5 rounded-md transition-all whitespace-nowrap ${
                      activeTab === 'categories' ? 'bg-white text-primary shadow-sm font-black' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Category Registry
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('brands')}
                    className={`px-4 py-1.5 rounded-md transition-all whitespace-nowrap ${
                      activeTab === 'brands' ? 'bg-white text-primary shadow-sm font-black' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Brands
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/procurement?tab=suppliers')}
                    className="px-4 py-1.5 rounded-md text-on-surface-variant hover:text-on-surface transition-all whitespace-nowrap flex items-center gap-1 hover:bg-slate-50"
                  >
                    <span className="material-symbols-outlined text-[15px] text-outline">open_in_new</span>
                    Suppliers Directory
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('new-product')}
                    className={`px-4 py-1.5 rounded-md transition-all whitespace-nowrap ${
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
                onEditCategory={handleEditCategoryNode}
                onAddSubcategory={() => {}}
                onArchiveCategory={handleArchiveCategory}
              />
            )}

            {activeTab === 'brands' && (
              <BrandRegistry
                brands={brands}
                onAddBrand={handleAddBrand}
                onEditBrand={handleEditBrand}
                onDeleteBrand={handleDeleteBrand}
              />
            )}

            {activeTab === 'new-product' && (
              <NewProductForm
                categories={categories}
                suppliers={suppliers}
                brands={brands}
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
