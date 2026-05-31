import React from 'react';
import { Link } from 'react-router-dom';

type QuickAction = {
  label: string;
  icon: string;
  to?: string;
};

export default function QuickActionItem({ action, onAction }: { action: QuickAction; onAction?: () => void }) {
  const Container: any = onAction ? 'button' : Link;
  const containerProps: any = onAction ? { onClick: onAction, type: 'button' } : { to: action.to || '#' };

  return (
    <Container
      {...containerProps}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-sm"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-105">
        <span className="material-symbols-outlined text-[24px]">{action.icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-900">{action.label}</p>
      </div>
      <span className="material-symbols-outlined text-[20px] text-slate-400 transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
    </Container>
  );
}
