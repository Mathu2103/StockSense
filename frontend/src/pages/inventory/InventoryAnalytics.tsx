import { Link } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import InventoryHeader from './Components/InventoryHeader';

export default function InventoryAnalytics() {
  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InventoryHeader />

        <main className="flex-1 overflow-y-auto px-6 py-6 bg-[#f8f9fa]">
          <div className="max-w-[1400px] w-full mx-auto space-y-6">

            {/* Top Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Inventory Analytics</h1>
                <p className="text-slate-500 text-sm mt-1">Real-time logistics performance and movement metrics.</p>
              </div>
              <div className="flex bg-[#f1f5f9] p-1 rounded-lg border border-slate-200">
                <button className="px-4 py-1.5 text-sm font-medium text-slate-600 rounded-md hover:text-slate-800">Today</button>
                <button className="px-4 py-1.5 text-sm font-medium text-slate-600 rounded-md hover:text-slate-800">Week</button>
                <button className="px-4 py-1.5 text-sm font-bold text-[#0b8252] bg-white rounded-md shadow-sm">Month</button>
                <button className="px-4 py-1.5 text-sm font-medium text-slate-600 rounded-md hover:text-slate-800">Year</button>
                <button className="px-4 py-1.5 text-sm font-medium text-slate-600 rounded-md flex items-center gap-1 hover:text-slate-800">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span> Custom
                </button>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Total Products */}
              <Link to="/manage-products?tab=products" className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between h-[110px] hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded bg-[#eef8f2] text-[#0b8252] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                  </div>
                  <span className="text-xs font-bold text-[#10b981]">+12%</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Products</p>
                  <p className="text-xl font-bold text-slate-800 leading-none">12,482</p>
                </div>
              </Link>

              {/* Categories */}
              <Link to="/manage-products?tab=categories" className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between h-[110px] hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded bg-[#f1f5f9] text-[#64748b] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">category</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Static</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Categories</p>
                  <p className="text-xl font-bold text-slate-800 leading-none">48</p>
                </div>
              </Link>

              {/* Low Stock */}
              <Link to="/alerts" className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-[#d97706] p-4 shadow-sm flex flex-col justify-between h-[110px] hover:border-[#d97706]/40 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded bg-[#fef3c7] text-[#d97706] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                  </div>
                  <span className="text-xs font-bold text-[#dc2626]">Critical</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-0.5">Low Stock</p>
                  <p className="text-xl font-bold text-[#92400e] leading-none">142</p>
                </div>
              </Link>

              {/* Out of Stock */}
              <Link to="/alerts" className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-[#ef4444] p-4 shadow-sm flex flex-col justify-between h-[110px] hover:border-[#ef4444]/40 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded bg-[#fee2e2] text-[#ef4444] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                  </div>
                  <span className="text-xs font-bold text-[#ef4444]">-5%</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-0.5">Out of Stock</p>
                  <p className="text-xl font-bold text-[#b91c1c] leading-none">24</p>
                </div>
              </Link>

              {/* Expired */}
              <Link to="/alerts" className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-[#b45309] p-4 shadow-sm flex flex-col justify-between h-[110px] hover:border-[#b45309]/40 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded bg-[#fef3c7] text-[#92400e] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">event_busy</span>
                  </div>
                  <span className="text-xs font-bold text-[#92400e]">Expiring</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-0.5">Expired</p>
                  <p className="text-xl font-bold text-slate-800 leading-none">18</p>
                </div>
              </Link>

              {/* Suppliers */}
              <Link to="/suppliers" className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between h-[110px] hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded bg-[#dcfce7] text-[#10b981] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  </div>
                  <span className="text-xs font-bold text-[#10b981]">+2</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Suppliers</p>
                  <p className="text-xl font-bold text-slate-800 leading-none">115</p>
                </div>
              </Link>
            </div>

            {/* Middle Row: Chart & AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stock Movement Analytics */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-2 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Stock Movement Analytics</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Volume of units moving in and out of the warehouse</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0b8252]"></span> Stock IN
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> Stock OUT
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative w-full min-h-[220px]">
                  <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
                    <line x1="0" y1="40" x2="100" y2="40" stroke="#f1f5f9" strokeWidth="0.5" />
                    <line x1="0" y1="60" x2="100" y2="60" stroke="#f1f5f9" strokeWidth="0.5" />
                    <line x1="0" y1="80" x2="100" y2="80" stroke="#f1f5f9" strokeWidth="0.5" />
                    <line x1="0" y1="100" x2="100" y2="100" stroke="#e2e8f0" strokeWidth="1" />
                  </svg>
                  <div className="absolute inset-x-0 bottom-[-20px] flex justify-between text-[10px] font-bold text-slate-400 px-2">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>
              </div>

              {/* AI Stock Insights */}
              <div className="bg-[#0b8252] rounded-xl shadow-md p-6 flex flex-col text-white">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  <h3 className="font-bold text-lg">AI Stock Insights</h3>
                </div>

                <div className="space-y-4 flex-1">
                  {/* Insight 1 */}
                  <div className="bg-[#046c4e] rounded-lg p-4 border border-white/20">
                    <p className="text-[10px] font-bold text-[#eef8f2] uppercase tracking-wider mb-1">FAST-MOVING</p>
                    <h4 className="font-bold text-white text-sm mb-1">Oat Milk 1L - Ultra</h4>
                    <p className="text-xs text-[#dcfce7] leading-snug">Stock out likely in 3 days.<br />Demand surge in West Region.</p>
                  </div>

                  {/* Insight 2 */}
                  <div className="bg-[#046c4e] rounded-lg p-4 border border-white/20">
                    <p className="text-[10px] font-bold text-[#eef8f2] uppercase tracking-wider mb-1">SLOW-MOVING</p>
                    <h4 className="font-bold text-white text-sm mb-1">Gourmet Truffle Oil</h4>
                    <p className="text-xs text-[#dcfce7] leading-snug">Zero movement in 14 days.<br />Suggest 15% discount.</p>
                  </div>
                </div>

                <button className="w-full mt-6 bg-[#eef8f2] text-[#0b8252] font-bold py-3 rounded-lg text-sm hover:bg-white transition-colors shadow-sm">
                  Apply Restock Recommendations
                </button>
              </div>
            </div>

            {/* Bottom Row 1: Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Selling Products */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-slate-800">Top Selling Products</h3>
                  <button className="text-sm font-bold text-[#0b8252] hover:underline">View Full Report</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Sold Qty</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Revenue</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      <tr>
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#eef8f2] flex items-center justify-center text-[#0b8252]">
                            <span className="material-symbols-outlined">water_bottle</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">Oat Milk 1L</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 uppercase">SKU: GRO-882-OM</p>
                          </div>
                        </td>
                        <td className="p-4 text-center font-medium text-slate-700">2,410</td>
                        <td className="p-4 text-right font-bold text-slate-800">$11,809</td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-1 text-[10px] font-bold bg-[#dcfce7] text-[#16a34a] rounded-full">Healthy</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#eef8f2] flex items-center justify-center text-[#0b8252]">
                            <span className="material-symbols-outlined">water_drop</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">Sparkling Water</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 uppercase">SKU: BEV-102-SW</p>
                          </div>
                        </td>
                        <td className="p-4 text-center font-medium text-slate-700">1,902</td>
                        <td className="p-4 text-right font-bold text-slate-800">$4,755</td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-1 text-[10px] font-bold bg-[#fef3c7] text-[#d97706] rounded-full flex flex-col leading-none"><span>Low</span><span>Stock</span></span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#fef3c7] flex items-center justify-center text-[#d97706]">
                            <span className="material-symbols-outlined">bakery_dining</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">Whole Grain Bread</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 uppercase">SKU: BAK-551-WG</p>
                          </div>
                        </td>
                        <td className="p-4 text-center font-medium text-slate-700">1,650</td>
                        <td className="p-4 text-right font-bold text-slate-800">$3,300</td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-1 text-[10px] font-bold bg-[#dcfce7] text-[#16a34a] rounded-full">Healthy</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Suppliers */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Top Suppliers</h3>
                    <span className="material-symbols-outlined text-slate-400">filter_list</span>
                  </div>
                  <div className="p-6 space-y-5">
                    {/* Supplier 1 */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>FreshFarms Logistics</span>
                        <span>$142,000</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-[#0b8252] h-2 rounded-full w-[100%]"></div>
                      </div>
                    </div>
                    {/* Supplier 2 */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Global Dairy Co.</span>
                        <span>$98,400</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-[#0b8252] h-2 rounded-full w-[75%]"></div>
                      </div>
                    </div>
                    {/* Supplier 3 */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Organic Greens Ltd.</span>
                        <span>$74,200</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-[#0b8252] h-2 rounded-full w-[55%]"></div>
                      </div>
                    </div>
                    {/* Supplier 4 */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Elite Beverages</span>
                        <span>$32,100</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-[#0b8252] h-2 rounded-full w-[25%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="border-t border-slate-100 p-4 grid grid-cols-3 divide-x divide-slate-100">
                  <div className="text-center px-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Orders</p>
                    <p className="text-xl font-bold text-slate-800">842</p>
                  </div>
                  <div className="text-center px-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ontime %</p>
                    <p className="text-xl font-bold text-[#10b981]">98.2%</p>
                  </div>
                  <div className="text-center px-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Claims</p>
                    <p className="text-xl font-bold text-[#ef4444]">4</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row 2: Category Performance */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-lg text-slate-800 mb-6">Category Performance (Movement In/Out)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Grocery */}
                <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-5 flex flex-col justify-between h-[180px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#0b8252] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">restaurant</span>
                    </div>
                    <span className="font-bold text-sm text-slate-800">Grocery</span>
                  </div>
                  <div className="flex items-end justify-center gap-2 flex-1 mb-4 border-b border-slate-200 pb-2">
                    <div className="w-10 bg-[#0b8252] rounded-t-sm h-[80%]"></div>
                    <div className="w-10 bg-[#69e3a6] rounded-t-sm h-[50%]"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Turnover</span>
                    <span className="font-bold text-slate-800 text-sm">4.2x</span>
                  </div>
                </div>

                {/* Dairy */}
                <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-5 flex flex-col justify-between h-[180px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#065f46] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">egg</span>
                    </div>
                    <span className="font-bold text-sm text-slate-800">Dairy</span>
                  </div>
                  <div className="flex items-end justify-center gap-2 flex-1 mb-4 border-b border-slate-200 pb-2">
                    <div className="w-10 bg-[#0b8252] rounded-t-sm h-[100%]"></div>
                    <div className="w-10 bg-[#69e3a6] rounded-t-sm h-[90%]"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Turnover</span>
                    <span className="font-bold text-slate-800 text-sm">12.5x</span>
                  </div>
                </div>

                {/* Snacks */}
                <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-5 flex flex-col justify-between h-[180px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#92400e] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">cookie</span>
                    </div>
                    <span className="font-bold text-sm text-slate-800">Snacks</span>
                  </div>
                  <div className="flex items-end justify-center gap-2 flex-1 mb-4 border-b border-slate-200 pb-2">
                    <div className="w-10 bg-[#0b8252] rounded-t-sm h-[40%]"></div>
                    <div className="w-10 bg-[#69e3a6] rounded-t-sm h-[35%]"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Turnover</span>
                    <span className="font-bold text-slate-800 text-sm">2.1x</span>
                  </div>
                </div>

                {/* Beverages */}
                <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-5 flex flex-col justify-between h-[180px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#0b8252] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">local_drink</span>
                    </div>
                    <span className="font-bold text-sm text-slate-800">Beverages</span>
                  </div>
                  <div className="flex items-end justify-center gap-2 flex-1 mb-4 border-b border-slate-200 pb-2">
                    <div className="w-10 bg-[#0b8252] rounded-t-sm h-[60%]"></div>
                    <div className="w-10 bg-[#69e3a6] rounded-t-sm h-[55%]"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Turnover</span>
                    <span className="font-bold text-slate-800 text-sm">5.8x</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
