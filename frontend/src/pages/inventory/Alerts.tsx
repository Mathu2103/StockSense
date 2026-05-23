import Sidebar from './Sidebar';
import InventoryHeader from './InventoryHeader';

export default function Alerts() {
  return (
    <div className="flex h-screen bg-background text-on-surface font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-background relative">
        {/* Header */}
        <InventoryHeader>
          <h2 className="text-xl font-bold text-on-surface">Alerts</h2>
        </InventoryHeader>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6 flex flex-col relative items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-secondary-container text-primary rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">build</span>
            </div>
            <h1 className="text-3xl font-bold text-on-surface">Alerts</h1>
            <p className="text-on-surface-variant max-w-md mx-auto">
              This page is currently under construction. Please check back later for updates to the Alerts module.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
