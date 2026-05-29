import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const currentPath = location.pathname;

  // Active state utility
  const isLinkActive = (path: string) => {
    if (path === '/procurement') {
      return currentPath === '/procurement' || currentPath === '/suppliers' || currentPath === '/purchase-records';
    }
    if (path === '/manage-products') {
      return currentPath === '/manage-products' || currentPath === '/categories';
    }
    return currentPath === path;
  };

  const navLinks = [
    { name: 'Dashboard', path: '/inventory', icon: 'grid_view' },
    { name: 'Inventory Analytics', path: '/inventory-analytics', icon: 'trending_up' },
    { name: 'Product Catalog', path: '/manage-products', icon: 'inventory_2' },
    { name: 'Inventory Adjustments', path: '/inventory-adjustments', icon: 'sync_alt' },
    { name: 'Procurement Management', path: '/procurement', icon: 'local_shipping' },
    { name: 'Stock Movements', path: '/stock-movements', icon: 'monitoring' },
    { name: 'Alerts', path: '/alerts', icon: 'notifications' },
    { name: 'Reports', path: '/reports', icon: 'bar_chart' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  return (
    <aside className="w-64 bg-background border-r border-outline-variant flex flex-col shrink-0">
      
      {/* Brand Header */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary leading-tight tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px]">inventory</span>
          StockSense
        </h1>
        <p className="text-xs text-outline font-medium mt-1">Supermarket Management</p>
      </div>

      {/* Sidebar Links Scrollable Container */}
      <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
        <nav className="space-y-1.5 px-3">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.path);
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

      {/* Sidebar Footer Logout */}
      <div className="p-4 border-t border-outline-variant">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-on-surface-variant font-medium hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
        >
          <span className="material-symbols-outlined text-outline-variant group-hover:text-red-500">logout</span>
          Logout
        </button>
      </div>

    </aside>
  );
}
