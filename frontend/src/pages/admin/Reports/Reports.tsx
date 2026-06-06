import { useState } from 'react';
import { ViewState } from '../../inventory/Reports/reports/reportUtils';
import Sidebar from '../Shared/Sidebar';
import AdminHeader from '../Shared/AdminHeader';
import ReportsOverview from '../../inventory/Reports/reports/ReportsOverview';
import SalesReports from '../../inventory/Reports/reports/SalesReports';
import InventoryReports from '../../inventory/Reports/reports/InventoryReports';
import SupplierReports from '../../inventory/Reports/reports/SupplierReports';
import ActivityReports from '../../inventory/Reports/reports/ActivityReports';
import PurchaseReports from '../../inventory/Reports/reports/PurchaseReports';
import AlertReports from '../../inventory/Reports/reports/AlertReports';

export default function AdminReports() {
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
        <AdminHeader />

        <main className="flex-1 overflow-y-auto px-6 py-6 bg-[#f8f9fa]">
          <div className="max-w-[1400px] w-full mx-auto space-y-6">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
