import { useState, useEffect } from 'react';
import { Phone, MessageSquare, Wrench, Menu, X, ShieldAlert, Download } from 'lucide-react';
import { WHATSAPP_PHONE, EMERGENCY_HOTLINE } from '../data/mockData';
import { PageType } from '../types';
import { triggerPWAInstall } from './PWAInstallPrompt';

interface NavbarProps {
  activePage: PageType;
  onNavigate: (page: PageType) => void;
  onOpenBooking: (serviceName?: string) => void;
}

export function Navbar({ activePage, onNavigate, onOpenBooking }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { name: string; page: PageType }[] = [
    { name: 'Beranda', page: 'beranda' },
    { name: 'Layanan Servis', page: 'layanan' },
    { name: 'Alur Proses', page: 'proses' },
    { name: 'Buku Servis Digital', page: 'buku-servis' },
    { name: 'Tips & Artikel', page: 'artikel' },
    { name: 'Testimoni', page: 'testimoni' },
    { name: 'About', page: 'about' },
  ];

  const handleNavClick = (page: PageType) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Emergency Ticker Bar */}
      <div id="top-emergency-bar" className="bg-red-50 text-slate-800 text-xs py-1.5 px-4 border-b border-red-100">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            <span className="font-bold text-red-600 tracking-wide uppercase">Siaga 24 Jam Non-Stop</span>
            <span className="hidden sm:inline text-slate-600">• Home Service di Rumah & Bengkel Panggilan Emergency Roadside</span>
          </div>
          
          <div className="flex items-center gap-4 text-slate-600">
            <a 
              href={`tel:${EMERGENCY_HOTLINE.replace(/[^0-9]/g, '')}`} 
              className="flex items-center gap-1.5 hover:text-red-600 transition-colors font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-red-600" />
              <span>Hotline: <strong className="text-slate-900">{EMERGENCY_HOTLINE}</strong></span>
            </a>
            <span className="text-slate-300 hidden md:inline">|</span>
            <span className="hidden md:inline-flex items-center text-emerald-600 text-xs font-semibold">
              Mekanik Siaga <strong className="text-slate-900 ml-0.5">&lt; 30 Mnt Tiba</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header 
        id="main-navbar"
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80'
            : 'bg-white/90 backdrop-blur-sm border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo */}
            <button 
              onClick={() => handleNavClick('beranda')}
              className="flex items-center gap-2.5 shrink-0 group focus:outline-none text-left"
            >
              <img
                src="https://i.ibb.co.com/JRGLV4Nx/LOGO-Univ.png"
                alt="FHRCAR Auto Services"
                className="h-10 sm:h-12 w-auto max-w-[170px] sm:max-w-[210px] object-contain transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
              />
            </button>

            {/* Desktop Navigation Links - Strictly single line, whitespace-nowrap */}
            <nav className="hidden lg:flex items-center gap-2 xl:gap-4 flex-nowrap shrink-0">
              {navLinks.map((link) => {
                const isActive = activePage === link.page || (link.page === 'artikel' && activePage === 'artikel-detail');
                return (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.page)}
                    className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'text-red-600 bg-red-50 font-bold'
                        : 'text-slate-700 hover:text-red-600 hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Items - Strictly single line */}
            <div className="hidden sm:flex items-center gap-2.5 shrink-0 flex-nowrap">
              {/* Install PWA App Button */}
              <button
                id="header-install-app-btn"
                onClick={triggerPWAInstall}
                title="Pasang Aplikasi FHRCAR di perangkat Anda"
                className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-bold transition-all border border-slate-200 hover:border-red-200 shadow-sm active:scale-95 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-red-600" />
                <span>Install App</span>
              </button>

              {/* Primary Booking Servis CTA - No Icon, Clean & Bold */}
              <button
                id="header-booking-btn"
                onClick={() => onOpenBooking()}
                className={`px-5 xl:px-6 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 whitespace-nowrap shrink-0 ${
                  activePage === 'booking'
                    ? 'bg-red-700 ring-2 ring-red-400 ring-offset-2 shadow-red-600/40'
                    : 'bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-red-600/30'
                }`}
              >
                <span className="whitespace-nowrap">Booking Servis</span>
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Halo%20Admin%20FHRCAR,%20saya%20butuh%20bantuan%20bengkel%20panggilan`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200"
                aria-label="Chat WhatsApp"
              >
                <MessageSquare className="w-5 h-5" />
              </a>
              
              <button
                id="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200"
                aria-label="Buka Menu Navigasi"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white/98 backdrop-blur-xl px-4 pt-2 pb-6 space-y-3 shadow-xl animate-fadeIn">
            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => {
                const isActive = activePage === link.page || (link.page === 'artikel' && activePage === 'artikel-detail');
                return (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.page)}
                    className={`w-full px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between text-left ${
                      isActive 
                        ? 'bg-red-50 text-red-600 font-bold'
                        : 'text-slate-800 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <span>{link.name}</span>
                    <span className="text-slate-400 text-xs">→</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  triggerPWAInstall();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md border border-slate-800 active:scale-[0.98]"
              >
                <Download className="w-4 h-4 text-red-500" />
                <span>Install Aplikasi FHRCAR (PWA)</span>
              </button>

              <a
                href={`tel:${EMERGENCY_HOTLINE.replace(/[^0-9]/g, '')}`}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md shadow-red-600/30 active:scale-[0.98]"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Panggilan Darurat (Hotline 24 Jam)</span>
              </a>
              
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 text-slate-900 font-bold text-sm border border-slate-200 active:scale-[0.98]"
              >
                <Wrench className="w-4 h-4 text-red-600" />
                <span>Form Booking Home Service</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
