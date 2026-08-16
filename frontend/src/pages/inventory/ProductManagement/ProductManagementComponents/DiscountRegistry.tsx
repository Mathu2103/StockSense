import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { ProductItem } from './ProductsRegistry';
import Pagination from '@/components/shared/Pagination';
import { toast } from 'sonner';
import { DiscountService } from '../../../../services/discountService';
import { UploadService } from '../../../../services/uploadService';

export interface DiscountItem {
  id: string;
  name: string;
  type: 'SEASONAL' | 'DAILY' | 'COMBO';
  discountValue: number; // percentage (integer) for all types
  label?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  dailyStartTime?: string;
  dailyEndTime?: string;
  applicableDate?: string;
  isActive: boolean;
  productIds: string[];
  comboItems?: {
    productId: string;
    productName?: string;
    minQty: number;
  }[];
  createdAt: string;
  approvalStatus: 'DRAFT' | 'APPROVED';
}

interface DiscountRegistryProps {
  products: ProductItem[];
  showToast: (msg: string, type?: 'success' | 'info') => void;
  showConfirm?: (title: string, message: React.ReactNode, onConfirm: () => void) => void;
  openAddModalTrigger?: number;
}

export default function DiscountRegistry({ products, showToast, showConfirm, openAddModalTrigger }: DiscountRegistryProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountItem | null>(null);
  const [viewingDiscount, setViewingDiscount] = useState<DiscountItem | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [type, setType] = useState<'SEASONAL' | 'DAILY' | 'COMBO'>('SEASONAL');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [label, setLabel] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dailyStartTime, setDailyStartTime] = useState('');
  const [dailyEndTime, setDailyEndTime] = useState('');
  const [applicableDate, setApplicableDate] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [comboItems, setComboItems] = useState<{ productId: string; minQty: number }[]>([]);

  // Search filter for registry list
  const [searchTerm, setSearchTerm] = useState('');

  // Product search filter inside modal
  const [productSearch, setProductSearch] = useState('');

  // Fetch discounts on mount
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const discRes = await DiscountService.getDiscounts();

      if (discRes && discRes.success && Array.isArray(discRes.data)) {
        setDiscounts(discRes.data);
      } else {
        setDiscounts([]);
      }
    } catch (err) {
      console.error('Failed to fetch discounts:', err);
      toast.error('Server error loading discounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // Calculate sum of regular prices of all items in the combo
  const originalComboTotal = useMemo(() => {
    return comboItems.reduce((sum, item) => {
      const prod = products.find(p => p.id === item.productId);
      return sum + (prod ? prod.sellingPrice * item.minQty : 0);
    }, 0);
  }, [comboItems, products]);

  const handleOpenAddModal = (initialProductIds: string[] = [], initialComboItems: { productId: string; minQty: number }[] = []) => {
    setEditingDiscount(null);
    setName('');
    setType('SEASONAL');
    setDiscountValue(10);
    setLabel('');
    setImageUrl('');
    setStartDate('');
    setEndDate('');
    setDailyStartTime('');
    setDailyEndTime('');
    setApplicableDate('');
    setSelectedProductIds(initialProductIds);
    setComboItems(initialComboItems);
    setProductSearch('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (discount: DiscountItem) => {
    setEditingDiscount(discount);
    setName(discount.name);
    setType(discount.type);
    setDiscountValue(discount.discountValue);
    setLabel(discount.label || '');
    setImageUrl(discount.imageUrl || '');
    setStartDate(discount.startDate || '');
    setEndDate(discount.endDate || '');
    setDailyStartTime(discount.dailyStartTime || '');
    setDailyEndTime(discount.dailyEndTime || '');
    setApplicableDate(discount.applicableDate || '');
    setSelectedProductIds(discount.productIds || []);
    setComboItems(discount.comboItems || []);
    setProductSearch('');
    setIsModalOpen(true);
  };

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      handleOpenAddModal();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (openAddModalTrigger && openAddModalTrigger > 0) {
      handleOpenAddModal();
    }
  }, [openAddModalTrigger]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) { toast.error('Please enter a discount campaign name.'); return; }
    if (trimmedName.length > 100) { toast.error('Discount campaign name must be 100 characters or less.'); return; }
    if (discountValue <= 0) { toast.error('Please enter a valid discount percentage greater than 0.'); return; }
    if (discountValue > 100) { toast.error('Percentage discount cannot exceed 100%.'); return; }
    if (type !== 'COMBO') {
      if (selectedProductIds.length === 0) { toast.error('Please select at least one target product for the campaign.'); return; }
    } else {
      if (comboItems.length === 0) { toast.error('Please add at least one product to the combo.'); return; }
    }
    if (type === 'SEASONAL') {
      if (!startDate || !endDate) { toast.error('Please specify both start and end dates.'); return; }
      if (new Date(endDate) <= new Date(startDate)) { toast.error('End Date must be after Start Date.'); return; }
    }
    if (type === 'DAILY' && !applicableDate) { toast.error('Please specify the applicable date.'); return; }
    if (type === 'DAILY' && (!dailyStartTime || !dailyEndTime)) { toast.error('Please specify start and end times.'); return; }

    const payload = {
      name,
      type,
      discountValue,
      label: label || undefined,
      imageUrl: imageUrl || undefined,
      startDate: type === 'SEASONAL' ? startDate : undefined,
      endDate: type === 'SEASONAL' ? endDate : undefined,
      dailyStartTime: type === 'DAILY' ? dailyStartTime : undefined,
      dailyEndTime: type === 'DAILY' ? dailyEndTime : undefined,
      applicableDate: type === 'DAILY' ? applicableDate : undefined,
      productIds: type !== 'COMBO' ? selectedProductIds : undefined,
      comboItems: type === 'COMBO' ? comboItems : undefined
    };

    try {
      if (editingDiscount) {
        const res = await DiscountService.updateDiscount(editingDiscount.id, payload);
        if (res.success) {
          showToast(`Discount "${name}" updated successfully.`);
          fetchDiscounts();
          setIsModalOpen(false);
        } else {
          toast.error(res.message || 'Failed to update discount.');
        }
      } else {
        const res = await DiscountService.createDiscount(payload);
        if (res.success) {
          showToast(`Discount "${name}" created in DRAFT state.`);
          fetchDiscounts();
          setIsModalOpen(false);
        } else {
          toast.error(res.message || 'Failed to create discount.');
        }
      }
    } catch (err: any) {
      console.error('Error saving discount:', err);
      toast.error(err.response?.data?.message || 'Server error saving discount.');
    }
  };

  const handleDelete = (discount: DiscountItem) => {
    if (discount.approvalStatus === 'APPROVED') {
      toast.error('This is an Admin-Approved discount campaign. You must contact the Admin to change it to Draft first before you can delete it.', { duration: 6000 });
      return;
    }
    const action = async () => {
      try {
        const res = await DiscountService.deleteDiscount(discount.id);
        if (res.success) {
          showToast(`Discount "${discount.name}" deleted.`, 'info');
          fetchDiscounts();
        } else {
          toast.error('Failed to delete discount.');
        }
      } catch (err: any) {
        console.error('Error deleting discount:', err);
        toast.error(err.response?.data?.message || 'Server error deleting discount.');
      }
    };
    if (showConfirm) {
      showConfirm('Delete Discount', `Are you sure you want to delete the discount "${discount.name}"?`, action);
    } else {
      if (window.confirm(`Are you sure you want to delete the discount "${discount.name}"?`)) action();
    }
  };

  const toggleDiscountStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await DiscountService.toggleStatus(id, { isActive: !currentStatus });
      if (res.success) {
        showToast('Discount status changed.', 'info');
        fetchDiscounts();
      }
    } catch (err) {
      console.error('Error toggling active status:', err);
      toast.error('Failed to update status.');
    }
  };

  const handleProductSelectToggle = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleToggleProduct = (id: string) => {
    handleProductSelectToggle(id);
  };

  const handleAddComboItem = (productId: string) => {
    if (comboItems.some(item => item.productId === productId)) return;
    setComboItems(prev => [...prev, { productId, minQty: 1 }]);
    setProductSearch(''); // Reset search input
  };

  const handleRemoveComboItem = (productId: string) => {
    setComboItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleUpdateComboItem = (productId: string, val: number) => {
    setComboItems(prev =>
      prev.map(item => (item.productId === productId ? { ...item, minQty: val } : item))
    );
  };

  const handleUpdateComboQty = (productId: string, val: number) => {
    handleUpdateComboItem(productId, val);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }
    try {
      setIsImageUploading(true);
      const res = await UploadService.uploadImage(file);
      if (res.success && res.url) {
        setImageUrl(res.url);
        toast.success('Campaign image uploaded to Cloudinary!');
      } else {
        toast.error('Failed to upload image.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setIsImageUploading(false);
      e.target.value = '';
    }
  };

  const calculateComboPricing = () => {
    const originalTotal = originalComboTotal;
    const finalTotal = originalTotal * (1 - discountValue / 100);
    const savings = originalTotal * (discountValue / 100);
    return { originalTotal, finalTotal, savings };
  };

  type DiscountTab = 'ALL' | 'COMBO' | 'DAILY' | 'SEASONAL' | 'INACTIVE';
  const [discountTab, setDiscountTab] = useState<DiscountTab>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const todayStr = new Date().toISOString().split('T')[0];
  const countAll = discounts.length;
  const countCombo = useMemo(() => discounts.filter(d => d.type === 'COMBO' && d.isActive && (!d.endDate || d.endDate >= todayStr)).length, [discounts, todayStr]);
  const countDaily = useMemo(() => discounts.filter(d => d.type === 'DAILY' && d.isActive && (!d.endDate || d.endDate >= todayStr)).length, [discounts, todayStr]);
  const countSeasonal = useMemo(() => discounts.filter(d => d.type === 'SEASONAL' && d.isActive && (!d.endDate || d.endDate >= todayStr)).length, [discounts, todayStr]);
  const countInactive = useMemo(() => discounts.filter(d => !d.isActive || (Boolean(d.endDate) && d.endDate! < todayStr)).length, [discounts, todayStr]);

  const filteredDiscounts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const today = new Date().toISOString().split('T')[0];

    return discounts.filter(d => {
      const matchesSearch = !query || d.name.toLowerCase().includes(query) || (d.label && d.label.toLowerCase().includes(query));
      if (!matchesSearch) return false;

      const isExpiredOrPaused = !d.isActive || (Boolean(d.endDate) && d.endDate! < today);

      if (discountTab === 'COMBO') return d.type === 'COMBO' && !isExpiredOrPaused;
      if (discountTab === 'DAILY') return d.type === 'DAILY' && !isExpiredOrPaused;
      if (discountTab === 'SEASONAL') return d.type === 'SEASONAL' && !isExpiredOrPaused;
      if (discountTab === 'INACTIVE') return isExpiredOrPaused;
      return true; // 'ALL'
    });
  }, [discounts, searchTerm, discountTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, discountTab, discounts]);

  const paginatedDiscounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDiscounts.slice(start, start + pageSize);
  }, [filteredDiscounts, currentPage, pageSize]);

  // Helper renderer for discount card
  const renderDiscountCard = (discount: DiscountItem, isExpired: boolean) => (
    <div
      key={discount.id}
      className={`bg-surface-container-lowest border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col ${
        isExpired 
          ? 'border-red-200/40 bg-slate-50/60 opacity-55 blur-[0.4px] hover:opacity-100 hover:blur-none hover:border-red-300 hover:bg-white' 
          : 'border-outline-variant/60'
      }`}
    >
      <div
        onClick={() => setViewingDiscount(discount)}
        className="cursor-pointer hover:bg-slate-50/20 transition-colors flex-1 flex flex-col"
        title="Click to view details"
      >
        <div className="h-32 w-full relative bg-slate-100">
          <img
            src={discount.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop'}
            alt={discount.name}
            className={`w-full h-full object-cover ${isExpired ? 'grayscale-[0.3]' : ''}`}
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
              {discount.approvalStatus}
            </span>
          </div>
          {discount.label && (
            <div className="absolute bottom-3 left-3 bg-[#0a3822]/85 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              {discount.label}
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-sm text-on-surface line-clamp-1">{discount.name}</h3>
              {isExpired ? (
                <div className="flex items-center gap-1.5 bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Expired</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${discount.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="text-[10px] font-bold text-outline uppercase">{discount.isActive ? 'Active' : 'Paused'}</span>
                </div>
              )}
            </div>

            <div className="mt-3 text-xs text-outline space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-outline text-[16px]">local_offer</span>
                <span>
                  Discount Value: <strong className="text-on-surface">{discount.discountValue}% Off</strong>
                </span>
              </div>

              {discount.type === 'SEASONAL' && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-outline text-[16px]">calendar_month</span>
                  <span>
                    Validity: <strong className="text-on-surface">{discount.startDate} to {discount.endDate}</strong>
                  </span>
                </div>
              )}

              {discount.type === 'DAILY' && (
                <>
                  {discount.applicableDate && (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-outline text-[16px]">calendar_month</span>
                      <span>
                        Date: <strong className="text-on-surface">{discount.applicableDate}</strong>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-outline text-[16px]">schedule</span>
                    <span>
                      Daily Hours: <strong className="text-on-surface">{discount.dailyStartTime} - {discount.dailyEndTime}</strong>
                    </span>
                  </div>
                </>
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
                      const prod = products.find(p => p.id === item.productId || p.sku === item.productId);
                      const displayName = prod ? prod.name : (item.productName || item.productId);
                      return (
                        <div key={idx} className="text-[10px] text-outline-variant font-medium">
                          • {displayName} (x{item.minQty})
                        </div>
                      );
                    })}
                  </div>
                )}
                {discount.type !== 'COMBO' && discount.productIds && discount.productIds.length > 0 && (
                  <div className="mt-1 pl-5 space-y-0.5 border-l border-primary/30 max-h-20 overflow-y-auto">
                    {discount.productIds.slice(0, 3).map((pId, idx) => {
                      const prod = products.find(p => p.id === pId || p.sku === pId);
                      return (
                        <div key={idx} className="text-[10px] text-outline-variant font-medium truncate">
                          • {prod ? prod.name : pId}
                        </div>
                      );
                    })}
                    {discount.productIds.length > 3 && (
                      <div className="text-[9px] text-outline font-bold pl-2">
                        + {discount.productIds.length - 3} more products
                      </div>
                    )}
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
            onClick={() => handleDelete(discount)}
            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Premium Statistics Overview deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-outline-variant/60 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Total Campaigns</p>
            <h3 className="text-2xl font-black text-on-surface">{discounts.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">local_offer</span>
          </div>
        </div>

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
      </div>

      {/* Segmented Controls & Search Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-surface-container-lowest border border-outline-variant/60 p-4 rounded-2xl shadow-sm">
        {/* Tab Pills */}
        <div className="inline-flex flex-wrap p-1 bg-slate-100/90 border border-outline-variant/50 rounded-xl text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setDiscountTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              discountTab === 'ALL' ? 'bg-[#0b8252] text-white shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All Campaigns</span>
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${discountTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>{countAll}</span>
          </button>
          <button
            type="button"
            onClick={() => setDiscountTab('COMBO')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              discountTab === 'COMBO' ? 'bg-[#0b8252] text-white shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
            <span>Combo Offers</span>
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${discountTab === 'COMBO' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>{countCombo}</span>
          </button>
          <button
            type="button"
            onClick={() => setDiscountTab('DAILY')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              discountTab === 'DAILY' ? 'bg-[#0b8252] text-white shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">schedule</span>
            <span>Daily Offers</span>
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${discountTab === 'DAILY' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>{countDaily}</span>
          </button>
          <button
            type="button"
            onClick={() => setDiscountTab('SEASONAL')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              discountTab === 'SEASONAL' ? 'bg-[#0b8252] text-white shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">event</span>
            <span>Seasonal Offers</span>
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${discountTab === 'SEASONAL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>{countSeasonal}</span>
          </button>
          <button
            type="button"
            onClick={() => setDiscountTab('INACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              discountTab === 'INACTIVE' ? 'bg-[#0b8252] text-white shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">history</span>
            <span>Inactive / Expired</span>
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${discountTab === 'INACTIVE' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>{countInactive}</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full lg:w-64 shrink-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search discounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Grid of campaigns */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm font-bold text-outline">Loading discount campaigns from database...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredDiscounts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 text-gray-400 text-xs font-bold space-y-2">
              <span className="material-symbols-outlined text-4xl text-gray-300">local_offer</span>
              <p>No campaigns found in this view.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDiscounts.map((discount) => {
                const isExpiredOrPaused = !discount.isActive || (Boolean(discount.endDate) && discount.endDate! < todayStr);
                return renderDiscountCard(discount, isExpiredOrPaused);
              })}
            </div>
          )}

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredDiscounts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 9, 12]}
            itemName="campaigns"
            className="rounded-xl border"
          />
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 border-b border-outline-variant/60 shrink-0">
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
                        setProductSearch('');
                        if (discountValue === 0) {
                          setDiscountValue(10);
                        }
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary font-bold"
                    >
                      <option value="SEASONAL">Seasonal Offer (Fixed Date Range)</option>
                      <option value="DAILY">Daily Offer (Recurring Hours)</option>
                      <option value="COMBO">Combo Offer (Bundle Deal)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                      {type === 'COMBO' ? 'Combo Bundle Discount (%) *' : 'Discount Value (%) *'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={discountValue || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setDiscountValue(val >= 0 ? val : 0);
                        }}
                        placeholder="10"
                        className="w-full pl-3 pr-8 py-2 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-outline">%</span>
                    </div>
                  </div>

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
                </div>

                {/* Campaign Image Upload Area */}
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Campaign Promo Image
                  </label>
                  <div className="p-4 border border-outline-variant rounded-xl bg-slate-50 flex items-center gap-4">
                    {imageUrl ? (
                      <div className="relative group shrink-0">
                        <img
                          src={imageUrl}
                          alt="Campaign Preview"
                          className="w-16 h-16 rounded-lg object-cover border border-outline-variant shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow hover:bg-rose-600"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-outline bg-white shrink-0">
                        <span className="material-symbols-outlined text-2xl">image</span>
                        <span className="text-[9px] font-bold mt-0.5">No Image</span>
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="Paste image URL or upload file..."
                          className="flex-1 px-3 py-1.5 bg-white border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary placeholder:text-outline-variant"
                        />
                        <label className={`inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark cursor-pointer transition-colors shadow-sm shrink-0 ${
                          isImageUploading ? 'opacity-50 pointer-events-none' : ''
                        }`}>
                          {isImageUploading ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                              <span>Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={isImageUploading}
                              />
                            </>
                          )}
                        </label>
                      </div>
                      <p className="text-[10px] text-outline font-medium">
                        Uploads directly to Cloudinary or accept direct web image URLs.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seasonal Date Config */}
                {type === 'SEASONAL' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Daily Specific Date / Schedule Config */}
                {type === 'DAILY' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                        Applicable Date * (Specific Day for Recurring Offer)
                      </label>
                      <input
                        type="date"
                        value={applicableDate}
                        onChange={(e) => setApplicableDate(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                )}

                {/* Combo Deal Builder */}
                {type === 'COMBO' ? (
                  <div className="space-y-4 border-t border-outline-variant/60 pt-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">
                        Configure Combo Items (Min 2 items) *
                      </label>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {comboItems.length} Products in Bundle
                      </span>
                    </div>

                    {/* Available Products Picker */}
                    <div className="border border-outline-variant rounded-xl p-3 bg-slate-50/50 space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search product to add to bundle..."
                          className="w-full pl-8 pr-3 py-1.5 bg-background border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary"
                        />
                        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                          search
                        </span>
                      </div>

                      {productSearch.trim() && (
                        <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 bg-background border border-outline-variant rounded-lg shadow-sm">
                          {products
                            .filter(p =>
                              p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                              p.sku.toLowerCase().includes(productSearch.toLowerCase())
                            )
                            .map((p) => {
                              const alreadyAdded = comboItems.some(item => item.productId === p.id);
                              return (
                                <div key={p.id} className="p-2 flex items-center justify-between hover:bg-slate-50 text-xs">
                                  <div>
                                    <p className="font-bold text-on-surface">{p.name}</p>
                                    <p className="text-[10px] text-outline">SKU: {p.sku} | Rs. {p.sellingPrice}</p>
                                  </div>
                                  <button
                                    type="button"
                                    disabled={alreadyAdded}
                                    onClick={() => handleAddComboItem(p.id)}
                                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                                      alreadyAdded
                                        ? 'bg-slate-100 text-outline cursor-not-allowed'
                                        : 'bg-primary text-white hover:bg-primary-dark'
                                    }`}
                                  >
                                    {alreadyAdded ? 'Added' : '+ Add to Bundle'}
                                  </button>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    {/* Selected Combo Items List */}
                    <div className="space-y-2">
                      {comboItems.map((item) => {
                        const prod = products.find(p => p.id === item.productId);
                        return (
                          <div key={item.productId} className="flex items-center justify-between p-3 bg-white border border-outline-variant rounded-xl shadow-sm">
                            <div className="min-w-0 flex-1 pr-3">
                              <p className="text-xs font-bold text-on-surface truncate">{prod?.name || item.productId}</p>
                              <p className="text-[10px] text-outline font-semibold">Unit Price: Rs. {prod?.sellingPrice || 0}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 bg-slate-50 border border-outline-variant px-2 py-1 rounded-lg">
                                <span className="text-[10px] font-bold text-outline">Qty:</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.minQty}
                                  onChange={(e) => handleUpdateComboQty(item.productId, Number(e.target.value))}
                                  className="w-12 bg-transparent text-xs font-bold text-center outline-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveComboItem(item.productId)}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {comboItems.length === 0 && (
                        <p className="text-xs text-outline text-center py-3">No combo items selected. Search and add above.</p>
                      )}
                    </div>

                    {/* Combo Pricing Calculation summary */}
                    {comboItems.length > 0 && (
                      <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Bundle Total Price</p>
                          <p className="text-xs font-semibold text-emerald-900 mt-0.5">
                            Original: <span className="line-through">Rs. {calculateComboPricing().originalTotal.toFixed(2)}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-black text-emerald-700">
                            Rs. {calculateComboPricing().finalTotal.toFixed(2)}
                          </p>
                          <p className="text-[10px] font-bold text-emerald-600">
                            (Save Rs. {calculateComboPricing().savings.toFixed(2)})
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Product Selector for Daily / Seasonal */
                  <div className="space-y-2 border-t border-outline-variant/60 pt-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">
                        Apply to Specific Products ({selectedProductIds.length} selected)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedProductIds.length === products.length) {
                            setSelectedProductIds([]);
                          } else {
                            setSelectedProductIds(products.map(p => p.id));
                          }
                        }}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        {selectedProductIds.length === products.length ? 'Deselect All' : 'Select All Products'}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products by title or SKU..."
                        className="w-full pl-8 pr-3 py-2 bg-background border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                        search
                      </span>
                    </div>

                    <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-outline-variant rounded-xl p-2 bg-slate-50/50">
                      {products
                        .filter(p =>
                          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.sku.toLowerCase().includes(productSearch.toLowerCase())
                        )
                        .map((p) => {
                          const isChecked = selectedProductIds.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleProduct(p.id)}
                                className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-on-surface truncate">{p.name}</p>
                                <p className="text-[10px] text-outline">SKU: {p.sku} | Rs. {p.sellingPrice}</p>
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-outline-variant/60 shrink-0">
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
                  {editingDiscount ? 'Save Changes' : 'Create Campaign (Draft)'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Discount Details Modal */}
      {viewingDiscount &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 border-b border-outline-variant/60 shrink-0">
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

              <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50/30">
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
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          viewingDiscount.approvalStatus === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}
                      >
                        {viewingDiscount.approvalStatus}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          viewingDiscount.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}
                      >
                        {viewingDiscount.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-on-surface">{viewingDiscount.name}</h3>
                    {viewingDiscount.label && (
                      <p className="text-xs text-primary font-bold mt-0.5">Badge: {viewingDiscount.label}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 border border-outline-variant/60 rounded-xl shadow-sm space-y-2">
                    <span className="block text-[10px] font-black text-outline uppercase tracking-wider">Discount Value</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-primary">{`${viewingDiscount.discountValue}%`}</span>
                      <span className="text-xs font-bold text-outline">
                        {viewingDiscount.type === 'COMBO' ? 'Off Combo Bundle' : 'Off Original Price'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 border border-outline-variant/60 rounded-xl shadow-sm space-y-2">
                    <span className="block text-[10px] font-black text-outline uppercase tracking-wider">Campaign Schedule</span>
                    <div className="text-xs font-bold text-on-surface">
                      {viewingDiscount.type === 'SEASONAL' && (
                        <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px] text-outline">calendar_month</span>
                          <span>
                            Validity: {viewingDiscount.startDate} to {viewingDiscount.endDate}
                          </span>
                        </div>
                      )}
                      {viewingDiscount.type === 'DAILY' && (
                        <div className="flex flex-col gap-1 mt-1 text-on-surface-variant">
                          {viewingDiscount.applicableDate && (
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-outline">calendar_month</span>
                              <span>Date: {viewingDiscount.applicableDate}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                            <span>
                              Daily Hours: {viewingDiscount.dailyStartTime} - {viewingDiscount.dailyEndTime}
                            </span>
                          </div>
                        </div>
                      )}
                      {viewingDiscount.type === 'COMBO' && (
                        <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px] text-outline">layers</span>
                          <span>Bundle Offer applies automatically when conditions match</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Target Products / Combo Summary in details modal */}
                <div className="bg-white p-4 border border-outline-variant/60 rounded-xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black text-outline uppercase tracking-wider">
                      {viewingDiscount.type === 'COMBO' ? 'Combo Bundle Products' : 'Participating Products'}
                    </span>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {viewingDiscount.type === 'COMBO'
                        ? `${viewingDiscount.comboItems?.length || 0} Items`
                        : `${viewingDiscount.productIds?.length || 0} Products`}
                    </span>
                  </div>

                  {viewingDiscount.type === 'COMBO' ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {viewingDiscount.comboItems && viewingDiscount.comboItems.length > 0 ? (
                        viewingDiscount.comboItems.map((item, idx) => {
                          const prod = products.find((p) => p.id === item.productId);
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs"
                            >
                              <div>
                                <span className="font-bold text-on-surface block">
                                  {prod?.name || item.productName || item.productId}
                                </span>
                                <span className="text-[10px] text-outline">Unit Price: Rs. {prod?.sellingPrice || 0}</span>
                              </div>
                              <span className="font-black text-primary bg-white px-2 py-1 rounded border border-slate-200">
                                Min Qty: {item.minQty}
                              </span>
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
                          const prod = products.find((p) => p.id === pId || p.sku === pId);
                          if (!prod) return null;
                          const finalPrice = prod.sellingPrice * (1 - viewingDiscount.discountValue / 100);
                          return (
                            <div
                              key={idx}
                              className="py-2.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="block text-xs font-bold text-on-surface truncate">{prod.name}</span>
                                <span className="block text-[10px] text-outline mt-0.5 font-semibold">
                                  SKU: {prod.sku} • Stock:{' '}
                                  <strong className={prod.stock === 0 ? 'text-red-600' : 'text-on-surface'}>
                                    {prod.stock}
                                  </strong>
                                </span>
                              </div>
                              <div className="text-right whitespace-nowrap">
                                <span className="block text-xs font-black text-primary">Rs. {finalPrice.toFixed(2)}</span>
                                <span className="block text-[9px] text-outline line-through mt-0.5 font-bold">
                                  Rs. {prod.sellingPrice}
                                </span>
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
          </div>,
          document.body
        )}
    </div>
  );
}
