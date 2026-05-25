import Sidebar from './Components/Sidebar';
import { Link } from 'react-router-dom';
import InventoryHeader from './Components/InventoryHeader';

export default function InventoryPage() {
  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <InventoryHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa]">
          <div className="max-w-[1400px] mx-auto space-y-6">

            {/* Title & Actions Row */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Inventory Overview</h1>
                <p className="text-slate-500 text-sm mt-1">Real-time status of your supermarket stock levels.</p>
              </div>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm">
                Custom Duration
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Total Products */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#eef8f2] text-[#0b8252] flex items-center justify-center">
                    <span className="material-symbols-outlined">inventory_2</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-[#eef8f2] text-[#0b8252] rounded-full">+12%</span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Products</p>
                  <p className="text-2xl font-bold text-slate-800 leading-none">12,482</p>
                </div>
              </div>

              {/* Low Stock */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#fff4ed] text-[#d97706] flex items-center justify-center">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-[#fff4ed] text-[#d97706] rounded-full">Alert</span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Low Stock</p>
                  <p className="text-2xl font-bold text-slate-800 leading-none">84 Items</p>
                </div>
              </div>

              {/* Out of Stock */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#fef2f2] text-[#dc2626] flex items-center justify-center">
                    <span className="material-symbols-outlined">block</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-[#fef2f2] text-[#dc2626] rounded-full">Critical</span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Out of Stock</p>
                  <p className="text-2xl font-bold text-slate-800 leading-none">12 Items</p>
                </div>
              </div>

              {/* Inventory Value */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#eef8f2] text-[#0b8252] flex items-center justify-center">
                    <span className="material-symbols-outlined">monetization_on</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Inventory Value</p>
                  <p className="text-2xl font-bold text-slate-800 leading-none">$428.5k</p>
                </div>
              </div>

              {/* Active Sectors */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#eef8f2] text-[#0b8252] flex items-center justify-center">
                    <span className="material-symbols-outlined">category</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Active Sectors</p>
                  <p className="text-2xl font-bold text-slate-800 leading-none">42 <span className="text-base font-semibold">Sectors</span></p>
                </div>
              </div>

              {/* Restock Orders */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#eef8f2] text-[#0b8252] flex items-center justify-center">
                    <span className="material-symbols-outlined">local_shipping</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Restock Orders</p>
                  <p className="text-2xl font-bold text-slate-800 leading-none">5 <span className="text-base font-semibold">Pending</span></p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stock Movement Analytics */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold text-lg text-slate-800">Stock Movement Analytics</h3>
                    <div className="flex bg-[#f1f5f9] rounded-md p-0.5 text-xs font-semibold border border-slate-200">
                      <span className="px-3 py-1 bg-white text-[#0b8252] rounded shadow-sm">Stock-In</span>
                      <span className="px-3 py-1 text-slate-500">Stock-Out</span>
                    </div>
                  </div>
                  <button className="text-sm font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-50 shadow-sm">
                    This Week <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>
                </div>

                <div className="flex-1 relative w-full h-64 mt-2">
                  <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0b8252" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#0b8252" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="0" y1="75" x2="100" y2="75" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2,2" />

                    {/* Filled Area */}
                    <path d="M0,80 Q10,60 25,75 T50,45 T75,95 T100,40 L100,100 L0,100 Z" fill="url(#chart-gradient)" />
                    {/* Line Path */}
                    <path d="M0,80 Q10,60 25,75 T50,45 T75,95 T100,40" fill="none" stroke="#0b8252" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="absolute inset-x-0 bottom-0 flex justify-between text-xs font-medium text-slate-400 px-1 pt-2 border-t border-slate-100">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>
              </div>

              {/* Top Selling */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-800">Top Selling</h3>
                  <button className="text-sm font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-50 shadow-sm">
                    This Week <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>
                </div>

                <div className="space-y-6 flex-1">
                  {/* Item 1 */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#eef8f2] text-[#0b8252] flex items-center justify-center font-bold text-sm">1</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 leading-tight">Organic Avocados</p>
                      <p className="text-[10px] text-slate-500">Produce • SKU-102</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0b8252] mb-1">2.4k units</p>
                      <div className="w-16 h-1 bg-[#0b8252] rounded-full ml-auto"></div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#eef8f2] text-[#0b8252] flex items-center justify-center font-bold text-sm">2</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 leading-tight">Whole Milk 1L</p>
                      <p className="text-[10px] text-slate-500">Dairy • SKU-495</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0b8252] mb-1">1.8k units</p>
                      <div className="w-12 h-1 bg-[#0b8252] rounded-full ml-auto"></div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#eef8f2] text-[#0b8252] flex items-center justify-center font-bold text-sm">3</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 leading-tight">Artisan Bread</p>
                      <p className="text-[10px] text-slate-500">Bakery • SKU-882</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0b8252] mb-1">1.2k units</p>
                      <div className="w-10 h-1 bg-[#0b8252] rounded-full ml-auto"></div>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#eef8f2] text-[#0b8252] flex items-center justify-center font-bold text-sm">4</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 leading-tight">Sparkling Water</p>
                      <p className="text-[10px] text-slate-500">Beverages • SKU-219</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0b8252] mb-1">950 units</p>
                      <div className="w-8 h-1 bg-[#0b8252] rounded-full ml-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Sales by Channel */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                <div className="w-full flex justify-between items-start mb-6">
                  <h3 className="font-bold text-lg text-slate-400 leading-tight">Sales by<br /><span className="text-slate-800">Channel</span></h3>
                  <button className="text-sm font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-50 shadow-sm">
                    This Week <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>
                </div>

                <div className="relative w-48 h-48 my-auto">
                  {/* Donut Chart Mock */}
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f8fafc" strokeWidth="4" />
                    {/* Orange 15% */}
                    <path className="text-[#f59e0b]" strokeDasharray="15, 100" strokeDashoffset="0" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    {/* Teal 20% */}
                    <path className="text-[#0ea5e9]" strokeDasharray="20, 100" strokeDashoffset="-15" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    {/* Green 65% */}
                    <path className="text-[#0b8252]" strokeDasharray="65, 100" strokeDashoffset="-35" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-2xl font-bold text-slate-800">$124k</p>
                    <p className="text-[10px] font-medium text-slate-500">Total</p>
                  </div>
                </div>

                <div className="w-full flex justify-between mt-8 px-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 justify-center mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#0b8252]"></span>
                      <p className="text-[10px] font-bold text-[#0b8252] uppercase tracking-wide">POS</p>
                    </div>
                    <p className="text-slate-800 font-bold text-lg">65%</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 justify-center mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#0ea5e9]"></span>
                      <p className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-wide">ONLINE</p>
                    </div>
                    <p className="text-slate-800 font-bold text-lg">20%</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 justify-center mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                      <p className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wide">WHOLESALE</p>
                    </div>
                    <p className="text-slate-800 font-bold text-lg">15%</p>
                  </div>
                </div>
              </div>

              {/* Top Suppliers */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-400">Top Suppliers</h3>
                  <span className="material-symbols-outlined text-slate-300 text-[24px] cursor-pointer">swap_vert</span>
                </div>

                <div className="space-y-4 flex-1">
                  {/* Supplier 1 */}
                  <div className="border border-[#eef8f2] bg-[#f8fcf9] p-4 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0b8252] shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 leading-tight">Global Foods<br />Inc.</p>
                      <p className="text-[11px] text-slate-500 mt-1">124 orders • 99%</p>
                    </div>
                    <span className="px-2 py-1 bg-[#eef8f2] text-[#0b8252] text-[10px] font-bold rounded-md">Premier</span>
                  </div>

                  {/* Supplier 2 */}
                  <div className="border border-slate-100 bg-[#f8fafc] p-4 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0b8252] shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 leading-tight">FreshProduce<br />Co.</p>
                      <p className="text-[11px] text-slate-500 mt-1">86 orders • 92%</p>
                    </div>
                    <span className="px-2 py-1 bg-[#e2e8f0] text-slate-600 text-[10px] font-bold rounded-md">Standard</span>
                  </div>

                  {/* Supplier 3 */}
                  <div className="border border-[#eef8f2] bg-[#f8fcf9] p-4 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0b8252] shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 leading-tight">Bakery Master<br />Ltd.</p>
                      <p className="text-[11px] text-slate-500 mt-1">54 orders • 96%</p>
                    </div>
                    <span className="px-2 py-1 bg-[#eef8f2] text-[#0b8252] text-[10px] font-bold rounded-md">Premier</span>
                  </div>
                </div>
              </div>

              {/* Inventory Health */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <h3 className="font-bold text-lg text-slate-400 leading-tight">Inventory<br /><span className="text-slate-800">Health</span></h3>
                  <button className="text-sm font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-50 shadow-sm">
                    This Week <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-slate-800">Healthy Stock</span>
                      <span className="text-[#0b8252] font-bold">88%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0b8252] w-[88%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-slate-800">Low Stock</span>
                      <span className="text-[#d97706] font-bold">9%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#d97706] w-[9%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-slate-800">Critical</span>
                      <span className="text-[#dc2626] font-bold">2%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#dc2626] w-[2%]"></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border border-[#eef8f2] bg-[#f8fcf9] p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[#0b8252] text-[18px]">auto_awesome</span>
                    <h4 className="font-bold text-[#0b8252] text-sm">Health Score: Optimal</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Turnover 15% higher than prev. month.</p>
                </div>
              </div>

            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Priority Alerts */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-slate-800">Priority Alerts</h3>
                  <Link
                    to="/alerts"
                    className="inline-flex items-center gap-1 text-sm text-[#0b8252] font-bold hover:underline whitespace-nowrap"
                    aria-label="Open alerts center"
                  >
                    View All
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
                <div className="p-6 flex flex-col gap-6">
                  {/* Alert Item 1 */}
                  <div className="flex gap-3 items-start relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#dc2626] rounded-full"></div>
                    <div className="pl-4">
                      <p className="text-sm font-bold text-slate-800 leading-tight">Milk 1L (SKU-4829) Out of Stock</p>
                      <p className="text-xs text-slate-600 mt-1">Immediate restock required for aisle 4.</p>
                      <p className="text-[11px] font-bold text-[#dc2626] mt-2">2 mins ago</p>
                    </div>
                  </div>
                  <hr className="border-slate-100" />

                  {/* Alert Item 2 */}
                  <div className="flex gap-3 items-start relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#d97706] rounded-full"></div>
                    <div className="pl-4">
                      <p className="text-sm font-bold text-slate-800 leading-tight">Expiry Warning: Greek Yogurt</p>
                      <p className="text-xs text-slate-600 mt-1">42 units expire in 48 hours.</p>
                      <p className="text-[11px] font-bold text-[#d97706] mt-2">1 hour ago</p>
                    </div>
                  </div>
                  <hr className="border-slate-100" />

                  {/* Alert Item 3 */}
                  <div className="flex gap-3 items-start relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0b8252] rounded-full"></div>
                    <div className="pl-4">
                      <p className="text-sm font-bold text-slate-800 leading-tight">Inventory Audit Scheduled</p>
                      <p className="text-xs text-slate-600 mt-1">Monthly audit starts tomorrow 8 AM.</p>
                      <p className="text-[11px] font-bold text-[#0b8252] mt-2">4 hours ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 mt-auto">
                  <Link
                    to="/alerts"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[#0b8252] bg-[#eef8f2] px-4 py-2.5 text-sm font-bold text-[#0b8252] transition-colors hover:bg-[#dcfce7]"
                  >
                    Open Alerts Center
                    <span className="material-symbols-outlined text-[18px]">notifications</span>
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-slate-800">Recent Activity</h3>
                  <div className="flex items-center gap-4">
                    <button className="text-sm font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-50 shadow-sm">
                      This Week <span className="material-symbols-outlined text-[16px]">expand_more</span>
                    </button>
                    <button className="text-sm text-[#0b8252] font-bold hover:underline flex items-center gap-1">
                      View Log <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-[#f8fafc] text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">TIME</th>
                        <th className="px-6 py-4">PRODUCT</th>
                        <th className="px-6 py-4">ACTION</th>
                        <th className="px-6 py-4">QTY</th>
                        <th className="px-6 py-4">USER</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600 text-sm">
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-500">14:22 PM</td>
                        <td className="px-6 py-4 font-bold text-slate-800 leading-snug">
                          Organic<br />Bananas<br />(1kg)
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-[10px] font-bold bg-[#eef8f2] text-[#0b8252] rounded uppercase tracking-wide">Stock Added</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#0b8252]">+200</td>
                        <td className="px-6 py-4 text-slate-500">Admin_Mike</td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-500">13:05 PM</td>
                        <td className="px-6 py-4 font-bold text-slate-800 leading-snug">
                          Whole<br />Wheat<br />Bread
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-[10px] font-bold bg-[#fef2f2] text-[#dc2626] rounded uppercase tracking-wide inline-block leading-tight">Waste<br />Removed</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#dc2626]">-15</td>
                        <td className="px-6 py-4 text-slate-500">J_Doe</td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-500">11:45 AM</td>
                        <td className="px-6 py-4 font-bold text-slate-800 leading-snug">
                          Sparkling<br />Water<br />500ml
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-[10px] font-bold bg-[#e0f2fe] text-[#0284c7] rounded uppercase tracking-wide">Transfer</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">50</td>
                        <td className="px-6 py-4 text-slate-500">Admin_Mike</td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-500">09:12 AM</td>
                        <td className="px-6 py-4 font-bold text-slate-800 leading-snug">
                          Dark<br />Chocolate<br />70%
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-[10px] font-bold bg-[#eef8f2] text-[#0b8252] rounded uppercase tracking-wide">Stock Added</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#0b8252]">+500</td>
                        <td className="px-6 py-4 text-slate-500">S_Miller</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* AI Insights & Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">

              {/* Fast Moving */}
              <div className="bg-gradient-to-br from-[#f0fdf4] to-[#ecfdf5] border border-[#d1fae5] p-6 rounded-xl flex flex-col justify-between min-h-[160px] shadow-sm">
                <div className="flex items-center gap-2 text-[#059669] font-bold text-[11px] uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                  FAST MOVING
                </div>
                <div className="mt-8">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Avocados (Hass)</h4>
                  <p className="text-xs text-slate-500 leading-tight">Selling 30% faster than<br />avg.</p>
                </div>
              </div>

              {/* Slow Moving */}
              <div className="bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] border border-[#fde68a] p-6 rounded-xl flex flex-col justify-between min-h-[160px] shadow-sm">
                <div className="flex items-center gap-2 text-[#b45309] font-bold text-[11px] uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">trending_down</span>
                  SLOW MOVING
                </div>
                <div className="mt-8">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Canned Artichokes</h4>
                  <p className="text-xs text-slate-500 leading-tight">Zero sales in 14 days.</p>
                </div>
              </div>

              {/* AI Insight */}
              <div className="bg-gradient-to-br from-[#f0fdf4] to-[#ecfdf5] border border-[#d1fae5] p-6 rounded-xl flex flex-col justify-between min-h-[160px] shadow-sm">
                <div className="flex items-center gap-2 text-[#059669] font-bold text-[11px] uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                  AI INSIGHT
                </div>
                <div className="mt-8">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Seasonal Peak</h4>
                  <p className="text-xs text-slate-500 leading-tight">High demand expected<br />next week.</p>
                </div>
              </div>

              {/* Category Share */}
              <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-between min-h-[160px] shadow-sm">
                <h4 className="font-bold text-slate-600 text-[11px] uppercase tracking-wider w-full text-center">CATEGORY SHARE</h4>
                <div className="relative w-24 h-24 mt-2">
                  {/* Donut chart */}
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#6ee7b7" strokeWidth="4" />
                    <path className="text-[#0b8252]" strokeDasharray="45, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-bold text-[#0b8252]">45% Dairy</p>
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
