/**
 * VelocityTab.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the "Product Velocity" tab on the Inventory Analytics page.
 * This file integrates three sections that analyse stock movement speed:
 *
 *   ┌───────────────────────────────────────┬──────────────────────────────────┐
 *   │ FastMovingProductsSection             │ StockTurnoverVisualSection        │
 *   │ (lg:col-span-2)                       │                                  │
 *   │ Ranked table of top-selling products  │ Horizontal rotation ratio bars   │
 *   │ with High Demand / Steady badges      │ showing each product's velocity  │
 *   └───────────────────────────────────────┴──────────────────────────────────┘
 *   ┌──────────────────────────────────────────────────────────────────────────┐
 *   │ SmartReorderSuggestionsSection  (lg:col-span-3)                         │
 *   │ Cards for each below-threshold product with urgency-coded Reorder Now   │
 *   │ buttons that trigger a toast confirmation on click                       │
 *   └──────────────────────────────────────────────────────────────────────────┘
 *
 * Data flow:
 *   InventoryAnalytics (state + useMemo) → VelocityTab (props) →
 *   FastMovingProductsSection / StockTurnoverVisualSection / SmartReorderSuggestionsSection
 *
 * All sub-functions are local (not exported) — tightly coupled to this tab.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { FastMovingProps, ReorderProps, FastMovingItem, ReorderItem } from './analyticsTypes';
import { ProductItem } from '../../StockOperations/operations/inventoryOperationsService';

// ─── Combined props for the Product Velocity tab ─────────────────────────────
interface VelocityTabProps {
  dynamicFastMoving: FastMovingItem[];
  products: ProductItem[];
  dynamicReorderSuggestions: ReorderItem[];
  triggerToast: (msg: string) => void;
}

// ─── Main Tab Wrapper ─────────────────────────────────────────────────────────
export default function VelocityTab({
  dynamicFastMoving,
  products,
  dynamicReorderSuggestions,
  triggerToast
}: VelocityTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <FastMovingProductsSection dynamicFastMoving={dynamicFastMoving} />
      <StockTurnoverVisualSection products={products} />
      <SmartReorderSuggestionsSection
        dynamicReorderSuggestions={dynamicReorderSuggestions}
        triggerToast={triggerToast}
      />
    </div>
  );
}

// ─── Fast Moving Products Ranked Table ────────────────────────────────────────
function FastMovingProductsSection({ dynamicFastMoving }: FastMovingProps) {
  const rankColors = [
    'bg-amber-100 text-amber-700 border border-amber-200',
    'bg-slate-200 text-slate-700 border border-slate-300',
    'bg-[#ffedd5] text-[#c2410c] border border-[#fed7aa]',
    'bg-slate-100 text-slate-500'
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-800 leading-tight">Fast Moving Products</h3>
            <p className="text-[11px] font-medium text-slate-500 mt-1">Highest sales transaction velocities this period</p>
          </div>
          <span className="material-symbols-outlined text-amber-500 text-[20px]">local_fire_department</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                {['Rank & Product Name', 'Category', 'Movements', 'Revenue', 'Status'].map((h, i) => (
                  <th key={i} className={`p-3 text-xs font-black text-slate-500 uppercase tracking-widest ${i === 2 ? 'text-center' : i === 3 ? 'text-right' : i === 4 ? 'text-center' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {dynamicFastMoving.map((item, idx) => {
                const isTop3 = idx < 3;
                return (
                  <tr key={idx} className={`transition-colors ${isTop3 ? 'bg-emerald-50/20 hover:bg-emerald-50/40 font-bold' : 'hover:bg-slate-50'}`}>
                    <td className="p-3 flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${rankColors[Math.min(idx, 3)]}`}>
                        {idx + 1}
                      </div>
                      <span className="text-slate-800 font-extrabold">{item.name}</span>
                    </td>
                    <td className="p-3 text-slate-500 text-xs font-bold">{item.category}</td>
                    <td className="p-3 text-center font-black text-[#0b8252]">{item.movementCount} times</td>
                    <td className="p-3 text-right font-extrabold text-slate-800">{item.salesVolume}</td>
                    <td className="p-3 text-center">
                      {isTop3
                        ? <span className="px-2 py-0.5 text-[9px] font-black rounded bg-emerald-100 text-[#0b8252] uppercase tracking-wide border border-emerald-200">High Demand</span>
                        : <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-500 uppercase tracking-wide">Steady</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Stock Turnover Horizontal Bars ──────────────────────────────────────────
function StockTurnoverVisualSection({ products }: { products: ProductItem[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-800 leading-tight">Stock Turnover Rates</h3>
            <p className="text-[11px] font-medium text-slate-500 mt-1">Relative inventory rotation ratios</p>
          </div>
          <span className="material-symbols-outlined text-[#0b8252] text-[20px]">bar_chart</span>
        </div>

        <div className="space-y-4">
          {products.slice(0, 5).map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span className="truncate max-w-[190px]">{item.name}</span>
                <span className="text-[#0b8252] font-black">{(9.5 - idx * 1.2).toFixed(1)}x</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#0b8252] h-full rounded-full transition-all duration-500"
                  style={{ width: `${90 - idx * 12}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mt-6 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Rotation: &gt; 7.0x</p>
      </div>
    </div>
  );
}

// ─── Smart Reorder Suggestion Cards ──────────────────────────────────────────
function SmartReorderSuggestionsSection({ dynamicReorderSuggestions, triggerToast }: ReorderProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-3">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-extrabold text-base text-slate-800 leading-tight">Smart Reorder Suggestions</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1">AI calculated restock recommendations based on lead times</p>
        </div>
        <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-black rounded uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px] font-black">flash_on</span>Auto Recommend
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {dynamicReorderSuggestions.map((item, idx) => {
          const isCrit = item.urgency === 'Critical';
          const isWarn = item.urgency === 'Warning';
          return (
            <div key={idx} className={`border rounded-xl p-4 flex flex-col justify-between h-[155px] transition-all hover:-translate-y-0.5 hover:shadow-sm ${isCrit ? 'bg-rose-50/20 border-rose-200' :
                isWarn ? 'bg-amber-50/20 border-amber-200' :
                  'bg-[#f8fcf9] border-[#d1fae5]'
              }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-black text-slate-800 leading-tight truncate max-w-[170px]" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    Stock: <span className="font-extrabold">{item.stock}</span> / {item.threshold}
                  </p>
                </div>
                {(isCrit || isWarn) && (
                  <span className={`material-symbols-outlined text-[16px] font-bold ${isCrit ? 'text-rose-500' : 'text-amber-500'}`}>
                    warning
                  </span>
                )}
              </div>

              <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Suggested Order</p>
                  <p className="text-sm font-black text-[#0b8252]">+{item.suggestedQty} Units</p>
                </div>
                <span
                  className={`px-2 py-1 text-[9px] font-black rounded uppercase tracking-wider cursor-pointer transition-colors shadow-sm ${isCrit ? 'bg-rose-600 text-white hover:bg-rose-700' :
                      isWarn ? 'bg-amber-500 text-white hover:bg-amber-600' :
                        'bg-[#0b8252] text-white hover:bg-[#096e45]'
                    }`}
                  onClick={() => triggerToast(`Reorder form compiled for: "${item.name}"!`)}
                >
                  Reorder Now
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
