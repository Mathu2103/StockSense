import { useState } from 'react';
import { downloadReport, ViewState } from './reportUtils';

export default function SupplierReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  const dataMap: Record<string, any> = {
    Today: { sup: '142', act: '138', time: '2.4 Days', t1: '+12.5%', t2: '97.1%', t3: '+0.3 days' },
    Week: { sup: '140', act: '135', time: '2.2 Days', t1: '+10.0%', t2: '96.4%', t3: '-0.1 days' },
    Month: { sup: '142', act: '138', time: '2.4 Days', t1: '+12.5%', t2: '97.1%', t3: '+0.3 days' },
    Year: { sup: '150', act: '145', time: '1.8 Days', t1: '+20.0%', t2: '96.6%', t3: '-0.5 days' },
    'Custom Range': { sup: '141', act: '137', time: '2.3 Days', t1: '+11.0%', t2: '97.0%', t3: '+0.1 days' }
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
    ? `Supplier_Report_${dateRange.start}_to_${dateRange.end}`
    : `Supplier_Report_${period}`;

  const allSuppliers = [
    {
      name: "Green Harvest Co.", sku: "SUP-8821", initials: "GH", email: "sarah.lee@harvest.com", phone: "+1 (555) 012-9934",
      cats: [{ l: "FRESH PRODUCE", c: "bg-[#eef8f2] text-[#0b8252]" }, { l: "ORGANIC", c: "bg-[#f1f5f9] text-slate-600" }],
      products: 45, pct: 25, date: "Oct 24, 2023", status: "Active", sClass: "bg-[#eef8f2] text-[#0b8252]"
    },
    {
      name: "Dairy Alliance", sku: "SUP-4491", initials: "DA", email: "orders@dairyall.net", phone: "+1 (555) 234-5501",
      cats: [{ l: "DAIRY", c: "bg-blue-50 text-blue-600" }, { l: "FROZEN", c: "bg-indigo-50 text-indigo-600" }],
      products: 112, pct: 60, date: "Oct 26, 2023", status: "Active", sClass: "bg-[#eef8f2] text-[#0b8252]"
    },
    {
      name: "Nature's Bake", sku: "SUP-1102", initials: "NB", email: "contact@naturesbake.co", phone: "+1 (555) 901-2211",
      cats: [{ l: "BAKERY", c: "bg-[#fef3c7] text-[#d97706]" }],
      products: 18, pct: 10, date: "Sep 12, 2023", status: "Inactive", sClass: "bg-slate-100 text-slate-500"
    },
    {
      name: "Prime Foods Dist.", sku: "SUP-7722", initials: "PF", email: "logistics@primefoods.com", phone: "+1 (555) 773-1010",
      cats: [{ l: "MEAT & POULTRY", c: "bg-[#fee2e2] text-[#ef4444]" }, { l: "CANNED GOODS", c: "bg-[#ffedd5] text-[#ea580c]" }],
      products: 240, pct: 90, date: "Oct 27, 2023", status: "Active", sClass: "bg-[#eef8f2] text-[#0b8252]"
    },
  ];

  const filteredSuppliers = allSuppliers.filter(item => filter === 'All' || item.status === filter);

  const reportHeaders = ['Supplier Name', 'SKU', 'Email', 'Products', 'Last Supply', 'Status'];
  const reportRows = filteredSuppliers.map(p => [p.name, p.sku, p.email, p.products, p.date, p.status]);
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

          <h2 className="text-2xl font-bold text-slate-800">Supplier Performance Reports</h2>
          <p className="text-slate-500 text-sm mt-1">
            Evaluate supplier lead times, fulfillment rates, and delivery quality metrics.
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Suppliers */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden flex flex-col justify-center h-[130px]">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded bg-[#eef8f2] text-[#0b8252] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">groups</span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Suppliers</p>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeData.sup}</h3>
            <p className="text-xs font-bold text-[#10b981] mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> {activeData.t1} vs last {period.toLowerCase()}
            </p>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        </div>

        {/* Active Suppliers */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden flex flex-col justify-center h-[130px]">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded bg-[#dcfce7] text-[#16a34a] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Suppliers</p>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeData.act}</h3>
            <p className="text-xs font-bold text-[#0b8252] mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span> {activeData.t2} Retention rate
            </p>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#eef8f2] rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none opacity-50"></div>
        </div>

        {/* Avg Lead Time */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden flex flex-col justify-center h-[130px]">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded bg-[#fef3c7] text-[#d97706] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg. Lead Time</p>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeData.time}</h3>
            <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${activeData.t3.startsWith('+') ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
              <span className="material-symbols-outlined text-[14px]">{activeData.t3.startsWith('+') ? 'trending_up' : 'trending_down'}</span> {activeData.t3} lag spike
            </p>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#fffedd] rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none opacity-50"></div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-lg text-slate-800">Supplier Directory</h3>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#f1f5f9] p-1 rounded-lg border border-slate-200">
              {['All', 'Active', 'Inactive'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setFilter(tab as any)}
                  className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${filter === tab ? 'bg-white text-slate-800 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Details</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Supply Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSuppliers.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded font-bold text-sm bg-slate-100 text-slate-600 flex items-center justify-center">
                      {item.initials}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{item.sku}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-700 font-medium">{item.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.phone}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5 w-32">
                      <span className="font-bold text-slate-800">{item.products} Items</span>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0b8252] rounded-full" style={{ width: `${item.pct}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{item.date}</td>
                  <td className="p-4 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full ${item.sClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-[#10b981]' : 'bg-slate-400'}`}></span>
                      {item.status}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-slate-400 hover:text-[#0b8252] transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No suppliers match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>Showing <strong>{filteredSuppliers.length > 0 ? 1 : 0} - {filteredSuppliers.length}</strong> of <strong>{filteredSuppliers.length}</strong> suppliers</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0b8252] text-white font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
