import { useState, useEffect } from 'react';
import { downloadReport, ViewState } from './reportUtils';
import { inventoryOperationsService } from '../../StockOperations/operations/inventoryOperationsService';

export default function SupplierReports({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom Range'>('Month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Live States
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [grns, setGrns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadSuppliersData() {
      try {
        const [loadedProds, loadedGrns] = await Promise.all([
          inventoryOperationsService.getProducts(),
          inventoryOperationsService.getGRNHistory()
        ]);

        let loadedSups: any[] = [];
        try {
          const stored = localStorage.getItem('stocksense_suppliers_registry');
          if (stored) {
            loadedSups = JSON.parse(stored);
          }
        } catch (e) {
          console.error('Failed to parse supplier registry from local storage', e);
        }

        if (loadedSups.length === 0) {
          loadedSups = [
            { id: 's-1', name: 'FreshFarm Supplies', phone: '+94 77 123 4567', email: 'sales@freshfarm.lk', address: '45 Orchard Lane, Colombo 03', status: 'Active' },
            { id: 's-2', name: 'Golden Crust Bakery', phone: '+94 11 234 5678', email: 'orders@goldencrust.lk', address: '12 Bakery Lane, Kandy', status: 'Active' },
            { id: 's-3', name: 'Ocean Harvest', phone: '+94 91 345 6789', email: 'supply@oceanharvest.lk', address: '78 Fishery Pier, Galle', status: 'Active' },
            { id: 's-4', name: 'Ceylon Beverage Distributors', phone: '+94 71 456 7890', email: 'info@ceylonbev.lk', address: '102 Industrial Zone, Orugodawatta', status: 'Active' }
          ];
        }

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

  // Process live data to match UI display structure
  const processedSuppliers = suppliers.map((sup, idx) => {
    const supProducts = products.filter(
      p => p.supplier.trim().toLowerCase() === sup.name.trim().toLowerCase()
    );
    const productsCount = supProducts.length;

    // Find last supply date from GRN history
    const supplierGrns = grns.filter(
      g => g.supplierName.trim().toLowerCase() === sup.name.trim().toLowerCase()
    );
    const lastDate = supplierGrns.length > 0
      ? new Date(Math.max(...supplierGrns.map(g => new Date(g.receivedDate).getTime()))).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'No delivery recorded';

    const pct = products.length > 0 ? Math.min(100, Math.round((productsCount / products.length) * 100)) : 0;
    const initials = sup.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();

    return {
      id: sup.id,
      name: sup.name,
      sku: sup.id.startsWith('s-') ? `SUP-${sup.id.replace('s-', '00')}` : `SUP-${idx + 100}`,
      initials,
      email: sup.email,
      phone: sup.phone,
      products: productsCount,
      pct,
      date: lastDate,
      status: sup.status || 'Active',
      sClass: sup.status === 'Active' ? 'bg-[#eef8f2] text-[#0b8252]' : 'bg-slate-100 text-slate-500'
    };
  });

  const filteredSuppliers = processedSuppliers.filter(item => filter === 'All' || item.status === filter);

  // KPIs
  const totalSuppliersCount = suppliers.length;
  const activeSuppliersCount = suppliers.filter(s => s.status === 'Active').length;
  const avgLeadTimeText = "2.2 Days";

  const reportHeaders = ['Supplier Name', 'Code', 'Email', 'Phone', 'Products Supplied', 'Last Supply Date', 'Status'];
  const reportRows = filteredSuppliers.map(s => [s.name, s.sku, s.email, s.phone, `${s.products} Items`, s.date, s.status]);
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
          <button onClick={() => downloadReport(reportName, 'pdf', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF
          </button>
          <button onClick={() => downloadReport(reportName, 'excel', reportData)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
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
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{loading ? '...' : totalSuppliersCount}</h3>
            <p className="text-xs font-bold text-slate-400 mt-2">Registered in registry</p>
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
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{loading ? '...' : activeSuppliersCount}</h3>
            <p className="text-xs font-bold text-[#0b8252] mt-2 flex items-center gap-1">
              Currently operational
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
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{avgLeadTimeText}</h3>
            <p className="text-xs font-bold text-[#10b981] mt-2">Average transit duration</p>
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
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Supply Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Loading live suppliers...</td>
                </tr>
              ) : filteredSuppliers.map((item, i) => (
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
                  <td className="p-4 text-slate-600">{item.date}</td>
                  <td className="p-4 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full ${item.sClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-[#10b981]' : 'bg-slate-400'}`}></span>
                      {item.status}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No suppliers match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>Showing <strong>{filteredSuppliers.length > 0 ? 1 : 0} - {filteredSuppliers.length}</strong> of <strong>{filteredSuppliers.length}</strong> suppliers</p>
        </div>
      </div>
    </div>
  );
}
