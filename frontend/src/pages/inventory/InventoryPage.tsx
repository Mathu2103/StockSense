import Sidebar from './Sidebar';
import { Link } from 'react-router-dom';

export default function InventoryPage() {
  return (
    <div className="flex h-screen bg-background text-on-surface font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-6 shrink-0">
          <div className="relative w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
            <input 
              type="text" 
              placeholder="Search inventory, SKUs, or alerts..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-outline hover:text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="text-outline hover:text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">schedule</span>
            </button>
            <button className="text-outline hover:text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">info</span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold leading-tight">Alex Thompson</p>
                <p className="text-xs text-outline">Inventory Manager</p>
              </div>
              <img src="https://ui-avatars.com/api/?name=Alex+Thompson&background=0D8ABC&color=fff" alt="User" className="w-9 h-9 rounded-full border border-outline-variant" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            {/* Title & Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-on-surface">Inventory Overview</h1>
                <p className="text-outline text-sm mt-1">Real-time status of your supermarket stock levels.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline rounded-lg text-sm font-medium hover:bg-background transition-colors">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                  Filter
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Total Products */}
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">inventory_2</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">+12%</span>
                </div>
                <div>
                  <p className="text-xs text-outline font-medium mb-1">Total Products</p>
                  <p className="text-xl font-bold text-on-surface">12,482</p>
                </div>
              </div>

              {/* Low Stock */}
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">warning</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded-full">Alert</span>
                </div>
                <div>
                  <p className="text-xs text-outline font-medium mb-1">Low Stock</p>
                  <p className="text-xl font-bold text-on-surface">84 Items</p>
                </div>
              </div>

              {/* Out of Stock */}
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">block</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full">Critical</span>
                </div>
                <div>
                  <p className="text-xs text-outline font-medium mb-1">Out of Stock</p>
                  <p className="text-xl font-bold text-on-surface">12 Items</p>
                </div>
              </div>

              {/* Expiring Soon */}
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">event_busy</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-on-surface-variant rounded-full">7 Days</span>
                </div>
                <div>
                  <p className="text-xs text-outline font-medium mb-1">Expiring Soon</p>
                  <p className="text-xl font-bold text-on-surface">318 Units</p>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">category</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-outline font-medium mb-1">Categories</p>
                  <p className="text-xl font-bold text-on-surface">42 Sectors</p>
                </div>
              </div>

              {/* Pending Restock */}
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-secondary-container text-primary rounded-full">Active</span>
                </div>
                <div>
                  <p className="text-xs text-outline font-medium mb-1">Pending Restock</p>
                  <p className="text-xl font-bold text-on-surface">5 Orders</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stock Movement Chart (Mock) */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm lg:col-span-2 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-on-surface">Inventory Stock Movement</h3>
                  <select className="text-sm border-outline-variant rounded-lg text-on-surface-variant px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary">
                    <option>Last 7 Days</option>
                  </select>
                </div>
                <div className="flex-1 flex items-end justify-between gap-2 pt-10 pb-2 border-b border-outline-variant/50">
                  {/* Mock Bar Chart */}
                  <div className="w-full bg-primary/30 rounded-t-sm" style={{ height: '50%' }}></div>
                  <div className="w-full bg-primary/50 rounded-t-sm" style={{ height: '70%' }}></div>
                  <div className="w-full bg-primary/40 rounded-t-sm" style={{ height: '40%' }}></div>
                  <div className="w-full bg-primary/80 rounded-t-sm" style={{ height: '90%' }}></div>
                  <div className="w-full bg-primary/30 rounded-t-sm" style={{ height: '60%' }}></div>
                  <div className="w-full bg-primary/50 rounded-t-sm" style={{ height: '75%' }}></div>
                  <div className="w-full bg-secondary-container0 rounded-t-sm" style={{ height: '45%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-outline-variant mt-3 px-2">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>

              {/* Inventory Health */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col">
                <h3 className="font-bold text-on-surface mb-6">Inventory Health</h3>
                
                <div className="space-y-5 flex-1">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-on-surface-variant">Healthy Stock</span>
                      <span className="text-green-600 font-bold">88%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 w-[88%]"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-on-surface-variant">Low Stock Warning</span>
                      <span className="text-orange-500 font-bold">9%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-[9%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-on-surface-variant">Critical/Out</span>
                      <span className="text-red-500 font-bold">2%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 w-[2%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-on-surface-variant">Expired/Damaged</span>
                      <span className="text-outline-variant font-bold">1%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 w-[1%]"></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-secondary-container/50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                    <h4 className="font-bold text-on-secondary-container text-sm">Health Score: Optimal</h4>
                  </div>
                  <p className="text-xs text-primary/80 leading-relaxed">Stock turnover is 15% higher than previous month.</p>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Priority Alerts */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col">
                <div className="p-4 border-b border-outline-variant/50 flex justify-between items-center">
                  <h3 className="font-bold text-on-surface">Priority Alerts</h3>
                  <button className="text-sm text-primary font-semibold hover:underline">View All</button>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  {/* Alert Item 1 */}
                  <div className="flex gap-3 items-start border-l-4 border-red-500 pl-3 py-1">
                    <div>
                      <p className="text-sm font-bold text-on-surface">Milk 1L (SKU-4829) Out of Stock</p>
                      <p className="text-xs text-outline mt-0.5">Immediate restock required for aisle 4.</p>
                      <p className="text-[10px] font-bold text-red-600 mt-1">2 mins ago</p>
                    </div>
                  </div>
                  <hr className="border-outline-variant/50" />
                  
                  {/* Alert Item 2 */}
                  <div className="flex gap-3 items-start border-l-4 border-orange-500 pl-3 py-1">
                    <div>
                      <p className="text-sm font-bold text-on-surface">Expiry Warning: Greek Yogurt</p>
                      <p className="text-xs text-outline mt-0.5">42 units expire in 48 hours. Consider promotion.</p>
                      <p className="text-[10px] font-bold text-orange-600 mt-1">1 hour ago</p>
                    </div>
                  </div>
                  <hr className="border-outline-variant/50" />

                  {/* Alert Item 3 */}
                  <div className="flex gap-3 items-start border-l-4 border-blue-500 pl-3 py-1">
                    <div>
                      <p className="text-sm font-bold text-on-surface">Inventory Audit Scheduled</p>
                      <p className="text-xs text-outline mt-0.5">Monthly audit for 'Dry Goods' starts tomorrow 8 AM.</p>
                      <p className="text-[10px] font-bold text-primary mt-1">4 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm lg:col-span-2 flex flex-col relative overflow-hidden">
                <div className="p-4 border-b border-outline-variant/50 flex justify-between items-center">
                  <h3 className="font-bold text-on-surface">Recent Activity</h3>
                  <button className="text-outline-variant hover:text-on-surface-variant">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-background text-outline font-medium">
                      <tr>
                        <th className="px-4 py-3 font-medium">Time</th>
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                        <th className="px-4 py-3 font-medium">Quantity</th>
                        <th className="px-4 py-3 font-medium">User</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-on-surface-variant">
                      <tr>
                        <td className="px-4 py-3 text-xs text-outline">14:22 PM</td>
                        <td className="px-4 py-3 font-semibold">Organic Bananas (1kg)</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 text-[10px] font-bold bg-green-100 text-green-700 rounded-md">Stock Added</span></td>
                        <td className="px-4 py-3 font-bold text-green-600">+200</td>
                        <td className="px-4 py-3 text-xs text-outline">Admin_Mike</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-xs text-outline">13:05 PM</td>
                        <td className="px-4 py-3 font-semibold">Whole Wheat Bread</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 text-[10px] font-bold bg-red-100 text-red-700 rounded-md">Waste Removed</span></td>
                        <td className="px-4 py-3 font-bold text-red-600">-15</td>
                        <td className="px-4 py-3 text-xs text-outline">J_Doe</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-xs text-outline">11:45 AM</td>
                        <td className="px-4 py-3 font-semibold">Sparkling Water 500ml</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 text-[10px] font-bold bg-secondary-container text-primary rounded-md">Transfer</span></td>
                        <td className="px-4 py-3 font-medium">50</td>
                        <td className="px-4 py-3 text-xs text-outline">Admin_Mike</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-xs text-outline">09:12 AM</td>
                        <td className="px-4 py-3 font-semibold">Dark Chocolate 70%</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 text-[10px] font-bold bg-green-100 text-green-700 rounded-md">Stock Added</span></td>
                        <td className="px-4 py-3 font-bold text-green-600">+500</td>
                        <td className="px-4 py-3 text-xs text-outline">S_Miller</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Floating Add Button overlay representation */}
                <button className="absolute bottom-6 right-6 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>

            {/* AI Insights & Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
              {/* Fast Moving */}
              <div className="bg-secondary-container border border-blue-100 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-primary mb-2 font-bold text-xs uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  Fast Moving
                </div>
                <h4 className="font-bold text-on-surface mb-1">Avocados (Hass)</h4>
                <p className="text-xs text-on-surface-variant">Selling 30% faster than average. Consider increasing reorder quantity.</p>
              </div>

              {/* Slow Moving */}
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-orange-600 mb-2 font-bold text-xs uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">trending_down</span>
                  Slow Moving
                </div>
                <h4 className="font-bold text-on-surface mb-1">Canned Artichokes</h4>
                <p className="text-xs text-on-surface-variant">Zero sales in 14 days. Current stock: 45 units. Clear shelf space?</p>
              </div>

              {/* AI Suggestion */}
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-600 mb-2 font-bold text-xs uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">psychology</span>
                  AI Suggestion
                </div>
                <h4 className="font-bold text-on-surface mb-1">Seasonal Peak</h4>
                <p className="text-xs text-on-surface-variant">Barbecue coal demand expected to rise by 200% next weekend due to weather.</p>
              </div>

              {/* Category Share */}
              <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex flex-col items-center justify-center">
                <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider mb-4 w-full text-left">Category Share</h4>
                <div className="relative w-24 h-24 rounded-full border-[12px] border-outline-variant/50 border-t-primary border-r-primary flex items-center justify-center">
                   <div className="text-center">
                     <p className="text-[10px] text-outline font-bold">Top: Dairy</p>
                   </div>
                </div>
                <div className="flex gap-2 mt-4 text-[10px] font-bold">
                  <span className="px-2 py-0.5 bg-primary text-white rounded">Dairy</span>
                  <span className="px-2 py-0.5 bg-slate-200 text-on-surface-variant rounded">Produce</span>
                  <span className="px-2 py-0.5 bg-green-400 text-white rounded">Meat</span>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
