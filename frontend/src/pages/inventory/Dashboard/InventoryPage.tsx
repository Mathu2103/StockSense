import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Shared/Sidebar';
import InventoryHeader from '../Shared/InventoryHeader';
import SnapshotCard from './DashboardComponents/SnapshotCard';
import NeedsAttentionSection from './DashboardComponents/NeedsAttentionSection';
import RecentActivityItem from './DashboardComponents/RecentActivityItem';
import {
  inventoryOperationsService,
  ProductItem,
  LedgerEntry,
  GRNRecord,
  getProductReorderThreshold,
} from '../StockOperations/operations/inventoryOperationsService';

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type ActivityFilter = 'ALL' | 'GRN' | 'SALE' | 'ADJUSTMENT' | 'EXPIRY';

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [grns, setGrns] = useState<GRNRecord[]>([]);
  const [allLedger, setAllLedger] = useState<LedgerEntry[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('Syncing...');
  const [loading, setLoading] = useState<boolean>(true);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('ALL');

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      setLoading(true);
      try {
        const [loadedProducts, loadedLedger, loadedGrns] = await Promise.all([
          inventoryOperationsService.getProducts(),
          inventoryOperationsService.getLedger(),
          inventoryOperationsService.getGRNHistory(),
        ]);

        if (!active) return;

        setProducts(loadedProducts);
        setAllLedger(loadedLedger);
        setGrns(loadedGrns);
        setLastSyncedAt(
          new Date().toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        );
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        if (!active) return;
        setProducts([]);
        setAllLedger([]);
        setGrns([]);
        setLastSyncedAt('Unavailable');
      } finally {
        if (active) setLoading(false);
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
  const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= getProductReorderThreshold(product)).length;
  const outOfStockCount = products.filter((product) => product.stock === 0).length;

  // Snapshot KPI cards with real actions
  const snapshotCards = [
    {
      label: 'Total Products',
      value: totalProducts.toString(),
      helper: 'Catalog items currently tracked',
      icon: 'inventory_2',
      tone: 'text-emerald-700 bg-emerald-50',
      actionLabel: 'View Catalog',
      to: '/manage-products',
    },
    {
      label: 'Total Stock Value',
      value: formatCurrency(totalStockValue),
      helper: 'Based on live cost prices',
      icon: 'payments',
      tone: 'text-indigo-700 bg-indigo-50',
      actionLabel: 'View Analytics',
      to: '/inventory-analytics',
    },
    {
      label: 'Suppliers',
      value: activeSuppliersCount.toString(),
      helper: 'Registered partner suppliers',
      icon: 'storefront',
      tone: 'text-sky-700 bg-sky-50',
      actionLabel: 'View Suppliers',
      to: '/procurement',
    },
    {
      label: 'Low Stock Items',
      value: lowStockCount.toString(),
      helper: 'Items nearing depletion',
      icon: 'warning',
      tone: lowStockCount > 0 ? 'text-amber-700 bg-amber-50' : 'text-slate-600 bg-slate-50',
      actionLabel: lowStockCount > 0 ? 'Review Low Stock' : 'View Catalog',
      to: '/manage-products?filter=low-stock',
    },
    {
      label: 'Out of Stock Items',
      value: outOfStockCount.toString(),
      helper: 'Products with zero stock',
      icon: 'cancel',
      tone: outOfStockCount > 0 ? 'text-rose-700 bg-rose-50' : 'text-slate-600 bg-slate-50',
      actionLabel: outOfStockCount > 0 ? 'Resolve Now' : 'View Catalog',
      to: '/manage-products?filter=out-of-stock',
    },
  ];

  // Activity filter counts (focused on inventory manager operations)
  const countAll = allLedger.length;
  const countGRN = useMemo(() => allLedger.filter((l) => l.movementType === 'GRN').length, [allLedger]);
  const countAdj = useMemo(() => allLedger.filter((l) => l.movementType === 'Adjustment').length, [allLedger]);
  const countExp = useMemo(() => allLedger.filter((l) => l.movementType === 'Expiry Removal').length, [allLedger]);

  // Filtered activity items for Manager
  const filteredActivity = useMemo(() => {
    let items = allLedger;
    if (activityFilter === 'GRN') items = allLedger.filter((l) => l.movementType === 'GRN');
    else if (activityFilter === 'ADJUSTMENT') items = allLedger.filter((l) => l.movementType === 'Adjustment');
    else if (activityFilter === 'EXPIRY') items = allLedger.filter((l) => l.movementType === 'Expiry Removal');
    return items.slice(0, 8);
  }, [allLedger, activityFilter]);

  return (
    <div className="flex h-screen bg-[radial-gradient(circle_at_top_right,_rgba(11,130,82,0.08),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#f5f7fb_100%)] text-slate-800 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <InventoryHeader />

        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* ─────────────────────────────────────────────────────────────
                CHANGE 1 — COMPACT INVENTORY OVERVIEW HEADER
               ───────────────────────────────────────────────────────────── */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                    Inventory Overview
                  </h1>
                  <p className="mt-1 text-sm text-slate-500 font-medium">
                    Monitor stock health, inventory activity, and urgent actions.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600">
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">schedule</span>
                    Last updated {lastSyncedAt}
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-slate-500">storefront</span>
                    {activeSuppliersCount} active suppliers · {totalProducts} catalog products
                  </div>
                </div>
              </div>
            </section>

            {/* ─────────────────────────────────────────────────────────────
                CHANGE 2 — ACTIONABLE KPI SNAPSHOT CARDS
               ───────────────────────────────────────────────────────────── */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">System Snapshot</h2>
                  <p className="text-xs text-slate-500">Live inventory indicators with direct operational access.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                {snapshotCards.map((card) => (
                  <SnapshotCard
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    helper={card.helper}
                    icon={card.icon}
                    tone={card.tone}
                    actionLabel={card.actionLabel}
                    to={card.to}
                  />
                ))}
              </div>
            </section>

            {/* ─────────────────────────────────────────────────────────────
                CHANGE 3 — NEEDS ATTENTION SECTION
               ───────────────────────────────────────────────────────────── */}
            <NeedsAttentionSection
              products={products}
              grns={grns}
              loading={loading}
            />

            {/* ─────────────────────────────────────────────────────────────
                CHANGE 4 — STREAMLINED RECENT ACTIVITY (MANAGER OPERATIONS)
               ───────────────────────────────────────────────────────────── */}
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">Recent Activity</h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Recent goods receipts, stock adjustments, and inventory write-offs.
                    </p>
                  </div>

                  {/* Operational Filter Tabs */}
                  <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50/80 p-1 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setActivityFilter('ALL')}
                      className={`rounded-lg px-2.5 py-1 transition-all ${
                        activityFilter === 'ALL'
                          ? 'bg-[#0b8252] text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({countAll})
                    </button>
                    {countGRN > 0 && (
                      <button
                        type="button"
                        onClick={() => setActivityFilter('GRN')}
                        className={`rounded-lg px-2.5 py-1 transition-all ${
                          activityFilter === 'GRN'
                            ? 'bg-emerald-700 text-white shadow-sm font-bold'
                            : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        GRN Inflows ({countGRN})
                      </button>
                    )}
                    {countAdj > 0 && (
                      <button
                        type="button"
                        onClick={() => setActivityFilter('ADJUSTMENT')}
                        className={`rounded-lg px-2.5 py-1 transition-all ${
                          activityFilter === 'ADJUSTMENT'
                            ? 'bg-amber-700 text-white shadow-sm font-bold'
                            : 'text-amber-700 hover:bg-amber-50'
                        }`}
                      >
                        Adjustments ({countAdj})
                      </button>
                    )}
                    {countExp > 0 && (
                      <button
                        type="button"
                        onClick={() => setActivityFilter('EXPIRY')}
                        className={`rounded-lg px-2.5 py-1 transition-all ${
                          activityFilter === 'EXPIRY'
                            ? 'bg-rose-700 text-white shadow-sm font-bold'
                            : 'text-rose-700 hover:bg-rose-50'
                        }`}
                      >
                        Expiry ({countExp})
                      </button>
                    )}
                  </div>
                </div>

                {/* Ledger Items List */}
                <div className="mt-4 space-y-3">
                  {loading ? (
                    <div className="py-8 text-center text-xs font-semibold text-slate-400">
                      Loading recent activity...
                    </div>
                  ) : filteredActivity.length > 0 ? (
                    filteredActivity.map((entry) => (
                      <RecentActivityItem key={entry.id} entry={entry} />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                      <span className="material-symbols-outlined text-4xl text-slate-400">history</span>
                      <p className="mt-3 font-semibold text-slate-700">No activity found for this filter</p>
                      <p className="mt-1 text-sm text-slate-500">
                        New GRN deliveries, adjustments, and write-offs will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
