import React from 'react'

/*
  SectionHeader
  - Purpose: Standardized page/section header with title, subtitle and action slot.
  - Why: Ensures consistent page headings and action placement (Add product, Filters, Export)
    so users find controls in the same place across Inventory pages.
  - Usage: Use at top of Products, Suppliers, Purchase Orders, Alerts, and Reports pages.
*/

type SectionHeaderProps = {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function SectionHeader({ title, subtitle, actions }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">{title}</h1>
        {subtitle && <p className="text-sm text-outline mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  )
}
