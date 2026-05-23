import Sidebar from './Sidebar';
import InventoryHeader from './InventoryHeader';

const Toggle = ({ active }: { active: boolean }) => (
  <button className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${active ? 'bg-[#0b8252]' : 'bg-slate-200'}`}>
    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
  </button>
);

export default function Settings() {
  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InventoryHeader />

        <main className="flex-1 overflow-y-auto px-6 py-8 bg-[#f8f9fa] flex flex-col">
          <div className="max-w-[1200px] w-full mx-auto flex-1 flex flex-col">
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800">Inventory Settings</h1>
              <p className="text-slate-500 mt-1">Configure stock rules, alerts, and inventory behavior for your supermarket system.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
              
              {/* Card 1: Stock Configuration */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0b8252]">inventory_2</span>
                  Stock Configuration
                </h3>
                <div className="space-y-5 flex-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Default Reorder Level</label>
                    <input 
                      type="text" 
                      defaultValue="50" 
                      className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 focus:outline-none focus:border-[#0b8252]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Minimum Stock Threshold</label>
                    <input 
                      type="text" 
                      defaultValue="20" 
                      className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 focus:outline-none focus:border-[#0b8252]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Maximum Stock Limit (Optional)</label>
                    <input 
                      type="text" 
                      defaultValue="No limit" 
                      className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 focus:outline-none focus:border-[#0b8252]"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-700">Auto stock update</span>
                  <Toggle active={true} />
                </div>
              </div>

              {/* Card 2: Alert Settings */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0b8252]">notifications_active</span>
                  Alert Settings
                </h3>
                <div className="space-y-5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Enable Low Stock Alerts</span>
                    <Toggle active={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Out of Stock Alerts</span>
                    <Toggle active={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Dead Stock Alerts</span>
                    <Toggle active={false} />
                  </div>
                  
                  <div className="pt-4 mt-2">
                    <label className="block text-xs font-bold text-slate-500 mb-3">Notification Channels</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-sm font-medium">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-[#0b8252] focus:ring-[#0b8252] accent-[#0b8252]" />
                        In-app
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-sm font-medium">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-[#0b8252] focus:ring-[#0b8252] accent-[#0b8252]" />
                        Email
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-sm font-medium">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#0b8252] focus:ring-[#0b8252] accent-[#0b8252]" />
                        SMS
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Dead Stock Config */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0b8252]">warning</span>
                  Dead Stock Config
                </h3>
                <div className="space-y-5 flex-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Dead stock duration</label>
                    <input 
                      type="text" 
                      defaultValue="60 days" 
                      className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 focus:outline-none focus:border-[#0b8252]"
                    />
                  </div>
                  <div className="flex items-start justify-between mt-6">
                    <span className="text-sm font-medium text-slate-700 pr-4">Enable automatic dead stock detection</span>
                    <div className="mt-0.5"><Toggle active={true} /></div>
                  </div>
                </div>
              </div>

              {/* Card 4: Purchase & Supplier */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0b8252]">local_shipping</span>
                  Purchase & Supplier
                </h3>
                <div className="space-y-5 flex-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Default supplier behavior</label>
                    <input 
                      type="text" 
                      defaultValue="Preferred Supplier" 
                      className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 focus:outline-none focus:border-[#0b8252]"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-slate-700">Enable restock mapping</span>
                    <Toggle active={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Auto-suggest supplier</span>
                    <Toggle active={false} />
                  </div>
                </div>
              </div>

              {/* Card 5: Adjustments */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0b8252]">edit_note</span>
                  Adjustments
                </h3>
                <div className="space-y-5 flex-1 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Require approval</span>
                    <Toggle active={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Allow negative stock</span>
                    <Toggle active={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Auto-trigger alerts</span>
                    <Toggle active={true} />
                  </div>
                </div>
              </div>

              {/* Card 6: Reporting Settings */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0b8252]">bar_chart</span>
                  Reporting Settings
                </h3>
                <div className="space-y-5 flex-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Default time range</label>
                    <input 
                      type="text" 
                      defaultValue="Month" 
                      className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 focus:outline-none focus:border-[#0b8252]"
                    />
                  </div>
                  <div className="flex items-start justify-between mt-6 pt-2">
                    <span className="text-sm font-medium text-slate-700 pr-4">Enable auto-generated reports</span>
                    <div className="mt-0.5"><Toggle active={true} /></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 pb-4 mt-4 border-t border-slate-200 bg-[#f8f9fa] sticky bottom-0 z-10">
              <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                Discard Changes
              </button>
              <button className="px-6 py-2.5 bg-[#0b8252] text-white font-bold text-sm rounded-lg shadow-sm hover:bg-[#096b43] transition-colors">
                Save Settings
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
