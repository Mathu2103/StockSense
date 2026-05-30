import React, { useState } from 'react';
import Sidebar from './Components/Sidebar';
import InventoryHeader from './Components/InventoryHeader';
import brandLogo from './assets/logo.png';

type ViewState = 'overview' | 'sales' | 'inventory' | 'supplier' | 'activity' | 'purchase' | 'alert';

// --------------------------------------------------------------------------------
// UTILITY: DOWNLOAD REPORT
// --------------------------------------------------------------------------------
const downloadReport = (
  reportName: string, 
  format: 'pdf' | 'excel' | 'csv' = 'csv',
  reportData?: { headers: string[], rows: (string | number)[][] }
) => {
  const headers = reportData?.headers || ['Product Ref', 'Category', 'Supermarket Description', 'Asset Value / Cost'];
  const rows = reportData?.rows || [
    ['INV-9823', 'Dairy', 'Fresh Milk 1L Procurement Reorder', 'Rs. 45,000.00'],
    ['INV-8823', 'Produce', 'Organic Avocados Stock Intake', 'Rs. 201,880.00'],
    ['INV-7721', 'Grocery', 'Ceylon Black Tea Consignment', 'Rs. 132,000.00'],
    ['INV-4412', 'Beverage', 'Spring Water Case Restocking', 'Rs. 84,900.00'],
    ['INV-1102', 'Bakery', 'Whole Wheat Bread Batch Audit', 'Rs. 22,000.00'],
  ];

  if (format === 'pdf') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportName.replace(/_/g, ' ')}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; color: #334155; margin: 40px; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #0b8252; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { display: flex; align-items: center; gap: 12px; }
          .logo-icon { background: #0b8252; color: white; width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 26px; }
          h1 { color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; }
          h2 { color: #0b8252; margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .meta { text-align: right; font-size: 11px; color: #64748b; line-height: 1.5; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .kpi-card { background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; border-left: 4px solid #0b8252; }
          .kpi-title { font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
          .kpi-value { font-size: 18px; font-weight: bold; color: #0f172a; margin: 0; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th { background: #eef8f2; color: #0b8252; font-weight: bold; font-size: 11px; text-transform: uppercase; text-align: left; padding: 10px 14px; border-bottom: 2px solid #bbf7d0; }
          td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; }
          tr:nth-child(even) { background: #f8f9fa; }
          .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            <img src="${brandLogo}" style="width: 48px; height: 48px; object-fit: contain; border-radius: 8px; border: 1px solid #e2e8f0; padding: 2px; background: #fff;" />
            <div>
              <h2>CHAMSON MULTI SHOP</h2>
              <h1>${reportName.replace(/_/g, ' ')}</h1>
            </div>
          </div>
          <div class="meta">
            <p><strong>Branch:</strong> Colombo 03 Branch</p>
            <p><strong>Business Reg:</strong> PV-00283921</p>
            <p><strong>TIN (18% VAT):</strong> 203928172</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-title">Report Period</div>
            <div class="kpi-value">Active Audit</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Total Records</div>
            <div class="kpi-value">${rows.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Currency Standard</div>
            <div class="kpi-value">LKR (Rs.)</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Status</div>
            <div class="kpi-value">Verified</div>
          </div>
        </div>

        <h3>Detailed Data Breakdown</h3>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          &copy; ${new Date().getFullYear()} Chamson Multi Shop. This is a system-generated document.
        </div>
        <script>
          window.onload = () => { window.print(); };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    return;
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  let content = csvContent;
  
  let filename = `${reportName.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.csv`;
  let type = 'text/csv;charset=utf-8;';

  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function Reports() {
  const [activeView, setActiveView] = useState<ViewState>('overview');

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InventoryHeader />

        <main className="flex-1 overflow-y-auto px-6 py-6 bg-[#f8f9fa]">
          <div className="max-w-[1400px] w-full mx-auto space-y-6">

            {activeView === 'overview' && <ReportsOverview onViewChange={setActiveView} />}
            {activeView === 'sales' && <SalesReports onViewChange={setActiveView} />}
            {activeView === 'inventory' && <InventoryReports onViewChange={setActiveView} />}
            {activeView === 'supplier' && <SupplierReports onViewChange={setActiveView} />}
            {activeView === 'activity' && <ActivityReports onViewChange={setActiveView} />}
            {activeView === 'purchase' && <PurchaseReports onViewChange={setActiveView} />}
            {activeView === 'alert' && <AlertReports onViewChange={setActiveView} />}

          </div>
        </main>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// 1. OVERVIEW COMPONENT
// --------------------------------------------------------------------------------
function ReportsOverview({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
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
          <div className="w-16 h-16 bg-white rounded-xl p-1 shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            <img src={brandLogo} alt="Chamson Multi Shop Logo" className="w-full h-full object-contain" />
          </div>
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

// --------------------------------------------------------------------------------
// 2. SALES REPORTS COMPONENT
// --------------------------------------------------------------------------------
function SalesReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Today');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All Departments');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const dataMap = {
    Today: { sales: 'Rs. 248,392.50', salesTrend: '+12.5%', orders: '1,842', ordersTrend: '+8.1%', top: 'Organic Avocados', topUnits: '412', topRev: 'Rs. 201,880.00', chart: [40, 75, 50, 95, 80, 45, 25] },
    Week: { sales: 'Rs. 1,482,900.00', salesTrend: '+8.2%', orders: '12,940', ordersTrend: '+5.4%', top: 'Spring Water 24pk', topUnits: '3,842', topRev: 'Rs. 450,500.00', chart: [60, 55, 80, 75, 95, 100, 85] },
    Month: { sales: 'Rs. 6,293,400.00', salesTrend: '+15.4%', orders: '54,200', ordersTrend: '+12.0%', top: 'Grade A Large Eggs', topUnits: '18,390', topRev: 'Rs. 1,275,500.00', chart: [40, 50, 45, 60, 70, 85, 90] },
    Year: { sales: 'Rs. 75,200,800.00', salesTrend: '+22.1%', orders: '648,300', ordersTrend: '+18.5%', top: 'Organic Avocados', topUnits: '182,400', topRev: 'Rs. 18,376,000.00', chart: [30, 40, 35, 50, 60, 80, 95] },
    'Custom Range': { sales: 'Rs. 104,200.00', salesTrend: '+4.1%', orders: '840', ordersTrend: '+2.1%', top: 'Premium Coffee', topUnits: '240', topRev: 'Rs. 42,000.00', chart: [50, 60, 40, 70, 80, 60, 40] }
  };

  const activeData = dataMap[period] || dataMap['Today'];

  const allProducts = [
    { name: "Grade A Large Eggs (12pk)", cat: "Dairy", sku: "EG-29384-L", qty: 328, price: "Rs. 450.00", rev: "Rs. 147,600.00", status: "IN STOCK", icon: "egg", sClass: "bg-[#dcfce7] text-[#16a34a]" },
    { name: "Organic Avocados", cat: "Produce", sku: "AV-11022-O", qty: 412, price: "Rs. 490.00", rev: "Rs. 201,880.00", status: "LOW STOCK", icon: "eco", sClass: "bg-[#fee2e2] text-[#ef4444]" },
    { name: "Premium Roasted Coffee 500g", cat: "Grocery", sku: "CF-88392-P", qty: 194, price: "Rs. 2,400.00", rev: "Rs. 465,600.00", status: "IN STOCK", icon: "local_cafe", sClass: "bg-[#dcfce7] text-[#16a34a]" },
    { name: "Spring Water 24pk", cat: "Grocery", sku: "WT-77281-S", qty: 582, price: "Rs. 1,450.00", rev: "Rs. 843,900.00", status: "IN STOCK", icon: "water_drop", sClass: "bg-[#dcfce7] text-[#16a34a]" },
    { name: "Cheddar Cheese 200g", cat: "Dairy", sku: "CH-11200-D", qty: 150, price: "Rs. 950.00", rev: "Rs. 142,500.00", status: "IN STOCK", icon: "kitchen", sClass: "bg-[#dcfce7] text-[#16a34a]" },
    { name: "Fresh Strawberries", cat: "Produce", sku: "ST-99001-P", qty: 85, price: "Rs. 890.00", rev: "Rs. 75,650.00", status: "LOW STOCK", icon: "local_dining", sClass: "bg-[#fee2e2] text-[#ef4444]" },
  ];

  const filteredProducts = categoryFilter === 'All Departments' 
    ? allProducts 
    : allProducts.filter(p => p.cat === categoryFilter);

  const handlePeriodChange = (tab: any) => {
    if (tab === 'Custom Range') {
      setShowCustomModal(true);
    } else {
      setPeriod(tab);
    }
  };

  const applyCustomRange = () => {
    setPeriod('Custom Range');
    setShowCustomModal(false);
  };

  const reportName = period === 'Custom Range' && dateRange.start && dateRange.end
    ? `Sales_Report_${dateRange.start}_to_${dateRange.end}`
    : `Sales_Report_${period}`;

  const reportHeaders = ['Product Name', 'Category', 'SKU', 'Qty Sold', 'Price', 'Revenue', 'Status'];
  const reportRows = filteredProducts.map(p => [p.name, p.cat, p.sku, p.qty, p.price, p.rev, p.status]);
  const reportData = { headers: reportHeaders, rows: reportRows };

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      
      {/* Custom Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b8252]">date_range</span>
                Custom Date Range
              </h3>
              <button onClick={() => setShowCustomModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Start Date</label>
                <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">End Date</label>
                <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowCustomModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
              <button onClick={applyCustomRange} className="px-5 py-2.5 text-sm font-bold text-white bg-[#0b8252] hover:bg-[#096b43] rounded-lg shadow-sm transition-colors">Apply Range</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => onViewChange('overview')} className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b8252] transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Overview
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Sales Reports</h2>
          <p className="text-slate-500 text-sm mt-1">
            Analyze performance metrics and revenue streams across periods.
            {period === 'Custom Range' && dateRange.start && dateRange.end && (
              <span className="ml-2 font-bold text-[#0b8252]">({dateRange.start} to {dateRange.end})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF
          </button>
          <button onClick={() => downloadReport(reportName, 'excel', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Export Excel
          </button>
          <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-2 bg-[#0b8252] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors">
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print Report
          </button>
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex bg-[#f1f5f9] p-1 rounded-lg border border-slate-200 w-fit">
        {['Today', 'Week', 'Month', 'Year', 'Custom Range'].map(tab => {
          let tabLabel = tab;
          if (tab === 'Custom Range' && period === 'Custom Range' && dateRange.start && dateRange.end) {
            tabLabel = `${dateRange.start} to ${dateRange.end}`;
          }
          return (
          <button 
            key={tab}
            onClick={() => handlePeriodChange(tab)}
            className={`px-5 py-1.5 text-sm font-medium rounded-md flex items-center gap-1 transition-colors ${period === tab ? 'bg-white text-[#0b8252] font-bold shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            {tab === 'Custom Range' && <span className="material-symbols-outlined text-[16px]">calendar_today</span>}
            {tabLabel}
          </button>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center transition-all duration-300">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <span className="material-symbols-outlined text-[16px]">payments</span>
            <p className="text-xs font-bold uppercase tracking-wider">Total Sales</p>
          </div>
          <h3 className="text-4xl font-bold text-slate-800 tracking-tight">{activeData.sales}</h3>
          <p className="text-xs font-bold text-[#10b981] mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> {activeData.salesTrend}
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center transition-all duration-300">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
            <p className="text-xs font-bold uppercase tracking-wider">Total Orders</p>
          </div>
          <h3 className="text-4xl font-bold text-slate-800 tracking-tight">{activeData.orders}</h3>
          <p className="text-xs font-bold text-[#10b981] mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> {activeData.ordersTrend}
          </p>
        </div>

        {/* Top Selling Product */}
        <div className="bg-[#eef8f2] rounded-xl border border-[#bbf7d0] p-6 shadow-sm flex flex-col justify-center relative overflow-hidden transition-all duration-300">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[#0b8252] mb-1">
              <span className="material-symbols-outlined text-[16px]">stars</span>
              <p className="text-xs font-bold uppercase tracking-wider">Top Selling Product</p>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 leading-tight truncate">{activeData.top}</h3>
            <div className="mt-3">
              <p className="text-xs text-slate-600 mb-0.5">{activeData.topUnits} Units Sold</p>
              <p className="text-sm font-bold text-[#0b8252]">Revenue: {activeData.topRev}</p>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-[#0b8252] opacity-10">
            shopping_basket
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-lg text-slate-800">Inventory Sales Detail</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0b8252]/20 focus:border-[#0b8252]"
              >
                <option value="All Departments">All Departments</option>
                <option value="Grocery">Grocery</option>
                <option value="Produce">Produce</option>
                <option value="Dairy">Dairy</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">
                expand_more
              </span>
            </div>
            <button className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Quantity Sold</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Unit Price</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Revenue</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#eef8f2] flex items-center justify-center text-[#0b8252]">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">SKU: {item.sku}</p>
                    </div>
                  </td>
                  <td className="p-4 text-center font-medium text-slate-700">{item.qty}</td>
                  <td className="p-4 text-center font-medium text-slate-700">{item.price}</td>
                  <td className="p-4 text-right font-bold text-slate-800">{item.rev}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full whitespace-nowrap ${item.sClass}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No products found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>Showing {filteredProducts.length > 0 ? 1 : 0} to {filteredProducts.length} of {filteredProducts.length} products</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0b8252] text-white font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// 3. INVENTORY REPORTS COMPONENT
// --------------------------------------------------------------------------------
function InventoryReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const dataMap: Record<string, any> = {
    Today: { val: 'Rs. 14,250,000', prod: '1,842', low: '156', exp: '24', t1: '+3.2%', t2: '-12', t3: '+5', chart: [30, 45, 40, 55, 50, 65, 70] },
    Week: { val: 'Rs. 13,920,000', prod: '1,830', low: '180', exp: '12', t1: '-1.5%', t2: '+24', t3: '-12', chart: [40, 35, 55, 45, 60, 50, 40] },
    Month: { val: 'Rs. 14,500,000', prod: '1,900', low: '140', exp: '30', t1: '+5.0%', t2: '-16', t3: '+6', chart: [40, 65, 45, 80, 55, 90, 70] },
    Year: { val: 'Rs. 16,000,000', prod: '2,100', low: '100', exp: '45', t1: '+12.0%', t2: '-56', t3: '+21', chart: [50, 60, 55, 70, 75, 85, 90] },
    'Custom Range': { val: 'Rs. 14,000,000', prod: '1,850', low: '160', exp: '20', t1: '+1.0%', t2: '+4', t3: '-4', chart: [45, 55, 50, 65, 60, 75, 80] }
  };

  const activeData = dataMap[period] || dataMap['Month'];

  const handlePeriodChange = (tab: any) => {
    if (tab === 'Custom Range') {
      setShowCustomModal(true);
    } else {
      setPeriod(tab);
    }
  };

  const applyCustomRange = () => {
    setPeriod('Custom Range');
    setShowCustomModal(false);
  };

  const reportName = period === 'Custom Range' && dateRange.start && dateRange.end
    ? `Inventory_Report_${dateRange.start}_to_${dateRange.end}`
    : `Inventory_Report_${period}`;

  const allItems = [
    { name: "Whole Milk 2L", cat: "Dairy", qty: 245, sold: 180, status: "In Stock", sColor: "bg-[#10b981]/10 text-[#10b981]", dot: "bg-[#10b981]" },
    { name: "Jasmine Rice 5kg", cat: "Pantry", qty: 12, sold: 45, status: "Low Stock", sColor: "bg-[#f59e0b]/10 text-[#d97706]", dot: "bg-[#f59e0b]" },
    { name: "Olive Oil 1L", cat: "Pantry", qty: 89, sold: 22, status: "In Stock", sColor: "bg-[#10b981]/10 text-[#10b981]", dot: "bg-[#10b981]" },
    { name: "Fresh Strawberries", cat: "Produce", qty: 0, sold: 120, status: "Expired", sColor: "bg-[#ef4444]/10 text-[#ef4444]", dot: "bg-[#ef4444]" },
    { name: "Cheddar Cheese", cat: "Dairy", qty: 450, sold: 30, status: "Overstock", sColor: "bg-[#3b82f6]/10 text-[#3b82f6]", dot: "bg-[#3b82f6]" },
    { name: "Whole Wheat Bread", cat: "Bakery", qty: 5, sold: 88, status: "Low Stock", sColor: "bg-[#f59e0b]/10 text-[#d97706]", dot: "bg-[#f59e0b]" }
  ];

  const filteredItems = allItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'All Categories' || item.cat === categoryFilter || (categoryFilter === 'Dairy & Eggs' && item.cat === 'Dairy') || (categoryFilter === 'Fresh Produce' && item.cat === 'Produce');
    const matchStatus = statusFilter === 'All Statuses' || item.status.includes(statusFilter) || (statusFilter === 'Expired' && item.status === 'Expired');
    return matchSearch && matchCat && matchStatus;
  });

  const reportHeaders = ['Product', 'Category', 'Qty', 'Sold', 'Status'];
  const reportRows = filteredItems.map(p => [p.name, p.cat, p.qty, p.sold, p.status]);
  const reportData = { headers: reportHeaders, rows: reportRows };

  // Dynamic calculations for Stock Status pie chart
  const totalProductsCount = parseInt(activeData.prod.replace(/,/g, '')) || 1900;
  const lowStockCount = parseInt(activeData.low.replace(/,/g, '')) || 0;
  const expiredCount = parseInt(activeData.exp.replace(/,/g, '')) || 0;
  const inStockCount = Math.max(0, totalProductsCount - lowStockCount - expiredCount);
  
  const inStockPct = (inStockCount / totalProductsCount) * 100;
  const lowPct = (lowStockCount / totalProductsCount) * 100;
  // expPct is the remainder up to 100%

  return (
    <div className="animate-in fade-in duration-300 space-y-6 pb-12">
      {/* Custom Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b8252]">date_range</span>
                Custom Date Range
              </h3>
              <button onClick={() => setShowCustomModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Start Date</label>
                <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">End Date</label>
                <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowCustomModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
              <button onClick={applyCustomRange} className="px-5 py-2.5 text-sm font-bold text-white bg-[#0b8252] hover:bg-[#096b43] rounded-lg shadow-sm transition-colors">Apply Range</button>
            </div>
          </div>
        </div>
      )}

      {/* 1. PAGE HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => onViewChange('overview')} className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b8252] transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Overview
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Inventory Reports</h2>
          <p className="text-slate-500 text-sm mt-1">
            Monitor stock levels, expiry risks, and inventory status.
            {period === 'Custom Range' && dateRange.start && dateRange.end && (
              <span className="ml-2 font-bold text-[#0b8252]">({dateRange.start} to {dateRange.end})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-2 bg-gradient-to-r from-[#0b8252] to-[#096b43] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <span className="material-symbols-outlined text-[18px]">post_add</span>
            Generate Report
          </button>
          <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition-all">
            <span className="material-symbols-outlined text-[18px] text-red-500">picture_as_pdf</span>
            Export PDF
          </button>
          <button onClick={() => downloadReport(reportName, 'excel', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition-all">
            <span className="material-symbols-outlined text-[18px] text-green-600">table_chart</span>
            Export Excel
          </button>
        </div>
      </div>

      {/* 3. REPORT PERIOD FILTER */}
      <div className="flex bg-[#f1f5f9] p-1 rounded-xl border border-slate-200 w-fit shadow-sm">
        {['Today', 'Week', 'Month', 'Year', 'Custom Range'].map(tab => {
          let tabLabel = tab;
          if (tab === 'Custom Range' && period === 'Custom Range' && dateRange.start && dateRange.end) {
            tabLabel = `${dateRange.start} to ${dateRange.end}`;
          }
          return (
          <button 
            key={tab}
            onClick={() => handlePeriodChange(tab)}
            className={`px-6 py-2 text-sm font-bold rounded-lg flex items-center gap-1 transition-all ${period === tab ? 'bg-white text-[#0b8252] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {tab === 'Custom Range' && <span className="material-symbols-outlined text-[16px]">calendar_today</span>}
            {tabLabel}
          </button>
          );
        })}
      </div>

      {/* 2. KPI SECTION (Glassmorphism) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Inventory Value */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 hover:-translate-y-1 transition-transform group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0b8252]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#eef8f2] to-[#dcfce7] text-[#0b8252] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-xs font-bold text-[#10b981] flex items-center gap-0.5 bg-[#dcfce7] px-2 py-1 rounded-full"><span className="material-symbols-outlined text-[12px]">trending_up</span> {activeData.t1}</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeData.val}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Inventory Value</p>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 hover:-translate-y-1 transition-transform group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-[#3b82f6] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined">category</span>
            </div>
            <span className="text-xs font-bold text-[#3b82f6] flex items-center gap-0.5 bg-blue-50 px-2 py-1 rounded-full">Optimized</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeData.prod}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Products</p>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 hover:-translate-y-1 transition-transform group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f59e0b]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fef3c7] to-[#fde68a] text-[#d97706] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <span className="text-xs font-bold text-[#d97706] flex items-center gap-0.5 bg-[#fef3c7] px-2 py-1 rounded-full"><span className="material-symbols-outlined text-[12px]">{activeData.t2.startsWith('-') ? 'trending_down' : 'trending_up'}</span> {activeData.t2}</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeData.low}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Low Stock Items</p>
          </div>
        </div>

        {/* Expired Items */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 hover:-translate-y-1 transition-transform group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef4444]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fee2e2] to-[#fecaca] text-[#ef4444] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined">event_busy</span>
            </div>
            <span className="text-xs font-bold text-[#ef4444] flex items-center gap-0.5 bg-[#fee2e2] px-2 py-1 rounded-full"><span className="material-symbols-outlined text-[12px]">{activeData.t3.startsWith('-') ? 'trending_down' : 'trending_up'}</span> {activeData.t3}</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeData.exp}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Expired Items</p>
          </div>
        </div>
      </div>
      
      {/* 4. SIMPLE FILTER BAR */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row gap-3 relative z-20">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product..."
            className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative min-w-[160px]">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#0b8252] transition-all cursor-pointer"
            >
              <option>All Categories</option>
              <option>Dairy & Eggs</option>
              <option>Fresh Produce</option>
              <option>Pantry</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <div className="relative min-w-[160px]">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#0b8252] transition-all cursor-pointer"
            >
              <option>All Statuses</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Expired</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <button className="bg-[#0b8252] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors whitespace-nowrap">
            Apply Filters
          </button>
          <button 
            onClick={() => { setSearchQuery(''); setCategoryFilter('All Categories'); setStatusFilter('All Statuses'); }}
            className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5. LIGHT ANALYTICS SECTION */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inventory Trend Chart Placeholder */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 hover:-translate-y-1 transition-transform">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-[#0b8252]">bar_chart</span> Inventory by Category</h3>
            <div className="h-[180px] flex items-end justify-between gap-2 border-b border-slate-100 pb-2 relative">
              <div className="absolute top-1/4 w-full border-t border-dashed border-slate-200"></div>
              <div className="absolute top-2/4 w-full border-t border-dashed border-slate-200"></div>
              <div className="absolute top-3/4 w-full border-t border-dashed border-slate-200"></div>
              {[...(activeData.chart || [40, 65, 45, 80, 55, 90, 70])].map((h, i) => {
                const categories = ['Dairy', 'Pantry', 'Produce', 'Bakery', 'Snacks', 'Meat', 'Frozen'];
                return (
                  <div key={i} className="w-full relative group h-full flex items-end justify-center">
                    <div className="w-3/4 bg-gradient-to-t from-[#0b8252]/20 to-[#0b8252] rounded-t-sm relative z-10 transition-all duration-300 group-hover:opacity-80" style={{ height: `${h}%` }}></div>
                    <span className="absolute -top-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">{categories[i]}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-2 px-1 text-[10px] font-bold text-slate-400">
              <span>Dairy</span><span>Pantry</span><span>Produce</span><span>Bakery</span><span>Snacks</span><span>Meat</span><span>Frozen</span>
            </div>
          </div>

          {/* Stock Status Pie Placeholder */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 hover:-translate-y-1 transition-transform">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-[#0b8252]">pie_chart</span> Stock Status</h3>
            <div className="flex flex-col items-center justify-center h-[180px]">
              <div className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-inner transition-all duration-500" style={{ background: `conic-gradient(#10b981 0% ${inStockPct}%, #f59e0b ${inStockPct}% ${inStockPct + lowPct}%, #ef4444 ${inStockPct + lowPct}% 100%)` }}>
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center flex-col shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                  <span className="text-2xl font-bold text-slate-800">{activeData.prod}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total</span>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#10b981]"></span><span className="text-xs font-medium text-slate-600">In Stock</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span><span className="text-xs font-medium text-slate-600">Low</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#ef4444]"></span><span className="text-xs font-medium text-slate-600">Expired</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* 6. QUICK INSIGHTS PANEL */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg p-6 flex-1 text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#0b8252] rounded-full blur-3xl opacity-30 pointer-events-none"></div>
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2 relative z-10"><span className="material-symbols-outlined text-[#10b981]">lightbulb</span> Quick Insights</h3>
            <ul className="space-y-4 relative z-10">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#fef3c7]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span></div>
                <p className="text-sm text-slate-300 leading-snug">Low stock detected in <strong className="text-white">Dairy</strong> category</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#fee2e2]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span></div>
                <p className="text-sm text-slate-300 leading-snug"><strong className="text-white">{activeData.exp} products</strong> need immediate restocking</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#dcfce7]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span></div>
                <p className="text-sm text-slate-300 leading-snug"><strong className="text-white">Beverages</strong> are the fastest moving category</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span></div>
                <p className="text-sm text-slate-300 leading-snug">Inventory is <strong className="text-white">stable</strong> compared to {period === 'Today' ? 'yesterday' : 'last period'}</p>
              </li>
            </ul>
          </div>

          {/* 7. QUICK ACCESS PANEL */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Quick Access</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onViewChange('activity')} className="flex flex-col items-center justify-center gap-2 bg-[#f8f9fa] border border-slate-200 p-3 rounded-xl hover:bg-[#eef8f2] hover:border-[#bbf7d0] hover:text-[#0b8252] hover:shadow-md text-slate-600 transition-all duration-300 group">
                <span className="material-symbols-outlined text-[24px] group-hover:scale-110 group-hover:-translate-y-1 transition-transform">add_box</span>
                <span className="text-xs font-bold">Add Stock</span>
              </button>
              <button onClick={() => onViewChange('purchase')} className="flex flex-col items-center justify-center gap-2 bg-[#f8f9fa] border border-slate-200 p-3 rounded-xl hover:bg-[#eef8f2] hover:border-[#bbf7d0] hover:text-[#0b8252] hover:shadow-md text-slate-600 transition-all duration-300 group">
                <span className="material-symbols-outlined text-[24px] group-hover:scale-110 group-hover:-translate-y-1 transition-transform">receipt_long</span>
                <span className="text-xs font-bold">Create PO</span>
              </button>
              <button onClick={() => onViewChange('alert')} className="flex flex-col items-center justify-center gap-2 bg-[#f8f9fa] border border-slate-200 p-3 rounded-xl hover:bg-[#fef3c7] hover:border-[#fde68a] hover:text-[#d97706] hover:shadow-md text-slate-600 transition-all duration-300 group">
                <span className="material-symbols-outlined text-[24px] group-hover:scale-110 group-hover:-translate-y-1 transition-transform">warning</span>
                <span className="text-xs font-bold text-center">View Low</span>
              </button>
              <button onClick={() => onViewChange('alert')} className="flex flex-col items-center justify-center gap-2 bg-[#f8f9fa] border border-slate-200 p-3 rounded-xl hover:bg-[#fee2e2] hover:border-[#fecaca] hover:text-[#ef4444] hover:shadow-md text-slate-600 transition-all duration-300 group">
                <span className="material-symbols-outlined text-[24px] group-hover:scale-110 group-hover:-translate-y-1 transition-transform">event_busy</span>
                <span className="text-xs font-bold text-center">Mark Expired</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 8. INVENTORY REPORT TABLE */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-800">Inventory Status</h3>
            <button className="text-sm font-bold text-[#0b8252] hover:text-[#096b43] transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-slate-50/90 backdrop-blur z-10 shadow-sm">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sold</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredItems.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 font-bold text-slate-800">{item.name}</td>
                    <td className="p-4 text-slate-600 font-medium">{item.cat}</td>
                    <td className="p-4 font-bold text-slate-800">{item.qty}</td>
                    <td className="p-4 text-slate-600">{item.sold}</td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${item.sColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`}></span>
                        {item.status}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-[#0b8252] transition-colors p-1 rounded hover:bg-[#eef8f2]">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No products match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500">Showing {filteredItems.length > 0 ? 1 : 0}-{filteredItems.length} of {filteredItems.length} items</span>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white transition-colors"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
              <button className="w-8 h-8 rounded bg-[#0b8252] text-white font-bold text-xs flex items-center justify-center shadow-sm">1</button>
              <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white transition-colors"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
            </div>
          </div>
        </div>

        {/* 10. RECENT REPORTS PANEL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Recent Reports</h3>
          <div className="space-y-4">
            {[
              { name: "Daily Stock Report", date: "Today, 08:30 AM", type: "PDF", icon: "picture_as_pdf", color: "text-red-500", bg: "bg-red-50" },
              { name: "Weekly Summary", date: "Yesterday, 17:00 PM", type: "XLSX", icon: "table_chart", color: "text-green-600", bg: "bg-green-50" },
              { name: "Expiry Report", date: "Oct 22, 09:15 AM", type: "PDF", icon: "picture_as_pdf", color: "text-red-500", bg: "bg-red-50" }
            ].map((report, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group cursor-pointer bg-slate-50/50 hover:bg-white">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.bg} ${report.color}`}>
                    <span className="material-symbols-outlined text-[20px]">{report.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#0b8252] transition-colors">{report.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{report.date}</p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-[#eef8f2] group-hover:text-[#0b8252] transition-colors">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-500 hover:border-[#0b8252] hover:text-[#0b8252] transition-colors">
            View Archive
          </button>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// 4. SUPPLIER REPORTS COMPONENT
// --------------------------------------------------------------------------------
function SupplierReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  const dataMap: Record<string, any> = {
    Today: { sup: '142', act: '138', time: '2.4 Days', t1: '+12.5%', t2: '97.1%', t3: '+0.3 days' },
    Week: { sup: '140', act: '135', time: '2.2 Days', t1: '+10.0%', t2: '96.4%', t3: '-0.1 days' },
    Month: { sup: '142', act: '138', time: '2.4 Days', t1: '+12.5%', t2: '97.1%', t3: '+0.3 days' },
    Year: { sup: '150', act: '145', time: '1.8 Days', t1: '+20.0%', t2: '96.6%', t3: '-0.5 days' },
    'Custom Range': { sup: '141', act: '137', time: '2.3 Days', t1: '+11.0%', t2: '97.0%', t3: '+0.1 days' }
  };

  const activeData = dataMap[period] || dataMap['Month'];

  const handlePeriodChange = (tab: any) => {
    if (tab === 'Custom Range') {
      setShowCustomModal(true);
    } else {
      setPeriod(tab);
    }
  };

  const applyCustomRange = () => {
    setPeriod('Custom Range');
    setShowCustomModal(false);
  };

  const reportName = period === 'Custom Range' && dateRange.start && dateRange.end
    ? `Supplier_Report_${dateRange.start}_to_${dateRange.end}`
    : `Supplier_Report_${period}`;

  const allSuppliers = [
    {
      name: "Green Harvest Co.", sku: "SUP-8821", initials: "GH", email: "sarah.lee@harvest.com", phone: "+1 (555) 012-9934",
      cats: [{ l: "FRESH PRODUCE", c: "bg-[#eef8f2] text-[#0b8252]" }, { l: "ORGANIC", c: "bg-[#f1f5f9] text-slate-600" }],
      products: 45, pct: 25, date: "Oct 24, 2023", status: "Active", sClass: "bg-[#eef8f2] text-[#0b8252]"
    },
    {
      name: "Dairy Alliance", sku: "SUP-4491", initials: "DA", email: "orders@dairyall.net", phone: "+1 (555) 234-5501",
      cats: [{ l: "DAIRY", c: "bg-blue-50 text-blue-600" }, { l: "FROZEN", c: "bg-indigo-50 text-indigo-600" }],
      products: 112, pct: 60, date: "Oct 26, 2023", status: "Active", sClass: "bg-[#eef8f2] text-[#0b8252]"
    },
    {
      name: "Nature's Bake", sku: "SUP-1102", initials: "NB", email: "contact@naturesbake.co", phone: "+1 (555) 901-2211",
      cats: [{ l: "BAKERY", c: "bg-[#fef3c7] text-[#d97706]" }],
      products: 18, pct: 10, date: "Sep 12, 2023", status: "Inactive", sClass: "bg-slate-100 text-slate-500"
    },
    {
      name: "Prime Foods Dist.", sku: "SUP-7722", initials: "PF", email: "logistics@primefoods.com", phone: "+1 (555) 773-1010",
      cats: [{ l: "MEAT & POULTRY", c: "bg-[#fee2e2] text-[#ef4444]" }, { l: "CANNED GOODS", c: "bg-[#ffedd5] text-[#ea580c]" }],
      products: 240, pct: 90, date: "Oct 27, 2023", status: "Active", sClass: "bg-[#eef8f2] text-[#0b8252]"
    },
  ];

  const filteredSuppliers = allSuppliers.filter(item => filter === 'All' || item.status === filter);

  const reportHeaders = ['Supplier Name', 'SKU', 'Email', 'Products', 'Last Supply', 'Status'];
  const reportRows = filteredSuppliers.map(p => [p.name, p.sku, p.email, p.products, p.date, p.status]);
  const reportData = { headers: reportHeaders, rows: reportRows };

  return (
    <div className="animate-in fade-in duration-300 space-y-6 pb-12">
      {/* Custom Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b8252]">date_range</span>
                Custom Date Range
              </h3>
              <button onClick={() => setShowCustomModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Start Date</label>
                <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">End Date</label>
                <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowCustomModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
              <button onClick={applyCustomRange} className="px-5 py-2.5 text-sm font-bold text-white bg-[#0b8252] hover:bg-[#096b43] rounded-lg shadow-sm transition-colors">Apply Range</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => onViewChange('overview')} className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b8252] transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Overview
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Supplier Performance Reports</h2>
          <p className="text-slate-500 text-sm mt-1">
            Evaluate supplier lead times, fulfillment rates, and delivery quality metrics.
            {period === 'Custom Range' && dateRange.start && dateRange.end && (
              <span className="ml-2 font-bold text-[#0b8252]">({dateRange.start} to {dateRange.end})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF
          </button>
          <button onClick={() => downloadReport(reportName, 'excel', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Export Excel
          </button>
          <button className="flex items-center gap-2 bg-[#0b8252] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors">
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print Report
          </button>
        </div>
      </div>

      {/* 3. REPORT PERIOD FILTER */}
      <div className="flex bg-[#f1f5f9] p-1 rounded-xl border border-slate-200 w-fit shadow-sm">
        {['Today', 'Week', 'Month', 'Year', 'Custom Range'].map(tab => {
          let tabLabel = tab;
          if (tab === 'Custom Range' && period === 'Custom Range' && dateRange.start && dateRange.end) {
            tabLabel = `${dateRange.start} to ${dateRange.end}`;
          }
          return (
          <button 
            key={tab}
            onClick={() => handlePeriodChange(tab)}
            className={`px-6 py-2 text-sm font-bold rounded-lg flex items-center gap-1 transition-all ${period === tab ? 'bg-white text-[#0b8252] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {tab === 'Custom Range' && <span className="material-symbols-outlined text-[16px]">calendar_today</span>}
            {tabLabel}
          </button>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Suppliers */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden flex flex-col justify-center h-[130px]">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded bg-[#eef8f2] text-[#0b8252] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">groups</span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Suppliers</p>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeData.sup}</h3>
            <p className="text-xs font-bold text-[#10b981] mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> {activeData.t1} vs last {period.toLowerCase()}
            </p>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        </div>

        {/* Active Suppliers */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden flex flex-col justify-center h-[130px]">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded bg-[#dcfce7] text-[#16a34a] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Suppliers</p>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeData.act}</h3>
            <p className="text-xs font-bold text-[#0b8252] mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span> {activeData.t2} Retention rate
            </p>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#eef8f2] rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none opacity-50"></div>
        </div>

        {/* Avg Lead Time */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden flex flex-col justify-center h-[130px]">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded bg-[#fef3c7] text-[#d97706] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg. Lead Time</p>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeData.time}</h3>
            <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${activeData.t3.startsWith('+') ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
              <span className="material-symbols-outlined text-[14px]">{activeData.t3.startsWith('+') ? 'trending_up' : 'trending_down'}</span> {activeData.t3} lag spike
            </p>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#fffedd] rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none opacity-50"></div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-lg text-slate-800">Supplier Directory</h3>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#f1f5f9] p-1 rounded-lg border border-slate-200">
              {['All', 'Active', 'Inactive'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setFilter(tab as any)}
                  className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${filter === tab ? 'bg-white text-slate-800 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Details</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Main Categories</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Supply Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSuppliers.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded font-bold text-sm bg-slate-100 text-slate-600 flex items-center justify-center">
                      {item.initials}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{item.sku}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-700 font-medium">{item.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.phone}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {item.cats.map((c, idx) => (
                        <span key={idx} className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${c.c}`}>{c.l}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5 w-32">
                      <span className="font-bold text-slate-800">{item.products} Items</span>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0b8252] rounded-full" style={{ width: `${item.pct}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{item.date}</td>
                  <td className="p-4 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full ${item.sClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-[#10b981]' : 'bg-slate-400'}`}></span>
                      {item.status}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-slate-400 hover:text-[#0b8252] transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No suppliers match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>Showing <strong>{filteredSuppliers.length > 0 ? 1 : 0} - {filteredSuppliers.length}</strong> of <strong>{filteredSuppliers.length}</strong> suppliers</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0b8252] text-white font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// 5. ACTIVITY REPORTS COMPONENT
// --------------------------------------------------------------------------------
function ActivityReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Today');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [userFilter, setUserFilter] = useState('All Users');
  const [actionFilter, setActionFilter] = useState('All Actions');

  const dataMap: Record<string, any> = {
    Today: { logs: '1,248', waste: '42 kg', over: '15', mgrs: '8', t1: '+12.5%' },
    Week: { logs: '8,450', waste: '310 kg', over: '95', mgrs: '12', t1: '+5.2%' },
    Month: { logs: '35,200', waste: '1,400 kg', over: '420', mgrs: '14', t1: '-2.1%' },
    Year: { logs: '420,000', waste: '15,000 kg', over: '4,500', mgrs: '15', t1: '+1.5%' },
    'Custom Range': { logs: '4,000', waste: '120 kg', over: '45', mgrs: '10', t1: 'N/A' }
  };

  const activeData = dataMap[period] || dataMap['Today'];

  const handlePeriodChange = (tab: any) => {
    if (tab === 'Custom Range') {
      setShowCustomModal(true);
    } else {
      setPeriod(tab);
    }
  };

  const applyCustomRange = () => {
    setPeriod('Custom Range');
    setShowCustomModal(false);
  };

  const reportName = period === 'Custom Range' && dateRange.start && dateRange.end
    ? `Activity_Report_${dateRange.start}_to_${dateRange.end}`
    : `Activity_Report_${period}`;

  const allLogs = [
    { time: "Today, 14:24", date: "Oct 24, 2023", prod: "Organic Eggs (12pk)", sku: "SKU: EG-7721", action: "Stock Added", qty: "+120", user: "Sarah Chen", avatar: "SC", aClass: "bg-[#eef8f2] text-[#0b8252]", qClass: "text-[#10b981]" },
    { time: "Today, 13:10", date: "Oct 24, 2023", prod: "Sparkling Water 500ml", sku: "SKU: DR-0045", action: "Waste Removed", qty: "-14", user: "Alex Rivera", avatar: "AR", aClass: "bg-[#fee2e2] text-[#ef4444]", qClass: "text-[#ef4444]" },
    { time: "Today, 11:45", date: "Oct 24, 2023", prod: "Greek Yogurt 500g", sku: "SKU: DA-1120", action: "Manual Adjustment", qty: "+5", user: "Mike Ross", avatar: "MR", aClass: "bg-slate-100 text-slate-600", qClass: "text-slate-600" },
    { time: "Oct 23, 17:50", date: "Oct 23, 2023", prod: "Aluminum Foil 25m", sku: "SKU: HH-4402", action: "Stock Added", qty: "+50", user: "Sarah Chen", avatar: "SC", aClass: "bg-[#eef8f2] text-[#0b8252]", qClass: "text-[#10b981]" },
  ];

  const uniqueUsers = Array.from(new Set(allLogs.map(l => l.user)));
  const uniqueActions = Array.from(new Set(allLogs.map(l => l.action)));

  const filteredLogs = allLogs.filter(l => 
    (userFilter === 'All Users' || l.user === userFilter) &&
    (actionFilter === 'All Actions' || l.action === actionFilter)
  );

  const reportHeaders = ['Date', 'Time', 'Product', 'SKU', 'Action', 'Qty Change', 'Updated By'];
  const reportRows = filteredLogs.map(p => [p.date, p.time.split(', ')[1] || p.time, p.prod, p.sku, p.action, p.qty, p.user]);
  const reportData = { headers: reportHeaders, rows: reportRows };

  return (
    <div className="animate-in fade-in duration-300 space-y-6 pb-12">
      {/* Custom Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b8252]">date_range</span>
                Custom Date Range
              </h3>
              <button onClick={() => setShowCustomModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Start Date</label>
                <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">End Date</label>
                <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowCustomModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
              <button onClick={applyCustomRange} className="px-5 py-2.5 text-sm font-bold text-white bg-[#0b8252] hover:bg-[#096b43] rounded-lg shadow-sm transition-colors">Apply Range</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => onViewChange('overview')} className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b8252] transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Overview
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Activity Reports</h2>
          <p className="text-slate-500 text-sm mt-1">
            Real-time audit trail of all inventory updates across the supermarket network.
            {period === 'Custom Range' && dateRange.start && dateRange.end && (
              <span className="ml-2 font-bold text-[#0b8252]">({dateRange.start} to {dateRange.end})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => downloadReport(reportName, 'csv', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Export CSV
          </button>
          <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
          <div className="flex bg-[#f1f5f9] p-1 rounded-xl border border-slate-200 w-fit">
            {['Today', 'Week', 'Month', 'Year', 'Custom Range'].map(tab => {
              let tabLabel = tab;
              if (tab === 'Custom Range' && period === 'Custom Range' && dateRange.start && dateRange.end) {
                tabLabel = `${dateRange.start} to ${dateRange.end}`;
              }
              return (
              <button 
                key={tab}
                onClick={() => handlePeriodChange(tab)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${period === tab ? 'bg-white text-[#0b8252] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {tab === 'Custom Range' && <span className="material-symbols-outlined text-[14px]">calendar_today</span>}
                {tabLabel}
              </button>
              );
            })}
          </div>

          <div className="relative">
            <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Users</option>
              {uniqueUsers.map(u => <option key={u}>{u}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <div className="relative">
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Actions</option>
              {uniqueActions.map(a => <option key={a}>{a}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
        </div>
        <button onClick={() => {setUserFilter('All Users'); setActionFilter('All Actions'); setPeriod('Today');}} className="text-sm font-bold text-slate-400 hover:text-[#0b8252] transition-colors self-end lg:self-auto">Reset Filters</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Total Logs</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.logs}</h3>
          <p className="text-[10px] font-bold text-[#10b981] mt-1">{activeData.t1} from last {period.toLowerCase()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Waste Recorded</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.waste}</h3>
          <p className="text-[10px] font-bold text-[#ef4444] mt-1">Alert: Fresh Produce high waste</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Manual Overrides</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.over}</h3>
          <p className="text-[10px] font-bold text-[#d97706] mt-1">Requires review by Admin</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Active Managers</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.mgrs}</h3>
          <p className="text-[10px] font-bold text-[#0b8252] mt-1">Peak shift active</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Qty Change</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Updated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLogs.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{item.time}</p>
                    <p className="text-[10px] text-slate-500">{item.date}</p>
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200"></div>
                    <div>
                      <p className="font-bold text-slate-800">{item.prod}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{item.sku}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.aClass}`}>
                      {item.action}
                    </span>
                  </td>
                  <td className={`p-4 text-center font-bold text-lg ${item.qClass}`}>{item.qty}</td>
                  <td className="p-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 flex items-center justify-center">
                      {item.avatar}
                    </div>
                    <span className="text-slate-700 font-medium">{item.user}</span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No activity matches your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
          <p>Showing <strong>{filteredLogs.length > 0 ? 1 : 0} - {filteredLogs.length}</strong> of <strong>{filteredLogs.length}</strong> logs</p>
          <div className="flex gap-1">
            <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
            <button className="w-6 h-6 flex items-center justify-center rounded bg-[#0b8252] text-white font-bold text-xs">1</button>
            <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        {/* Inventory Trends */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Inventory Trends</h3>
              <p className="text-xs text-slate-500">Volume of changes over the last 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0b8252]"></span> Additions</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> Waste</div>
            </div>
          </div>
          <div className="h-[180px] flex items-end justify-between px-4 border-b border-slate-100 pb-2">
            {[
              { a: 60, w: 10, d: "Mon" },
              { a: 85, w: 20, d: "Tue" },
              { a: 40, w: 35, d: "Wed" },
              { a: 90, w: 15, d: "Thu" },
              { a: 100, w: 25, d: "Fri" },
              { a: 30, w: 5, d: "Sat" },
              { a: 20, w: 0, d: "Sun" },
            ].map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2 h-full justify-end w-12">
                <div className="flex items-end gap-1 w-full h-full">
                  <div className="w-1/2 bg-[#0b8252] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${day.a}%` }}></div>
                  <div className="w-1/2 bg-[#ef4444] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${day.w}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-4 mt-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-slate-400 w-12 text-center">{d}</span>
            ))}
          </div>
        </div>

        {/* Live Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Live Activity</h3>
          <div className="flex-1 space-y-6">
            <div className="flex gap-3">
              <div className="relative mt-1">
                <span className="w-2 h-2 rounded-full bg-[#10b981] absolute -left-[5px] top-1.5 animate-pulse"></span>
                <div className="w-0.5 h-full bg-slate-100 absolute left-[2.5px] top-4"></div>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">New stock delivery arrived</p>
                <p className="text-xs text-slate-500 mt-0.5">Batch #8821 for Produce section</p>
                <p className="text-[10px] font-bold text-[#0b8252] mt-1">2 minutes ago</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative mt-1">
                <span className="w-2 h-2 rounded-full bg-[#ef4444] absolute -left-[5px] top-1.5"></span>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">Low stock alert</p>
                <p className="text-xs text-slate-500 mt-0.5">Whole Milk 1L - 3 units left</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">15 minutes ago</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 text-center text-sm font-bold text-[#0b8252] hover:underline pt-4 border-t border-slate-100">
            View All Live Activity
          </button>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// 6. PURCHASE REPORTS COMPONENT
// --------------------------------------------------------------------------------
function PurchaseReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const dataMap: Record<string, any> = {
    Today: { pur: '45', items: '1,200', sup: '12', pend: '3', t1: '+5%' },
    Week: { pur: '320', items: '12,500', sup: '45', pend: '15', t1: '+8%' },
    Month: { pur: '1,284', items: '45,920', sup: '142', pend: '8', t1: '+12%' },
    Year: { pur: '15,400', items: '550,000', sup: '150', pend: '5', t1: '+20%' },
    'Custom Range': { pur: '400', items: '14,000', sup: '50', pend: '10', t1: '+10%' }
  };

  const activeData = dataMap[period] || dataMap['Month'];

  const handlePeriodChange = (tab: any) => {
    if (tab === 'Custom Range') {
      setShowCustomModal(true);
    } else {
      setPeriod(tab);
    }
  };

  const applyCustomRange = () => {
    setPeriod('Custom Range');
    setShowCustomModal(false);
  };

  const reportName = period === 'Custom Range' && dateRange.start && dateRange.end
    ? `Purchase_Report_${dateRange.start}_to_${dateRange.end}`
    : `Purchase_Report_${period}`;

  const allPurchases = [
    { ref: "PR-00881", date: "Oct 24 2023", sup: "Green Harvest Co.", prod: "Organic Milk 1L", qty: "200 units", price: "Rs. 450.00", total: "Rs. 90,000.00", status: "RECEIVED", sClass: "bg-[#eef8f2] text-[#0b8252]" },
    { ref: "PR-00882", date: "Oct 25 2023", sup: "Fresh Dairy Inc.", prod: "Cheddar Cheese 200g", qty: "50 units", price: "Rs. 950.00", total: "Rs. 47,500.00", status: "PENDING", sClass: "bg-[#fef3c7] text-[#d97706]" },
    { ref: "PR-00883", date: "Oct 25 2023", sup: "Global Grains Ltd.", prod: "Whole Wheat Bread", qty: "100 units", price: "Rs. 220.00", total: "Rs. 22,000.00", status: "PARTIAL", sClass: "bg-[#fee2e2] text-[#ef4444]" },
    { ref: "PR-00884", date: "Oct 25 2023", sup: "Orchard Valley", prod: "Red Apples (Box)", qty: "15 units", price: "Rs. 8,500.00", total: "Rs. 127,500.00", status: "RECEIVED", sClass: "bg-[#eef8f2] text-[#0b8252]" },
    { ref: "PR-00885", date: "Oct 26 2023", sup: "Beverage Prox", prod: "Sparkling Water 500ml", qty: "500 units", price: "Rs. 180.00", total: "Rs. 90,000.00", status: "PENDING", sClass: "bg-[#fef3c7] text-[#d97706]" },
  ];

  const filteredPurchases = allPurchases.filter(p => statusFilter === 'All Statuses' || p.status === statusFilter);

  const reportHeaders = ['Ref #', 'Date', 'Supplier', 'Product', 'Qty', 'Unit Price', 'Total', 'Status'];
  const reportRows = filteredPurchases.map(p => [p.ref, p.date, p.sup, p.prod, p.qty, p.price, p.total, p.status]);
  const reportData = { headers: reportHeaders, rows: reportRows };

  return (
    <div className="animate-in fade-in duration-300 space-y-6 pb-12">
      {/* Custom Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b8252]">date_range</span>
                Custom Date Range
              </h3>
              <button onClick={() => setShowCustomModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Start Date</label>
                <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">End Date</label>
                <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowCustomModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
              <button onClick={applyCustomRange} className="px-5 py-2.5 text-sm font-bold text-white bg-[#0b8252] hover:bg-[#096b43] rounded-lg shadow-sm transition-colors">Apply Range</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => onViewChange('overview')} className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b8252] transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Overview
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Purchase Records</h2>
          <p className="text-slate-500 text-sm mt-1">
            Track and monitor supplier purchases and stock inflow.
            {period === 'Custom Range' && dateRange.start && dateRange.end && (
              <span className="ml-2 font-bold text-[#0b8252]">({dateRange.start} to {dateRange.end})</span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex bg-white p-1 rounded-lg border border-slate-200">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded text-sm font-bold"><span className="material-symbols-outlined text-[18px]">print</span> Print Report</button>
            <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded text-sm font-bold border-l border-slate-200"><span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Export PDF</button>
            <button onClick={() => downloadReport(reportName, 'excel', reportData)} className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded text-sm font-bold border-l border-slate-200"><span className="material-symbols-outlined text-[18px]">table_chart</span> Export Excel</button>
          </div>
        </div>
      </div>

      {/* 3. REPORT PERIOD FILTER */}
      <div className="flex bg-[#f1f5f9] p-1 rounded-xl border border-slate-200 w-fit shadow-sm">
        {['Today', 'Week', 'Month', 'Year', 'Custom Range'].map(tab => {
          let tabLabel = tab;
          if (tab === 'Custom Range' && period === 'Custom Range' && dateRange.start && dateRange.end) {
            tabLabel = `${dateRange.start} to ${dateRange.end}`;
          }
          return (
          <button 
            key={tab}
            onClick={() => handlePeriodChange(tab)}
            className={`px-6 py-2 text-sm font-bold rounded-lg flex items-center gap-1 transition-all ${period === tab ? 'bg-white text-[#0b8252] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {tab === 'Custom Range' && <span className="material-symbols-outlined text-[16px]">calendar_today</span>}
            {tabLabel}
          </button>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-8 h-8 rounded bg-[#eef8f2] text-[#0b8252] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            </div>
            <span className="text-[10px] font-bold text-[#10b981]">{activeData.t1} vs last {period.toLowerCase()}</span>
          </div>
          <p className="text-xs font-bold text-slate-500 mb-0.5">Total Purchases</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.pur}</h3>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[18px]">inventory</span>
          </div>
          <p className="text-xs font-bold text-slate-500 mb-0.5">Total Items Purchased</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.items}</h3>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[18px]">storefront</span>
          </div>
          <p className="text-xs font-bold text-slate-500 mb-0.5">Total Suppliers Active</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.sup}</h3>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-8 h-8 rounded bg-[#fef3c7] text-[#d97706] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          </div>
          <p className="text-xs font-bold text-slate-500 mb-0.5">Pending Deliveries</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.pend}</h3>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Status</label>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Statuses</option>
              <option>RECEIVED</option>
              <option>PENDING</option>
              <option>PARTIAL</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
        </div>
        <div className="flex gap-3 mt-4 lg:mt-0">
          <button onClick={() => setStatusFilter('All Statuses')} className="px-5 py-2 text-[#0b8252] font-bold text-sm hover:underline">Reset</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Area: Table & Charts */}
        <div className="lg:col-span-2 space-y-6">

          {/* Main Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ref #</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Price</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredPurchases.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-[#0b8252]">{item.ref}</td>
                      <td className="p-4 text-slate-600 text-xs w-20">{item.date.replace(" ", "\n")}</td>
                      <td className="p-4 text-slate-700 font-medium">{item.sup}</td>
                      <td className="p-4 text-slate-800">{item.prod}</td>
                      <td className="p-4 text-slate-600 text-xs w-16">{item.qty.replace(" ", "\n")}</td>
                      <td className="p-4 text-slate-600">{item.price}</td>
                      <td className="p-4 font-bold text-slate-800">{item.total}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${item.sClass}`}>{item.status}</span>
                      </td>
                    </tr>
                  ))}
                  {filteredPurchases.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">No records match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
              <p>Showing <strong>{filteredPurchases.length > 0 ? 1 : 0} - {filteredPurchases.length}</strong> of <strong>{filteredPurchases.length}</strong> results</p>
              <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0b8252] text-white font-bold">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
              </div>
            </div>
          </div>

          {/* Bottom Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Monthly Spend Analysis */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-[280px]">
              <h3 className="font-bold text-slate-800 mb-6">Spend Analysis</h3>
              <div className="flex-1 flex items-end justify-between px-2 gap-4">
                {[
                  { h: 30, l: "Jun", a: false },
                  { h: 45, l: "Jul", a: false },
                  { h: 35, l: "Aug", a: false },
                  { h: 65, l: "Sep", a: false },
                  { h: 90, l: "Oct", a: true },
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 w-full h-full justify-end">
                    <div className={`w-full max-w-[40px] rounded-t transition-all ${bar.a ? 'bg-[#0b8252]' : 'bg-[#eef8f2]'} ${period === 'Month' && bar.l === 'Oct' ? 'h-full' : ''}`} style={{ height: `${bar.h}%` }}></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{bar.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supplier Reliability */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-[280px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Supplier Reliability</h3>
                <span className="material-symbols-outlined text-[#0b8252]">verified</span>
              </div>

              <div className="space-y-5 flex-1">
                {[
                  { n: "Green Harvest Co.", p: 98, c: "bg-[#0b8252]" },
                  { n: "Fresh Dairy Inc.", p: 92, c: "bg-[#0b8252]" },
                  { n: "Global Grains Ltd.", p: 85, c: "bg-[#d97706]" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-700">{s.n}</span>
                      <span className="text-slate-800">{s.p}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${s.c} rounded-full`} style={{ width: `${s.p}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 italic mt-4">Efficiency based on delivery timeliness and order accuracy.</p>
            </div>

          </div>

        </div>

        {/* Right Area: Log & Contact */}
        <div className="space-y-6">

          {/* History Log */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">history</span> History Log
            </h3>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100 mb-6">
              {[
                { i: "check_circle", c: "text-[#10b981] bg-white", title: "PR-00881 Marked as Received", sub: "By Alex Rivera", time: "10 mins ago" },
                { i: "add_circle", c: "text-[#0b8252] bg-white", title: "New Record Created: PR-00885", sub: "Beverage Prox Order", time: "1 hour ago" },
                { i: "edit", c: "text-[#d97706] bg-white", title: "PR-00883 Updated to Partial", sub: "Shortage noted in whole wheat bread", time: "2 hours ago" },
                { i: "download", c: "text-slate-400 bg-white", title: "Report Exported", sub: "Monthly Purchase Summary (PDF)", time: "Yesterday" },
              ].map((log, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  <div className={`absolute left-0 w-5 h-5 flex items-center justify-center rounded-full z-10 bg-white`}>
                    <span className={`material-symbols-outlined text-[20px] ${log.c}`}>{log.i}</span>
                  </div>
                  <div className="ml-8 pt-0.5">
                    <p className="font-bold text-sm text-slate-800 leading-tight">{log.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{log.sub}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full text-center text-sm font-bold text-slate-600 border border-slate-200 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              View All Activity
            </button>
          </div>

          {/* Contact Box */}
          <div className="bg-[#0b8252] rounded-xl shadow-md p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-[#eef8f2] uppercase tracking-wider mb-2">SUPPLIERS</p>
              <h3 className="text-xl font-bold mb-4 leading-tight">Need to Contact a Supplier?</h3>
              <p className="text-xs text-[#dcfce7] mb-6 leading-relaxed">
                Access the full directory of verified partners and logistics providers.
              </p>
              <button className="bg-white text-[#0b8252] font-bold text-sm px-6 py-2.5 rounded-lg shadow-sm hover:bg-[#f8f9fa] transition-colors">
                Open Directory
              </button>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-white opacity-10 pointer-events-none">
              contact_phone
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}

// --------------------------------------------------------------------------------
// 7. ALERT REPORTS COMPONENT
// --------------------------------------------------------------------------------
function AlertReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Today');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [userFilter, setUserFilter] = useState('All Users');
  const [actionFilter, setActionFilter] = useState('All Actions');

  const dataMap: Record<string, any> = {
    Today: { logs: '1,248', waste: '42 kg', over: '15', mgrs: '8', t1: '+12.5%' },
    Week: { logs: '8,450', waste: '310 kg', over: '95', mgrs: '12', t1: '+5.2%' },
    Month: { logs: '35,200', waste: '1,400 kg', over: '420', mgrs: '14', t1: '-2.1%' },
    Year: { logs: '420,000', waste: '15,000 kg', over: '4,500', mgrs: '15', t1: '+1.5%' },
    'Custom Range': { logs: '4,000', waste: '120 kg', over: '45', mgrs: '10', t1: 'N/A' }
  };

  const activeData = dataMap[period] || dataMap['Today'];

  const handlePeriodChange = (tab: any) => {
    if (tab === 'Custom Range') {
      setShowCustomModal(true);
    } else {
      setPeriod(tab);
    }
  };

  const applyCustomRange = () => {
    setPeriod('Custom Range');
    setShowCustomModal(false);
  };

  const reportName = period === 'Custom Range' && dateRange.start && dateRange.end
    ? `Alert_Report_${dateRange.start}_to_${dateRange.end}`
    : `Alert_Report_${period}`;

  const allAlerts = [
    { time: "Today, 14:24", date: "Oct 24, 2023", prod: "Organic Eggs (12pk)", sku: "SKU: EG-7721", action: "Stock Added", qty: "+120", user: "Sarah Chen", avatar: "SC", aClass: "bg-[#eef8f2] text-[#0b8252]", qClass: "text-[#10b981]" },
    { time: "Today, 13:10", date: "Oct 24, 2023", prod: "Sparkling Water 500ml", sku: "SKU: DR-0045", action: "Waste Removed", qty: "-14", user: "Alex Rivera", avatar: "AR", aClass: "bg-[#fee2e2] text-[#ef4444]", qClass: "text-[#ef4444]" },
    { time: "Today, 11:45", date: "Oct 24, 2023", prod: "Greek Yogurt 500g", sku: "SKU: DA-1120", action: "Manual Adjustment", qty: "+5", user: "Mike Ross", avatar: "MR", aClass: "bg-slate-100 text-slate-600", qClass: "text-slate-600" },
    { time: "Oct 23, 17:50", date: "Oct 23, 2023", prod: "Aluminum Foil 25m", sku: "SKU: HH-4402", action: "Stock Added", qty: "+50", user: "Sarah Chen", avatar: "SC", aClass: "bg-[#eef8f2] text-[#0b8252]", qClass: "text-[#10b981]" },
  ];

  const uniqueUsers = Array.from(new Set(allAlerts.map(l => l.user)));
  const uniqueActions = Array.from(new Set(allAlerts.map(l => l.action)));

  const filteredLogs = allAlerts.filter(l => 
    (userFilter === 'All Users' || l.user === userFilter) &&
    (actionFilter === 'All Actions' || l.action === actionFilter)
  );

  const reportHeaders = ['Date', 'Time', 'Product', 'SKU', 'Action', 'Qty Change', 'Updated By'];
  const reportRows = filteredLogs.map(p => [p.date, p.time.split(', ')[1] || p.time, p.prod, p.sku, p.action, p.qty, p.user]);
  const reportData = { headers: reportHeaders, rows: reportRows };

  return (
    <div className="animate-in fade-in duration-300 space-y-6 pb-12">
      {/* Custom Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b8252]">date_range</span>
                Custom Date Range
              </h3>
              <button onClick={() => setShowCustomModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Start Date</label>
                <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">End Date</label>
                <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowCustomModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
              <button onClick={applyCustomRange} className="px-5 py-2.5 text-sm font-bold text-white bg-[#0b8252] hover:bg-[#096b43] rounded-lg shadow-sm transition-colors">Apply Range</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => onViewChange('overview')} className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b8252] transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Overview
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Alert Reports</h2>
          <p className="text-slate-500 text-sm mt-1">
            Summarize low stock incidents, expired products, and critical shelf warnings.
            {period === 'Custom Range' && dateRange.start && dateRange.end && (
              <span className="ml-2 font-bold text-[#0b8252]">({dateRange.start} to {dateRange.end})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => downloadReport(reportName, 'csv', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Export CSV
          </button>
          <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
          <div className="flex bg-[#f1f5f9] p-1 rounded-xl border border-slate-200 w-fit">
            {['Today', 'Week', 'Month', 'Year', 'Custom Range'].map(tab => {
              let tabLabel = tab;
              if (tab === 'Custom Range' && period === 'Custom Range' && dateRange.start && dateRange.end) {
                tabLabel = `${dateRange.start} to ${dateRange.end}`;
              }
              return (
              <button 
                key={tab}
                onClick={() => handlePeriodChange(tab)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${period === tab ? 'bg-white text-[#0b8252] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {tab === 'Custom Range' && <span className="material-symbols-outlined text-[14px]">calendar_today</span>}
                {tabLabel}
              </button>
              );
            })}
          </div>

          <div className="relative">
            <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Users</option>
              {uniqueUsers.map(u => <option key={u}>{u}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <div className="relative">
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-[#0b8252]">
              <option>All Actions</option>
              {uniqueActions.map(a => <option key={a}>{a}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
        </div>
        <button onClick={() => {setUserFilter('All Users'); setActionFilter('All Actions'); setPeriod('Today');}} className="text-sm font-bold text-slate-400 hover:text-[#0b8252] transition-colors self-end lg:self-auto">Reset Filters</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Total Logs</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.logs}</h3>
          <p className="text-[10px] font-bold text-[#10b981] mt-1">{activeData.t1} from last {period.toLowerCase()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Waste Recorded</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.waste}</h3>
          <p className="text-[10px] font-bold text-[#ef4444] mt-1">Alert: Fresh Produce high waste</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Manual Overrides</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.over}</h3>
          <p className="text-[10px] font-bold text-[#d97706] mt-1">Requires review by Admin</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-2">Active Managers</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeData.mgrs}</h3>
          <p className="text-[10px] font-bold text-[#0b8252] mt-1">Peak shift active</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Qty Change</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Updated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLogs.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{item.time}</p>
                    <p className="text-[10px] text-slate-500">{item.date}</p>
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200"></div>
                    <div>
                      <p className="font-bold text-slate-800">{item.prod}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{item.sku}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.aClass}`}>
                      {item.action}
                    </span>
                  </td>
                  <td className={`p-4 text-center font-bold text-lg ${item.qClass}`}>{item.qty}</td>
                  <td className="p-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 flex items-center justify-center">
                      {item.avatar}
                    </div>
                    <span className="text-slate-700 font-medium">{item.user}</span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No activity matches your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
          <p>Showing <strong>{filteredLogs.length > 0 ? 1 : 0} - {filteredLogs.length}</strong> of <strong>{filteredLogs.length}</strong> logs</p>
          <div className="flex gap-1">
            <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
            <button className="w-6 h-6 flex items-center justify-center rounded bg-[#0b8252] text-white font-bold text-xs">1</button>
            <button className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        {/* Inventory Trends */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Alert Trends</h3>
              <p className="text-xs text-slate-500">Volume of changes over the last 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0b8252]"></span> Additions</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> Waste</div>
            </div>
          </div>
          <div className="h-[180px] flex items-end justify-between px-4 border-b border-slate-100 pb-2">
            {[
              { a: 60, w: 10, d: "Mon" },
              { a: 85, w: 20, d: "Tue" },
              { a: 40, w: 35, d: "Wed" },
              { a: 90, w: 15, d: "Thu" },
              { a: 100, w: 25, d: "Fri" },
              { a: 30, w: 5, d: "Sat" },
              { a: 20, w: 0, d: "Sun" },
            ].map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2 h-full justify-end w-12">
                <div className="flex items-end gap-1 w-full h-full">
                  <div className="w-1/2 bg-[#0b8252] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${day.a}%` }}></div>
                  <div className="w-1/2 bg-[#ef4444] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${day.w}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-4 mt-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-slate-400 w-12 text-center">{d}</span>
            ))}
          </div>
        </div>

        {/* Live Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Live Activity Alerts</h3>
          <div className="flex-1 space-y-6">
            <div className="flex gap-3">
              <div className="relative mt-1">
                <span className="w-2 h-2 rounded-full bg-[#10b981] absolute -left-[5px] top-1.5 animate-pulse"></span>
                <div className="w-0.5 h-full bg-slate-100 absolute left-[2.5px] top-4"></div>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">New stock delivery arrived</p>
                <p className="text-xs text-slate-500 mt-0.5">Batch #8821 for Produce section</p>
                <p className="text-[10px] font-bold text-[#0b8252] mt-1">2 minutes ago</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative mt-1">
                <span className="w-2 h-2 rounded-full bg-[#ef4444] absolute -left-[5px] top-1.5"></span>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">Low stock alert</p>
                <p className="text-xs text-slate-500 mt-0.5">Whole Milk 1L - 3 units left</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">15 minutes ago</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 text-center text-sm font-bold text-[#0b8252] hover:underline pt-4 border-t border-slate-100">
            View All Live Activity
          </button>
        </div>
      </div>
    </div>
  );
}
