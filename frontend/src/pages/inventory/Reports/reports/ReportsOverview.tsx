import { useState } from 'react';
import { downloadReport, ViewState } from './reportUtils';

export default function ReportsOverview({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [reportTitle, setReportTitle] = useState('Custom Supermarket Report');
  const [reportCategory, setReportCategory] = useState('Sales');
  const [reportDepartment, setReportDepartment] = useState('All Departments');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [metrics, setMetrics] = useState({
    revenue: true,
    margins: true,
    shrinkage: false,
    turnover: false
  });

  const handleGenerate = () => {
    const headers = ['Metric Description', 'Reporting Tab', 'Computed Value', 'Verification'];
    const rows = [
      ['Consolidated Supermarket Valuation', reportCategory, 'Rs. 14,500,000.00', 'Audited'],
      ['Target Store Department Filter', reportCategory, reportDepartment, 'Active'],
      ['Report Generation Window', reportCategory, new Date().toLocaleDateString(), 'System Certified'],
      ['Estimated Operational Margin', reportCategory, '24.8% Gross Margin', 'Calculated'],
    ];

    downloadReport(reportTitle.replace(/\s+/g, '_'), reportFormat, { headers, rows });
    setShowModal(false);
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Custom Report Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b8252] text-2xl">insert_chart</span>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Create Custom Report</h3>
                  <p className="text-xs text-slate-500">Configure parameters for instant operational printouts</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Report Title */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Report Name</label>
                <input 
                  type="text" 
                  value={reportTitle} 
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b8252] focus:border-[#0b8252] text-sm text-slate-800"
                  placeholder="e.g. Monthly Produce Wastage Summary"
                />
              </div>

              {/* Categorization & Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Report Stream</label>
                  <select 
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0b8252]"
                  >
                    <option value="Sales">Sales Reports</option>
                    <option value="Inventory">Inventory Reports</option>
                    <option value="Supplier">Supplier Reports</option>
                    <option value="Procurement">Purchase Records</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Department</label>
                  <select 
                    value={reportDepartment}
                    onChange={(e) => setReportDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0b8252]"
                  >
                    <option value="All Departments">All Departments</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Produce">Fresh Produce</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Pantry">Pantry / Grocery</option>
                  </select>
                </div>
              </div>

              {/* Included Metrics */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Operational Metrics</label>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={metrics.revenue} 
                      onChange={(e) => setMetrics({...metrics, revenue: e.target.checked})}
                      className="rounded text-[#0b8252] focus:ring-[#0b8252] w-4 h-4"
                    />
                    Revenue Totals
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={metrics.margins} 
                      onChange={(e) => setMetrics({...metrics, margins: e.target.checked})}
                      className="rounded text-[#0b8252] focus:ring-[#0b8252] w-4 h-4"
                    />
                    Financial Margins
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={metrics.shrinkage} 
                      onChange={(e) => setMetrics({...metrics, shrinkage: e.target.checked})}
                      className="rounded text-[#0b8252] focus:ring-[#0b8252] w-4 h-4"
                    />
                    Shrinkage Audit
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={metrics.turnover} 
                      onChange={(e) => setMetrics({...metrics, turnover: e.target.checked})}
                      className="rounded text-[#0b8252] focus:ring-[#0b8252] w-4 h-4"
                    />
                    Stock Turnover
                  </label>
                </div>
              </div>

              {/* Format selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Export Format</label>
                <div className="flex gap-4">
                  {(['pdf', 'excel', 'csv'] as const).map((format) => (
                    <label key={format} className="flex-1 flex items-center justify-between p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all select-none">
                      <span className="text-xs font-bold uppercase text-slate-600">{format}</span>
                      <input 
                        type="radio" 
                        name="exportFormat"
                        checked={reportFormat === format}
                        onChange={() => setReportFormat(format)}
                        className="text-[#0b8252] focus:ring-[#0b8252] w-4 h-4"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerate}
                className="px-5 py-2.5 rounded-lg bg-[#0b8252] hover:bg-[#096b43] text-xs font-bold text-white shadow-md transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Generate & Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Reports & Analytics</h1>
            <p className="text-slate-500 text-sm mt-0.5">Detailed insights into Chamson Multi Shop's daily operations and performance.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#0b8252] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors shrink-0 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">insert_chart</span>
          Create Custom Report
        </button>
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
          <h3 className="font-bold text-lg text-slate-800 mb-2">Activity Reports</h3>
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
