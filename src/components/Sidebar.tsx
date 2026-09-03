import React, { useEffect } from 'react';
import { X, LayoutDashboard, FileText, Package } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'bom' | 'inventory';
  onTabChange: (tab: 'dashboard' | 'bom' | 'inventory') => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bom' as const, label: 'BOM', icon: FileText },
    { id: 'inventory' as const, label: 'Inventory', icon: Package },
  ];

  // Allow the Escape key to close the drawer.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop: only visible while the navigation drawer is open. */}
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Navigation drawer. It overlays the page instead of consuming permanent width. */}
      <aside
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[86vw] flex-col bg-[#0a1128] shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-slate-700/50 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-950/30">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight text-white">RUDRA</div>
              <div className="text-[10px] tracking-wider text-blue-300">ELECTRICALS</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-5" aria-label="Application sections">
          <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Navigation
          </div>

          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/20'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer card */}
        <div className="m-3 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 p-4 text-white shadow-lg">
          <div className="text-sm font-bold">Rudra Electricals</div>
          <div className="mt-1 text-xs text-blue-100">Making Electronics Better</div>
        </div>
      </aside>
    </>
  );
}
