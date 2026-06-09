import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../Shared/Sidebar';
import InventoryHeader from '../Shared/InventoryHeader';

// Import our modular subcomponents
import ProductsRegistry, { ProductItem } from './ProductManagementComponents/ProductsRegistry';
import CategoryRegistry from './ProductManagementComponents/CategoryRegistry';
import NewProductForm from './ProductManagementComponents/NewProductForm';
import BrandRegistry, { BrandItem } from './ProductManagementComponents/BrandRegistry';
import { SupplierItem } from './ProductManagementComponents/SupplierRegistry';

export type SubCategoryNode = {
  id: string;
  name: string;
  status: string;
  productsCount?: number;
};

export type CategoryItem = {
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

// Initial preloaded mock supermarket categories matching specifications
const initialCategories: CategoryItem[] = [
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
      { id: 'rice-flour', name: 'Rice & Flour', status: 'Active' },
      { id: 'spices', name: 'Spices & Condiments', status: 'Active' },
      { id: 'biscuits', name: 'Biscuits & Snacks', status: 'Active' },
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
      { id: 'milk', name: 'Milk Products', status: 'Active' },
      { id: 'cheese', name: 'Cheese Products', status: 'Active' },
      { id: 'yogurt', name: 'Yogurt & Cream', status: 'Active' },
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
      { id: 'bread', name: 'Loaf Bread', status: 'Active' },
      { id: 'cookies', name: 'Cookies & Pastries', status: 'Active' },
      { id: 'buns', name: 'Buns & Cakes', status: 'Active' },
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
      { id: 'ice-cream', name: 'Ice Cream', status: 'Active' },
      { id: 'meat-seafood', name: 'Frozen Meat & Seafood', status: 'Active' },
      { id: 'veg', name: 'Frozen Vegetables', status: 'Active' },
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
      { id: 'soft-drinks', name: 'Soft Drinks', status: 'Active' },
      { id: 'fruit-juices', name: 'Juice', status: 'Active' },
      { id: 'water', name: 'Water', status: 'Active' },
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
      { id: 'detergent', name: 'Detergents & Soaps', status: 'Active' },
      { id: 'utensils', name: 'Cleaning Utensils', status: 'Active' },
      { id: 'paper-goods', name: 'Tissues & Wipes', status: 'Active' },
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

const PRODUCT_STORAGE_KEY = 'stocksense_product_catalog_products';

const formatUpdatedAt = () =>
  new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

const buildSku = (name: string, category: string) => {
  const prefixSource = `${category || name || 'PRD'}`.replace(/[^a-zA-Z]/g, '');
  const prefix = (prefixSource.slice(0, 3) || 'PRD').toUpperCase();
  const suffix = Date.now().toString().slice(-5);
  return `${prefix}-${suffix}`;
};

const normalizeProduct = (product: Partial<ProductItem> & Record<string, any>, fallbackIndex: number): ProductItem => {
  const fallbackName = product.name?.trim() || `Product ${fallbackIndex + 1}`;
  const fallbackCategory = product.category?.trim() || 'Uncategorized';

  return {
    id: String(product.id || `prod_${Date.now()}_${fallbackIndex}`),
    name: fallbackName,
    sku: String(product.sku || buildSku(fallbackName, fallbackCategory)),
    barcode: String(product.barcode || `479${Math.floor(1000000000 + Math.random() * 9000000000)}`),
    category: fallbackCategory,
    subcategory: String(product.subcategory || ''),
    supplier: String(product.supplier || 'Unassigned Supplier'),
    brand: String(product.brand || 'Unbranded'),
    unitType: String(product.unitType || 'Piece'),
    stock: Number(product.stock ?? 0),
    reorderLevel: Number(product.reorderLevel ?? 0),
    targetCapacity: Number(product.targetCapacity ?? (product.reorderLevel ? (product.reorderLevel * 4) : 100)),
    costPrice: Number(product.costPrice ?? 0),
    sellingPrice: Number(product.sellingPrice ?? 0),
    status: ['Active', 'Inactive', 'Disconnected'].includes(product.status as string) ? (product.status as 'Active' | 'Inactive' | 'Disconnected') : 'Active',
    lastUpdated: String(product.lastUpdated || formatUpdatedAt()),
    imageUrl: product.imageUrl || product.frontImageUrl || null,
    description: String(product.description || ''),
    mfgDate: String(product.mfgDate || ''),
    expiryDate: String(product.expiryDate || '')
  };
};

const loadStoredProducts = (): ProductItem[] => {
  if (typeof window === 'undefined') {
    return initialProducts;
  }

  const stored = window.localStorage.getItem(PRODUCT_STORAGE_KEY);
  if (!stored) {
    return initialProducts;
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return initialProducts;
    }

    return parsed.map((product, index) => normalizeProduct(product, index));
  } catch {
    return initialProducts;
  }
};

export default function ProductManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'products';

  // React shared catalog states
  const [products, setProducts] = useState<ProductItem[]>(() => loadStoredProducts());
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);

  // preloaded brands directory
  const [brands, setBrands] = useState<BrandItem[]>([
    { id: 'b-1', name: 'Anchor', description: 'Premium dairy products and milk powders.', status: 'Active' },
    { id: 'b-2', name: 'Coca-Cola', description: 'Carbonated soft drinks and beverages.', status: 'Active' },
    { id: 'b-3', name: 'Sunlight', description: 'Leading household cleaning and laundry brands.', status: 'Active' },
    { id: 'b-4', name: 'Signal', description: 'Oral healthcare and toothpastes.', status: 'Active' },
    { id: 'b-5', name: 'Munchee', description: 'Biscuits, wafers, and bakery snacks.', status: 'Active' },
  ]);

  // preloaded suppliers directory from localStorage
  const [suppliers] = useState<SupplierItem[]>(() => {
    try {
      const stored = window.localStorage.getItem('stocksense_suppliers_registry');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored suppliers', e);
    }
    return [
      { id: 's-1', name: 'FreshFarm Supplies', phone: '+94 77 123 4567', email: 'sales@freshfarm.lk', address: '45 Orchard Lane, Colombo 03', status: 'Active' },
      { id: 's-2', name: 'Golden Crust Bakery', phone: '+94 11 234 5678', email: 'orders@goldencrust.lk', address: '12 Bakery Lane, Kandy', status: 'Active' },
      { id: 's-3', name: 'Ocean Harvest', phone: '+94 91 345 6789', email: 'supply@oceanharvest.lk', address: '78 Fishery Pier, Galle', status: 'Active' },
      { id: 's-4', name: 'Ceylon Beverage Distributors', phone: '+94 71 456 7890', email: 'info@ceylonbev.lk', address: '102 Industrial Zone, Orugodawatta', status: 'Active' }
    ];
  });

  // Filter redirection state
  const [initialSearch] = useState('');
  const [initialCategory] = useState('All Categories');

  // Edit target state
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  // Handle URL redirects for Quick Create "Add Product"
  useEffect(() => {
    if (activeTab === 'new-product') {
      setEditingProduct(null);
      setIsNewProductModalOpen(true);
      setSearchParams({ tab: 'products' }, { replace: true });
    }
  }, [activeTab, setSearchParams]);

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
              children: [...parent.children, { id: `sub_${Date.now()}`, name: newCat.name, status: 'Active' }]
            };
          }
          return parent;
        })
      );
      showToast(`Subcategory "${newCat.name}" added under parent successfully.`);
    }
  };

  // Toggle Category Status (Archive/Restore)
  const handleToggleCategoryStatus = (id: string, targetStatus: 'Active' | 'Inactive') => {
    if (targetStatus === 'Active') {
      if (!window.confirm(`Are you sure you want to mark this category as ${targetStatus}?`)) return;
    }

    let targetCategoryName = '';
    setCategories((prev) => prev.map((c) => {
      if (c.id === id) {
        targetCategoryName = c.name;
        return {
          ...c,
          status: targetStatus,
          children: c.children.map(sub => ({ ...sub, status: targetStatus }))
        };
      }
      return c;
    }));

    if (targetCategoryName) {
      setProducts((prev) => prev.map((p) => p.category === targetCategoryName ? { ...p, status: targetStatus } : p));
    }
    showToast(`Category marked as ${targetStatus} successfully.`, 'info');
  };

  // Toggle Subcategory Status (Archive/Restore)
  const handleToggleSubcategoryStatus = (parentId: string, subId: string, targetStatus: 'Active' | 'Inactive') => {
    if (targetStatus === 'Active') {
      if (!window.confirm(`Are you sure you want to mark this subcategory as ${targetStatus}?`)) return;
    }

    let targetSubName = '';
    setCategories((prev) => prev.map((c) => {
      if (c.id === parentId) {
        return {
          ...c,
          children: c.children.map(sub => {
            if (sub.id === subId) {
              targetSubName = sub.name;
              return { ...sub, status: targetStatus };
            }
            return sub;
          })
        };
      }
      return c;
    }));

    if (targetSubName) {
      setProducts((prev) => prev.map((p) => p.subcategory === targetSubName ? { ...p, status: targetStatus } : p));
    }
    showToast(`Subcategory marked as ${targetStatus} successfully.`, 'info');
  };

  // Edit Category node
  const handleEditCategoryNode = (id: string, updatedName: string, updatedDescription: string, updatedImage?: string | null) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: updatedName, description: updatedDescription, ...(updatedImage !== undefined ? { image: updatedImage || c.image } : {}) } : c))
    );
    showToast('Category updated successfully.');
  };

  // Edit Subcategory node
  const handleEditSubcategoryNode = (parentId: string, subId: string, updatedName: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === parentId) {
          return {
            ...c,
            children: c.children.map((sub) => sub.id === subId ? { ...sub, name: updatedName } : sub)
          };
        }
        return c;
      })
    );
    showToast('Subcategory updated successfully.');
  };

  // Brand registry handlers
  const handleAddBrand = (newBrand: Omit<BrandItem, 'id' | 'status'>) => {
    const added = { ...newBrand, id: `b_${Date.now()}`, status: 'Active' as const };
    setBrands((prev) => [...prev, added]);
    showToast(`Brand "${newBrand.name}" added successfully.`);
  };

  const handleEditBrand = (id: string, updatedFields: Partial<BrandItem>) => {
    setBrands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updatedFields } : b))
    );
    showToast('Brand updated successfully.');
  };

  const handleToggleBrandStatus = (id: string, targetStatus: 'Active' | 'Inactive') => {
    const brand = brands.find(b => b.id === id);
    if (!brand) return;
    if (!window.confirm(`Are you sure you want to mark the brand "${brand.name}" as ${targetStatus}?`)) return;

    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, status: targetStatus } : b)));
    showToast(`Brand marked as ${targetStatus}.`, 'info');
  };

  // Save product (handles both Create and Edit)
  const handleSaveProduct = (formData: any) => {
    setLoading(true);
    window.setTimeout(() => {
      const existingProduct = editingProduct || products.find((product) => product.id === formData.id);
      const variantProducts = Array.isArray(formData.variants) ? formData.variants : [];
      const representativeVariant = variantProducts[0];
      const variantStock = variantProducts.reduce((sum: number, variant: { stock?: number }) => sum + Number(variant.stock || 0), 0);
      const variantReorderLevel = variantProducts.length
        ? Math.min(...variantProducts.map((variant: { reorderLevel?: number }) => Number(variant.reorderLevel || 0)))
        : 0;
      const productRecord: ProductItem = {
        id: existingProduct?.id || String(formData.id || `prod_${Date.now()}`),
        name: String(formData.name || existingProduct?.name || 'Untitled Product'),
        sku: existingProduct?.sku || String(formData.sku || representativeVariant?.sku || buildSku(formData.name || existingProduct?.name || 'Untitled Product', formData.category || existingProduct?.category || 'Uncategorized')),
        barcode: String(
          formData.barcode ||
          representativeVariant?.barcode ||
          existingProduct?.barcode ||
          `479${Math.floor(1000000000 + Math.random() * 9000000000)}`
        ),
        category: String(formData.category || existingProduct?.category || 'Uncategorized'),
        subcategory: String(formData.subcategory || existingProduct?.subcategory || ''),
        supplier: String(formData.supplier || existingProduct?.supplier || 'Unassigned Supplier'),
        brand: String(formData.brand || existingProduct?.brand || 'Unbranded'),
        unitType: String(
          formData.unitType ||
          representativeVariant?.unit ||
          existingProduct?.unitType ||
          'Piece'
        ),
        stock: formData.productStructure === 'variant' ? variantStock : Number(formData.stock ?? existingProduct?.stock ?? 0),
        reorderLevel: formData.productStructure === 'variant'
          ? variantReorderLevel
          : Number(formData.reorderLevel ?? existingProduct?.reorderLevel ?? 0),
        targetCapacity: formData.productStructure === 'variant'
          ? (representativeVariant?.targetCapacity || 100)
          : Number(formData.targetCapacity ?? existingProduct?.targetCapacity ?? 100),
        costPrice: formData.productStructure === 'variant'
          ? Number(representativeVariant?.costPrice ?? existingProduct?.costPrice ?? 0)
          : Number(formData.costPrice ?? existingProduct?.costPrice ?? 0),
        sellingPrice: formData.productStructure === 'variant'
          ? Number(representativeVariant?.sellingPrice ?? existingProduct?.sellingPrice ?? 0)
          : Number(formData.sellingPrice ?? existingProduct?.sellingPrice ?? 0),
        status: formData.status || existingProduct?.status || 'Active',
        lastUpdated: formatUpdatedAt(),
        imageUrl: formData.frontImageUrl || formData.imageUrl || existingProduct?.imageUrl || null,
        description: String(formData.description || existingProduct?.description || ''),
        mfgDate: String(formData.mfgDate || existingProduct?.mfgDate || ''),
        expiryDate: String(formData.expiryDate || existingProduct?.expiryDate || '')
      };

      if (editingProduct) {
        // Edit flow
        setProducts((prev) =>
          prev.map((p) => (p.id === productRecord.id ? productRecord : p))
        );
        showToast(`Product "${productRecord.name}" updated successfully.`);
      } else {
        // Create flow
        setProducts((prev) => [productRecord, ...prev]);
        showToast(`Product "${productRecord.name}" created successfully.`);
      }
      setEditingProduct(null);
      setLoading(false);
      setIsNewProductModalOpen(false);
    }, 400);
  };

  // Row Action Handlers
  const handleEditProduct = (product: ProductItem) => {
    setEditingProduct(product);
    setIsNewProductModalOpen(true);
  };



  // Function to handle moving a product to archive (or mark Inactive)
  const handleArchiveProduct = (id: string, name: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Inactive' } : p))
    );
    showToast(`Product "${name}" has been marked as Inactive`, 'info');
  };






  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-on-surface">
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

              <button
                type="button"
                onClick={() => { setEditingProduct(null); setIsNewProductModalOpen(true); }}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add New Product
              </button>
            </div>

            {/* Segment Controls Navigation Tab Bar */}
            <div className="border-b border-outline-variant pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="inline-flex p-1 bg-surface-container-low border border-outline-variant/60 rounded-lg text-xs font-medium w-full sm:w-auto overflow-x-auto gap-1">
                  <button
                    type="button"
                    onClick={() => handleTabChange('products')}
                    className={`px-4 py-1.5 rounded-md transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-white text-primary shadow-sm font-black' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                  >
                    Products Registry
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('categories')}
                    className={`px-4 py-1.5 rounded-md transition-all whitespace-nowrap ${activeTab === 'categories' ? 'bg-white text-primary shadow-sm font-black' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                  >
                    Category Registry
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('brands')}
                    className={`px-4 py-1.5 rounded-md transition-all whitespace-nowrap ${activeTab === 'brands' ? 'bg-white text-primary shadow-sm font-black' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                  >
                    Brands
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
                products={products}

                onAddCategory={handleAddCategoryNode}
                onEditCategory={handleEditCategoryNode}
                onEditSubcategory={handleEditSubcategoryNode}
                onAddSubcategory={() => { }}
                onArchiveCategory={(id) => handleToggleCategoryStatus(id, 'Inactive')}
                onRestoreCategory={(id) => handleToggleCategoryStatus(id, 'Active')}
                onArchiveSubcategory={(parentId, subId) => handleToggleSubcategoryStatus(parentId, subId, 'Inactive')}
                onRestoreSubcategory={(parentId, subId) => handleToggleSubcategoryStatus(parentId, subId, 'Active')}
                onEditProduct={(p) => {
                  setEditingProduct(p);
                  setIsNewProductModalOpen(true);
                }}
                onArchiveProduct={handleArchiveProduct}
              />
            )}

            {activeTab === 'brands' && (
              <BrandRegistry
                brands={brands}
                onAddBrand={handleAddBrand}
                onEditBrand={handleEditBrand}
                onArchiveBrand={(id) => handleToggleBrandStatus(id, 'Inactive')}
                onRestoreBrand={(id) => handleToggleBrandStatus(id, 'Active')}
              />
            )}

            {isNewProductModalOpen && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm">
                <div className="bg-background rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-lowest rounded-t-2xl shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[24px]">
                        {editingProduct ? 'edit' : 'add_box'}
                      </span>
                      <h2 className="text-lg font-black text-on-surface">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewProductModalOpen(false);
                        setEditingProduct(null);
                      }}
                      className="p-1.5 text-outline hover:text-on-surface hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                  
                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <NewProductForm
                      categories={categories}
                      suppliers={suppliers}
                      brands={brands}
                      onSave={handleSaveProduct}
                      onCancel={(discarded) => {
                        if (discarded) showToast('Product form discarded.', 'info');
                        setIsNewProductModalOpen(false);
                        setEditingProduct(null);
                      }}
                      initialProduct={editingProduct}
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

        </main>
      </div>

    </div>
  );
}
