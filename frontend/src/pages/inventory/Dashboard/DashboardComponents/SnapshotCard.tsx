import React from 'react';
import { Link } from 'react-router-dom';

type SnapshotCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon?: string;
  tone?: string;
  actionLabel?: string;
  to?: string;
  onAction?: () => void;
  onClick?: () => void;
};

export default function SnapshotCard({
  label,
  value,
  helper,
  icon = 'inventory_2',
  tone = '',
  actionLabel,
  to,
  onAction,
  onClick
}: SnapshotCardProps) {
  const isInteractive = Boolean(onClick || to);

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Live</span>
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 break-words">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{helper}</p>

      {actionLabel && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          {to ? (
            <Link
              to={to}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors group/link"
            >
              <span>{actionLabel}</span>
              <span className="material-symbols-outlined text-[15px] transition-transform group-hover/link:translate-x-0.5">
                arrow_forward
              </span>
            </Link>
          ) : onAction ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors group/link"
            >
              <span>{actionLabel}</span>
              <span className="material-symbols-outlined text-[15px] transition-transform group-hover/link:translate-x-0.5">
                arrow_forward
              </span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
              <span>{actionLabel}</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </span>
          )}
        </div>
      )}
    </>
  );

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] flex flex-col justify-between ${isInteractive ? 'cursor-pointer' : ''}`}
    >
      {cardContent}
    </div>
  );
}
