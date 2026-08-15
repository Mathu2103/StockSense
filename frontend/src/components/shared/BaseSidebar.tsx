import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export interface NavLink {
  name: string;
  path: string;
  icon: string;
  isHeader?: boolean;
  subLinks?: NavLink[];
}

interface BaseSidebarProps {
  navLinks: NavLink[];
  isLinkActive: (path: string, currentPath: string, search: string) => boolean;
}

export default function BaseSidebar({ navLinks, isLinkActive }: BaseSidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const currentPath = location.pathname;

  // Track which submenus are expanded
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navLinks.forEach(link => {
      if (link.subLinks) {
        const hasActiveSublink = link.subLinks.some(sub => 
          isLinkActive(sub.path, currentPath, location.search)
        );
        if (hasActiveSublink) {
          initial[link.name] = true;
        }
      }
    });
    return initial;
  });

  const toggleSubmenu = (name: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-background border-r border-outline-variant flex flex-col shrink-0">
      
      {/* Brand Header */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary leading-tight tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px]">inventory</span>
          StockSense
        </h1>
        <p className="text-xs text-outline font-medium mt-1">Supermarket Management</p>
      </div>

      {/* Sidebar Links Scrollable Container */}
      <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
        <nav className="space-y-1.5 px-3">
          {navLinks.map((link) => {
            if (link.isHeader) {
              return (
                <div 
                  key={link.name} 
                  className="pt-4 pb-1.5 px-3 text-[10px] font-black uppercase text-outline tracking-wider select-none"
                >
                  {link.name}
                </div>
              );
            }

            // Accordion/Dropdown Submenu
            if (link.subLinks && link.subLinks.length > 0) {
              const isExpanded = !!expandedMenus[link.name];
              const isAnySubActive = link.subLinks.some(sub => 
                isLinkActive(sub.path, currentPath, location.search)
              );

              return (
                <div key={link.name} className="space-y-1">
                  <button
                    onClick={() => toggleSubmenu(link.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isAnySubActive
                        ? 'bg-secondary-container/50 text-primary'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined ${isAnySubActive ? 'text-primary' : 'text-outline-variant'}`}>
                        {link.icon}
                      </span>
                      <span className="text-sm">{link.name}</span>
                    </div>
                    <span 
                      className="material-symbols-outlined text-[18px] transition-transform duration-200"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      keyboard_arrow_down
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="pl-4 space-y-1 border-l border-outline-variant/30 ml-5 animate-in slide-in-from-top-2 duration-150">
                      {link.subLinks.map((sub) => {
                        const isSubActive = isLinkActive(sub.path, currentPath, location.search);
                        return (
                          <Link
                            key={sub.name}
                            to={sub.path}
                            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-medium text-xs transition-colors whitespace-nowrap border-l-4 ${
                              isSubActive
                                ? 'bg-secondary-container text-on-secondary-container border-primary font-bold'
                                : 'text-on-surface-variant hover:bg-surface-container border-transparent'
                            }`}
                          >
                            <span className={`material-symbols-outlined text-[16px] shrink-0 ${isSubActive ? 'text-primary' : 'text-outline-variant'}`}>
                              {sub.icon}
                            </span>
                            <span className="whitespace-nowrap">{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = isLinkActive(link.path, currentPath, location.search);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap border-l-4 ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container border-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container border-transparent'
                }`}
              >
                <span className={`material-symbols-outlined shrink-0 ${isActive ? 'text-primary' : 'text-outline-variant'}`}>
                  {link.icon}
                </span>
                <span className="text-sm whitespace-nowrap">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Logout */}
      <div className="p-4 border-t border-outline-variant">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-on-surface-variant font-medium hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
        >
          <span className="material-symbols-outlined text-outline-variant group-hover:text-red-500">logout</span>
          Logout
        </button>
      </div>

    </aside>
  );
}
