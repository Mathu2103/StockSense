// Removed unused default React import (using automatic JSX runtime)

/*
  StatusBadge
  - Purpose: Small pill component to display product/alert statuses (In Stock, Low Stock,
    Out of Stock, Expiring Soon).
  - Why: Centralizes status styling so badges across tables and cards use the same color
    semantics and accessibility.
  - Usage: Shown in product rows, alert cards, and report tables to indicate inventory state.
*/

type StatusBadgeProps = {
  status: string
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

const variants: Record<string, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  neutral: 'bg-slate-100 text-slate-700',
}

export default function StatusBadge({ status, variant = 'neutral' }: StatusBadgeProps) {
  const cls = variants[variant] || variants.neutral
  return <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${cls}`}>{status}</span>
}
