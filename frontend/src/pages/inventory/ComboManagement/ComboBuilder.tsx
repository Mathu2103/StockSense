import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { comboService } from '../../../services/comboService';
import { api } from '../../../services/axiosInstance';
import Sidebar from '../Shared/Sidebar';
import InventoryHeader from '../Shared/InventoryHeader';

export default function ComboBuilder() {
  const [searchParams] = useSearchParams();
  const comboId = searchParams.get('id');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]); // All active products for dropdown
  
  // Form State
  const [name, setName] = useState('');
  const [comboCode, setComboCode] = useState('');
  const [description, setDescription] = useState('');
  const [comboType, setComboType] = useState('SLOW_MOVING');
  const [comboPrice, setComboPrice] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [comboStatus, setComboStatus] = useState('DRAFT');

  // Fetch all active products
  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?status=ACTIVE');
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load existing combo if id is passed
  const loadCombo = async () => {
    if (!comboId) return;
    try {
      setLoading(true);
      const payload = await comboService.getComboDetails(comboId);
      if (payload.success) {
        const combo = payload.data;
        setName(combo.name);
        setComboCode(combo.comboCode);
        setDescription(combo.description || '');
        setComboType(combo.comboType);
        setComboPrice(combo.comboPrice);
        setStartDate(combo.startDate.split('T')[0]);
        setEndDate(combo.endDate.split('T')[0]);
        setComboStatus(combo.status);
        
        // Map items
        const mappedItems = combo.items.map((i: any) => ({
          productId: i.productId,
          name: i.product?.name || i.productId,
          role: i.role,
          quantity: i.quantity,
          normalUnitPrice: i.normalUnitPrice,
          costPrice: i.costPrice,
          batchId: i.batchId
        }));
        setItems(mappedItems);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    loadCombo();
  }, [comboId]);

  // Live Recalculations
  const normalTotalPrice = items.reduce((sum, item) => sum + (item.normalUnitPrice * item.quantity), 0);
  const totalCost = items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
  const expectedProfit = comboPrice - totalCost;
  const expectedMargin = comboPrice > 0 ? (expectedProfit / comboPrice) * 100 : 0;

  // Handle Add Item
  const handleAddItem = (productId: string) => {
    if (items.some(i => i.productId === productId)) return;
    const prod = products.find(p => p.sku === productId);
    if (!prod) return;

    setItems([...items, {
      productId: prod.sku,
      name: prod.name,
      role: items.length === 0 ? 'TARGET' : 'ANCHOR',
      quantity: 1,
      normalUnitPrice: prod.sellingPrice,
      costPrice: prod.costPrice,
      batchId: null
    }]);
  };

  // Handle Change Item Field
  const handleItemFieldChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
  };

  // Client-Side Revalidation
  const runLiveValidation = () => {
    const errors: string[] = [];
    if (!name) errors.push('Combo name is required.');
    if (!comboCode) errors.push('Combo code identifier is required.');
    if (items.length < 2) errors.push('A combo must contain at least 2 items.');
    if (comboPrice >= normalTotalPrice && normalTotalPrice > 0) errors.push('Combo price must be less than the total sum of normal prices.');
    if (expectedMargin < 20) errors.push('Warning: Projected profit margin is below the safe threshold of 20%.');
    if (comboPrice <= totalCost) errors.push('Critical: Combo price is below aggregate cost. Negative profit detected.');
    
    // Check role count
    const targets = items.filter(i => i.role === 'TARGET');
    const anchors = items.filter(i => i.role === 'ANCHOR');
    if (targets.length === 0) errors.push('A combo must designate at least one TARGET product.');
    if (anchors.length === 0) errors.push('A combo must designate at least one ANCHOR product.');

    setValidationErrors(errors);
    setValidationSuccess(errors.length === 0);
  };

  useEffect(() => {
    runLiveValidation();
  }, [name, comboCode, comboPrice, items, startDate, endDate]);

  const handleSave = async (submit = false) => {
    if (validationErrors.length > 0 && !submit) {
      if (!confirm('Form contains validation errors. Do you want to save draft anyway?')) return;
    }

    try {
      setSaving(true);
      const payload = {
        name,
        comboCode,
        description,
        comboType,
        comboPrice,
        startDate,
        endDate,
        items
      };

      let activeComboId = comboId;
      if (comboId) {
        const res = await comboService.updateComboDraft(comboId, payload);
        if (!res.success) {
          alert(res.message || 'Error occurred while saving.');
          return;
        }
      } else {
        const res = await comboService.createComboDraft(payload);
        if (res.success) {
          activeComboId = res.data.id;
        } else {
          alert(res.message || 'Error occurred while saving.');
          return;
        }
      }

      if (submit && activeComboId) {
        const subRes = await comboService.submitComboForApproval(activeComboId);
        if (subRes.success) {
          alert('Combo draft saved and submitted for approval!');
          navigate('/inventory-combo');
          return;
        }
      }
      
      alert('Combo campaign draft saved successfully!');
      navigate('/inventory-combo');
    } catch (error) {
      alert('Network failure.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <InventoryHeader />
          <main className="flex-1 overflow-y-auto px-6 py-6 bg-[#f8f9fa]">
            <div className="text-center py-20 text-gray-400">Loading campaign details...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InventoryHeader />

        <main className="flex-1 overflow-y-auto px-6 py-6 bg-[#f8f9fa]">
          <div className="max-w-[1400px] w-full mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <button 
            onClick={() => navigate('/inventory-combo')}
            className="flex items-center gap-1 text-gray-400 hover:text-[#103e2c] font-bold text-xs cursor-pointer mb-2"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">{comboId ? 'Edit Combo Campaign' : 'Create Custom Combo'}</h1>
        </div>
        
        <div className="flex gap-2">
          {comboStatus === 'DRAFT' || comboStatus === 'CHANGES_REQUESTED' ? (
            <>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="bg-white border border-gray-200 text-gray-700 font-bold px-6 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer text-sm"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving || validationErrors.length > 0}
                className="bg-[#103e2c] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#165a40] disabled:bg-gray-300 transition-all cursor-pointer text-sm shadow-sm"
              >
                Submit for Approval
              </button>
            </>
          ) : (
            <span className="bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-100 text-xs px-4 py-2 rounded-xl">
              Combo Status: {comboStatus} (Locked)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Builder Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Attributes */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Campaign Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Combo Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Bread & Butter Breakfast Pack"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white focus:border-emerald-700 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Combo Code (Unique)</label>
                <input 
                  type="text" 
                  value={comboCode} 
                  onChange={(e) => setComboCode(e.target.value)} 
                  placeholder="e.g. BREAKFASTCOMBO"
                  disabled={!!comboId}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white focus:border-emerald-700 transition-all disabled:bg-gray-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Combo Type</label>
                <select 
                  value={comboType} 
                  onChange={(e) => setComboType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white focus:border-emerald-700 transition-all cursor-pointer"
                >
                  <option value="SLOW_MOVING">Slow-Moving Support</option>
                  <option value="DEAD_STOCK">Dead-Stock clearance</option>
                  <option value="NEAR_EXPIRY">Near-Expiry emergency</option>
                  <option value="OVERSTOCK">Overstock dump</option>
                  <option value="SEASONAL">Seasonal promotion</option>
                  <option value="REGULAR_COMPLEMENTARY">Regular Complementary Rule</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Combo Price (Rs.)</label>
                <input 
                  type="number" 
                  value={comboPrice} 
                  onChange={(e) => setComboPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white focus:border-emerald-700 transition-all font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Start Date</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white focus:border-emerald-700 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">End Date</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white focus:border-emerald-700 transition-all"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase">Campaign Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of promotional campaign..."
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white focus:border-emerald-700 transition-all"
              />
            </div>
          </div>

          {/* Combo Items */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <h3 className="text-lg font-bold text-gray-800">Combo Products</h3>
              
              {/* Product selector dropdown */}
              <div className="flex items-center gap-2">
                <select 
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddItem(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="bg-white border border-gray-200 rounded-lg text-xs font-bold px-3 py-1.5 outline-none cursor-pointer"
                >
                  <option value="">+ Add Product</option>
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>{p.name} (Rs. {p.sellingPrice})</option>
                  ))}
                </select>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Select items from the dropdown list to add them.</div>
            ) : (
              <div className="space-y-4 divide-y divide-gray-50">
                {items.map((item, index) => (
                  <div key={item.productId} className="pt-4 first:pt-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="md:col-span-2">
                      <p className="font-bold text-gray-800">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{item.productId}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase">Qty</label>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => handleItemFieldChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase">Role</label>
                        <select 
                          value={item.role} 
                          onChange={(e) => handleItemFieldChange(index, 'role', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer"
                        >
                          <option value="TARGET">Target</option>
                          <option value="ANCHOR">Anchor</option>
                          <option value="SUPPORT">Support</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end pr-2">
                      <button 
                        onClick={() => handleRemoveItem(index)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Column: Profit Margin Checker & Validation */}
        <div className="space-y-6">
          
          {/* Pricing scorecard */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Financial Preview</h3>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Normal Total Price</span>
                <span className="font-semibold text-gray-800">Rs. {normalTotalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Combo Cost Price</span>
                <span className="font-semibold text-gray-800">Rs. {totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-50 pt-2">
                <span>Customer Discount</span>
                <span className="font-bold text-emerald-800">
                  Rs. {(normalTotalPrice - comboPrice).toFixed(2)} ({(normalTotalPrice > 0 ? ((normalTotalPrice - comboPrice) / normalTotalPrice * 100) : 0).toFixed(0)}%)
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-50 pt-2 text-base">
                <span>Projected Profit</span>
                <span className={`font-black ${expectedProfit >= 0 ? 'text-gray-900' : 'text-red-700'}`}>
                  Rs. {expectedProfit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span>Expected Profit Margin</span>
                <span className={`text-lg font-black ${expectedMargin >= 20 ? 'text-emerald-800' : 'text-amber-600'}`}>
                  {expectedMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Validation Logs */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">System Revalidation</h3>
            
            {validationSuccess ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                All checks passed! Campaign is margin-safe and ready.
              </div>
            ) : (
              <div className="space-y-2">
                {validationErrors.map((err, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 bg-amber-50 border border-amber-100 text-amber-900 px-3 py-2.5 rounded-xl text-[11px] leading-relaxed">
                    <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0">warning</span>
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
</div>
  );
}
