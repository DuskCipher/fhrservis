import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Wrench, Package, ShoppingCart, Users, BarChart2,
  UserSquare2, ClipboardList, MessageSquare, HelpCircle, ChevronDown,
  ChevronRight, LogOut, Menu, X, Bell, Settings, Search, ChevronLeft,
  UserCircle, Building2, FileText
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { PageType } from '../../types';

interface CRMLayoutProps {
  activePage: PageType;
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  children?: { id: PageType; label: string }[];
  page?: PageType;
}

const navItems: NavItem[] = [
  {
    id: 'service-order',
    label: 'Service Order',
    icon: Wrench,
    badge: 3,
    children: [
      { id: 'crm-orders', label: 'Daftar SPK' },
      { id: 'crm-dashboard', label: 'Booking Area' },
    ]
  },
  {
    id: 'inventory',
    label: 'Stok Barang',
    icon: Package,
    children: [{ id: 'crm-dashboard', label: 'Inventory' }]
  },
  {
    id: 'purchasing',
    label: 'Pembelian',
    icon: ShoppingCart,
    children: [{ id: 'crm-dashboard', label: 'Purchasing & Vendor' }]
  },
  {
    id: 'customer',
    label: 'Pelanggan',
    icon: Users,
    children: [
      { id: 'crm-customers', label: 'Data Pelanggan & Mobil' },
      { id: 'crm-orders', label: 'Riwayat SPK' },
    ]
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: BarChart2,
    children: [{ id: 'crm-dashboard', label: 'Analitik & Laporan' }]
  },
  {
    id: 'hrd',
    label: 'HRD',
    icon: UserSquare2,
    children: [{ id: 'crm-dashboard', label: 'Karyawan & Absensi' }]
  },
  {
    id: 'crm-menu',
    label: 'CRM',
    icon: UserSquare2,
    children: [{ id: 'crm-dashboard', label: 'Manajemen Pelanggan' }]
  },
  { id: 'dap',     label: 'Activity Plan (DAP)',       icon: ClipboardList, page: 'crm-dashboard' },
  { id: 'lpa',     label: 'Lembar Pemeriksaan (LPA)',  icon: FileText,      page: 'crm-lpa' },
  { id: 'diskusi', label: 'Diskusi',                   icon: MessageSquare, badge: 5, page: 'crm-dashboard' },
  { id: 'bantuan', label: 'Bantuan',                   icon: HelpCircle,    page: 'crm-dashboard' },
];

export function CRMLayout({ activePage, onNavigate, onLogout, children }: CRMLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // ── Accordion: only ONE group open at a time ──────────────────────────
  const getInitialOpenGroup = (): string | null => {
    const found = navItems.find(item => item.children?.some(c => c.id === activePage));
    return found ? found.id : null;
  };
  const [openGroup, setOpenGroup] = useState<string | null>(getInitialOpenGroup);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Accordion: click same → close; click different → open that one, close rest
  const toggleGroup = (id: string) => {
    setOpenGroup(prev => (prev === id ? null : id));
  };

  const handleNavClick = (page: PageType) => {
    onNavigate(page);
    setSidebarOpen(false);
  };

  // Dashboard click: close all groups
  const handleDashboardClick = () => {
    setOpenGroup(null);
    handleNavClick('crm-dashboard');
  };

  const sidebarW = collapsed ? 'w-16' : 'w-60';

  return (
    <div className="h-screen overflow-hidden bg-[#f4f6fb] flex font-sans print:h-auto print:overflow-visible print:bg-white">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden print:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ─────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 ${sidebarW} bg-[#1a2035] flex flex-col h-full
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex flex-shrink-0
        print:hidden
      `}>

        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-white/5 flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'px-5 gap-3'}`}>
          <img
            src="/logo-putih.png"
            alt="FHRCAR"
            className={`object-contain flex-shrink-0 ${collapsed ? 'h-8 w-8' : 'h-8 w-auto max-w-[130px]'}`}
          />
          {!collapsed && (
            <button className="ml-auto text-white/30 hover:text-white/70 transition-colors hidden lg:block" onClick={() => setCollapsed(true)}>
              <ChevronLeft size={16} />
            </button>
          )}
          {collapsed && (
            <button
              className="absolute right-[-12px] top-[26px] w-6 h-6 rounded-full bg-[#1a2035] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hidden lg:flex"
              onClick={() => setCollapsed(false)}
            >
              <ChevronRight size={12} />
            </button>
          )}
          <button className="lg:hidden ml-auto text-white/50" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Branch info */}
        {!collapsed && (
          <div className="px-4 py-2 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">Cabang Aktif</p>
                <p className="text-xs text-white/80 font-semibold truncate">Cabang Utama</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">

          {/* Dashboard */}
          <button
            onClick={handleDashboardClick}
            title="Dashboard"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition-all
              ${activePage === 'crm-dashboard' && openGroup === null
                ? 'bg-red-600 text-white'
                : 'text-white/50 hover:bg-white/[0.08] hover:text-white'}
              ${collapsed ? 'justify-center' : ''}`}
          >
            <LayoutDashboard size={17} className="flex-shrink-0" />
            {!collapsed && <span>Dashboard</span>}
          </button>

          {/* Section label */}
          {!collapsed && (
            <p className="px-3 pt-3 pb-1 text-[10px] font-bold text-white/25 uppercase tracking-widest">
              Operasional
            </p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isOpen = openGroup === item.id;
            const isGroupActive = item.children?.some(c => c.id === activePage);

            // Direct-page items (no sub-menu)
            if (item.page) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.page!)}
                  title={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition-all relative
                    text-white/50 hover:bg-white/[0.08] hover:text-white
                    ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon size={17} className="flex-shrink-0" />
                  {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">{item.badge}</span>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>
              );
            }

            return (
              <div key={item.id}>
                {/* Group header */}
                <button
                  onClick={() => !collapsed && toggleGroup(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition-all relative
                    ${isOpen || isGroupActive
                      ? 'bg-white/[0.1] text-white'
                      : 'text-white/50 hover:bg-white/[0.08] hover:text-white'}
                    ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon size={17} className="flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">{item.badge}</span>
                      )}
                      <ChevronDown
                        size={13}
                        className={`text-white/30 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>

                {/* Sub-menu — WHITE background, accordion */}
                {!collapsed && isOpen && item.children && (
                  <div className="mx-1 mt-0.5 mb-1 bg-white rounded-xl overflow-hidden shadow-md border border-slate-200/80">
                    {item.children.map((child) => {
                      const isChildActive = activePage === child.id;
                      return (
                        <button
                          key={child.id + child.label}
                          onClick={() => handleNavClick(child.id)}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-all text-left
                            ${isChildActive
                              ? 'bg-red-600 text-white font-bold'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isChildActive ? 'bg-white' : 'bg-slate-300'}`} />
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className={`border-t border-white/5 p-3 flex-shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin'}</p>
                <p className="text-[10px] text-white/40 truncate">{currentUser?.email || 'admin@fhrcar.com'}</p>
              </div>
              <button onClick={onLogout} title="Keluar" className="text-white/30 hover:text-red-400 transition-colors">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button onClick={onLogout} title="Keluar" className="text-white/30 hover:text-red-400 transition-colors">
              <LogOut size={17} />
            </button>
          )}
        </div>
      </aside>

      {/* ─── Main ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden print:h-auto print:overflow-visible">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-200/80 h-14 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0 sticky top-0 z-30 print:hidden">
          <button className="lg:hidden text-slate-500 hover:text-slate-900" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="relative hidden sm:flex items-center">
            <Search size={15} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari SPK, pelanggan, plat nomor..."
              className="pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all placeholder-slate-400"
            />
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1.5">
            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
              <Settings size={18} />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs uppercase">
                    {(currentUser?.displayName || currentUser?.email || 'A')[0].toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin'}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">Super Admin</p>
                </div>
                <ChevronDown size={13} className={`text-slate-400 hidden sm:block transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-slate-200 overflow-hidden z-50 shadow-xl shadow-slate-200/60">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm uppercase">
                          {(currentUser?.displayName || currentUser?.email || 'A')[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                      <UserCircle size={15} className="text-slate-400" /> Profil Akun
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                      <Building2 size={15} className="text-slate-400" /> Pengaturan Bengkel
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                      <Settings size={15} className="text-slate-400" /> Pengaturan Akun
                    </button>
                  </div>
                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={() => { setDropdownOpen(false); onLogout(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto print:overflow-visible print:h-auto print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
