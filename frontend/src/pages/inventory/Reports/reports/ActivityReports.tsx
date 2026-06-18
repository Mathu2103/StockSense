import { useState, useEffect } from 'react';
import { downloadReport, ViewState } from './reportUtils';
import { inventoryOperationsService, AdjustmentRecord } from '../../StockOperations/operations/inventoryOperationsService';

export default function ActivityReports({ onViewChange }: { onViewChange?: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [reasonFilter, setReasonFilter] = useState('All Reasons');

  // Live State
  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [reasonFilter, period]);

  useEffect(() => {
    let active = true;
    async function loadAdjustments() {
      try {
        const adjs = await inventoryOperationsService.getAdjustments();
        if (!active) return;
        setAdjustments(adjs);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load adjustments history', err);
        if (!active) return;
        setLoading(false);
      }
    }
    loadAdjustments();
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
    ? `Adjustment_Report_${dateRange.start}_to_${dateRange.end}`
    : `Adjustment_Report_${period}`;

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
  const periodAdjustments = adjustments.filter(a => {
    const aDate = new Date(a.date);
    return aDate >= start && aDate <= end;
  });

  const filteredAdjustments = periodAdjustments.filter(
    a => reasonFilter === 'All Reasons' || a.reason.toLowerCase() === reasonFilter.toLowerCase()
  );

  // KPIs
  const totalAdjustments = periodAdjustments.length;
  const totalAdded = periodAdjustments.filter(a => a.qtyChanged > 0).reduce((sum, a) => sum + a.qtyChanged, 0);
  const totalSubtracted = periodAdjustments.filter(a => a.qtyChanged < 0).reduce((sum, a) => sum + Math.abs(a.qtyChanged), 0);
  const totalLossValue = periodAdjustments.filter(a => a.qtyChanged < 0).reduce((sum, a) => sum + Math.abs(a.totalValue), 0);

  // Pagination Logic
  const itemsPerPage = 8;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredAdjustments.length);
  const paginatedItems = filteredAdjustments.slice(startIndex, endIndex);
  const totalPages = Math.max(1, Math.ceil(filteredAdjustments.length / itemsPerPage));

  const reportHeaders = ['Ref #', 'Timestamp', 'Product', 'SKU', 'Qty Delta', 'Transition', 'Reason', 'Authorized By'];
  const reportRows = filteredAdjustments.map(a => [
    a.adjustmentNumber,
    new Date(a.date).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    a.productName,
    a.sku,
    a.qtyChanged > 0 ? `+${a.qtyChanged}` : `${a.qtyChanged}`,
    `${a.beforeStock} -> ${a.afterStock}`,
    a.reason,
    a.adjustedBy
  ]);
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
          <h2 className="text-2xl font-bold text-slate-800">Adjustment Reports</h2>
          <p className="text-slate-500 text-sm mt-1">
            Real-time audit trail of all manual inventory adjustments.
            {period === 'Custom Range' && dateRange.start && dateRange.end && (
              <span className="ml-2 font-bold text-[#0b8252]">({dateRange.start} to {dateRange.end})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => downloadReport(reportName, 'pdf', reportData, 'Activity')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
            <span className="material-symbols-outlined text-[18px] text-slate-500">picture_as_pdf</span>
            Export PDF
          </button>
          <button onClick={() => downloadReport(reportName, 'excel', reportData, 'Activity')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Adjustments */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <span className="text-[10px] font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">Entries</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{loading ? '...' : totalAdjustments}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Total Adjustments</p>
          </div>
        </div>

        {/* Units Added */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </div>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Gained</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-emerald-600 tracking-tight">{loading ? '...' : `+${totalAdded}`}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Units Added (Corrections)</p>
          </div>
        </div>

        {/* Units Subtracted */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">remove_circle</span>
            </div>
            <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">Lost</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-rose-600 tracking-tight">
              {loading ? '...' : `-${totalSubtracted}`}
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Units Subtracted (Shrinkage)</p>
          </div>
        </div>

        {/* Value Loss */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">trending_down</span>
            </div>
            <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Cost</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-amber-600 tracking-tight">
              {loading ? '...' : `Rs. ${totalLossValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Estimated Value Loss</p>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Adjustment Reason</label>
          <div className="relative">
            <select value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value)} className="w-full appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option value="All Reasons">All Reasons</option>
              <option value="Damaged">Damaged</option>
              <option value="Expired">Expired</option>
              <option value="Lost">Lost</option>
              <option value="Returned">Returned</option>
              <option value="Counting error">Counting error</option>
              <option value="System correction">System correction</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
        </div>
        <button onClick={() => setReasonFilter('All Reasons')} className="px-5 py-2 text-[#0b8252] font-bold text-sm hover:underline">Reset</button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ref #</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Qty Delta</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Transition</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">Loading live adjustments...</td>
                </tr>
              ) : paginatedItems.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-500 text-xs">{item.adjustmentNumber}</td>
                  <td className="p-4 text-slate-600 text-xs font-mono font-medium">
                    {new Date(item.date).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4 text-slate-800 font-bold">{item.productName}</td>
                  <td className="p-4 text-slate-500 font-mono text-xs">{item.sku}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-bold min-w-[40px] ${item.qtyChanged > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                      {item.qtyChanged > 0 ? `+${item.qtyChanged}` : item.qtyChanged}
                    </span>
                  </td>
                  <td className="p-4 text-center text-slate-500 font-mono text-xs font-bold">
                    {item.beforeStock} <span className="text-slate-300 mx-1">→</span> <span className="text-slate-800">{item.afterStock}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                      {item.reason}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{item.adjustedBy}</td>
                </tr>
              ))}
              {!loading && paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">No adjustment records match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-500">
            Showing {filteredAdjustments.length > 0 ? startIndex + 1 : 0}-{endIndex} of {filteredAdjustments.length} items
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
