import { useState, useCallback, useEffect } from 'react';
import { inventoryOperationsService } from '../../StockOperations/operations/inventoryOperationsService';
import { AlertItem, AlertSeverity, Tab, Toast } from '../types/alertTypes';

// ── Seed Bulletins Data ───────────────────────────────────────────────────────
const BULLETINS: AlertItem[] = [
  {
    id: 'bulletin_expiry_beef', category: 'Expiring Soon', severity: 'Warning', issueType: 'Expiring Soon', currentStock: 15, suggestedAction: 'Apply Markdown',
    icon: 'set_meal', iconBg: 'bg-amber-50', iconColor: 'text-amber-500', accentColor: 'bg-amber-600',
    title: 'Angus Beef Patties (4pk) — Expiring Soon',
    description: 'Batch #4492 expires in 48 hours. 15 units remaining in stock. Consider immediate markdown.',
    time: '45 mins ago', read: false, dismissed: false,
    primaryAction: 'Apply 25% Discount', secondaryAction: 'Dismiss',
    primaryBtnClass: 'bg-amber-700 hover:bg-amber-800',
  },
  {
    id: 'bulletin_overstock_cheese', category: 'Overstock', severity: 'Info', issueType: 'Overstock', currentStock: 58, suggestedAction: 'Promote / Discount',
    icon: 'trending_down', iconBg: 'bg-blue-50', iconColor: 'text-blue-400', accentColor: 'bg-blue-600',
    title: 'Imported Cheese Board — Overstock Alert',
    description: 'Product is moving slowly with 58 units on hand. Consider a bundle offer or markdown to clear stock.',
    time: 'Yesterday', read: true, dismissed: false,
    primaryAction: 'View Product', secondaryAction: 'Mark as Read',
    primaryBtnClass: 'bg-[#0b8252] hover:bg-[#096b43]',
  },
  {
    id: 'bulletin_supplier_delay', category: 'Low Stock', severity: 'Warning', issueType: 'Low Stock', currentStock: 11, suggestedAction: 'Check Supplier Delay',
    icon: 'local_shipping', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', accentColor: 'bg-amber-600',
    title: 'Supplier delays increasing stock risk',
    description: 'Expected delivery has been delayed, which may push this item below reorder threshold within 48 hours.',
    time: 'Today', read: false, dismissed: false,
    primaryAction: 'View Product', secondaryAction: 'Mark as Read',
    primaryBtnClass: 'bg-[#0b8252] hover:bg-[#096b43]',
  },
];

export const useAlerts = () => {
  const [activeTab, setActiveTab] = useState<Tab>('All Alerts');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sevFilter, setSevFilter] = useState<AlertSeverity | 'All'>('All');
  const [readFilter, setReadFilter] = useState<'All' | 'Unread' | 'Read'>('All');

  // ── Toast ──────────────────────────────────────────────────────────────────
  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);

  // ── Load and construct dynamic alerts ──────────────────────────────────────
  const loadDynamicAlerts = useCallback(async () => {
    const products = await inventoryOperationsService.getProducts();

    const dynamicAlerts: AlertItem[] = [];
    products.forEach(p => {
      if (p.stock === 0) {
        dynamicAlerts.push({
          id: `dyn_out_${p.sku}`,
          category: 'Out of Stock',
          severity: 'Critical',
          issueType: 'Out of Stock',
          currentStock: 0,
          suggestedAction: 'Urgent Reorder',
          icon: 'cancel',
          iconBg: 'bg-red-50',
          iconColor: 'text-red-500',
          accentColor: 'bg-red-600',
          title: `${p.name} — Out of Stock`,
          description: `No stock is available. Immediate reorder of ${p.reorderLevel * 3} units is recommended to prevent missed sales.`,
          time: 'Real-time alert',
          read: false,
          dismissed: false,
          primaryAction: 'Restock Now',
          secondaryAction: 'Dismiss Alert',
          primaryBtnClass: 'bg-red-600 hover:bg-red-700',
        });
      } else if (p.stock <= p.reorderLevel) {
        dynamicAlerts.push({
          id: `dyn_low_${p.sku}`,
          category: 'Low Stock',
          severity: 'Warning',
          issueType: 'Low Stock',
          currentStock: p.stock,
          suggestedAction: 'Reorder Now',
          icon: 'warning',
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-500',
          accentColor: 'bg-amber-600',
          title: `${p.name} — Low Stock Alert`,
          description: `Inventory level is currently at ${p.stock} units, below the safety threshold of ${p.reorderLevel}.`,
          time: 'Real-time alert',
          read: false,
          dismissed: false,
          primaryAction: 'Restock Now',
          secondaryAction: 'Dismiss Alert',
          primaryBtnClass: 'bg-[#0b8252] hover:bg-[#096b43]',
        });
      }
    });

    const savedStatesStr = localStorage.getItem('stocksense_alerts_read_dismiss_states');
    let savedStates: Record<string, { read: boolean, dismissed: boolean }> = {};
    if (savedStatesStr) {
      try {
        savedStates = JSON.parse(savedStatesStr);
      } catch { }
    }

    const combined = [...dynamicAlerts, ...BULLETINS].map(item => {
      const saved = savedStates[String(item.id)];
      if (saved) {
        return { ...item, read: saved.read, dismissed: saved.dismissed };
      }
      return item;
    });

    setAlerts(combined);
  }, []);

  useEffect(() => {
    loadDynamicAlerts();
  }, [loadDynamicAlerts]);

  // Persist read/dismiss changes
  const saveAlertStates = useCallback((updatedAlerts: AlertItem[]) => {
    const states: Record<string, { read: boolean, dismissed: boolean }> = {};
    updatedAlerts.forEach(a => {
      states[String(a.id)] = { read: a.read, dismissed: a.dismissed };
    });
    localStorage.setItem('stocksense_alerts_read_dismiss_states', JSON.stringify(states));
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────
  const dismiss = (id: number | string) => {
    setAlerts(p => {
      const next = p.map(a => a.id === id ? { ...a, dismissed: true } : a);
      saveAlertStates(next);
      return next;
    });
    toast('Alert dismissed.', 'info');
  };

  const markRead = (id: number | string) => {
    setAlerts(p => {
      const next = p.map(a => a.id === id ? { ...a, read: true } : a);
      saveAlertStates(next);
      return next;
    });
  };

  const markAllRead = () => {
    setAlerts(p => {
      const next = p.map(a => ({ ...a, read: true }));
      saveAlertStates(next);
      return next;
    });
    toast('All alerts marked as read.');
  };

  const handlePrimary = async (a: AlertItem) => {
    markRead(a.id);
    const name = a.title.split('—')[0].trim();

    // Check if it is a dynamic stock alert SKU reorder
    if (typeof a.id === 'string' && a.id.startsWith('dyn_')) {
      const parts = a.id.split('_');
      const sku = parts[parts.length - 1]; // extract SKU

      try {
        const products = await inventoryOperationsService.getProducts();
        const product = products.find(p => p.sku === sku);

        if (product) {
          // Instead of modifying stock directly, create a restock request (ledger entry)
          await inventoryOperationsService.addLedgerEntry({
            productName: product.name,
            sku: product.sku,
            movementType: 'Adjustment', // Use a neutral type since no actual qty changed, or keep it tracked by reason
            quantityChange: 0,
            beforeStock: product.stock,
            afterStock: product.stock,
            reason: `Restock request submitted from Alerts Module`,
            user: 'Inventory Manager',
            status: 'Warning' // Use Warning to indicate pending/needs action if needed, or Success. Let's use Success for request placement.
          });

          toast(`Restock request submitted successfully for "${product.name}".`);
          loadDynamicAlerts(); // reload
          return;
        }
      } catch (e) {
        toast('Failed to submit restock request.', 'info');
      }
    }

    if (a.primaryAction === 'Restock Now' || a.primaryAction === 'Quick Order' || a.primaryAction === 'Reorder Now')
      toast(`Restock order created for "${name}".`);
    else if (a.primaryAction.startsWith('Apply'))
      toast(`Discount applied to "${name}".`);
    else if (a.primaryAction === 'View Product')
      toast(`Opening product details for "${name}".`, 'info');
    else if (a.primaryAction === 'Create Promotion')
      toast('Promotion draft created.');
    else
      toast(a.primaryAction, 'info');
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const visible = alerts.filter(a => !a.dismissed);
  const unread = visible.filter(a => !a.read).length;
  const criticalAlerts = visible.filter(a => a.severity === 'Critical').length;
  const lowStockAlerts = visible.filter(a => a.category === 'Low Stock' || a.category === 'Out of Stock').length;
  const expiryAlerts = visible.filter(a => a.category === 'Expiring Soon').length;
  const reorderSuggestions = visible.filter(a => a.category === 'Reorder Recommendation').length;

  const tabCount = (tab: Tab) =>
    tab === 'All Alerts' ? visible.length : visible.filter(a => a.category === tab).length;

  const filtered = visible.filter(a => {
    const byTab = activeTab === 'All Alerts' || a.category === activeTab;
    const bySev = sevFilter === 'All' || a.severity === sevFilter;
    const byRead = readFilter === 'All'
      || (readFilter === 'Unread' && !a.read)
      || (readFilter === 'Read' && a.read);
    return byTab && bySev && byRead;
  });

  const filtersActive = sevFilter !== 'All' || readFilter !== 'All';

  return {
    alerts,
    visible,
    unread,
    criticalAlerts,
    lowStockAlerts,
    expiryAlerts,
    reorderSuggestions,
    filtered,
    activeTab,
    setActiveTab,
    toasts,
    showFilters,
    setShowFilters,
    sevFilter,
    setSevFilter,
    readFilter,
    setReadFilter,
    filtersActive,
    tabCount,
    dismiss,
    markRead,
    markAllRead,
    handlePrimary
  };
};
