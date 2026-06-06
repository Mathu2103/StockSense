import { useSearchParams } from 'react-router-dom';
import Sidebar from '../Shared/Sidebar';
import InventoryHeader from '../Shared/InventoryHeader';
import GRNPage from './operations/GRNPage';
import StockAdjustments from './operations/StockAdjustments';

export default function InventoryOperations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'grn';

  // Toggle active tabs
  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const tabsConfig = [
    { id: 'grn', label: 'Goods Receiving (GRN)', icon: 'local_shipping' },
    { id: 'adjustments', label: 'Stock Adjustments', icon: 'sync_alt' }
  ];

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background font-sans text-on-surface">
      {/* Shared Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Consistent Inventory Header */}
        <InventoryHeader />

        {/* Page Content View Scroll container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background px-4 py-6 sm:px-6 lg:px-8 relative">
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-800">
                  Stock Operations Hub
                </h1>
                <p className="text-xs text-outline mt-1 font-medium">
                  Perform goods receiving (GRN), monitor real-time stock status, audit unified ledger transactions, and authorize adjustments.
                </p>
              </div>
            </div>

            {/* Segment Controls Navigation Tab Bar */}
            <div className="border-b border-outline-variant pb-px">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="inline-flex p-1 bg-surface-container-low border border-outline-variant/60 rounded-lg text-xs font-medium w-full sm:w-auto overflow-x-auto gap-1">
                  {tabsConfig.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTabChange(t.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all whitespace-nowrap ${activeTab === t.id
                        ? 'bg-white text-primary shadow-sm font-black'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-50'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Sub-Page tab router with smooth fades */}
            <div className="transition-opacity duration-200 ease-in-out">
              {activeTab === 'grn' && <GRNPage />}
              {activeTab === 'adjustments' && <StockAdjustments />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
