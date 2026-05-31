/**
 * OverviewTab.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the "Overview & Health" tab on the Inventory Analytics page.
 * This file integrates three related sections that always appear together:
 *
 *   ┌─────────────────────────┬──────────────────────────────────────────────┐
 *   │ InventoryHealthOverview │       MovementInsightsCard (lg:col-span-2)   │
 *   │  SVG Donut Chart        │  Category-wise Stock In / Out / Adjustment   │
 *   │  + Healthy / Warning /  │  grouped bar chart with hover tooltips       │
 *   │    Critical legend      │                                              │
 *   └─────────────────────────┴──────────────────────────────────────────────┘
 *   ┌──────────────────────────────────────────────────────────────────────────┐
 *   │ CategoryPerformanceSection  — full-width table                          │
 *   │ Shows Sales / Stock Value / Turnover Rate / Auditor Status per category │
 *   └──────────────────────────────────────────────────────────────────────────┘
 *
 * Data flow:
 *   InventoryAnalytics (state + useMemo) → OverviewTab (props) →
 *   InventoryHealthOverviewCard / MovementInsightsCard / CategoryPerformanceSection
 *
 * All sub-functions are local (not exported) because they are tightly coupled
 * to this tab layout and not reused elsewhere.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import {
  HealthOverviewProps,
  MovementInsightsProps,
  CategoryPerformanceProps,
  CategoryPerfItem,
  MovementInsightItem,
  HealthStats
} from './analyticsTypes';

// ─── Combined props for the Overview & Health tab ────────────────────────────
interface OverviewTabProps {
  dynamicHealthStats: HealthStats;
  hoveredDonutSegment: string | null;
  setHoveredDonutSegment: (val: string | null) => void;

  dynamicMovementInsights: MovementInsightItem[];
  hoveredChartBar: string | null;
  setHoveredChartBar: (val: string | null) => void;

  dynamicCategoryPerformance: CategoryPerfItem[];
}

// ─── Main Tab Wrapper ─────────────────────────────────────────────────────────
export default function OverviewTab({
  dynamicHealthStats,
  hoveredDonutSegment,
  setHoveredDonutSegment,
  dynamicMovementInsights,
  hoveredChartBar,
  setHoveredChartBar,
  dynamicCategoryPerformance
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InventoryHealthOverviewCard
          dynamicHealthStats={dynamicHealthStats}
          hoveredDonutSegment={hoveredDonutSegment}
          setHoveredDonutSegment={setHoveredDonutSegment}
        />
        <MovementInsightsCard
          dynamicMovementInsights={dynamicMovementInsights}
          hoveredChartBar={hoveredChartBar}
          setHoveredChartBar={setHoveredChartBar}
        />
      </div>
      <CategoryPerformanceSection
        dynamicCategoryPerformance={dynamicCategoryPerformance}
      />
    </div>
  );
}

// ─── Inventory Health Donut Chart ─────────────────────────────────────────────
function InventoryHealthOverviewCard({
  dynamicHealthStats,
  hoveredDonutSegment,
  setHoveredDonutSegment
}: HealthOverviewProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-extrabold text-base text-slate-800 leading-tight">Inventory Health Overview</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Segmented inventory lot analysis</p>
        </div>
        <span className="material-symbols-outlined text-slate-400 text-[18px]">pie_chart</span>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 my-auto py-2">
        {/* SVG Donut Chart */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0b8252" strokeWidth="4"
              strokeDasharray={`${dynamicHealthStats.healthy} 100`} strokeDashoffset="0"
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredDonutSegment('Healthy')}
              onMouseLeave={() => setHoveredDonutSegment(null)}
            />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="4"
              strokeDasharray={`${dynamicHealthStats.warning} 100`} strokeDashoffset={`-${dynamicHealthStats.healthy}`}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredDonutSegment('Warning')}
              onMouseLeave={() => setHoveredDonutSegment(null)}
            />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#dc2626" strokeWidth="4"
              strokeDasharray={`${dynamicHealthStats.critical} 100`} strokeDashoffset={`-${dynamicHealthStats.healthy + dynamicHealthStats.warning}`}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredDonutSegment('Critical')}
              onMouseLeave={() => setHoveredDonutSegment(null)}
            />
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {hoveredDonutSegment ? (
              <>
                <p className="text-[10px] font-black text-slate-500 uppercase">{hoveredDonutSegment}</p>
                <p className="text-lg font-black text-slate-800">
                  {hoveredDonutSegment === 'Healthy'
                    ? `${dynamicHealthStats.healthy}%`
                    : hoveredDonutSegment === 'Warning'
                      ? `${dynamicHealthStats.warning}%`
                      : `${dynamicHealthStats.critical}%`}
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-black text-slate-800">{dynamicHealthStats.healthy}%</p>
                <p className="text-[9px] font-bold text-emerald-600 uppercase">Optimal Health</p>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3 flex-1">
          {([
            { label: 'Healthy Stock',  count: dynamicHealthStats.healthyCount,  pct: dynamicHealthStats.healthy,  color: 'border-[#0b8252]',  textColor: 'text-[#0b8252]'  },
            { label: 'Warning Stock',  count: dynamicHealthStats.warningCount,   pct: dynamicHealthStats.warning,  color: 'border-[#f59e0b]',  textColor: 'text-[#f59e0b]'  },
            { label: 'Critical Stock', count: dynamicHealthStats.criticalCount,  pct: dynamicHealthStats.critical, color: 'border-[#dc2626]',  textColor: 'text-[#dc2626]'  }
          ] as const).map(row => (
            <div key={row.label} className={`flex items-center justify-between border-l-4 ${row.color} pl-3`}>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase leading-none">{row.label}</p>
                <p className="text-xs font-black text-slate-800 mt-1">{row.count} Units</p>
              </div>
              <span className={`text-xs font-black ${row.textColor}`}>{row.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Category Movement Bar Chart ──────────────────────────────────────────────
function MovementInsightsCard({
  dynamicMovementInsights,
  hoveredChartBar,
  setHoveredChartBar
}: MovementInsightsProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-extrabold text-base text-slate-800 leading-tight">Movement Insights</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Category movement comparison logs</p>
        </div>
        <div className="flex gap-4 text-[10px] font-black text-slate-600">
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#0b8252] rounded-sm" />Stock In</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />Stock Out</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#f59e0b] rounded-sm" />Adjustments</div>
        </div>
      </div>

      <div className="flex-1 flex items-end justify-between gap-6 pt-4 min-h-[160px] relative border-b border-slate-100">
        {dynamicMovementInsights.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div className="w-full flex items-end justify-center gap-1 h-32">
              {[
                { height: item.inPct,  color: 'bg-[#0b8252]', label: `${item.label} - Stock In: ${item.rawIn} units`  },
                { height: item.outPct, color: 'bg-blue-500',  label: `${item.label} - Stock Out: ${item.rawOut} units` },
                { height: item.adjPct, color: 'bg-[#f59e0b]', label: `${item.label} - Adjustments: ${item.rawAdj} units` }
              ].map((bar, bIdx) => (
                <div
                  key={bIdx}
                  style={{ height: `${bar.height}%` }}
                  className={`w-3 ${bar.color} rounded-t-sm hover:opacity-80 transition-all cursor-pointer`}
                  onMouseEnter={() => setHoveredChartBar(bar.label)}
                  onMouseLeave={() => setHoveredChartBar(null)}
                />
              ))}
            </div>
            <span className="text-[9px] font-black text-slate-500 mt-2 truncate w-16 text-center" title={item.label}>
              {item.label}
            </span>
          </div>
        ))}

        {hoveredChartBar && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white px-3 py-1.5 rounded-lg shadow-md text-[10px] font-black z-10">
            {hoveredChartBar}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Category Performance Table ───────────────────────────────────────────────
function CategoryPerformanceSection({ dynamicCategoryPerformance }: CategoryPerformanceProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-extrabold text-base text-slate-800 leading-tight">Category Performance</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Breakdown of product turnover metrics by store sector</p>
        </div>
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
          {dynamicCategoryPerformance.length} Registered Sectors
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              {['Category Name', 'Total Sales', 'Stock Value', 'Movement Rate', 'Auditor Status'].map((h, i) => (
                <th key={i} className={`p-4 text-xs font-black text-slate-500 uppercase tracking-widest ${i === 1 ? 'text-center' : i === 2 ? 'text-right' : i >= 3 ? 'text-center' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
            {dynamicCategoryPerformance.map((item, idx) => {
              const isBest = item.performance === 'Best';
              const isWeak = item.performance === 'Weak';
              return (
                <tr key={idx} className={`transition-colors ${isBest ? 'bg-emerald-50/20 hover:bg-emerald-50/40' : isWeak ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-slate-50'}`}>
                  <td className="p-4 font-bold text-slate-800">{item.name}</td>
                  <td className="p-4 text-center font-bold text-slate-700">{item.totalSales}</td>
                  <td className="p-4 text-right font-bold text-slate-800">{item.stockValue}</td>
                  <td className="p-4 text-center font-black text-[#0b8252]">{item.movementRate}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                      isBest ? 'bg-emerald-100 text-[#0b8252] border border-emerald-200' :
                      isWeak ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                               'bg-slate-100 text-slate-700'
                    }`}>
                      {isBest ? '🔥 Top Sector' : isWeak ? '⚠ Slow Moving' : 'Normal'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
