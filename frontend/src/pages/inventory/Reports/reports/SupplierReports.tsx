import { useState, useEffect, useMemo } from 'react';
import { downloadReport, ViewState } from './reportUtils';
import { inventoryOperationsService } from '../../StockOperations/operations/inventoryOperationsService';
import { MasterDataService } from '../../../../services/masterDataService';

export default function SupplierReports({ onViewChange: _onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Live States
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [grns, setGrns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, period]);

  useEffect(() => {
    let active = true;
    async function loadSuppliersData() {
      try {
        const [loadedProds, loadedGrns, supplierRes] = await Promise.all([
          inventoryOperationsService.getProducts(),
          inventoryOperationsService.getGRNHistory(),
          MasterDataService.getSuppliers()
        ]);

        const loadedSups = supplierRes.data || supplierRes || [];

        if (!active) return;
        setProducts(loadedProds);
        setSuppliers(loadedSups);
        setGrns(loadedGrns);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load supplier reports data', err);
        if (!active) return;
        setLoading(false);
      }
    }
    loadSuppliersData();
    return () => { active = false; };
  }, []);

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

  // Period Date Range calculation
  const getPeriodDateRange = () => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (period === 'Today') {
      start.setHours(0, 0, 0, 0);
    } else if (period === 'Week') {
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'Month') {
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'Year') {
      start.setDate(now.getDate() - 365);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'Custom Range') {
      if (dateRange.start) start = new Date(dateRange.start);
      if (dateRange.end) {
        end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);
      }
    }
    return { start, end };
  };

  const { start, end } = getPeriodDateRange();
  const periodGrns = grns.filter(g => {
    const gDate = new Date(g.receivedDate);
    return gDate >= start && gDate <= end;
  });

  // Process live data to match UI display structure
  const processedSuppliers = useMemo(() => {
    return suppliers.map((sup, _idx) => {
      const supProducts = products.filter(
        p => p.supplier.trim().toLowerCase() === sup.name.trim().toLowerCase()
      );
      const productsCount = supProducts.length;

      // Find deliveries from GRN history within selected period
      const supplierGrns = periodGrns.filter(
        g => g.supplierName.trim().toLowerCase() === sup.name.trim().toLowerCase()
      );
      
      const totalOrders = supplierGrns.length;
      const totalSpent = supplierGrns.reduce((sum, g) => sum + g.totalCost, 0);

      const lastDate = supplierGrns.length > 0
        ? new Date(Math.max(...supplierGrns.map(g => new Date(g.receivedDate).getTime()))).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '-';

      const pct = products.length > 0 ? Math.min(100, Math.round((productsCount / products.length) * 100)) : 0;
      const initials = sup.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();

      return {
        id: sup.id,
        name: sup.name,
        sku: `SUP-${sup.id.substring(0, 5).toUpperCase()}`,
        initials,
        email: sup.email || 'N/A',
        phone: sup.phone || 'N/A',
        products: productsCount,
        pct,
        date: lastDate,
        totalOrders,
        totalSpent,
        status: sup.status || 'Active',
        sClass: (sup.status || 'Active') === 'Active' ? 'bg-[#eef8f2] text-[#0b8252]' : 'bg-slate-100 text-slate-500'
      };
    });
  }, [suppliers, products, periodGrns]);

  const filteredSuppliers = processedSuppliers.filter(item => filter === 'All' || item.status === filter);

  // KPIs
  const totalSuppliersCount = suppliers.length;
  const activeThisPeriod = processedSuppliers.filter(s => s.totalOrders > 0).length;
  const totalPeriodSpent = processedSuppliers.reduce((sum, s) => sum + s.totalSpent, 0);
  const totalPeriodOrders = processedSuppliers.reduce((sum, s) => sum + s.totalOrders, 0);
  const avgOrderValue = totalPeriodOrders > 0 ? totalPeriodSpent / totalPeriodOrders : 0;

  // Pagination Logic
  const itemsPerPage = 8;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredSuppliers.length);
  const paginatedItems = filteredSuppliers.slice(startIndex, endIndex);
  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / itemsPerPage));

  const reportHeaders = ['Supplier Name', 'Code', 'Email', 'Phone', 'Products Supplied', 'Orders (Period)', 'Spent (Period)', 'Last Supply Date', 'Status'];
  const reportRows = filteredSuppliers.map(s => [s.name, s.sku, s.email, s.phone, `${s.products} Items`, s.totalOrders, `Rs. ${s.totalSpent.toFixed(2)}`, s.date, s.status]);
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
          <h2 className="text-2xl font-bold text-slate-800">Supplier Performance Reports</h2>
          <p className="text-slate-500 text-sm mt-1">
            Evaluate supplier lead times, fulfillment rates, and delivery quality metrics.
            {period === 'Custom Range' && dateRange.start && dateRange.end && (
              <span className="ml-2 font-bold text-[#0b8252]">({dateRange.start} to {dateRange.end})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => downloadReport(reportName, 'pdf', reportData, 'Supplier')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
            <span className="material-symbols-outlined text-[18px] text-slate-500">picture_as_pdf</span>
            Export PDF
          </button>
          <button onClick={() => downloadReport(reportName, 'excel', reportData, 'Supplier')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
            <span className="material-symbols-outlined text-[18px] text-slate-500">table_chart</span>
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

      {/* KPI SECTION (Glassmorphism) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Suppliers */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
            <span className="text-[10px] font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">Directory</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{loading ? '...' : totalSuppliersCount}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Total Suppliers</p>
          </div>
        </div>

        {/* Active This Period */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            </div>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{loading ? '...' : activeThisPeriod}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Vendors This Period</p>
          </div>
        </div>

        {/* Total Period Spent */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">Spent</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {loading ? '...' : `Rs. ${totalPeriodSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Period Total</p>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">trending_up</span>
            </div>
            <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">Avg</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {loading ? '...' : `Rs. ${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Avg Order Value</p>
          </div>
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
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Products</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Orders</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Spent</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Last Supply</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Loading live suppliers...</td>
                </tr>
              ) : paginatedItems.map((item, i) => (
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
                    <div className="flex flex-col gap-1.5 w-32">
                      <span className="font-bold text-slate-800">{item.products} Items</span>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0b8252] rounded-full" style={{ width: `${item.pct}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-800 font-bold text-right">{item.totalOrders}</td>
                  <td className="p-4 text-[#0b8252] font-bold text-right">Rs. {item.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-slate-600 font-medium text-center">{item.date}</td>
                  <td className="p-4 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full ${item.sClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-[#10b981]' : 'bg-slate-400'}`}></span>
                      {item.status}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No suppliers match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-500">
            Showing {filteredSuppliers.length > 0 ? startIndex + 1 : 0}-{endIndex} of {filteredSuppliers.length} items
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <span className="text-xs font-bold text-slate-600">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
