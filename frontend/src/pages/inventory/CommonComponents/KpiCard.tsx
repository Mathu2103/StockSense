import React from 'react'

/*
  KpiCard
  - Purpose: Reusable statistic card used across the Inventory dashboard and pages.
  - Why: Provides a consistent look for KPI metrics (Total Products, Low Stock, Inventory Value,
    etc.) so the Inventory UI remains uniform and easy to scan for store staff.
  - Usage: Place in Dashboard, Product list header, Alerts summary and other overview panels.
*/

type KpiCardProps = {
  icon?: React.ReactNode
  label: string
  value: string | number
  trend?: string
  trendType?: 'up' | 'down' | 'neutral'
}

export default function KpiCard({ icon, label, value, trend, trendType = 'neutral' }: KpiCardProps) {
  const trendClass = trendType === 'down' ? 'text-red-600' : trendType === 'up' ? 'text-emerald-600' : 'text-slate-500'

  return (
    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex items-start gap-4">
      {icon ? (
        <div className="w-12 h-12 rounded-lg bg-secondary-container text-primary flex items-center justify-center">{icon}</div>
      ) : (
        <div className="w-12 h-12 rounded-lg bg-secondary-container text-primary flex items-center justify-center">●</div>
      )}

      <div className="flex-1">
        <p className="text-[10px] text-outline font-bold uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-center justify-between gap-4">
          <p className="text-2xl font-bold text-on-surface">{value}</p>
          {trend && <p className={`text-sm font-bold ${trendClass}`}>{trend}</p>}
        </div>
      </div>
    </div>
  )
}
