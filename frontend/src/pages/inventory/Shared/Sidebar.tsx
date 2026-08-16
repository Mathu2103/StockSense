import BaseSidebar, { NavLink } from '@/components/shared/BaseSidebar';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const isLinkActive = (path: string, currentPath: string, search: string) => {
    if (path.includes('?tab=')) {
      const [basePath, searchStr] = path.split('?');
      if (currentPath !== basePath) return false;
      const currentTab = new URLSearchParams(search).get('tab');
      const targetTab = new URLSearchParams(searchStr).get('tab');
      if (!currentTab && targetTab === 'products' && basePath === '/manage-products') return true;
      if (!currentTab && targetTab === 'grn' && basePath === '/inventory-operations') return true;
      return currentTab === targetTab;
    }
    if (path === '/procurement') {
      return currentPath === '/procurement' || currentPath === '/suppliers' || currentPath === '/purchase-records';
    }
    if (path === '/manage-products') {
      return currentPath === '/manage-products' || currentPath === '/categories';
    }
    if (path === '/inventory-operations') {
      return currentPath === '/inventory-operations' || currentPath === '/inventory-adjustments' || currentPath === '/stock-movements';
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
        { name: 'AI Demand Forecasting', path: '/ai-demand-forecasting', icon: 'psychology' },
        { name: 'AI Combo Suggester', path: '/inventory-combo', icon: 'auto_awesome' },
        ...(isAdmin ? [{ name: 'Combo Approvals', path: '/admin/combo-approvals', icon: 'verified' }] : [])
      ]
    },
    
    // Management Section
    { name: 'Management', path: '', icon: '', isHeader: true },
    { 
      name: 'Product Catalog', 
      path: '/manage-products', 
      icon: 'inventory_2',
      subLinks: [
        { name: 'Products Registry', path: '/manage-products?tab=products', icon: 'inventory' },
        { name: 'Category Registry', path: '/manage-products?tab=categories', icon: 'category' },
        { name: 'Brands', path: '/manage-products?tab=brands', icon: 'branding_watermark' },
        { name: 'Discounts', path: '/manage-products?tab=discounts', icon: 'local_offer' },
      ]
    },
    { name: 'Procurement Management', path: '/procurement', icon: 'local_shipping' },
    { 
      name: 'Stock Operations', 
      path: '/inventory-operations', 
      icon: 'sync_alt',
      subLinks: [
        { name: 'Goods Receiving (GRN)', path: '/inventory-operations?tab=grn', icon: 'local_shipping' },
        { name: 'Stock Adjustments', path: '/inventory-operations?tab=adjustments', icon: 'tune' },
      ]
    },
    { name: 'Alerts', path: '/alerts', icon: 'notifications' },
    { name: 'Reports', path: '/reports', icon: 'bar_chart' },
  ];

  return <BaseSidebar navLinks={navLinks} isLinkActive={isLinkActive} />;
}
