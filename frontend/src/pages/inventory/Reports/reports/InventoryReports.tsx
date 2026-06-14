import { useEffect, useState } from 'react';
import { downloadReport, ViewState } from './reportUtils';
import {
  inventoryOperationsService,
  ProductItem,
  LedgerEntry
} from '../../StockOperations/operations/inventoryOperationsService';

export default function InventoryReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Live Database States
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;
    async function loadReportsData() {
      try {
        const [loadedProducts, loadedLedger] = await Promise.all([
          inventoryOperationsService.getProducts(),
          inventoryOperationsService.getLedger(),
        ]);
        if (!active) return;
        setProducts(loadedProducts);
        setLedger(loadedLedger);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load live reports data', err);
        if (!active) return;
        setLoading(false);
      }
    }
    loadReportsData();
    return () => {
      active = false;
    };
  }, []);

  // Reset pagination on filter/period adjustments
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter, period]);

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

  // Period Date Range calculation
  const getPeriodDateRange = () => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (period === 'Today') {
      start.setHours(0, 0, 0, 0);
    } else if (period === 'Week') {
      start.setDate(now.getDate() - 7);
    } else if (period === 'Month') {
      start.setDate(now.getDate() - 30);
    } else if (period === 'Year') {
      start.setDate(now.getDate() - 365);
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
  const periodLedger = ledger.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= start && entryDate <= end;
  });

  // Dynamically map products to include 'sold' quantities in selected period and real-time status
  const mappedProducts = products.map(product => {
    const sold = periodLedger
      .filter(entry => entry.sku === product.sku && entry.movementType === 'Sale')
      .reduce((sum, entry) => sum + Math.abs(entry.quantityChange), 0);

    const isExpired = product.expiryDate && new Date(product.expiryDate) < new Date();
    let status = "In Stock";
    let sColor = "bg-[#10b981]/10 text-[#10b981]";
    let dot = "bg-[#10b981]";

    if (isExpired) {
      status = "Expired";
      sColor = "bg-[#ef4444]/10 text-[#ef4444]";
      dot = "bg-[#ef4444]";
    } else if (product.stock === 0) {
      status = "Out of Stock";
      sColor = "bg-red-500/10 text-red-700";
      dot = "bg-red-500";
    } else if (product.stock <= product.reorderLevel) {
      status = "Low Stock";
      sColor = "bg-[#f59e0b]/10 text-[#d97706]";
      dot = "bg-[#f59e0b]";
    } else if (product.targetCapacity && product.stock > product.targetCapacity) {
      status = "Overstock";
      sColor = "bg-[#3b82f6]/10 text-[#3b82f6]";
      dot = "bg-[#3b82f6]";
    }

    return {
      ...product,
      sold,
      status,
      sColor,
      dot
    };
  });

  // Categories list collected dynamically
  const categories = ['All Categories', ...Array.from(new Set(products.map(p => p.category)))];

  // Filtering mapped products
  const filteredItems = mappedProducts.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'All Categories' || item.category === categoryFilter;
    const matchStatus = statusFilter === 'All Statuses' || item.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  // Calculate live summary stats matching the dashboard
  const totalProducts = products.length;
  const totalStockValue = products.reduce((acc, product) => acc + product.stock * product.costPrice, 0);
  const activeSuppliersCount = new Set(products.map((product) => product.supplier)).size;
  const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= product.reorderLevel).length;
  const criticalAlerts = products.filter((product) => product.stock === 0 || product.stock <= product.reorderLevel).length;

  // Pagination Logic
  const itemsPerPage = 8;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredItems.length);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

  // Prepare Exportable Data
  const reportHeaders = ['Product Name', 'SKU', 'Category', 'Stock Qty', 'Cost Price (Rs.)', 'Selling Price (Rs.)', 'Sold Units (Period)', 'Supplier', 'Status'];
  const reportRows = filteredItems.map(p => [
    p.name,
    p.sku,
    p.category,
    p.stock,
    p.costPrice.toFixed(2),
    p.sellingPrice.toFixed(2),
    p.sold,
    p.supplier,
    p.status
  ]);
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

      {/* 1. PAGE HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventory Reports</h2>
          <p className="text-slate-500 text-sm mt-1">
            Monitor stock levels, expiry risks, and inventory status.
            {period === 'Custom Range' && dateRange.start && dateRange.end && (
              <span className="ml-2 font-bold text-[#0b8252]">({dateRange.start} to {dateRange.end})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
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

      {/* 2. KPI SECTION (Glassmorphism) - Aligned with Inventory Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {/* Total Products */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            </div>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Live</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{totalProducts}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Total Products</p>
          </div>
        </div>

        {/* Total Stock Value */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">Asset</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Rs. {totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Total Stock Value</p>
          </div>
        </div>

        {/* Active Suppliers */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
            </div>
            <span className="text-[10px] font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">Suppliers</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{activeSuppliersCount}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Active Suppliers</p>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Reorder</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{lowStockCount}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Low Stock Items</p>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">notification_important</span>
            </div>
            <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">Critical</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{criticalAlerts}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Critical Alerts</p>
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
            placeholder="Search products by name or SKU..."
            className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-all"
          />
        </div>
        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative min-w-[160px] flex-1 sm:flex-initial">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#0b8252] transition-all cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <div className="relative min-w-[160px] flex-1 sm:flex-initial">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#0b8252] transition-all cursor-pointer"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Overstock">Overstock</option>
              <option value="Expired">Expired</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
          </div>
          <button 
            onClick={() => { setSearchQuery(''); setCategoryFilter('All Categories'); setStatusFilter('All Statuses'); }}
            className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors whitespace-nowrap"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 8. INVENTORY REPORT TABLE */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-800">Inventory Status Breakdown</h3>
            <span className="text-xs font-bold text-slate-400">Live system values</span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="sticky top-0 bg-slate-50/90 backdrop-blur z-10 shadow-sm">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty in Stock</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cost Price</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Selling Price</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sold (Period)</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">Loading live inventory report data...</td>
                  </tr>
                ) : paginatedItems.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 font-bold text-slate-800">{item.name}</td>
                    <td className="p-4 text-slate-500 font-semibold uppercase">{item.sku}</td>
                    <td className="p-4 text-slate-600 font-medium">{item.category}</td>
                    <td className="p-4 font-bold text-slate-800">{item.stock}</td>
                    <td className="p-4 text-slate-600">Rs. {item.costPrice.toFixed(2)}</td>
                    <td className="p-4 text-slate-600 font-semibold">Rs. {item.sellingPrice.toFixed(2)}</td>
                    <td className="p-4 font-bold text-[#0b8252]">{item.sold}</td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${item.sColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`}></span>
                        {item.status}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && paginatedItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">No products match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredItems.length > 0 ? startIndex + 1 : 0}-{endIndex} of {filteredItems.length} items
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
    </div>
  );
}
