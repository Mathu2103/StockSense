import { Tab, AlertSeverity } from '../types/alertTypes';

interface AlertSummaryProps {
  totalAlerts: number;
  criticalAlerts: number;
  lowStockAlerts: number;
  outOfStockAlerts: number;
  expiryAlerts: number;
  discountAlerts: number;
  setActiveTab: (t: Tab) => void;
  setSevFilter: (s: AlertSeverity | 'All') => void;
}

export default function AlertSummary({
  totalAlerts,
  criticalAlerts,
  lowStockAlerts,
  outOfStockAlerts,
  expiryAlerts,
  discountAlerts,
  setActiveTab,
  setSevFilter,
}: AlertSummaryProps) {
  return (
    <>
      {/* Alert KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          onClick={() => { setActiveTab('All Alerts'); setSevFilter('All'); }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm cursor-pointer hover:border-slate-400 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">notifications</span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</p>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800">{totalAlerts}</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Active alerts</p>
        </div>

        <div
          onClick={() => { setActiveTab('All Alerts'); setSevFilter('Critical'); }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm cursor-pointer hover:border-red-600 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Critical</p>
          </div>
          <h3 className="text-2xl font-extrabold text-red-700">{criticalAlerts}</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">High priority</p>
        </div>

        <div
          onClick={() => { setActiveTab('Low Stock'); setSevFilter('All'); }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm cursor-pointer hover:border-amber-400 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-500 text-[18px]">warning</span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Low Stock</p>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-600">{lowStockAlerts}</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Below safety level</p>
        </div>

        <div
          onClick={() => { setActiveTab('Out of Stock'); setSevFilter('All'); }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm cursor-pointer hover:border-red-400 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-red-500 text-[18px]">cancel</span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Out Stock</p>
          </div>
          <h3 className="text-2xl font-extrabold text-red-600">{outOfStockAlerts}</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Zero inventory</p>
        </div>

        <div
          onClick={() => { setActiveTab('Expiring Soon'); setSevFilter('All'); }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm cursor-pointer hover:border-orange-400 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-orange-500 text-[18px]">alarm</span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiring</p>
          </div>
          <h3 className="text-2xl font-extrabold text-orange-600">{expiryAlerts}</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Within 90 days</p>
        </div>

        <div
          onClick={() => { setActiveTab('Discount'); setSevFilter('All'); }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm cursor-pointer hover:border-teal-400 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-teal-500 text-[18px]">local_offer</span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Discount</p>
          </div>
          <h3 className="text-2xl font-extrabold text-teal-600">{discountAlerts}</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Approvals & updates</p>
        </div>
      </div>
    </>
  );
}
