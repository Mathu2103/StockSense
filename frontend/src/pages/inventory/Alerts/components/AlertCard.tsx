import React from 'react';
import { Link } from 'react-router-dom';
import { AlertItem, AlertSeverity } from '../types/alertTypes';

interface AlertCardProps {
  alert: AlertItem;
  handlePrimary: (a: AlertItem) => void;
  dismiss: (id: number | string) => void;
  markRead: (id: number | string) => void;
}

const getSeverityBadgeClass = (severity: AlertSeverity) => {
  if (severity === 'Critical') return 'bg-red-100 text-red-700';
  if (severity === 'Warning') return 'bg-amber-100 text-amber-700';
  return 'bg-blue-100 text-blue-700';
};

const getActionButtonClass = (emphasis: boolean) =>
  emphasis
    ? 'bg-[#0b8252] text-white border-[#0b8252] hover:bg-[#096b43]'
    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50';

export default function AlertCard({ alert, handlePrimary, dismiss, markRead }: AlertCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm flex overflow-hidden transition-opacity ${alert.read ? 'opacity-75' : ''
        }`}
    >
      <div className={`w-1.5 flex-shrink-0 ${alert.accentColor}`} />
      <div className="p-5 flex flex-col sm:flex-row gap-5 flex-1">

        {/* Icon */}
        <div className={`w-16 h-16 rounded-lg ${alert.iconBg} flex items-center justify-center flex-shrink-0`}>
          <span className={`material-symbols-outlined ${alert.iconColor} text-[32px]`}>{alert.icon}</span>
        </div>

        {/* Body */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${getSeverityBadgeClass(alert.severity)}`}>
              {alert.severity}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-slate-100 text-slate-600">
              {alert.issueType}
            </span>
            <span className="text-xs text-slate-400 font-medium">{alert.time}</span>
            {!alert.read && (
              <span className="w-2 h-2 bg-[#0b8252] rounded-full" title="Unread" />
            )}
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">{alert.title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{alert.description}</p>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Current Stock</span>
              <span className="font-bold text-slate-800">{alert.currentStock}</span>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Suggested Action</span>
              <span className="font-bold text-slate-800">{alert.suggestedAction}</span>
            </div>
          </div>
        </div>

        {/* Required Actions */}
        <div className="grid grid-cols-2 gap-2 mt-4 sm:mt-0 min-w-[220px] sm:min-w-[240px] self-start sm:self-center">
          <Link
            to="/manage-products?tab=products"
            className={`flex items-center justify-center px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${getActionButtonClass(false)}`}
          >
            View Product
          </Link>
          <button
            onClick={() => handlePrimary(alert)}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${getActionButtonClass(true)}`}
          >
            {alert.primaryAction}
          </button>
          <button
            onClick={() => dismiss(alert.id)}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${getActionButtonClass(false)}`}
          >
            Dismiss Alert
          </button>
          <button
            onClick={() => markRead(alert.id)}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${getActionButtonClass(false)}`}
          >
            Mark as Read
          </button>
        </div>
      </div>
    </div>
  );
}
