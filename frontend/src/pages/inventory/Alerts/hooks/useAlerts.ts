import { useState, useCallback, useEffect } from 'react';
import { inventoryOperationsService } from '../../StockOperations/operations/inventoryOperationsService';
import { AlertItem, AlertSeverity, Tab, Toast } from '../types/alertTypes';
import { toast as sonnerToast } from 'sonner';

// ── Bulletin Alerts (manual / editorial) ─────────────────────────────────────
const BULLETINS: AlertItem[] = [
  {
    id: 'bulletin_supplier_delay', category: 'Low Stock', severity: 'Warning', issueType: 'Supplier Risk', currentStock: 11, suggestedAction: 'Check Supplier',
    icon: 'local_shipping', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', accentColor: 'bg-amber-600',
    title: 'Supplier delays increasing stock risk',
    description: 'Expected delivery has been delayed. This may push critical items below the reorder threshold within 48 hours.',
    time: 'Today', read: false, dismissed: false,
    primaryAction: 'View Procurement', secondaryAction: 'Dismiss',
    primaryBtnClass: 'bg-[#0b8252] hover:bg-[#096b43]',
  },
  {
    id: 'bulletin_overstock_cheese', category: 'Overstock', severity: 'Info', issueType: 'Overstock', currentStock: 58, suggestedAction: 'Promote / Discount',
    icon: 'trending_down', iconBg: 'bg-blue-50', iconColor: 'text-blue-400', accentColor: 'bg-blue-600',
    title: 'Imported Cheese Board — Overstock Alert',
    description: 'Product is moving slowly with 58 units on hand. Consider a bundle offer or markdown to clear stock before expiry.',
    time: 'Yesterday', read: true, dismissed: false,
    primaryAction: 'Create Promotion', secondaryAction: 'Mark as Read',
    primaryBtnClass: 'bg-[#0b8252] hover:bg-[#096b43]',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getDaysUntilExpiry = (expiryDate: string): number => {
  if (!expiryDate) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatRelativeTime = (days: number): string => {
  if (days < 0) return 'Already expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days <= 7) return `Expires in ${days} days`;
  return `Expires in ${Math.ceil(days / 7)} weeks`;
};

export const useAlerts = () => {
  const [activeTab, setActiveTab] = useState<Tab>('All Alerts');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sevFilter, setSevFilter] = useState<AlertSeverity | 'All'>('All');
  const [readFilter, setReadFilter] = useState<'All' | 'Unread' | 'Read'>('All');

  // ── Toast ──────────────────────────────────────────────────────────────────
  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    if (type === 'success') {
      sonnerToast.success(message);
    } else {
      sonnerToast.info(message);
    }
  }, []);

  // ── Load and construct dynamic alerts ─────────────────────────────────────
  const loadDynamicAlerts = useCallback(async () => {
    const [products, velocity] = await Promise.all([
      inventoryOperationsService.getProducts(),
      inventoryOperationsService.getSalesVelocity(30),
    ]);

    // Read all settings from localStorage (stock rules + alert toggles)
    let reorderPercent = 25;
    let minStockPercent = 10;
    let maxStockPercent = 100;
    let enableLowStockAlerts = true;
    let enableOutOfStockAlerts = true;
    let enableExpiryAlerts = true;
    let enableDeadStockAlerts = false;
    let enableOverstockAlerts = true;
    try {
      const configStr = localStorage.getItem('stocksense_settings_config');
      if (configStr) {
        const config = JSON.parse(configStr);
        if (config.defaultReorderLevel) reorderPercent = parseInt(config.defaultReorderLevel, 10) || 25;
        if (config.minimumStockThreshold) minStockPercent = parseInt(config.minimumStockThreshold, 10) || 10;
        if (config.maximumStockLimit) maxStockPercent = parseInt(config.maximumStockLimit, 10) || 100;
        if (typeof config.enableLowStockAlerts === 'boolean') enableLowStockAlerts = config.enableLowStockAlerts;
        if (typeof config.enableOutOfStockAlerts === 'boolean') enableOutOfStockAlerts = config.enableOutOfStockAlerts;
        if (typeof config.enableExpiryAlerts === 'boolean') enableExpiryAlerts = config.enableExpiryAlerts;
        if (typeof config.enableDeadStockAlerts === 'boolean') enableDeadStockAlerts = config.enableDeadStockAlerts;
        if (typeof config.enableOverstockAlerts === 'boolean') enableOverstockAlerts = config.enableOverstockAlerts;
      }
    } catch { }

    const dynamicAlerts: AlertItem[] = [];

    products.forEach(p => {
      const capacity = p.targetCapacity || 100;
      const reorderLimit = Math.round((reorderPercent / 100) * capacity);
      const criticalLimit = Math.round((minStockPercent / 100) * capacity);
      const overstockLimit = Math.round((maxStockPercent / 100) * capacity);
      const stockPct = Math.round((p.stock / capacity) * 100);

      // ── Overstock (above maximum stock limit %) ────────────────────────────
      if (enableOverstockAlerts && p.stock > overstockLimit && p.status === 'Active') {
        dynamicAlerts.push({
          id: `dyn_over_${p.sku}`,
          category: 'Overstock',
          severity: 'Warning',
          issueType: 'Overstock',
          currentStock: p.stock,
          stockPercentage: stockPct,
          suggestedAction: 'Promote / Discount',
          icon: 'trending_down',
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-400',
          accentColor: 'bg-blue-600',
          title: `${p.name} — Overstock Alert`,
          description: `Stock is at ${p.stock} units (${stockPct}% of ${capacity} unit capacity), exceeding the ${maxStockPercent}% ceiling of ${overstockLimit} units. Excess stock ties up capital and risks warehouse overflow. Consider a bundle offer, markdown, or coordinating a supplier return.`,
          time: 'Real-time alert',
          read: false, dismissed: false,
          primaryAction: 'Create Promotion',
          secondaryAction: 'Dismiss Alert',
          primaryBtnClass: 'bg-blue-600 hover:bg-blue-700',
        });
      }

      // ── Out of Stock ────────────────────────────────────────────────────────
      if (enableOutOfStockAlerts && p.stock === 0) {
        dynamicAlerts.push({
          id: `dyn_out_${p.sku}`,
          category: 'Out of Stock',
          severity: 'Critical',
          issueType: 'Out of Stock',
          currentStock: 0,
          stockPercentage: 0,
          suggestedAction: 'Urgent Reorder',
          icon: 'cancel',
          iconBg: 'bg-red-50',
          iconColor: 'text-red-500',
          accentColor: 'bg-red-600',
          title: `${p.name} — Out of Stock`,
          description: `No stock available for SKU ${p.sku}. This product is actively listed as '${p.status}'. Immediate reorder of at least ${reorderLimit} units is recommended to prevent missed sales.`,
          time: 'Real-time alert',
          read: false, dismissed: false,
          primaryAction: 'Restock Now',
          secondaryAction: 'Dismiss Alert',
          primaryBtnClass: 'bg-red-600 hover:bg-red-700',
        });
      }
      // ── Critical Low Stock (below minimum threshold %) ─────────────────────
      else if (enableLowStockAlerts && p.stock > 0 && p.stock <= criticalLimit) {
        dynamicAlerts.push({
          id: `dyn_critical_${p.sku}`,
          category: 'Low Stock',
          severity: 'Critical',
          issueType: 'Critical Stock Level',
          currentStock: p.stock,
          stockPercentage: stockPct,
          suggestedAction: 'Urgent Reorder',
          icon: 'crisis_alert',
          iconBg: 'bg-red-50',
          iconColor: 'text-red-500',
          accentColor: 'bg-red-600',
          title: `${p.name} — Critical Stock Level`,
          description: `Stock is at ${p.stock} units (${stockPct}% of ${capacity} capacity), below the critical safety margin of ${minStockPercent}%. Risk of stockout is imminent.`,
          time: 'Real-time alert',
          read: false, dismissed: false,
          primaryAction: 'Restock Now',
          secondaryAction: 'Dismiss Alert',
          primaryBtnClass: 'bg-red-600 hover:bg-red-700',
        });
      }
      // ── Low Stock (below reorder threshold %) ──────────────────────────────
      else if (enableLowStockAlerts && p.stock > 0 && p.stock <= reorderLimit) {
        dynamicAlerts.push({
          id: `dyn_low_${p.sku}`,
          category: 'Low Stock',
          severity: 'Warning',
          issueType: 'Low Stock',
          currentStock: p.stock,
          stockPercentage: stockPct,
          suggestedAction: 'Reorder Now',
          icon: 'warning',
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-500',
          accentColor: 'bg-amber-600',
          title: `${p.name} — Low Stock Alert`,
          description: `Inventory is at ${p.stock} units (${stockPct}% of ${capacity} capacity). This is below the ${reorderPercent}% reorder threshold of ${reorderLimit} units. Schedule a replenishment soon.`,
          time: 'Real-time alert',
          read: false, dismissed: false,
          primaryAction: 'Restock Now',
          secondaryAction: 'Dismiss Alert',
          primaryBtnClass: 'bg-[#0b8252] hover:bg-[#096b43]',
        });
      }

      // ── Dead Stock & Slow Moving (Ledger-based velocity analysis) ─────────
      const vel = velocity[p.sku];
      if (enableDeadStockAlerts && vel && p.stock > 0 && p.status === 'Active') {
        if (vel.velocityLabel === 'Never Sold') {
          dynamicAlerts.push({
            id: `dyn_dead_${p.sku}`,
            category: 'Dead Stock',
            severity: 'Warning',
            issueType: 'Never Sold',
            currentStock: p.stock,
            stockPercentage: stockPct,
            suggestedAction: 'Run Promotion / Review',
            icon: 'inventory_2',
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-500',
            accentColor: 'bg-purple-600',
            title: `${p.name} — Never Sold`,
            description: `This product has ${p.stock} units in stock but has never recorded a single sale in the system. It may be a new listing, a duplicate entry, or a truly non-moving item. Consider a targeted promotion or removal from the active catalog.`,
            time: 'Real-time analysis',
            read: false, dismissed: false,
            primaryAction: 'Create Promotion',
            secondaryAction: 'Dismiss Alert',
            primaryBtnClass: 'bg-purple-600 hover:bg-purple-700',
          });
        } else if (vel.velocityLabel === 'Dead Stock') {
          const lastSaleFormatted = vel.lastSaleDate
            ? new Date(vel.lastSaleDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Unknown';
          dynamicAlerts.push({
            id: `dyn_dead_${p.sku}`,
            category: 'Dead Stock',
            severity: 'Warning',
            issueType: 'Dead Stock',
            currentStock: p.stock,
            stockPercentage: stockPct,
            suggestedAction: 'Markdown / Clearance',
            icon: 'block',
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-500',
            accentColor: 'bg-purple-600',
            title: `${p.name} — Dead Stock (${vel.daysSinceLastSale} days no sale)`,
            description: `No sales recorded for ${vel.daysSinceLastSale} days. Last sale was on ${lastSaleFormatted}. Only ${vel.totalUnitsSold} units sold in the past 30 days (avg ${vel.avgUnitsPerDay.toFixed(2)} units/day). ${p.stock} units are currently sitting in inventory — consider a clearance sale or supplier return.`,
            time: `Last sold: ${lastSaleFormatted}`,
            read: false, dismissed: false,
            primaryAction: 'Create Promotion',
            secondaryAction: 'Dismiss Alert',
            primaryBtnClass: 'bg-purple-600 hover:bg-purple-700',
          });
        } else if (vel.velocityLabel === 'Slow Moving') {
          dynamicAlerts.push({
            id: `dyn_slow_${p.sku}`,
            category: 'Dead Stock',
            severity: 'Info',
            issueType: 'Slow Moving',
            currentStock: p.stock,
            stockPercentage: stockPct,
            suggestedAction: 'Boost Visibility',
            icon: 'trending_flat',
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-500',
            accentColor: 'bg-indigo-500',
            title: `${p.name} — Slow Moving Stock`,
            description: `Only ${vel.totalUnitsSold} units sold in the last 30 days (${vel.avgUnitsPerDay.toFixed(2)} units/day avg). At this velocity, the current stock of ${p.stock} units will take ${vel.avgUnitsPerDay > 0 ? Math.ceil(p.stock / vel.avgUnitsPerDay) : '∞'} days to clear. Consider bundling, promotions, or shelf placement improvements.`,
            time: `${vel.totalUnitsSold} units in 30d`,
            read: false, dismissed: false,
            primaryAction: 'Create Promotion',
            secondaryAction: 'Dismiss Alert',
            primaryBtnClass: 'bg-indigo-600 hover:bg-indigo-700',
          });
        }
      }

      // ── Expiry Alerts (from real expiryDate data) ──────────────────────────
      if (enableExpiryAlerts && p.expiryDate) {
        const days = getDaysUntilExpiry(p.expiryDate);
        if (days <= 90) { // Alert if expiring within 90 days
          const isExpired = days < 0;
          const isCritical = days <= 7;
          const isWarning = days <= 30;

          dynamicAlerts.push({
            id: `dyn_exp_${p.sku}`,
            category: 'Expiring Soon',
            severity: isExpired || isCritical ? 'Critical' : isWarning ? 'Warning' : 'Info',
            issueType: isExpired ? 'Expired' : 'Expiring Soon',
            currentStock: p.stock,
            stockPercentage: stockPct,
            suggestedAction: isExpired ? 'Remove from Shelf' : isCritical ? 'Apply Markdown' : 'Monitor Closely',
            icon: isExpired ? 'dangerous' : isCritical ? 'alarm' : 'schedule',
            iconBg: isExpired ? 'bg-red-50' : isCritical ? 'bg-orange-50' : 'bg-amber-50',
            iconColor: isExpired ? 'text-red-500' : isCritical ? 'text-orange-500' : 'text-amber-500',
            accentColor: isExpired ? 'bg-red-600' : isCritical ? 'bg-orange-600' : 'bg-amber-500',
            title: `${p.name} — ${isExpired ? 'Product Expired' : `Expiring in ${days} day${days !== 1 ? 's' : ''}`}`,
            description: isExpired
              ? `This product expired on ${p.expiryDate}. ${p.stock} units remain in inventory and must be removed from the shelf immediately to comply with food safety regulations.`
              : `${p.stock} units of SKU ${p.sku} will expire on ${p.expiryDate} (${formatRelativeTime(days)}). ${isCritical ? 'Apply immediate markdown to clear stock.' : 'Consider promotions or priority sales.'}`,
            time: formatRelativeTime(days),
            read: false, dismissed: false,
            expiryDate: p.expiryDate,
            daysUntilExpiry: days,
            primaryAction: isExpired ? 'Remove from Shelf' : 'Apply Markdown',
            secondaryAction: 'Dismiss Alert',
            primaryBtnClass: isExpired ? 'bg-red-600 hover:bg-red-700' : isCritical ? 'bg-orange-600 hover:bg-orange-700' : 'bg-amber-600 hover:bg-amber-700',
          });
        }
      }
    });

    // ── Restore read/dismiss states from localStorage ──────────────────────
    const savedStatesStr = localStorage.getItem('stocksense_alerts_read_dismiss_states');
    let savedStates: Record<string, { read: boolean, dismissed: boolean }> = {};
    if (savedStatesStr) {
      try { savedStates = JSON.parse(savedStatesStr); } catch { }
    }

    // ── Filter bulletin overstock alerts based on toggle ──────────────────────
    const filteredBulletins = BULLETINS.filter(b => {
      if (b.category === 'Overstock') return enableOverstockAlerts;
      return true;
    });

    const combined = [...dynamicAlerts, ...filteredBulletins].map(item => {
      const saved = savedStates[String(item.id)];
      return saved ? { ...item, read: saved.read, dismissed: saved.dismissed } : item;
    });

    setAlerts(combined);
  }, []);

  useEffect(() => {
    loadDynamicAlerts();
  }, [loadDynamicAlerts]);

  // ── Persist read/dismiss states ────────────────────────────────────────────
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

    if (typeof a.id === 'string' && a.id.startsWith('dyn_')) {
      const parts = a.id.split('_');
      const sku = parts[parts.length - 1];

      try {
        const products = await inventoryOperationsService.getProducts();
        const product = products.find(p => p.sku === sku);
        if (product) {
          await inventoryOperationsService.addLedgerEntry({
            productName: product.name,
            sku: product.sku,
            movementType: 'Adjustment',
            quantityChange: 0,
            beforeStock: product.stock,
            afterStock: product.stock,
            reason: `Action triggered from Alerts: "${a.primaryAction}"`,
            user: 'Inventory Manager',
            status: 'Warning',
          });
          toast(`Action "${a.primaryAction}" logged for "${product.name}".`);
          loadDynamicAlerts();
          return;
        }
      } catch { toast('Failed to process action.', 'info'); }
    }

    if (a.primaryAction === 'Restock Now' || a.primaryAction === 'View Procurement') toast(`Restock request created for "${name}".`);
    else if (a.primaryAction.startsWith('Apply')) toast(`Discount applied to "${name}".`);
    else if (a.primaryAction === 'Remove from Shelf') toast(`Removal logged for "${name}".`, 'info');
    else if (a.primaryAction === 'Create Promotion') toast('Promotion draft created.');
    else toast(a.primaryAction, 'info');
  };

  // ── Derived counts ────────────────────────────────────────────────────────
  const visible = alerts.filter(a => !a.dismissed);
  const unread = visible.filter(a => !a.read).length;
  const criticalAlerts = visible.filter(a => a.severity === 'Critical').length;
  const lowStockAlerts = visible.filter(a => a.category === 'Low Stock' || a.category === 'Out of Stock').length;
  const expiryAlerts = visible.filter(a => a.category === 'Expiring Soon').length;
  const deadStockAlerts = visible.filter(a => a.category === 'Dead Stock').length;
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

  // ── Smart Insights derived from live data ─────────────────────────────────
  const smartInsights: string[] = [];
  const criticals = visible.filter(a => a.severity === 'Critical' && !a.read);
  if (criticals.length > 0) smartInsights.push(`${criticals.length} unread critical alert${criticals.length > 1 ? 's' : ''} require immediate action`);
  const expiringSoon = visible.filter(a => a.category === 'Expiring Soon' && typeof a.daysUntilExpiry === 'number' && a.daysUntilExpiry >= 0 && a.daysUntilExpiry <= 7);
  if (expiringSoon.length > 0) smartInsights.push(`${expiringSoon.length} product${expiringSoon.length > 1 ? 's' : ''} expiring within 7 days — apply markdowns now`);
  const neverSold = visible.filter(a => a.issueType === 'Never Sold');
  const deadItems = visible.filter(a => a.issueType === 'Dead Stock');
  const slowItems = visible.filter(a => a.issueType === 'Slow Moving');
  if (neverSold.length > 0) smartInsights.push(`${neverSold.length} product${neverSold.length > 1 ? 's' : ''} have never been sold — review catalog or run promotions`);
  else if (deadItems.length > 0) smartInsights.push(`${deadItems.length} dead stock product${deadItems.length > 1 ? 's' : ''} with no sales in 30+ days — consider clearance sale`);
  else if (slowItems.length > 0) smartInsights.push(`${slowItems.length} slow-moving product${slowItems.length > 1 ? 's' : ''} detected — boost visibility or create bundle offers`);
  if (smartInsights.length === 0) smartInsights.push('All stock levels are healthy — no urgent actions required');

  return {
    alerts, visible, unread,
    criticalAlerts, lowStockAlerts, expiryAlerts, deadStockAlerts, reorderSuggestions,
    filtered, smartInsights,
    activeTab, setActiveTab,
    showFilters, setShowFilters,
    sevFilter, setSevFilter, readFilter, setReadFilter,
    filtersActive, tabCount,
    dismiss, markRead, markAllRead, handlePrimary,
  };
};
