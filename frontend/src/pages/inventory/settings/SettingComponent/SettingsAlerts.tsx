import React from 'react';
import { Toggle } from './Toggle';
import { StockRulesConfig } from "./types";

interface Props {
  rules: StockRulesConfig;
  onChange: (updated: StockRulesConfig) => void;
}

interface AlertRowProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  tag?: string;
  active: boolean;
  onToggle: () => void;
}

function AlertRow({ icon, iconBg, iconColor, title, subtitle, tag, active, onToggle }: AlertRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${active ? iconBg : 'bg-slate-100'}`}>
          <span className={`material-symbols-outlined text-[18px] transition-colors ${active ? iconColor : 'text-slate-300'}`}>{icon}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold transition-colors ${active ? 'text-slate-800' : 'text-slate-400'}`}>{title}</span>
            {tag && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#0b8252] text-white tracking-wide">{tag}</span>
            )}
          </div>
          <p className={`text-xs font-medium mt-0.5 transition-colors ${active ? 'text-slate-400' : 'text-slate-300'}`}>{subtitle}</p>
        </div>
      </div>
      <div className="cursor-pointer flex-shrink-0" onClick={onToggle}>
        <Toggle active={active} />
      </div>
    </div>
  );
}

export default function SettingsAlerts({ rules, onChange }: Props) {
  const update = (field: keyof StockRulesConfig, value: any) =>
    onChange({ ...rules, [field]: value });

  const reorderPct = rules.defaultReorderLevel || '25';
  const minPct = rules.minimumStockThreshold || '10';
  const maxPct = rules.maximumStockLimit || '100';

  const activeCount = [
    rules.enableLowStockAlerts,
    rules.enableOutOfStockAlerts,
    rules.enableExpiryAlerts,
    rules.enableDeadStockAlerts,
    rules.enableOverstockAlerts,
  ].filter(Boolean).length;

  return (
    <div className="max-w-xl animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-[#0b8252] text-[22px]">notifications_active</span>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Alert Settings</h2>
          <p className="text-xs text-slate-400 font-medium">{activeCount} of 5 alert types active · Thresholds apply per product</p>
        </div>
      </div>

      {/* Active threshold pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
          <span className="material-symbols-outlined text-[12px]">arrow_downward</span>
          Reorder at {reorderPct}%
        </span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
          <span className="material-symbols-outlined text-[12px]">warning</span>
          Critical at {minPct}%
        </span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
          <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
          Ceiling at {maxPct}%
        </span>
      </div>

      {/* Alert toggles */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 mb-5">
        <AlertRow
          icon="warning" iconBg="bg-amber-50" iconColor="text-amber-500"
          title="Low Stock Alerts"
          subtitle={`Below ${reorderPct}% reorder · ${minPct}% critical — per product capacity`}
          active={rules.enableLowStockAlerts}
          onToggle={() => update('enableLowStockAlerts', !rules.enableLowStockAlerts)}
        />
        <AlertRow
          icon="cancel" iconBg="bg-red-50" iconColor="text-red-500"
          title="Out of Stock Alerts"
          subtitle="Fires when any active product hits zero units"
          active={rules.enableOutOfStockAlerts}
          onToggle={() => update('enableOutOfStockAlerts', !rules.enableOutOfStockAlerts)}
        />
        <AlertRow
          icon="alarm" iconBg="bg-orange-50" iconColor="text-orange-500"
          title="Expiring Soon Alerts"
          subtitle="Date-driven · auto-escalates 90d → 30d → 7d → Expired"
          tag="NOVELTY"
          active={rules.enableExpiryAlerts}
          onToggle={() => update('enableExpiryAlerts', !rules.enableExpiryAlerts)}
        />
        <AlertRow
          icon="inventory_2" iconBg="bg-purple-50" iconColor="text-purple-500"
          title="Dead Stock Alerts"
          subtitle="Velocity engine · Never Sold, Dead (30d+), Slow Moving"
          tag="NOVELTY"
          active={rules.enableDeadStockAlerts}
          onToggle={() => update('enableDeadStockAlerts', !rules.enableDeadStockAlerts)}
        />
        <AlertRow
          icon="trending_down" iconBg="bg-blue-50" iconColor="text-blue-500"
          title="Overstock Alerts"
          subtitle={`Exceeds ${maxPct}% ceiling — per product capacity`}
          active={rules.enableOverstockAlerts}
          onToggle={() => update('enableOverstockAlerts', !rules.enableOverstockAlerts)}
        />
      </div>

      {/* Notification Channels */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Notification Channels</p>
        <div className="flex gap-3">
          {[
            { field: 'notifyInApp' as keyof StockRulesConfig, icon: 'notifications', label: 'In-App', checked: rules.notifyInApp },
            { field: 'notifyEmail' as keyof StockRulesConfig, icon: 'email', label: 'Email', checked: rules.notifyEmail },
            { field: 'notifySMS' as keyof StockRulesConfig, icon: 'sms', label: 'SMS', checked: rules.notifySMS },
          ].map(({ field, icon, label, checked }) => (
            <label
              key={field}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border cursor-pointer transition-all ${checked ? 'border-[#0b8252] bg-emerald-50/60' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
            >
              <input
                type="checkbox"
                checked={checked as boolean}
                onChange={(e) => update(field, e.target.checked)}
                className="hidden"
              />
              <span className={`material-symbols-outlined text-[20px] ${checked ? 'text-[#0b8252]' : 'text-slate-400'}`}>{icon}</span>
              <span className={`text-xs font-bold ${checked ? 'text-[#0b8252]' : 'text-slate-500'}`}>{label}</span>
              {checked && <span className="w-1.5 h-1.5 rounded-full bg-[#0b8252]" />}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
