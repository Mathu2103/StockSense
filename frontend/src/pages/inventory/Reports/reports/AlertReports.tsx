import { useState } from 'react';
import { downloadReport, ViewState } from './reportUtils';

export default function AlertReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Today');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [severityFilter, setSeverityFilter] = useState('All Severities');

  const dataMap: Record<string, any> = {
    Today: { count: '18', low: '12', exp: '6', res: '8', t1: '+2 incidents' },
    Week: { count: '84', low: '54', exp: '30', res: '48', t1: '+12 incidents' },
    Month: { count: '320', low: '210', exp: '110', res: '180', t1: '-15 incidents' },
    Year: { count: '3,800', low: '2,400', exp: '1,400', res: '2,200', t1: '+120 incidents' },
    'Custom Range': { count: '50', low: '35', exp: '15', res: '20', t1: 'N/A' }
  };

  const activeData = dataMap[period] || dataMap['Today'];

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
    ? `Alert_Report_${dateRange.start}_to_${dateRange.end}`
    : `Alert_Report_${period}`;

  const allAlerts = [
    { id: "ALT-9821", date: "Today, 14:24", item: "Organic Avocados", sku: "AV-11022-O", severity: "CRITICAL", type: "Low Stock", detail: "3 units remaining. Minimum reorder is 50.", action: "Create PO", sClass: "bg-[#fee2e2] text-[#ef4444] border-red-200" },
    { id: "ALT-9822", date: "Today, 13:10", item: "Fresh Strawberries", sku: "ST-99001-P", severity: "CRITICAL", type: "Expired", detail: "12 boxes expired. Disposal required.", action: "Mark Expired", sClass: "bg-[#fee2e2] text-[#ef4444] border-red-200" },
    { id: "ALT-9823", date: "Today, 11:45", item: "Whole Wheat Bread", sku: "BR-44021-W", severity: "WARNING", type: "Low Stock", detail: "5 loaves remaining. Reorder threshold 10.", action: "Create PO", sClass: "bg-[#fef3c7] text-[#d97706] border-[#fde68a]" },
    { id: "ALT-9824", date: "Oct 23, 17:50", item: "Greek Yogurt 500g", sku: "DY-11200-G", severity: "INFO", type: "Reorder Sent", detail: "PO #8841 sent to Supplier.", action: "Track Order", sClass: "bg-blue-50 text-blue-600 border-blue-100" },
  ];

  const filteredAlerts = allAlerts.filter(a => severityFilter === 'All Severities' || a.severity === severityFilter);

  const reportHeaders = ['Alert ID', 'Date & Time', 'Product', 'SKU', 'Severity', 'Type', 'Description'];
  const reportRows = filteredAlerts.map(p => [p.id, p.date, p.item, p.sku, p.severity, p.type, p.detail]);
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
          <button onClick={() => onViewChange('overview')} className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b8252] transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Overview
          </button>
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
          <h3 className="text-2xl font-bold text-slate-800">{activeData.count}</h3>
          <p className="text-[10px] font-bold text-[#ef4444] mt-1">{activeData.t1} from last {period.toLowerCase()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Low Stock Warnings</p>
          <h3 className="text-2xl font-bold text-[#d97706]">{activeData.low}</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Check Pantry section</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Expired Warnings</p>
          <h3 className="text-2xl font-bold text-red-500">{activeData.exp}</h3>
          <p className="text-[10px] font-bold text-red-400 mt-1">Requires immediate disposal</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Resolved Alerts</p>
          <h3 className="text-2xl font-bold text-[#0b8252]">{activeData.res}</h3>
          <p className="text-[10px] font-bold text-[#0b8252] mt-1">Good work team</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative">
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
            <option>All Severities</option>
            <option>CRITICAL</option>
            <option>WARNING</option>
            <option>INFO</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
        </div>
        <button onClick={() => setSeverityFilter('All Severities')} className="text-sm font-bold text-slate-400 hover:text-[#0b8252] transition-colors">Reset</button>
      </div>

      {/* Main Alert List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert, i) => (
          <div key={i} className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md border-l-4 ${
            alert.severity === 'CRITICAL' ? 'border-l-red-500' :
            alert.severity === 'WARNING' ? 'border-l-amber-500' : 'border-l-blue-500'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                alert.severity === 'CRITICAL' ? 'bg-[#fee2e2] text-red-500' :
                alert.severity === 'WARNING' ? 'bg-[#fef3c7] text-[#d97706]' : 'bg-blue-50 text-blue-600'
              }`}>
                <span className="material-symbols-outlined">{
                  alert.severity === 'CRITICAL' ? 'report' :
                  alert.severity === 'WARNING' ? 'warning' : 'info'
                }</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${
                    alert.severity === 'CRITICAL' ? 'bg-red-50 text-red-500' :
                    alert.severity === 'WARNING' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-500'
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
              <button className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs rounded-xl transition-colors">Dismiss</button>
              <button className={`px-4 py-2 font-bold text-xs rounded-xl transition-all ${
                alert.severity === 'CRITICAL' ? 'bg-red-500 hover:bg-red-600 text-white shadow-md' :
                alert.severity === 'WARNING' ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              }`}>{alert.action}</button>
            </div>
          </div>
        ))}
        {filteredAlerts.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            No alerts match your filter.
          </div>
        )}
      </div>

    </div>
  );
}
