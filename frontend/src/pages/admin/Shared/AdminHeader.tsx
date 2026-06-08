import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

interface AdminHeaderProps {
  children?: React.ReactNode;
}

/* ──────────────────────────────────────────────────────────────────────────
   QUICK CREATE MENU CONFIG
   ────────────────────────────────────────────────────────────────────────── */
const quickCreateCategories = [
  {
    label: 'INVENTORY',
    icon: 'inventory_2',
    color: '#0b8252',
    bg: 'from-emerald-50 to-emerald-100/40',
    items: [
      { name: 'Add New Product', path: '/manage-products/new', icon: 'add_box' },
      { name: 'New Category', path: '/categories', icon: 'category' },
      { name: 'Stock Adjustment', path: '/inventory-operations?tab=adjustments', icon: 'sync_alt' },
      { name: 'Stock Movement', path: '/inventory-operations?tab=movements', icon: 'swap_horiz' },
    ],
  },
  {
    label: 'PROCUREMENT',
    icon: 'local_shipping',
    color: '#6366f1',
    bg: 'from-indigo-50 to-indigo-100/40',
    items: [
      { name: 'New Supplier', path: '/suppliers?tab=suppliers&action=new-supplier', icon: 'person_add' },
      { name: 'Purchase Order', path: '/suppliers?tab=records&action=record-purchase', icon: 'receipt_long' },
      { name: 'Purchase Record', path: '/suppliers?tab=records', icon: 'assignment' },
    ],
  },
  {
    label: 'ANALYTICS',
    icon: 'trending_up',
    color: '#f59e0b',
    bg: 'from-amber-50 to-amber-100/40',
    items: [
      { name: 'Generate Report', path: '/reports', icon: 'summarize' },
      { name: 'View Analytics', path: '/inventory-analytics', icon: 'bar_chart' },
      { name: 'Alert Rules', path: '/alerts', icon: 'notification_add' },
    ],
  },
  {
    label: 'SYSTEM',
    icon: 'settings',
    color: '#64748b',
    bg: 'from-slate-50 to-slate-100/40',
    items: [
      { name: 'Settings', path: '/settings', icon: 'tune' },
      { name: 'Dashboard', path: '/inventory', icon: 'grid_view' },
    ],
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   NOTIFICATIONS CONFIG
   ────────────────────────────────────────────────────────────────────────── */
const notifications = [
  {
    title: 'Rice 5kg expected to run out in 3 days',
    subtitle: 'Reorder suggestion available',
    time: '2 min ago',
    severity: 'critical' as const,
  },
  {
    title: 'Milk Packet requires urgent restock',
    subtitle: 'Critical low-stock alert',
    time: '15 min ago',
    severity: 'warning' as const,
  },
  {
    title: 'Supplier delays increasing stock risk',
    subtitle: 'Watch inventory intake schedule',
    time: '1 hr ago',
    severity: 'info' as const,
  },
];

const severityConfig = {
  critical: {
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-600 border-red-100',
    label: 'Urgent',
    icon: 'error',
  },
  warning: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-600 border-amber-100',
    label: 'Warning',
    icon: 'warning',
  },
  info: {
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-600 border-blue-100',
    label: 'Info',
    icon: 'info',
  },
};

/* ── Helper: format role for display ── */
const formatRole = (role: string) => {
  const roleMap: Record<string, string> = {
    ADMIN: 'Administrator',
    INVENTORY_MANAGER: 'Inventory Manager',
    CASHIER: 'Cashier',
  };
  return roleMap[role] || role;
};

/* ──────────────────────────────────────────────────────────────────────────
   SUB-COMPONENT: QUICK CREATE DROPDOWN
   ────────────────────────────────────────────────────────────────────────── */
function QuickCreateDropdown({ activeDropdown, setActiveDropdown }: { activeDropdown: string | null; setActiveDropdown: (name: string | null) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isOpen = activeDropdown === 'quickcreate';

  const toggle = () => setActiveDropdown(isOpen ? null : 'quickcreate');
  const close = () => setActiveDropdown(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        className={`
          relative flex items-center justify-center w-10 h-10 rounded-xl
          text-white transition-all duration-300 ease-out
          shadow-[0_2px_8px_rgba(11,130,82,0.35)]
          hover:shadow-[0_4px_16px_rgba(11,130,82,0.45)] hover:scale-110
          active:scale-95
          ${isOpen
            ? 'bg-gradient-to-br from-[#096b43] to-[#064e31]'
            : 'bg-gradient-to-br from-[#0b8252] to-[#0a7048]'
          }
        `}
        aria-expanded={isOpen}
        aria-label="Quick create menu"
      >
        <span
          className={`material-symbols-outlined text-[22px] transition-transform duration-300 ease-out ${isOpen ? 'rotate-45' : 'rotate-0'}`}
        >
          add
        </span>
        <span className="absolute inset-0 rounded-xl border-2 border-white/0 hover:border-white/20 transition-all duration-300" />
      </button>

      {isOpen && (
        <div
          className="absolute right-[-14rem] top-[3.2rem] z-50 w-[44rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-gradient-to-r from-[#f0fdf4] via-white to-white">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0b8252]/10">
                <span className="material-symbols-outlined text-[18px] text-[#0b8252]">bolt</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Quick Create</p>
                <p className="text-[11px] text-slate-500">Jump to any action instantly</p>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-all duration-150"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-4 gap-0 divide-x divide-slate-100/80">
            {quickCreateCategories.map((category) => (
              <div key={category.label} className="p-4">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br ${category.bg}`}>
                    <span className="material-symbols-outlined text-[14px]" style={{ color: category.color }}>{category.icon}</span>
                  </div>
                  <span className="text-[10px] font-extrabold tracking-[0.08em] uppercase" style={{ color: category.color }}>{category.label}</span>
                </div>

                <div className="space-y-0.5">
                  {category.items.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => { close(); navigate(item.path); }}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-slate-600 hover:bg-[#f0fdf4] hover:text-[#0b8252] transition-all duration-150 group"
                    >
                      <span className="material-symbols-outlined text-[17px] text-slate-400 group-hover:text-[#0b8252] transition-colors">{item.icon}</span>
                      <span className="text-[12.5px] font-medium leading-tight">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 flex items-center justify-between">
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">keyboard</span>
              Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-500">Esc</kbd> to close
            </p>
            <button
              type="button"
              onClick={() => { close(); navigate('/admin'); }}
              className="text-[11px] font-semibold text-[#0b8252] hover:text-[#096b43] hover:underline flex items-center gap-1 transition-colors"
            >
              Go to Dashboard
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SUB-COMPONENT: NOTIFICATION DROPDOWN
   ────────────────────────────────────────────────────────────────────────── */
function NotificationDropdown({ activeDropdown, setActiveDropdown }: { activeDropdown: string | null; setActiveDropdown: (name: string | null) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isOpen = activeDropdown === 'notifications';

  const toggle = () => setActiveDropdown(isOpen ? null : 'notifications');
  const close = () => setActiveDropdown(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        className="
          relative flex items-center justify-center w-10 h-10 rounded-xl
          text-slate-600 bg-slate-50 border border-slate-200/80
          hover:bg-white hover:border-slate-300 hover:text-[#0b8252] hover:shadow-sm
          active:scale-95 transition-all duration-200
        "
        aria-expanded={isOpen}
        aria-label="Open notifications"
      >
        <span className="material-symbols-outlined text-[22px]">notifications</span>
        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white" />
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-[3.2rem] z-50 w-[23rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-gradient-to-r from-[#f0fdf4] via-white to-white">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0b8252]/10">
                <span className="material-symbols-outlined text-[18px] text-[#0b8252]">notifications_active</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Smart Alerts</p>
                <p className="text-[11px] text-slate-500">{notifications.length} active notifications</p>
              </div>
            </div>
            <button type="button" onClick={close} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-all duration-150">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto p-2.5 space-y-1.5">
            {notifications.map((n) => {
              const config = severityConfig[n.severity];
              return (
                <div
                  key={n.title}
                  className="rounded-xl border border-slate-100 bg-white hover:bg-slate-50/80 p-3 transition-colors duration-150 cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex items-center justify-center w-7 h-7 rounded-lg ${config.badge} border shrink-0`}>
                      <span className="material-symbols-outlined text-[15px]">{config.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold leading-snug text-slate-800 group-hover:text-[#0b8252] transition-colors">{n.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">{n.subtitle}</p>
                      <p className="mt-1.5 text-[10px] text-slate-400 font-medium">{n.time}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide border ${config.badge}`}>{config.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50/60 p-2.5">
            <button
              type="button"
              onClick={() => { close(); navigate('/alerts'); }}
              className="
                inline-flex w-full items-center justify-center gap-2
                rounded-xl bg-gradient-to-r from-[#0b8252] to-[#0a7048]
                px-4 py-2.5 text-[13px] font-bold text-white
                shadow-sm hover:shadow-md hover:from-[#096b43] hover:to-[#085e3a]
                active:scale-[0.98] transition-all duration-200
              "
            >
              Open Alerts Center
              <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SUB-COMPONENT: PROFILE DROPDOWN
   ────────────────────────────────────────────────────────────────────────── */
function ProfileDropdown({ activeDropdown, setActiveDropdown }: { activeDropdown: string | null; setActiveDropdown: (name: string | null) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isOpen = activeDropdown === 'profile';

  const toggle = () => setActiveDropdown(isOpen ? null : 'profile');
  const close = () => setActiveDropdown(null);

  const userName = user?.name || 'User';
  const userRole = user?.role ? formatRole(user.role) : 'Team Member';
  const userEmail = user?.email || '';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0b8252&color=fff&bold=true&size=128`;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        className={`
          flex items-center gap-2.5 px-2 py-1.5 rounded-xl
          cursor-pointer group transition-all duration-200
          hover:bg-slate-50 active:scale-[0.97]
          ${isOpen ? 'bg-slate-50 shadow-sm' : ''}
        `}
        aria-expanded={isOpen}
        aria-label="Profile menu"
      >
        <div className="text-right hidden md:block">
          <p className="text-[13px] font-bold leading-tight text-slate-800 group-hover:text-[#0b8252] transition-colors">{userName}</p>
          <p className="text-[10.5px] font-medium text-slate-500">{userRole}</p>
        </div>
        <div className="relative">
          <img src={avatarUrl} alt={userName} className="w-9 h-9 rounded-full border-2 border-[#34d399] object-cover shadow-sm" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
        </div>
        <span className={`material-symbols-outlined text-[15px] text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-[3.2rem] z-50 w-[17.5rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="px-4 pt-5 pb-4 bg-gradient-to-br from-[#f0fdf4] via-[#ecfdf5] to-white border-b border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <img src={avatarUrl} alt={userName} className="w-14 h-14 rounded-full border-[3px] border-[#34d399] shadow-lg" />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-[2.5px] border-white rounded-full" />
              </div>
              <p className="text-[15px] font-bold text-slate-800">{userName}</p>
              <p className="text-[11.5px] text-slate-500 mt-0.5">{userEmail}</p>
              <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.06em] bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {userRole}
              </span>
            </div>
          </div>

          {/* Menu */}
          <div className="py-1.5 px-1.5 space-y-0.5">
            <button
              type="button"
              onClick={() => { close(); navigate('/admin/settings?tab=My Profile'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-[#f0fdf4] hover:text-[#0b8252] transition-all duration-150 group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-100 transition-colors">
                <span className="material-symbols-outlined text-[18px] text-slate-500 group-hover:text-[#0b8252] transition-colors">person</span>
              </div>
              <div className="text-left">
                <p className="text-[12.5px] font-semibold">My Profile</p>
                <p className="text-[10.5px] text-slate-400">View and edit your details</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { close(); navigate('/admin/settings?tab=Account Settings'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-[#f0fdf4] hover:text-[#0b8252] transition-all duration-150 group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-100 transition-colors">
                <span className="material-symbols-outlined text-[18px] text-slate-500 group-hover:text-[#0b8252] transition-colors">settings</span>
              </div>
              <div className="text-left">
                <p className="text-[12.5px] font-semibold">Account Settings</p>
                <p className="text-[10.5px] text-slate-400">Preferences & security</p>
              </div>
            </button>


          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => { close(); logout(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                <span className="material-symbols-outlined text-[18px] text-red-400 group-hover:text-red-600 transition-colors">logout</span>
              </div>
              <div className="text-left">
                <p className="text-[12.5px] font-semibold">Logout</p>
                <p className="text-[10.5px] text-red-300 group-hover:text-red-400">End your session</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   MAIN ORCHESTRATOR COMPONENT: ADMIN HEADER
   ────────────────────────────────────────────────────────────────────────── */
export default function AdminHeader({ children }: AdminHeaderProps) {
  const [time, setTime] = useState(new Date());
  // Single active state to make sure only ONE dropdown is open at a time
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate breadcrumb path automatically based on current location
  const getBreadcrumbs = () => {
    if (currentPath === '/admin') {
      return (
        <span className="text-[14.5px] font-extrabold text-[#0b8252] tracking-tight">Admin Control</span>
      );
    }

    let pageLabel = '';
    if (currentPath.startsWith('/manage-products')) {
      pageLabel = 'Product Catalog';
    } else if (currentPath.startsWith('/inventory-analytics')) {
      pageLabel = 'Analytics';
    } else if (currentPath.startsWith('/inventory-operations')) {
      pageLabel = 'Stock Operations';
    } else if (currentPath.startsWith('/inventory-adjustments')) {
      pageLabel = 'Adjustments';
    } else if (currentPath.startsWith('/procurement') || currentPath.startsWith('/suppliers')) {
      pageLabel = 'Procurement';
    } else if (currentPath.startsWith('/stock-movements')) {
      pageLabel = 'Stock Movements';
    } else if (currentPath.startsWith('/alerts')) {
      pageLabel = 'Alerts';
    } else if (currentPath.startsWith('/reports')) {
      pageLabel = 'Reports';
    } else if (currentPath.startsWith('/settings')) {
      pageLabel = 'Settings';
    } else if (currentPath.startsWith('/categories')) {
      pageLabel = 'Categories';
    } else {
      const segments = currentPath.split('/').filter(Boolean);
      if (segments.length > 0) {
        pageLabel = segments[segments.length - 1]
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
      }
    }

    if (!pageLabel) {
      return <span className="text-[14.5px] font-extrabold text-[#0b8252] tracking-tight">Admin Control</span>;
    }

    return (
      <div className="flex items-center gap-1.5 text-[14.5px] font-semibold text-slate-500">
        <Link
          to="/admin"
          className="hover:text-[#0b8252] transition-colors cursor-pointer"
        >
          Admin Control
        </Link>
        <span className="material-symbols-outlined text-[15px] text-slate-400 select-none">chevron_right</span>
        <span className="text-[#0b8252] font-bold">{pageLabel}</span>
      </div>
    );
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 shrink-0 w-full z-30 sticky top-0">
      {/* Left side content (Breadcrumbs, Search, etc.) */}
      <div className="flex-1 flex items-center gap-4">
        {getBreadcrumbs()}
        {children}
      </div>

      {/* Right side global actions */}
      <div className="flex items-center gap-3">
        {/* Time Badge */}
        <div className="
          flex items-center gap-2 px-3.5 py-2 rounded-xl
          text-[13px] font-bold text-[#0b8252]
          bg-gradient-to-r from-[#f0fdf4] to-[#ecfdf5]
          border border-emerald-100/60 shadow-sm
        ">
          <span className="material-symbols-outlined text-[18px] opacity-70">schedule</span>
          <span className="tabular-nums tracking-tight">
            {time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Quick Create */}
        <QuickCreateDropdown activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />

        {/* Notifications */}
        <NotificationDropdown activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />

        {/* Separator */}
        <div className="h-8 w-px bg-slate-200/80 mx-0.5" />

        {/* Profile */}
        <ProfileDropdown activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
      </div>
    </header>
  );
}
