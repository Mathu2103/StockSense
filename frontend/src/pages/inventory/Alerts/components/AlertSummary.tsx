import React from 'react';
import { Tab, AlertSeverity } from '../types/alertTypes';

interface AlertSummaryProps {
  totalAlerts: number;
  criticalAlerts: number;
  lowStockAlerts: number;
  expiryAlerts: number;
  reorderSuggestions: number;
  setActiveTab: (t: Tab) => void;
  setSevFilter: (s: AlertSeverity | 'All') => void;
}

const smartInsights = [
  'Rice 5kg expected to run out in 3 days',
  'Milk Packet requires urgent restock',
  'Supplier delays increasing stock risk',
];

export default function AlertSummary({
  totalAlerts,
  criticalAlerts,
  lowStockAlerts,
  expiryAlerts,
  reorderSuggestions,
  setActiveTab,
  setSevFilter,
}: AlertSummaryProps) {
  return (
    <>
      {/* Alert KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          onClick={() => { setActiveTab('All Alerts'); setSevFilter('All'); }}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm cursor-pointer hover:border-[#0b8252] transition-colors"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Alerts</p>
          <h3 className="text-2xl font-bold text-slate-800">{totalAlerts}</h3>
        </div>
        <div
          onClick={() => { setActiveTab('All Alerts'); setSevFilter('Critical'); }}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm cursor-pointer hover:border-red-400 transition-colors"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Critical Alerts</p>
          <h3 className="text-2xl font-bold text-red-600">{criticalAlerts}</h3>
        </div>
        <div
          onClick={() => { setActiveTab('Low Stock'); setSevFilter('All'); }}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm cursor-pointer hover:border-amber-400 transition-colors"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Low Stock Alerts</p>
          <h3 className="text-2xl font-bold text-amber-600">{lowStockAlerts}</h3>
        </div>
        <div
          onClick={() => { setActiveTab('Expiring Soon'); setSevFilter('All'); }}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm cursor-pointer hover:border-orange-400 transition-colors"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry Alerts</p>
          <h3 className="text-2xl font-bold text-orange-600">{expiryAlerts}</h3>
        </div>
        <div
          onClick={() => { setActiveTab('Reorder Recommendation'); setSevFilter('All'); }}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm cursor-pointer hover:border-[#0b8252] transition-colors"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reorder Suggestions</p>
          <h3 className="text-2xl font-bold text-[#0b8252]">{reorderSuggestions}</h3>
        </div>
      </div>

      {/* Smart Insights Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#0b8252]">auto_awesome</span>
          <h3 className="font-bold text-slate-800">Smart Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {smartInsights.map((insight) => (
            <div key={insight} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {insight}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
