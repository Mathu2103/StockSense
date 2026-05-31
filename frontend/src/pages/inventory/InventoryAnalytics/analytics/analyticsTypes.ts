/**
 * analyticsTypes.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised TypeScript interface definitions shared across all analytics
 * subcomponents inside Components/analytics/.
 *
 * Why a separate file?
 *   → Keeps prop shapes in one place so changes propagate automatically.
 *   → Avoids duplicate type declarations across OverviewTab, VelocityTab,
 *     RiskTab, and KpiDashboardCards.
 *   → Makes it easy to extend (e.g., add a new field to DeadStockItem) without
 *     touching every component individually.
 *
 * Usage: import { SomeProps } from './analyticsTypes';
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── KPI Dashboard Cards ───────────────────────────────────────────────────────
/** Props for the 6-card KPI row that always stays visible above the tabs. */
export interface KpiCardsProps {
  /** Total monetary value of all stock (stock × costPrice) */
  totalInventoryValue: number;
  /** Live rotation rate string e.g. "8.4x" */
  turnoverRate: string;
  /** Sum of all expiry removal losses in Rupees */
  totalExpiryLoss: number;
  /** Number of active products in the catalog */
  productsCount: number;
  /** Number of products flagged as Critical dead stock */
  deadStockCount: number;
  /** Number of products currently at or below reorder threshold */
  lowStockCount: number;
}

// ── Inventory Health (Donut Chart) ────────────────────────────────────────────
/** Raw segment percentages and unit counts for the SVG donut chart. */
export interface HealthStats {
  /** % of stock in a healthy state (above reorder level) */
  healthy: number;
  /** % of stock below reorder level but not yet zero */
  warning: number;
  /** % of stock completely out */
  critical: number;
  /** Absolute unit count for Healthy segment */
  healthyCount: number;
  /** Absolute unit count for Warning segment */
  warningCount: number;
  /** Absolute unit count for Critical segment */
  criticalCount: number;
}

/** Props for the InventoryHealthOverviewCard (donut chart + legend). */
export interface HealthOverviewProps {
  dynamicHealthStats: HealthStats;
  /** Which segment the mouse is currently hovering — drives the center label */
  hoveredDonutSegment: string | null;
  setHoveredDonutSegment: (val: string | null) => void;
}

// ── Movement Insights (Bar Chart) ─────────────────────────────────────────────
/** One category's bar data — raw quantities and scaled % heights for each bar. */
export interface MovementInsightItem {
  label: string;
  rawIn: number;
  rawOut: number;
  rawAdj: number;
  inPct: number;
  outPct: number;
  adjPct: number;
}

export interface MovementInsightsProps {
  dynamicMovementInsights: MovementInsightItem[];
  hoveredChartBar: string | null;
  setHoveredChartBar: (val: string | null) => void;
}

export interface CategoryPerfItem {
  name: string;
  totalSales: string;
  stockValue: string;
  /** Turnover ratio e.g. "12.4x" */
  movementRate: string;
  /** "Best" | "Weak" | "Normal" — drives row highlight and badge colour */
  performance: string;
}

/** Props for the Category Performance table. */
export interface CategoryPerformanceProps {
  dynamicCategoryPerformance: CategoryPerfItem[];
}

// ── Fast Moving Products ──────────────────────────────────────────────────────
/** One product's velocity data — used in the ranked fast-moving table. */
export interface FastMovingItem {
  name: string;
  category: string;
  /** Calculated movement count for the selected date period */
  movementCount: number;
  /** Formatted revenue string e.g. "Rs. 45,000" */
  salesVolume: string;
  stockRemaining: number;
  /** "High Demand" | "Normal" */
  rating: string;
}

/** Props for the FastMovingProductsSection table. */
export interface FastMovingProps {
  dynamicFastMoving: FastMovingItem[];
}

// ── Smart Reorder Suggestions ─────────────────────────────────────────────────
/** One product's reorder recommendation — used in the suggestion cards. */
export interface ReorderItem {
  name: string;
  /** Current stock on hand */
  stock: number;
  /** Configured reorder threshold (safe minimum) */
  threshold: number;
  /** AI-calculated recommended order quantity */
  suggestedQty: number;
  /** "Critical" | "Warning" | "Normal" — drives card colour and button style */
  urgency: string;
}

/** Props for the SmartReorderSuggestionsSection card grid. */
export interface ReorderProps {
  dynamicReorderSuggestions: ReorderItem[];
  /** Global toast trigger passed down from InventoryAnalytics orchestrator */
  triggerToast: (msg: string) => void;
}

// ── Dead Stock Analysis ───────────────────────────────────────────────────────
/** One product's inactivity record — used in the dead-stock audit table. */
export interface DeadStockItem {
  name: string;
  /** ISO date string of the last recorded transaction */
  lastMovement: string;
  /** Number of days since the product last had any stock movement */
  daysInactive: number;
  stock: number;
  /** Current stock quantity × cost price */
  costValue: number;
  /** "Critical" | "Slow Moving" | "Healthy" — drives row highlight */
  status: string;
}

/** Props for the DeadStockAnalysisSection table. */
export interface DeadStockProps {
  dynamicDeadStock: DeadStockItem[];
}

// ── Expiry Loss Analysis ──────────────────────────────────────────────────────
/** One product's expiry wastage record — used in the loss analysis table. */
export interface ExpiryLossItem {
  name: string;
  /** Total units written off due to expiry */
  expiredQty: number;
  /** Monetary value of the loss (expiredQty × costPrice) */
  lossValue: number;
  /** ISO date of the product's recorded expiry */
  expiryDate: string;
}

/** Props for the ExpiryLossAnalysisSection panel. */
export interface ExpiryLossProps {
  dynamicExpiryLoss: ExpiryLossItem[];
  /** Aggregated total loss across all expiry records — shown in the summary banner */
  totalExpiryLoss: number;
  /** Global toast trigger passed down from InventoryAnalytics orchestrator */
  triggerToast: (msg: string) => void;
}
