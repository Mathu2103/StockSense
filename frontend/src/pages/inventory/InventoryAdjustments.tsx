import Sidebar from './Components/Sidebar';
import InventoryHeader from './Components/InventoryHeader';

export default function InventoryAdjustments() {
  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InventoryHeader />

        <main className="flex-1 overflow-y-auto px-6 py-8 bg-[#f8f9fa]">
          <div className="max-w-[1200px] w-full mx-auto space-y-6">

            {/* Header Section */}
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Inventory Adjustment</h1>
              <p className="text-slate-500 mt-1">Correct stock discrepancies for damages, expirations, or manual updates.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column: Form Areas */}
              <div className="lg:col-span-2 space-y-6">

                {/* Form Details */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left side of form details */}
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Adjustment Type</label>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="adjType" defaultChecked className="w-4 h-4 text-[#0b8252] focus:ring-[#0b8252]" />
                            <span className="text-sm font-bold text-[#0b8252]">Quantity Adjustment</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-800 transition-colors">
                            <input type="radio" name="adjType" className="w-4 h-4 text-[#0b8252] focus:ring-[#0b8252]" />
                            <span className="text-sm font-medium">Value Adjustment</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Reference Number</label>
                        <input
                          type="text"
                          defaultValue="IA-00001"
                          className="w-full bg-[#f1f5f9] text-[#0b8252] font-bold border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Adjustment Date</label>
                        <div className="relative">
                          <input
                            type="text"
                            defaultValue="11/20/2023"
                            className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252]"
                          />
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">calendar_today</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side of form details */}
                    <div className="space-y-5 flex flex-col">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Reason Category</label>
                        <div className="relative">
                          <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#0b8252]">
                            <option>Damaged</option>
                            <option>Expired</option>
                            <option>Manual Correction</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Detailed Description</label>
                        <textarea
                          placeholder="Enter specific details about the discrepancy..."
                          className="w-full flex-1 min-h-[100px] bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#0b8252] resize-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items to Adjust Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800">Items to Adjust</h3>
                    <span className="text-xs font-medium text-slate-500">3 items selected</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                          <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Current Stock</th>
                          <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">New Stock</th>
                          <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Difference</th>
                          <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                          <th className="p-4 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">

                        {/* Item 1 */}
                        <tr>
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                              <span className="material-symbols-outlined">local_drink</span>
                            </div>
                            <div>
                              <p className="font-bold text-[#0b8252]">Organic Whole Milk 1L</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">SKU: MK-8829</p>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-medium text-slate-700 text-lg">42</span><br /><span className="text-[10px] text-slate-400">units</span>
                          </td>
                          <td className="p-4">
                            <input type="text" defaultValue="38" className="w-16 text-center mx-auto block bg-white border border-slate-200 text-slate-800 font-bold rounded px-2 py-1.5 focus:outline-none focus:border-[#0b8252]" />
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-block px-2.5 py-1 text-xs font-bold rounded bg-[#fee2e2] text-[#ef4444]">-4</span>
                          </td>
                          <td className="p-4">
                            <div className="relative">
                              <select className="w-full appearance-none bg-white text-slate-700 text-sm font-medium px-2 py-1.5 pr-6 focus:outline-none cursor-pointer">
                                <option>Expired</option>
                              </select>
                              <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[16px]">expand_more</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button className="text-slate-300 hover:text-red-500"><span className="material-symbols-outlined text-[18px]">close</span></button>
                          </td>
                        </tr>

                        {/* Item 2 */}
                        <tr>
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                              <span className="material-symbols-outlined">nutrition</span>
                            </div>
                            <div>
                              <p className="font-bold text-[#0b8252]">Green Bell Pepper</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">SKU: VG-1002</p>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-medium text-slate-700 text-lg">15</span><br /><span className="text-[10px] text-slate-400">kg</span>
                          </td>
                          <td className="p-4">
                            <input type="text" defaultValue="18" className="w-16 text-center mx-auto block bg-white border border-slate-200 text-slate-800 font-bold rounded px-2 py-1.5 focus:outline-none focus:border-[#0b8252]" />
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-block px-2.5 py-1 text-xs font-bold rounded bg-[#dcfce7] text-[#10b981]">+3</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-medium text-slate-700 px-2">Manual Correction</span>
                          </td>
                          <td className="p-4 text-center">
                            <button className="text-slate-300 hover:text-red-500"><span className="material-symbols-outlined text-[18px]">close</span></button>
                          </td>
                        </tr>

                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                    <button className="flex items-center gap-1.5 text-sm font-bold text-[#0b8252] hover:underline">
                      <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Product
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Summary & Panels */}
              <div className="space-y-6">

                {/* Summary Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-[#0b8252]">analytics</span> Adjustment Summary
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Total Items</span>
                      <span className="font-bold text-slate-800">2</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Total Added</span>
                      <span className="font-bold text-[#10b981]">+3</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Total Reduced</span>
                      <span className="font-bold text-[#ef4444]">-4</span>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">NET CHANGE</span>
                      <span className="font-bold text-[#ef4444] text-lg">-1 Unit</span>
                    </div>
                  </div>
                </div>

                {/* Reorder Alert */}
                <div className="bg-[#ffedd5] rounded-xl border border-[#fed7aa] p-5 shadow-sm flex gap-3">
                  <span className="material-symbols-outlined text-[#d97706] mt-0.5">warning</span>
                  <div>
                    <h4 className="font-bold text-[#92400e] text-sm mb-1">Reorder Point Alert</h4>
                    <p className="text-xs text-[#92400e] leading-relaxed">
                      Organic Whole Milk 1L will drop below reorder point (40) after this adjustment.
                    </p>
                  </div>
                </div>

                {/* Upload Documents */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#eef8f2] text-[#0b8252] flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[24px]">upload_file</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Upload Documents</h4>
                  <p className="text-xs text-slate-500 mb-4 max-w-[200px]">Drag and drop damage photos or supplier documents here</p>
                  <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors">
                    Select Files
                  </button>
                </div>

                {/* Authorized By */}
                <div className="bg-[#eef8f2] rounded-xl border border-[#bbf7d0] p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#0b8252] text-white flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">AUTHORIZED BY</p>
                    <p className="font-bold text-slate-800 text-sm">Alex Mercer (Manager)</p>
                    <p className="text-xs text-[#0b8252] mt-0.5 font-medium">Location: Main Warehouse</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-slate-200">
              <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button className="px-6 py-2.5 bg-white border border-slate-200 text-[#0b8252] font-bold text-sm rounded-lg hover:bg-slate-50 transition-colors">Reset</button>
              <button className="px-6 py-2.5 bg-[#0b8252] text-white font-bold text-sm rounded-lg shadow-sm hover:bg-[#096b43] transition-colors">Save Adjustment</button>
            </div>

            {/* Recent Activity Table */}
            <div className="pt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-slate-800">Recent Activity</h3>
                <button className="text-sm font-bold text-[#0b8252] hover:underline">View All History</button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Qty Changed</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Adjusted By</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {[{
                        ref: "IA-9982",
                        prod: "Red Apples 500g",
                        qty: "-12",
                        qClass: "text-[#ef4444]",
                        reason: "DAMAGED",
                        rClass: "bg-[#fee2e2] text-[#ef4444]",
                        user: "Sarah Chen",
                        date: "Today, 10:45 AM"
                      }, {
                        ref: "IA-9981",
                        prod: "Artisan Bread",
                        qty: "+5",
                        qClass: "text-[#10b981]",
                        reason: "MANUAL CORRECTION",
                        rClass: "bg-slate-100 text-slate-600",
                        user: "Alex Mercer",
                        date: "Yesterday, 4:20 PM"
                      }, {
                        ref: "IA-9980",
                        prod: "Cheddar Cheese 200g",
                        qty: "-2",
                        qClass: "text-[#ef4444]",
                        reason: "EXPIRED",
                        rClass: "bg-[#fef3c7] text-[#d97706]",
                        user: "John Doe",
                        date: "Nov 18, 09:12 AM"
                      }].map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-[#0b8252]">{item.ref}</td>
                          <td className="p-4 font-medium text-slate-700">{item.prod}</td>
                          <td className={`p-4 text-center font-bold ${item.qClass}`}>{item.qty}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${item.rClass}`}>{item.reason}</span>
                          </td>
                          <td className="p-4 text-slate-700">{item.user}</td>
                          <td className="p-4 text-slate-500">{item.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
