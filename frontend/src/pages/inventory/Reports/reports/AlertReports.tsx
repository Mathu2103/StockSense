import { useState, useEffect } from 'react';
import { downloadReport, ViewState } from './reportUtils';
import { NotificationService, NotificationItem } from '../../../../services/notificationService';

const mapBackendNotification = (n: NotificationItem) => {
  // Map types to user friendly types
  let type = 'Low Stock';
  if (n.type === 'OUT_OF_STOCK') type = 'Out of Stock';
  else if (n.type === 'OVERSTOCK') type = 'Overstock';
  else if (n.type === 'EXPIRED') type = 'Expired';
  else if (n.type === 'EXPIRING_SOON') type = 'Expiring Soon';
  else if (n.type === 'STOCK_VELOCITY') type = 'Dead Stock';
  else if (n.type === 'DEMAND_FORECAST' || n.type === 'COMBO_SUGGESTION') type = 'Reorder Recommendation';
  else if (n.type === 'DISCOUNT_APPROVAL') type = 'Discount Approval';
  else if (n.type === 'DISCOUNT_RESPONSE') type = 'Discount Response';
  else if (n.type === 'SYSTEM') type = 'System Alert';

  // Map severities
  const severity = n.severity === 'INFO' ? 'WARNING' : n.severity;

  // Map actions
  let action = 'Acknowledge';
  if (n.type === 'EXPIRING_SOON' || n.type === 'EXPIRED' || n.type === 'OVERSTOCK') {
    action = 'Remove Shelf';
  } else if (n.type === 'STOCK_VELOCITY') {
    action = 'Create Promotion';
  } else if (n.type === 'LOW_STOCK' || n.type === 'OUT_OF_STOCK') {
    action = 'Restock Now';
  } else if (n.suggestedAction) {
    action = n.suggestedAction;
  }

  // Format date
  const dateFormatted = new Date(n.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Check if this notification has been dismissed by this user
  const dismissed = n.userStates?.[0]?.isDismissed || false;

  return {
    id: n.id,
    date: dateFormatted,
    createdAt: n.createdAt,
    item: n.product?.name || n.title,
    sku: n.sku || n.product?.sku || 'N/A',
    severity,
    type,
    detail: n.message,
    action,
    dismissed,
  };
};

// All alert type options
const ALERT_TYPE_OPTIONS = [
  'All Types',
  'Low Stock',
  'Out of Stock',
  'Expiring Soon',
  'Expired',
  'Dead Stock',
  'Overstock',
  'Reorder Recommendation',
  'Discount Approval',
  'Discount Response',
  'System Alert',
];

const STATUS_OPTIONS = ['All', 'Active', 'Resolved'];

export default function AlertReports({ onViewChange: _onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [severityFilter, setSeverityFilter] = useState('All Severities');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All');

  // Dynamic alert data
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadAlerts() {
      try {
        setLoading(true);
        const res = await NotificationService.getNotifications(true); // include dismissed
        if (!active) return;

        if (res.success && Array.isArray(res.data)) {
          const mappedAlerts = res.data.map((n: NotificationItem) => mapBackendNotification(n));
          setAlerts(mappedAlerts);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading alerts for report:', err);
        if (active) setLoading(false);
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

  const dismissAlert = async (id: string) => {
    try {
      await NotificationService.dismiss(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  const filterByPeriod = (createdAtStr: string) => {
    if (period === 'Custom Range') {
      if (!dateRange.start || !dateRange.end) return true;
      const date = new Date(createdAtStr);
      const start = new Date(dateRange.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    }

    const date = new Date(createdAtStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
      case 'Today': {
        return date >= today;
      }
      case 'Week': {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= oneWeekAgo;
      }
      case 'Month': {
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return date >= oneMonthAgo;
      }
      case 'Year': {
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return date >= oneYearAgo;
      }
      default:
        return true;
    }
  };

  const resetAllFilters = () => {
    setSeverityFilter('All Severities');
    setTypeFilter('All Types');
    setStatusFilter('All');
  };

  const reportName = period === 'Custom Range' && dateRange.start && dateRange.end
    ? `Alert_Report_${dateRange.start}_to_${dateRange.end}`
    : `Alert_Report_${period}`;

  // Filter alerts by period
  const alertsInPeriod = alerts.filter(a => filterByPeriod(a.createdAt));

  // Apply all filters (severity, type, status) — show ALL alerts including resolved
  const filteredAlerts = alertsInPeriod.filter(a => {
    // Severity filter
    if (severityFilter !== 'All Severities' && a.severity !== severityFilter) return false;
    // Type filter
    if (typeFilter !== 'All Types' && a.type !== typeFilter) return false;
    // Status filter
    if (statusFilter === 'Active' && a.dismissed) return false;
    if (statusFilter === 'Resolved' && !a.dismissed) return false;
    return true;
  });

  // KPI calculations — based on period-filtered (before severity/type/status filters)
  const totalAlertsCount = alertsInPeriod.length;
  const activeCount = alertsInPeriod.filter(a => !a.dismissed).length;
  const resolvedCount = alertsInPeriod.filter(a => a.dismissed).length;
  const lowStockWarnings = alertsInPeriod.filter(a => a.type === 'Low Stock' || a.type === 'Out of Stock').length;
  const expiredWarnings = alertsInPeriod.filter(a => a.type === 'Expired' || a.type === 'Expiring Soon').length;
  const deadStockCount = alertsInPeriod.filter(a => a.type === 'Dead Stock').length;
  const overstockCount = alertsInPeriod.filter(a => a.type === 'Overstock').length;

  const reportHeaders = ['Alert ID', 'Date & Time', 'Product', 'SKU', 'Severity', 'Type', 'Status', 'Description'];
  const reportRows = filteredAlerts.map(p => [p.id, p.date, p.item, p.sku, p.severity, p.type, p.dismissed ? 'Resolved' : 'Active', p.detail]);
  const reportData = { headers: reportHeaders, rows: reportRows };

  const hasActiveFilters = severityFilter !== 'All Severities' || typeFilter !== 'All Types' || statusFilter !== 'All';

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
          <button onClick={() => downloadReport(reportName, 'pdf', reportData, 'Alerts')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
            <span className="material-symbols-outlined text-[18px] text-slate-500">picture_as_pdf</span>
            Export PDF
          </button>
          <button onClick={() => downloadReport(reportName, 'excel', reportData, 'Alerts')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
            <span className="material-symbols-outlined text-[18px] text-slate-500">table_chart</span>
            Export Excel
          </button>
        </div>
      </div>

      {/* REPORT PERIOD FILTER */}
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Total Alerts</p>
          <h3 className="text-2xl font-bold text-slate-800">{loading ? '...' : totalAlertsCount}</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1">All alerts in period</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Active Alerts</p>
          <h3 className="text-2xl font-bold text-[#d97706]">{loading ? '...' : activeCount}</h3>
          <p className="text-[10px] font-bold text-amber-400 mt-1">Pending action</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Resolved Alerts</p>
          <h3 className="text-2xl font-bold text-[#0b8252]">{loading ? '...' : resolvedCount}</h3>
          <p className="text-[10px] font-bold text-[#0b8252] mt-1">Dismissed / handled</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Low Stock</p>
          <h3 className="text-2xl font-bold text-red-500">{loading ? '...' : lowStockWarnings}</h3>
          <p className="text-[10px] font-bold text-red-400 mt-1">Needs restocking</p>
        </div>
      </div>

      {/* Secondary KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
            <span className="material-symbols-outlined">event_busy</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Expired / Expiring</p>
            <h3 className="text-xl font-bold text-red-500">{loading ? '...' : expiredWarnings}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
            <span className="material-symbols-outlined">trending_down</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Dead Stock</p>
            <h3 className="text-xl font-bold text-purple-600">{loading ? '...' : deadStockCount}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
            <span className="material-symbols-outlined">inventory</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Overstock</p>
            <h3 className="text-xl font-bold text-blue-600">{loading ? '...' : overstockCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        {/* Status filter */}
        <div className="flex bg-[#f1f5f9] p-0.5 rounded-lg border border-slate-200">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                statusFilter === opt
                  ? 'bg-white text-[#0b8252] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="relative">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
            {ALERT_TYPE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
        </div>

        {/* Severity filter */}
        <div className="relative">
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
            <option>All Severities</option>
            <option>CRITICAL</option>
            <option>WARNING</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
        </div>

        <div className="flex-1" />

        {/* Active filter indicator + Reset */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">
              {filteredAlerts.length} of {alertsInPeriod.length} alerts
            </span>
            <button onClick={resetAllFilters} className="flex items-center gap-1 text-sm font-bold text-red-400 hover:text-red-600 transition-colors">
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Main Alert List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading live alert data...</div>
        ) : filteredAlerts.map((alert, i) => (
          <div key={i} className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md border-l-4 ${
            alert.dismissed
              ? 'border-l-emerald-400 opacity-70'
              : alert.severity === 'CRITICAL'
                ? 'border-l-red-500'
                : 'border-l-amber-500'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                alert.dismissed
                  ? 'bg-emerald-50 text-emerald-500'
                  : alert.severity === 'CRITICAL'
                    ? 'bg-[#fee2e2] text-red-500'
                    : 'bg-[#fef3c7] text-[#d97706]'
              }`}>
                <span className="material-symbols-outlined">{
                  alert.dismissed ? 'check_circle' : alert.severity === 'CRITICAL' ? 'report' : 'warning'
                }</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status badge */}
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${
                    alert.dismissed
                      ? 'bg-emerald-50 text-emerald-600'
                      : alert.severity === 'CRITICAL'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-amber-50 text-amber-600'
                  }`}>{alert.dismissed ? 'RESOLVED' : alert.severity}</span>
                  {/* Type badge */}
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-slate-100 text-slate-500 uppercase tracking-wider">
                    {alert.type}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm md:text-base">{alert.item}</h4>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">({alert.sku})</span>
                </div>
                <p className="text-slate-600 text-sm mt-1">{alert.detail}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {alert.date}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">tag</span> ID: ...{alert.id.slice(-8)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              {!alert.dismissed ? (
                <>
                  <button 
                    onClick={() => dismissAlert(alert.id)}
                    className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs rounded-xl transition-colors"
                  >
                    Dismiss
                  </button>
                  <span className={`px-4 py-2 font-bold text-xs rounded-xl ${
                    alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>{alert.action}</span>
                </>
              ) : (
                <span className="px-4 py-2 font-bold text-xs rounded-xl bg-emerald-50 text-emerald-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  Resolved
                </span>
              )}
            </div>
          </div>
        ))}
        {!loading && filteredAlerts.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            No alerts match your current filters.
          </div>
        )}
      </div>
    </div>
  );
}
