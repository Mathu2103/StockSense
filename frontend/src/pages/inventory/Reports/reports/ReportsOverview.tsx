import { useState, useEffect } from 'react';
import { downloadReport, ViewState } from './reportUtils';
import { ReportService, GeneratedReport } from '../../../../services/reportService';

export default function ReportsOverview({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await ReportService.getReportHistory();
      setReports(data);
    } catch (err) {
      console.error('Failed to fetch report history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      await ReportService.clearReportHistory();
      setReports([]);
      setShowClearModal(false);
    } catch (err) {
      console.error('Failed to clear report history:', err);
    } finally {
      setClearing(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sales':
      case 'purchase':
        return <span className="px-2.5 py-1 text-[10px] font-bold bg-[#eef8f2] text-[#0b8252] rounded-full">{category}</span>;
      case 'alerts':
      case 'activity':
        return <span className="px-2.5 py-1 text-[10px] font-bold bg-[#fee2e2] text-[#ef4444] rounded-full">{category}</span>;
      case 'supplier':
        return <span className="px-2.5 py-1 text-[10px] font-bold bg-[#fef3c7] text-[#d97706] rounded-full">{category}</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-full">{category}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' - ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="animate-in fade-in duration-300">

      {/* ── Custom Clear History Confirmation Modal ── */}
      {showClearModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            style={{ animation: 'zoomIn 0.2s ease' }}
          >
            {/* Modal Header */}
            <div className="p-5 flex items-center gap-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-500 text-[22px]">delete_sweep</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-tight">Clear Report History</h3>
                <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <p className="text-slate-600 text-sm leading-relaxed">
                Are you sure you want to clear <span className="font-bold text-slate-800">all {reports.length} report{reports.length !== 1 ? 's' : ''}</span> from your generation history?
              </p>
              <div className="mt-4 flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl p-3.5">
                <span className="material-symbols-outlined text-red-400 text-[18px] shrink-0 mt-0.5">info</span>
                <p className="text-xs text-red-600 font-medium leading-relaxed">
                  All report generation logs will be permanently deleted. Existing downloaded files will not be affected.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                disabled={clearing}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                disabled={clearing}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {clearing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Clearing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Yes, Clear All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Reports &amp; Analytics</h1>
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
          {reports.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              Clear History
            </button>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Report Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Generated</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">Loading history...</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">No reports generated recently.</td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td className="p-4 font-bold text-slate-700">{report.name}</td>
                    <td className="p-4">{getCategoryBadge(report.category)}</td>
                    <td className="p-4 text-slate-600">{formatDate(report.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-[#10b981]">
                        <span className="w-2 h-2 rounded-full bg-[#10b981]"></span> {report.status}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zoom-in animation keyframe */}
      <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
