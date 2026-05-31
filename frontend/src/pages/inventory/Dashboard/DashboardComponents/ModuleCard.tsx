import { Link } from 'react-router-dom';
import React from 'react';

type ModuleCardProps = {
  title: string;
  description: string;
  icon: string;
  to?: string;
  accent?: string;
  iconColor?: string;
  stat?: string;
  onOpen?: () => void;
};

export default function ModuleCard({ title, description, icon, to, accent = '', iconColor = '', stat, onOpen }: ModuleCardProps) {
  const Container: any = onOpen ? 'button' : Link;
  const containerProps: any = onOpen
    ? { onClick: onOpen, type: 'button' }
    : { to: to || '#' };

  return (
    <Container
      {...containerProps}
      className="group relative w-[320px] shrink-0 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-70 transition-opacity duration-300 group-hover:opacity-100`} />
      <div className="relative flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 ${iconColor}`}>
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-black tracking-tight text-slate-900">{title}</h3>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-white/70 pt-4 text-sm">
          <span className="font-semibold text-slate-700">{stat ?? 'System ready'}</span>
          <span className="inline-flex items-center gap-1 font-semibold text-slate-600 transition-transform duration-300 group-hover:translate-x-1">
            Open
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </Container>
  );
}
