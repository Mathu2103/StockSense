import { useSearchParams } from 'react-router-dom';
import Sidebar from '../Shared/Sidebar';
import InventoryHeader from '../Shared/InventoryHeader';
import GRNPage from './operations/GRNPage';
import StockAdjustments from './operations/StockAdjustments';

export default function InventoryOperations() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'grn';

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-on-surface">
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
                  {activeTab === 'adjustments' ? 'Stock Adjustments' : 'Goods Receiving (GRN)'}
                </h1>
                <p className="text-xs text-outline mt-1 font-medium">
                  {activeTab === 'adjustments'
                    ? 'Authorize and log inventory level reconciliations, write-offs, and batch corrections.'
                    : 'Receive inventory shipments, inspect incoming goods, and record GRN receipts.'}
                </p>
              </div>
            </div>

            {/* Active Sub-Page view */}
            <div className="transition-opacity duration-200 ease-in-out">
              {activeTab === 'adjustments' ? <StockAdjustments /> : <GRNPage />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
