import { Supplier } from '../constants/supplierConstants';

interface SupplierListProps {
  suppliersList: Supplier[];
  filteredSuppliers: Supplier[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onSupplierClick: (supplier: Supplier) => void;
  onEditClick: (supplier: Supplier) => void;
  onDeleteClick: (id: string) => void;
  onAddClick: () => void;
}

export default function SupplierList({
  suppliersList,
  filteredSuppliers,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onSupplierClick,
  onEditClick,
  onDeleteClick,
  onAddClick,
}: SupplierListProps) {
  const totalSuppliersCount = suppliersList.length;
  const activeSuppliersCount = suppliersList.filter(s => s.status === 'Active').length;

  return (
    <div className="space-y-6">
      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Suppliers */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-2 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between text-outline">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Suppliers</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Updated</span>
          </div>
          <div className="text-3xl font-black text-on-surface mt-1">{totalSuppliersCount}</div>
          <p className="text-xs text-outline font-medium">Total registered suppliers</p>
        </div>

        {/* Card 2: Active Suppliers */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-2 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between text-emerald-600">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Suppliers</span>
            </div>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-3xl font-black text-on-surface mt-1">{activeSuppliersCount}</div>
          <p className="text-xs text-outline font-medium">Currently supplying products</p>
        </div>
      </div>

      {/* Top Actions Panel */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
        {/* Search & Filter Inputs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by ID, name, contact or email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-background py-2 pl-9 pr-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-outline whitespace-nowrap">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="border border-outline-variant rounded-lg px-3 py-2 text-xs font-bold outline-none bg-surface-container-lowest focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Actions Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onAddClick}
            className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-extrabold hover:bg-primary/95 shadow-sm transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Add Supplier
          </button>
        </div>
      </div>

      {/* Supplier Registry Table Grid */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
            <thead className="bg-background text-outline font-extrabold uppercase tracking-wider border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4">Supplier ID</th>
                <th className="px-6 py-4">Supplier Name</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4 text-center">Products Supplied</th>
                <th className="px-6 py-4 text-center">Last Purchase</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-semibold text-slate-700">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-outline font-bold text-sm">
                    No suppliers found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-primary/5 transition-colors group cursor-pointer"
                    onClick={() => onSupplierClick(s)}
                  >
                    <td className="px-6 py-4 font-bold text-primary">{s.id}</td>
                    <td className="px-6 py-4 font-bold text-on-surface">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-outline-variant font-semibold mt-0.5">{s.companyName}</div>
                    </td>
                    <td className="px-6 py-4">{s.contact}</td>
                    <td className="px-6 py-4 text-slate-600">{s.phone}</td>
                    <td className="px-6 py-4 text-slate-600">{s.email || '—'}</td>
                    <td
                      className="px-6 py-4 max-w-[200px] truncate text-slate-500"
                      title={`${s.street}, ${s.city}`}
                    >
                      {s.street}, {s.city}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-on-surface">{s.products} items</td>
                    <td className="px-6 py-4 text-center text-slate-500">{s.lastPurchaseDate}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          s.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => onSupplierClick(s)}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                          title="View Supplier Profile"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                        <button
                          onClick={() => onEditClick(s)}
                          className="p-1.5 text-[#0b8252] hover:bg-[#eef8f2] rounded transition-colors"
                          title="Edit Supplier"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => onDeleteClick(s.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete Supplier"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
