import React from 'react';
import { AlertSeverity, Tab } from '../types/alertTypes';

interface EmptyAlertsStateProps {
  setSevFilter: (s: AlertSeverity | 'All') => void;
  setReadFilter: (r: 'All' | 'Unread' | 'Read') => void;
  setActiveTab: (t: Tab) => void;
}

export default function EmptyAlertsState({ setSevFilter, setReadFilter, setActiveTab }: EmptyAlertsStateProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
      <span className="material-symbols-outlined text-slate-300 text-[48px]">notifications_off</span>
      <p className="text-slate-500 font-medium mt-3">No alerts match your current filters.</p>
      <button
        onClick={() => { setSevFilter('All'); setReadFilter('All'); setActiveTab('All Alerts'); }}
        className="mt-4 text-sm font-bold text-[#0b8252] hover:underline"
      >
        Clear filters
      </button>
    </div>
  );
}
