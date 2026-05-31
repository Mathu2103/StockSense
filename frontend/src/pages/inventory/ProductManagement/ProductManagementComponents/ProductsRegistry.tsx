import React, { useMemo, useState } from 'react';
import ProductFilters from './SubComponents/ProductFilters';

export type ProductStatus = 'Active' | 'Inactive' | 'Discontinued';
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
  onDuplicate: (product: ProductItem) => void;
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
  onDuplicate,
  onArchive,
  categories,
  suppliers,
  initialSearch = '',
  initialCategory = 'All Categories',
}: ProductsRegistryProps) {
  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [supplierFilter, setSupplierFilter] = useState('All Suppliers');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [quickFilter, setQuickFilter] = useState<'All' | 'Active' | 'Low Stock' | 'Out of Stock'>('All');

  // Selected view detail product modal
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

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
        matchesQuick = p.stock > 0 && p.stock <= p.reorderLevel;
      } else if (quickFilter === 'Out of Stock') {
        matchesQuick = p.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesSupplier && matchesStatus && matchesQuick;
    });
  }, [products, search, categoryFilter, supplierFilter, statusFilter, quickFilter]);

  // Reactive KPI Calculations
  const kpis = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === 'Active').length;

    // Low stock indicator check: stock <= reorderLevel but > 0
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.reorderLevel).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;

    // Total Inventory Value sum (cost price * current stock)
    const totalValue = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);

    return { total, active, lowStock, outOfStock, totalValue };
  }, [products]);

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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-outline-variant text-[11px] font-bold text-outline uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4 min-w-[200px]">Product Details</th>
                  <th className="px-4 py-4">SKU / Barcode</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Supplier</th>
                  <th className="px-4 py-4">Unit Type</th>
                  <th className="px-4 py-4 text-right">Current Stock</th>
                  <th className="px-4 py-4 text-right">Reorder Level</th>
                  <th className="px-4 py-4 text-right">Cost Price</th>
                  <th className="px-4 py-4 text-right">Selling Price</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-4 py-4 text-center">Last Updated</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-on-surface-variant">
                {filteredProducts.map((p) => {
                  // Determine stock alert styles
                  const isOutOfStock = p.stock === 0;
                  const isLowStock = p.stock > 0 && p.stock <= p.reorderLevel;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name Card */}
                      <td className="px-5 py-4.5 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200/80 shadow-sm shrink-0 bg-white"
                            />
                          ) : (
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-xs uppercase shrink-0 shadow-sm ${p.category.includes('Beverage') ? 'bg-indigo-600' :
                              p.category.includes('Dairy') ? 'bg-teal-600' :
                                p.category.includes('Grocery') ? 'bg-emerald-600' :
                                  p.category.includes('Snacks') ? 'bg-amber-600' : 'bg-slate-600'
                              }`}>
                              {p.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="block font-bold text-on-surface text-sm truncate">{p.name}</span>
                            <span className="block text-[10px] text-outline mt-0.5">
                              {p.brand ? `${p.brand} • ` : ''}{p.subcategory || 'General'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU / Barcode */}
                      <td className="px-4 py-4.5 whitespace-nowrap">
                        <span className="block font-bold text-on-surface">{p.sku}</span>
                        <span className="block text-[10px] text-outline mt-0.5">{p.barcode}</span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4.5 whitespace-nowrap">
                        <span className="bg-slate-100 text-on-surface-variant px-2.5 py-1 rounded-md font-bold text-[10px]">
                          {p.category}
                        </span>
                      </td>

                      {/* Supplier */}
                      <td className="px-4 py-4.5 whitespace-nowrap text-outline">
                        {p.supplier}
                      </td>

                      {/* Unit Type */}
                      <td className="px-4 py-4.5 whitespace-nowrap font-bold">
                        {p.unitType}
                      </td>

                      {/* Current Stock */}
                      <td className="px-4 py-4.5 text-right whitespace-nowrap">
                        <div className="inline-flex flex-col items-end">
                          <span className={`text-sm font-black ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-[#d97706]' : 'text-on-surface'
                            }`}>
                            {p.stock.toLocaleString()}
                          </span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1 ${isOutOfStock ? 'bg-red-50 text-red-600' :
                            isLowStock ? 'bg-[#fffbeb] text-[#d97706]' :
                              'bg-emerald-50 text-emerald-600'
                            }`}>
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>
                      </td>

                      {/* Reorder Level */}
                      <td className="px-4 py-4.5 text-right whitespace-nowrap font-bold">
                        {p.reorderLevel.toLocaleString()}
                      </td>

                      {/* Cost Price */}
                      <td className="px-4 py-4.5 text-right whitespace-nowrap font-bold text-outline">
                        Rs. {p.costPrice.toFixed(2)}
                      </td>

                      {/* Selling Price */}
                      <td className="px-4 py-4.5 text-right whitespace-nowrap font-extrabold text-on-surface">
                        Rs. {p.sellingPrice.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4.5 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                          p.status === 'Inactive' ? 'bg-slate-100 text-slate-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {p.status}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="px-4 py-4.5 text-center whitespace-nowrap text-outline">
                        {p.lastUpdated}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedProduct(p)}
                            title="View Product"
                            className="p-1.5 text-outline-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            onClick={() => onEdit(p)}
                            title="Edit Product"
                            className="p-1.5 text-outline-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => onDuplicate(p)}
                            title="Duplicate Product"
                            className="p-1.5 text-outline-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
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

      {/* 4. Product Details View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">inventory_2</span>
                <h2 className="text-lg font-bold text-on-surface">Product Details Sheet</h2>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">

              {/* Product Header Row */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200/80 shadow-sm shrink-0 bg-white"
                  />
                ) : (
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-lg uppercase shrink-0 shadow-sm ${selectedProduct.category.includes('Beverage') ? 'bg-indigo-600' :
                    selectedProduct.category.includes('Dairy') ? 'bg-teal-600' :
                      selectedProduct.category.includes('Grocery') ? 'bg-emerald-600' :
                        selectedProduct.category.includes('Snacks') ? 'bg-amber-600' : 'bg-slate-600'
                    }`}>
                    {selectedProduct.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-extrabold text-on-surface truncate">{selectedProduct.name}</h3>
                  <p className="text-xs text-outline mt-1 font-medium">SKU: {selectedProduct.sku} | Barcode: {selectedProduct.barcode}</p>
                </div>
                <div className="shrink-0">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${selectedProduct.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                    selectedProduct.status === 'Inactive' ? 'bg-slate-100 text-slate-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {selectedProduct.status}
                  </span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Category</p>
                  <p className="text-xs font-bold text-on-surface mt-1">{selectedProduct.category}</p>
                  <p className="text-[9px] text-outline mt-0.5">{selectedProduct.subcategory}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Brand</p>
                  <p className="text-xs font-bold text-on-surface mt-1">{selectedProduct.brand || 'No Brand'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Supplier</p>
                  <p className="text-xs font-bold text-on-surface mt-1">{selectedProduct.supplier}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Unit Type</p>
                  <p className="text-xs font-bold text-on-surface mt-1">{selectedProduct.unitType}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Reorder Level</p>
                  <p className="text-xs font-bold text-on-surface mt-1">{selectedProduct.reorderLevel}</p>
                </div>
              </div>

              {/* Pricing & Stock Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Stock Widget */}
                <div className="border border-outline-variant rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-2">Current Stock</span>
                  <div className="flex items-end justify-between mt-auto">
                    <span className="text-2xl font-black text-on-surface">{selectedProduct.stock}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${selectedProduct.stock === 0 ? 'bg-red-50 text-red-600' :
                      selectedProduct.stock <= selectedProduct.reorderLevel ? 'bg-[#fffbeb] text-[#d97706]' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                      {selectedProduct.stock === 0 ? 'Out of Stock' :
                        selectedProduct.stock <= selectedProduct.reorderLevel ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                </div>

                {/* Cost price widget */}
                <div className="border border-outline-variant rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-2">Cost Price</span>
                  <span className="text-2xl font-black text-outline block mt-auto">Rs. {selectedProduct.costPrice.toFixed(2)}</span>
                </div>

                {/* Selling price widget */}
                <div className="border border-outline-variant rounded-xl p-4 flex flex-col justify-between bg-primary/5 border-primary/20">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-2">Selling Price</span>
                  <div className="flex items-end justify-between mt-auto">
                    <span className="text-2xl font-black text-primary">Rs. {selectedProduct.sellingPrice.toFixed(2)}</span>
                    <div className="flex flex-col items-end gap-1 select-none">
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Margin: {selectedProduct.sellingPrice > 0 ? (((selectedProduct.sellingPrice - selectedProduct.costPrice) / selectedProduct.sellingPrice) * 100).toFixed(1) : '0.0'}%
                      </span>
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        Markup: {selectedProduct.costPrice > 0 ? (((selectedProduct.sellingPrice - selectedProduct.costPrice) / selectedProduct.costPrice) * 100).toFixed(1) : '0.0'}%
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Product Description */}
              {selectedProduct.description && (
                <div className="border border-outline-variant/60 rounded-xl p-4 bg-background">
                  <h4 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Product Description</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{selectedProduct.description}</p>
                </div>
              )}

              {/* Expiry and Barcode Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Expiry Widget */}
                <div className="border border-outline-variant rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-3">Expiry Details</span>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-on-surface-variant">
                    <div>
                      <span className="text-[9px] font-bold text-outline uppercase block mb-1">Mfg. Date</span>
                      <span>{selectedProduct.mfgDate || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-outline uppercase block mb-1">Expiry Date</span>
                      <span className={selectedProduct.expiryDate && new Date(selectedProduct.expiryDate) < new Date() ? "text-red-600 font-bold" : ""}>
                        {selectedProduct.expiryDate || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barcode Generator Preview */}
                <div className="border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center bg-white">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-2 self-start">Barcode Preview</span>
                  <div className="flex flex-col items-center justify-center space-y-1 w-full">
                    {/* Beautiful dynamic CSS barcode */}
                    <div className="flex items-center justify-center h-12 gap-[1.5px] px-4 py-1.5 border border-slate-100 bg-white rounded w-full overflow-hidden">
                      {selectedProduct.barcode ? (
                        selectedProduct.barcode.split('').map((char: string, index: number) => {
                          const num = parseInt(char, 10) || 0;
                          const widthClass = num % 3 === 0 ? 'w-[3px]' : num % 2 === 0 ? 'w-[2px]' : 'w-[1px]';
                          const colorClass = index % 4 === 0 && num > 3 ? 'bg-transparent' : 'bg-black';
                          return <div key={index} className={`h-full ${widthClass} ${colorClass}`} />;
                        })
                      ) : (
                        <div className="text-[10px] text-outline">No Barcode</div>
                      )}
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-on-surface mt-1">{selectedProduct.barcode || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Footer Timestamp */}
              <div className="border-t border-slate-100 pt-4 flex justify-between text-[10px] text-outline">
                <span>Created: 1 month ago</span>
                <span>Last Activity: {selectedProduct.lastUpdated}</span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-outline-variant/60">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-5 py-2 bg-white border border-outline rounded-lg text-xs font-bold text-on-surface-variant hover:bg-slate-50 transition-colors shadow-sm"
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
