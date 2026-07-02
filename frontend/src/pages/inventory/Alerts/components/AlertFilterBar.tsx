import { AlertSeverity, Tab } from '../types/alertTypes';

const TABS: Tab[] = ['All Alerts', 'Low Stock', 'Out of Stock', 'Expiring Soon', 'Dead Stock', 'Overstock', 'Reorder Recommendation', 'Discount'];

interface AlertFilterBarProps {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  tabCount: (t: Tab) => number;
  showFilters: boolean;
  setShowFilters: (s: boolean) => void;
  sevFilter: AlertSeverity | 'All';
  setSevFilter: (s: AlertSeverity | 'All') => void;
  readFilter: 'All' | 'Unread' | 'Read';
  setReadFilter: (r: 'All' | 'Unread' | 'Read') => void;
}

export default function AlertFilterBar({
  activeTab,
  setActiveTab,
  tabCount,
  showFilters,
  setShowFilters,
  sevFilter,
  setSevFilter,
  readFilter,
  setReadFilter,
}: AlertFilterBarProps) {
  return (
    <>
      {/* ── Filter Panel ── */}
      {showFilters && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/20" onClick={() => setShowFilters(false)} />
          <div className="w-72 bg-white shadow-2xl flex flex-col h-full">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Filter Alerts</h3>
              <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 space-y-6 flex-1 overflow-y-auto">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Severity</p>
                <div className="space-y-2">
                  {(['All', 'Critical', 'Warning', 'Info'] as const).map(s => (
                    <label key={s} className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="sev" checked={sevFilter === s}
                        onChange={() => setSevFilter(s)}
                        className="w-4 h-4 text-[#0b8252] focus:ring-[#0b8252]" />
                      <span className="text-sm font-medium text-slate-700">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Read Status</p>
                <div className="space-y-2">
                  {(['All', 'Unread', 'Read'] as const).map(r => (
                    <label key={r} className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="read" checked={readFilter === r}
                        onChange={() => setReadFilter(r)}
                        className="w-4 h-4 text-[#0b8252] focus:ring-[#0b8252]" />
                      <span className="text-sm font-medium text-slate-700">{r}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-200">
              <button
                onClick={() => { setSevFilter('All'); setReadFilter('All'); }}
                className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs with live count badges */}
      <div className="flex space-x-6 border-b border-slate-200 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm font-bold border-b-2 transition-colors duration-200 whitespace-nowrap flex items-center gap-1.5 ${activeTab === tab
              ? 'border-[#0b8252] text-[#0b8252]'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
          >
            {tab}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-[#eef8f2] text-[#0b8252]' : 'bg-slate-100 text-slate-500'
              }`}>
              {tabCount(tab)}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
