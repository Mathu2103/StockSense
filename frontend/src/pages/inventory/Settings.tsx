import { useSearchParams } from 'react-router-dom';
import Sidebar from "./Components/Sidebar";
import InventoryHeader from "./Components/InventoryHeader";
import SettingsProfile from "./Components/SettingComponent/SettingsProfile";
import SettingsAccount from "./Components/SettingComponent/SettingsAccount";
import SettingsStockRules from "./Components/SettingComponent/SettingsStockRules";
import SettingsAlerts from "./Components/SettingComponent/SettingsAlerts";
import SettingsExpiry from "./Components/SettingComponent/SettingsExpiry";
import SettingsMovement from "./Components/SettingComponent/SettingsMovement";
import SettingsOrganization from "./Components/SettingComponent/SettingsOrganization";
import SettingsReorder from "./Components/SettingComponent/SettingsReorder";
import SettingsPermissions from "./Components/SettingComponent/SettingsPermissions";
import SettingsData from "./Components/SettingComponent/SettingsData";
import SettingsAnalytics from "./Components/SettingComponent/SettingsAnalytics";

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'Stock Rules';

  const tabs = [
    { id: 'My Profile', icon: 'person' },
    { id: 'Account Settings', icon: 'settings' },
    { id: 'Stock Rules', icon: 'rule' },
    { id: 'Alerts', icon: 'notifications' },
    { id: 'Expiry', icon: 'event_busy' },
    { id: 'Movement', icon: 'sync_alt' },
    { id: 'Organization', icon: 'account_tree' },
    { id: 'Reorder', icon: 'update' },
    { id: 'Permissions', icon: 'lock' },
    { id: 'Data', icon: 'database' },
    { id: 'Analytics', icon: 'bar_chart' },
  ];

  const setActiveTab = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InventoryHeader />

        <main className="flex-1 overflow-y-auto bg-[#f8f9fa] p-6 md:p-8">
          <div className="max-w-[1200px] mx-auto space-y-6 h-full flex flex-col">

            <div className="flex-shrink-0">
              <h1 className="text-3xl font-bold text-slate-800">Inventory Settings</h1>
              <p className="text-slate-500 mt-1">Configure stock rules, alerts, and inventory behavior for your supermarket system.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-1 overflow-hidden min-h-[600px]">

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
                <div className="p-8 flex-1 overflow-y-auto bg-slate-50/30">

                  {activeTab === 'My Profile' && <SettingsProfile />}
                  {activeTab === 'Account Settings' && <SettingsAccount />}
                  {activeTab === 'Stock Rules' && <SettingsStockRules />}
                  {activeTab === 'Alerts' && <SettingsAlerts />}
                  {activeTab === 'Expiry' && <SettingsExpiry />}
                  {activeTab === 'Movement' && <SettingsMovement />}
                  {activeTab === 'Organization' && <SettingsOrganization />}
                  {activeTab === 'Reorder' && <SettingsReorder />}
                  {activeTab === 'Permissions' && <SettingsPermissions />}
                  {activeTab === 'Data' && <SettingsData />}
                  {activeTab === 'Analytics' && <SettingsAnalytics />}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
                  <p className="text-sm text-slate-500 italic">Unsaved changes will be lost.</p>
                  <div className="flex items-center gap-3">
                    <button className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                      Reset
                    </button>
                    <button className="px-6 py-2.5 bg-[#0b8252] text-white font-bold text-sm rounded-lg shadow-sm hover:bg-[#096b43] transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
