import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import InventoryHeader from './Components/InventoryHeader';
import ModuleCard from './Components/inventory/ModuleCard';
import SnapshotCard from './Components/inventory/SnapshotCard';
import QuickActionItem from './Components/inventory/QuickActionItem';
import RecentActivityItem from './Components/inventory/RecentActivityItem';
import {
  inventoryOperationsService,
  ProductItem,
  LedgerEntry,
  GRNRecord,
} from './Components/operations/inventoryOperationsService';

const moduleCards = [
  {
    title: 'Product Management',
    description: 'Manage catalog, categories, brands, variants, and supplier mappings.',
    icon: 'inventory_2',
    to: '/manage-products?tab=products',
    accent: 'from-emerald-50 to-emerald-100/60',
    iconColor: 'text-emerald-700',
  },
  {
    title: 'Procurement',
    description: 'Work with GRNs, suppliers, and purchase records without leaving the module.',
    icon: 'local_shipping',
    to: '/procurement',
    accent: 'from-indigo-50 to-indigo-100/60',
    iconColor: 'text-indigo-700',
  },
  {
    title: 'Stock Operations',
    description: 'Handle stock movements and adjustments from a single operational view.',
    icon: 'swap_horiz',
    to: '/inventory-operations?tab=movements',
    accent: 'from-sky-50 to-sky-100/60',
    iconColor: 'text-sky-700',
  },
  {
    title: 'Inventory Analytics',
    description: 'Review the highest-value inventory insights and stock behavior trends.',
    icon: 'trending_up',
    to: '/inventory-analytics',
    accent: 'from-amber-50 to-amber-100/60',
    iconColor: 'text-amber-700',
  },
  {
    title: 'Alerts & Monitoring',
    description: 'Track low stock, out-of-stock items, and exception-driven monitoring.',
    icon: 'notifications_active',
    to: '/alerts',
    accent: 'from-rose-50 to-rose-100/60',
    iconColor: 'text-rose-700',
  },
  {
    title: 'Reports Center',
    description: 'Open operational reports for purchase, inventory, supplier, and activity views.',
    icon: 'summarize',
    to: '/reports',
    accent: 'from-violet-50 to-violet-100/60',
    iconColor: 'text-violet-700',
  },
  {
    title: 'Settings',
    description: 'Adjust rules, account preferences, and inventory configuration in one place.',
    icon: 'settings',
    to: '/settings',
    accent: 'from-slate-50 to-slate-100/80',
    iconColor: 'text-slate-700',
  },
];

const quickActions = [
  { label: 'Add Product', icon: 'add_box', to: '/manage-products?tab=new-product' },
  { label: 'Create GRN', icon: 'assignment_add', to: '/procurement?tab=records&action=record-purchase' },
  { label: 'Stock Adjustment', icon: 'sync_alt', to: '/inventory-operations?tab=adjustments' },
  { label: 'View Alerts', icon: 'notification_important', to: '/alerts' },
];

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}



export default function InventoryPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [grns, setGrns] = useState<GRNRecord[]>([]);
  const [recentLedger, setRecentLedger] = useState<LedgerEntry[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('Syncing...');
  const [marqueePaused, setMarqueePaused] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      try {
        const [loadedProducts, loadedLedger, loadedGrns] = await Promise.all([
          inventoryOperationsService.getProducts(),
          inventoryOperationsService.getLedger(),
          inventoryOperationsService.getGRNHistory(),
        ]);

        if (!active) return;

        setProducts(loadedProducts);
        setRecentLedger(loadedLedger.slice(0, 8));
        setGrns(loadedGrns);
        setLastSyncedAt(new Date().toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }));
      } catch {
        if (!active) return;
        setProducts([]);
        setRecentLedger([]);
        setGrns([]);
        setLastSyncedAt('Unavailable');
      }
    }

    loadDashboardData();

    return () => {
      active = false;
    };
  }, []);

  const totalProducts = products.length;
  const totalStockValue = products.reduce((acc, product) => acc + product.stock * product.costPrice, 0);
  const activeSuppliersCount = new Set(products.map((product) => product.supplier)).size;
  const pendingGrns = grns.filter((grn) => grn.status !== 'Completed').length;
  const criticalAlerts = products.filter((product) => product.stock === 0 || product.stock <= product.reorderLevel).length;
  const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= product.reorderLevel).length;
  const outOfStockCount = products.filter((product) => product.stock === 0).length;

  const snapshotCards = [
    {
      label: 'Total Products',
      value: totalProducts.toString(),
      helper: 'Catalog items currently tracked',
      icon: 'inventory_2',
      tone: 'text-emerald-700 bg-emerald-50',
    },
    {
      label: 'Total Stock Value',
      value: formatCurrency(totalStockValue),
      helper: 'Based on live cost prices',
      icon: 'payments',
      tone: 'text-indigo-700 bg-indigo-50',
    },
    {
      label: 'Active Suppliers',
      value: activeSuppliersCount.toString(),
      helper: 'Suppliers represented in stock',
      icon: 'storefront',
      tone: 'text-sky-700 bg-sky-50',
    },
    {
      label: 'Pending GRNs',
      value: pendingGrns.toString(),
      helper: 'Receipts needing review',
      icon: 'receipt_long',
      tone: 'text-amber-700 bg-amber-50',
    },
    {
      label: 'Critical Alerts',
      value: criticalAlerts.toString(),
      helper: 'Low or out-of-stock items',
      icon: 'notification_important',
      tone: 'text-rose-700 bg-rose-50',
    },
  ];

  return (
    <div className="flex h-screen bg-[radial-gradient(circle_at_top_right,_rgba(11,130,82,0.10),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#f5f7fb_100%)] text-slate-800 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <InventoryHeader />

        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,130,82,0.08),transparent_30%,rgba(15,118,110,0.03))]" />
              <div className="relative p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl space-y-4">
                    <div>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">Inventory Control Center</h1>
                      <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-600 leading-6">Manage products, stock, procurement, and analytics in one place.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                        <span className="material-symbols-outlined text-[18px] text-emerald-600">schedule</span>
                        Last updated {lastSyncedAt}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                        <span className="material-symbols-outlined text-[18px] text-slate-500">category</span>
                        {activeSuppliersCount} suppliers across {totalProducts} products
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[460px]">
                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Live Products</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">{totalProducts}</p>
                      <p className="mt-1 text-xs text-slate-500">Catalog ready</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Low Stock</p>
                      <p className="mt-2 text-2xl font-black text-amber-600">{lowStockCount}</p>
                      <p className="mt-1 text-xs text-slate-500">Needs attention</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Out of Stock</p>
                      <p className="mt-2 text-2xl font-black text-rose-600">{outOfStockCount}</p>
                      <p className="mt-1 text-xs text-slate-500">Critical items</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Ledger</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">{recentLedger.length}</p>
                      <p className="mt-1 text-xs text-slate-500">Recent entries</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">Module Navigation</h2>
                  <p className="mt-1 text-sm text-slate-500">Jump straight to the area you need.</p>
                </div>
              </div>

              <div className="relative w-full overflow-hidden fade-edges rounded-[1.75rem] border border-slate-200 bg-white px-4 py-4 sm:px-5 shadow-sm">
                <style>{`
                  @keyframes module-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                  .module-marquee {
                    animation: module-scroll 34s linear infinite;
                    width: max-content;
                  }
                  .module-marquee:hover {
                    animation-play-state: paused;
                  }
                  /* Mobile / small screens: stack cards and disable animation for accessibility */
                  @media (max-width: 768px) {
                    .module-marquee {
                      animation: none;
                      width: 100%;
                      display: grid;
                      grid-template-columns: 1fr;
                      gap: 1rem;
                    }
                    .module-marquee > a {
                      width: 100% !important;
                    }
                    .fade-edges {
                      mask-image: none;
                      -webkit-mask-image: none;
                    }
                  }
                  .fade-edges {
                    mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                  }
                `}</style>

                <div
                  className="module-marquee flex gap-4 py-2"
                  tabIndex={0}
                  role="region"
                  aria-label="Module navigation carousel"
                  onMouseEnter={() => setMarqueePaused(true)}
                  onMouseLeave={() => setMarqueePaused(false)}
                  onFocusCapture={() => setMarqueePaused(true)}
                  onBlurCapture={() => setMarqueePaused(false)}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.code === 'Space') {
                      e.preventDefault();
                      setMarqueePaused((p) => !p);
                    }
                    if (e.key === 'Enter') {
                      setMarqueePaused(true);
                    }
                  }}
                  style={{ animationPlayState: marqueePaused ? 'paused' : 'running' }}
                >
                  {[...moduleCards, ...moduleCards].map((card, index) => {
                    let stat = 'System ready';
                    if (card.title === 'Product Management') stat = `${totalProducts} products`;
                    else if (card.title === 'Procurement') stat = `${pendingGrns} GRNs to review`;
                    else if (card.title === 'Stock Operations') stat = `${recentLedger.length} ledger entries`;
                    else if (card.title === 'Inventory Analytics') stat = `${formatCurrency(totalStockValue)} stock value`;
                    else if (card.title === 'Alerts & Monitoring') stat = `${criticalAlerts} active alerts`;
                    else if (card.title === 'Reports Center') stat = `${grns.length} procurement records`;

                    return (
                      <ModuleCard
                        key={`${card.title}-${index}`}
                        title={card.title}
                        description={card.description}
                        icon={card.icon}
                        to={card.to}
                        accent={card.accent}
                        iconColor={card.iconColor}
                        stat={stat}
                      />
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">System Snapshot</h2>
                <p className="mt-1 text-sm text-slate-500">Lightweight KPIs for quick operational awareness.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                {snapshotCards.map((card) => (
                  <SnapshotCard key={card.label} label={card.label} value={card.value} helper={card.helper} icon={card.icon} tone={card.tone} />
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.65fr_0.95fr] gap-4 lg:gap-6">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">Recent Activity</h2>
                    <p className="mt-1 text-sm text-slate-500">Last {Math.min(8, recentLedger.length || 8)} ledger entries for fast review.</p>
                  </div>
                  <Link to="/inventory-operations?tab=movements" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors">
                    View full ledger
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>

                <div className="mt-5 space-y-3">
                  {recentLedger.length > 0 ? (
                    recentLedger.map((entry) => (
                      <RecentActivityItem key={entry.id} entry={entry} />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                      <span className="material-symbols-outlined text-4xl text-slate-400">history</span>
                      <p className="mt-3 font-semibold text-slate-700">No recent activity yet</p>
                      <p className="mt-1 text-sm text-slate-500">New GRNs, adjustments, and stock movements will appear here.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">Quick Actions</h2>
                <p className="mt-1 text-sm text-slate-500">Fast entry points for the most common inventory tasks.</p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                  {quickActions.map((action) => (
                    <QuickActionItem key={action.label} action={action} />
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-500">Inventory signals</span>
                    <span className="font-semibold text-slate-900">{criticalAlerts} critical / {lowStockCount} low stock</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500" style={{ width: `${Math.min(100, Math.max(10, criticalAlerts * 8 + lowStockCount * 4))}%` }} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
