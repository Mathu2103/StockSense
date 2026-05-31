import { useState } from 'react';
import { downloadReport, ViewState } from './reportUtils';

export default function InventoryReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const dataMap: Record<string, any> = {
    Today: { val: 'Rs. 14,250,000', prod: '1,842', low: '156', exp: '24', t1: '+3.2%', t2: '-12', t3: '+5', chart: [30, 45, 40, 55, 50, 65, 70] },
    Week: { val: 'Rs. 13,920,000', prod: '1,830', low: '180', exp: '12', t1: '-1.5%', t2: '+24', t3: '-12', chart: [40, 35, 55, 45, 60, 50, 40] },
    Month: { val: 'Rs. 14,500,000', prod: '1,900', low: '140', exp: '30', t1: '+5.0%', t2: '-16', t3: '+6', chart: [40, 65, 45, 80, 55, 90, 70] },
    Year: { val: 'Rs. 16,000,000', prod: '2,100', low: '100', exp: '45', t1: '+12.0%', t2: '-56', t3: '+21', chart: [50, 60, 55, 70, 75, 85, 90] },
    'Custom Range': { val: 'Rs. 14,000,000', prod: '1,850', low: '160', exp: '20', t1: '+1.0%', t2: '+4', t3: '-4', chart: [45, 55, 50, 65, 60, 75, 80] }
  };

  const activeData = dataMap[period] || dataMap['Month'];

  const handlePeriodChange = (tab: any) => {
    if (tab === 'Custom Range') {
      setShowCustomModal(true);
    } else {
      setPeriod(tab);
    }
  };

  const applyCustomRange = () => {
    setPeriod('Custom Range');
    setShowCustomModal(false);
  };

  const reportName = period === 'Custom Range' && dateRange.start && dateRange.end
    ? `Inventory_Report_${dateRange.start}_to_${dateRange.end}`
    : `Inventory_Report_${period}`;

  const allItems = [
    { name: "Whole Milk 2L", cat: "Dairy", qty: 245, sold: 180, status: "In Stock", sColor: "bg-[#10b981]/10 text-[#10b981]", dot: "bg-[#10b981]" },
    { name: "Jasmine Rice 5kg", cat: "Pantry", qty: 12, sold: 45, status: "Low Stock", sColor: "bg-[#f59e0b]/10 text-[#d97706]", dot: "bg-[#f59e0b]" },
    { name: "Olive Oil 1L", cat: "Pantry", qty: 89, sold: 22, status: "In Stock", sColor: "bg-[#10b981]/10 text-[#10b981]", dot: "bg-[#10b981]" },
    { name: "Fresh Strawberries", cat: "Produce", qty: 0, sold: 120, status: "Expired", sColor: "bg-[#ef4444]/10 text-[#ef4444]", dot: "bg-[#ef4444]" },
    { name: "Cheddar Cheese", cat: "Dairy", qty: 450, sold: 30, status: "Overstock", sColor: "bg-[#3b82f6]/10 text-[#3b82f6]", dot: "bg-[#3b82f6]" },
    { name: "Whole Wheat Bread", cat: "Bakery", qty: 5, sold: 88, status: "Low Stock", sColor: "bg-[#f59e0b]/10 text-[#d97706]", dot: "bg-[#f59e0b]" }
  ];

  const filteredItems = allItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'All Categories' || item.cat === categoryFilter || (categoryFilter === 'Dairy & Eggs' && item.cat === 'Dairy') || (categoryFilter === 'Fresh Produce' && item.cat === 'Produce');
    const matchStatus = statusFilter === 'All Statuses' || item.status.includes(statusFilter) || (statusFilter === 'Expired' && item.status === 'Expired');
    return matchSearch && matchCat && matchStatus;
  });

  const reportHeaders = ['Product', 'Category', 'Qty', 'Sold', 'Status'];
  const reportRows = filteredItems.map(p => [p.name, p.cat, p.qty, p.sold, p.status]);
  const reportData = { headers: reportHeaders, rows: reportRows };

  // Dynamic calculations for Stock Status pie chart
  const totalProductsCount = parseInt(activeData.prod.replace(/,/g, '')) || 1900;
  const lowStockCount = parseInt(activeData.low.replace(/,/g, '')) || 0;
  const expiredCount = parseInt(activeData.exp.replace(/,/g, '')) || 0;
  const inStockCount = Math.max(0, totalProductsCount - lowStockCount - expiredCount);
  
  const inStockPct = (inStockCount / totalProductsCount) * 100;
  const lowPct = (lowStockCount / totalProductsCount) * 100;

  return (
    <div className="animate-in fade-in duration-300 space-y-6 pb-12">
      {/* Custom Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b8252]">date_range</span>
                Custom Date Range
              </h3>
              <button onClick={() => setShowCustomModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Start Date</label>
                <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">End Date</label>
                <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowCustomModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
              <button onClick={applyCustomRange} className="px-5 py-2.5 text-sm font-bold text-white bg-[#0b8252] hover:bg-[#096b43] rounded-lg shadow-sm transition-colors">Apply Range</button>
            </div>
          </div>
        </div>
      )}

      {/* 1. PAGE HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => onViewChange('overview')} className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b8252] transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Overview
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Inventory Reports</h2>
          <p className="text-slate-500 text-sm mt-1">
            Monitor stock levels, expiry risks, and inventory status.
            {period === 'Custom Range' && dateRange.start && dateRange.end && (
              <span className="ml-2 font-bold text-[#0b8252]">({dateRange.start} to {dateRange.end})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-2 bg-gradient-to-r from-[#0b8252] to-[#096b43] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <span className="material-symbols-outlined text-[18px]">post_add</span>
            Generate Report
          </button>
          <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition-all">
            <span className="material-symbols-outlined text-[18px] text-red-500">picture_as_pdf</span>
            Export PDF
          </button>
          <button onClick={() => downloadReport(reportName, 'excel', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition-all">
            <span className="material-symbols-outlined text-[18px] text-green-600">table_chart</span>
            Export Excel
          </button>
        </div>
      </div>

      {/* 3. REPORT PERIOD FILTER */}
      <div className="flex bg-[#f1f5f9] p-1 rounded-xl border border-slate-200 w-fit shadow-sm">
        {['Today', 'Week', 'Month', 'Year', 'Custom Range'].map(tab => {
          let tabLabel = tab;
          if (tab === 'Custom Range' && period === 'Custom Range' && dateRange.start && dateRange.end) {
            tabLabel = `${dateRange.start} to ${dateRange.end}`;
          }
          return (
          <button 
            key={tab}
            onClick={() => handlePeriodChange(tab)}
            className={`px-6 py-2 text-sm font-bold rounded-lg flex items-center gap-1 transition-all ${period === tab ? 'bg-white text-[#0b8252] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {tab === 'Custom Range' && <span className="material-symbols-outlined text-[16px]">calendar_today</span>}
            {tabLabel}
          </button>
          );
        })}
      </div>

      {/* 2. KPI SECTION (Glassmorphism) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Inventory Value */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 hover:-translate-y-1 transition-transform group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0b8252]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#eef8f2] to-[#dcfce7] text-[#0b8252] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-xs font-bold text-[#10b981] flex items-center gap-0.5 bg-[#dcfce7] px-2 py-1 rounded-full"><span className="material-symbols-outlined text-[12px]">trending_up</span> {activeData.t1}</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeData.val}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Inventory Value</p>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 hover:-translate-y-1 transition-transform group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-[#3b82f6] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined">category</span>
            </div>
            <span className="text-xs font-bold text-[#3b82f6] flex items-center gap-0.5 bg-blue-50 px-2 py-1 rounded-full">Optimized</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeData.prod}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Products</p>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 hover:-translate-y-1 transition-transform group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f59e0b]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fef3c7] to-[#fde68a] text-[#d97706] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <span className="text-xs font-bold text-[#d97706] flex items-center gap-0.5 bg-[#fef3c7] px-2 py-1 rounded-full"><span className="material-symbols-outlined text-[12px]">{activeData.t2.startsWith('-') ? 'trending_down' : 'trending_up'}</span> {activeData.t2}</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeData.low}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Low Stock Items</p>
          </div>
        </div>

        {/* Expired Items */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 hover:-translate-y-1 transition-transform group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef4444]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fee2e2] to-[#fecaca] text-[#ef4444] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined">event_busy</span>
            </div>
            <span className="text-xs font-bold text-[#ef4444] flex items-center gap-0.5 bg-[#fee2e2] px-2 py-1 rounded-full"><span className="material-symbols-outlined text-[12px]">{activeData.t3.startsWith('-') ? 'trending_down' : 'trending_up'}</span> {activeData.t3}</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeData.exp}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Expired Items</p>
          </div>
        </div>
      </div>
      
      {/* 4. SIMPLE FILTER BAR */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row gap-3 relative z-20">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product..."
            className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative min-w-[160px]">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#0b8252] transition-all cursor-pointer"
            >
              <option>All Categories</option>
              <option>Dairy & Eggs</option>
              <option>Fresh Produce</option>
              <option>Pantry</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <div className="relative min-w-[160px]">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#0b8252] transition-all cursor-pointer"
            >
              <option>All Statuses</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Expired</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <button className="bg-[#0b8252] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors whitespace-nowrap">
            Apply Filters
          </button>
          <button 
            onClick={() => { setSearchQuery(''); setCategoryFilter('All Categories'); setStatusFilter('All Statuses'); }}
            className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5. LIGHT ANALYTICS SECTION */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inventory Trend Chart Placeholder */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 hover:-translate-y-1 transition-transform">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-[#0b8252]">bar_chart</span> Inventory by Category</h3>
            <div className="h-[180px] flex items-end justify-between gap-2 border-b border-slate-100 pb-2 relative">
              <div className="absolute top-1/4 w-full border-t border-dashed border-slate-200"></div>
              <div className="absolute top-2/4 w-full border-t border-dashed border-slate-200"></div>
              <div className="absolute top-3/4 w-full border-t border-dashed border-slate-200"></div>
              {[...(activeData.chart || [40, 65, 45, 80, 55, 90, 70])].map((h, i) => {
                const categories = ['Dairy', 'Pantry', 'Produce', 'Bakery', 'Snacks', 'Meat', 'Frozen'];
                return (
                  <div key={i} className="w-full relative group h-full flex items-end justify-center">
                    <div className="w-3/4 bg-gradient-to-t from-[#0b8252]/20 to-[#0b8252] rounded-t-sm relative z-10 transition-all duration-300 group-hover:opacity-80" style={{ height: `${h}%` }}></div>
                    <span className="absolute -top-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">{categories[i]}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-2 px-1 text-[10px] font-bold text-slate-400">
              <span>Dairy</span><span>Pantry</span><span>Produce</span><span>Bakery</span><span>Snacks</span><span>Meat</span><span>Frozen</span>
            </div>
          </div>

          {/* Stock Status Pie Placeholder */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 hover:-translate-y-1 transition-transform">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-[#0b8252]">pie_chart</span> Stock Status</h3>
            <div className="flex flex-col items-center justify-center h-[180px]">
              <div className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-inner transition-all duration-500" style={{ background: `conic-gradient(#10b981 0% ${inStockPct}%, #f59e0b ${inStockPct}% ${inStockPct + lowPct}%, #ef4444 ${inStockPct + lowPct}% 100%)` }}>
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center flex-col shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                  <span className="text-2xl font-bold text-slate-800">{activeData.prod}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total</span>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#10b981]"></span><span className="text-xs font-medium text-slate-600">In Stock</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span><span className="text-xs font-medium text-slate-600">Low</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#ef4444]"></span><span className="text-xs font-medium text-slate-600">Expired</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* 6. QUICK INSIGHTS PANEL */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg p-6 flex-1 text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#0b8252] rounded-full blur-3xl opacity-30 pointer-events-none"></div>
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2 relative z-10"><span className="material-symbols-outlined text-[#10b981]">lightbulb</span> Quick Insights</h3>
            <ul className="space-y-4 relative z-10">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#fef3c7]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span></div>
                <p className="text-sm text-slate-300 leading-snug">Low stock detected in <strong className="text-white">Dairy</strong> category</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#fee2e2]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span></div>
                <p className="text-sm text-slate-300 leading-snug"><strong className="text-white">{activeData.exp} products</strong> need immediate restocking</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#dcfce7]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span></div>
                <p className="text-sm text-slate-300 leading-snug"><strong className="text-white">Beverages</strong> are the fastest moving category</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span></div>
                <p className="text-sm text-slate-300 leading-snug">Inventory is <strong className="text-white">stable</strong> compared to {period === 'Today' ? 'yesterday' : 'last period'}</p>
              </li>
            </ul>
          </div>

          {/* 7. QUICK ACCESS PANEL */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Quick Access</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onViewChange('activity')} className="flex flex-col items-center justify-center gap-2 bg-[#f8f9fa] border border-slate-200 p-3 rounded-xl hover:bg-[#eef8f2] hover:border-[#bbf7d0] hover:text-[#0b8252] hover:shadow-md text-slate-600 transition-all duration-300 group">
                <span className="material-symbols-outlined text-[24px] group-hover:scale-110 group-hover:-translate-y-1 transition-transform">add_box</span>
                <span className="text-xs font-bold">Add Stock</span>
              </button>
              <button onClick={() => onViewChange('purchase')} className="flex flex-col items-center justify-center gap-2 bg-[#f8f9fa] border border-slate-200 p-3 rounded-xl hover:bg-[#eef8f2] hover:border-[#bbf7d0] hover:text-[#0b8252] hover:shadow-md text-slate-600 transition-all duration-300 group">
                <span className="material-symbols-outlined text-[24px] group-hover:scale-110 group-hover:-translate-y-1 transition-transform">receipt_long</span>
                <span className="text-xs font-bold">Create PO</span>
              </button>
              <button onClick={() => onViewChange('alert')} className="flex flex-col items-center justify-center gap-2 bg-[#f8f9fa] border border-slate-200 p-3 rounded-xl hover:bg-[#fef3c7] hover:border-[#fde68a] hover:text-[#d97706] hover:shadow-md text-slate-600 transition-all duration-300 group">
                <span className="material-symbols-outlined text-[24px] group-hover:scale-110 group-hover:-translate-y-1 transition-transform">warning</span>
                <span className="text-xs font-bold text-center">View Low</span>
              </button>
              <button onClick={() => onViewChange('alert')} className="flex flex-col items-center justify-center gap-2 bg-[#f8f9fa] border border-slate-200 p-3 rounded-xl hover:bg-[#fee2e2] hover:border-[#fecaca] hover:text-[#ef4444] hover:shadow-md text-slate-600 transition-all duration-300 group">
                <span className="material-symbols-outlined text-[24px] group-hover:scale-110 group-hover:-translate-y-1 transition-transform">event_busy</span>
                <span className="text-xs font-bold text-center">Mark Expired</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 8. INVENTORY REPORT TABLE */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-800">Inventory Status</h3>
            <button className="text-sm font-bold text-[#0b8252] hover:text-[#096b43] transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-slate-50/90 backdrop-blur z-10 shadow-sm">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sold</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredItems.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 font-bold text-slate-800">{item.name}</td>
                    <td className="p-4 text-slate-600 font-medium">{item.cat}</td>
                    <td className="p-4 font-bold text-slate-800">{item.qty}</td>
                    <td className="p-4 text-slate-600">{item.sold}</td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${item.sColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`}></span>
                        {item.status}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-[#0b8252] transition-colors p-1 rounded hover:bg-[#eef8f2]">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No products match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500">Showing {filteredItems.length > 0 ? 1 : 0}-{filteredItems.length} of {filteredItems.length} items</span>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white transition-colors"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
              <button className="w-8 h-8 rounded bg-[#0b8252] text-white font-bold text-xs flex items-center justify-center shadow-sm">1</button>
              <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white transition-colors"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
            </div>
          </div>
        </div>

        {/* 10. RECENT REPORTS PANEL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Recent Reports</h3>
          <div className="space-y-4">
            {[
              { name: "Daily Stock Report", date: "Today, 08:30 AM", type: "PDF", icon: "picture_as_pdf", color: "text-red-500", bg: "bg-red-50" },
              { name: "Weekly Summary", date: "Yesterday, 17:00 PM", type: "XLSX", icon: "table_chart", color: "text-green-600", bg: "bg-green-50" },
              { name: "Expiry Report", date: "Oct 22, 09:15 AM", type: "PDF", icon: "picture_as_pdf", color: "text-red-500", bg: "bg-red-50" }
            ].map((report, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group cursor-pointer bg-slate-50/50 hover:bg-white">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.bg} ${report.color}`}>
                    <span className="material-symbols-outlined text-[20px]">{report.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#0b8252] transition-colors">{report.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{report.date}</p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-[#eef8f2] group-hover:text-[#0b8252] transition-colors">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-500 hover:border-[#0b8252] hover:text-[#0b8252] transition-colors">
            View Archive
          </button>
        </div>
      </div>
    </div>
  );
}
