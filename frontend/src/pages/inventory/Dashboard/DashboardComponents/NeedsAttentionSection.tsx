import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProductItem, GRNRecord, getProductReorderThreshold } from '../../StockOperations/operations/inventoryOperationsService';

export interface AttentionItem {
  id: string;
  type: 'OUT_OF_STOCK' | 'EXPIRED' | 'EXPIRY_RISK' | 'LOW_STOCK' | 'PENDING_GRN';
  severity: 'CRITICAL' | 'HIGH' | 'WARNING';
  title: string;
  subtitle: string;
  badgeText: string;
  metricLabel: string;
  icon: string;
  tone: {
    badge: string;
    icon: string;
    border: string;
    dot: string;
  };
  actionLabel: string;
  actionTo: string;
  secondaryActionLabel?: string;
  secondaryActionTo?: string;
  sortRank: number; // 1 = Critical, 2 = High, 3 = Warning
}

interface NeedsAttentionSectionProps {
  products: ProductItem[];
  grns: GRNRecord[];
  loading?: boolean;
}

export default function NeedsAttentionSection({
  products,
  grns,
  loading = false,
}: NeedsAttentionSectionProps) {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'EXPIRY' | 'GRN'>('ALL');
  const [isExpanded, setIsExpanded] = useState(false);

  // Derive real operational issues from existing project data
  const attentionItems = useMemo<AttentionItem[]>(() => {
    const items: AttentionItem[] = [];
    const now = Date.now();

    // 1. Out of Stock Products (Critical)
    products.forEach((p) => {
      if (p.stock === 0) {
        items.push({
          id: `oos-${p.sku}`,
          type: 'OUT_OF_STOCK',
          severity: 'CRITICAL',
          title: p.name,
          subtitle: `${p.sku} · ${p.category} · ${p.supplier}`,
          badgeText: 'OUT OF STOCK',
          metricLabel: `0 in stock · Reorder level: ${p.reorderLevel}`,
          icon: 'cancel',
          tone: {
            badge: 'bg-rose-50 text-rose-700 border-rose-200',
            icon: 'text-rose-600 bg-rose-50',
            border: 'border-rose-200/80 hover:border-rose-300',
            dot: 'bg-rose-500',
          },
          actionLabel: 'Receive Stock',
          actionTo: `/inventory-operations?tab=grn&action=add&sku=${encodeURIComponent(p.sku)}`,
          secondaryActionLabel: 'Review',
          secondaryActionTo: `/manage-products?search=${encodeURIComponent(p.sku)}`,
          sortRank: 1,
        });
      }
    });

    // 2. Expiry Tracking (Critical / High)
    products.forEach((p) => {
      if (p.stock > 0 && p.expiryDate) {
        const expTime = new Date(p.expiryDate).getTime();
        const daysToExpiry = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));

        if (daysToExpiry <= 0) {
          // Already Expired
          items.push({
            id: `exp-${p.sku}`,
            type: 'EXPIRED',
            severity: 'CRITICAL',
            title: p.name,
            subtitle: `${p.sku} · ${p.category}`,
            badgeText: 'EXPIRED',
            metricLabel: `Expired on ${p.expiryDate} · ${p.stock} units`,
            icon: 'event_busy',
            tone: {
              badge: 'bg-rose-50 text-rose-700 border-rose-200',
              icon: 'text-rose-600 bg-rose-50',
              border: 'border-rose-200/80 hover:border-rose-300',
              dot: 'bg-rose-500',
            },
            actionLabel: 'Write Off / Adjust',
            actionTo: `/inventory-operations?tab=adjustments&sku=${encodeURIComponent(p.sku)}`,
            secondaryActionLabel: 'Review',
            secondaryActionTo: `/manage-products?search=${encodeURIComponent(p.sku)}`,
            sortRank: 1,
          });
        } else if (daysToExpiry <= 30) {
          // Imminent Expiry Risk
          items.push({
            id: `exprisk-${p.sku}`,
            type: 'EXPIRY_RISK',
            severity: daysToExpiry <= 7 ? 'HIGH' : 'WARNING',
            title: p.name,
            subtitle: `${p.sku} · ${p.category}`,
            badgeText: daysToExpiry <= 7 ? 'CRITICAL EXPIRY' : 'EXPIRING SOON',
            metricLabel: `Expires in ${daysToExpiry} day${daysToExpiry === 1 ? '' : 's'} (${p.expiryDate}) · ${p.stock} units`,
            icon: 'history_toggle_off',
            tone: {
              badge: daysToExpiry <= 7 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-amber-50 text-amber-700 border-amber-200',
              icon: daysToExpiry <= 7 ? 'text-orange-600 bg-orange-50' : 'text-amber-600 bg-amber-50',
              border: 'border-amber-200/80 hover:border-amber-300',
              dot: daysToExpiry <= 7 ? 'bg-orange-500' : 'bg-amber-500',
            },
            actionLabel: 'Create Promo Bundle',
            actionTo: '/inventory-combo',
            secondaryActionLabel: 'Adjust Stock',
            secondaryActionTo: `/inventory-operations?tab=adjustments&sku=${encodeURIComponent(p.sku)}`,
            sortRank: daysToExpiry <= 7 ? 2 : 3,
          });
        }
      }
    });

    // 3. Low Stock Products (Warning)
    products.forEach((p) => {
      const threshold = getProductReorderThreshold(p);
      if (p.stock > 0 && p.stock <= threshold) {
        items.push({
          id: `low-${p.sku}`,
          type: 'LOW_STOCK',
          severity: 'WARNING',
          title: p.name,
          subtitle: `${p.sku} · ${p.category} · ${p.supplier}`,
          badgeText: 'LOW STOCK',
          metricLabel: `${p.stock} units remaining (Threshold: ${threshold})`,
          icon: 'warning',
          tone: {
            badge: 'bg-amber-50 text-amber-700 border-amber-200',
            icon: 'text-amber-600 bg-amber-50',
            border: 'border-amber-200/80 hover:border-amber-300',
            dot: 'bg-amber-500',
          },
          actionLabel: 'Restock (GRN)',
          actionTo: `/inventory-operations?tab=grn&action=add&sku=${encodeURIComponent(p.sku)}`,
          secondaryActionLabel: 'Review',
          secondaryActionTo: `/manage-products?search=${encodeURIComponent(p.sku)}`,
          sortRank: 3,
        });
      }
    });

    // 4. Pending / Incomplete GRNs
    grns.forEach((g) => {
      if (g.status && g.status !== 'Completed') {
        items.push({
          id: `grn-${g.id}`,
          type: 'PENDING_GRN',
          severity: 'HIGH',
          title: `GRN ${g.grnNumber}`,
          subtitle: `Supplier: ${g.supplierName} · Received: ${g.receivedDate}`,
          badgeText: g.status.toUpperCase(),
          metricLabel: `${g.items?.length || 0} items · ${g.totalQuantity || 0} units · Status: ${g.status}`,
          icon: 'local_shipping',
          tone: {
            badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            icon: 'text-indigo-600 bg-indigo-50',
            border: 'border-indigo-200/80 hover:border-indigo-300',
            dot: 'bg-indigo-500',
          },
          actionLabel: 'Review GRN',
          actionTo: '/inventory-operations?tab=grn',
          sortRank: 2,
        });
      }
    });

    // Sort by rank (Critical 1 -> High 2 -> Warning 3)
    return items.sort((a, b) => a.sortRank - b.sortRank);
  }, [products, grns]);

  // Counts for filter chips
  const countOOS = useMemo(() => attentionItems.filter((i) => i.type === 'OUT_OF_STOCK').length, [attentionItems]);
  const countLow = useMemo(() => attentionItems.filter((i) => i.type === 'LOW_STOCK').length, [attentionItems]);
  const countExp = useMemo(() => attentionItems.filter((i) => i.type === 'EXPIRED' || i.type === 'EXPIRY_RISK').length, [attentionItems]);
  const countGRN = useMemo(() => attentionItems.filter((i) => i.type === 'PENDING_GRN').length, [attentionItems]);

  const filteredItems = useMemo(() => {
    if (selectedFilter === 'OUT_OF_STOCK') return attentionItems.filter((i) => i.type === 'OUT_OF_STOCK');
    if (selectedFilter === 'LOW_STOCK') return attentionItems.filter((i) => i.type === 'LOW_STOCK');
    if (selectedFilter === 'EXPIRY') return attentionItems.filter((i) => i.type === 'EXPIRED' || i.type === 'EXPIRY_RISK');
    if (selectedFilter === 'GRN') return attentionItems.filter((i) => i.type === 'PENDING_GRN');
    return attentionItems;
  }, [attentionItems, selectedFilter]);

  const visibleItems = isExpanded ? filteredItems : filteredItems.slice(0, 4);

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">Needs Attention</h2>
            {attentionItems.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-black text-rose-700 border border-rose-200">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                {attentionItems.length} {attentionItems.length === 1 ? 'issue' : 'issues'}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">Priority issues that may require action.</p>
        </div>

        {/* Quick Filter Tabs & Link to Alerts */}
        <div className="flex flex-wrap items-center gap-2">
          {attentionItems.length > 0 && (
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedFilter('ALL')}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  selectedFilter === 'ALL'
                    ? 'bg-[#0b8252] text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({attentionItems.length})
              </button>
              {countOOS > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedFilter('OUT_OF_STOCK')}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    selectedFilter === 'OUT_OF_STOCK'
                      ? 'bg-rose-700 text-white shadow-sm font-bold'
                      : 'text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  Stockout ({countOOS})
                </button>
              )}
              {countLow > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedFilter('LOW_STOCK')}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    selectedFilter === 'LOW_STOCK'
                      ? 'bg-amber-700 text-white shadow-sm font-bold'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  Low Stock ({countLow})
                </button>
              )}
              {countExp > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedFilter('EXPIRY')}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    selectedFilter === 'EXPIRY'
                      ? 'bg-orange-700 text-white shadow-sm font-bold'
                      : 'text-orange-700 hover:bg-orange-50'
                  }`}
                >
                  Expiry ({countExp})
                </button>
              )}
              {countGRN > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedFilter('GRN')}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    selectedFilter === 'GRN'
                      ? 'bg-indigo-700 text-white shadow-sm font-bold'
                      : 'text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  GRN ({countGRN})
                </button>
              )}
            </div>
          )}

          <Link
            to="/alerts"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0b8252] hover:text-[#096b43] transition-colors"
          >
            <span>Alerts Center</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Items Container */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
          Loading inventory exceptions...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <span className="material-symbols-outlined text-[26px]">task_alt</span>
          </div>
          <h3 className="mt-3 text-base font-bold text-slate-800">All caught up</h3>
          <p className="mt-1 text-sm text-slate-500">No critical inventory issues require attention right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${item.tone.border}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.tone.icon}`}>
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${item.tone.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${item.tone.dot}`} />
                        {item.badgeText}
                      </span>
                    </div>

                    <h3 className="mt-1 text-sm font-bold text-slate-900 truncate" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>

                    <p className="mt-2 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 inline-block">
                      {item.metricLabel}
                    </p>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 self-center sm:self-start">
                  <Link
                    to={item.actionTo}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b8252] hover:bg-[#096b43] px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(11,130,82,0.25)] hover:shadow-[0_4px_12px_rgba(11,130,82,0.35)] transition-all active:scale-95 whitespace-nowrap"
                  >
                    <span>{item.actionLabel}</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </Link>

                  {item.secondaryActionLabel && item.secondaryActionTo && (
                    <Link
                      to={item.secondaryActionTo}
                      className="text-[11px] font-semibold text-slate-500 hover:text-[#0b8252] transition-colors"
                    >
                      {item.secondaryActionLabel}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show more toggle if filtered items > 4 */}
      {filteredItems.length > 4 && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <span>{isExpanded ? 'Show Less' : `Show ${filteredItems.length - 4} More Issues`}</span>
            <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
