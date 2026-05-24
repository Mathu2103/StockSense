import React from 'react';
import Sidebar from './Sidebar';
import InventoryHeader from './InventoryHeader';

export default function StockMovements() {
  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <InventoryHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#f8f9fa]">
          <div className="max-w-[1400px] w-full mx-auto p-6 md:p-8 space-y-6">
            
            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Stock Movement History</h2>
                <p className="text-slate-500 text-sm mt-1">Comprehensive audit trail of all inventory transactions</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded text-sm font-bold">
                    <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded text-sm font-bold border-l border-slate-200">
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Export PDF
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded text-sm font-bold border-l border-slate-200">
                    <span className="material-symbols-outlined text-[18px]">print</span> Print
                  </button>
                </div>
                <button className="flex items-center gap-2 bg-[#0b8252] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors w-full sm:w-auto">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  New Manual Adjustment
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                </div>
                <p className="text-xs font-bold text-slate-500 mb-0.5">Total Movements</p>
                <div className="flex items-end justify-between mt-1">
                  <h3 className="text-2xl font-bold text-slate-800">12,482</h3>
                  <span className="text-[11px] font-bold text-[#10b981] flex items-center">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> +8.2% vs last month
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="w-8 h-8 rounded bg-[#eef8f2] text-[#0b8252] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
                <p className="text-xs font-bold text-slate-500 mb-0.5">Net Value Change</p>
                <div className="flex flex-col mt-1">
                  <h3 className="text-2xl font-bold text-slate-800">+$45,210.00</h3>
                  <span className="text-[11px] font-medium text-slate-400 mt-1">Based on current stock levels</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="w-8 h-8 rounded bg-[#fef3c7] text-[#d97706] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[18px]">restaurant</span>
                </div>
                <p className="text-xs font-bold text-slate-500 mb-0.5">Most Active Category</p>
                <div className="flex flex-col mt-1">
                  <h3 className="text-2xl font-bold text-slate-800">Fresh Produce</h3>
                  <span className="text-[11px] font-medium text-slate-400 mt-1">32% of total volume</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </div>
                <p className="text-xs font-bold text-slate-500 mb-0.5">Peak Activity Time</p>
                <div className="flex flex-col mt-1">
                  <h3 className="text-2xl font-bold text-slate-800">06:00 - 09:00</h3>
                  <span className="text-[11px] font-medium text-slate-400 mt-1">Morning deliveries window</span>
                </div>
              </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Search Products</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">qr_code_scanner</span>
                  <input type="text" placeholder="SKU, Name or Ref..." className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#0b8252]" />
                </div>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Date Range</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>This Month</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Movement Type</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
                    <option>All Types</option>
                    <option>Purchase In</option>
                    <option>Sale Out</option>
                    <option>Adjustment</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Warehouse</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
                    <option>Main Hub</option>
                    <option>Store A</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>
              <div className="flex mt-4 lg:mt-0">
                <button className="px-6 py-2 bg-[#eef8f2] text-[#0b8252] font-bold text-sm rounded-lg shadow-sm hover:bg-[#dcfce7] transition-colors whitespace-nowrap">Apply Filters</button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-[#f8f9fa]">
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Cost</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Performed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {[
                      { 
                        date: "Oct 24, 2023", time: "08:15 AM",
                        prodName: "Fresh Organic Milk 1L", sku: "SKU-MK-8821", icon: "water_drop", iconColor: "text-blue-500", iconBg: "bg-blue-50",
                        cat: "Dairy",
                        type: "PURCHASE IN", typeClass: "bg-[#eef8f2] text-[#0b8252]",
                        qty: "+24", qtyClass: "text-[#10b981] font-bold",
                        cost: "$1.20",
                        ref: "PO-8821",
                        user: "Alex Rivera", avatar: "AR", avatarColor: "bg-blue-100 text-blue-700", isSys: false
                      },
                      { 
                        date: "Oct 24, 2023", time: "10:42 AM",
                        prodName: "Avocado (Pack of 3)", sku: "SKU-PR-4491", icon: "eco", iconColor: "text-green-600", iconBg: "bg-green-50",
                        cat: "Produce",
                        type: "SALE OUT", typeClass: "bg-[#fee2e2] text-[#ef4444]",
                        qty: "-2", qtyClass: "text-[#ef4444] font-bold",
                        cost: "$4.50",
                        ref: "INV-44910",
                        user: "POS-Terminal-04", avatar: "point_of_sale", avatarColor: "text-slate-500", isSys: true
                      },
                      { 
                        date: "Oct 23, 2023", time: "04:30 PM",
                        prodName: "Cheddar Cheese 200g", sku: "SKU-CH-5581", icon: "lunch_dining", iconColor: "text-orange-500", iconBg: "bg-orange-50",
                        cat: "Dairy",
                        type: "DAMAGE OUT", typeClass: "bg-slate-100 text-slate-600",
                        qty: "-5", qtyClass: "text-[#ef4444] font-bold",
                        cost: "$3.50",
                        ref: "ADJ-5581",
                        user: "Jane Doe (Whse)", avatar: "JD", avatarColor: "bg-slate-200 text-slate-700", isSys: false
                      },
                      { 
                        date: "Oct 23, 2023", time: "01:15 PM",
                        prodName: "Apple Gala (Bag 1kg)", sku: "SKU-PR-3321", icon: "nutrition", iconColor: "text-red-500", iconBg: "bg-red-50",
                        cat: "Produce",
                        type: "RETURN", typeClass: "bg-blue-50 text-blue-600",
                        qty: "+1", qtyClass: "text-[#10b981] font-bold",
                        cost: "$2.99",
                        ref: "RTN-9981",
                        user: "Service Desk", avatar: "headset_mic", avatarColor: "text-slate-500", isSys: true
                      },
                      { 
                        date: "Oct 23, 2023", time: "11:05 AM",
                        prodName: "Spaghetti 500g", sku: "SKU-DR-7712", icon: "restaurant", iconColor: "text-amber-600", iconBg: "bg-amber-50",
                        cat: "Dry Goods",
                        type: "ADJUSTMENT", typeClass: "bg-orange-50 text-orange-600",
                        qty: "+10", qtyClass: "text-[#10b981] font-bold",
                        cost: "$1.10",
                        ref: "ADJ-2281",
                        user: "Mark Kim", avatar: "MK", avatarColor: "bg-orange-100 text-orange-700", isSys: false
                      },
                    ].map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-slate-600 text-xs w-32">
                          <div className="font-medium">{item.date}</div>
                          <div className="text-slate-400 mt-0.5">{item.time}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.iconBg}`}>
                              <span className={`material-symbols-outlined ${item.iconColor}`}>{item.icon}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{item.prodName}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{item.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 font-medium">{item.cat}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${item.typeClass}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className={`p-4 ${item.qtyClass}`}>{item.qty}</td>
                        <td className="p-4 text-slate-600 font-medium">{item.cost}</td>
                        <td className="p-4 text-slate-500 font-medium text-xs">{item.ref}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {item.isSys ? (
                              <div className="w-6 h-6 flex items-center justify-center">
                                <span className={`material-symbols-outlined text-[16px] ${item.avatarColor}`}>{item.avatar}</span>
                              </div>
                            ) : (
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${item.avatarColor}`}>
                                {item.avatar}
                              </div>
                            )}
                            <span className="text-sm text-slate-700">{item.user}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500 gap-4">
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer">
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                </div>
                <div>1-25 of 12,482 items</div>
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-50" disabled><span className="material-symbols-outlined text-[18px]">first_page</span></button>
                  <button className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-50" disabled><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                  
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0b8252] text-white font-bold">1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 font-medium text-slate-700">2</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 font-medium text-slate-700">3</button>
                  <span className="w-8 h-8 flex items-center justify-center text-slate-400">...</span>
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 font-medium text-slate-700">499</button>
                  
                  <button className="w-8 h-8 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
                  <button className="w-8 h-8 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100"><span className="material-symbols-outlined text-[18px]">last_page</span></button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
