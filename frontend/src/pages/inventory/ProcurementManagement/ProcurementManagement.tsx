import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from "../Shared/Sidebar";
import InventoryHeader from '../Shared/InventoryHeader';

import { initialSuppliers, Supplier } from './constants/supplierConstants';
import SupplierList from './components/SupplierList';
import SupplierProfile from './components/SupplierProfile';
import SupplierFormModal from './components/SupplierFormModal';

const SUPPLIER_STORAGE_KEY = 'stocksense_procurement_suppliers';

const loadStoredSuppliers = (): Supplier[] => {
  if (typeof window === 'undefined') {
    return initialSuppliers;
  }
  const stored = window.localStorage.getItem(SUPPLIER_STORAGE_KEY);
  if (!stored) {
    return initialSuppliers;
  }
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return initialSuppliers;
  } catch {
    return initialSuppliers;
  }
};

export default function ProcurementManagement() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Datasets State
  const [suppliersList, setSuppliersList] = useState<Supplier[]>(() => loadStoredSuppliers());

  // Supplier Profile Page State
  const [activeProfileSupplier, setActiveProfileSupplier] = useState<Supplier | null>(null);

  // General Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Selected details State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  // Forms Field States for Supplier Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    contactPhone: '',
    email: '',
    companyName: '',
    brn: '',
    taxNumber: '',
    street: '',
    city: '',
    province: '',
    categories: '',
    deliveryDays: [] as string[],
    paymentTerms: 'Net 30',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    contact: '',
    phone: '',
    contactPhone: '',
    email: '',
    companyName: '',
    brn: '',
    taxNumber: '',
    street: '',
    city: '',
    province: '',
    categories: '',
  });

  // Filtered Suppliers List
  const filteredSuppliers = useMemo(() => {
    return suppliersList.filter(s => {
      const matchesSearch =
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [suppliersList, searchTerm, statusFilter]);

  // Supplier Profile calculations
  const supplierProfileData = useMemo(() => {
    if (!activeProfileSupplier) return null;

    // Purchase Frequency mapping
    let frequency = 'Monthly';
    if (activeProfileSupplier.deliveryDays.length >= 3) {
      frequency = 'Bi-weekly';
    } else if (activeProfileSupplier.deliveryDays.length >= 1) {
      frequency = 'Weekly';
    }

    return {
      purchasesCount: activeProfileSupplier.totalPurchases,
      totalPurchaseValueFormatted: activeProfileSupplier.totalValue,
      lastPurchase: activeProfileSupplier.lastPurchaseDate,
      averageOrderValueFormatted: 'N/A',
      frequency,
    };
  }, [activeProfileSupplier]);

  // Handle Input Changes for Suppliers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };



  // Validation Form for Suppliers
  const validateForm = (ignoreId?: string | null) => {
    let isValid = true;
    const errors = {
      name: '', contact: '', phone: '', contactPhone: '', email: '', companyName: '', brn: '', taxNumber: '', street: '', city: '', province: '', categories: '',
    };

    if (!formData.name.trim()) {
      errors.name = 'Supplier name is required';
      isValid = false;
    } else {
      const isDuplicate = suppliersList.some(s =>
        s.name.toLowerCase() === formData.name.trim().toLowerCase() &&
        s.id !== ignoreId
      );
      if (isDuplicate) {
        errors.name = `Supplier "${formData.name.trim()}" already exists.`;
        isValid = false;
      }
    }

    if (!formData.contact.trim()) { errors.contact = 'Contact person is required'; isValid = false; }

    const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;
    if (!formData.phone.trim()) {
      errors.phone = 'Supplier contact number is required';
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = 'Enter a valid contact number';
      isValid = false;
    }

    if (!formData.contactPhone.trim()) {
      errors.contactPhone = 'Contact person number is required';
      isValid = false;
    } else if (!phoneRegex.test(formData.contactPhone)) {
      errors.contactPhone = 'Enter a valid contact person number';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      errors.email = 'Enter a valid email address';
      isValid = false;
    }

    if (!formData.companyName.trim()) { errors.companyName = 'Company name is required'; isValid = false; }
    if (!formData.street.trim()) { errors.street = 'Street address is required'; isValid = false; }
    if (!formData.city.trim()) { errors.city = 'City is required'; isValid = false; }
    if (!formData.province.trim()) { errors.province = 'Province is required'; isValid = false; }

    setFormErrors(errors);
    return isValid;
  };

  // CRUD for Suppliers
  const handleOpenAddModal = () => {
    setFormData({
      name: '', contact: '', phone: '', contactPhone: '', email: '', companyName: '', brn: 'N/A', taxNumber: 'N/A', street: '', city: '', province: '', categories: 'General', deliveryDays: [], paymentTerms: 'COD', status: 'Active',
    });
    setFormErrors({
      name: '', contact: '', phone: '', contactPhone: '', email: '', companyName: '', brn: '', taxNumber: '', street: '', city: '', province: '', categories: '',
    });
    setIsAddModalOpen(true);
  };

  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newId = `SUP-00${suppliersList.length + 1}`;
    const newSupplier: Supplier = {
      ...formData,
      id: newId,
      products: 0,
      lastPurchaseDate: new Date().toISOString().split('T')[0],
      totalPurchases: 0,
      totalValue: '$0.00',
      reliability: 100,
      onTime: 100,
      rating: 5.0,
    };
    setSuppliersList(prev => [...prev, newSupplier]);
    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone,
      contactPhone: supplier.contactPhone || '',
      email: supplier.email,
      companyName: supplier.companyName,
      brn: supplier.brn,
      taxNumber: supplier.taxNumber,
      street: supplier.street,
      city: supplier.city,
      province: supplier.province,
      categories: supplier.categories,
      deliveryDays: supplier.deliveryDays,
      paymentTerms: supplier.paymentTerms,
      status: supplier.status,
    });
    setFormErrors({
      name: '', contact: '', phone: '', contactPhone: '', email: '', companyName: '', brn: '', taxNumber: '', street: '', city: '', province: '', categories: '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(selectedSupplier?.id)) return;
    if (!selectedSupplier) return;

    setSuppliersList(prev => prev.map(s => {
      if (s.id === selectedSupplier.id) {
        const updated = {
          ...s,
          ...formData,
        };
        // Update active profile if open currently
        if (activeProfileSupplier && activeProfileSupplier.id === s.id) {
          setActiveProfileSupplier(updated);
        }
        return updated;
      }
      return s;
    }));
    setIsEditModalOpen(false);
  };

  const handleDeleteSupplier = (id: string) => {
    const supplier = suppliersList.find(s => s.id === id);
    if (supplier) {
      setSupplierToDelete(supplier);
      setIsDeleteConfirmOpen(true);
    }
  };

  const handleConfirmDeleteSupplier = () => {
    if (supplierToDelete) {
      const id = supplierToDelete.id;
      setSuppliersList(prev => prev.filter(s => s.id !== id));
      if (activeProfileSupplier && activeProfileSupplier.id === id) {
        setActiveProfileSupplier(null);
      }
      setIsDeleteConfirmOpen(false);
      setSupplierToDelete(null);
    }
  };



  useEffect(() => {
    window.localStorage.setItem(SUPPLIER_STORAGE_KEY, JSON.stringify(suppliersList));
  }, [suppliersList]);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new-supplier') {
      handleOpenAddModal();
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('action');
        return next;
      }, { replace: true });
    }
  }, [searchParams]);

  return (
    <div className="flex h-screen bg-background text-on-surface font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InventoryHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300">

            {/* Page Header (Render back button if profile view is active) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {activeProfileSupplier ? (
                  <button
                    onClick={() => setActiveProfileSupplier(null)}
                    className="mb-2 text-xs font-black text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm font-black">arrow_back</span>
                    Back to Suppliers Directory
                  </button>
                ) : null}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
                  {activeProfileSupplier ? 'Supplier Profile Dashboard' : 'Procurement Management'}
                </h1>
                <p className="text-sm text-outline mt-1">
                  {activeProfileSupplier ? `Enterprise-level view of ${activeProfileSupplier.name}` : 'Manage your partner suppliers and supply chain directory.'}
                </p>
              </div>
            </div>

            {/* RENDER ENTERPRISE SUPPLIER PROFILE VIEW PAGE */}
            {activeProfileSupplier && supplierProfileData ? (
              <SupplierProfile
                supplier={activeProfileSupplier}
                profileData={supplierProfileData}
                onEditClick={() => handleOpenEditModal(activeProfileSupplier)}
                onDeleteClick={() => handleDeleteSupplier(activeProfileSupplier.id)}
              />
            ) : (
              <SupplierList
                suppliersList={suppliersList}
                filteredSuppliers={filteredSuppliers}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onSupplierClick={setActiveProfileSupplier}
                onEditClick={handleOpenEditModal}
                onDeleteClick={handleDeleteSupplier}
                onAddClick={handleOpenAddModal}
              />
            )}

          </div>
        </main>
      </div>

      {/* Add Supplier Modal */}
      <SupplierFormModal
        isOpen={isAddModalOpen}
        mode="add"
        formData={formData}
        formErrors={formErrors}
        onClose={() => setIsAddModalOpen(false)}
        onChange={handleInputChange}
        onSubmit={handleAddSupplierSubmit}
      />

      {/* Edit Supplier Modal */}
      <SupplierFormModal
        isOpen={isEditModalOpen}
        mode="edit"
        formData={formData}
        formErrors={formErrors}
        onClose={() => setIsEditModalOpen(false)}
        onChange={handleInputChange}
        onSubmit={handleEditSupplierSubmit}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && supplierToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#f8fafc] border border-outline-variant rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="text-lg font-black text-on-surface">Delete Supplier</h3>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Are you sure you want to delete supplier <strong className="text-on-surface">{supplierToDelete.name} ({supplierToDelete.id})</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setSupplierToDelete(null);
                }}
                className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSupplier}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
