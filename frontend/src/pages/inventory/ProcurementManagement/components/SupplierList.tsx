import { useState, useMemo, useEffect } from 'react';
import { Supplier } from '../constants/supplierConstants';
import Pagination from '@/components/shared/Pagination';

interface SupplierListProps {
  suppliersList: Supplier[];
  filteredSuppliers: Supplier[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSupplierClick: (supplier: Supplier) => void;
  onEditClick: (supplier: Supplier) => void;
}

export default function SupplierList({
  suppliersList,
  filteredSuppliers,
  searchTerm,
  onSearchChange,
  onSupplierClick,
  onEditClick,
}: SupplierListProps) {
  const totalSuppliersCount = suppliersList.length;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSuppliers.slice(start, start + pageSize);
  }, [filteredSuppliers, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* Search and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name, company, email or phone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-background py-2 pl-9 pr-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="text-xs font-bold text-outline shrink-0 flex items-center gap-1.5">
          <span>Showing</span>
          <span className="text-on-surface bg-slate-100 px-2 py-0.5 rounded-md">{filteredSuppliers.length}</span>
          <span>of {totalSuppliersCount} suppliers</span>
        </div>
      </div>

      {/* Supplier Registry Table Grid */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
            <thead className="bg-background text-outline font-extrabold uppercase tracking-wider border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4">Supplier Name</th>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4 text-center">Products Supplied</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-semibold text-slate-700">
              {paginatedSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-outline font-bold text-sm">
                    No suppliers found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedSuppliers.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-primary/5 transition-colors group cursor-pointer"
                    onClick={() => onSupplierClick(s)}
                  >
                    <td className="px-6 py-4 font-bold text-on-surface">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-outline-variant font-semibold mt-0.5">{s.companyName}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{s.phone}</td>
                    <td className="px-6 py-4 text-slate-600">{s.email || '—'}</td>
                    <td
                      className="px-6 py-4 max-w-[200px] truncate text-slate-500"
                      title={s.address}
                    >
                      {s.address}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-on-surface">{s.products} items</td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => onEditClick(s)}
                          className="p-1.5 text-[#0b8252] hover:bg-[#eef8f2] rounded transition-colors"
                          title="Edit Supplier"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredSuppliers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 20, 50]}
          itemName="suppliers"
        />
      </div>
    </div>
  );
}


