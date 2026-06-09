

type ProductFiltersProps = {
  search: string;
  setSearch: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  supplierFilter: string;
  setSupplierFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  quickFilter: 'All' | 'Active' | 'Low Stock' | 'Out of Stock';
  setQuickFilter: (val: 'All' | 'Active' | 'Low Stock' | 'Out of Stock') => void;
  categories: string[];
  suppliers: string[];
};

export default function ProductFilters({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  supplierFilter,
  setSupplierFilter,
  statusFilter,
  setStatusFilter,
  quickFilter,
  setQuickFilter,
  categories,
  suppliers
}: ProductFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Primary Search & Standard Select Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Search Field */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name, SKU, Barcode..."
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-outline-variant"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          >
            <option value="All Categories">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px] pointer-events-none">
            expand_more
          </span>
        </div>

        {/* Supplier Filter */}
        <div className="relative">
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          >
            <option value="All Suppliers">All Suppliers</option>
            {suppliers.map((sup) => (
              <option key={sup} value={sup}>{sup}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px] pointer-events-none">
            expand_more
          </span>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Disconnected">Disconnected</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px] pointer-events-none">
            expand_more
          </span>
        </div>

      </div>

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
        <span className="text-[11px] font-bold text-outline uppercase tracking-wider mr-2">Quick Filters:</span>
        {(['All', 'Active', 'Low Stock', 'Out of Stock'] as const).map((chip) => {
          const isActive = quickFilter === chip;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => setQuickFilter(chip)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                isActive
                  ? 'bg-primary text-white scale-102 font-black'
                  : 'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-slate-50'
              }`}
            >
              {chip} Products
            </button>
          );
        })}
      </div>
    </div>
  );
}
