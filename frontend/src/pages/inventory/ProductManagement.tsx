import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import InventoryHeader from './Components/InventoryHeader';
import StatusBadge from './Components/inventory/StatusBadge';

type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expiring Soon';

type ProductItem = {
  id: number;
  name: string;
  imageClass: string;
  sku: string;
  category: string;
  supplier: string;
  price: string;
  stock: number;
  reorderLevel: number;
  expiryDate: string;
  daysRemaining: number;
  status: ProductStatus;
  statusVariant: 'success' | 'warning' | 'danger';
};

export default function ProductManagement() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [supplierFilter, setSupplierFilter] = useState('All Suppliers');
  const [stockFilter, setStockFilter] = useState('All Stock Status');

  const products: ProductItem[] = [
    {
      id: 1,
      name: 'Whole Organic Milk',
      imageClass: 'bg-teal-800',
      sku: '001294857731',
      category: 'Dairy & Eggs',
      supplier: 'FreshFarm Supplies',
      price: '$4.50',
      stock: 142,
      reorderLevel: 30,
      expiryDate: 'Oct 24, 2023',
      daysRemaining: 12,
      status: 'In Stock',
      statusVariant: 'success',
    },
    {
      id: 2,
      name: 'Artisan Sourdough',
      imageClass: 'bg-amber-800',
      sku: '003884729110',
      category: 'Bakery',
      supplier: 'Golden Crust Bakery',
      price: '$6.25',
      stock: 8,
      reorderLevel: 15,
      expiryDate: 'Oct 12, 2023',
      daysRemaining: 3,
      status: 'Low Stock',
      statusVariant: 'warning',
    },
    {
      id: 3,
      name: 'Premium Avocado Oil',
      imageClass: 'bg-green-800',
      sku: '009922118833',
      category: 'Pantry',
      supplier: 'Olive & Co',
      price: '$14.99',
      stock: 0,
      reorderLevel: 12,
      expiryDate: 'Feb 15, 2024',
      daysRemaining: 0,
      status: 'Out of Stock',
      statusVariant: 'danger',
    },
    {
      id: 4,
      name: 'Fresh Salmon Fillet',
      imageClass: 'bg-orange-400',
      sku: '004455667788',
      category: 'Seafood',
      supplier: 'Ocean Harvest',
      price: '$22.00',
      stock: 34,
      reorderLevel: 10,
      expiryDate: 'Oct 11, 2023',
      daysRemaining: 2,
      status: 'Expiring Soon',
      statusVariant: 'warning',
    },
  ];

  const categoryOptions = ['All Categories', ...new Set(products.map((product) => product.category))];
  const supplierOptions = ['All Suppliers', ...new Set(products.map((product) => product.supplier))];
  const stockOptions = ['All Stock Status', 'In Stock', 'Low Stock', 'Out of Stock', 'Expiring Soon'];

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.supplier.toLowerCase().includes(query);

      const matchesCategory = categoryFilter === 'All Categories' || product.category === categoryFilter;
      const matchesSupplier = supplierFilter === 'All Suppliers' || product.supplier === supplierFilter;
      const matchesStatus = stockFilter === 'All Stock Status' || product.status === stockFilter;

      return matchesSearch && matchesCategory && matchesSupplier && matchesStatus;
    });
  }, [search, categoryFilter, supplierFilter, stockFilter]);

  const handleEdit = (name: string) => window.alert(`Edit product: ${name}`);
  const handleDelete = (name: string) => window.confirm(`Delete ${name}?`);

  const filterChips = [
    { label: 'Search', value: search || 'Any' },
    { label: 'Category', value: categoryFilter },
    { label: 'Supplier', value: supplierFilter },
    { label: 'Status', value: stockFilter },
  ];

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background font-sans text-on-surface">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <InventoryHeader>
          <div className="relative w-full max-w-xl min-w-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
            <input
              type="text"
              placeholder="Search products, SKU or category..."
              className="w-full rounded-lg border border-outline-variant bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </InventoryHeader>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-4 sm:p-6">
          <div className="mx-auto max-w-[1400px] space-y-6">
            <section className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-on-surface sm:text-3xl">Product Inventory</h1>
                <p className="mt-1 text-sm text-outline">Real-time management of stock levels and expiration dates.</p>
              </div>
              <Link
                to="/manage-products/new"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary sm:w-auto"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add New Product
              </Link>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="flex h-32 flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-container text-primary">
                    <span className="material-symbols-outlined text-lg">inventory_2</span>
                  </div>
                  <span className="text-xs font-semibold text-green-600">+2% vs last week</span>
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight text-on-surface">1,284</p>
                  <p className="text-sm font-medium text-outline">Total SKU Items</p>
                </div>
              </div>

              <div className="flex h-32 flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <span className="material-symbols-outlined text-lg">warning</span>
                  </div>
                  <span className="text-xs font-semibold text-red-600">Critical</span>
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight text-on-surface">24</p>
                  <p className="text-sm font-medium text-outline">Out of Stock</p>
                </div>
              </div>

              <div className="flex h-32 flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                    <span className="material-symbols-outlined text-lg">event_busy</span>
                  </div>
                  <span className="text-xs font-semibold text-orange-600">Next 7 Days</span>
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight text-on-surface">12</p>
                  <p className="text-sm font-medium text-outline">Expiring Soon</p>
                </div>
              </div>

              <div className="flex h-32 flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                    <span className="material-symbols-outlined text-lg">trending_up</span>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight text-on-surface">$42.1k</p>
                  <p className="text-sm font-medium text-outline">Inventory Value</p>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between">
              <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 xl:flex-1">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-outline">Search</span>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline-variant">search</span>
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search products, SKU, supplier..."
                      className="w-full rounded-lg border border-outline-variant bg-background py-2.5 pl-10 pr-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-outline">Category</span>
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="rounded-lg border border-outline-variant bg-background px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-outline">Supplier</span>
                  <select
                    value={supplierFilter}
                    onChange={(event) => setSupplierFilter(event.target.value)}
                    className="rounded-lg border border-outline-variant bg-background px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  >
                    {supplierOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-outline">Stock Status</span>
                  <select
                    value={stockFilter}
                    onChange={(event) => setStockFilter(event.target.value)}
                    className="rounded-lg border border-outline-variant bg-background px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  >
                    {stockOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container sm:flex-none">
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                  Grid
                </button>
                <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary bg-secondary-container px-3 py-2 text-sm font-medium text-primary transition-colors sm:flex-none">
                  <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                  Table
                </button>
              </div>
            </section>

            <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
              {filterChips.map((chip) => (
                <div key={chip.label} className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-outline">{chip.label}</p>
                  <p className="mt-1 text-sm font-semibold text-on-surface">{chip.value}</p>
                </div>
              ))}
            </div>

            <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-[1180px] w-full text-left text-sm text-on-surface-variant">
                  <thead className="border-b border-outline-variant bg-background text-xs font-bold uppercase tracking-wider text-outline">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">SKU / Barcode</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Supplier</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Qty</th>
                      <th className="px-6 py-4">Reorder</th>
                      <th className="px-6 py-4">Expiry</th>
                      <th className="px-6 py-4">Days Left</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-on-surface-variant">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td className="px-6 py-10 text-center" colSpan={11}>
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-4xl text-slate-300">inventory_2</span>
                            <p className="font-semibold text-on-surface">No products match your current filters.</p>
                            <p className="text-sm text-outline">Try a different search, supplier, category, or status filter.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="transition-colors hover:bg-background">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-outline-variant text-xs text-white ${product.imageClass}`}>
                                IMG
                              </div>
                              <div>
                                <p className="font-semibold text-on-surface">{product.name}</p>
                                <p className="text-xs text-outline">{product.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-on-surface-variant">{product.sku}</td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-on-surface-variant">{product.category}</span>
                          </td>
                          <td className="px-6 py-4 font-medium text-on-surface-variant">{product.supplier}</td>
                          <td className="px-6 py-4 font-medium text-on-surface">{product.price}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-lg font-bold text-on-surface">{product.stock}</span>
                              <span className="text-[11px] text-outline">units available</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold text-on-surface">{product.reorderLevel}</span>
                              <span className="text-[11px] text-outline">Reorder threshold</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant">{product.expiryDate}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${product.daysRemaining <= 3 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${product.daysRemaining <= 3 ? 'bg-orange-600' : 'bg-green-600'}`} />
                              {product.daysRemaining === 0 ? 'Today' : `${product.daysRemaining} days`}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={product.status} variant={product.statusVariant} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(product.name)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(product.name)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-100"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 p-4 lg:hidden">
                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant bg-background px-4 py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300">inventory_2</span>
                    <p className="font-semibold text-on-surface">No products match your current filters.</p>
                    <p className="text-sm text-outline">Try a different search, supplier, category, or status filter.</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <article key={product.id} className="rounded-2xl border border-outline-variant bg-background p-4 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-outline-variant text-xs font-bold text-white ${product.imageClass}`}>
                          IMG
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="truncate text-base font-semibold text-on-surface">{product.name}</h3>
                              <p className="text-sm text-outline">{product.sku}</p>
                            </div>
                            <StatusBadge status={product.status} variant={product.statusVariant} />
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Category</p>
                              <p className="mt-1 font-semibold text-on-surface">{product.category}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Supplier</p>
                              <p className="mt-1 font-semibold text-on-surface">{product.supplier}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Price</p>
                              <p className="mt-1 font-semibold text-on-surface">{product.price}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Stock</p>
                              <p className="mt-1 font-semibold text-on-surface">{product.stock} units</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Reorder</p>
                              <p className="mt-1 font-semibold text-on-surface">{product.reorderLevel}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Expiry</p>
                              <p className="mt-1 font-semibold text-on-surface">{product.expiryDate}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-container-lowest px-3 py-3">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Days Remaining</p>
                              <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${product.daysRemaining <= 3 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${product.daysRemaining <= 3 ? 'bg-orange-600' : 'bg-green-600'}`} />
                                {product.daysRemaining === 0 ? 'Today' : `${product.daysRemaining} days`}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(product.name)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(product.name)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-100"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-outline-variant bg-background px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                <span className="text-xs font-medium text-outline">Showing {filteredProducts.length} of {products.length} products</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant bg-surface-container-lowest text-outline-variant hover:bg-background">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded border border-primary bg-primary text-xs font-bold text-white">1</button>
                  <button className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant bg-surface-container-lowest text-xs font-medium text-on-surface-variant hover:bg-background">2</button>
                  <button className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant bg-surface-container-lowest text-xs font-medium text-on-surface-variant hover:bg-background">3</button>
                  <span className="text-outline-variant">...</span>
                  <button className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant bg-surface-container-lowest text-outline-variant hover:bg-background">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
