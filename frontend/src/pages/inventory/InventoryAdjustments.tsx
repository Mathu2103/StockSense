import Sidebar from './Sidebar';

export default function InventoryAdjustments() {
  return (
    <div className="flex h-screen bg-background text-on-surface font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-background relative">
        {/* Header */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-8 shrink-0">
          <h2 className="text-xl font-bold text-on-surface">Inventory Adjustments</h2>
          
          <div className="flex items-center gap-5">
            <button className="text-outline hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" alt="User" className="w-8 h-8 rounded-full border border-outline-variant cursor-pointer" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6 flex flex-col relative items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-secondary-container text-primary rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">build</span>
            </div>
            <h1 className="text-3xl font-bold text-on-surface">Inventory Adjustments</h1>
            <p className="text-on-surface-variant max-w-md mx-auto">
              This page is currently under construction. Please check back later for updates to the Inventory Adjustments module.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
