import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from "./Components/Sidebar";
import InventoryHeader from "./Components/InventoryHeader";

// ── Types ─────────────────────────────────────────────────────────────────────
type AlertCategory = 'Low Stock' | 'Out of Stock' | 'Expiring Soon' | 'Overstock' | 'Reorder Recommendation';
type AlertSeverity = 'Critical' | 'Warning' | 'Info';
type Tab = 'All Alerts' | AlertCategory;

interface AlertItem {
  id: number | string;
  category: AlertCategory;
  severity: AlertSeverity;
  issueType: string;
  currentStock: number;
  suggestedAction: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  accentColor: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  dismissed: boolean;
  primaryAction: string;
  secondaryAction: string;
  primaryBtnClass: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info';
}

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

const TABS: Tab[] = ['All Alerts', 'Low Stock', 'Out of Stock', 'Expiring Soon', 'Overstock', 'Reorder Recommendation'];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Alerts() {
  const [activeTab, setActiveTab]       = useState<Tab>('All Alerts');
  const [alerts, setAlerts]             = useState<AlertItem[]>([]);
  const [toasts, setToasts]             = useState<Toast[]>([]);
  const [showFilters, setShowFilters]   = useState(false);
  const [sevFilter, setSevFilter]       = useState<AlertSeverity | 'All'>('All');
  const [readFilter, setReadFilter]     = useState<'All' | 'Unread' | 'Read'>('All');

  // ── Toast ──────────────────────────────────────────────────────────────────
  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);

  // ── Load and construct dynamic alerts ──────────────────────────────────────
  const loadDynamicAlerts = useCallback(() => {
    const storedProds = localStorage.getItem('stocksense_product_catalog_products');
    let products: any[] = [];
    if (storedProds) {
      try {
        products = JSON.parse(storedProds);
      } catch (e) {
        products = [];
      }
    }

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
      } catch {}
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

  const handlePrimary = (a: AlertItem) => {
    markRead(a.id);
    const name = a.title.split('—')[0].trim();
    
    // Check if it is a dynamic stock alert SKU reorder
    if (typeof a.id === 'string' && a.id.startsWith('dyn_')) {
      const parts = a.id.split('_');
      const sku = parts[parts.length - 1]; // extract SKU
      
      const storedProds = localStorage.getItem('stocksense_product_catalog_products');
      if (storedProds) {
        try {
          const products = JSON.parse(storedProds);
          const idx = products.findIndex((p: any) => p.sku === sku);
          if (idx !== -1) {
            const product = products[idx];
            const before = product.stock;
            const after = before + 100;
            product.stock = after;
            product.lastUpdated = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            localStorage.setItem('stocksense_product_catalog_products', JSON.stringify(products));

            // Add ledger entry
            const storedLedger = localStorage.getItem('stocksense_ledger_records');
            if (storedLedger) {
              const ledger = JSON.parse(storedLedger);
              ledger.push({
                id: `led_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                timestamp: new Date().toISOString(),
                productName: product.name,
                sku: product.sku,
                movementType: 'GRN',
                quantityChange: 100,
                beforeStock: before,
                afterStock: after,
                reason: `Quick Restocked from alerts center`,
                user: 'Inventory Manager',
                status: 'Success'
              });
              localStorage.setItem('stocksense_ledger_records', JSON.stringify(ledger));
            }

            toast(`Restocked successfully! 100 ${product.unitType}s added to "${product.name}".`);
            loadDynamicAlerts(); // reload
            return;
          }
        } catch (e) {}
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

  // Note: secondary actions are not wired to a dedicated button in the UI yet.

  // ── Derived ────────────────────────────────────────────────────────────────
  const visible    = alerts.filter(a => !a.dismissed);
  const unread     = visible.filter(a => !a.read).length;
  const criticalAlerts = visible.filter(a => a.severity === 'Critical').length;
  const lowStockAlerts = visible.filter(a => a.category === 'Low Stock' || a.category === 'Out of Stock').length;
  const expiryAlerts = visible.filter(a => a.category === 'Expiring Soon').length;
  const reorderSuggestions = visible.filter(a => a.category === 'Reorder Recommendation').length;

  const tabCount = (tab: Tab) =>
    tab === 'All Alerts' ? visible.length : visible.filter(a => a.category === tab).length;

  const filtered = visible.filter(a => {
    const byTab  = activeTab === 'All Alerts' || a.category === activeTab;
    const bySev  = sevFilter  === 'All' || a.severity === sevFilter;
    const byRead = readFilter === 'All'
      || (readFilter === 'Unread' && !a.read)
      || (readFilter === 'Read'   &&  a.read);
    return byTab && bySev && byRead;
  });

  const filtersActive = sevFilter !== 'All' || readFilter !== 'All';

  const smartInsights = [
    'Rice 5kg expected to run out in 3 days',
    'Milk Packet requires urgent restock',
    'Supplier delays increasing stock risk',
  ];

  const getSeverityBadgeClass = (severity: AlertSeverity) => {
    if (severity === 'Critical') return 'bg-red-100 text-red-700';
    if (severity === 'Warning') return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getActionButtonClass = (emphasis: boolean) =>
    emphasis
      ? 'bg-[#0b8252] text-white border-[#0b8252] hover:bg-[#096b43]'
      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50';

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* ── STEP 8: Toast Container ── */}
        <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-bold text-white pointer-events-auto ${
                t.type === 'success' ? 'bg-[#0b8252]' : 'bg-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {t.type === 'success' ? 'check_circle' : 'info'}
              </span>
              {t.message}
            </div>
          ))}
        </div>

        {/* ── STEP 6: Filter Panel ── */}
        {showFilters && (
          <div className="fixed inset-0 z-40 flex">
            <div className="flex-1 bg-black/20" onClick={() => setShowFilters(false)} />
            <div className="w-72 bg-white shadow-2xl flex flex-col h-full">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Filter Alerts</h3>
                <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-700">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-5 space-y-6 flex-1 overflow-y-auto">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Severity</p>
                  <div className="space-y-2">
                    {(['All', 'Critical', 'Warning', 'Info'] as const).map(s => (
                      <label key={s} className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="sev" checked={sevFilter === s}
                          onChange={() => setSevFilter(s)}
                          className="w-4 h-4 text-[#0b8252] focus:ring-[#0b8252]" />
                        <span className="text-sm font-medium text-slate-700">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Read Status</p>
                  <div className="space-y-2">
                    {(['All', 'Unread', 'Read'] as const).map(r => (
                      <label key={r} className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="read" checked={readFilter === r}
                          onChange={() => setReadFilter(r)}
                          className="w-4 h-4 text-[#0b8252] focus:ring-[#0b8252]" />
                        <span className="text-sm font-medium text-slate-700">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-slate-200">
                <button
                  onClick={() => { setSevFilter('All'); setReadFilter('All'); }}
                  className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <InventoryHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#f8f9fa]">
          <div className="max-w-[1000px] w-full mx-auto p-6 md:p-8 space-y-6">

            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Alerts &amp; Notifications</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Manage inventory levels, expiry dates, and unusual sales patterns.
                  {unread > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      {unread} unread
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">

                {/* STEP 6: Filters button */}
                <button
                  onClick={() => setShowFilters(true)}
                  className={`flex items-center gap-2 px-4 py-2.5 border font-bold text-sm rounded-lg shadow-sm transition-colors ${
                    filtersActive
                      ? 'bg-[#eef8f2] border-[#0b8252] text-[#0b8252]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  Filters
                  {filtersActive && <span className="w-2 h-2 bg-[#0b8252] rounded-full" />}
                </button>

                {/* STEP 5: Mark All Read */}
                <button
                  onClick={markAllRead}
                  disabled={unread === 0}
                  className="flex items-center gap-2 bg-[#0b8252] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">done_all</span>
                  Mark All Read
                </button>
              </div>
            </div>

            {/* Alert KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Alerts</p>
                <h3 className="text-2xl font-bold text-slate-800">{visible.length}</h3>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Critical Alerts</p>
                <h3 className="text-2xl font-bold text-red-600">{criticalAlerts}</h3>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Low Stock Alerts</p>
                <h3 className="text-2xl font-bold text-amber-600">{lowStockAlerts}</h3>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry Alerts</p>
                <h3 className="text-2xl font-bold text-orange-600">{expiryAlerts}</h3>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reorder Suggestions</p>
                <h3 className="text-2xl font-bold text-[#0b8252]">{reorderSuggestions}</h3>
              </div>
            </div>

            {/* Smart Insights Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#0b8252]">auto_awesome</span>
                <h3 className="font-bold text-slate-800">Smart Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {smartInsights.map((insight) => (
                  <div key={insight} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    {insight}
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 1: Tabs with live count badges */}
            <div className="flex space-x-6 border-b border-slate-200 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 text-sm font-bold border-b-2 transition-colors duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === tab
                      ? 'border-[#0b8252] text-[#0b8252]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {tab}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab ? 'bg-[#eef8f2] text-[#0b8252]' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tabCount(tab)}
                  </span>
                </button>
              ))}
            </div>

            {/* STEP 7: Empty State / STEP 3+4: Alert Cards */}
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                  <span className="material-symbols-outlined text-slate-300 text-[48px]">notifications_off</span>
                  <p className="text-slate-500 font-medium mt-3">No alerts match your current filters.</p>
                  <button
                    onClick={() => { setSevFilter('All'); setReadFilter('All'); setActiveTab('All Alerts'); }}
                    className="mt-4 text-sm font-bold text-[#0b8252] hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filtered.map(alert => (
                  <div
                    key={alert.id}
                    className={`bg-white rounded-xl border border-slate-200 shadow-sm flex overflow-hidden transition-opacity ${
                      alert.read ? 'opacity-75' : ''
                    }`}
                  >
                    <div className={`w-1.5 flex-shrink-0 ${alert.accentColor}`} />
                    <div className="p-5 flex flex-col sm:flex-row gap-5 flex-1">

                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-lg ${alert.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`material-symbols-outlined ${alert.iconColor} text-[32px]`}>{alert.icon}</span>
                      </div>

                      {/* Body */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${getSeverityBadgeClass(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-slate-100 text-slate-600">
                            {alert.issueType}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{alert.time}</span>
                          {!alert.read && (
                            <span className="w-2 h-2 bg-[#0b8252] rounded-full" title="Unread" />
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-800 mb-1">{alert.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{alert.description}</p>

                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-600">
                          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                            <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Current Stock</span>
                            <span className="font-bold text-slate-800">{alert.currentStock}</span>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                            <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Suggested Action</span>
                            <span className="font-bold text-slate-800">{alert.suggestedAction}</span>
                          </div>
                        </div>
                      </div>

                      {/* Required Actions */}
                      <div className="grid grid-cols-2 gap-2 mt-4 sm:mt-0 min-w-[220px] sm:min-w-[240px] self-start sm:self-center">
                        <Link
                          to="/manage-products?tab=products"
                          className={`flex items-center justify-center px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${getActionButtonClass(false)}`}
                        >
                          View Product
                        </Link>
                        <button
                          onClick={() => handlePrimary(alert)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${getActionButtonClass(true)}`}
                        >
                          {alert.primaryAction}
                        </button>
                        <button
                          onClick={() => dismiss(alert.id)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${getActionButtonClass(false)}`}
                        >
                          Dismiss Alert
                        </button>
                        <button
                          onClick={() => markRead(alert.id)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${getActionButtonClass(false)}`}
                        >
                          Mark as Read
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
