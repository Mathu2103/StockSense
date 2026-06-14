import { useState, useEffect } from 'react';
import { ProductItem } from './ProductsRegistry';

export interface DiscountItem {
  id: string;
  name: string;
  type: 'SEASONAL' | 'DAILY' | 'COMBO';
  discountMode: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  label?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  dailyStartTime?: string;
  dailyEndTime?: string;
  isActive: boolean;
  productIds: string[];
  comboItems?: {
    productId: string;
    minQty: number;
    comboPrice?: number;
  }[];
  createdAt: string;
  approvalStatus: 'DRAFT' | 'APPROVED';
}

interface DiscountRegistryProps {
  products: ProductItem[];
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

const DISCOUNTS_STORAGE_KEY = 'stocksense_discounts_registry';

const initialDiscounts: DiscountItem[] = [
  {
    id: 'd-1',
    name: 'New Year Mega Sale',
    type: 'SEASONAL',
    discountMode: 'PERCENTAGE',
    discountValue: 30,
    label: 'New Year 30% Off ⚡',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
    startDate: '2026-12-25',
    endDate: '2027-01-05',
    isActive: true,
    productIds: ['1'],
    createdAt: new Date().toISOString(),
    approvalStatus: 'APPROVED',
  },
  {
    id: 'd-2',
    name: 'Morning Bakery Deal',
    type: 'DAILY',
    discountMode: 'PERCENTAGE',
    discountValue: 15,
    label: 'Breakfast Special 🍞',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
    dailyStartTime: '07:00',
    dailyEndTime: '10:00',
    isActive: true,
    productIds: ['1'],
    createdAt: new Date().toISOString(),
    approvalStatus: 'APPROVED',
  },
  {
    id: 'd-3',
    name: 'Morning Ritual Combo',
    type: 'COMBO',
    discountMode: 'FIXED_AMOUNT',
    discountValue: 120,
    label: 'Morning Ritual ☕',
    imageUrl: 'https://images.unsplash.com/photo-1559553156-2e97137af16f?q=80&w=600&auto=format&fit=crop',
    isActive: true,
    productIds: ['1'],
    comboItems: [
      { productId: '1', minQty: 1, comboPrice: 400.00 }
    ],
    createdAt: new Date().toISOString(),
    approvalStatus: 'DRAFT',
  }
];

export default function DiscountRegistry({ products, showToast }: DiscountRegistryProps) {
  const [discounts, setDiscounts] = useState<DiscountItem[]>(() => {
    const stored = window.localStorage.getItem(DISCOUNTS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return initialDiscounts;
      }
    }
    return initialDiscounts;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountItem | null>(null);
  const [viewingDiscount, setViewingDiscount] = useState<DiscountItem | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [type, setType] = useState<'SEASONAL' | 'DAILY' | 'COMBO'>('SEASONAL');
  const [discountMode, setDiscountMode] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [label, setLabel] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dailyStartTime, setDailyStartTime] = useState('');
  const [dailyEndTime, setDailyEndTime] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [comboItems, setComboItems] = useState<{ productId: string; minQty: number; comboPrice?: number }[]>([]);

  // Filtering / Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SEASONAL' | 'DAILY' | 'COMBO'>('ALL');

  useEffect(() => {
    window.localStorage.setItem(DISCOUNTS_STORAGE_KEY, JSON.stringify(discounts));
  }, [discounts]);

  const handleOpenAddModal = () => {
    setEditingDiscount(null);
    setName('');
    setType('SEASONAL');
    setDiscountMode('PERCENTAGE');
    setDiscountValue(10);
    setLabel('');
    setImageUrl('');
    setStartDate('');
    setEndDate('');
    setDailyStartTime('');
    setDailyEndTime('');
    setSelectedProductIds([]);
    setComboItems([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (discount: DiscountItem) => {
    setEditingDiscount(discount);
    setName(discount.name);
    setType(discount.type);
    setDiscountMode(discount.discountMode);
    setDiscountValue(discount.discountValue);
    setLabel(discount.label || '');
    setImageUrl(discount.imageUrl || '');
    setStartDate(discount.startDate || '');
    setEndDate(discount.endDate || '');
    setDailyStartTime(discount.dailyStartTime || '');
    setDailyEndTime(discount.dailyEndTime || '');
    setSelectedProductIds(discount.productIds || []);
    setComboItems(discount.comboItems || []);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a discount campaign name.');
      return;
    }

    if (type !== 'COMBO') {
      if (discountValue <= 0) {
        alert('Please enter a valid discount value greater than 0.');
        return;
      }
      if (discountMode === 'PERCENTAGE' && discountValue > 100) {
        alert('Percentage discount must be in the 0 to 100 range.');
        return;
      }
    }

    if (type === 'SEASONAL' && (!startDate || !endDate)) {
      alert('Please specify both start and end dates.');
      return;
    }

    if (type === 'DAILY' && (!dailyStartTime || !dailyEndTime)) {
      alert('Please specify start and end times.');
      return;
    }

    if (type === 'COMBO' && comboItems.length === 0) {
      alert('Please add at least one product to the combo.');
      return;
    }

    const newDiscount: DiscountItem = {
      id: editingDiscount ? editingDiscount.id : `d_${Date.now()}`,
      name,
      type,
      discountMode,
      discountValue: type === 'COMBO' ? 0 : discountValue,
      label: label || undefined,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
      startDate: type === 'SEASONAL' ? startDate : undefined,
      endDate: type === 'SEASONAL' ? endDate : undefined,
      dailyStartTime: type === 'DAILY' ? dailyStartTime : undefined,
      dailyEndTime: type === 'DAILY' ? dailyEndTime : undefined,
      isActive: editingDiscount ? editingDiscount.isActive : true,
      productIds: type === 'COMBO' ? comboItems.map(item => item.productId) : selectedProductIds,
      comboItems: type === 'COMBO' ? comboItems : undefined,
      createdAt: editingDiscount ? editingDiscount.createdAt : new Date().toISOString(),
      approvalStatus: editingDiscount ? (editingDiscount.approvalStatus || 'DRAFT') : 'DRAFT',
    };

    if (editingDiscount) {
      setDiscounts(prev => prev.map(d => d.id === editingDiscount.id ? newDiscount : d));
      showToast(`Discount "${name}" updated successfully.`);
    } else {
      setDiscounts(prev => [newDiscount, ...prev]);
      showToast(`Discount "${name}" created successfully.`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the discount "${name}"?`)) return;
    setDiscounts(prev => prev.filter(d => d.id !== id));
    showToast(`Discount "${name}" deleted.`, 'info');
  };
  const toggleDiscountStatus = (id: string, currentStatus: boolean) => {
    setDiscounts(prev => prev.map(d => d.id === id ? { ...d, isActive: !currentStatus } : d));
    showToast(`Discount status changed.`, 'info');
  };

  const toggleApprovalStatus = (id: string, currentStatus: 'DRAFT' | 'APPROVED') => {
    const nextStatus = currentStatus === 'APPROVED' ? 'DRAFT' : 'APPROVED';
    setDiscounts(prev => prev.map(d => d.id === id ? { ...d, approvalStatus: nextStatus } : d));
    showToast(`Discount status changed to ${nextStatus}.`, 'info');
  };
  const handleProductSelectToggle = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleAddComboItem = (productId: string) => {
    if (comboItems.some(item => item.productId === productId)) return;
    const prod = products.find(p => p.id === productId);
    setComboItems(prev => [
      ...prev,
      { productId, minQty: 1, comboPrice: prod ? prod.sellingPrice * 0.9 : 0 }
    ]);
  };

  const handleRemoveComboItem = (productId: string) => {
    setComboItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleUpdateComboItem = (productId: string, field: 'minQty' | 'comboPrice', val: number) => {
    setComboItems(prev =>
      prev.map(item => (item.productId === productId ? { ...item, [field]: val } : item))
    );
  };

  // Filtered List
  const filteredDiscounts = discounts.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || (d.label && d.label.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || d.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Premium Statistics Overview deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Campaigns */}
        <div className="bg-white border border-outline-variant/60 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Total Campaigns</p>
            <h3 className="text-2xl font-black text-on-surface">{discounts.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">local_offer</span>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white border border-outline-variant/60 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Active Approved</p>
            <h3 className="text-2xl font-black text-emerald-700">
              {discounts.filter(d => d.isActive && d.approvalStatus === 'APPROVED').length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
        </div>

        {/* Awaiting Approval (Drafts) */}
        <div className="bg-white border border-outline-variant/60 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Awaiting Approval</p>
            <h3 className="text-2xl font-black text-amber-600">
              {discounts.filter(d => d.approvalStatus === 'DRAFT').length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined text-[24px]">pending_actions</span>
          </div>
        </div>

        {/* Avg Discount Value */}
        <div className="bg-white border border-outline-variant/60 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Avg Discount</p>
            <h3 className="text-2xl font-black text-primary">
              {(() => {
                const percentageDiscounts = discounts.filter(d => d.discountMode === 'PERCENTAGE' && d.type !== 'COMBO');
                if (percentageDiscounts.length === 0) return '0%';
                const avg = percentageDiscounts.reduce((sum, d) => sum + d.discountValue, 0) / percentageDiscounts.length;
                return `${Math.round(avg)}%`;
              })()}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">percent</span>
          </div>
        </div>
      </div>
      {/* Search and filter header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest border border-outline-variant/60 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-1 gap-2.5 items-center">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search discounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-2 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary font-bold"
            >
              <option value="ALL">All Types</option>
              <option value="SEASONAL">Seasonal Offers</option>
              <option value="DAILY">Daily Offers</option>
              <option value="COMBO">Combo Offers</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all shadow-sm self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Create Discount Campaign
        </button>
      </div>

      {/* Grid of campaigns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDiscounts.map(discount => (
          <div
            key={discount.id}
            className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
          >
            {/* Clickable Area for Details */}
            <div
              onClick={() => setViewingDiscount(discount)}
              className="cursor-pointer hover:bg-slate-50/20 transition-colors flex-1 flex flex-col"
              title="Click to view details"
            >
              {/* Header image banner */}
              <div className="h-32 w-full relative bg-slate-100">
                <img
                  src={discount.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop'}
                  alt={discount.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <span className="bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-black text-primary border border-primary/20">
                    {discount.type}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border backdrop-blur-sm shadow-sm ${
                    discount.approvalStatus === 'APPROVED'
                      ? 'bg-emerald-500/90 text-white border-emerald-500/30'
                      : 'bg-amber-500/95 text-white border-amber-500/30 font-black'
                  }`}>
                    {discount.approvalStatus === 'APPROVED' ? 'APPROVED' : 'DRAFT'}
                  </span>
                </div>
                {discount.label && (
                  <div className="absolute bottom-3 left-3 bg-[#0a3822]/85 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    {discount.label}
                  </div>
                )}
              </div>

              {/* Campaign info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-sm text-on-surface line-clamp-1">{discount.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${discount.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-[10px] font-bold text-outline uppercase">{discount.isActive ? 'Active' : 'Paused'}</span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-outline space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-outline text-[16px]">local_offer</span>
                      {discount.type === 'COMBO' ? (
                        <span className="font-semibold text-on-surface">Combo Bundle Price</span>
                      ) : (
                        <span>
                          Value:{' '}
                          <strong className="text-on-surface">
                            {discount.discountMode === 'PERCENTAGE'
                              ? `${discount.discountValue}% Off`
                              : `Rs. ${discount.discountValue} Off`}
                          </strong>
                        </span>
                      )}
                    </div>

                    {discount.type === 'SEASONAL' && (
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-outline text-[16px]">calendar_month</span>
                        <span>
                          Validity:{' '}
                          <strong className="text-on-surface">
                            {discount.startDate} to {discount.endDate}
                          </strong>
                        </span>
                      </div>
                    )}

                    {discount.type === 'DAILY' && (
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-outline text-[16px]">schedule</span>
                        <span>
                          Daily Hours:{' '}
                          <strong className="text-on-surface">
                            {discount.dailyStartTime} - {discount.dailyEndTime}
                          </strong>
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-outline text-[16px]">shopping_basket</span>
                        <span>
                          Applied to:{' '}
                          <strong className="text-on-surface">
                            {discount.type === 'COMBO'
                              ? `${discount.comboItems?.length || 0} Combo Items`
                              : `${discount.productIds?.length || 0} Products`}
                          </strong>
                        </span>
                      </div>
                      {discount.type === 'COMBO' && discount.comboItems && discount.comboItems.length > 0 && (
                        <div className="mt-1 pl-5 space-y-0.5 border-l border-primary/30 max-h-24 overflow-y-auto">
                          {discount.comboItems.map((item, idx) => {
                            const prod = products.find(p => p.id === item.productId);
                            return (
                              <div key={idx} className="text-[10px] text-outline-variant font-medium">
                                • {prod ? prod.name : 'Unknown Product'} (x{item.minQty}) - <strong className="text-primary">Rs. {item.comboPrice}</strong>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {discount.type !== 'COMBO' && discount.productIds && discount.productIds.length > 0 && (
                        <div className="mt-1 pl-5 space-y-0.5 border-l border-primary/30 max-h-20 overflow-y-auto">
                          <span className="text-[9px] text-outline font-bold uppercase tracking-wider block">Products:</span>
                          {discount.productIds.map((pId, idx) => {
                            const prod = products.find(p => p.id === pId);
                            return (
                              <div key={idx} className="text-[10px] text-outline-variant font-medium truncate">
                                • {prod ? prod.name : 'Unknown Product'}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-outline-variant/60 flex items-center justify-between bg-slate-50/50" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleDiscountStatus(discount.id, discount.isActive)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                    discount.isActive
                      ? 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100'
                      : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {discount.isActive ? 'Pause' : 'Activate'}
                </button>

                <button
                  type="button"
                  onClick={() => toggleApprovalStatus(discount.id, discount.approvalStatus || 'DRAFT')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                    discount.approvalStatus === 'APPROVED'
                      ? 'border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100'
                      : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {discount.approvalStatus === 'APPROVED' ? 'Revoke Approval' : 'Approve'}
                </button>
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(discount)}
                  className="p-1 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(discount.id, discount.name)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredDiscounts.length === 0 && (
          <div className="col-span-full py-12 text-center bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-outline/30">local_offer</span>
            <p className="text-sm font-bold text-outline mt-2">No discount campaigns found.</p>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_offer</span>
                <h2 className="text-base font-bold text-on-surface">
                  {editingDiscount ? 'Modify Discount Campaign' : 'Create New Discount Campaign'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramadan Super Clearance"
                    className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Discount Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => {
                      const nextType = e.target.value as any;
                      setType(nextType);
                      if (nextType !== 'COMBO' && discountValue === 0) {
                        setDiscountValue(10);
                      }
                    }}
                    className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="SEASONAL">Seasonal Offer (Fixed Date Range)</option>
                    <option value="DAILY">Daily Offer (Recurring Hours)</option>
                    <option value="COMBO">Combo Offer (Bundle Deal)</option>
                  </select>
                </div>
              </div>

              {type !== 'COMBO' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                      Discount Mode *
                    </label>
                    <select
                      value={discountMode}
                      onChange={(e) => {
                        const nextMode = e.target.value as any;
                        setDiscountMode(nextMode);
                        if (nextMode === 'PERCENTAGE' && discountValue > 100) {
                          setDiscountValue(100);
                        }
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED_AMOUNT">Fixed Value (Rs.)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      value={discountValue === 0 ? '' : discountValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setDiscountValue(0);
                          return;
                        }
                        let num = parseFloat(val);
                        if (isNaN(num)) num = 0;
                        if (discountMode === 'PERCENTAGE') {
                          if (num < 0) num = 0;
                          if (num > 100) num = 100;
                        } else {
                          if (num < 0) num = 0;
                        }
                        setDiscountValue(num);
                      }}
                      min="0"
                      max={discountMode === 'PERCENTAGE' ? "100" : undefined}
                      placeholder={discountMode === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 150'}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Clearance ⚡"
                    className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Promo Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {type === 'SEASONAL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-outline-variant/60 pt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {type === 'DAILY' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-outline-variant/60 pt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                      Daily Start Time *
                    </label>
                    <input
                      type="time"
                      value={dailyStartTime}
                      onChange={(e) => setDailyStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                      Daily End Time *
                    </label>
                    <input
                      type="time"
                      value={dailyEndTime}
                      onChange={(e) => setDailyEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* Products selection section */}
              {type !== 'COMBO' ? (
                <div className="border-t border-outline-variant/60 pt-4 space-y-2">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">
                    Select Target Products for this Campaign
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-outline-variant/60 rounded-xl p-3 bg-slate-50/50">
                    {products.map(prod => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleProductSelectToggle(prod.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                          selectedProductIds.includes(prod.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant/60 hover:border-outline bg-white'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[18px] ${
                          selectedProductIds.includes(prod.id) ? 'text-primary font-bold' : 'text-outline-variant'
                        }`}>
                          {selectedProductIds.includes(prod.id) ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                        <div>
                          <p className="text-[11px] font-bold text-on-surface leading-tight line-clamp-1">{prod.name}</p>
                          <p className="text-[9px] text-outline font-semibold">SKU: {prod.sku} | Price: Rs. {prod.sellingPrice}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Combo setup section */
                <div className="border-t border-outline-variant/60 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">
                      Setup Combo Items & Bundle Prices
                    </label>
                    <div className="relative">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddComboItem(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-outline-variant rounded-lg text-[10px] text-on-surface outline-none focus:ring-1 focus:ring-primary font-bold"
                      >
                        <option value="">+ Add Product to Combo</option>
                        {products.map(prod => (
                          <option key={prod.id} value={prod.id}>
                            {prod.name}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[14px] pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {comboItems.map((item) => {
                      const prod = products.find(p => p.id === item.productId);
                      if (!prod) return null;
                      return (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between gap-4 p-3 bg-white border border-outline-variant/60 rounded-xl"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-on-surface truncate">{prod.name}</p>
                            <p className="text-[10px] text-outline">Normal Price: Rs. {prod.sellingPrice}</p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-outline uppercase">Min Qty</span>
                              <input
                                type="number"
                                min="1"
                                value={item.minQty}
                                onChange={(e) => handleUpdateComboItem(item.productId, 'minQty', parseInt(e.target.value) || 1)}
                                className="w-14 px-2 py-1 border border-outline-variant rounded text-xs text-center"
                              />
                            </div>

                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-outline uppercase">Combo Price (Rs.)</span>
                              <input
                                type="number"
                                step="0.01"
                                value={item.comboPrice || 0}
                                onChange={(e) => handleUpdateComboItem(item.productId, 'comboPrice', parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-outline-variant rounded text-xs text-center"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveComboItem(item.productId)}
                              className="text-red-500 hover:text-red-700 p-1 mt-3.5"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {comboItems.length === 0 && (
                      <div className="text-center py-6 border border-dashed border-outline-variant rounded-xl text-outline text-[11px] font-bold">
                        No products added to this combo yet. Use selector above to build combo.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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
                {editingDiscount ? 'Save Changes' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Details Modal */}
      {viewingDiscount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/60 shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_offer</span>
                <h2 className="text-base font-bold text-on-surface">Discount Campaign Details</h2>
              </div>
              <button
                onClick={() => setViewingDiscount(null)}
                className="text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-slate-50/30">
              {/* Campaign Header Details */}
              <div className="flex items-start gap-4 p-4 bg-white border border-outline-variant/60 rounded-xl shadow-sm">
                {viewingDiscount.imageUrl ? (
                  <img
                    src={viewingDiscount.imageUrl}
                    alt={viewingDiscount.name}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0 bg-white"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center bg-primary text-white font-black text-2xl uppercase shrink-0 shadow-sm">
                    {viewingDiscount.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                      {viewingDiscount.type}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                      viewingDiscount.approvalStatus === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {viewingDiscount.approvalStatus === 'APPROVED' ? 'APPROVED' : 'DRAFT'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                      viewingDiscount.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {viewingDiscount.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-on-surface leading-snug line-clamp-2">{viewingDiscount.name}</h4>
                  {viewingDiscount.label && (
                    <p className="text-xs text-[#0a3822] font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">sell</span>
                      {viewingDiscount.label}
                    </p>
                  )}
                </div>
              </div>

              {/* Campaign Configurations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 border border-outline-variant/60 rounded-xl shadow-sm space-y-2">
                  <span className="block text-[10px] font-black text-outline uppercase tracking-wider">Discount Value</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-primary">
                      {viewingDiscount.type === 'COMBO' ? 'Combo Price' : 
                        viewingDiscount.discountMode === 'PERCENTAGE'
                          ? `${viewingDiscount.discountValue}%`
                          : `Rs. ${viewingDiscount.discountValue}`}
                    </span>
                    {viewingDiscount.type !== 'COMBO' && (
                      <span className="text-xs font-bold text-outline">
                        {viewingDiscount.discountMode === 'PERCENTAGE' ? 'Off Total Price' : 'Off Original Price'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-white p-4 border border-outline-variant/60 rounded-xl shadow-sm space-y-2">
                  <span className="block text-[10px] font-black text-outline uppercase tracking-wider">Campaign Schedule</span>
                  <div className="text-xs font-bold text-on-surface">
                    {viewingDiscount.type === 'SEASONAL' && (
                      <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px] text-outline">calendar_month</span>
                        <span>Validity: {viewingDiscount.startDate} to {viewingDiscount.endDate}</span>
                      </div>
                    )}
                    {viewingDiscount.type === 'DAILY' && (
                      <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                        <span>Daily Hours: {viewingDiscount.dailyStartTime} - {viewingDiscount.dailyEndTime}</span>
                      </div>
                    )}
                    {viewingDiscount.type === 'COMBO' && (
                      <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px] text-outline">verified</span>
                        <span>Continuous Bundle Deal</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Applied Products Section */}
              <div className="bg-white border border-outline-variant/60 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-black text-outline uppercase tracking-wider">
                    {viewingDiscount.type === 'COMBO' ? 'Combo Products & Prices' : 'Applied Target Products'}
                  </h3>
                  <span className="text-[10px] font-bold text-outline-variant">
                    {viewingDiscount.type === 'COMBO'
                      ? `${viewingDiscount.comboItems?.length || 0} Bundle Items`
                      : `${viewingDiscount.productIds?.length || 0} Target Products`}
                  </span>
                </div>

                {viewingDiscount.type === 'COMBO' ? (
                  <div className="divide-y divide-slate-100">
                    {viewingDiscount.comboItems && viewingDiscount.comboItems.length > 0 ? (
                      viewingDiscount.comboItems.map((item, idx) => {
                        const prod = products.find(p => p.id === item.productId);
                        return (
                          <div key={idx} className="py-2.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                            <div className="min-w-0">
                              <span className="block text-xs font-bold text-on-surface truncate">{prod ? prod.name : 'Unknown Product'}</span>
                              <span className="block text-[10px] text-outline mt-0.5 font-semibold">
                                SKU: {prod ? prod.sku : 'N/A'} • Original: Rs. {prod ? prod.sellingPrice : 0}
                              </span>
                            </div>
                            <div className="text-right whitespace-nowrap">
                              <span className="block text-xs font-black text-primary">Rs. {item.comboPrice}</span>
                              <span className="block text-[9px] text-outline mt-0.5 font-bold">Min Qty: {item.minQty}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-outline py-2">No combo products added.</p>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {viewingDiscount.productIds && viewingDiscount.productIds.length > 0 ? (
                      viewingDiscount.productIds.map((pId, idx) => {
                        const prod = products.find(p => p.id === pId);
                        if (!prod) return null;
                        const finalPrice = viewingDiscount.discountMode === 'PERCENTAGE'
                          ? prod.sellingPrice * (1 - viewingDiscount.discountValue / 100)
                          : Math.max(0, prod.sellingPrice - viewingDiscount.discountValue);
                        return (
                          <div key={idx} className="py-2.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs font-bold text-on-surface truncate">{prod.name}</span>
                              <span className="block text-[10px] text-outline mt-0.5 font-semibold">
                                SKU: {prod.sku} • Stock: <strong className={prod.stock === 0 ? 'text-red-600' : 'text-on-surface'}>{prod.stock}</strong>
                              </span>
                            </div>
                            <div className="text-right whitespace-nowrap">
                              <span className="block text-xs font-black text-primary">Rs. {finalPrice.toFixed(2)}</span>
                              <span className="block text-[9px] text-outline line-through mt-0.5 font-bold">Rs. {prod.sellingPrice}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-outline py-2">No target products selected.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-outline-variant/60 shrink-0">
              <button
                type="button"
                onClick={() => setViewingDiscount(null)}
                className="px-4 py-2 bg-white border border-outline rounded-lg text-xs font-bold text-on-surface-variant hover:bg-slate-50 transition-colors shadow-sm"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = viewingDiscount;
                  setViewingDiscount(null);
                  handleOpenEditModal(target);
                }}
                className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
