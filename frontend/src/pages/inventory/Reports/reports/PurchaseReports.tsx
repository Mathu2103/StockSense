import { useState, useEffect } from 'react';
import { downloadReport, ViewState } from './reportUtils';
import { inventoryOperationsService } from '../../StockOperations/operations/inventoryOperationsService';

export default function PurchaseReports({ onViewChange: _onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Live Purchases States
  const [grns, setGrns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, period]);

  useEffect(() => {
    let active = true;
    async function loadPurchases() {
      try {
        const loadedGrns = await inventoryOperationsService.getGRNHistory();
        if (!active) return;
        setGrns(loadedGrns);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load purchases history data', err);
        if (!active) return;
        setLoading(false);
      }
    }
    loadPurchases();
    return () => { active = false; };
  }, []);

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
    ? `Purchase_Report_${dateRange.start}_to_${dateRange.end}`
    : `Purchase_Report_${period}`;

  // Period Date Range calculation
  const getPeriodDateRange = () => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (period === 'Today') {
      start.setHours(0, 0, 0, 0);
    } else if (period === 'Week') {
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'Month') {
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'Year') {
      start.setDate(now.getDate() - 365);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'Custom Range') {
      if (dateRange.start) start = new Date(dateRange.start);
      if (dateRange.end) {
        end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);
      }
    }
    return { start, end };
  };

  const { start, end } = getPeriodDateRange();
  const periodGrns = grns.filter(g => {
    const gDate = new Date(g.receivedDate);
    return gDate >= start && gDate <= end;
  });

  // Flatten GRN records into individual items for display
  const purchaseRowsList: any[] = [];
  periodGrns.forEach(grn => {
    grn.items.forEach((item: any) => {
      purchaseRowsList.push({
        ref: grn.grnNumber,
        date: new Date(grn.receivedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        sup: grn.supplierName,
        prod: item.productName,
        qty: `${item.receivedQty} units`,
        price: `Rs. ${item.unitCost.toFixed(2)}`,
        total: `Rs. ${(item.receivedQty * item.unitCost).toFixed(2)}`,
        status: grn.status === 'Completed' ? 'RECEIVED' : grn.status === 'Shortage' ? 'PARTIAL' : 'RECEIVED',
        sClass: grn.status === 'Completed' ? 'bg-[#eef8f2] text-[#0b8252]' : 'bg-[#fee2e2] text-[#ef4444]'
      });
    });
  });

  const filteredPurchases = purchaseRowsList.filter(
    p => statusFilter === 'All Statuses' || p.status === statusFilter
  );

  // KPIs
  const totalPurchases = periodGrns.length;
  const totalSpending = periodGrns.reduce((sum, g) => sum + g.totalCost, 0);
  const totalItemsPurchased = periodGrns.reduce((sum, g) => sum + g.totalQuantity, 0);
  const activeSuppliers = new Set(periodGrns.map(g => g.supplierName)).size;
  const avgOrderValue = totalPurchases > 0 ? totalSpending / totalPurchases : 0;

  // Pagination Logic
  const itemsPerPage = 8;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredPurchases.length);
  const paginatedItems = filteredPurchases.slice(startIndex, endIndex);
  const totalPages = Math.max(1, Math.ceil(filteredPurchases.length / itemsPerPage));

  const reportHeaders = ['Ref #', 'Date', 'Supplier', 'Product', 'Qty', 'Unit Price', 'Total'];
  const reportRows = filteredPurchases.map(p => [p.ref, p.date, p.sup, p.prod, p.qty, p.price, p.total]);
  const reportData = { headers: reportHeaders, rows: reportRows };

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

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Purchase Records</h2>
          <p className="text-slate-500 text-sm mt-1">
            Track and monitor supplier purchases and stock inflow.
            {period === 'Custom Range' && dateRange.start && dateRange.end && (
              <span className="ml-2 font-bold text-[#0b8252]">({dateRange.start} to {dateRange.end})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => downloadReport(reportName, 'pdf', reportData, 'Purchase')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
            <span className="material-symbols-outlined text-[18px] text-slate-500">picture_as_pdf</span>
            Export PDF
          </button>
          <button onClick={() => downloadReport(reportName, 'excel', reportData, 'Purchase')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
            <span className="material-symbols-outlined text-[18px] text-slate-500">table_chart</span>
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

      {/* KPI SECTION (Glassmorphism) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {/* Total Orders */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            </div>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Orders</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{loading ? '...' : totalPurchases}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Total Purchases</p>
          </div>
        </div>

        {/* Total Spending */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">Spent</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {loading ? '...' : `Rs. ${totalSpending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Total Spending</p>
          </div>
        </div>

        {/* Total Items Purchased */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">category</span>
            </div>
            <span className="text-[10px] font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">Units</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{loading ? '...' : totalItemsPurchased}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Items Purchased</p>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">trending_up</span>
            </div>
            <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">Avg</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {loading ? '...' : `Rs. ${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Avg Order Value</p>
          </div>
        </div>

        {/* Active Suppliers */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
            </div>
            <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Vendors</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{loading ? '...' : activeSuppliers}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Active Suppliers</p>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Status</label>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option value="All Statuses">All Statuses</option>
              <option value="RECEIVED">RECEIVED</option>
              <option value="PARTIAL">PARTIAL</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
        </div>
        <button onClick={() => setStatusFilter('All Statuses')} className="px-5 py-2 text-[#0b8252] font-bold text-sm hover:underline">Reset</button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ref #</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Cost</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Loading live purchases...</td>
                </tr>
              ) : paginatedItems.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-[#0b8252]">{item.ref}</td>
                  <td className="p-4 text-slate-600 text-xs w-20">{item.date}</td>
                  <td className="p-4 text-slate-700 font-medium">{item.sup}</td>
                  <td className="p-4 text-slate-800 font-medium">{item.prod}</td>
                  <td className="p-4 text-slate-600 text-xs w-16 font-bold">{item.qty}</td>
                  <td className="p-4 text-slate-600 font-semibold">{item.price}</td>
                  <td className="p-4 font-bold text-slate-800">{item.total}</td>
                </tr>
              ))}
              {!loading && paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No records match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-500">
            Showing {filteredPurchases.length > 0 ? startIndex + 1 : 0}-{endIndex} of {filteredPurchases.length} items
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <span className="text-xs font-bold text-slate-600">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
