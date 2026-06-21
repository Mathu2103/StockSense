import { useState, useCallback, useEffect } from 'react';
import { AlertItem, AlertSeverity, AlertCategory, Tab } from '../types/alertTypes';
import { NotificationService, NotificationItem } from '../../../../services/notificationService';
import { useNavigate } from 'react-router-dom';
import { toast as sonnerToast } from 'sonner';

const mapCategory = (type: string): AlertCategory => {
  switch (type) {
    case 'LOW_STOCK':
      return 'Low Stock';
    case 'OUT_OF_STOCK':
      return 'Out of Stock';
    case 'OVERSTOCK':
      return 'Overstock';
    case 'EXPIRING_SOON':
    case 'EXPIRED':
      return 'Expiring Soon';
    case 'DEMAND_FORECAST':
      return 'Reorder Recommendation';
    case 'STOCK_VELOCITY':
      return 'Dead Stock';
    case 'COMBO_SUGGESTION':
      return 'Reorder Recommendation';
    case 'DISCOUNT_APPROVAL':
    case 'DISCOUNT_RESPONSE':
      return 'Discount';
    default:
      return 'Low Stock';
  }
};

const mapSeverity = (sev: string): AlertSeverity => {
  switch (sev) {
    case 'CRITICAL':
      return 'Critical';
    case 'WARNING':
      return 'Warning';
    default:
      return 'Info';
  }
};

const getCategoryStyles = (category: AlertCategory, severity: AlertSeverity) => {
  switch (category) {
    case 'Out of Stock':
      return {
        icon: 'cancel',
        iconBg: 'bg-red-50',
        iconColor: 'text-red-500',
        accentColor: 'bg-red-600',
        primaryBtnClass: 'bg-red-600 hover:bg-red-700',
      };
    case 'Low Stock':
      return {
        icon: severity === 'Critical' ? 'crisis_alert' : 'warning',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-500',
        accentColor: severity === 'Critical' ? 'bg-red-600' : 'bg-amber-600',
        primaryBtnClass: severity === 'Critical' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0b8252] hover:bg-[#096b43]',
      };
    case 'Expiring Soon':
      return {
        icon: severity === 'Critical' ? 'dangerous' : 'schedule',
        iconBg: severity === 'Critical' ? 'bg-red-50' : 'bg-amber-50',
        iconColor: severity === 'Critical' ? 'text-red-500' : 'text-amber-500',
        accentColor: severity === 'Critical' ? 'bg-red-600' : 'bg-amber-500',
        primaryBtnClass: severity === 'Critical' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700',
      };
    case 'Dead Stock':
      return {
        icon: 'inventory_2',
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-500',
        accentColor: 'bg-purple-600',
        primaryBtnClass: 'bg-purple-600 hover:bg-purple-700',
      };
    case 'Overstock':
      return {
        icon: 'trending_down',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-400',
        accentColor: 'bg-blue-600',
        primaryBtnClass: 'bg-blue-600 hover:bg-blue-700',
      };
    case 'Discount':
      return {
        icon: 'local_offer',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-500',
        accentColor: 'bg-teal-600',
        primaryBtnClass: 'bg-teal-600 hover:bg-teal-700',
      };
    case 'Reorder Recommendation':
    default:
      return {
        icon: 'recommend',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-500',
        accentColor: 'bg-emerald-600',
        primaryBtnClass: 'bg-emerald-600 hover:bg-emerald-700',
      };
  }
};

export const useAlerts = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('All Alerts');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sevFilter, setSevFilter] = useState<AlertSeverity | 'All'>('All');
  const [readFilter, setReadFilter] = useState<'All' | 'Unread' | 'Read'>('All');

  // Popup Modal for showing details of selected alert
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [rawNotifications, setRawNotifications] = useState<NotificationItem[]>([]);

  // ── Load and construct dynamic alerts ─────────────────────────────────────
  const loadDynamicAlerts = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch user notifications from backend (including dismissed ones so they are on alerts page)
      const res = await NotificationService.getNotifications(true);
      if (res.success) {
        const dbItems: NotificationItem[] = res.data;
        setRawNotifications(dbItems);

        // Map to AlertItem frontend model
        const mapped: AlertItem[] = dbItems.map((n) => {
          const category = mapCategory(n.type);
          const severity = mapSeverity(n.severity);
          const styles = getCategoryStyles(category, severity);

          return {
            id: n.id,
            category,
            severity,
            issueType: n.type,
            currentStock: n.product?.currentStock ?? 0,
            suggestedAction: n.suggestedAction ?? 'Acknowledge',
            icon: styles.icon,
            iconBg: styles.iconBg,
            iconColor: styles.iconColor,
            accentColor: styles.accentColor,
            title: n.title,
            description: n.message,
            time: new Date(n.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            }),
            read: false, // In backend response, active ones are returned. Read ones are filtered out by server.
            dismissed: false, // We fetch them regardless, they are visible on alerts page.
            primaryAction: (n.type === 'EXPIRING_SOON' || n.type === 'OVERSTOCK')
              ? 'Remove Shelf'
              : (n.type === 'STOCK_VELOCITY')
                ? 'Create Promotion'
                : (n.suggestedAction ?? 'Acknowledge'),
            secondaryAction: 'Dismiss',
            primaryBtnClass: styles.primaryBtnClass,
            sku: n.sku || n.product?.sku,
          };
        });

        setAlerts(mapped);
      }
    } catch (err) {
      console.error('Failed to load notifications in Alerts page:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDynamicAlerts();
  }, [loadDynamicAlerts]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const dismiss = async (id: number | string) => {
    try {
      await NotificationService.dismiss(String(id));
      sonnerToast.info('Alert dismissed from Top Bar dropdown.');
      loadDynamicAlerts();
    } catch {
      sonnerToast.error('Failed to dismiss alert.');
    }
  };

  const markRead = async (id: number | string) => {
    try {
      await NotificationService.markRead(String(id));
      sonnerToast.success('Alert marked as read.');
      loadDynamicAlerts();
    } catch {
      sonnerToast.error('Failed to mark read.');
    }
  };

  const markAllRead = async () => {
    try {
      // Mark all read in backend
      await Promise.all(alerts.map((a) => NotificationService.markRead(String(a.id))));
      sonnerToast.success('All alerts marked as read.');
      loadDynamicAlerts();
    } catch {
      sonnerToast.error('Failed to mark all alerts as read.');
    }
  };

  const handlePrimary = async (a: AlertItem) => {
    // Locate the raw notification object
    const raw = rawNotifications.find(n => n.id === a.id);
    if (raw) {
      // Set to selected so the details popup opens
      setSelectedNotification(raw);
    } else {
      // Fallback redirect
      if (a.category === 'Low Stock' || a.category === 'Out of Stock') {
        navigate('/inventory-operations?tab=grn');
      } else {
        markRead(a.id);
      }
    }
  };

  // ── Derived counts ────────────────────────────────────────────────────────
  const visible = alerts; // On Alerts page, we show everything fetched (excluding read)
  const unread = alerts.length; // Active count
  const criticalAlerts = visible.filter((a) => a.severity === 'Critical').length;
  const lowStockAlerts = visible.filter((a) => a.category === 'Low Stock').length;
  const outOfStockAlerts = visible.filter((a) => a.category === 'Out of Stock').length;
  const expiryAlerts = visible.filter((a) => a.category === 'Expiring Soon').length;
  const deadStockAlerts = visible.filter((a) => a.category === 'Dead Stock').length;
  const overstockAlerts = visible.filter((a) => a.category === 'Overstock').length;
  const reorderSuggestions = visible.filter((a) => a.category === 'Reorder Recommendation').length;
  const discountAlerts = visible.filter((a) => a.category === 'Discount').length;

  const tabCount = (tab: Tab) =>
    tab === 'All Alerts' ? visible.length : visible.filter((a) => a.category === tab).length;

  const filtered = visible.filter((a) => {
    const byTab = activeTab === 'All Alerts' || a.category === activeTab;
    const bySev = sevFilter === 'All' || a.severity === sevFilter;
    return byTab && bySev;
  });

  const filtersActive = sevFilter !== 'All';

  // ── Smart Insights derived from live data ─────────────────────────────────
  const smartInsights: string[] = [];
  const criticals = visible.filter((a) => a.severity === 'Critical');
  if (criticals.length > 0)
    smartInsights.push(`${criticals.length} critical alert${criticals.length > 1 ? 's' : ''} require immediate action`);
  const lowStockItems = visible.filter((a) => a.category === 'Low Stock');
  if (lowStockItems.length > 0)
    smartInsights.push(`${lowStockItems.length} low-stock items below safety limit — schedule replenishments`);
  const neverSold = visible.filter((a) => a.issueType === 'STOCK_VELOCITY');
  if (neverSold.length > 0)
    smartInsights.push(`Slow/Dead stock detected — review inventory catalogs or create bundle discount promotions`);
  if (smartInsights.length === 0)
    smartInsights.push('All stock levels are healthy — no urgent actions required');

  return {
    alerts,
    visible,
    unread,
    criticalAlerts,
    lowStockAlerts,
    outOfStockAlerts,
    expiryAlerts,
    deadStockAlerts,
    overstockAlerts,
    reorderSuggestions,
    discountAlerts,
    filtered,
    smartInsights,
    activeTab,
    setActiveTab,
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
    handlePrimary,
    loading,
    selectedNotification,
    setSelectedNotification,
    loadDynamicAlerts,
  };
};
