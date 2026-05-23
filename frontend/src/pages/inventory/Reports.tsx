import { useState } from 'react';
import Sidebar from './Sidebar';
import InventoryHeader from './InventoryHeader';

type ViewState = 'overview' | 'sales' | 'inventory' | 'supplier' | 'activity' | 'purchase' | 'alert';

export default function Reports() {
  const [activeView, setActiveView] = useState<ViewState>('overview');

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InventoryHeader />

        <main className="flex-1 overflow-y-auto px-6 py-6 bg-[#f8f9fa]">
          <div className="max-w-[1400px] w-full mx-auto space-y-6">
            
            {activeView === 'overview' && <ReportsOverview onViewChange={setActiveView} />}
            {activeView === 'sales' && <SalesReports onViewChange={setActiveView} />}
            {activeView === 'inventory' && <InventoryReports onViewChange={setActiveView} />}
            {activeView === 'supplier' && <SupplierReports onViewChange={setActiveView} />}
            {activeView === 'activity' && <ActivityReports onViewChange={setActiveView} />}
            {activeView === 'purchase' && <PurchaseReports onViewChange={setActiveView} />}
            {activeView === 'alert' && <AlertReports onViewChange={setActiveView} />}
            
          </div>
        </main>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// 1. OVERVIEW COMPONENT
// --------------------------------------------------------------------------------
function ReportsOverview({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Detailed insights into your supermarket's daily operations and performance.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#0b8252] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors">
          <span className="material-symbols-outlined text-[18px]">insert_chart</span>
          Create Custom Report
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Sales */}
        <div 
          onClick={() => onViewChange('sales')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-start"
        >
          <div className="w-10 h-10 bg-[#eef8f2] text-[#0b8252] rounded-lg flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">trending_up</span>
          </div>
          <h3 className="font-bold text-lg text-slate-800 mb-2">Sales Reports</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Track daily revenue, profit margins, and peak shopping hours performance.
          </p>
        </div>

        {/* Inventory */}
        <div 
          onClick={() => onViewChange('inventory')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-start"
        >
          <div className="w-10 h-10 bg-[#eef8f2] text-[#0b8252] rounded-lg flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <h3 className="font-bold text-lg text-slate-800 mb-2">Inventory Reports</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Analyze stock turnover rates, shrinkage levels, and total inventory value.
          </p>
        </div>

        {/* Supplier */}
        <div 
          onClick={() => onViewChange('supplier')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-start"
        >
          <div className="w-10 h-10 bg-[#fef3c7] text-[#d97706] rounded-lg flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">local_shipping</span>
          </div>
          <h3 className="font-bold text-lg text-slate-800 mb-2">Supplier Reports</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Evaluate supplier lead times, fulfillment rates, and delivery quality metrics.
          </p>
        </div>

        {/* Purchase */}
        <div 
          onClick={() => onViewChange('purchase')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-start"
        >
          <div className="w-10 h-10 bg-[#f1f5f9] text-[#64748b] rounded-lg flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">shopping_bag</span>
          </div>
          <h3 className="font-bold text-lg text-slate-800 mb-2">Purchase Reports</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Review historical purchase orders, spending trends, and cost variations over time.
          </p>
        </div>

        {/* Alert */}
        <div 
          onClick={() => onViewChange('alert')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-start"
        >
          <div className="w-10 h-10 bg-[#fee2e2] text-[#ef4444] rounded-lg flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <h3 className="font-bold text-lg text-slate-800 mb-2">Alert Reports</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Summarize low stock incidents, expired products, and critical shelf warnings.
          </p>
        </div>

        {/* Activity */}
        <div 
          onClick={() => onViewChange('activity')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-start"
        >
          <div className="w-10 h-10 bg-[#f1f5f9] text-[#64748b] rounded-lg flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">history</span>
          </div>
          <h3 className="font-bold text-lg text-slate-800 mb-2">Activity Reports</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Audit employee actions, system changes, and management overrides log.
          </p>
        </div>
      </div>

      {/* Recently Generated */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">Recently Generated</h2>
          <button className="text-sm font-bold text-[#0b8252] hover:underline">Clear History</button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Report Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Generated</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr>
                <td className="p-4 font-bold text-slate-700">Weekly Revenue Analysis - Q3</td>
                <td className="p-4"><span className="px-2.5 py-1 text-[10px] font-bold bg-[#eef8f2] text-[#0b8252] rounded-full">Sales</span></td>
                <td className="p-4 text-slate-600">Oct 24, 2023 - 09:45 AM</td>
                <td className="p-4"><div className="flex items-center gap-1.5 font-bold text-[#10b981]"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Ready</div></td>
                <td className="p-4 text-right"><button className="text-slate-400 hover:text-[#0b8252]"><span className="material-symbols-outlined">download</span></button></td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-700">Low Stock Warning Summary</td>
                <td className="p-4"><span className="px-2.5 py-1 text-[10px] font-bold bg-[#fee2e2] text-[#ef4444] rounded-full">Alerts</span></td>
                <td className="p-4 text-slate-600">Oct 23, 2023 - 04:12 PM</td>
                <td className="p-4"><div className="flex items-center gap-1.5 font-bold text-[#10b981]"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Ready</div></td>
                <td className="p-4 text-right"><button className="text-slate-400 hover:text-[#0b8252]"><span className="material-symbols-outlined">download</span></button></td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-700">Supplier Lead Time Optimization</td>
                <td className="p-4"><span className="px-2.5 py-1 text-[10px] font-bold bg-[#fef3c7] text-[#d97706] rounded-full">Supplier</span></td>
                <td className="p-4 text-slate-600">Oct 22, 2023 - 11:30 AM</td>
                <td className="p-4"><div className="flex items-center gap-1.5 font-bold text-[#0b8252]"><span className="w-2 h-2 rounded-full bg-[#0b8252] animate-pulse"></span> Processing</div></td>
                <td className="p-4 text-right"><button className="text-slate-300 cursor-not-allowed"><span className="material-symbols-outlined">block</span></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// 2. SALES REPORTS COMPONENT
// --------------------------------------------------------------------------------
function SalesReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => onViewChange('overview')} className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b8252] transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Overview
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Sales Reports</h2>
          <p className="text-slate-500 text-sm mt-1">Analyze performance metrics and revenue streams across periods.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF
          </button>
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Export Excel
          </button>
          <button className="flex items-center gap-2 bg-[#0b8252] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors">
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print Report
          </button>
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex bg-[#f1f5f9] p-1 rounded-lg border border-slate-200 w-fit">
        <button className="px-5 py-1.5 text-sm font-bold text-[#0b8252] bg-white rounded-md shadow-sm">Today</button>
        <button className="px-5 py-1.5 text-sm font-medium text-slate-600 rounded-md hover:text-slate-800">Week</button>
        <button className="px-5 py-1.5 text-sm font-medium text-slate-600 rounded-md hover:text-slate-800">Month</button>
        <button className="px-5 py-1.5 text-sm font-medium text-slate-600 rounded-md hover:text-slate-800">Year</button>
        <button className="px-5 py-1.5 text-sm font-medium text-slate-600 rounded-md flex items-center gap-1 hover:text-slate-800">
          <span className="material-symbols-outlined text-[16px]">calendar_today</span> Custom Range
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <span className="material-symbols-outlined text-[16px]">payments</span>
            <p className="text-xs font-bold uppercase tracking-wider">Total Sales</p>
          </div>
          <h3 className="text-4xl font-bold text-slate-800 tracking-tight">$248,392.50</h3>
          <p className="text-xs font-bold text-[#10b981] mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> +12.5% vs yesterday
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
            <p className="text-xs font-bold uppercase tracking-wider">Total Orders</p>
          </div>
          <h3 className="text-4xl font-bold text-slate-800 tracking-tight">1,842</h3>
          <p className="text-xs font-bold text-[#10b981] mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> +8.2% vs yesterday
          </p>
        </div>

        {/* Top Selling Product */}
        <div className="bg-[#eef8f2] rounded-xl border border-[#bbf7d0] p-6 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[#0b8252] mb-1">
              <span className="material-symbols-outlined text-[16px]">stars</span>
              <p className="text-xs font-bold uppercase tracking-wider">Top Selling Product</p>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 leading-tight">Organic<br/>Avocados</h3>
            <div className="mt-3">
              <p className="text-xs text-slate-600 mb-0.5">412 Units Sold Today</p>
              <p className="text-sm font-bold text-[#0b8252]">Revenue: $1,231.88</p>
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
              <select className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0b8252]/20 focus:border-[#0b8252]">
                <option>All Departments</option>
                <option>Grocery</option>
                <option>Produce</option>
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
              {[
                { name: "Grade A Large Eggs (12pk)", sku: "EG-29384-L", qty: 328, price: "$4.25", rev: "$1,394.00", status: "IN STOCK", icon: "egg", sClass: "bg-[#dcfce7] text-[#16a34a]" },
                { name: "Organic Avocados", sku: "AV-11022-O", qty: 412, price: "$2.99", rev: "$1,231.88", status: "LOW STOCK", icon: "eco", sClass: "bg-[#fee2e2] text-[#ef4444]" },
                { name: "Premium Roasted Coffee 500g", sku: "CF-88392-P", qty: 194, price: "$12.50", rev: "$2,425.00", status: "IN STOCK", icon: "local_cafe", sClass: "bg-[#dcfce7] text-[#16a34a]" },
                { name: "Spring Water 24pk", sku: "WT-77281-S", qty: 582, price: "$5.99", rev: "$3,486.18", status: "IN STOCK", icon: "water_drop", sClass: "bg-[#dcfce7] text-[#16a34a]" },
              ].map((item, i) => (
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
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>Showing 1 to 4 of 128 products</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0b8252] text-white font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 font-medium text-slate-700">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 font-medium text-slate-700">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        
        {/* Hourly Sales Velocity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Hourly Sales Velocity</h3>
          <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 h-[140px] px-2 border-b border-slate-100 pb-2">
            {[40, 75, 50, 95, 80, 45, 25].map((h, i) => (
              <div key={i} className="w-full flex justify-center group relative">
                <div 
                  className={`w-full max-w-[40px] rounded-t-sm transition-all duration-300 group-hover:opacity-80 ${i === 4 ? 'bg-[#0b8252]' : 'bg-[#eef8f2]'}`} 
                  style={{ height: `${h}%` }}
                ></div>
                {/* Tooltip on hover */}
                <span className="absolute -top-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {h * 12} units
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-2 px-2 text-[10px] font-bold text-slate-400">
            <span>08:00</span>
            <span>PEAK</span>
            <span>14:00</span>
          </div>
        </div>

        {/* Data Refresh Pulse */}
        <div className="bg-gradient-to-br from-[#eef8f2] to-[#dcfce7] rounded-xl border border-[#bbf7d0] p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div>
              <h3 className="font-bold text-xl text-slate-800">Data Refresh Pulse</h3>
              <p className="text-sm text-slate-600 mt-1">Real-time sync active with 42 registers.</p>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-white/40 px-4 py-2 rounded-full shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></span>
              <span className="text-xs font-bold text-[#0b8252]">System Online</span>
            </div>
          </div>
          {/* Decorative background circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
        </div>

      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// 3. INVENTORY REPORTS COMPONENT
// --------------------------------------------------------------------------------
function InventoryReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => onViewChange('overview')} className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b8252] transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Overview
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Inventory Reports</h2>
          <p className="text-slate-500 text-sm mt-1">Comprehensive analysis of stock levels and turnover performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#0b8252] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors">
            <span className="material-symbols-outlined text-[18px]">post_add</span>
            Generate Report
          </button>
          <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200">
            <button className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-slate-50 rounded"><span className="material-symbols-outlined text-[18px]">picture_as_pdf</span></button>
            <button className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-slate-50 rounded"><span className="material-symbols-outlined text-[18px]">table_chart</span></button>
            <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded"><span className="material-symbols-outlined text-[18px]">print</span></button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded bg-[#eef8f2] text-[#0b8252] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">category</span>
            </div>
            <span className="text-xs font-bold text-[#10b981]">+2.4%</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Products</p>
            <p className="text-2xl font-bold text-slate-800 leading-none">12,482</p>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-[#d97706] p-5 shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded bg-[#fef3c7] text-[#d97706] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
            <span className="text-xs font-bold text-[#dc2626]">+12 items</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-0.5">Low Stock</p>
            <p className="text-2xl font-bold text-slate-800 leading-none">156</p>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-[#ef4444] p-5 shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded bg-[#fee2e2] text-[#ef4444] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">block</span>
            </div>
            <span className="text-xs font-bold text-[#ef4444]">Critical</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-0.5">Out of Stock</p>
            <p className="text-2xl font-bold text-slate-800 leading-none">24</p>
          </div>
        </div>

        {/* Dead Stock */}
        <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-slate-400 p-5 shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded bg-slate-100 text-slate-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
            <span className="text-xs font-bold text-slate-400">Non-Moving</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-0.5">Dead Stock</p>
            <p className="text-2xl font-bold text-slate-800 leading-none">89</p>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Search by product name or SKU..." 
            className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252]"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Categories</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <div className="relative">
            <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>Stock Status</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">calendar_today</span>
            <select className="appearance-none bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-lg pl-9 pr-10 py-2.5 focus:outline-none focus:border-[#0b8252]">
              <option>Last 30 Days</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reorder Level</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {[
                { name: "Whole Milk 2L", sku: "SKU-10294", cat: "Dairy & Eggs", stock: "1,240 units", reorder: "200 units", sup: "FarmFresh Co.", status: "OK", sClass: "bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0]", icon: "local_drink" },
                { name: "Gala Apples 1kg", sku: "SKU-29384", cat: "Fresh Produce", stock: "45 units", reorder: "50 units", sup: "Global Orchards", status: "LOW", sClass: "bg-[#fef3c7] text-[#d97706] border border-[#fde68a]", stockClass: "text-[#d97706]", icon: "nutrition" },
                { name: "Artisan Sourdough", sku: "SKU-44102", cat: "Bakery", stock: "0 units", reorder: "15 units", sup: "City Bakeshop", status: "OUT", sClass: "bg-[#fee2e2] text-[#ef4444] border border-[#fecaca]", stockClass: "text-[#ef4444]", icon: "bakery_dining" },
                { name: "Ribeye Steak 500g", sku: "SKU-99281", cat: "Butchery", stock: "85 units", reorder: "25 units", sup: "Prime Cuts Ltd.", status: "OK", sClass: "bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0]", icon: "set_meal" },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{item.sku}</p>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{item.cat}</td>
                  <td className={`p-4 font-bold ${item.stockClass || 'text-slate-800'}`}>{item.stock}</td>
                  <td className="p-4 text-slate-600">{item.reorder}</td>
                  <td className="p-4 text-slate-600">{item.sup}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${item.sClass}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>Showing <strong>1</strong> to <strong>10</strong> of <strong>1,240</strong> results</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0b8252] text-white font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 font-medium text-slate-700">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 font-medium text-slate-700">3</button>
            <span className="w-8 h-8 flex items-center justify-center text-slate-400">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 font-medium text-slate-700">124</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Bottom Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        
        {/* Automatic Reordering */}
        <div className="bg-[#eef8f2] rounded-xl border border-[#bbf7d0] p-6 flex gap-4">
          <span className="material-symbols-outlined text-[#0b8252] mt-0.5">info</span>
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">Automatic Reordering</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              StockSense has automatically suggested 14 restock orders based on your current reorder levels.
            </p>
          </div>
        </div>

        {/* Inventory Valuation */}
        <div className="bg-[#dcfce7]/50 rounded-xl border border-[#bbf7d0] p-6 flex gap-4">
          <span className="material-symbols-outlined text-[#10b981] mt-0.5">trending_up</span>
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">Inventory Valuation</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Current total inventory value is estimated at <strong>$142,500.20</strong> (Cost Price basis).
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// 4. SUPPLIER REPORTS COMPONENT
// --------------------------------------------------------------------------------
function SupplierReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => onViewChange('overview')} className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b8252] transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Overview
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Supplier Performance Reports</h2>
          <p className="text-slate-500 text-sm mt-1">Evaluate supplier lead times, fulfillment rates, and delivery quality metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF
          </button>
          <button className="flex items-center gap-2 bg-[#0b8252] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add New Supplier
          </button>
        </div>
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
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">142</h3>
            <p className="text-xs font-bold text-[#10b981] mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +12.5% vs last month
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
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">138</h3>
            <p className="text-xs font-bold text-[#0b8252] mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span> 97.1% Retention rate
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
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">2.4 Days</h3>
            <p className="text-xs font-bold text-[#ef4444] mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +0.3 days lag spike
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
              <button className="px-4 py-1 text-sm font-bold text-slate-800 bg-white rounded-md shadow-sm">All</button>
              <button className="px-4 py-1 text-sm font-medium text-slate-500 hover:text-slate-800 rounded-md">Active</button>
              <button className="px-4 py-1 text-sm font-medium text-slate-500 hover:text-slate-800 rounded-md">Inactive</button>
            </div>
            <button className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Details</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Main Categories</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Supply Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {[
                { 
                  name: "Green Harvest Co.", sku: "SUP-8821", initials: "GH", email: "sarah.lee@harvest.com", phone: "+1 (555) 012-9934", 
                  cats: [{l: "FRESH PRODUCE", c: "bg-[#eef8f2] text-[#0b8252]"}, {l: "ORGANIC", c: "bg-[#f1f5f9] text-slate-600"}],
                  products: 45, pct: 25, date: "Oct 24, 2023", status: "Active", sClass: "bg-[#eef8f2] text-[#0b8252]" 
                },
                { 
                  name: "Dairy Alliance", sku: "SUP-4491", initials: "DA", email: "orders@dairyall.net", phone: "+1 (555) 234-5501", 
                  cats: [{l: "DAIRY", c: "bg-blue-50 text-blue-600"}, {l: "FROZEN", c: "bg-indigo-50 text-indigo-600"}],
                  products: 112, pct: 60, date: "Oct 26, 2023", status: "Active", sClass: "bg-[#eef8f2] text-[#0b8252]" 
                },
                { 
                  name: "Nature's Bake", sku: "SUP-1102", initials: "NB", email: "contact@naturesbake.co", phone: "+1 (555) 901-2211", 
                  cats: [{l: "BAKERY", c: "bg-[#fef3c7] text-[#d97706]"}],
                  products: 18, pct: 10, date: "Sep 12, 2023", status: "Inactive", sClass: "bg-slate-100 text-slate-500" 
                },
                { 
                  name: "Prime Foods Dist.", sku: "SUP-7722", initials: "PF", email: "logistics@primefoods.com", phone: "+1 (555) 773-1010", 
                  cats: [{l: "MEAT & POULTRY", c: "bg-[#fee2e2] text-[#ef4444]"}, {l: "CANNED GOODS", c: "bg-[#ffedd5] text-[#ea580c]"}],
                  products: 240, pct: 90, date: "Oct 27, 2023", status: "Active", sClass: "bg-[#eef8f2] text-[#0b8252]" 
                },
              ].map((item, i) => (
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
                    <div className="flex flex-wrap gap-1.5">
                      {item.cats.map((c, idx) => (
                        <span key={idx} className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${c.c}`}>{c.l}</span>
                      ))}
                    </div>
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
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>Showing <strong>1 - 4</strong> of <strong>142</strong> suppliers</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0b8252] text-white font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 font-medium text-slate-700">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 font-medium text-slate-700">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// 5. ACTIVITY REPORTS COMPONENT
// --------------------------------------------------------------------------------
function ActivityReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => onViewChange('overview')} className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b8252] transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Overview
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Activity Reports</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time audit trail of all inventory updates across the supermarket network.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Export CSV
          </button>
          <button className="flex items-center gap-2 bg-[#0b8252] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Manual Entry
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="relative">
            <select className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Users</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <div className="relative">
            <select className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Actions</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">calendar_today</span>
            <input 
              type="text" 
              value="Oct 24, 2023 - Today" 
              readOnly
              className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#0b8252]"
            />
          </div>
        </div>
        <button className="text-sm font-bold text-slate-400 hover:text-[#0b8252] transition-colors self-end lg:self-auto">Reset Filters</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Total Logs (24h)</p>
          <h3 className="text-2xl font-bold text-slate-800">1,248</h3>
          <p className="text-[10px] font-bold text-[#10b981] mt-1">+12.5% from yesterday</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Waste Recorded</p>
          <h3 className="text-2xl font-bold text-slate-800">42 kg</h3>
          <p className="text-[10px] font-bold text-[#ef4444] mt-1">Alert: Fresh Produce high waste</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Manual Overrides</p>
          <h3 className="text-2xl font-bold text-slate-800">15</h3>
          <p className="text-[10px] font-bold text-[#d97706] mt-1">Requires review by Admin</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Active Managers</p>
          <h3 className="text-2xl font-bold text-slate-800">8</h3>
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
              {[
                { time: "Today, 14:24", date: "Oct 24, 2023", prod: "Organic Eggs (12pk)", sku: "SKU: EG-7721", action: "Stock Added", qty: "+120", user: "Sarah Chen", avatar: "SC", aClass: "bg-[#eef8f2] text-[#0b8252]", qClass: "text-[#10b981]" },
                { time: "Today, 13:10", date: "Oct 24, 2023", prod: "Sparkling Water 500ml", sku: "SKU: DR-0045", action: "Waste Removed", qty: "-14", user: "Alex Rivera", avatar: "AR", aClass: "bg-[#fee2e2] text-[#ef4444]", qClass: "text-[#ef4444]" },
                { time: "Today, 11:45", date: "Oct 24, 2023", prod: "Greek Yogurt 500g", sku: "SKU: DA-1120", action: "Manual Adjustment", qty: "+5", user: "Mike Ross", avatar: "MR", aClass: "bg-slate-100 text-slate-600", qClass: "text-slate-600" },
                { time: "Oct 23, 17:50", date: "Oct 23, 2023", prod: "Aluminum Foil 25m", sku: "SKU: HH-4402", action: "Stock Added", qty: "+50", user: "Sarah Chen", avatar: "SC", aClass: "bg-[#eef8f2] text-[#0b8252]", qClass: "text-[#10b981]" },
              ].map((item, i) => (
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
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
          <p>Showing 1-10 of 482 logs</p>
          <div className="flex gap-1">
            <button className="w-6 h-6 flex items-center justify-center rounded bg-[#0b8252] text-white font-bold text-xs">1</button>
            <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100 font-medium text-slate-700 text-xs">2</button>
            <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100 font-medium text-slate-700 text-xs">3</button>
            <span className="w-6 h-6 flex items-center justify-center text-slate-400 text-xs">...</span>
            <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100 font-medium text-slate-700 text-xs">48</button>
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
              {a: 60, w: 10, d: "Mon"},
              {a: 85, w: 20, d: "Tue"},
              {a: 40, w: 35, d: "Wed"},
              {a: 90, w: 15, d: "Thu"},
              {a: 100, w: 25, d: "Fri"},
              {a: 30, w: 5, d: "Sat"},
              {a: 20, w: 0, d: "Sun"},
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

// --------------------------------------------------------------------------------
// 6. PURCHASE REPORTS COMPONENT
// --------------------------------------------------------------------------------
function PurchaseReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => onViewChange('overview')} className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b8252] transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Overview
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Purchase Records</h2>
          <p className="text-slate-500 text-sm mt-1">Track and monitor supplier purchases and stock inflow.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex bg-white p-1 rounded-lg border border-slate-200">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded text-sm font-bold"><span className="material-symbols-outlined text-[18px]">print</span> Print Report</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded text-sm font-bold border-l border-slate-200"><span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Export PDF</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded text-sm font-bold border-l border-slate-200"><span className="material-symbols-outlined text-[18px]">table_chart</span> Export Excel</button>
          </div>
          <button className="flex items-center gap-2 bg-[#0b8252] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors w-full sm:w-auto">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Purchase Record
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-8 h-8 rounded bg-[#eef8f2] text-[#0b8252] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            </div>
            <span className="text-[10px] font-bold text-[#10b981]">+12% vs last month</span>
          </div>
          <p className="text-xs font-bold text-slate-500 mb-0.5">Total Purchases</p>
          <h3 className="text-2xl font-bold text-slate-800">1,284</h3>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[18px]">inventory</span>
          </div>
          <p className="text-xs font-bold text-slate-500 mb-0.5">Total Items Purchased</p>
          <h3 className="text-2xl font-bold text-slate-800">45,920</h3>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[18px]">storefront</span>
          </div>
          <p className="text-xs font-bold text-slate-500 mb-0.5">Total Suppliers Active</p>
          <h3 className="text-2xl font-bold text-slate-800">142</h3>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-8 h-8 rounded bg-[#fef3c7] text-[#d97706] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          </div>
          <p className="text-xs font-bold text-slate-500 mb-0.5">Pending Deliveries</p>
          <h3 className="text-2xl font-bold text-slate-800">08</h3>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Supplier</label>
          <div className="relative">
            <select className="w-full appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Suppliers</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Category</label>
          <div className="relative">
            <select className="w-full appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Categories</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Date Range</label>
          <div className="relative">
            <select className="w-full appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>Month</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Status</label>
          <div className="relative">
            <select className="w-full appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Statuses</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
        </div>
        <div className="flex gap-3 mt-4 lg:mt-0">
          <button className="px-5 py-2 bg-[#0b8252] text-white font-bold text-sm rounded-lg shadow-sm hover:bg-[#096b43] transition-colors">Apply Filters</button>
          <button className="px-5 py-2 text-[#0b8252] font-bold text-sm hover:underline">Reset</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Area: Table & Charts */}
        <div className="lg:col-span-2 space-y-6">
          
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
                  {[
                    { ref: "PR-00881", date: "Oct 24 2023", sup: "Green Harvest Co.", prod: "Organic Milk 1L", qty: "200 units", price: "$1.20", total: "$240.00", status: "RECEIVED", sClass: "bg-[#eef8f2] text-[#0b8252]" },
                    { ref: "PR-00882", date: "Oct 25 2023", sup: "Fresh Dairy Inc.", prod: "Cheddar Cheese 200g", qty: "50 units", price: "$4.50", total: "$225.00", status: "PENDING", sClass: "bg-[#fef3c7] text-[#d97706]" },
                    { ref: "PR-00883", date: "Oct 25 2023", sup: "Global Grains Ltd.", prod: "Whole Wheat Bread", qty: "100 units", price: "$2.10", total: "$210.00", status: "PARTIAL", sClass: "bg-[#fee2e2] text-[#ef4444]" },
                    { ref: "PR-00884", date: "Oct 25 2023", sup: "Orchard Valley", prod: "Red Apples (Box)", qty: "15 units", price: "$30.00", total: "$450.00", status: "RECEIVED", sClass: "bg-[#eef8f2] text-[#0b8252]" },
                    { ref: "PR-00885", date: "Oct 26 2023", sup: "Beverage Prox", prod: "Sparkling Water 500ml", qty: "500 units", price: "$0.45", total: "$225.00", status: "PENDING", sClass: "bg-[#fef3c7] text-[#d97706]" },
                  ].map((item, i) => (
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
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
              <p>Showing 1-10 of 1,284 results</p>
              <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0b8252] text-white font-bold">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 font-medium text-slate-700">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 font-medium text-slate-700">3</button>
                <span className="w-8 h-8 flex items-center justify-center text-slate-400">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 font-medium text-slate-700">128</button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
              </div>
            </div>
          </div>

          {/* Bottom Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Monthly Spend Analysis */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-[280px]">
              <h3 className="font-bold text-slate-800 mb-6">Monthly Spend Analysis</h3>
              <div className="flex-1 flex items-end justify-between px-2 gap-4">
                {[
                  {h: 30, l: "Jun", a: false},
                  {h: 45, l: "Jul", a: false},
                  {h: 35, l: "Aug", a: false},
                  {h: 65, l: "Sep", a: false},
                  {h: 90, l: "Oct", a: true},
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 w-full h-full justify-end">
                    <div className={`w-full max-w-[40px] rounded-t ${bar.a ? 'bg-[#0b8252]' : 'bg-[#eef8f2]'}`} style={{ height: `${bar.h}%` }}></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{bar.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supplier Reliability */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-[280px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Supplier Reliability</h3>
                <span className="material-symbols-outlined text-[#0b8252]">verified</span>
              </div>
              
              <div className="space-y-5 flex-1">
                {[
                  {n: "Green Harvest Co.", p: 98, c: "bg-[#0b8252]"},
                  {n: "Fresh Dairy Inc.", p: 92, c: "bg-[#0b8252]"},
                  {n: "Global Grains Ltd.", p: 85, c: "bg-[#d97706]"},
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-700">{s.n}</span>
                      <span className="text-slate-800">{s.p}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${s.c} rounded-full`} style={{ width: `${s.p}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 italic mt-4">Efficiency based on delivery timeliness and order accuracy.</p>
            </div>

          </div>

        </div>

        {/* Right Area: Log & Contact */}
        <div className="space-y-6">
          
          {/* History Log */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">history</span> History Log
            </h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100 mb-6">
              {[
                { i: "check_circle", c: "text-[#10b981] bg-white", title: "PR-00881 Marked as Received", sub: "By Alex Rivera", time: "10 mins ago" },
                { i: "add_circle", c: "text-[#0b8252] bg-white", title: "New Record Created: PR-00885", sub: "Beverage Prox Order", time: "1 hour ago" },
                { i: "edit", c: "text-[#d97706] bg-white", title: "PR-00883 Updated to Partial", sub: "Shortage noted in whole wheat bread", time: "2 hours ago" },
                { i: "download", c: "text-slate-400 bg-white", title: "Report Exported", sub: "Monthly Purchase Summary (PDF)", time: "Yesterday" },
              ].map((log, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  <div className={`absolute left-0 w-5 h-5 flex items-center justify-center rounded-full z-10 bg-white`}>
                    <span className={`material-symbols-outlined text-[20px] ${log.c}`}>{log.i}</span>
                  </div>
                  <div className="ml-8 pt-0.5">
                    <p className="font-bold text-sm text-slate-800 leading-tight">{log.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{log.sub}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full text-center text-sm font-bold text-slate-600 border border-slate-200 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              View All Activity
            </button>
          </div>

          {/* Contact Box */}
          <div className="bg-[#0b8252] rounded-xl shadow-md p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-[#eef8f2] uppercase tracking-wider mb-2">SUPPLIERS</p>
              <h3 className="text-xl font-bold mb-4 leading-tight">Need to Contact a Supplier?</h3>
              <p className="text-xs text-[#dcfce7] mb-6 leading-relaxed">
                Access the full directory of verified partners and logistics providers.
              </p>
              <button className="bg-white text-[#0b8252] font-bold text-sm px-6 py-2.5 rounded-lg shadow-sm hover:bg-[#f8f9fa] transition-colors">
                Open Directory
              </button>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-white opacity-10 pointer-events-none">
              contact_phone
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}

// --------------------------------------------------------------------------------
// 7. ALERT REPORTS COMPONENT
// --------------------------------------------------------------------------------
function AlertReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => onViewChange('overview')} className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b8252] transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Overview
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Alert Reports</h2>
          <p className="text-slate-500 text-sm mt-1">Summarize low stock incidents, expired products, and critical shelf warnings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Export CSV
          </button>
          <button className="flex items-center gap-2 bg-[#0b8252] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Manual Entry
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="relative">
            <select className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Users</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <div className="relative">
            <select className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Actions</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">calendar_today</span>
            <input 
              type="text" 
              value="Oct 24, 2023 - Today" 
              readOnly
              className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#0b8252]"
            />
          </div>
        </div>
        <button className="text-sm font-bold text-slate-400 hover:text-[#0b8252] transition-colors self-end lg:self-auto">Reset Filters</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Total Logs (24h)</p>
          <h3 className="text-2xl font-bold text-slate-800">1,248</h3>
          <p className="text-[10px] font-bold text-[#10b981] mt-1">+12.5% from yesterday</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Waste Recorded</p>
          <h3 className="text-2xl font-bold text-slate-800">42 kg</h3>
          <p className="text-[10px] font-bold text-[#ef4444] mt-1">Alert: Fresh Produce high waste</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Manual Overrides</p>
          <h3 className="text-2xl font-bold text-slate-800">15</h3>
          <p className="text-[10px] font-bold text-[#d97706] mt-1">Requires review by Admin</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Active Managers</p>
          <h3 className="text-2xl font-bold text-slate-800">8</h3>
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
              {[
                { time: "Today, 14:24", date: "Oct 24, 2023", prod: "Organic Eggs (12pk)", sku: "SKU: EG-7721", action: "Stock Added", qty: "+120", user: "Sarah Chen", avatar: "SC", aClass: "bg-[#eef8f2] text-[#0b8252]", qClass: "text-[#10b981]" },
                { time: "Today, 13:10", date: "Oct 24, 2023", prod: "Sparkling Water 500ml", sku: "SKU: DR-0045", action: "Waste Removed", qty: "-14", user: "Alex Rivera", avatar: "AR", aClass: "bg-[#fee2e2] text-[#ef4444]", qClass: "text-[#ef4444]" },
                { time: "Today, 11:45", date: "Oct 24, 2023", prod: "Greek Yogurt 500g", sku: "SKU: DA-1120", action: "Manual Adjustment", qty: "+5", user: "Mike Ross", avatar: "MR", aClass: "bg-slate-100 text-slate-600", qClass: "text-slate-600" },
                { time: "Oct 23, 17:50", date: "Oct 23, 2023", prod: "Aluminum Foil 25m", sku: "SKU: HH-4402", action: "Stock Added", qty: "+50", user: "Sarah Chen", avatar: "SC", aClass: "bg-[#eef8f2] text-[#0b8252]", qClass: "text-[#10b981]" },
              ].map((item, i) => (
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
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
          <p>Showing 1-10 of 482 logs</p>
          <div className="flex gap-1">
            <button className="w-6 h-6 flex items-center justify-center rounded bg-[#0b8252] text-white font-bold text-xs">1</button>
            <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100 font-medium text-slate-700 text-xs">2</button>
            <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100 font-medium text-slate-700 text-xs">3</button>
            <span className="w-6 h-6 flex items-center justify-center text-slate-400 text-xs">...</span>
            <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100 font-medium text-slate-700 text-xs">48</button>
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
              {a: 60, w: 10, d: "Mon"},
              {a: 85, w: 20, d: "Tue"},
              {a: 40, w: 35, d: "Wed"},
              {a: 90, w: 15, d: "Thu"},
              {a: 100, w: 25, d: "Fri"},
              {a: 30, w: 5, d: "Sat"},
              {a: 20, w: 0, d: "Sun"},
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
          <h3 className="font-bold text-lg text-slate-800 mb-6">Live Activity Alerts</h3>
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
