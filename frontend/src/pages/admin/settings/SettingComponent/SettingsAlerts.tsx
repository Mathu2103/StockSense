import { Toggle } from './Toggle';

import { StockRulesConfig } from "./types";

interface Props {
  rules: StockRulesConfig;
  onChange: (updated: StockRulesConfig) => void;
}

export default function SettingsAlerts({ rules, onChange }: Props) {
  const updateField = (field: keyof StockRulesConfig, value: any) => {
    onChange({
      ...rules,
      [field]: value
    });
  };

  return (
    <div className="max-w-4xl animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-[13px] font-bold">
          <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
          Reorder at {rules.defaultReorderLevel}%
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-50 text-red-600 text-[13px] font-bold">
          <span className="material-symbols-outlined text-[16px]">warning_amber</span>
          Critical at {rules.minimumStockThreshold}%
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-50 text-blue-600 text-[13px] font-bold">
          <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
          Ceiling at {rules.maximumStockLimit}%
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl p-2 shadow-sm">
        
        {/* Low Stock Alerts */}
        <div className="flex items-center justify-between p-4 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <span className="material-symbols-outlined">warning_amber</span>
            </div>
            <div>
              <div className="flex items-center">
                <h4 className={`text-[15px] font-bold ${rules.enableLowStockAlerts ? 'text-slate-800' : 'text-slate-400'}`}>Low Stock Alerts</h4>
              </div>
              <p className={`text-[14px] mt-0.5 ${rules.enableLowStockAlerts ? 'text-slate-500' : 'text-slate-300'}`}>
                Below {rules.defaultReorderLevel}% reorder · {rules.minimumStockThreshold}% critical — per product capacity
              </p>
            </div>
          </div>
          <div className="cursor-pointer ml-4" onClick={() => updateField('enableLowStockAlerts', !rules.enableLowStockAlerts)}>
            <Toggle active={rules.enableLowStockAlerts} />
          </div>
        </div>

        {/* Out of Stock Alerts */}
        <div className="flex items-center justify-between p-4 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
              <span className="material-symbols-outlined text-[20px]">cancel</span>
            </div>
            <div>
              <div className="flex items-center">
                <h4 className={`text-[15px] font-bold ${rules.enableOutOfStockAlerts ? 'text-slate-800' : 'text-slate-400'}`}>Out of Stock Alerts</h4>
              </div>
              <p className={`text-[14px] mt-0.5 ${rules.enableOutOfStockAlerts ? 'text-slate-500' : 'text-slate-300'}`}>
                Fires when any active product hits zero units
              </p>
            </div>
          </div>
          <div className="cursor-pointer ml-4" onClick={() => updateField('enableOutOfStockAlerts', !rules.enableOutOfStockAlerts)}>
            <Toggle active={rules.enableOutOfStockAlerts} />
          </div>
        </div>

        {/* Expiring Soon Alerts */}
        <div className="flex items-center justify-between p-4 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
              <span className="material-symbols-outlined">alarm</span>
            </div>
            <div>
              <div className="flex items-center">
                <h4 className={`text-[15px] font-bold ${rules.enableExpiringSoonAlerts ? 'text-slate-800' : 'text-slate-400'}`}>Expiring Soon Alerts</h4>
                <span className="bg-[#0b8252] text-white text-[10px] font-bold px-2 py-0.5 rounded ml-2 uppercase tracking-wide">Novelty</span>
              </div>
              <p className={`text-[14px] mt-0.5 ${rules.enableExpiringSoonAlerts ? 'text-slate-500' : 'text-slate-300'}`}>
                Date-driven · auto-escalates 50% → 25% → 10% → Expired
              </p>
            </div>
          </div>
          <div className="cursor-pointer ml-4" onClick={() => updateField('enableExpiringSoonAlerts', !rules.enableExpiringSoonAlerts)}>
            <Toggle active={rules.enableExpiringSoonAlerts} />
          </div>
        </div>

        {/* Dead Stock Alerts */}
        <div className="flex items-center justify-between p-4 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <div>
              <div className="flex items-center">
                <h4 className={`text-[15px] font-bold ${rules.enableDeadStockAlerts ? 'text-slate-800' : 'text-slate-400'}`}>Dead Stock Alerts</h4>
                <span className="bg-[#0b8252] text-white text-[10px] font-bold px-2 py-0.5 rounded ml-2 uppercase tracking-wide">Novelty</span>
              </div>
              <p className={`text-[14px] mt-0.5 ${rules.enableDeadStockAlerts ? 'text-slate-500' : 'text-slate-300'}`}>
                Velocity engine · Never Sold, Dead (30d+), Slow Moving
              </p>
            </div>
          </div>
          <div className="cursor-pointer ml-4" onClick={() => updateField('enableDeadStockAlerts', !rules.enableDeadStockAlerts)}>
            <Toggle active={rules.enableDeadStockAlerts} />
          </div>
        </div>

        {/* Overstock Alerts */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
              <span className="material-symbols-outlined">trending_down</span>
            </div>
            <div>
              <div className="flex items-center">
                <h4 className={`text-[15px] font-bold ${rules.enableOverstockAlerts ? 'text-slate-800' : 'text-slate-400'}`}>Overstock Alerts</h4>
              </div>
              <p className={`text-[14px] mt-0.5 ${rules.enableOverstockAlerts ? 'text-slate-500' : 'text-slate-300'}`}>
                Exceeds {rules.maximumStockLimit}% ceiling — per product capacity
              </p>
            </div>
          </div>
          <div className="cursor-pointer ml-4" onClick={() => updateField('enableOverstockAlerts', !rules.enableOverstockAlerts)}>
            <Toggle active={rules.enableOverstockAlerts} />
          </div>
        </div>

      </div>
    </div>
  );
}
