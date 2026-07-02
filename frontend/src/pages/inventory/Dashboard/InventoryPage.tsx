import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Shared/Sidebar';
import InventoryHeader from '../Shared/InventoryHeader';
import SnapshotCard from './DashboardComponents/SnapshotCard';
import RecentActivityItem from './DashboardComponents/RecentActivityItem';
import {
  inventoryOperationsService,
  ProductItem,
  LedgerEntry,
  GRNRecord,
} from '../StockOperations/operations/inventoryOperationsService';

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}



export default function InventoryPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [grns, setGrns] = useState<GRNRecord[]>([]);
  const [recentLedger, setRecentLedger] = useState<LedgerEntry[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('Syncing...');

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
  const _pendingGrns = grns.filter((grn) => grn.status !== 'Completed').length;
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
      label: 'Low Stock Items',
      value: lowStockCount.toString(),
      helper: 'Items nearing depletion',
      icon: 'warning',
      tone: 'text-amber-700 bg-amber-50',
    },
    {
      label: 'Out of Stock Items',
      value: outOfStockCount.toString(),
      helper: 'Products with zero stock',
      icon: 'cancel',
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

            <section className="grid grid-cols-1 gap-4 lg:gap-6">
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
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
