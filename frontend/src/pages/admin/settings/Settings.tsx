import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

import AdminSidebar from "../Shared/Sidebar";
import ManagerSidebar from "../../inventory/Shared/Sidebar";
import AdminHeader from "../Shared/AdminHeader";
import ManagerHeader from "../../inventory/Shared/InventoryHeader";

import SettingsProfile from "./SettingComponent/SettingsProfile";
import SettingsAccount from "./SettingComponent/SettingsAccount";
import SettingsStockRules from "./SettingComponent/SettingsStockRules";
import SettingsAlerts from "./SettingComponent/SettingsAlerts";
import { StockRulesConfig } from "./SettingComponent/types";
import { api } from '@/services/axiosInstance';


const DEFAULT_RULES: StockRulesConfig = {
  defaultReorderLevel: '50',
  minimumStockThreshold: '20',
  maximumStockLimit: 'No limit',
  stockUpdateMode: 'Real-time',
  allowNegativeStock: false,
  autoDeductStock: true,
  enableLowStockAlerts: true,
  enableOutOfStockAlerts: true,
  enableDeadStockAlerts: false,
  enableExpiringSoonAlerts: true,
  enableOverstockAlerts: false,
  notifyInApp: true,
  notifyEmail: true,
  notifySMS: false,
};

export default function Settings() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'My Profile';

  const [rules, setRules] = useState<StockRulesConfig>(DEFAULT_RULES);
  const [applyToAll, setApplyToAll] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings/STOCK_RULES');
        if (response.data && response.data.data) {
          setRules(response.data.data);
        }
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // Setting not found, use default
          setRules(DEFAULT_RULES);
        } else {
          console.error("Failed to fetch settings:", error);
          toast.error("Failed to load settings from server.");
        }
      }
    };
    fetchSettings();
  }, []);

  const validateRules = () => {
    const newErrors: { [key: string]: string } = {};
    if (!/^\d+$/.test(rules.defaultReorderLevel)) {
      newErrors.defaultReorderLevel = 'Must be a valid number';
    }
    if (!/^\d+$/.test(rules.minimumStockThreshold)) {
      newErrors.minimumStockThreshold = 'Must be a valid number';
    }
    // If maximumStockLimit is supposed to be a number unless it's "No limit", we can check it
    if (rules.maximumStockLimit !== 'No limit' && !/^\d+$/.test(rules.maximumStockLimit)) {
      newErrors.maximumStockLimit = 'Must be a valid number or "No limit"';
    }

    if (Object.keys(newErrors).length === 0) {
      const minVal = parseInt(rules.minimumStockThreshold, 10);
      const reorderVal = parseInt(rules.defaultReorderLevel, 10);
      const maxVal = rules.maximumStockLimit === 'No limit' ? Infinity : parseInt(rules.maximumStockLimit, 10);

      if (minVal >= reorderVal) {
        newErrors.minimumStockThreshold = 'Minimum threshold must be less than Reorder level';
        newErrors.defaultReorderLevel = 'Reorder level must be greater than Minimum threshold';
      }
      if (reorderVal >= maxVal) {
        newErrors.defaultReorderLevel = 'Reorder level must be less than Maximum limit';
        newErrors.maximumStockLimit = 'Maximum limit must be greater than Reorder level';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClick = () => {
    if (['Stock Rules', 'Alerts'].includes(activeTab)) {
      if (!validateRules()) {
        toast.error('Please fix the errors in the form.');
        return;
      }
      setShowSaveConfirm(true);
    } else {
      confirmSaveSettings();
    }
  };

  const confirmSaveSettings = async () => {
    try {
      await api.put('/settings/STOCK_RULES', { value: rules });

      if (applyToAll && activeTab === 'Stock Rules') {
        await api.post('/settings/apply-stock-rules');
        toast.success("Settings saved and applied to all existing products!");
        setApplyToAll(false); // reset after applying
      } else {
        toast.success("Settings saved successfully!");
      }
    } catch (error: any) {
      console.error("Failed to save settings:", error);
    }
  };

  const resetSettings = async () => {
    setRules(DEFAULT_RULES);
    try {
      await api.put('/settings/STOCK_RULES', { value: DEFAULT_RULES });
      toast.success("Settings reset to defaults.");
    } catch (error) {
      console.error("Failed to reset settings:", error);
      toast.error("Failed to reset settings on server.");
    }
  };

  const tabs = [
    { id: 'My Profile', icon: 'person' },
    { id: 'Account Settings', icon: 'settings' },
    { id: 'Stock Rules', icon: 'rule' },
    { id: 'Alerts', icon: 'notifications' },
  ];

  const setActiveTab = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="flex h-screen bg-[radial-gradient(circle_at_top_right,_rgba(11,130,82,0.10),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#f5f7fb_100%)] text-slate-800 font-sans overflow-hidden">
      {isAdmin ? <AdminSidebar /> : <ManagerSidebar />}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {isAdmin ? <AdminHeader /> : <ManagerHeader />}

        <main className="flex-1 overflow-y-auto p-2 md:p-4">
          <div className="max-w-[1200px] mx-auto space-y-3 h-full flex flex-col">

            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-slate-800">Inventory Settings</h1>
              <p className="text-slate-500 mt-1 text-sm">Configure stock rules, alerts, and inventory behavior for your supermarket system.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-1 overflow-hidden min-h-[500px]">

              {/* Left Settings Sidebar */}
              <div className="w-64 border-r border-slate-200 p-4 flex flex-col gap-1 overflow-y-auto bg-white flex-shrink-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                      ? 'bg-[#0b8252] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                    {tab.id}
                  </button>
                ))}
              </div>

              {/* Right Content Area */}
              <div className="flex-1 flex flex-col bg-white overflow-hidden">
                <div className="p-4 flex-1 overflow-y-auto bg-slate-50/30">

                  {activeTab === 'My Profile' && (
                    <SettingsProfile />
                  )}
                  {activeTab === 'Account Settings' && (
                    <SettingsAccount />
                  )}
                  {activeTab === 'Stock Rules' && (
                    <SettingsStockRules rules={rules} errors={errors} onChange={(updated) => setRules(updated)} />
                  )}
                  {activeTab === 'Alerts' && (
                    <SettingsAlerts rules={rules} onChange={(updated) => setRules(updated)} />
                  )}

                </div>

                {/* Footer */}
                {['Stock Rules', 'Alerts'].includes(activeTab) && (
                  <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-slate-500 italic">Unsaved changes will be lost.</p>
                      {activeTab === 'Stock Rules' && (
                        <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={applyToAll}
                            onChange={(e) => setApplyToAll(e.target.checked)}
                            className="rounded border-slate-300 text-[#0b8252] focus:ring-[#0b8252] w-4 h-4 cursor-pointer"
                          />
                          Apply to all existing products
                        </label>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={resetSettings}
                        className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleSaveClick}
                        className="px-6 py-2.5 bg-[#0b8252] text-white font-bold text-sm rounded-lg shadow-sm hover:bg-[#096b43] transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
      {/* Save Settings Confirmation Modal */}
      {showSaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 border border-slate-200 transform transition-all scale-100">
            <div className="mx-auto w-12 h-12 bg-emerald-50 text-[#0b8252] rounded-full flex items-center justify-center mb-4 border border-emerald-100">
              <span className="material-symbols-outlined text-[26px]">save_as</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Save Configuration Changes?</h3>
            <p className="text-xs text-slate-500 text-center mb-4">Review the settings below before applying changes to the system.</p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-2.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {activeTab} Summary
              </p>

              {activeTab === 'Stock Rules' ? (
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 font-medium">
                  <div className="p-2.5 bg-white border border-slate-100 rounded-lg">
                    <span className="text-[10px] block text-slate-400 uppercase tracking-wide">Reorder Level</span>
                    <strong className="text-slate-900 text-[13px]">{rules.defaultReorderLevel}%</strong>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-100 rounded-lg">
                    <span className="text-[10px] block text-slate-400 uppercase tracking-wide">Minimum Stock</span>
                    <strong className="text-slate-900 text-[13px]">{rules.minimumStockThreshold}%</strong>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-100 rounded-lg">
                    <span className="text-[10px] block text-slate-400 uppercase tracking-wide">Maximum Stock</span>
                    <strong className="text-slate-900 text-[13px]">
                      {rules.maximumStockLimit === 'No limit' ? 'No limit' : `${rules.maximumStockLimit}%`}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-100 rounded-lg">
                    <span className="text-[10px] block text-slate-400 uppercase tracking-wide">Negative Stock</span>
                    <strong className={rules.allowNegativeStock ? 'text-amber-600 text-[13px]' : 'text-slate-900 text-[13px]'}>
                      {rules.allowNegativeStock ? 'Allowed' : 'Restricted'}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-100 rounded-lg col-span-2">
                    <span className="text-[10px] block text-slate-400 uppercase tracking-wide">Deduction Method</span>
                    <strong className={!rules.autoDeductStock ? 'text-rose-600 text-[13px]' : 'text-slate-900 text-[13px]'}>
                      {rules.autoDeductStock ? 'Auto-Deduct (On Checkout)' : 'Manual Sync (Batch)'}
                    </strong>
                  </div>

                  {applyToAll && (
                    <div className="col-span-2 p-2 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-[11px] flex gap-1.5 items-center">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      <span>Will apply to <strong className="font-bold">all existing products</strong> immediately.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Low Stock Alerts:</span>
                    <strong className={rules.enableLowStockAlerts ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                      {rules.enableLowStockAlerts ? 'Enabled' : 'Disabled'}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Out of Stock Alerts:</span>
                    <strong className={rules.enableOutOfStockAlerts ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                      {rules.enableOutOfStockAlerts ? 'Enabled' : 'Disabled'}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Expiring Soon Alerts:</span>
                    <strong className={rules.enableExpiringSoonAlerts ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                      {rules.enableExpiringSoonAlerts ? 'Enabled' : 'Disabled'}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Dead Stock Alerts:</span>
                    <strong className={rules.enableDeadStockAlerts ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                      {rules.enableDeadStockAlerts ? 'Enabled' : 'Disabled'}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Overstock Alerts:</span>
                    <strong className={rules.enableOverstockAlerts ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                      {rules.enableOverstockAlerts ? 'Enabled' : 'Disabled'}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmSaveSettings();
                  setShowSaveConfirm(false);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-[#0b8252] hover:bg-[#096b43] transition-colors shadow-sm"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
