import React, { useState, useEffect } from 'react';

interface InventoryHeaderProps {
  children?: React.ReactNode;
}

export default function InventoryHeader({ children }: InventoryHeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
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
        <button className="relative text-slate-800 hover:text-[#0b8252] transition-colors flex items-center">
          <span className="material-symbols-outlined text-[24px]">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full border border-white"></span>
        </button>
        
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
