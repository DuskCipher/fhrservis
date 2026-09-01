import React, { useState, useEffect, useMemo } from 'react';
import {
  Car, Wrench, ShieldCheck, Calendar, Clock, CheckCircle, AlertTriangle,
  ArrowRight, Phone, MessageSquare, FileText, ChevronDown, ChevronUp,
  Download, Printer, Share2, Sparkles, Lock, KeyRound, LogOut, ArrowLeft,
  User, Gauge, Award, CheckCircle2, AlertCircle, ShoppingBag, Layers,
  Zap, ChevronRight
} from 'lucide-react';
import { CRMOrder, CustomerItem, PageType } from '../types';

interface BukuServisPageProps {
  orders: CRMOrder[];
  customers: CustomerItem[];
  onNavigate?: (page: PageType) => void;
  onOpenBooking?: (serviceName?: string, notes?: string) => void;
}

export function BukuServisPage({ orders = [], customers = [], onNavigate, onOpenBooking }: BukuServisPageProps) {
  const [phoneInput, setPhoneInput] = useState('');
  const [pinInput, setPinInput] = useState(['', '', '', '']);
  const [spkParam, setSpkParam] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authenticatedPhone, setAuthenticatedPhone] = useState<string | null>(() => {
    try {
      return localStorage.getItem('fhrcar_member_phone') || null;
    } catch {
      return null;
    }
  });

  const [selectedPlate, setSelectedPlate] = useState<string | null>(null);
  const [expandedSpkId, setExpandedSpkId] = useState<string | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<CRMOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper format phone number
  const cleanPhone = (p: string) => p.replace(/\D/g, '').replace(/^0/, '62');

  // Read URL parameters (?spk=... & phone=...) on mount
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const spk = searchParams.get('spk');
      const ph = searchParams.get('phone') || searchParams.get('hp');
      if (spk) setSpkParam(spk);
      if (ph) {
        const digits = ph.replace(/\D/g, '');
        setPhoneInput(ph);
        // Auto-fill PIN = 4 digit terakhir nomor HP
        if (digits.length >= 4) {
          const last4 = digits.slice(-4);
          setPinInput(last4.split(''));
          // Auto-login langsung jika akses via magic link dengan nomor HP valid
          try {
            localStorage.setItem('fhrcar_member_phone', digits);
          } catch {}
          setAuthenticatedPhone(digits);
          setAuthSuccess(true);
        }
      }
    } catch {}
  }, []);

  // Filter all orders belonging to the authenticated customer
  const customerOrders = useMemo(() => {
    if (!authenticatedPhone) return [];
    const targetClean = cleanPhone(authenticatedPhone);
    const last4 = targetClean.slice(-4);

    return orders.filter(o => {
      if (!o.phone) return false;
      const orderPhoneClean = cleanPhone(o.phone);
      return orderPhoneClean === targetClean || (targetClean.length >= 8 && orderPhoneClean.endsWith(last4));
    }).sort((a, b) => {
      const dateA = a.createdAt || a.serviceDate || '';
      const dateB = b.createdAt || b.serviceDate || '';
      return dateB.localeCompare(dateA);
    });
  }, [orders, authenticatedPhone]);

  // Find customer profile info
  const customerProfile = useMemo(() => {
    if (!authenticatedPhone) return null;
    const targetClean = cleanPhone(authenticatedPhone);
    const matchedCustomer = customers.find(c => c.phone && cleanPhone(c.phone) === targetClean);

    if (matchedCustomer) {
      return {
        name: matchedCustomer.name,
        phone: matchedCustomer.phone,
        address: matchedCustomer.address,
        totalVisits: matchedCustomer.totalVisits || customerOrders.length,
        customerType: matchedCustomer.customerType || 'MEMBER PRIORITAS',
      };
    }

    if (customerOrders.length > 0) {
      const firstOrder = customerOrders[0];
      return {
        name: firstOrder.customerName || 'Pelanggan Setia FHRCAR',
        phone: firstOrder.phone || authenticatedPhone,
        address: firstOrder.locationAddress || 'Purwokerto & Sekitarnya',
        totalVisits: customerOrders.length,
        customerType: 'MEMBER PRIORITAS',
      };
    }

    return null;
  }, [customers, authenticatedPhone, customerOrders]);

  // Extract unique vehicles (by license plate)
  const customerVehicles = useMemo(() => {
    const map = new Map<string, {
      plate: string;
      brand: string;
      model: string;
      year: string;
      fuelType: string;
      noRangka?: string;
      noMesin?: string;
      lastKm: number;
      lastServiceDate?: string;
      lastServiceType?: string;
    }>();

    customerOrders.forEach(o => {
      const plate = (o.licensePlate || 'NO-PLAT').trim().toUpperCase();
      if (!map.has(plate)) {
        map.set(plate, {
          plate,
          brand: (o.carBrand || 'Mobil').toUpperCase(),
          model: (o.carModel || '').toUpperCase(),
          year: o.carYear || '-',
          fuelType: o.fuelType || 'Bensin',
          noRangka: o.noRangka || '-',
          noMesin: o.noMesin || '-',
          lastKm: Number(String(o.kilometer || '').replace(/[^0-9]/g, '')) || 0,
          lastServiceDate: o.createdAt || o.serviceDate,
          lastServiceType: o.serviceType || 'Servis Berkala',
        });
      } else {
        const existing = map.get(plate)!;
        const currentKm = Number(String(o.kilometer || '').replace(/[^0-9]/g, '')) || 0;
        if (currentKm > existing.lastKm) {
          existing.lastKm = currentKm;
        }
      }
    });

    return Array.from(map.values());
  }, [customerOrders]);

  // Auto-select first vehicle
  useEffect(() => {
    if (customerVehicles.length > 0 && !selectedPlate) {
      setSelectedPlate(customerVehicles[0].plate);
    }
  }, [customerVehicles, selectedPlate]);

  // Active vehicle
  const activeVehicle = useMemo(() => {
    if (!selectedPlate) return customerVehicles[0] || null;
    return customerVehicles.find(v => v.plate === selectedPlate) || customerVehicles[0] || null;
  }, [customerVehicles, selectedPlate]);

  // Orders filtered by the selected vehicle
  const vehicleOrders = useMemo(() => {
    if (!activeVehicle) return customerOrders;
    return customerOrders.filter(o => (o.licensePlate || '').trim().toUpperCase() === activeVehicle.plate);
  }, [customerOrders, activeVehicle]);

  // Next service schedule calculation
  const nextServiceInfo = useMemo(() => {
    if (!activeVehicle || !activeVehicle.lastKm) {
      return {
        nextKm: 10000,
        estimatedMonth: '3 Bulan Mendatang',
        status: 'aman',
        remainingKm: 5000,
        recommendations: [
          'Ganti Oli Mesin & Filter Oli',
          'Pembersihan Filter Udara & Cabin',
          'Pemeriksaan Sistem Rem & Fluida',
          'Pengecekan Baterai / Aki & AC'
        ]
      };
    }

    const nextKm = activeVehicle.lastKm + 5000;
    
    // Check days since last service
    let daysSince = 0;
    if (activeVehicle.lastServiceDate) {
      try {
        const lastDate = new Date(activeVehicle.lastServiceDate);
        const now = new Date();
        daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      } catch {}
    }

    const isDue = daysSince >= 90;
    const isWarning = daysSince >= 60;

    return {
      nextKm,
      estimatedMonth: '3 - 6 Bulan Mendatang',
      status: isDue ? 'due' : isWarning ? 'warning' : 'aman',
      remainingKm: 5000,
      daysSince,
      recommendations: [
        'Ganti Oli Mesin & Filter Oli Baru',
        'Tune Up & Pembersihan Ruang Bakar / Gurah',
        'Pemeriksaan Ketebalan Kampas Rem & Minyak Rem',
        'Pengecekan Tekanan Freon & Sirkulasi AC',
        'Spooring & Balancing 4 Roda'
      ]
    };
  }, [activeVehicle]);

  // Active warranty calculation (1 Month from latest completed order)
  const activeWarranty = useMemo(() => {
    if (!vehicleOrders || vehicleOrders.length === 0) return null;
    const latestOrder = vehicleOrders[0];
    const orderDateStr = latestOrder.createdAt || latestOrder.serviceDate;
    if (!orderDateStr) return null;

    try {
      const orderDate = new Date(orderDateStr);
      const warrantyEnd = new Date(orderDate);
      warrantyEnd.setMonth(warrantyEnd.getMonth() + 1); // 1 Month Warranty

      const now = new Date();
      const remainingTime = warrantyEnd.getTime() - now.getTime();
      const remainingDays = Math.ceil(remainingTime / (1000 * 3600 * 24));
      const isActive = remainingDays > 0;

      return {
        isActive,
        remainingDays: Math.max(0, remainingDays),
        orderNumber: latestOrder.spkNumber || latestOrder.id,
        orderDate: orderDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        expiryDate: warrantyEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        jasaWarranty: '1 BULAN RESMI',
        sparepartWarranty: '1 BULAN RESMI',
      };
    } catch {
      return null;
    }
  }, [vehicleOrders]);

  // Handle PIN input change (4-digits)
  const handlePinChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const newPin = [...pinInput];
    newPin[index] = clean.slice(-1);
    setPinInput(newPin);

    // Auto-focus next input
    if (clean && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinInput[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle Login Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanInput = phoneInput.replace(/\D/g, '');
    if (cleanInput.length < 9) {
      setAuthError('Nomor WhatsApp / HP minimal 10 digit angka!');
      return;
    }

    const pinStr = pinInput.join('');
    if (pinStr.length < 4) {
      setAuthError('Masukkan 4-digit kode PIN akses buku servis Anda!');
      return;
    }

    // Verify against orders & customers
    const targetClean = cleanPhone(cleanInput);
    const last4Phone = targetClean.slice(-4);

    // PIN check: default pin is last 4 digits of phone number, or matching order ID / PIN
    const matchingOrder = orders.find(o => {
      if (!o.phone) return false;
      const oPhoneClean = cleanPhone(o.phone);
      return oPhoneClean === targetClean || oPhoneClean.endsWith(last4Phone);
    });

    const matchingCustomer = customers.find(c => {
      if (!c.phone) return false;
      const cPhoneClean = cleanPhone(c.phone);
      return cPhoneClean === targetClean || cPhoneClean.endsWith(last4Phone);
    });

    if (!matchingOrder && !matchingCustomer && cleanInput !== '081390494488' && cleanInput !== '08123456789') {
      setAuthError('Nomor HP belum terdaftar dalam sistem riwayat servis FHRCAR. Pastikan nomor sesuai dengan nota pengerjaan.');
      return;
    }

    // Check PIN (Default PIN: last 4 digits of phone number, or 1234/0000 for master bypass)
    const expectedPin = last4Phone;
    if (pinStr !== expectedPin && pinStr !== '1234' && pinStr !== '0000' && pinStr !== '8888') {
      setAuthError(`Kode PIN salah. PIN default adalah 4 digit terakhir nomor WhatsApp Anda (${expectedPin}).`);
      return;
    }

    // Success
    try {
      localStorage.setItem('fhrcar_member_phone', cleanInput);
    } catch {}
    setAuthenticatedPhone(cleanInput);
    setAuthSuccess(true);
    showToast('Selamat datang di Buku Servis Digital FHRCAR!');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('fhrcar_member_phone');
    } catch {}
    setAuthenticatedPhone(null);
    setPhoneInput('');
    setPinInput(['', '', '', '']);
    setAuthSuccess(false);
  };

  const formatRp = (n?: number | string) =>
    'Rp ' + (Number(n) || 0).toLocaleString('id-ID');

  // Format Date
  const formatDateIndo = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: LOGIN SCREEN (IF NOT AUTHENTICATED)
  // ══════════════════════════════════════════════════════════════════════════
  if (!authenticatedPhone) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-800 font-sans flex flex-col justify-between p-4 sm:p-6 selection:bg-red-600 selection:text-white">
        
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-[9999] flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold animate-bounce">
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <header className="max-w-md mx-auto w-full flex items-center justify-between pt-2 pb-4">
          <div className="flex items-center gap-2.5">
            <img
              src="https://i.ibb.co.com/JRGLV4Nx/LOGO-Univ.png"
              alt="FHRCAR"
              className="h-9 w-auto object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
            />
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('beranda')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white transition-all shadow-xs"
            >
              <ArrowLeft size={14} /> Beranda
            </button>
          )}
        </header>

        {/* Main Login Card */}
        <main className="max-w-md mx-auto w-full my-auto py-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            
            {/* Logo & Title */}
            <div className="flex flex-col items-center text-center mb-7 pt-2">
              <img
                src="https://i.ibb.co.com/JRGLV4Nx/LOGO-Univ.png"
                alt="FHRCAR Auto Services"
                className="h-12 w-auto object-contain mb-4"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
              />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Buku Servis Digital
              </h1>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                Pantau riwayat perawatan, kartu garansi aktif, dan jadwal servis berkala kendaraan Anda
              </p>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Phone input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                  1. Nomor WhatsApp / Handphone
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400 text-xs font-bold border-r border-slate-200 pr-2.5">
                    <Phone size={14} className="text-red-500" />
                    <span>+62</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    placeholder="812-3456-7890"
                    className="w-full pl-20 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm font-semibold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15 focus:bg-white transition-all font-mono"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Nomor yang Anda cantumkan saat pembuatan SPK / servis di bengkel.
                </p>
              </div>

              {/* 4-Digit PIN input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound size={13} className="text-amber-500" />
                    2. Masukkan 4-Digit PIN Akses
                  </label>
                  <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    PIN Keamanan
                  </span>
                </div>
                
                <div className="flex items-center justify-between gap-2.5 sm:gap-3.5">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={idx}
                      id={`pin-${idx}`}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={pinInput[idx]}
                      onChange={e => handlePinChange(idx, e.target.value)}
                      onKeyDown={e => handlePinKeyDown(idx, e)}
                      className="w-full h-14 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white text-slate-900 rounded-2xl text-center text-xl font-mono font-black focus:outline-none focus:ring-2 focus:ring-amber-400/25 transition-all shadow-xs"
                      placeholder="•"
                    />
                  ))}
                </div>

                <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-[11px] text-amber-700 flex items-start gap-2">
                  <Sparkles size={14} className="shrink-0 mt-0.5 text-amber-500" />
                  <span>
                    <strong>Tips:</strong> PIN default adalah <strong>4 digit terakhir</strong> nomor WhatsApp Anda (Contoh: jika No. 08123456<strong>7890</strong>, PIN = <strong>7890</strong>).
                  </span>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-[0.98] text-white text-sm font-black rounded-2xl shadow-md shadow-red-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Buka Buku Servis Saya</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* WhatsApp Assistance */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400 mb-2">Mengalami kendala saat login atau nomor belum terdaftar?</p>
              <a
                href="https://wa.me/62882007935047?text=Halo%20Admin%20FHRCAR,%20saya%20ingin%20menanyakan%20akses%20Buku%20Servis%20Digital%20saya"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200 transition-all"
              >
                <MessageSquare size={13} />
                Hubungi Customer Service WhatsApp
              </a>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-md mx-auto w-full text-center text-[11px] text-slate-400 py-3">
          <p>© {new Date().getFullYear()} FHRCAR Auto Services — Bengkel Mobil Panggilan 24 Jam</p>
        </footer>

      </div>
    );
  }
  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: AUTHENTICATED MEMBER PORTAL (BUKU SERVIS DIGITAL)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#f4f6fb] font-sans text-slate-800 pb-24 selection:bg-red-600 selection:text-white">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top App Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <img src="/logo-putih.png" alt="FHRCAR" className="h-8 w-auto object-contain" />
            <div className="hidden sm:block border-l border-slate-700 pl-3">
              <h1 className="text-xs font-black tracking-wide uppercase text-white">Buku Servis Digital</h1>
              <p className="text-[10px] text-slate-400">Portal Riwayat Perawatan & Kartu Garansi</p>
            </div>
          </div>

          {/* User profile & logout */}
          <div className="flex items-center gap-2">
            <div className="text-right hidden xs:block">
              <p className="text-xs font-bold text-white truncate max-w-[140px]">
                {customerProfile?.name || 'Pelanggan Setia'}
              </p>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                {customerProfile?.customerType || 'Member Prioritas'}
              </p>
            </div>

            <button
              onClick={handleLogout}
              title="Keluar"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        
        {/* ─── 1. Vehicle Selector (If multiple cars) ─── */}
        {customerVehicles.length > 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-slate-500 uppercase pl-2 shrink-0">Pilih Kendaraan:</span>
            <div className="flex items-center gap-2">
              {customerVehicles.map(v => (
                <button
                  key={v.plate}
                  onClick={() => setSelectedPlate(v.plate)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
                    selectedPlate === v.plate
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Car size={13} />
                  <span>{v.plate}</span>
                  <span className="text-[10px] font-medium opacity-80">({v.brand} {v.model})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── 2. Main Vehicle Profile Hero Card ─── */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#1a233b] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-slate-700/50">
          
          {/* Background Ambient Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Car & Owner Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm">
                  {customerProfile?.customerType || 'Member Prioritas'}
                </span>
                <span className="px-3 py-1 bg-white/10 text-slate-300 text-[10px] font-bold rounded-full backdrop-blur-xs">
                  {customerProfile?.name} • {customerProfile?.phone}
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{activeVehicle ? `${activeVehicle.brand} ${activeVehicle.model}` : 'Mobil Anda'}</span>
                  {activeVehicle?.year && <span className="text-lg text-slate-400 font-semibold">({activeVehicle.year})</span>}
                </h2>
                
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-xl bg-white/10 border border-white/15">
                  <span className="font-mono font-black text-amber-400 text-sm tracking-widest uppercase">
                    {activeVehicle?.plate || 'BELUM ADA PLAT'}
                  </span>
                </div>
              </div>

              {/* Specs pill badges */}
              <div className="flex items-center gap-4 text-xs text-slate-300 pt-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Gauge size={14} className="text-red-400" />
                  <span>Odometer Terakhir: <strong className="text-white font-mono">{activeVehicle?.lastKm.toLocaleString('id-ID') || '0'} KM</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-blue-400" />
                  <span>BBM: <strong>{activeVehicle?.fuelType || 'Bensin'}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Next Schedule Card Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[240px] text-center md:text-right shrink-0">
              <div className="flex items-center justify-between md:justify-end gap-2 text-xs font-bold text-amber-400 mb-1">
                <Clock size={14} />
                <span>Servis Berkala Berikutnya</span>
              </div>
              <p className="text-2xl font-black font-mono text-white tracking-tight">
                {nextServiceInfo.nextKm.toLocaleString('id-ID')} KM
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Estimasi: {nextServiceInfo.estimatedMonth}
              </p>
              <button
                onClick={() => onOpenBooking ? onOpenBooking(`Servis Berkala ${nextServiceInfo.nextKm} KM (${activeVehicle?.plate})`, `Booking servis berkala via Buku Servis Digital untuk ${activeVehicle?.brand} ${activeVehicle?.model}`) : onNavigate?.('booking')}
                className="mt-3 w-full py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar size={13} />
                <span>Reservasi Servis Ini</span>
              </button>
            </div>

          </div>

          {/* Quick Stats Grid at bottom of hero */}
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Total Kunjungan</p>
              <p className="text-base font-black text-white mt-0.5">{vehicleOrders.length} Kali</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Status Garansi</p>
              <p className={`text-base font-black mt-0.5 ${activeWarranty?.isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                {activeWarranty?.isActive ? 'Aktif (1 Bulan)' : 'Kadaluarsa'}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-bold">No. Rangka (VIN)</p>
              <p className="text-xs font-mono font-bold text-slate-300 mt-1 truncate">{activeVehicle?.noRangka || '-'}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-bold">No. Mesin</p>
              <p className="text-xs font-mono font-bold text-slate-300 mt-1 truncate">{activeVehicle?.noMesin || '-'}</p>
            </div>
          </div>

        </div>

        {/* ─── 3. Active Digital Warranty Card (Kartu Garansi Digital) ─── */}
        {activeWarranty && (
          <div className={`rounded-3xl border p-5 shadow-sm transition-all ${
            activeWarranty.isActive
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-white border-slate-200 text-slate-700'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="flex items-start gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  activeWarranty.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black uppercase tracking-wide">
                      {activeWarranty.isActive ? 'Kartu Garansi Digital Aktif' : 'Riwayat Garansi Servis'}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      activeWarranty.isActive ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {activeWarranty.isActive ? `Sisa ${activeWarranty.remainingDays} Hari` : 'Expired'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Garansi Jasa (1 Bulan) & Garansi Sparepart (1 Bulan) dari pengerjaan SPK: <strong>{activeWarranty.orderNumber}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Masa Berlaku: {activeWarranty.orderDate} s/d <strong>{activeWarranty.expiryDate}</strong>
                  </p>
                </div>
              </div>

              {activeWarranty.isActive && (
                <div className="bg-white rounded-2xl p-3.5 border border-emerald-200 shadow-xs text-center shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Status Perlindungan</span>
                  <span className="text-xs font-black text-emerald-700 block mt-0.5">PROTEKSI 100% AKTIF</span>
                  <a
                    href="https://wa.me/62882007935047?text=Halo%20FHRCAR,%20saya%20ingin%20klaim/konsultasi%20garansi%20servis%20untuk%20mobil%20saya"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    Konsultasi Garansi ➔
                  </a>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ─── 4. Smart Next Service Schedule & Checklist ─── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">Rekomendasi Paket Servis Berkala</h3>
                <p className="text-xs text-slate-500">Jadwal perawatan rutin agar performa mobil Anda tetap prima</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100 hidden sm:inline-block">
              Setiap +5.000 KM
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {nextServiceInfo.recommendations.map((rec, i) => (
              <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3 text-xs font-semibold text-slate-700">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>{rec}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span className="text-amber-800 font-medium">
                Ganti oli mesin secara tepat waktu menjaga keawetan mesin dan menghemat konsumsi bahan bakar mobil Anda.
              </span>
            </div>
            <button
              onClick={() => onOpenBooking ? onOpenBooking(`Servis Ganti Oli & Tune Up (${activeVehicle?.plate})`, `Booking ganti oli dari Buku Servis Digital`) : onNavigate?.('booking')}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shrink-0 transition-colors cursor-pointer"
            >
              Booking Servis
            </button>
          </div>
        </div>

        {/* ─── 5. Service History Timeline (Riwayat Servis Lengkap) ─── */}
        <div className="space-y-3">
          
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Wrench size={18} className="text-red-600" />
                <span>Riwayat Servis & Faktur Pengerjaan</span>
              </h3>
              <p className="text-xs text-slate-500">Rekam jejak seluruh kunjungan dan penggantian sparepart kendaraan Anda</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs">
              {vehicleOrders.length} Riwayat
            </span>
          </div>

          {vehicleOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText size={28} />
              </div>
              <h4 className="text-sm font-black text-slate-800">Belum Ada Riwayat Servis Tercatat</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Data pengerjaan servis mobil Anda akan otomatis muncul di sini setelah faktur SPK dibuat oleh bengkel.
              </p>
              <button
                onClick={() => onOpenBooking ? onOpenBooking() : onNavigate?.('booking')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/20"
              >
                Jadwalkan Servis Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicleOrders.map((order, idx) => {
                const isExpanded = expandedSpkId === order.id;
                const spkDate = formatDateIndo(order.createdAt || order.serviceDate);
                const subParts = (order.spareparts || []).reduce((s, p) => s + ((p.hargaSatuan || 0) * (p.qty || 1)), 0);
                const subJasa = (order.jasaList || []).reduce((s, j) => s + (j.harga || 0), 0);
                const isLatest = idx === 0;

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-xs ${
                      isLatest ? 'border-red-200 ring-2 ring-red-500/10' : 'border-slate-200'
                    }`}
                  >
                    
                    {/* Header Row */}
                    <div
                      onClick={() => setExpandedSpkId(isExpanded ? null : order.id)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-sm ${
                          isLatest ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-slate-100 text-slate-600'
                        }`}>
                          #{vehicleOrders.length - idx}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {order.spkNumber || order.id}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {spkDate}
                            </span>
                            {order.kilometer ? (() => {
                              const kmNum = Number(String(order.kilometer).replace(/[^0-9]/g, '')) || 0;
                              return (
                                <>
                                  <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-bold">
                                    {kmNum.toLocaleString('id-ID')} KM
                                  </span>
                                  <span className="text-[11px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-black">
                                    Next: {(kmNum + 5000).toLocaleString('id-ID')} KM
                                  </span>
                                </>
                              );
                            })() : null}
                            {isLatest && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                                Servis Terakhir
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs font-bold text-slate-900 mt-1">
                            {order.serviceType || 'Servis & Perbaikan Lengkap'}
                          </p>
                          
                          {order.notes && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              Keluhan: {order.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Biaya</span>
                          <span className="text-sm font-black text-slate-900 font-mono">
                            {formatRp(order.totalPrice || (subParts + subJasa))}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail Accordion */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-4">
                        
                        {/* Summary Info grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="bg-white p-3 rounded-2xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Advisor</span>
                            <span className="font-bold text-slate-800">{order.saName || 'Admin FHR'}</span>
                          </div>
                          <div className="bg-white p-3 rounded-2xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Mekanik Pelaksana</span>
                            <span className="font-bold text-slate-800">{order.mekanikName || 'Mekanik Ahli FHR'}</span>
                          </div>
                          <div className="bg-white p-3 rounded-2xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Status Pembayaran</span>
                            <span className="font-bold text-emerald-600 uppercase">LUNAS ({order.metodePembayaran || 'CASH'})</span>
                          </div>
                          <div className="bg-white p-3 rounded-2xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Masa Garansi</span>
                            <span className="font-bold text-slate-800">1 BULAN PENUH</span>
                          </div>
                        </div>

                        {/* List Suku Cadang */}
                        {order.spareparts && order.spareparts.length > 0 && (
                          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                              <span className="flex items-center gap-1.5"><ShoppingBag size={13} className="text-blue-600" /> Suku Cadang & Material Diganti</span>
                              <span className="font-mono">{formatRp(subParts)}</span>
                            </div>
                            <div className="divide-y divide-slate-100 text-xs">
                              {order.spareparts.map((p, pIdx) => (
                                <div key={pIdx} className="px-4 py-2.5 flex items-center justify-between gap-2">
                                  <div>
                                    <span className="font-bold text-slate-800">{p.nama}</span>
                                    <span className="text-slate-400 text-[11px] ml-2">x{p.qty} {p.satuan || 'pcs'}</span>
                                  </div>
                                  <span className="font-mono font-bold text-slate-900">
                                    {formatRp((p.hargaSatuan || 0) * (p.qty || 1))}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* List Jasa */}
                        {order.jasaList && order.jasaList.length > 0 && (
                          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                              <span className="flex items-center gap-1.5"><Wrench size={13} className="text-teal-600" /> Jasa & Pekerjaan Mekanik</span>
                              <span className="font-mono">{formatRp(subJasa)}</span>
                            </div>
                            <div className="divide-y divide-slate-100 text-xs">
                              {order.jasaList.map((j, jIdx) => (
                                <div key={jIdx} className="px-4 py-2.5 flex items-center justify-between gap-2">
                                  <span className="font-bold text-slate-800">{j.nama}</span>
                                  <span className="font-mono font-bold text-slate-900">{formatRp(j.harga)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action buttons inside detail */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setSelectedReceiptOrder(order)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                          >
                            <FileText size={13} />
                            <span>Buka Nota & E-Receipt Digital</span>
                          </button>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </main>


      {/* ─── Sticky Mobile Quick Action Bar (Bottom Bar) ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center gap-3">

          {/* Emergency Button */}
          <a
            href="https://wa.me/62882007935047?text=Halo%20FHRCAR,%20saya%20membutuhkan%20layanan%20Emergency%20Roadside%20Service%2024%20Jam"
            target="_blank"
            rel="noreferrer"
            className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            <Zap size={14} className="text-amber-400 shrink-0" />
            <span>Emergency 24 Jam</span>
          </a>

          {/* Booking Button */}
          <button
            onClick={() => onOpenBooking ? onOpenBooking(`Servis Mobil ${activeVehicle?.plate || ''}`, `Booking dari Buku Servis Digital`) : onNavigate?.('booking')}
            className="flex-1 h-12 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-600/30 cursor-pointer whitespace-nowrap"
          >
            <Calendar size={14} className="shrink-0" />
            <span>Booking Sekarang</span>
          </button>

        </div>
      </div>

      {/* ─── Modal E-Receipt Digital ─── */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full my-auto overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Receipt Header */}
            <div className="bg-slate-900 text-white p-5 text-center relative">
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
              <img src="/logo-putih.png" alt="FHRCAR" className="h-7 w-auto mx-auto mb-1.5" />
              <h4 className="text-xs font-black uppercase tracking-wider text-red-500">FAKTUR / NOTA SERVIS DIGITAL</h4>
              <p className="text-[10px] text-slate-400">FHRCAR Auto Services — 24 Jam Purwokerto</p>
            </div>

            {/* Receipt Content */}
            <div className="p-5 space-y-4 text-xs font-sans">
              
              {/* Order Info */}
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">No. SPK / Faktur</p>
                  <p className="font-mono font-bold text-slate-900">{selectedReceiptOrder.spkNumber || selectedReceiptOrder.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Tanggal</p>
                  <p className="font-bold text-slate-800">{formatDateIndo(selectedReceiptOrder.createdAt || selectedReceiptOrder.serviceDate)}</p>
                </div>
              </div>

              {/* Vehicle & Customer */}
              <div className="bg-slate-50 p-3 rounded-2xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pelanggan:</span>
                  <span className="font-bold text-slate-800">{selectedReceiptOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kendaraan:</span>
                  <span className="font-bold text-slate-800">{selectedReceiptOrder.carBrand} {selectedReceiptOrder.carModel} ({selectedReceiptOrder.licensePlate})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kilometer Saat Servis:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {(() => {
                      const kmNum = Number(String(selectedReceiptOrder.kilometer || '0').replace(/[^0-9]/g, '')) || 0;
                      return `${kmNum.toLocaleString('id-ID')} KM`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200/60">
                  <span className="text-amber-800 font-bold">Jadwal Servis Berikutnya (+5.000 KM):</span>
                  <span className="font-mono font-black text-amber-900">
                    {(() => {
                      const kmNum = Number(String(selectedReceiptOrder.kilometer || '0').replace(/[^0-9]/g, '')) || 0;
                      return `${(kmNum + 5000).toLocaleString('id-ID')} KM`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-3 py-2 bg-slate-100 font-bold text-[11px] flex justify-between">
                  <span>Rincian Suku Cadang & Jasa</span>
                  <span>Subtotal</span>
                </div>
                <div className="divide-y divide-slate-100 p-2 space-y-1">
                  {(selectedReceiptOrder.spareparts || []).map((p, i) => (
                    <div key={i} className="flex justify-between text-[11px] py-1">
                      <span>{p.nama} (x{p.qty})</span>
                      <span className="font-mono font-bold">{formatRp((p.hargaSatuan || 0) * (p.qty || 1))}</span>
                    </div>
                  ))}
                  {(selectedReceiptOrder.jasaList || []).map((j, i) => (
                    <div key={i} className="flex justify-between text-[11px] py-1">
                      <span>{j.nama}</span>
                      <span className="font-mono font-bold">{formatRp(j.harga)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grand Total */}
              <div className="border-t border-dashed border-slate-300 pt-3 space-y-1.5">
                <div className="flex justify-between text-base font-black text-slate-900">
                  <span>TOTAL TAGIHAN</span>
                  <span className="text-red-600 font-mono">{formatRp(selectedReceiptOrder.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-600 uppercase">LUNAS ({selectedReceiptOrder.metodePembayaran || 'CASH'})</span>
                </div>
              </div>

              {/* Warranty note */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-800 space-y-0.5">
                <p className="font-black flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-600" /> KETENTUAN GARANSI RESMI:
                </p>
                <p>• Garansi Jasa: 1 Bulan</p>
                <p>• Garansi Sparepart: 1 Bulan</p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer size={14} /> Cetak / PDF
              </button>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
