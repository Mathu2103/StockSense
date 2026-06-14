import { useState, useEffect } from 'react';
import { downloadReport, ViewState } from './reportUtils';
import { inventoryOperationsService } from '../../StockOperations/operations/inventoryOperationsService';

export default function AlertReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [severityFilter, setSeverityFilter] = useState('All Severities');

  // Dynamic alert data
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadAlerts() {
      try {
        const [products, velocity] = await Promise.all([
          inventoryOperationsService.getProducts(),
          inventoryOperationsService.getSalesVelocity(30),
        ]);
        if (!active) return;

        // Configuration percentages
        let reorderPercent = 25;
        let minStockPercent = 10;
        let maxStockPercent = 100;
        let enableLowStockAlerts = true;
        let enableOutOfStockAlerts = true;
        let enableExpiryAlerts = true;
        let enableOverstockAlerts = true;

        try {
          const configStr = localStorage.getItem('stocksense_settings_config');
          if (configStr) {
            const config = JSON.parse(configStr);
            if (config.defaultReorderLevel) reorderPercent = parseInt(config.defaultReorderLevel, 10) || 25;
            if (config.minimumStockThreshold) minStockPercent = parseInt(config.minimumStockThreshold, 10) || 10;
            if (config.maximumStockLimit) maxStockPercent = parseInt(config.maximumStockLimit, 10) || 100;
            if (typeof config.enableLowStockAlerts === 'boolean') enableLowStockAlerts = config.enableLowStockAlerts;
            if (typeof config.enableOutOfStockAlerts === 'boolean') enableOutOfStockAlerts = config.enableOutOfStockAlerts;
            if (typeof config.enableExpiryAlerts === 'boolean') enableExpiryAlerts = config.enableExpiryAlerts;
            if (typeof config.enableOverstockAlerts === 'boolean') enableOverstockAlerts = config.enableOverstockAlerts;
          }
        } catch { }

        const dynamicAlerts: any[] = [];

        products.forEach(p => {
          const capacity = p.targetCapacity || 100;
          const reorderLimit = Math.round((reorderPercent / 100) * capacity);
          const criticalLimit = Math.round((minStockPercent / 100) * capacity);
          const overstockLimit = Math.round((maxStockPercent / 100) * capacity);
          const stockPct = Math.round((p.stock / capacity) * 100);

          // Expiry days calculation helper
          const getDaysUntilExpiry = (expiryDate: string): number => {
            if (!expiryDate) return Infinity;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const expiry = new Date(expiryDate);
            expiry.setHours(0, 0, 0, 0);
            return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          };

          // Overstock
          if (enableOverstockAlerts && p.stock > overstockLimit && p.status === 'Active') {
            dynamicAlerts.push({
              id: `ALT-OVER-${p.sku}`,
              date: "Real-time alert",
              item: p.name,
              sku: p.sku,
              severity: "WARNING",
              type: "Overstock",
              detail: `Stock is at ${p.stock} units (${stockPct}% of ${capacity} capacity), exceeding the limit of ${overstockLimit} units.`,
              action: "Create Promotion",
              dismissed: false,
            });
          }

          // Out of stock
          if (enableOutOfStockAlerts && p.stock === 0) {
            dynamicAlerts.push({
              id: `ALT-OUT-${p.sku}`,
              date: "Real-time alert",
              item: p.name,
              sku: p.sku,
              severity: "CRITICAL",
              type: "Out of Stock",
              detail: `No stock available. Immediate reorder of at least ${reorderLimit} units recommended.`,
              action: "Restock Now",
              dismissed: false,
            });
          }
          // Critical Low Stock
          else if (enableLowStockAlerts && p.stock > 0 && p.stock <= criticalLimit) {
            dynamicAlerts.push({
              id: `ALT-CRIT-${p.sku}`,
              date: "Real-time alert",
              item: p.name,
              sku: p.sku,
              severity: "CRITICAL",
              type: "Critical Stock Level",
              detail: `Stock is at ${p.stock} units (${stockPct}% of ${capacity} capacity), below safety margin of ${minStockPercent}%.`,
              action: "Restock Now",
              dismissed: false,
            });
          }
          // Low Stock
          else if (enableLowStockAlerts && p.stock > 0 && p.stock <= reorderLimit) {
            dynamicAlerts.push({
              id: `ALT-LOW-${p.sku}`,
              date: "Real-time alert",
              item: p.name,
              sku: p.sku,
              severity: "WARNING",
              type: "Low Stock",
              detail: `Stock is at ${p.stock} units. Below ${reorderPercent}% reorder threshold.`,
              action: "Restock Now",
              dismissed: false,
            });
          }

          // Expiry
          if (enableExpiryAlerts && p.expiryDate) {
            const days = getDaysUntilExpiry(p.expiryDate);
            if (days <= 90) {
              const isExpired = days < 0;
              const isCritical = days <= 7;
              dynamicAlerts.push({
                id: `ALT-EXP-${p.sku}`,
                date: isExpired ? "Already expired" : `Expires in ${days} days`,
                item: p.name,
                sku: p.sku,
                severity: isExpired || isCritical ? "CRITICAL" : "WARNING",
                type: isExpired ? "Expired" : "Expiring Soon",
                detail: isExpired 
                  ? `Expired on ${p.expiryDate}. ${p.stock} units remain on shelf.`
                  : `${p.stock} units expiring on ${p.expiryDate}.`,
                action: isExpired ? "Remove Shelf" : "Markdown",
                dismissed: false,
              });
            }
          }
        });

        // Restore dismissed states from localStorage
        const savedStatesStr = localStorage.getItem('stocksense_alerts_read_dismiss_states');
        let savedStates: Record<string, { read: boolean, dismissed: boolean }> = {};
        if (savedStatesStr) {
          try { savedStates = JSON.parse(savedStatesStr); } catch { }
        }

        const combined = dynamicAlerts.map(item => {
          const lookupId = `dyn_${item.type === 'Overstock' ? 'over' : item.type === 'Out of Stock' ? 'out' : item.type === 'Critical Stock Level' ? 'critical' : item.type === 'Low Stock' ? 'low' : 'exp'}_${item.sku}`;
          const saved = savedStates[lookupId];
          return saved ? { ...item, dismissed: saved.dismissed } : item;
        });

        setAlerts(combined);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    loadAlerts();
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

  const dismissAlert = (id: string) => {
    const lookupId = id.startsWith('ALT-OVER-') ? `dyn_over_${id.replace('ALT-OVER-', '')}` :
                     id.startsWith('ALT-OUT-') ? `dyn_out_${id.replace('ALT-OUT-', '')}` :
                     id.startsWith('ALT-CRIT-') ? `dyn_critical_${id.replace('ALT-CRIT-', '')}` :
                     id.startsWith('ALT-LOW-') ? `dyn_low_${id.replace('ALT-LOW-', '')}` :
                     `dyn_exp_${id.replace('ALT-EXP-', '')}`;

    const savedStatesStr = localStorage.getItem('stocksense_alerts_read_dismiss_states') || '{}';
    try {
      const savedStates = JSON.parse(savedStatesStr);
      savedStates[lookupId] = { read: true, dismissed: true };
      localStorage.setItem('stocksense_alerts_read_dismiss_states', JSON.stringify(savedStates));
    } catch (e) {}

    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a));
  };

  const reportName = period === 'Custom Range' && dateRange.start && dateRange.end
    ? `Alert_Report_${dateRange.start}_to_${dateRange.end}`
    : `Alert_Report_${period}`;

  // Filter out dismissed alerts for standard listings, severity checks
  const activeAlerts = alerts.filter(a => !a.dismissed);
  const resolvedCount = alerts.filter(a => a.dismissed).length;

  const filteredAlerts = activeAlerts.filter(a => severityFilter === 'All Severities' || a.severity === severityFilter);

  const reportHeaders = ['Alert ID', 'Date & Time', 'Product', 'SKU', 'Severity', 'Type', 'Description'];
  const reportRows = filteredAlerts.map(p => [p.id, p.date, p.item, p.sku, p.severity, p.type, p.detail]);
  const reportData = { headers: reportHeaders, rows: reportRows };

  // Calculate totals
  const totalAlertsCount = activeAlerts.length;
  const lowStockWarnings = activeAlerts.filter(a => a.type === 'Low Stock' || a.type === 'Critical Stock Level' || a.type === 'Out of Stock').length;
  const expiredWarnings = activeAlerts.filter(a => a.type === 'Expired' || a.type === 'Expiring Soon').length;

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
          <h2 className="text-2xl font-bold text-slate-800">Alert Reports</h2>
          <p className="text-slate-500 text-sm mt-1">
            Track and manage critical warnings, low stock, and shelf expirations.
            {period === 'Custom Range' && dateRange.start && dateRange.end && (
              <span className="ml-2 font-bold text-[#0b8252]">({dateRange.start} to {dateRange.end})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-2 bg-[#fee2e2] text-[#ef4444] px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-[#fecaca] transition-colors">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export Warning PDF
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Total Alerts Raised</p>
          <h3 className="text-2xl font-bold text-slate-800">{loading ? '...' : totalAlertsCount}</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Real-time count</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Low Stock Warnings</p>
          <h3 className="text-2xl font-bold text-[#d97706]">{loading ? '...' : lowStockWarnings}</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Check stock levels</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Expired Warnings</p>
          <h3 className="text-2xl font-bold text-red-500">{loading ? '...' : expiredWarnings}</h3>
          <p className="text-[10px] font-bold text-red-400 mt-1">Requires immediate disposal</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Resolved Alerts</p>
          <h3 className="text-2xl font-bold text-[#0b8252]">{loading ? '...' : resolvedCount}</h3>
          <p className="text-[10px] font-bold text-[#0b8252] mt-1">Dismissed in system</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative">
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
            <option>All Severities</option>
            <option>CRITICAL</option>
            <option>WARNING</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
        </div>
        <button onClick={() => setSeverityFilter('All Severities')} className="text-sm font-bold text-slate-400 hover:text-[#0b8252] transition-colors">Reset</button>
      </div>

      {/* Main Alert List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading live alert data...</div>
        ) : filteredAlerts.map((alert, i) => (
          <div key={i} className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md border-l-4 ${
            alert.severity === 'CRITICAL' ? 'border-l-red-500' : 'border-l-amber-500'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                alert.severity === 'CRITICAL' ? 'bg-[#fee2e2] text-red-500' : 'bg-[#fef3c7] text-[#d97706]'
              }`}>
                <span className="material-symbols-outlined">{
                  alert.severity === 'CRITICAL' ? 'report' : 'warning'
                }</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${
                    alert.severity === 'CRITICAL' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'
                  }`}>{alert.severity}</span>
                  <h4 className="font-bold text-slate-800 text-sm md:text-base">{alert.item}</h4>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">({alert.sku})</span>
                </div>
                <p className="text-slate-600 text-sm mt-1">{alert.detail}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {alert.date}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">tag</span> ID: {alert.id}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <button 
                onClick={() => dismissAlert(alert.id)}
                className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs rounded-xl transition-colors"
              >
                Dismiss
              </button>
              <span className={`px-4 py-2 font-bold text-xs rounded-xl ${
                alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>{alert.action}</span>
            </div>
          </div>
        ))}
        {!loading && filteredAlerts.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            No alerts match your filter.
          </div>
        )}
      </div>
    </div>
  );
}
