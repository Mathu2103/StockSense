import React from 'react'

/*
  EmptyState
  - Purpose: Display a consistent empty-result or no-data UI with optional action.
  - Why: Communicates helpful next steps (e.g., "Add Product" or "Clear Filters") when lists
    return no items; keeps UX consistent across inventory modules.
  - Usage: Products list empty, Alerts filtered to none, Purchase Orders with no data.
*/

type EmptyStateProps = {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 text-center">
      <div className="mx-auto w-20 h-20 rounded-lg bg-background flex items-center justify-center text-slate-300 text-4xl">
        {icon || '🔔'}
      </div>
      <h3 className="text-lg font-bold text-on-surface mt-4">{title}</h3>
      {description && <p className="text-sm text-outline mt-2">{description}</p>}
      {actionLabel && (
        <button onClick={onAction} className="mt-4 text-sm font-bold text-primary hover:underline">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
