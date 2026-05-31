import { useState } from 'react';
import { downloadReport, ViewState } from './reportUtils';

export default function SalesReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Today');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All Departments');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const dataMap = {
    Today: { sales: 'Rs. 248,392.50', salesTrend: '+12.5%', orders: '1,842', ordersTrend: '+8.1%', top: 'Organic Avocados', topUnits: '412', topRev: 'Rs. 201,880.00', chart: [40, 75, 50, 95, 80, 45, 25] },
    Week: { sales: 'Rs. 1,482,900.00', salesTrend: '+8.2%', orders: '12,940', ordersTrend: '+5.4%', top: 'Spring Water 24pk', topUnits: '3,842', topRev: 'Rs. 450,500.00', chart: [60, 55, 80, 75, 95, 100, 85] },
    Month: { sales: 'Rs. 6,293,400.00', salesTrend: '+15.4%', orders: '54,200', ordersTrend: '+12.0%', top: 'Grade A Large Eggs', topUnits: '18,390', topRev: 'Rs. 1,275,500.00', chart: [40, 50, 45, 60, 70, 85, 90] },
    Year: { sales: 'Rs. 75,200,800.00', salesTrend: '+22.1%', orders: '648,300', ordersTrend: '+18.5%', top: 'Organic Avocados', topUnits: '182,400', topRev: 'Rs. 18,376,000.00', chart: [30, 40, 35, 50, 60, 80, 95] },
    'Custom Range': { sales: 'Rs. 104,200.00', salesTrend: '+4.1%', orders: '840', ordersTrend: '+2.1%', top: 'Premium Coffee', topUnits: '240', topRev: 'Rs. 42,000.00', chart: [50, 60, 40, 70, 80, 60, 40] }
  };

  const activeData = dataMap[period] || dataMap['Today'];

  const allProducts = [
    { name: "Grade A Large Eggs (12pk)", cat: "Dairy", sku: "EG-29384-L", qty: 328, price: "Rs. 450.00", rev: "Rs. 147,600.00", status: "IN STOCK", icon: "egg", sClass: "bg-[#dcfce7] text-[#16a34a]" },
    { name: "Organic Avocados", cat: "Produce", sku: "AV-11022-O", qty: 412, price: "Rs. 490.00", rev: "Rs. 201,880.00", status: "LOW STOCK", icon: "eco", sClass: "bg-[#fee2e2] text-[#ef4444]" },
    { name: "Premium Roasted Coffee 500g", cat: "Grocery", sku: "CF-88392-P", qty: 194, price: "Rs. 2,400.00", rev: "Rs. 465,600.00", status: "IN STOCK", icon: "local_cafe", sClass: "bg-[#dcfce7] text-[#16a34a]" },
    { name: "Spring Water 24pk", cat: "Grocery", sku: "WT-77281-S", qty: 582, price: "Rs. 1,450.00", rev: "Rs. 843,900.00", status: "IN STOCK", icon: "water_drop", sClass: "bg-[#dcfce7] text-[#16a34a]" },
    { name: "Cheddar Cheese 200g", cat: "Dairy", sku: "CH-11200-D", qty: 150, price: "Rs. 950.00", rev: "Rs. 142,500.00", status: "IN STOCK", icon: "kitchen", sClass: "bg-[#dcfce7] text-[#16a34a]" },
    { name: "Fresh Strawberries", cat: "Produce", sku: "ST-99001-P", qty: 85, price: "Rs. 890.00", rev: "Rs. 75,650.00", status: "LOW STOCK", icon: "local_dining", sClass: "bg-[#fee2e2] text-[#ef4444]" },
  ];

  const filteredProducts = categoryFilter === 'All Departments' 
    ? allProducts 
    : allProducts.filter(p => p.cat === categoryFilter);

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
    ? `Sales_Report_${dateRange.start}_to_${dateRange.end}`
    : `Sales_Report_${period}`;

  const reportHeaders = ['Product Name', 'Category', 'SKU', 'Qty Sold', 'Price', 'Revenue', 'Status'];
  const reportRows = filteredProducts.map(p => [p.name, p.cat, p.sku, p.qty, p.price, p.rev, p.status]);
  const reportData = { headers: reportHeaders, rows: reportRows };

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      
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
          <h2 className="text-2xl font-bold text-slate-800">Sales Reports</h2>
          <p className="text-slate-500 text-sm mt-1">
            Analyze performance metrics and revenue streams across periods.
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
          <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-2 bg-[#0b8252] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors">
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print Report
          </button>
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex bg-[#f1f5f9] p-1 rounded-lg border border-slate-200 w-fit">
        {['Today', 'Week', 'Month', 'Year', 'Custom Range'].map(tab => {
          let tabLabel = tab;
          if (tab === 'Custom Range' && period === 'Custom Range' && dateRange.start && dateRange.end) {
            tabLabel = `${dateRange.start} to ${dateRange.end}`;
          }
          return (
          <button 
            key={tab}
            onClick={() => handlePeriodChange(tab)}
            className={`px-5 py-1.5 text-sm font-medium rounded-md flex items-center gap-1 transition-colors ${period === tab ? 'bg-white text-[#0b8252] font-bold shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            {tab === 'Custom Range' && <span className="material-symbols-outlined text-[16px]">calendar_today</span>}
            {tabLabel}
          </button>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center transition-all duration-300">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <span className="material-symbols-outlined text-[16px]">payments</span>
            <p className="text-xs font-bold uppercase tracking-wider">Total Sales</p>
          </div>
          <h3 className="text-4xl font-bold text-slate-800 tracking-tight">{activeData.sales}</h3>
          <p className="text-xs font-bold text-[#10b981] mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> {activeData.salesTrend}
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center transition-all duration-300">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
            <p className="text-xs font-bold uppercase tracking-wider">Total Orders</p>
          </div>
          <h3 className="text-4xl font-bold text-slate-800 tracking-tight">{activeData.orders}</h3>
          <p className="text-xs font-bold text-[#10b981] mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> {activeData.ordersTrend}
          </p>
        </div>

        {/* Top Selling Product */}
        <div className="bg-[#eef8f2] rounded-xl border border-[#bbf7d0] p-6 shadow-sm flex flex-col justify-center relative overflow-hidden transition-all duration-300">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[#0b8252] mb-1">
              <span className="material-symbols-outlined text-[16px]">stars</span>
              <p className="text-xs font-bold uppercase tracking-wider">Top Selling Product</p>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 leading-tight truncate">{activeData.top}</h3>
            <div className="mt-3">
              <p className="text-xs text-slate-600 mb-0.5">{activeData.topUnits} Units Sold</p>
              <p className="text-sm font-bold text-[#0b8252]">Revenue: {activeData.topRev}</p>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-[#0b8252] opacity-10">
            shopping_basket
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-lg text-slate-800">Inventory Sales Detail</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0b8252]/20 focus:border-[#0b8252]"
              >
                <option value="All Departments">All Departments</option>
                <option value="Grocery">Grocery</option>
                <option value="Produce">Produce</option>
                <option value="Dairy">Dairy</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">
                expand_more
              </span>
            </div>
            <button className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Quantity Sold</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Unit Price</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Revenue</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#eef8f2] flex items-center justify-center text-[#0b8252]">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">SKU: {item.sku}</p>
                    </div>
                  </td>
                  <td className="p-4 text-center font-medium text-slate-700">{item.qty}</td>
                  <td className="p-4 text-center font-medium text-slate-700">{item.price}</td>
                  <td className="p-4 text-right font-bold text-slate-800">{item.rev}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full whitespace-nowrap ${item.sClass}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No products found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>Showing {filteredProducts.length > 0 ? 1 : 0} to {filteredProducts.length} of {filteredProducts.length} products</p>
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
