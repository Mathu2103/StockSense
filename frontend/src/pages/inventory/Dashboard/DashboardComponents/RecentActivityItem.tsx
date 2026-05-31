import React from 'react';
import { LedgerEntry } from '../../StockOperations/operations/inventoryOperationsService';

function getMovementTone(entry: LedgerEntry) {
  switch (entry.movementType) {
    case 'GRN':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'Adjustment':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'Sale':
      return 'bg-sky-50 text-sky-700 border-sky-100';
    case 'Expiry Removal':
      return 'bg-rose-50 text-rose-700 border-rose-100';
    case 'Supplier Return':
      return 'bg-slate-50 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function RecentActivityItem({ entry }: { entry: LedgerEntry }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${getMovementTone(entry)}`}>
            <span className="material-symbols-outlined text-[22px]">
              {entry.movementType === 'GRN' ? 'inventory' : entry.movementType === 'Sale' ? 'point_of_sale' : entry.movementType === 'Adjustment' ? 'sync_alt' : 'history_toggle_off'}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 truncate">{entry.productName}</h3>
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${getMovementTone(entry)}`}>
                {entry.movementType}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{entry.reason} · {entry.sku}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{formatTimestamp(entry.timestamp)}</span>
              <span>•</span>
              <span>By {entry.user}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:text-right md:flex-col md:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Change</p>
            <p className={`mt-1 text-lg font-black ${entry.quantityChange >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {entry.quantityChange > 0 ? `+${entry.quantityChange}` : `${entry.quantityChange}`}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Stock</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{entry.beforeStock} → {entry.afterStock}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
