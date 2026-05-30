import React, { useState, useMemo } from 'react';
import Sidebar from './Components/Sidebar';
import InventoryHeader from './Components/InventoryHeader';

interface Product {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
}

interface Adjustment {
  id: string;
  productName: string;
  currentStock: number;
  newStock: number;
  difference: number;
  reason: 'Damaged' | 'Expired' | 'Manual Correction';
  date: string;
  notes?: string;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Organic Whole Milk 1L', currentStock: 42, minStock: 10 },
  { id: '2', name: 'Green Bell Pepper (kg)', currentStock: 15, minStock: 5 },
  { id: '3', name: 'Midnight Velvet Roast Coffee', currentStock: 28, minStock: 8 },
  { id: '4', name: 'Golden Maple Granola', currentStock: 50, minStock: 15 },
  { id: '5', name: 'Pure Alpine Sparkling Water', currentStock: 120, minStock: 20 },
  { id: '6', name: 'Botanical Defense Soap', currentStock: 12, minStock: 10 },
];

const INITIAL_ADJUSTMENTS: Adjustment[] = [
  { id: 'adj-1', productName: 'Green Bell Pepper (kg)', currentStock: 12, newStock: 15, difference: 3, reason: 'Manual Correction', date: '2026-05-25' },
  { id: 'adj-2', productName: 'Organic Whole Milk 1L', currentStock: 46, newStock: 42, difference: -4, reason: 'Expired', date: '2026-05-24' },
  { id: 'adj-3', productName: 'Botanical Defense Soap', currentStock: 16, newStock: 12, difference: -4, reason: 'Damaged', date: '2026-05-23' },
];

export default function InventoryAdjustments() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [adjustments, setAdjustments] = useState<Adjustment[]>(INITIAL_ADJUSTMENTS);
  const [showModal, setShowModal] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState<string>('All');

  // Form State
  const [selectedProductId, setSelectedProductId] = useState(INITIAL_PRODUCTS[0].id);
  const [newStockInput, setNewStockInput] = useState<number | ''>('');
  const [selectedReason, setSelectedReason] = useState<'Damaged' | 'Expired' | 'Manual Correction'>('Manual Correction');
  const [formNotes, setFormNotes] = useState('');

  // Selected Product details for form
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  // Calculated values for new stock & difference
  const calculatedDifference = useMemo(() => {
    if (newStockInput === '') return 0;
    return newStockInput - selectedProduct.currentStock;
  }, [newStockInput, selectedProduct]);

  // Warning trigger if new stock drops below minimum
  const isBelowMinStock = useMemo(() => {
    if (newStockInput === '') return false;
    return newStockInput < selectedProduct.minStock;
  }, [newStockInput, selectedProduct]);

  // Save new adjustment
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStockInput === '' || newStockInput < 0) return;

    const diff = newStockInput - selectedProduct.currentStock;
    const newAdj: Adjustment = {
      id: `adj-${Date.now()}`,
      productName: selectedProduct.name,
      currentStock: selectedProduct.currentStock,
      newStock: newStockInput,
      difference: diff,
      reason: selectedReason,
      date: new Date().toISOString().split('T')[0],
      notes: formNotes,
    };

    // Update product stock instantly in system
    setProducts(prev => prev.map(p => {
      if (p.id === selectedProductId) {
        return { ...p, currentStock: newStockInput };
      }
      return p;
    }));

    // Add to adjustments list
    setAdjustments(prev => [newAdj, ...prev]);

    // Reset Form & Close Modal
    setNewStockInput('');
    setFormNotes('');
    setShowModal(false);
  };

  // Filtered Adjustments for table
  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(adj => {
      const matchesSearch = adj.productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesReason = reasonFilter === 'All' || adj.reason === reasonFilter;
      return matchesSearch && matchesReason;
    });
  }, [adjustments, searchQuery, reasonFilter]);

  // Statistics Summary Cards
  const stats = useMemo(() => {
    let increased = 0;
    let reduced = 0;
    adjustments.forEach(adj => {
      if (adj.difference > 0) increased += adj.difference;
      else reduced += Math.abs(adj.difference);
    });
    return {
      totalCount: adjustments.length,
      increased,
      reduced,
    };
  }, [adjustments]);

  // Right Side Summary Panel Calculations
  const summaryPanel = useMemo(() => {
    let totalItemsAdjusted = 0;
    let netStockChange = 0;
    adjustments.forEach(adj => {
      totalItemsAdjusted += Math.abs(adj.difference);
      netStockChange += adj.difference;
    });
    return {
      totalItemsAdjusted,
      netStockChange,
    };
  }, [adjustments]);

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InventoryHeader />

        <main className="flex-1 overflow-y-auto px-6 py-8 bg-[#f8f9fa]">
          <div className="max-w-[1200px] w-full mx-auto space-y-8">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-5">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Inventory Adjustment</h1>
                <p className="text-slate-500 mt-1.5 text-sm font-medium">Correct stock discrepancies and maintain accurate inventory records.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => {
                    if (products.length > 0) {
                      setSelectedProductId(products[0].id);
                    }
                    setNewStockInput('');
                    setSelectedReason('Manual Correction');
                    setFormNotes('');
                    setShowModal(true);
                  }}
                  className="px-5 py-2.5 bg-[#0b8252] text-white font-bold text-sm rounded-lg shadow-sm hover:bg-[#096b43] transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  New Adjustment
                </button>
                <button 
                  onClick={() => {
                    const tableElement = document.getElementById('adjustments-history-table');
                    if (tableElement) {
                      tableElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-lg shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  View History
                </button>
              </div>
            </div>

            {/* 3 Simple Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 text-[#0b8252] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">difference</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Adjustments</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.totalCount}</h3>
                </div>
              </div>
              {/* Card 2 */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-50 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">trending_up</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Increased</p>
                  <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">+{stats.increased} Units</h3>
                </div>
              </div>
              {/* Card 3 */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">trending_down</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Reduced</p>
                  <h3 className="text-2xl font-extrabold text-red-500 mt-1">-{stats.reduced} Units</h3>
                </div>
              </div>
            </div>

            {/* Main Area divided into Table & Summary Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Side: Search & Table */}
              <div className="lg:col-span-2 space-y-6" id="adjustments-history-table">
                
                {/* Search & Filter Bar */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full sm:max-w-xs">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                    <input 
                      type="text" 
                      placeholder="Search by product name..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0b8252] transition-colors"
                    />
                  </div>
                  <div className="relative w-full sm:w-48 shrink-0">
                    <select 
                      value={reasonFilter}
                      onChange={e => setReasonFilter(e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#0b8252] cursor-pointer"
                    >
                      <option value="All">All Reasons</option>
                      <option value="Damaged">Damaged</option>
                      <option value="Expired">Expired</option>
                      <option value="Manual Correction">Manual Correction</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                  </div>
                </div>

                {/* Adjustment Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[650px]">
                      <thead>
                        <tr className="border-b border-slate-150 bg-slate-50/50">
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Current Stock</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">New Stock</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Difference</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredAdjustments.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                              No adjustments history found matching criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredAdjustments.map((adj) => (
                            <tr key={adj.id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="p-4 font-bold text-[#0b8252]">{adj.productName}</td>
                              <td className="p-4 text-center font-medium text-slate-600">{adj.currentStock} Units</td>
                              <td className="p-4 text-center font-bold text-slate-800">{adj.newStock} Units</td>
                              <td className="p-4 text-center">
                                <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                                  adj.difference > 0 ? 'bg-[#dcfce7] text-[#10b981]' : 'bg-[#fee2e2] text-[#ef4444]'
                                }`}>
                                  {adj.difference > 0 ? `+${adj.difference}` : adj.difference}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                                  adj.reason === 'Damaged' ? 'bg-[#fee2e2] text-[#ef4444]' :
                                  adj.reason === 'Expired' ? 'bg-[#fef3c7] text-[#d97706]' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {adj.reason}
                                </span>
                              </td>
                              <td className="p-4 text-slate-500 font-medium">{adj.date}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Side: Summary Panel */}
              <div className="space-y-6">
                
                {/* Summary Panel */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                    <span className="material-symbols-outlined text-[#0b8252]">analytics</span> 
                    Adjustment Summary
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Total Items Adjusted</span>
                      <span className="font-bold text-slate-800">{summaryPanel.totalItemsAdjusted} Units</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-100">
                      <span className="text-slate-500 font-semibold uppercase text-xs tracking-wider">Net Stock Change</span>
                      <span className={`font-extrabold text-base ${
                        summaryPanel.netStockChange >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
                      }`}>
                        {summaryPanel.netStockChange >= 0 ? `+${summaryPanel.netStockChange}` : summaryPanel.netStockChange} Units
                      </span>
                    </div>
                  </div>
                </div>

                {/* Helpful Instruction Note */}
                <div className="bg-[#eef8f2] rounded-xl border border-[#bbf7d0] p-5 shadow-sm">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-[#0b8252] shrink-0 mt-0.5">info</span>
                    <div>
                      <h4 className="font-bold text-[#0b8252] text-sm mb-1">Standard Operations</h4>
                      <p className="text-xs text-[#065f46] leading-relaxed">
                        To register damaged items, expirations, or inventory discrepancies, select **New Adjustment** to update product inventory instantly.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>

      {/* New Adjustment Form (Modal View) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b8252] text-[22px]">add_box</span>
                New Stock Adjustment
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-6 space-y-5 overflow-y-auto">
              
              {/* Product Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Product</label>
                <div className="relative">
                  <select 
                    value={selectedProductId}
                    onChange={e => {
                      setSelectedProductId(e.target.value);
                      setNewStockInput('');
                    }}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#0b8252] cursor-pointer"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Current: {p.currentStock})</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>

              {/* Stock Details row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Current Stock */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Current Stock</label>
                  <input
                    type="text"
                    value={`${selectedProduct.currentStock} Units`}
                    readOnly
                    className="w-full bg-[#f1f5f9] border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg px-4 py-2.5 focus:outline-none"
                  />
                </div>

                {/* New Stock Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">New Stock</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter quantity"
                    required
                    value={newStockInput}
                    onChange={e => {
                      const val = e.target.value === '' ? '' : parseInt(e.target.value);
                      setNewStockInput(val);
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-sm font-bold rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] transition-colors"
                  />
                </div>
              </div>

              {/* Difference Preview (Only show when stock input entered) */}
              {newStockInput !== '' && (
                <div className="bg-[#f8f9fa] border border-slate-100 rounded-lg p-3 flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-500">Calculated Difference:</span>
                  <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${
                    calculatedDifference > 0 ? 'bg-[#dcfce7] text-[#10b981]' : 
                    calculatedDifference < 0 ? 'bg-[#fee2e2] text-[#ef4444]' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {calculatedDifference > 0 ? `+${calculatedDifference}` : calculatedDifference} Units
                  </span>
                </div>
              )}

              {/* Conditionally Triggered Warning Alert */}
              {isBelowMinStock && (
                <div className="bg-[#ffedd5] rounded-xl border border-[#fed7aa] p-4 flex gap-3 shadow-sm animate-in shake">
                  <span className="material-symbols-outlined text-[#d97706] mt-0.5 text-[20px]">warning</span>
                  <div>
                    <h4 className="font-bold text-[#92400e] text-xs mb-0.5">Warning Alert</h4>
                    <p className="text-xs text-[#b45309] leading-relaxed font-medium">
                      Warning: Stock will fall below minimum level ({selectedProduct.minStock} Units) after adjustment.
                    </p>
                  </div>
                </div>
              )}

              {/* Reason Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Reason</label>
                <div className="relative">
                  <select 
                    value={selectedReason}
                    onChange={e => setSelectedReason(e.target.value as any)}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#0b8252] cursor-pointer"
                  >
                    <option value="Damaged">Damaged</option>
                    <option value="Expired">Expired</option>
                    <option value="Manual Correction">Manual Correction</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Optional Notes</label>
                <textarea
                  placeholder="Describe discrepancy reasons..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full h-20 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] resize-none"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-[#0b8252] text-white font-bold text-xs rounded-lg shadow-sm hover:bg-[#096b43] transition-colors"
                >
                  Save Adjustment
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
