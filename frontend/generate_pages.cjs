const fs = require('fs');
const path = require('path');

const pages = [
  { name: 'InventoryAdjustments', title: 'Inventory Adjustments' },
  { name: 'Suppliers', title: 'Suppliers' },
  { name: 'PurchaseOrders', title: 'Purchase Orders' },
  { name: 'PurchaseReceives', title: 'Purchase Receives' },
  { name: 'StockMovements', title: 'Stock Movements' },
  { name: 'Alerts', title: 'Alerts' },
  { name: 'Reports', title: 'Reports' },
  { name: 'Settings', title: 'Settings' }
];

const template = (name, title) => `import Sidebar from './Sidebar';

export default function ${name}() {
  return (
    <div className="flex h-screen bg-background text-on-surface font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-background relative">
        {/* Header */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-8 shrink-0">
          <h2 className="text-xl font-bold text-on-surface">${title}</h2>
          
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
            <h1 className="text-3xl font-bold text-on-surface">${title}</h1>
            <p className="text-on-surface-variant max-w-md mx-auto">
              This page is currently under construction. Please check back later for updates to the ${title} module.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
`;

pages.forEach(p => {
  const filePath = path.join('src/pages/inventory', p.name + '.tsx');
  fs.writeFileSync(filePath, template(p.name, p.title), 'utf8');
  console.log('Created ' + filePath);
});
