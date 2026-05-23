import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/inventory', icon: 'grid_view' },
    { name: 'Products', path: '/manage-products', icon: 'inventory_2' },
    { name: 'Categories', path: '/categories', icon: 'category' },
    { name: 'Inventory Adjustments', path: '/inventory-adjustments', icon: 'sync_alt' },
    { name: 'Suppliers', path: '/suppliers', icon: 'local_shipping' },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: 'receipt_long' },
    { name: 'Purchase Receives', path: '/purchase-receives', icon: 'inventory' },
    { name: 'Stock Movements', path: '/stock-movements', icon: 'monitoring' },
    { name: 'Alerts', path: '/alerts', icon: 'notifications' },
    { name: 'Reports', path: '/reports', icon: 'bar_chart' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  return (
    <aside className="w-64 bg-background border-r border-outline-variant flex flex-col shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary leading-tight tracking-tight">StockSense</h1>
        <p className="text-xs text-outline font-medium mt-1">Supermarket Management</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
        <nav className="space-y-1 px-3">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className={`material-symbols-outlined ${isActive ? 'text-primary' : 'text-outline-variant'}`}>
                  {link.icon}
                </span>
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-outline-variant">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-on-surface-variant font-medium hover:bg-surface-container rounded-lg transition-colors">
          <span className="material-symbols-outlined text-outline-variant">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
