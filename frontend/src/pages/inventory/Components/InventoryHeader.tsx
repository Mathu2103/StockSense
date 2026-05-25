import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface InventoryHeaderProps {
  children?: React.ReactNode;
}

export default function InventoryHeader({ children }: InventoryHeaderProps) {
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    {
      title: 'Rice 5kg expected to run out in 3 days',
      subtitle: 'Reorder suggestion available',
      tone: 'bg-red-100 text-red-700',
      dot: 'bg-red-600',
    },
    {
      title: 'Milk Packet requires urgent restock',
      subtitle: 'Critical low-stock alert',
      tone: 'bg-amber-100 text-amber-700',
      dot: 'bg-amber-600',
    },
    {
      title: 'Supplier delays increasing stock risk',
      subtitle: 'Watch inventory intake schedule',
      tone: 'bg-blue-100 text-blue-700',
      dot: 'bg-blue-600',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 w-full z-10">
      
      {/* Left side content (Breadcrumbs, Search, etc.) */}
      <div className="flex-1 flex items-center">
        {children}
      </div>

      {/* Right side global actions */}
      <div className="flex items-center gap-5">
        {/* Time Badge */}
        <div className="flex items-center gap-2 bg-[#f0fdf4] px-3 py-1.5 rounded-lg text-sm font-bold text-[#0b8252] shadow-sm">
          <span className="material-symbols-outlined text-[20px]">schedule</span>
          {time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((value) => !value)}
            className="relative flex items-center text-slate-800 transition-colors hover:text-[#0b8252]"
            aria-expanded={showNotifications}
            aria-label="Open alerts preview"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute right-0 top-0 h-2 w-2 rounded-full border border-white bg-red-600"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-[22rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">Smart Alerts</p>
                  <p className="text-xs text-slate-500">Inventory manager notifications</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 transition-colors hover:text-slate-700"
                  aria-label="Close alerts preview"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="max-h-80 space-y-2 overflow-y-auto p-3">
                {notifications.map((notification) => (
                  <div key={notification.title} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${notification.dot}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-snug text-slate-800">{notification.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{notification.subtitle}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${notification.tone}`}>
                        Alert
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 bg-slate-50 p-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/alerts');
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b8252] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#096b43]"
                >
                  Open Alerts Center
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Info */}
        <button className="text-slate-800 hover:text-[#0b8252] transition-colors flex items-center">
          <span className="material-symbols-outlined text-[24px]">info</span>
        </button>
        
        {/* Separator */}
        <div className="h-8 w-px bg-slate-200 mx-1"></div>
        
        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold leading-tight text-slate-800 group-hover:text-[#0b8252] transition-colors">Alex Thompson</p>
            <p className="text-[11px] font-medium text-slate-500">Inventory Manager</p>
          </div>
          <img 
            src="https://ui-avatars.com/api/?name=Alex+Thompson&background=0b8252&color=fff" 
            alt="User" 
            className="w-9 h-9 rounded-full border-2 border-[#34d399] object-cover shadow-sm" 
          />
        </div>
      </div>
    </header>
  );
}
