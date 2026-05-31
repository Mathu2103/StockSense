import { useState } from 'react';
import { downloadReport, ViewState } from './reportUtils';

export default function ActivityReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Today');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [userFilter, setUserFilter] = useState('All Users');
  const [actionFilter, setActionFilter] = useState('All Actions');

  const dataMap: Record<string, any> = {
    Today: { logs: '1,248', waste: '42 kg', over: '15', mgrs: '8', t1: '+12.5%' },
    Week: { logs: '8,450', waste: '310 kg', over: '95', mgrs: '12', t1: '+5.2%' },
    Month: { logs: '35,200', waste: '1,400 kg', over: '420', mgrs: '14', t1: '-2.1%' },
    Year: { logs: '420,000', waste: '15,000 kg', over: '4,500', mgrs: '15', t1: '+1.5%' },
    'Custom Range': { logs: '4,000', waste: '120 kg', over: '45', mgrs: '10', t1: 'N/A' }
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
    ? `Activity_Report_${dateRange.start}_to_${dateRange.end}`
    : `Activity_Report_${period}`;

  const allLogs = [
    { time: "Today, 14:24", date: "Oct 24, 2023", prod: "Organic Eggs (12pk)", sku: "SKU: EG-7721", action: "Stock Added", qty: "+120", user: "Sarah Chen", avatar: "SC", aClass: "bg-[#eef8f2] text-[#0b8252]", qClass: "text-[#10b981]" },
    { time: "Today, 13:10", date: "Oct 24, 2023", prod: "Sparkling Water 500ml", sku: "SKU: DR-0045", action: "Waste Removed", qty: "-14", user: "Alex Rivera", avatar: "AR", aClass: "bg-[#fee2e2] text-[#ef4444]", qClass: "text-[#ef4444]" },
    { time: "Today, 11:45", date: "Oct 24, 2023", prod: "Greek Yogurt 500g", sku: "SKU: DA-1120", action: "Manual Adjustment", qty: "+5", user: "Mike Ross", avatar: "MR", aClass: "bg-slate-100 text-slate-600", qClass: "text-slate-600" },
    { time: "Oct 23, 17:50", date: "Oct 23, 2023", prod: "Aluminum Foil 25m", sku: "SKU: HH-4402", action: "Stock Added", qty: "+50", user: "Sarah Chen", avatar: "SC", aClass: "bg-[#eef8f2] text-[#0b8252]", qClass: "text-[#10b981]" },
  ];

  const uniqueUsers = Array.from(new Set(allLogs.map(l => l.user)));
  const uniqueActions = Array.from(new Set(allLogs.map(l => l.action)));

  const filteredLogs = allLogs.filter(l => 
    (userFilter === 'All Users' || l.user === userFilter) &&
    (actionFilter === 'All Actions' || l.action === actionFilter)
  );

  const reportHeaders = ['Date', 'Time', 'Product', 'SKU', 'Action', 'Qty Change', 'Updated By'];
  const reportRows = filteredLogs.map(p => [p.date, p.time.split(', ')[1] || p.time, p.prod, p.sku, p.action, p.qty, p.user]);
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
          <h2 className="text-2xl font-bold text-slate-800">Activity Reports</h2>
          <p className="text-slate-500 text-sm mt-1">
            Real-time audit trail of all inventory updates across the supermarket network.
            {period === 'Custom Range' && dateRange.start && dateRange.end && (
              <span className="ml-2 font-bold text-[#0b8252]">({dateRange.start} to {dateRange.end})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => downloadReport(reportName, 'csv', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Export CSV
          </button>
          <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
          <div className="flex bg-[#f1f5f9] p-1 rounded-xl border border-slate-200 w-fit">
            {['Today', 'Week', 'Month', 'Year', 'Custom Range'].map(tab => {
              let tabLabel = tab;
              if (tab === 'Custom Range' && period === 'Custom Range' && dateRange.start && dateRange.end) {
                tabLabel = `${dateRange.start} to ${dateRange.end}`;
              }
              return (
              <button 
                key={tab}
                onClick={() => handlePeriodChange(tab)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${period === tab ? 'bg-white text-[#0b8252] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {tab === 'Custom Range' && <span className="material-symbols-outlined text-[14px]">calendar_today</span>}
                {tabLabel}
              </button>
              );
            })}
          </div>

          <div className="relative">
            <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Users</option>
              {uniqueUsers.map(u => <option key={u}>{u}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <div className="relative">
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Actions</option>
              {uniqueActions.map(a => <option key={a}>{a}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
        </div>
        <button onClick={() => {setUserFilter('All Users'); setActionFilter('All Actions'); setPeriod('Today');}} className="text-sm font-bold text-slate-400 hover:text-[#0b8252] transition-colors self-end lg:self-auto">Reset Filters</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Total Logs</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.logs}</h3>
          <p className="text-[10px] font-bold text-[#10b981] mt-1">{activeData.t1} from last {period.toLowerCase()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Waste Recorded</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.waste}</h3>
          <p className="text-[10px] font-bold text-[#ef4444] mt-1">Alert: Fresh Produce high waste</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Manual Overrides</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.over}</h3>
          <p className="text-[10px] font-bold text-[#d97706] mt-1">Requires review by Admin</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Active Managers</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.mgrs}</h3>
          <p className="text-[10px] font-bold text-[#0b8252] mt-1">Peak shift active</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Qty Change</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Updated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLogs.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{item.time}</p>
                    <p className="text-[10px] text-slate-500">{item.date}</p>
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200"></div>
                    <div>
                      <p className="font-bold text-slate-800">{item.prod}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{item.sku}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.aClass}`}>
                      {item.action}
                    </span>
                  </td>
                  <td className={`p-4 text-center font-bold text-lg ${item.qClass}`}>{item.qty}</td>
                  <td className="p-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 flex items-center justify-center">
                      {item.avatar}
                    </div>
                    <span className="text-slate-700 font-medium">{item.user}</span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No activity matches your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
          <p>Showing <strong>{filteredLogs.length > 0 ? 1 : 0} - {filteredLogs.length}</strong> of <strong>{filteredLogs.length}</strong> logs</p>
          <div className="flex gap-1">
            <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
            <button className="w-6 h-6 flex items-center justify-center rounded bg-[#0b8252] text-white font-bold text-xs">1</button>
            <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        {/* Inventory Trends */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Inventory Trends</h3>
              <p className="text-xs text-slate-500">Volume of changes over the last 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0b8252]"></span> Additions</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> Waste</div>
            </div>
          </div>
          <div className="h-[180px] flex items-end justify-between px-4 border-b border-slate-100 pb-2">
            {[
              { a: 60, w: 10, d: "Mon" },
              { a: 85, w: 20, d: "Tue" },
              { a: 40, w: 35, d: "Wed" },
              { a: 90, w: 15, d: "Thu" },
              { a: 100, w: 25, d: "Fri" },
              { a: 30, w: 5, d: "Sat" },
              { a: 20, w: 0, d: "Sun" },
            ].map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2 h-full justify-end w-12">
                <div className="flex items-end gap-1 w-full h-full">
                  <div className="w-1/2 bg-[#0b8252] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${day.a}%` }}></div>
                  <div className="w-1/2 bg-[#ef4444] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${day.w}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-4 mt-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-slate-400 w-12 text-center">{d}</span>
            ))}
          </div>
        </div>

        {/* Live Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Live Activity</h3>
          <div className="flex-1 space-y-6">
            <div className="flex gap-3">
              <div className="relative mt-1">
                <span className="w-2 h-2 rounded-full bg-[#10b981] absolute -left-[5px] top-1.5 animate-pulse"></span>
                <div className="w-0.5 h-full bg-slate-100 absolute left-[2.5px] top-4"></div>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">New stock delivery arrived</p>
                <p className="text-xs text-slate-500 mt-0.5">Batch #8821 for Produce section</p>
                <p className="text-[10px] font-bold text-[#0b8252] mt-1">2 minutes ago</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative mt-1">
                <span className="w-2 h-2 rounded-full bg-[#ef4444] absolute -left-[5px] top-1.5"></span>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">Low stock alert</p>
                <p className="text-xs text-slate-500 mt-0.5">Whole Milk 1L - 3 units left</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">15 minutes ago</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 text-center text-sm font-bold text-[#0b8252] hover:underline pt-4 border-t border-slate-100">
            View All Live Activity
          </button>
        </div>
      </div>
    </div>
  );
}
