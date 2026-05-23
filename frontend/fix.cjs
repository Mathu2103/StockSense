const fs = require('fs');
const file = 'src/pages/inventory/InventoryPage.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const replacement = `              </div>
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
              </div>`.split('\n');

lines.splice(55, 26, ...replacement);
fs.writeFileSync(file, lines.join('\n'), 'utf8');
