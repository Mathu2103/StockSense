import React, { useMemo, useState } from 'react';
import ProductFilters from './SubComponents/ProductFilters';
export type ProductStatus = 'Active' | 'Inactive' | 'Disconnected';
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export type ProductItem = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  subcategory: string;
  supplier: string;
  brand: string;
  unitType: string;
  stock: number;
  reorderLevel: number;
  targetCapacity?: number;
  costPrice: number;
  sellingPrice: number;
  status: ProductStatus;
  lastUpdated: string;
  imageUrl?: string | null;
  description?: string;
  mfgDate?: string;
  expiryDate?: string;
};

type ProductsRegistryProps = {
  products: ProductItem[];
  loading: boolean;
  onEdit: (product: ProductItem) => void;
  onArchive: (productId: string, productName: string) => void;
  categories: string[];
  suppliers: string[];
  initialSearch?: string;
  initialCategory?: string;
};

export default function ProductsRegistry({
  products,
  loading,
  onEdit,
  onArchive,
  categories,
  suppliers,
  initialSearch = '',
  initialCategory = 'All Categories',
}: ProductsRegistryProps) {
  // Details view state
  const [viewingProduct, setViewingProduct] = useState<ProductItem | null>(null);

  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [supplierFilter, setSupplierFilter] = useState('All Suppliers');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [quickFilter, setQuickFilter] = useState<'All' | 'Active' | 'Low Stock' | 'Out of Stock'>('All');

  const [reorderPercent, setReorderPercent] = useState<number>(25);
  React.useEffect(() => {
    const configStr = localStorage.getItem('stocksense_settings_config');
    if (configStr) {
      try {
        const config = JSON.parse(configStr);
        if (config.defaultReorderLevel) {
          setReorderPercent(parseInt(config.defaultReorderLevel, 10) || 25);
        }
      } catch (e) {}
    }
  }, [products]);

  const getReorderLimit = (p: ProductItem) => {
    return Math.round((reorderPercent / 100) * (p.targetCapacity || 100));
  };

  const handleArchive = (product: ProductItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}" from the catalog?`
    );

    if (!confirmed) {
      return;
    }

    onArchive(product.id, product.name);
  };

  // Sync initial props if they update (e.g. from Categories View link redirect)
  React.useEffect(() => {
    if (initialCategory !== 'All Categories') {
      setCategoryFilter(initialCategory);
    }
  }, [initialCategory]);

  React.useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  // Reactive calculations for filtered items
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((p) => {
      // 1. Text Search matches Name, SKU, Barcode, or Brand
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.barcode.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query));

      // 2. Select Dropdown Filters
      const matchesCategory =
        categoryFilter === 'All Categories' || p.category === categoryFilter;
      const matchesSupplier =
        supplierFilter === 'All Suppliers' || p.supplier === supplierFilter;
      const matchesStatus =
        statusFilter === 'All Statuses' || p.status === statusFilter;

      // 3. Quick Chips Filters
      let matchesQuick = true;
      if (quickFilter === 'Active') {
        matchesQuick = p.status === 'Active';
      } else if (quickFilter === 'Low Stock') {
        matchesQuick = p.stock > 0 && p.stock <= getReorderLimit(p);
      } else if (quickFilter === 'Out of Stock') {
        matchesQuick = p.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesSupplier && matchesStatus && matchesQuick;
    });
  }, [products, search, categoryFilter, supplierFilter, statusFilter, quickFilter, reorderPercent]);

  // Reactive KPI Calculations
  const kpis = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === 'Active').length;

    // Low stock indicator check: stock <= reorderLevel but > 0
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= getReorderLimit(p)).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;

    // Total Inventory Value sum (cost price * current stock)
    const totalValue = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);

    return { total, active, lowStock, outOfStock, totalValue };
  }, [products, reorderPercent]);

  // Formatting Currency
  const formatCurrency = (val: number) => {
    if (val >= 1000000) {
      return `Rs. ${(val / 1000000).toFixed(2)} Million`;
    }
    return `Rs. ${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">

      {/* 1. Dashboard KPI Cards Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        {/* KPI: Total Products */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Total Products</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-on-surface leading-none">{kpis.total}</span>
            <span className="text-xs font-bold text-outline-variant mb-0.5">items</span>
          </div>
        </div>

        {/* KPI: Active Products */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Active Products</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 leading-none">{kpis.active}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-0.5">
              Live
            </span>
          </div>
        </div>

        {/* KPI: Low Stock */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Low Stock Products</p>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-extrabold leading-none ${kpis.lowStock > 0 ? 'text-[#d97706]' : 'text-on-surface'}`}>
              {kpis.lowStock}
            </span>
            {kpis.lowStock > 0 && (
              <span className="text-[10px] font-bold text-[#d97706] bg-[#fffbeb] px-2 py-0.5 rounded-full mb-0.5 animate-pulse">
                Alert
              </span>
            )}
          </div>
        </div>

        {/* KPI: Out of Stock */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Out of Stock</p>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-extrabold leading-none ${kpis.outOfStock > 0 ? 'text-red-600' : 'text-on-surface'}`}>
              {kpis.outOfStock}
            </span>
            {kpis.outOfStock > 0 && (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full mb-0.5 animate-pulse">
                Critical
              </span>
            )}
          </div>
        </div>

        {/* KPI: Total Inventory Value */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Inventory Value</p>
          <div className="flex items-end gap-2">
            <span className="text-xl font-black text-primary leading-none tracking-tight">
              {formatCurrency(kpis.totalValue)}
            </span>
          </div>
        </div>

      </div>

      {/* 2. Advanced Search & Filtering Block */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
        <ProductFilters
          search={search}
          setSearch={setSearch}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          supplierFilter={supplierFilter}
          setSupplierFilter={setSupplierFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          quickFilter={quickFilter}
          setQuickFilter={setQuickFilter}
          categories={categories}
          suppliers={suppliers}
        />
      </div>

      {/* 3. Products Registry Grid & Table list */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">

        {loading ? (
          /* Skeleton Loader layout */
          <div className="p-6 space-y-4">
            <div className="h-8 bg-slate-100 rounded animate-pulse w-1/4"></div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="grid grid-cols-6 gap-4 py-3 border-b border-slate-100">
                  <div className="h-4 bg-slate-100 rounded animate-pulse col-span-2"></div>
                  <div className="h-4 bg-slate-100 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-100 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-100 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-100 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 border border-outline-variant rounded-full flex items-center justify-center mb-4 text-outline-variant">
              <span className="material-symbols-outlined text-3xl">inventory_2</span>
            </div>
            <h3 className="text-base font-bold text-on-surface mb-1">No Supermarket Products Found</h3>
            <p className="text-xs text-outline max-w-sm mb-6">
              {products.length === 0
                ? "Your product catalog is empty. Click 'Add Product' above to register new grocery items."
                : "No items match your search term or filter parameters. Try clearing your filters."}
            </p>
            {products.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('All Categories');
                  setSupplierFilter('All Suppliers');
                  setStatusFilter('All Statuses');
                  setQuickFilter('All');
                }}
                className="px-5 py-2 bg-secondary-container text-primary rounded-lg text-xs font-bold hover:bg-secondary-container/80 transition-colors shadow-sm"
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        ) : (
          /* High-Fidelity Products Table Registry */
          <div className="w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-outline-variant/60 text-[10px] font-bold text-outline uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 text-left min-w-[220px]">Product Details</th>
                  <th className="px-4 py-3.5 text-left">SKU / Barcode</th>
                  <th className="px-4 py-3.5 text-center">Category</th>
                  <th className="px-4 py-3.5 text-left">Supplier</th>
                  <th className="px-4 py-3.5 text-center">Unit Type</th>
                  <th className="px-4 py-3.5 text-right">Stock / Capacity</th>
                  <th className="px-4 py-3.5 text-right">Reorder Limit</th>
                  <th className="px-4 py-3.5 text-right">Selling Price</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-on-surface-variant">
                {filteredProducts.map((p) => {
                  // Determine stock alert styles
                  const isOutOfStock = p.stock === 0;
                  const isLowStock = p.stock > 0 && p.stock <= getReorderLimit(p);

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setViewingProduct(p)}
                      className="hover:bg-primary/5 transition-all duration-200 cursor-pointer group border-l-4 border-l-transparent hover:border-l-primary"
                      title="Click row to view details"
                    >
                      {/* Name Card */}
                      <td className="px-5 py-4.5 min-w-[220px] text-left">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200/80 shadow-sm shrink-0 bg-white group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs uppercase shrink-0 shadow-sm group-hover:scale-105 transition-transform bg-gradient-to-tr ${
                              p.category.includes('Beverage') ? 'from-indigo-500 to-purple-600' :
                              p.category.includes('Dairy') ? 'from-teal-400 to-emerald-600' :
                              p.category.includes('Grocery') ? 'from-emerald-500 to-green-600' :
                              p.category.includes('Snacks') || p.category.includes('Bakery') ? 'from-amber-400 to-orange-600' : 
                              p.category.includes('Household') ? 'from-cyan-400 to-blue-600' : 'from-slate-400 to-slate-600'
                            }`}>
                              {p.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="block font-extrabold text-on-surface text-sm truncate group-hover:text-primary transition-colors">{p.name}</span>
                            <span className="block text-[10px] text-outline mt-0.5 font-semibold">
                              {p.brand ? `${p.brand} • ` : ''}{p.subcategory || 'General'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU / Barcode */}
                      <td className="px-4 py-4.5 whitespace-nowrap text-left">
                        <span className="block font-bold text-on-surface text-xs">{p.sku}</span>
                        <span className="block text-[10px] text-outline mt-0.5">{p.barcode}</span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4.5 whitespace-nowrap text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-md font-bold text-[10px] border ${
                          p.category.includes('Beverage') ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                          p.category.includes('Dairy') ? 'bg-teal-50 text-teal-700 border-teal-100' :
                          p.category.includes('Grocery') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          p.category.includes('Snacks') || p.category.includes('Bakery') ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                          p.category.includes('Household') ? 'bg-cyan-50 text-cyan-700 border-cyan-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                        }`}>
                          {p.category}
                        </span>
                      </td>

                      {/* Supplier */}
                      <td className="px-4 py-4.5 whitespace-nowrap text-left">
                        <div className="flex items-center gap-1 text-outline font-semibold text-xs">
                          <span className="material-symbols-outlined text-[13px] text-outline-variant">local_shipping</span>
                          <span>{p.supplier}</span>
                        </div>
                      </td>

                      {/* Unit Type */}
                      <td className="px-4 py-4.5 whitespace-nowrap text-center font-bold text-xs text-on-surface-variant">
                        {p.unitType}
                      </td>

                      {/* Current Stock */}
                      <td className="px-4 py-4.5 text-right whitespace-nowrap">
                        <div className="inline-flex flex-col items-end">
                          <span className={`text-xs font-black ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-[#d97706]' : 'text-on-surface'}`}>
                            {p.stock.toLocaleString()} / {(p.targetCapacity || 100).toLocaleString()}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black tracking-wide mt-1.5 shadow-sm ${
                            isOutOfStock ? 'bg-red-50 text-red-700 border-red-100' :
                            isLowStock ? 'bg-amber-50 text-[#d97706] border-amber-100' :
                            'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${isOutOfStock ? 'bg-red-600' : isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                            <span>{isOutOfStock ? 'OUT OF STOCK' : isLowStock ? 'LOW STOCK' : 'IN STOCK'}</span>
                          </span>
                        </div>
                      </td>

                      {/* Reorder Level */}
                      <td className="px-4 py-4.5 text-right whitespace-nowrap font-bold text-xs text-outline">
                        {getReorderLimit(p).toLocaleString()} ({reorderPercent}%)
                      </td>

                      {/* Selling Price */}
                      <td className="px-4 py-4.5 text-right whitespace-nowrap font-black text-sm text-primary">
                        Rs. {p.sellingPrice.toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEdit(p)}
                            title="Edit Product"
                            className="p-1.5 text-outline-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleArchive(p)}
                            title="Delete Product"
                            className="p-1.5 text-outline-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/60 shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">inventory</span>
                <h3 className="text-sm font-bold text-on-surface">Product Specification Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Product Header Card */}
              <div className="flex items-start gap-4 p-4 bg-slate-50 border border-outline-variant/60 rounded-xl">
                {viewingProduct.imageUrl ? (
                  <img
                    src={viewingProduct.imageUrl}
                    alt={viewingProduct.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0 bg-white"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-primary text-white font-black text-2xl uppercase shrink-0 shadow-sm">
                    {viewingProduct.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <span className="inline-block bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-1">
                    {viewingProduct.status}
                  </span>
                  <h4 className="text-base font-extrabold text-on-surface leading-snug line-clamp-2">{viewingProduct.name}</h4>
                  <p className="text-xs text-outline font-semibold mt-1">
                    {viewingProduct.brand ? `${viewingProduct.brand} • ` : ''}{viewingProduct.subcategory || 'General'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {viewingProduct.description && (
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-outline uppercase tracking-wider">Description</span>
                  <p className="text-xs text-on-surface-variant leading-relaxed bg-white p-3 border border-outline-variant/60 rounded-lg">
                    {viewingProduct.description}
                  </p>
                </div>
              )}

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50/50 p-3 border border-outline-variant/40 rounded-lg">
                  <span className="block text-[9px] font-bold text-outline uppercase tracking-wider">SKU ID</span>
                  <span className="block text-xs font-bold text-on-surface mt-0.5">{viewingProduct.sku}</span>
                </div>
                <div className="bg-slate-50/50 p-3 border border-outline-variant/40 rounded-lg">
                  <span className="block text-[9px] font-bold text-outline uppercase tracking-wider">Barcode / EAN</span>
                  <span className="block text-xs font-bold text-on-surface mt-0.5">{viewingProduct.barcode}</span>
                </div>
                <div className="bg-slate-50/50 p-3 border border-outline-variant/40 rounded-lg">
                  <span className="block text-[9px] font-bold text-outline uppercase tracking-wider">Category</span>
                  <span className="block text-xs font-bold text-on-surface mt-0.5">{viewingProduct.category}</span>
                </div>
                <div className="bg-slate-50/50 p-3 border border-outline-variant/40 rounded-lg">
                  <span className="block text-[9px] font-bold text-outline uppercase tracking-wider">Supplier</span>
                  <span className="block text-xs font-bold text-on-surface mt-0.5">{viewingProduct.supplier}</span>
                </div>
              </div>

              {/* Stock and Reorder Status Section */}
              <div className="border border-outline-variant/60 rounded-xl p-4 space-y-3">
                <h5 className="text-[10px] font-black text-outline uppercase tracking-wider">Stock Levels & Capacity</h5>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-outline font-semibold">Current Stock / Target Capacity</span>
                    <span className="text-sm font-extrabold text-on-surface mt-0.5">
                      {viewingProduct.stock} / {viewingProduct.targetCapacity || 100} {viewingProduct.unitType}(s)
                    </span>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                    viewingProduct.stock === 0 ? 'bg-red-50 text-red-600' :
                    viewingProduct.stock <= getReorderLimit(viewingProduct) ? 'bg-amber-50 text-[#d97706]' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {viewingProduct.stock === 0 ? 'Out of Stock' :
                     viewingProduct.stock <= getReorderLimit(viewingProduct) ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                {/* Stock progress bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (viewingProduct.stock / (viewingProduct.targetCapacity || 100)) * 100)}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      viewingProduct.stock === 0 ? 'bg-red-500' :
                      viewingProduct.stock <= getReorderLimit(viewingProduct) ? 'bg-amber-500' : 'bg-primary'
                    }`}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-outline-variant">
                  <span>Reorder Point: {getReorderLimit(viewingProduct)} units ({reorderPercent}%)</span>
                  <span>{Math.round((viewingProduct.stock / (viewingProduct.targetCapacity || 100)) * 100)}% Filled</span>
                </div>
              </div>

              {/* Financial Breakdown Section */}
              <div className="border border-outline-variant/60 rounded-xl p-4 space-y-3 bg-emerald-50/20">
                <h5 className="text-[10px] font-black text-outline uppercase tracking-wider text-emerald-800">Financial Breakdown</h5>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-outline font-semibold">Cost Price</span>
                    <span className="text-xs font-extrabold text-on-surface">Rs. {viewingProduct.costPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-outline font-semibold">Selling Price</span>
                    <span className="text-xs font-extrabold text-on-surface">Rs. {viewingProduct.sellingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-outline font-semibold">Profit Margin</span>
                    <span className="text-xs font-extrabold text-emerald-600">
                      Rs. {(viewingProduct.sellingPrice - viewingProduct.costPrice).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-outline-variant/40 pt-2 text-[10px] font-bold text-outline-variant">
                  <span>Markup: {((viewingProduct.sellingPrice - viewingProduct.costPrice) / (viewingProduct.costPrice || 1) * 100).toFixed(1)}%</span>
                  <span>Profit Margin %: {((viewingProduct.sellingPrice - viewingProduct.costPrice) / (viewingProduct.sellingPrice || 1) * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Expiry and Batch Details */}
              {(viewingProduct.mfgDate || viewingProduct.expiryDate || (viewingProduct as any).batchNumber) && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">event_note</span>
                    Expiry & Batch Details
                  </h5>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="block text-[9px] text-outline font-semibold">Mfg Date</span>
                      <span className="font-bold text-on-surface">{viewingProduct.mfgDate || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-outline font-semibold">Expiry Date</span>
                      <span className="font-bold text-on-surface">{viewingProduct.expiryDate || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-outline font-semibold">Batch Number</span>
                      <span className="font-bold text-on-surface">{(viewingProduct as any).batchNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 bg-slate-50 border-t flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

