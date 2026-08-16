import { LedgerEntry } from '../../StockOperations/operations/inventoryOperationsService';

function getMovementMeta(entry: LedgerEntry) {
  switch (entry.movementType) {
    case 'GRN':
      return {
        tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: 'local_shipping',
        label: 'GRN Received',
      };
    case 'Adjustment':
      return {
        tone: 'bg-amber-50 text-amber-700 border-amber-200',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: 'sync_alt',
        label: 'Stock Adjustment',
      };
    case 'Sale':
      return {
        tone: 'bg-sky-50 text-sky-700 border-sky-200',
        badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
        icon: 'point_of_sale',
        label: 'POS Sale',
      };
    case 'Expiry Removal':
      return {
        tone: 'bg-rose-50 text-rose-700 border-rose-200',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: 'delete_sweep',
        label: 'Expiry Write-off',
      };
    case 'Supplier Return':
      return {
        tone: 'bg-purple-50 text-purple-700 border-purple-200',
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: 'keyboard_return',
        label: 'Supplier Return',
      };
    default:
      return {
        tone: 'bg-slate-50 text-slate-700 border-slate-200',
        badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
        icon: 'history',
        label: entry.movementType || 'Movement',
      };
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
  const meta = getMovementMeta(entry);
  const isSale = entry.movementType === 'Sale';
  const qty = entry.quantityChange;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left Side: Icon, Item Name, Movement Type & Context */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${meta.tone}`}>
            <span className="material-symbols-outlined text-[22px]">{meta.icon}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 truncate" title={entry.productName}>
                {entry.productName}
              </h3>
              <span className={`rounded-md border px-2 py-0.5 text-[10.5px] font-black uppercase tracking-wider ${meta.badgeBg}`}>
                {meta.label}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-600 truncate">{entry.reason} · <span className="font-mono text-slate-500">{entry.sku}</span></p>

            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span className="font-medium">{formatTimestamp(entry.timestamp)}</span>
              <span>•</span>
              <span className="font-medium">By {entry.user || 'System'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quantity Change and Stock Before/After Snapshot */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 md:border-t-0 md:pt-0 md:text-right md:flex-col md:items-end gap-1 shrink-0">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">Change</span>
            <p className={`text-base font-black ${qty > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {qty > 0 ? `+${qty} units` : `${qty} units`}
            </p>
          </div>

          <div>
            {isSale && entry.beforeStock === 0 && entry.afterStock === 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
                POS Outflow
              </span>
            ) : (
              <p className="text-xs font-semibold text-slate-600">
                Stock: <span className="text-slate-500">{entry.beforeStock}</span> → <span className="font-bold text-slate-900">{entry.afterStock}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
