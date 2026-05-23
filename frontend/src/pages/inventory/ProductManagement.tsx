import Sidebar from './Sidebar';
import InventoryHeader from './InventoryHeader';
import { Link } from 'react-router-dom';

export default function ProductManagement() {
  return (
    <div className="flex h-screen bg-background text-on-surface font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <InventoryHeader>
          <div className="relative w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
            <input 
              type="text" 
              placeholder="Search products, SKU or category..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
            />
          </div>
        </InventoryHeader>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            {/* Title & Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-on-surface">Product Inventory</h1>
                <p className="text-outline text-sm mt-1">Real-time management of stock levels and expiration dates.</p>
              </div>
              <div>
                <Link to="/manage-products/new" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add New Product
                </Link>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total SKU Items */}
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-secondary-container text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">inventory_2</span>
                  </div>
                  <span className="text-xs font-semibold text-green-600">+2% vs last week</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-on-surface tracking-tight">1,284</p>
                  <p className="text-sm text-outline font-medium">Total SKU Items</p>
                </div>
              </div>

              {/* Out of Stock */}
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">warning</span>
                  </div>
                  <span className="text-xs font-semibold text-red-600">Critical</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-on-surface tracking-tight">24</p>
                  <p className="text-sm text-outline font-medium">Out of Stock</p>
                </div>
              </div>

              {/* Expiring Soon */}
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">event_busy</span>
                  </div>
                  <span className="text-xs font-semibold text-orange-600">Next 7 Days</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-on-surface tracking-tight">12</p>
                  <p className="text-sm text-outline font-medium">Expiring Soon</p>
                </div>
              </div>

              {/* Inventory Value */}
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">trending_up</span>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-on-surface tracking-tight">$42.1k</p>
                  <p className="text-sm text-outline font-medium">Inventory Value</p>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-on-surface-variant rounded-lg font-medium text-sm border border-outline-variant">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                  Filter By:
                </div>
                <select className="bg-surface-container-lowest border border-outline-variant text-on-surface-variant text-sm rounded-lg focus:ring-primary focus:border-blue-500 block px-4 py-2 outline-none">
                  <option>All Categories</option>
                </select>
                <select className="bg-surface-container-lowest border border-outline-variant text-on-surface-variant text-sm rounded-lg focus:ring-primary focus:border-blue-500 block px-4 py-2 outline-none">
                  <option>Stock Status</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-outline-variant hover:text-on-surface-variant rounded-lg transition-colors">
                  <span className="material-symbols-outlined">grid_view</span>
                </button>
                <button className="p-2 bg-secondary-container text-primary rounded-lg transition-colors">
                  <span className="material-symbols-outlined">format_list_bulleted</span>
                </button>
              </div>
            </div>

            {/* Table Area */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-on-surface-variant">
                  <thead className="bg-background text-outline font-bold uppercase tracking-wider text-xs border-b border-outline-variant">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">SKU / Barcode</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Qty</th>
                      <th className="px-6 py-4">Expiry</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-on-surface-variant">
                    {/* Item 1 */}
                    <tr className="hover:bg-background transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-teal-800 rounded flex-shrink-0 border border-outline-variant flex items-center justify-center overflow-hidden">
                             <div className="w-full h-full bg-teal-800 flex items-center justify-center text-white text-xs">IMG</div>
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">Whole Organic Milk</p>
                            <p className="text-xs text-outline">1 Liter / Bottle</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-on-surface-variant">001294857731</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 text-on-surface-variant rounded-full text-xs font-semibold">Dairy & Eggs</span>
                      </td>
                      <td className="px-6 py-4 font-medium">$4.50</td>
                      <td className="px-6 py-4 font-medium">142</td>
                      <td className="px-6 py-4 text-on-surface-variant">Oct 24, 2023</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                          In Stock
                        </span>
                      </td>
                    </tr>

                    {/* Item 2 */}
                    <tr className="hover:bg-background transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-800 rounded flex-shrink-0 border border-outline-variant flex items-center justify-center overflow-hidden">
                            <div className="w-full h-full bg-amber-800 flex items-center justify-center text-white text-xs">IMG</div>
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">Artisan Sourdough</p>
                            <p className="text-xs text-outline">Fresh Baked / 400g</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-on-surface-variant">003884729110</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 text-on-surface-variant rounded-full text-xs font-semibold">Bakery</span>
                      </td>
                      <td className="px-6 py-4 font-medium">$6.25</td>
                      <td className="px-6 py-4 font-bold text-red-600">8</td>
                      <td className="px-6 py-4 text-on-surface-variant">Oct 12, 2023</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                          Low Stock
                        </span>
                      </td>
                    </tr>

                    {/* Item 3 */}
                    <tr className="hover:bg-background transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-800 rounded flex-shrink-0 border border-outline-variant flex items-center justify-center overflow-hidden">
                            <div className="w-full h-full bg-green-800 flex items-center justify-center text-white text-xs">IMG</div>
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">Premium Avocado Oil</p>
                            <p className="text-xs text-outline">500ml Glass Bottle</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-on-surface-variant">009922118833</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 text-on-surface-variant rounded-full text-xs font-semibold">Pantry</span>
                      </td>
                      <td className="px-6 py-4 font-medium">$14.99</td>
                      <td className="px-6 py-4 font-bold text-red-600">0</td>
                      <td className="px-6 py-4 text-on-surface-variant">Feb 15, 2024</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                          Out of Stock
                        </span>
                      </td>
                    </tr>

                    {/* Item 4 */}
                    <tr className="hover:bg-background transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-400 rounded flex-shrink-0 border border-outline-variant flex items-center justify-center overflow-hidden">
                            <div className="w-full h-full bg-orange-400 flex items-center justify-center text-white text-xs">IMG</div>
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">Fresh Salmon Fillet</p>
                            <p className="text-xs text-outline">Weight Varies / kg</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-on-surface-variant">004455667788</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 text-on-surface-variant rounded-full text-xs font-semibold">Seafood</span>
                      </td>
                      <td className="px-6 py-4 font-medium">$22.00</td>
                      <td className="px-6 py-4 font-medium">34</td>
                      <td className="px-6 py-4 font-medium text-orange-600">Oct 11, 2023</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-700"></span>
                          Expiring Soon
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-background px-6 py-4 border-t border-outline-variant flex items-center justify-between">
                <span className="text-xs text-outline font-medium">Showing 1-10 of 1,284 products</span>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-surface-container-lowest text-outline-variant hover:bg-background">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-primary bg-primary text-white text-xs font-bold">1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-background text-xs font-medium">2</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-background text-xs font-medium">3</button>
                  <span className="text-outline-variant">...</span>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-surface-container-lowest text-outline-variant hover:bg-background">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
