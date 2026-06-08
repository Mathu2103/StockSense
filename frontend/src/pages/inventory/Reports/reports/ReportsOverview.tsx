import { useState } from 'react';
import { downloadReport, ViewState } from './reportUtils';

export default function ReportsOverview({ onViewChange }: { onViewChange: (view: ViewState) => void }) {

  return (
    <div className="animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Reports & Analytics</h1>
            <p className="text-slate-500 text-sm mt-0.5">Detailed insights into Chamson Multi Shop's daily operations and performance.</p>
          </div>
        </div>
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
          <h3 className="font-bold text-lg text-slate-800 mb-2">Adjustment Reports</h3>
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
                <td className="p-4 text-right"><button onClick={() => downloadReport('Weekly_Revenue_Analysis_Q3', 'excel')} className="text-slate-400 hover:text-[#0b8252] transition-colors"><span className="material-symbols-outlined">download</span></button></td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-700">Low Stock Warning Summary</td>
                <td className="p-4"><span className="px-2.5 py-1 text-[10px] font-bold bg-[#fee2e2] text-[#ef4444] rounded-full">Alerts</span></td>
                <td className="p-4 text-slate-600">Oct 23, 2023 - 04:12 PM</td>
                <td className="p-4"><div className="flex items-center gap-1.5 font-bold text-[#10b981]"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Ready</div></td>
                <td className="p-4 text-right"><button onClick={() => downloadReport('Low_Stock_Warning_Summary', 'pdf')} className="text-slate-400 hover:text-[#0b8252] transition-colors"><span className="material-symbols-outlined">download</span></button></td>
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
