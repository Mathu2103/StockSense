import React from 'react';

interface SupplierFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  formData: {
    name: string;
    companyName: string;
    email: string;
    phone: string;
    address: string;
  };
  formErrors: {
    name: string;
    companyName: string;
    email: string;
    phone: string;
    address: string;
  };
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SupplierFormModal({
  isOpen,
  mode,
  formData,
  formErrors,
  onClose,
  onChange,
  onSubmit,
}: SupplierFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="bg-[#f8fafc] rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-outline-variant animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-container-lowest">
          <h2 className="text-base font-black text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              {mode === 'add' ? 'person_add' : 'edit'}
            </span>
            {mode === 'add' ? 'Create Supplier Profile' : 'Edit Supplier Profile'}
          </h2>
          <button type="button" onClick={onClose} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto bg-surface-container-lowest space-y-4">
          
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Company Name *</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={onChange}
              className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${
                formErrors.companyName ? 'border-red-500' : 'border-outline-variant'
              }`}
              placeholder="e.g. ABC Holdings (Pvt) Ltd"
            />
            {formErrors.companyName && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.companyName}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Supplier Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${
                formErrors.name ? 'border-red-500' : 'border-outline-variant'
              }`}
              placeholder="e.g. ABC Distributors"
            />
            {formErrors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${
                formErrors.phone ? 'border-red-500' : 'border-outline-variant'
              }`}
              placeholder="e.g. +94 77 123 4567"
            />
            {formErrors.phone && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${
                formErrors.email ? 'border-red-500' : 'border-outline-variant'
              }`}
              placeholder="e.g. info@abcdistributors.com"
            />
            {formErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.email}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Warehouse Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={onChange}
              rows={3}
              className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${
                formErrors.address ? 'border-red-500' : 'border-outline-variant'
              }`}
              placeholder="e.g. 123 Business Street, Colombo 03"
            />
            {formErrors.address && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.address}</p>}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold border border-outline-variant rounded-lg hover:bg-surface-container transition-colors text-on-surface"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold bg-[#0b8252] hover:bg-[#096b43] text-white rounded-lg transition-colors shadow-sm"
          >
            Save Supplier
          </button>
        </div>
      </form>
    </div>
  );
}
