import { useEffect, useState, useMemo } from 'react';
import { downloadReport, ViewState } from './reportUtils';
import { inventoryOperationsService, LedgerEntry, ProductItem } from '../../StockOperations/operations/inventoryOperationsService';

export default function ActivityReports({ onViewChange }: { onViewChange?: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Today');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Live ledger data
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);

  useEffect(() => {
    const load = async () => {
      const log = await inventoryOperationsService.getLedger();
      setLedger(log);
      const prods = await inventoryOperationsService.getProducts();
      setProducts(prods);
    };
    load();
  }, []);

  // KPI analytics
  const ledgerAnalytics = useMemo(() => {
    let totalAdded = 0;
    let totalSubtracted = 0;
    let totalExpiryLoss = 0;
    ledger.forEach(entry => {
      const change = entry.quantityChange;
      if (change > 0) totalAdded += change;
      else totalSubtracted += Math.abs(change);
      if (entry.movementType === 'Expiry Removal') {
        const prod = products.find(p => p.sku === entry.sku);
        const cost = prod ? prod.costPrice : 150;
        totalExpiryLoss += Math.abs(change) * cost;
      }
    });
    return { totalAdded, totalSubtracted, totalExpiryLoss, totalCount: ledger.length };
  }, [ledger, products]);

  // Intelligence badges
  const intelligenceBadges = useMemo(() => {
    const saleCounts: Record<string, number> = {};
    const touchedSkus = new Set<string>();
    ledger.forEach(entry => {
      touchedSkus.add(entry.sku);
      if (entry.movementType === 'Sale') {
        saleCounts[entry.sku] = (saleCounts[entry.sku] || 0) + Math.abs(entry.quantityChange);
      }
    });
    const fastMovingSkus = new Set<string>();
    Object.entries(saleCounts).forEach(([sku, count]) => { if (count >= 10) fastMovingSkus.add(sku); });
    const deadStockSkus = new Set<string>();
    products.forEach(p => { if (!touchedSkus.has(p.sku)) deadStockSkus.add(p.sku); });
    return { fastMovingSkus, deadStockSkus };
  }, [ledger, products]);

  // Time range checker
  const isWithinTimeRange = (entryDateStr: string) => {
    const entryDate = new Date(entryDateStr);
    const now = new Date();
    if (timeFilter === 'all') return true;
    if (timeFilter === 'today') return entryDate.toDateString() === now.toDateString();
    if (timeFilter === 'week') return entryDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (timeFilter === 'month') return entryDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (timeFilter === 'custom') {
      if (!startDate && !endDate) return true;
      let startMatch = true;
      let endMatch = true;
      if (startDate) startMatch = entryDate >= new Date(startDate);
      if (endDate) endMatch = entryDate <= new Date(endDate + 'T23:59:59');
      return startMatch && endMatch;
    }
    return true;
  };

  const filteredLedger = useMemo(() => {
    return ledger.filter(entry => {
      const matchesSearch = entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) || entry.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'All' || entry.movementType === selectedType;
      const matchesTime = isWithinTimeRange(entry.timestamp);
      return matchesSearch && matchesType && matchesTime;
    });
  }, [ledger, searchTerm, selectedType, timeFilter, startDate, endDate]);



  const applyCustomRange = () => {
    setPeriod('Custom Range');
    setShowCustomModal(false);
    setTimeFilter('custom');
    setStartDate(dateRange.start);
    setEndDate(dateRange.end);
  };

  const reportName = period === 'Custom Range' && dateRange.start && dateRange.end
    ? `Activity_Report_${dateRange.start}_to_${dateRange.end}`
    : `Activity_Report_${period}`;

  const reportHeaders = ['Timestamp', 'Product', 'SKU', 'Qty Delta', 'Stock Before', 'Stock After', 'Reason', 'Authorized By'];
  const reportRows = filteredLedger.map(e => [
    new Date(e.timestamp).toLocaleString(),
    e.productName,
    e.sku,
    e.quantityChange > 0 ? `+${e.quantityChange}` : String(e.quantityChange),
    String(e.beforeStock),
    String(e.afterStock),
    e.reason,
    e.user
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
            Real-time audit trail of all inventory movements across the supermarket network.
            {period === 'Custom Range' && dateRange.start && dateRange.end && (
              <span className="ml-2 font-bold text-[#0b8252]">({dateRange.start} to {dateRange.end})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF
          </button>
          <button onClick={() => downloadReport(reportName, 'excel', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Export Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Total Receipts (Stock In)</span>
          <span className="text-2xl font-black text-emerald-600">+{ledgerAnalytics.totalAdded} units</span>
          <span className="text-[10px] text-slate-400 font-extrabold block">Added via supplier Goods Receiving</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Total Checkout (Stock Out)</span>
          <span className="text-2xl font-black text-rose-600">-{ledgerAnalytics.totalSubtracted} units</span>
          <span className="text-[10px] text-slate-400 font-extrabold block">Checked out via Sales / Returns</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Expiry Cost Losses</span>
          <span className="text-2xl font-black text-amber-600">Rs. {ledgerAnalytics.totalExpiryLoss.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 font-extrabold block">Total value lost to expired products</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Total Audited Events</span>
          <span className="text-2xl font-black text-slate-800">{ledgerAnalytics.totalCount} entries</span>
          <span className="text-[10px] text-slate-400 font-extrabold block">Logs persisted in Unified Ledger</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Search Product</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by SKU, product..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0b8252]"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[16px]">search</span>
            </div>
          </div>

          {/* Movement Type */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Movement Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0b8252]"
            >
              <option value="All">All Types</option>
              <option value="GRN">Goods Received (GRN)</option>
              <option value="Sale">Stock Out (Sales)</option>
              <option value="Adjustment">Manual Adjustments</option>
              <option value="Expiry Removal">Expiry Removal</option>
              <option value="Supplier Return">Supplier Returns</option>
            </select>
          </div>

          {/* Time Frame */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Time Frame</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0b8252]"
            >
              <option value="all">Complete Archive</option>
              <option value="today">Today Only</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {timeFilter === 'custom' && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold" />
              </div>
              <div className="flex-1">
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unified Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[560px]">
          <table className="w-full text-left text-xs border-collapse relative">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Product Profile</th>
                <th className="px-4 py-3">SKU ID</th>
                <th className="px-4 py-3 text-center">Qty Delta</th>
                <th className="px-4 py-3 text-center">Stock Transitions</th>
                <th className="px-4 py-3">Description Reason</th>
                <th className="px-4 py-3">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-bold">
                    No transactions reported in the selected frame.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((entry) => {
                  const isFast = intelligenceBadges.fastMovingSkus.has(entry.sku);
                  const isDead = intelligenceBadges.deadStockSkus.has(entry.sku);
                  return (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="hover:bg-slate-50 cursor-pointer select-none transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-500 font-mono font-bold">
                        {new Date(entry.timestamp).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-800 text-xs">{entry.productName}</span>
                          {isFast && (
                            <span title="Fast Moving High-Velocity SKU" className="text-amber-500 font-bold flex items-center bg-amber-50 rounded px-1 text-[9px] border border-amber-100 shrink-0">
                              <span className="material-symbols-outlined text-[12px] mr-0.5">local_fire_department</span> Fast
                            </span>
                          )}
                          {isDead && (
                            <span title="Zero transaction SKU" className="text-slate-500 font-bold bg-slate-100 rounded px-1 text-[9px] border border-slate-200 shrink-0">Idle Stock</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 font-bold">{entry.sku}</td>
                      <td className={`px-4 py-3 text-center font-black ${entry.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {entry.quantityChange > 0 ? `+${entry.quantityChange}` : entry.quantityChange}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-500 font-mono font-bold">
                        {entry.beforeStock} <span className="text-slate-300 mx-1">→</span> <span className="text-slate-800 font-black">{entry.afterStock}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-medium truncate max-w-xs">{entry.reason}</td>
                      <td className="px-4 py-3 text-slate-700 font-bold">{entry.user}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
          <p>Showing <strong>{filteredLedger.length > 0 ? 1 : 0} - {filteredLedger.length}</strong> of <strong>{filteredLedger.length}</strong> entries</p>
        </div>
      </div>

      {/* Slide-out Drawer */}
      {selectedEntry && (
        <>
          <div onClick={() => setSelectedEntry(null)} className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 transition-opacity" />
          <div className="fixed top-0 right-0 h-full w-96 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Auditing Log entry</span>
                <h3 className="text-sm font-black text-slate-800">Unified Transaction Log</h3>
              </div>
              <button type="button" onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-md">close</span>
              </button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto pr-1">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Product Node</span>
                <h4 className="text-xs font-black text-slate-800">{selectedEntry.productName}</h4>
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>SKU Reference:</span>
                  <span className="font-mono">{selectedEntry.sku}</span>
                </div>
              </div>
              <div className="space-y-2.5">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Inventory Stock Transition</span>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-lg">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Pre-Stock</span>
                    <span className="text-sm font-bold text-slate-600 font-mono">{selectedEntry.beforeStock}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-lg flex flex-col items-center justify-center">
                    <span className="block text-[8px] font-black text-slate-400 uppercase">Change</span>
                    <span className={`text-xs font-black font-mono ${selectedEntry.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedEntry.quantityChange > 0 ? `+${selectedEntry.quantityChange}` : selectedEntry.quantityChange}
                    </span>
                  </div>
                  <div className="bg-[#0b8252]/5 p-2.5 border border-[#0b8252]/10 rounded-lg">
                    <span className="block text-[9px] font-black text-[#0b8252] uppercase">Post-Stock</span>
                    <span className="text-sm font-black text-slate-800 font-mono">{selectedEntry.afterStock}</span>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="flex justify-between py-2.5">
                  <span className="font-bold text-slate-500">Event Action Type:</span>
                  <span className="font-black text-slate-800">{selectedEntry.movementType}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="font-bold text-slate-500">Timestamp:</span>
                  <span className="font-bold text-slate-800 font-mono">{new Date(selectedEntry.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="font-bold text-slate-500">Authorized Operator:</span>
                  <span className="font-black text-slate-800">{selectedEntry.user}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="font-bold text-slate-500">System Integrity:</span>
                  <span className={`font-black flex items-center gap-1 ${selectedEntry.status === 'Success' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    <span className="material-symbols-outlined text-[14px]">{selectedEntry.status === 'Success' ? 'verified' : 'warning'}</span>
                    {selectedEntry.status}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Transaction Context Notes</span>
                <p className="text-xs text-slate-600 font-bold bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">{selectedEntry.reason}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setSelectedEntry(null)} className="w-full py-2 bg-slate-100 text-slate-700 font-black rounded-lg text-xs hover:bg-slate-200 transition-colors text-center">
                Close Audit Inspection
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
