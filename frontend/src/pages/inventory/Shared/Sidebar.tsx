import BaseSidebar, { NavLink } from '@/components/shared/BaseSidebar';

export default function Sidebar() {
  const isLinkActive = (path: string, currentPath: string, search: string) => {
    if (path === '/procurement') {
      return currentPath === '/procurement' || currentPath === '/suppliers' || currentPath === '/purchase-records';
    }
    if (path === '/manage-products') {
      return currentPath === '/manage-products' || currentPath === '/categories';
    }
    if (path.includes('?tab=')) {
      const [basePath, searchStr] = path.split('?');
      return currentPath === basePath && search.includes(searchStr);
    }
    return currentPath === path;
  };

  const navLinks: NavLink[] = [
    { name: 'Dashboard', path: '/inventory', icon: 'grid_view' },
    
    // Nested AI Section
    { 
      name: 'AI Intelligence', 
      path: '/inventory-analytics', 
      icon: 'psychology',
      subLinks: [
        { name: 'Overview & Health', path: '/inventory-analytics', icon: 'trending_up' },
        { name: 'AI Demand Forecasting', path: '/ai-demand-forecasting', icon: 'psychology' }
      ]
    },
    
    // Management Section
    { name: 'Management', path: '', icon: '', isHeader: true },
    { name: 'Product Catalog', path: '/manage-products', icon: 'inventory_2' },
    { name: 'Procurement Management', path: '/procurement', icon: 'local_shipping' },
    { name: 'Stock Operations', path: '/inventory-operations', icon: 'sync_alt' },
    { name: 'Alerts', path: '/alerts', icon: 'notifications' },
    { name: 'Reports', path: '/reports', icon: 'bar_chart' },
  ];

  return <BaseSidebar navLinks={navLinks} isLinkActive={isLinkActive} />;
}
