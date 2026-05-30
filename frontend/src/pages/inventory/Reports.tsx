import { useState } from 'react';
import { ViewState } from './Components/reports/reportUtils';
import Sidebar from './Components/Sidebar';
import InventoryHeader from './Components/InventoryHeader';
import ReportsOverview from './Components/reports/ReportsOverview';
import SalesReports from './Components/reports/SalesReports';
import InventoryReports from './Components/reports/InventoryReports';
import SupplierReports from './Components/reports/SupplierReports';
import ActivityReports from './Components/reports/ActivityReports';
import PurchaseReports from './Components/reports/PurchaseReports';
import AlertReports from './Components/reports/AlertReports';

export default function Reports() {
  const [activeView, setActiveView] = useState<ViewState>('overview');

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
        return <ActivityReports onViewChange={setActiveView} />;
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
