import React from 'react';
import Sidebar from "../Shared/Sidebar";
import InventoryHeader from "../Shared/InventoryHeader";
import { useAlerts } from './hooks/useAlerts';
import AlertSummary from './components/AlertSummary';
import AlertFilterBar from './components/AlertFilterBar';
import EmptyAlertsState from './components/EmptyAlertsState';
import AlertCard from './components/AlertCard';

export default function Alerts() {
  const {
    visible,
    unread,
    criticalAlerts,
    lowStockAlerts,
    expiryAlerts,
    reorderSuggestions,
    filtered,
    activeTab,
    setActiveTab,
    toasts,
    showFilters,
    setShowFilters,
    sevFilter,
    setSevFilter,
    readFilter,
    setReadFilter,
    filtersActive,
    tabCount,
    dismiss,
    markRead,
    markAllRead,
    handlePrimary
  } = useAlerts();

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* ── Toast Container ── */}
        <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-bold text-white pointer-events-auto ${t.type === 'success' ? 'bg-[#0b8252]' : 'bg-slate-700'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {t.type === 'success' ? 'check_circle' : 'info'}
              </span>
              {t.message}
            </div>
          ))}
        </div>

        {/* Header */}
        <InventoryHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6 bg-[#f8f9fa]">
          <div className="max-w-[1400px] w-full mx-auto space-y-6">

            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Alerts &amp; Notifications</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Manage inventory levels, expiry dates, and unusual sales patterns.
                  {unread > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      {unread} unread
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">

                {/* Filters button */}
                <button
                  onClick={() => setShowFilters(true)}
                  className={`flex items-center gap-2 px-4 py-2.5 border font-bold text-sm rounded-lg shadow-sm transition-colors ${filtersActive
                    ? 'bg-[#eef8f2] border-[#0b8252] text-[#0b8252]'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  Filters
                  {filtersActive && <span className="w-2 h-2 bg-[#0b8252] rounded-full" />}
                </button>

                {/* Mark All Read */}
                <button
                  onClick={markAllRead}
                  disabled={unread === 0}
                  className="flex items-center gap-2 bg-[#0b8252] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-[#096b43] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">done_all</span>
                  Mark All Read
                </button>
              </div>
            </div>

            {/* Alert Summary (KPIs & Insights) */}
            <AlertSummary
              totalAlerts={visible.length}
              criticalAlerts={criticalAlerts}
              lowStockAlerts={lowStockAlerts}
              expiryAlerts={expiryAlerts}
              reorderSuggestions={reorderSuggestions}
              setActiveTab={setActiveTab}
              setSevFilter={setSevFilter}
            />

            {/* Tabs & Filter Bar Side Panel */}
            <AlertFilterBar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabCount={tabCount}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              sevFilter={sevFilter}
              setSevFilter={setSevFilter}
              readFilter={readFilter}
              setReadFilter={setReadFilter}
            />

            {/* Alerts Content */}
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <EmptyAlertsState
                  setActiveTab={setActiveTab}
                  setSevFilter={setSevFilter}
                  setReadFilter={setReadFilter}
                />
              ) : (
                filtered.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    handlePrimary={handlePrimary}
                    dismiss={dismiss}
                    markRead={markRead}
                  />
                ))
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
