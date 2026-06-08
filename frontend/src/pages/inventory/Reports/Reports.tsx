import { useSearchParams } from 'react-router-dom';
import { ViewState } from './reports/reportUtils';
import Sidebar from '../Shared/Sidebar';
import InventoryHeader from '../Shared/InventoryHeader';
import ReportsOverview from './reports/ReportsOverview';
import SalesReports from './reports/SalesReports';
import InventoryReports from './reports/InventoryReports';
import PurchaseReports from './reports/PurchaseReports';
import AlertReports from './reports/AlertReports';
import SupplierReports from './reports/SupplierReports';
import ActivityReports from './reports/ActivityReports';

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = (searchParams.get('view') as ViewState) || 'overview';

  const setActiveView = (view: ViewState) => {
    setSearchParams({ view });
  };

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <ReportsOverview onViewChange={setActiveView} />;
      case 'sales':
        return <SalesReports onViewChange={setActiveView} />;
      case 'inventory':
        return <InventoryReports onViewChange={setActiveView} />;
      case 'supplier':
        return <SupplierReports onViewChange={setActiveView} />;
      case 'activity':
        return <ActivityReports />;
      case 'purchase':
        return <PurchaseReports onViewChange={setActiveView} />;
      case 'alert':
        return <AlertReports onViewChange={setActiveView} />;
      default:
        return <ReportsOverview onViewChange={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InventoryHeader />

        <main className="flex-1 overflow-y-auto px-6 py-6 bg-[#f8f9fa]">
          <div className="max-w-[1400px] w-full mx-auto space-y-6">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
