import { useState } from 'react';
import Sidebar from './Components/Sidebar';
import InventoryHeader from './Components/InventoryHeader';

// --------------------------------------------------------------------------------
// TAB 1: PURCHASE ORDERS (Comprehensive Dashboard)
// --------------------------------------------------------------------------------
function PurchaseOrdersTab() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Purchase Orders</h2>
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
                    { ref: "PR-00881", date: "Oct 24 2023", sup: "Green Harvest Co.", prod: "Organic Milk 1L", qty: "200 units", price: "Rs. 450.00", total: "Rs. 90,000.00", status: "RECEIVED", sClass: "bg-[#eef8f2] text-[#0b8252]" },
                    { ref: "PR-00882", date: "Oct 25 2023", sup: "Fresh Dairy Inc.", prod: "Cheddar Cheese 200g", qty: "50 units", price: "Rs. 950.00", total: "Rs. 47,500.00", status: "PENDING", sClass: "bg-[#fef3c7] text-[#d97706]" },
                    { ref: "PR-00883", date: "Oct 25 2023", sup: "Global Grains Ltd.", prod: "Whole Wheat Bread", qty: "100 units", price: "Rs. 220.00", total: "Rs. 22,000.00", status: "PARTIAL", sClass: "bg-[#fee2e2] text-[#ef4444]" },
                    { ref: "PR-00884", date: "Oct 25 2023", sup: "Orchard Valley", prod: "Red Apples (Box)", qty: "15 units", price: "Rs. 8,500.00", total: "Rs. 127,500.00", status: "RECEIVED", sClass: "bg-[#eef8f2] text-[#0b8252]" },
                    { ref: "PR-00885", date: "Oct 26 2023", sup: "Beverage Prox", prod: "Sparkling Water 500ml", qty: "500 units", price: "Rs. 180.00", total: "Rs. 90,000.00", status: "PENDING", sClass: "bg-[#fef3c7] text-[#d97706]" },
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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-[280px]">
              <h3 className="font-bold text-slate-800 mb-6">Monthly Spend Analysis</h3>
              <div className="flex-1 flex items-end justify-between px-2 gap-4">
                {[
                  { h: 30, l: "Jun", a: false },
                  { h: 45, l: "Jul", a: false },
                  { h: 35, l: "Aug", a: false },
                  { h: 65, l: "Sep", a: false },
                  { h: 90, l: "Oct", a: true },
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 w-full h-full justify-end">
                    <div className={`w-full max-w-[40px] rounded-t ${bar.a ? 'bg-[#0b8252]' : 'bg-[#eef8f2]'}`} style={{ height: `${bar.h}%` }}></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{bar.l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-[280px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Supplier Reliability</h3>
                <span className="material-symbols-outlined text-[#0b8252]">verified</span>
              </div>

              <div className="space-y-5 flex-1">
                {[
                  { n: "Green Harvest Co.", p: 98, c: "bg-[#0b8252]" },
                  { n: "Fresh Dairy Inc.", p: 92, c: "bg-[#0b8252]" },
                  { n: "Global Grains Ltd.", p: 85, c: "bg-[#d97706]" },
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
// TAB 2: PURCHASE RECEIVES (Simple Log Table)
// --------------------------------------------------------------------------------
function PurchaseReceivesTab() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Purchase Receives</h2>
          <p className="text-slate-500 text-sm mt-1">Manage and track inventory procurement arrivals.</p>
        </div>
        <div>
          <button className="flex items-center gap-2 bg-[#0b8252] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors w-full sm:w-auto">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Receive Record
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-[#f8f9fa]">
                <th className="p-4 text-xs font-bold text-slate-500">Date</th>
                <th className="p-4 text-xs font-bold text-slate-500">Supplier</th>
                <th className="p-4 text-xs font-bold text-slate-500">Product</th>
                <th className="p-4 text-xs font-bold text-slate-500">Quantity</th>
                <th className="p-4 text-xs font-bold text-slate-500">Total Amount</th>
                <th className="p-4 text-xs font-bold text-slate-500 text-center">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {[
                { date: "Oct 12, 2023", sup: "Fresh Farms Ltd.", prod: "Organic Cavendish Bananas", qty: "500 kg", total: "$1,250.00", status: "Delivered", sClass: "bg-[#eef8f2] text-[#0b8252]" },
                { date: "Oct 14, 2023", sup: "Dairy Co-op", prod: "Whole Milk 1L (Case of 12)", qty: "100 Cases", total: "$2,400.00", status: "Pending", sClass: "bg-[#fef3c7] text-[#d97706]" },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-700 font-medium">{item.date.replace(" ", "\n")}</td>
                  <td className="p-4 text-slate-700 font-bold">{item.sup}</td>
                  <td className="p-4 text-slate-600">{item.prod}</td>
                  <td className="p-4 text-slate-800 font-medium">{item.qty}</td>
                  <td className="p-4 text-slate-800 font-bold">{item.total}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${item.sClass}`}>{item.status}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-[#0b8252] hover:bg-[#eef8f2] w-8 h-8 rounded-full transition-colors flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// MAIN EXPORT COMPONENT
// --------------------------------------------------------------------------------
export default function PurchaseRecords() {
  const [activeTab, setActiveTab] = useState<'orders' | 'receives'>('orders');

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <InventoryHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#f8f9fa]">
          <div className="max-w-[1400px] w-full mx-auto p-6 md:p-8 space-y-6">

            {/* Tabs Navigation */}
            <div className="flex space-x-1 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors duration-200 ${activeTab === 'orders'
                  ? 'border-[#0b8252] text-[#0b8252]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
              >
                Purchase Orders
              </button>
              <button
                onClick={() => setActiveTab('receives')}
                className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors duration-200 ${activeTab === 'receives'
                  ? 'border-[#0b8252] text-[#0b8252]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
              >
                Purchase Receives
              </button>
            </div>

            {/* Tab Content Rendering */}
            <div className="mt-6">
              {activeTab === 'orders' && <PurchaseOrdersTab />}
              {activeTab === 'receives' && <PurchaseReceivesTab />}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
