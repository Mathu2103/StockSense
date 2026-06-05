import { useState } from 'react';
import { downloadReport, ViewState } from './reportUtils';

export default function PurchaseReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const dataMap: Record<string, any> = {
    Today: { pur: '45', items: '1,200', sup: '12', pend: '3', t1: '+5%' },
    Week: { pur: '320', items: '12,500', sup: '45', pend: '15', t1: '+8%' },
    Month: { pur: '1,284', items: '45,920', sup: '142', pend: '8', t1: '+12%' },
    Year: { pur: '15,400', items: '550,000', sup: '150', pend: '5', t1: '+20%' },
    'Custom Range': { pur: '400', items: '14,000', sup: '50', pend: '10', t1: '+10%' }
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
    ? `Purchase_Report_${dateRange.start}_to_${dateRange.end}`
    : `Purchase_Report_${period}`;

  const allPurchases = [
    { ref: "PR-00881", date: "Oct 24 2023", sup: "Green Harvest Co.", prod: "Organic Milk 1L", qty: "200 units", price: "Rs. 450.00", total: "Rs. 90,000.00", status: "RECEIVED", sClass: "bg-[#eef8f2] text-[#0b8252]" },
    { ref: "PR-00882", date: "Oct 25 2023", sup: "Fresh Dairy Inc.", prod: "Cheddar Cheese 200g", qty: "50 units", price: "Rs. 950.00", total: "Rs. 47,500.00", status: "PENDING", sClass: "bg-[#fef3c7] text-[#d97706]" },
    { ref: "PR-00883", date: "Oct 25 2023", sup: "Global Grains Ltd.", prod: "Whole Wheat Bread", qty: "100 units", price: "Rs. 220.00", total: "Rs. 22,000.00", status: "PARTIAL", sClass: "bg-[#fee2e2] text-[#ef4444]" },
    { ref: "PR-00884", date: "Oct 25 2023", sup: "Orchard Valley", prod: "Red Apples (Box)", qty: "15 units", price: "Rs. 8,500.00", total: "Rs. 127,500.00", status: "RECEIVED", sClass: "bg-[#eef8f2] text-[#0b8252]" },
    { ref: "PR-00885", date: "Oct 26 2023", sup: "Beverage Prox", prod: "Sparkling Water 500ml", qty: "500 units", price: "Rs. 180.00", total: "Rs. 90,000.00", status: "PENDING", sClass: "bg-[#fef3c7] text-[#d97706]" },
  ];

  const filteredPurchases = allPurchases.filter(p => statusFilter === 'All Statuses' || p.status === statusFilter);

  const reportHeaders = ['Ref #', 'Date', 'Supplier', 'Product', 'Qty', 'Unit Price', 'Total', 'Status'];
  const reportRows = filteredPurchases.map(p => [p.ref, p.date, p.sup, p.prod, p.qty, p.price, p.total, p.status]);
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
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded text-sm font-bold"><span className="material-symbols-outlined text-[18px]">print</span> Print Report</button>
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
          <div className="flex justify-between items-start mb-4">
            <div className="w-8 h-8 rounded bg-[#eef8f2] text-[#0b8252] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            </div>
            <span className="text-[10px] font-bold text-[#10b981]">{activeData.t1} vs last {period.toLowerCase()}</span>
          </div>
          <p className="text-xs font-bold text-slate-500 mb-0.5">Total Purchases</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.pur}</h3>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[18px]">inventory</span>
          </div>
          <p className="text-xs font-bold text-slate-500 mb-0.5">Total Items Purchased</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.items}</h3>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[18px]">storefront</span>
          </div>
          <p className="text-xs font-bold text-slate-500 mb-0.5">Total Suppliers Active</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.sup}</h3>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-8 h-8 rounded bg-[#fef3c7] text-[#d97706] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          </div>
          <p className="text-xs font-bold text-slate-500 mb-0.5">Pending Deliveries</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.pend}</h3>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Status</label>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Statuses</option>
              <option>RECEIVED</option>
              <option>PENDING</option>
              <option>PARTIAL</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
        </div>
        <div className="flex gap-3 mt-4 lg:mt-0">
          <button onClick={() => setStatusFilter('All Statuses')} className="px-5 py-2 text-[#0b8252] font-bold text-sm hover:underline">Reset</button>
        </div>
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
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Price</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPurchases.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-[#0b8252]">{item.ref}</td>
                  <td className="p-4 text-slate-600 text-xs w-20">{item.date.replace(" ", "\n")}</td>
                  <td className="p-4 text-slate-700 font-medium">{item.sup}</td>
                  <td className="p-4 text-slate-800">{item.prod}</td>
                  <td className="p-4 text-slate-600 text-xs w-16">{item.qty.replace(" ", "\n")}</td>
                  <td className="p-4 text-slate-600">{item.price}</td>
                  <td className="p-4 font-bold text-slate-800">{item.total}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${item.sClass}`}>{item.status}</span>
                  </td>
                </tr>
              ))}
              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">No records match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
          <p>Showing <strong>{filteredPurchases.length > 0 ? 1 : 0} - {filteredPurchases.length}</strong> of <strong>{filteredPurchases.length}</strong> results</p>
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
