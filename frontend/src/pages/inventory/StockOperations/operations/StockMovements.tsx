import { useEffect, useState, useMemo } from 'react';
import { inventoryOperationsService, LedgerEntry, ProductItem } from './inventoryOperationsService';

export default function StockMovements() {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Selected ledger entry for Slide-out Drawer
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);

  useEffect(() => {
    loadLedgerData();
  }, []);

  const loadLedgerData = async () => {
    const log = await inventoryOperationsService.getLedger();
    setLedger(log);
    const prods = await inventoryOperationsService.getProducts();
    setProducts(prods);
  };

  const triggerToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // 1. LEDGER ANALYTICS SUMMARIES & EXPIRY LOSS
  const ledgerAnalytics = useMemo(() => {
    let totalAdded = 0;
    let totalSubtracted = 0;
    let totalExpiryLoss = 0;

    ledger.forEach(entry => {
      const change = entry.quantityChange;
      if (change > 0) {
        totalAdded += change;
      } else {
        totalSubtracted += Math.abs(change);
      }

      // If item was expired, lookup product price to compute loss
      if (entry.movementType === 'Expiry Removal') {
        const prod = products.find(p => p.sku === entry.sku);
        const cost = prod ? prod.costPrice : 150; // fallback if missing
        totalExpiryLoss += Math.abs(change) * cost;
      }
    });

    return {
      totalAdded,
      totalSubtracted,
      totalExpiryLoss,
      totalCount: ledger.length
    };
  }, [ledger, products]);

  // 2. FIRE / DEAD STOCK INTELLIGENCE ALGORITHMS
  const intelligenceBadges = useMemo(() => {
    const saleCounts: Record<string, number> = {};
    const touchedSkus = new Set<string>();

    ledger.forEach(entry => {
      touchedSkus.add(entry.sku);
      if (entry.movementType === 'Sale') {
        saleCounts[entry.sku] = (saleCounts[entry.sku] || 0) + Math.abs(entry.quantityChange);
      }
    });

    // Fast-moving check: Sold more than 10 units in the log
    const fastMovingSkus = new Set<string>();
    Object.entries(saleCounts).forEach(([sku, count]) => {
      if (count >= 10) {
        fastMovingSkus.add(sku);
      }
    });

    // Dead stock check: Catalog products with NO touchpoints in the ledger
    const deadStockSkus = new Set<string>();
    products.forEach(p => {
      if (!touchedSkus.has(p.sku)) {
        deadStockSkus.add(p.sku);
      }
    });

    return {
      fastMovingSkus,
      deadStockSkus
    };
  }, [ledger, products]);

  // 3. TIME FILTER CHECKER
  const isWithinTimeRange = (entryDateStr: string) => {
    const entryDate = new Date(entryDateStr);
    const now = new Date();
    
    if (timeFilter === 'all') return true;
    
    if (timeFilter === 'today') {
      return entryDate.toDateString() === now.toDateString();
    }
    
    if (timeFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return entryDate >= oneWeekAgo;
    }
    
    if (timeFilter === 'month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return entryDate >= oneMonthAgo;
    }
    
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

  // 4. REAL-TIME FILTERING ENGINE
  const filteredLedger = useMemo(() => {
    return ledger.filter(entry => {
      const matchesSearch = entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) || entry.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'All' || entry.movementType === selectedType;
      const matchesTime = isWithinTimeRange(entry.timestamp);
      return matchesSearch && matchesType && matchesTime;
    });
  }, [ledger, searchTerm, selectedType, timeFilter, startDate, endDate]);

  return (
    <div className="space-y-6 relative">
      {/* Toast popup */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
          <span className="material-symbols-outlined text-emerald-400">info</span>
          <span className="text-xs font-extrabold text-white">{toast}</span>
        </div>
      )}

      {/* DOCK SUMMARY LEDGER METRICS */}
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

      {/* LEDGER MOVED NOTICE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#0b8252]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-[#0b8252]">analytics</span>
        </div>
        <div>
          <h3 className="text-base font-black text-slate-800 mb-1">Unified Ledger Moved to Activity Reports</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            The full stock movement audit table has been moved to <strong>Reports → Activity Reports</strong> for a consolidated view alongside export and analytics capabilities.
          </p>
        </div>
        <a
          href="/reports?tab=activity"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0b8252] text-white text-xs font-bold rounded-xl hover:bg-[#096b43] transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          View in Activity Reports
        </a>
      </div>

      {/* RIGHT-SIDE TRANSACTION AUDIT DRAWER (SLIDE-OUT) */}
      {selectedEntry && (
        <>
          {/* Backdrop blur clickoff */}
          <div onClick={() => setSelectedEntry(null)} className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 transition-opacity" />

          {/* Slide-out drawer element */}
          <div className="fixed top-0 right-0 h-full w-96 bg-white border-l border-slate-200 shadow-2xl z-50 transform translate-x-0 transition-transform duration-300 flex flex-col p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Auditing Log entry</span>
                <h3 className="text-sm font-black text-slate-800">Unified Transaction Log</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-md">close</span>
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto pr-1">
              {/* Product Profile info card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Product Node</span>
                <h4 className="text-xs font-black text-slate-800">{selectedEntry.productName}</h4>
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>SKU Reference:</span>
                  <span className="font-mono">{selectedEntry.sku}</span>
                </div>
              </div>

              {/* Transition flow */}
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

              {/* Event details list */}
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
                    <span className="material-symbols-outlined text-[14px]">
                      {selectedEntry.status === 'Success' ? 'verified' : 'warning'}
                    </span>
                    {selectedEntry.status}
                  </span>
                </div>
              </div>

              {/* Action Description */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Transaction Context Notes</span>
                <p className="text-xs text-slate-600 font-bold bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {selectedEntry.reason}
                </p>
              </div>
            </div>

            {/* Close controls */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="w-full py-2 bg-slate-100 text-slate-700 font-black rounded-lg text-xs hover:bg-slate-200 transition-colors text-center"
              >
                Close Audit Inspection
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
