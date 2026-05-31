/**
 * KpiDashboardCards.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the six KPI summary cards that sit permanently above the tab switcher
 * on the Inventory Analytics page.
 *
 * Cards displayed (left → right):
 *   1. Total Inventory Value  — current stock worth (units × cost price)
 *   2. Stock Turnover Rate    — how quickly stock rotates (sales ÷ avg stock)
 *   3. Expiry Loss Value      — monetary value of expired/removed goods
 *   4. Fast Moving Products   — count of active catalog products
 *   5. Dead Stock Items       — count of items with >45 days no movement
 *   6. Reorder Alerts         — count of items at or below safe reorder level
 *
 * All values are computed in InventoryAnalytics.tsx (useMemo) and passed in as
 * props — this component is purely presentational (no internal state).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { KpiCardsProps } from './analyticsTypes';

export default function KpiDashboardCards({
  totalInventoryValue,
  turnoverRate,
  totalExpiryLoss,
  productsCount,
  deadStockCount,
  lowStockCount
}: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      {/* Card 1: Total Inventory Value */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[130px] hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 bg-emerald-50 text-[#0b8252] rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">monetization_on</span>
          </div>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[10px] font-black">trending_up</span>12.4%
          </span>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Inventory Value</p>
          <p className="text-lg font-black text-slate-800 tracking-tight leading-none">Rs. {totalInventoryValue.toLocaleString()}</p>
          <p className="text-[9px] text-slate-500 font-bold mt-1">vs last month</p>
        </div>
      </div>

      {/* Card 2: Stock Turnover Rate */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[130px] hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
          </div>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[10px] font-black">trending_up</span>5.2%
          </span>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Stock Turnover Rate</p>
          <p className="text-lg font-black text-slate-800 tracking-tight leading-none">{turnoverRate}</p>
          <p className="text-[9px] text-slate-500 font-bold mt-1">vs target 7.5x</p>
        </div>
      </div>

      {/* Card 3: Expiry Loss Value */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[130px] hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
          </div>
          <span className="text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[10px] font-black">trending_down</span>18.2%
          </span>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Expiry Loss Value</p>
          <p className="text-lg font-black text-slate-800 tracking-tight leading-none">Rs. {totalExpiryLoss.toLocaleString()}</p>
          <p className="text-[9px] text-slate-500 font-bold mt-1">vs last month</p>
        </div>
      </div>

      {/* Card 4: Fast Moving Products */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[130px] hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
          </div>
          <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[10px] font-black">trending_up</span>2.4%
          </span>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Fast Moving Products</p>
          <p className="text-lg font-black text-slate-800 tracking-tight leading-none">{productsCount} Items</p>
          <p className="text-[9px] text-slate-500 font-bold mt-1">active in catalog</p>
        </div>
      </div>

      {/* Card 5: Dead Stock Items */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[130px] hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
          </div>
          <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            Stable
          </span>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Dead Stock Items</p>
          <p className="text-lg font-black text-slate-800 tracking-tight leading-none">{deadStockCount} Items</p>
          <p className="text-[9px] text-slate-500 font-bold mt-1">inactive &gt; 45 days</p>
        </div>
      </div>

      {/* Card 6: Reorder Alerts */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[130px] hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
          <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[10px] font-black">trending_down</span>-25%
          </span>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Reorder Alerts</p>
          <p className="text-lg font-black text-slate-800 tracking-tight leading-none">{lowStockCount} Warnings</p>
          <p className="text-[9px] text-slate-500 font-bold mt-1">below safe margin</p>
        </div>
      </div>
    </div>
  );
}
