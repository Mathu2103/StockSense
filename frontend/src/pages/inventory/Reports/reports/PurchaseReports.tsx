.import { useState, useEffect } from 'react';
import { downloadReport, ViewState } from './reportUtils';
import { inventoryOperationsService } from '../../StockOperations/operations/inventoryOperationsService';

export default function PurchaseReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Live Purchases States
  const [grns, setGrns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    } else if (period === 'Month') {
      start.setDate(now.getDate() - 30);
    } else if (period === 'Year') {
      start.setDate(now.getDate() - 365);
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
  const totalItemsPurchased = periodGrns.reduce((sum, g) => sum + g.totalQuantity, 0);
  const activeSuppliers = new Set(periodGrns.map(g => g.supplierName)).size;
  const pendingDeliveries = periodGrns.filter(g => g.status === 'Shortage').length;

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
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex bg-white p-1 rounded-lg border border-slate-200">
            <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded text-sm font-bold border-l border-slate-200"><span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Export PDF</button>
            <button onClick={() => downloadReport(reportName, 'excel', reportData)} className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded text-sm font-bold border-l border-slate-200"><span className="material-symbols-outlined text-[18px]">table_chart</span> Export Excel</button>
          </div>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Total Purchases</p>
          <h3 className="text-2xl font-bold text-slate-800">{loading ? '...' : totalPurchases}</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Orders processed</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Total Items Purchased</p>
          <h3 className="text-2xl font-bold text-slate-800">{loading ? '...' : totalItemsPurchased}</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Units received</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Total Suppliers Active</p>
          <h3 className="text-2xl font-bold text-slate-800">{loading ? '...' : activeSuppliers}</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Unique vendors</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Shortages / Issues</p>
          <h3 className="text-2xl font-bold text-[#d97706]">{loading ? '...' : pendingDeliveries}</h3>
          <p className="text-[10px] font-bold text-[#d97706] mt-1">Partial deliveries</p>
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
              ) : filteredPurchases.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-[#0b8252]">{item.ref}</td>
                  <td className="p-4 text-slate-600 text-xs w-20">{item.date}</td>
                  <td className="p-4 text-slate-700 font-medium">{item.sup}</td>
                  <td className="p-4 text-slate-800">{item.prod}</td>
                  <td className="p-4 text-slate-600 text-xs w-16">{item.qty}</td>
                  <td className="p-4 text-slate-600">{item.price}</td>
                  <td className="p-4 font-bold text-slate-800">{item.total}</td>
                </tr>
              ))}
              {!loading && filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No records match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
