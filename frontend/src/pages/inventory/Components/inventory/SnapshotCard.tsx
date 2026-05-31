import React from 'react';

type SnapshotCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon?: string;
  tone?: string;
  onClick?: () => void;
};

export default function SnapshotCard({ label, value, helper, icon = 'inventory_2', tone = '', onClick }: SnapshotCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Live</span>
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 break-words">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{helper}</p>
    </div>
  );
}
