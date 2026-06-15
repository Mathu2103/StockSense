import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductItem } from './ProductsRegistry';
import { toast } from 'sonner';

export type SupplierItem = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: 'Active' | 'Inactive';
};

type SupplierRegistryProps = {
  suppliers: SupplierItem[];
  products: ProductItem[];
  onAddSupplier: (supplier: Omit<SupplierItem, 'id'>) => void;
  onEditSupplier: (id: string, updatedFields: Partial<SupplierItem>) => void;
  onDeleteSupplier: (id: string) => void;
  showConfirm?: (title: string, message: React.ReactNode, onConfirm: () => void) => void;
};

export default function SupplierRegistry({
  suppliers,
  products,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
  showConfirm,
}: SupplierRegistryProps) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);
  const [supplierProductsModal, setSupplierProductsModal] = useState<SupplierItem | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-open modal if navigated via deep link from NewProductForm
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.phone.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query)
    );
  }, [suppliers, search]);

  // Products belonging to a selected supplier
  const supplierProducts = useMemo(() => {
    if (!supplierProductsModal) return [];
    return products.filter(
      (p) => p.supplier.trim().toLowerCase() === supplierProductsModal.name.trim().toLowerCase()
    );
  }, [products, supplierProductsModal]);

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sup: SupplierItem) => {
    setEditingSupplier(sup);
    setName(sup.name);
    setPhone(sup.phone);
    setEmail(sup.email);
    setAddress(sup.address);
    setStatus(sup.status);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedAddr = address.trim();

    if (!trimmedName || !trimmedPhone || !trimmedEmail || !trimmedAddr) {
      toast.error('Please fill out all mandatory fields marked with an asterisk (*).');
      return;
    }

    const payload = {
      name: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail,
      address: trimmedAddr,
      status,
    };

    if (editingSupplier) {
      onEditSupplier(editingSupplier.id, payload);
    } else {
      onAddSupplier(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    const action = () => {
      onDeleteSupplier(id);
    };

    if (showConfirm) {
      showConfirm(
        'Delete Supplier',
        `Are you sure you want to delete the supplier "${name}"?`,
        action
      );
    } else {
      if (window.confirm(`Are you sure you want to delete the supplier "${name}"?`)) {
        action();
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Controls Panel */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-on-surface">Supplier Directory</h3>
            <p className="text-xs text-outline">Manage supermarket suppliers, contact lines, emails, and physical warehouse addresses.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Add Supplier
          </button>
        </div>

        <div className="mt-4 relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers by name, contact, email, or address..."
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-outline-variant"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">
            search
          </span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Suppliers Cards Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 bg-slate-50 border border-outline-variant rounded-full flex items-center justify-center mb-3 text-outline-variant">
            <span className="material-symbols-outlined text-2xl">local_shipping</span>
          </div>
          <h4 className="text-sm font-bold text-on-surface mb-1">No Suppliers Found</h4>
          <p className="text-xs text-outline max-w-sm">
            {suppliers.length === 0
              ? 'Register new grocery distributors, bakeries, cold store suppliers, or beverage shipping lines.'
              : 'No suppliers match your search filters. Try searching for other supplier details.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuppliers.map((sup) => {
            const count = products.filter((p) => p.supplier.trim().toLowerCase() === sup.name.trim().toLowerCase()).length;
            return (
              <div
                key={sup.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:border-primary/40 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center shadow-sm shrink-0">
                        <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-on-surface text-sm">{sup.name}</h4>
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                          sup.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {sup.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-0.5">
                      <button
                        onClick={() => handleOpenEditModal(sup)}
                        title="Edit Supplier"
                        className="p-1.5 rounded text-outline-variant hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(sup.id, sup.name)}
                        title="Delete Supplier"
                        className="p-1.5 rounded text-outline-variant hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-on-surface-variant font-medium">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-outline">call</span>
                      <span className="truncate">{sup.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-outline">mail</span>
                      <span className="truncate">{sup.email}</span>
                    </div>
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <span className="material-symbols-outlined text-[16px] text-outline shrink-0 mt-0.5">location_on</span>
                      <span className="leading-tight">{sup.address}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider">{count} SKUs Handled</span>
                  <button
                    onClick={() => setSupplierProductsModal(sup)}
                    className="flex items-center gap-1 bg-secondary-container text-primary hover:bg-secondary-container/85 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">inventory</span>
                    View Supplier Products
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Add/Edit Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                <h2 className="text-base font-bold text-on-surface">
                  {editingSupplier ? 'Modify Supplier Details' : 'Register New Supplier'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ceylon Beverage Distributors"
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline-variant"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +94 77 123 4567"
                    className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline-variant"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sales@domain.com"
                    className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline-variant"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Warehouse/Office Address *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123 Industrial Area, Colombo"
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline-variant"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Operational Status
                </label>
                <div className="flex gap-4 mt-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-on-surface cursor-pointer select-none">
                    <input
                      type="radio"
                      name="status"
                      checked={status === 'Active'}
                      onChange={() => setStatus('Active')}
                      className="w-4 h-4 text-primary focus:ring-primary border-outline-variant"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-on-surface cursor-pointer select-none">
                    <input
                      type="radio"
                      name="status"
                      checked={status === 'Inactive'}
                      onChange={() => setStatus('Inactive')}
                      className="w-4 h-4 text-primary focus:ring-primary border-outline-variant"
                    />
                    Inactive
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-outline-variant/60">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white border border-outline rounded-lg text-xs font-bold text-on-surface-variant hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-sm"
              >
                {editingSupplier ? 'Save Changes' : 'Register Supplier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. View Supplier Products Modal */}
      {supplierProductsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/60">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary">inventory</span>
                <div>
                  <h2 className="text-base font-bold text-on-surface">Associated Products Catalogue</h2>
                  <p className="text-[11px] text-outline">Showing registered items under supplier "{supplierProductsModal.name}"</p>
                </div>
              </div>
              <button
                onClick={() => setSupplierProductsModal(null)}
                className="text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {supplierProducts.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-outline-variant mb-2">inventory_2</span>
                  <p className="text-xs font-bold text-on-surface-variant">No Products Registered</p>
                  <p className="text-[11px] text-outline mt-0.5">There are no items matching this supplier name in the registry catalog.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-outline-variant rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 border-b border-outline-variant text-[10px] font-bold text-outline uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Product Name</th>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-right">Current Stock</th>
                        <th className="px-4 py-3 text-right">Cost Price</th>
                        <th className="px-4 py-3 text-right">Selling Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-on-surface-variant">
                      {supplierProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-bold text-on-surface">{p.name}</td>
                          <td className="px-4 py-3 font-bold">{p.sku}</td>
                          <td className="px-4 py-3">{p.category}</td>
                          <td className="px-4 py-3 text-right font-black text-on-surface">
                            {p.stock} <span className="text-[10px] text-outline font-bold">{p.unitType}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-outline">Rs. {p.costPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-extrabold text-primary">Rs. {p.sellingPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-outline-variant/60">
              <button
                type="button"
                onClick={() => setSupplierProductsModal(null)}
                className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-sm"
              >
                Close Catalogue
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
