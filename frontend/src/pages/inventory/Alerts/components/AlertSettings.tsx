import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface AlertRulesConfig {
  enableLowStockAlerts: boolean;
  enableOutOfStockAlerts: boolean;
  enableExpiryAlerts: boolean;
  enableDeadStockAlerts: boolean;
  enableOverstockAlerts: boolean;
  notifyInApp: boolean;
  notifyEmail: boolean;
  notifySMS: boolean;
}

const DEFAULT_ALERT_RULES: AlertRulesConfig = {
  enableLowStockAlerts: true,
  enableOutOfStockAlerts: true,
  enableExpiryAlerts: true,
  enableDeadStockAlerts: false,
  enableOverstockAlerts: true,
  notifyInApp: true,
  notifyEmail: true,
  notifySMS: false,
};

const Toggle = ({ active }: { active: boolean }) => (
  <button className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${active ? 'bg-[#0b8252]' : 'bg-slate-200'}`}>
    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
  </button>
);

export default function AlertSettings() {
  const [rules, setRules] = useState<AlertRulesConfig>(DEFAULT_ALERT_RULES);

  useEffect(() => {
    const stored = localStorage.getItem('stocksense_alert_settings');
    if (stored) {
      try {
        setRules(JSON.parse(stored));
      } catch (e) {
        setRules(DEFAULT_ALERT_RULES);
      }
    }
  }, []);

  const updateField = (field: keyof AlertRulesConfig, value: any) => {
    const updated = { ...rules, [field]: value };
    setRules(updated);
  };

  const saveSettings = () => {
    localStorage.setItem('stocksense_alert_settings', JSON.stringify(rules));
    toast.success("Alert settings saved successfully!");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300 relative overflow-hidden">

      <div className="p-8 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-2xl font-bold text-slate-800">Alert Settings</h2>
        <p className="text-slate-500 mt-1 text-sm">Configure which notifications you want to receive and how you want to receive them.</p>
      </div>
      
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Stock Triggers</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Low Stock Alerts</h4>
                <p className="text-sm text-slate-500 mt-0.5">Receive notifications when items reach their minimum threshold</p>
              </div>
              <div className="cursor-pointer" onClick={() => updateField('enableLowStockAlerts', !rules.enableLowStockAlerts)}>
                <Toggle active={rules.enableLowStockAlerts} />
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Out of Stock Alerts</h4>
                <p className="text-sm text-slate-500 mt-0.5">Immediate alerts when inventory hits zero</p>
              </div>
              <div className="cursor-pointer" onClick={() => updateField('enableOutOfStockAlerts', !rules.enableOutOfStockAlerts)}>
                <Toggle active={rules.enableOutOfStockAlerts} />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Dead Stock Alerts</h4>
                <p className="text-sm text-slate-500 mt-0.5">Alerts for items with no movement over specified duration</p>
              </div>
              <div className="cursor-pointer" onClick={() => updateField('enableDeadStockAlerts', !rules.enableDeadStockAlerts)}>
                <Toggle active={rules.enableDeadStockAlerts} />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Expiry Alerts</h4>
                <p className="text-sm text-slate-500 mt-0.5">Notifications for items approaching their expiration date</p>
              </div>
              <div className="cursor-pointer" onClick={() => updateField('enableExpiryAlerts', !rules.enableExpiryAlerts)}>
                <Toggle active={rules.enableExpiryAlerts} />
              </div>
            </div>
          </div>
        </div>


      </div>
      
      <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
        <button
          onClick={saveSettings}
          className="px-6 py-2.5 bg-[#0b8252] text-white font-bold text-sm rounded-lg shadow-sm hover:bg-[#096b43] transition-colors"
        >
          Save Alert Settings
        </button>
      </div>
    </div>
  );
}
