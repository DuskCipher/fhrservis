import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon, Clock, Sun, Cloud, Plus, Search, Filter,
  Phone, MapPin, Car, CheckCircle, AlertCircle, X, ChevronLeft, ChevronRight,
  Download, ArrowRight, User, Wrench, MessageSquare, Edit3, Trash2
} from 'lucide-react';
import { CRMOrder, CustomerItem, PageType } from '../../types';
import { addOrder, updateOrderStatus, deleteOrder } from '../../lib/firestoreService';

interface CRMBookingAreaProps {
  orders: CRMOrder[];
  customers: CustomerItem[];
  onNavigate: (page: PageType) => void;
  onBuatSPK?: (order?: CRMOrder) => void;
}

const INDO_DAYS = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const HOLIDAYS_2026: Record<string, string> = {
  '2026-08-17': 'Hari Kemerdekaan RI',
  '2026-08-25': 'Maulid Nabi',
  '2026-01-01': 'Tahun Baru Masehi',
  '2026-03-20': 'Hari Raya Idul Fitri',
  '2026-03-21': 'Hari Raya Idul Fitri',
  '2026-05-01': 'Hari Buruh',
  '2026-12-25': 'Hari Raya Natal',
};

export function CRMBookingArea({ orders, customers, onNavigate, onBuatSPK }: CRMBookingAreaProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | '7days' | 'detail' | 'all'>('today');
  const [clockString, setClockString] = useState('');
  
  // Table Filters
  const [periodFilter, setPeriodFilter] = useState('month');
  const [tableStartDate, setTableStartDate] = useState('');
  const [tableEndDate, setTableEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    customerName: '',
    phone: '',
    serviceType: 'Tune Up & Servis Rutin',
    carBrand: 'Toyota',
    carModel: 'Avanza',
    carYear: '2021',
    licensePlate: '',
    locationAddress: 'Karangklesem, Purwokerto Selatan',
    serviceDate: new Date().toISOString().split('T')[0],
    serviceTime: '09:00 WIB',
    isEmergency: false,
    notes: 'Booking dari CRM Booking Area',
  });
  const [toast, setToast] = useState<string | null>(null);

  // Live ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const dayName = days[now.getDay()];
      const date = now.getDate();
      const monthName = INDO_MONTHS[now.getMonth()];
      const year = now.getFullYear();
      const time = now.toTimeString().split(' ')[0];
      setClockString(`Waktu Live: ${dayName}, ${date} ${monthName} ${year} — ${time}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Metrics Calculation
  const totalBookings = orders.length;
  
  const { baruCount, lamaCount } = useMemo(() => {
    let baru = 0;
    let lama = 0;
    orders.forEach(o => {
      const isExisting = customers.some(c => c.phone && o.phone && c.phone.replace(/[^0-9]/g, '') === o.phone.replace(/[^0-9]/g, ''));
      if (isExisting) lama++;
      else baru++;
    });
    return { baruCount: baru, lamaCount: lama };
  }, [orders, customers]);

  const pendingBookings = orders.filter(o => o.status === 'pending').length;
  const visitBookings = orders.filter(o => o.status === 'process' || o.status === 'completed').length;

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const calendarDays = useMemo(() => {
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateStr, holiday: HOLIDAYS_2026[dateStr] || null });
    }
    return days;
  }, [year, month]);

  // Tab filtering
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const sevenDaysAhead = new Date();
  sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7);
  const sevenDaysStr = sevenDaysAhead.toISOString().split('T')[0];

  const tabCounts = useMemo(() => {
    return {
      today: orders.filter(o => (o.serviceDate || o.createdAt?.split('T')[0]) === todayStr).length,
      tomorrow: orders.filter(o => (o.serviceDate || o.createdAt?.split('T')[0]) === tomorrowStr).length,
      sevenDays: orders.filter(o => {
        const d = o.serviceDate || o.createdAt?.split('T')[0];
        return d && d >= todayStr && d <= sevenDaysStr;
      }).length,
      detail: orders.filter(o => (o.serviceDate || o.createdAt?.split('T')[0]) === selectedCalendarDate).length,
      all: orders.length,
    };
  }, [orders, todayStr, tomorrowStr, sevenDaysStr, selectedCalendarDate]);

  const displayedTabOrders = useMemo(() => {
    return orders.filter(o => {
      const d = o.serviceDate || o.createdAt?.split('T')[0];
      if (activeTab === 'today') return d === todayStr;
      if (activeTab === 'tomorrow') return d === tomorrowStr;
      if (activeTab === '7days') return d && d >= todayStr && d <= sevenDaysStr;
      if (activeTab === 'detail') return d === selectedCalendarDate;
      return true;
    });
  }, [orders, activeTab, todayStr, tomorrowStr, sevenDaysStr, selectedCalendarDate]);

  // Table filtering
  const filteredTableOrders = useMemo(() => {
    return orders.filter(o => {
      const d = o.serviceDate || o.createdAt?.split('T')[0] || '';
      if (tableStartDate && d < tableStartDate) return false;
      if (tableEndDate && d > tableEndDate) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = (o.customerName && o.customerName.toLowerCase().includes(q)) ||
          (o.phone && o.phone.includes(q)) ||
          (o.licensePlate && o.licensePlate.toLowerCase().includes(q)) ||
          (o.carModel && o.carModel.toLowerCase().includes(q)) ||
          (o.id && o.id.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [orders, tableStartDate, tableEndDate, searchQuery]);

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.customerName || !modalForm.phone) {
      alert('Nama dan No. WhatsApp wajib diisi!');
      return;
    }
    const spkNum = `FHR-${Math.floor(100000 + Math.random() * 900000)}`;
    await addOrder({
      ...modalForm,
      status: 'pending',
      spkNumber: spkNum,
    });
    setShowModal(false);
    showToast('Booking baru berhasil ditambahkan!');
  };

  return (
    <div className="p-5 font-sans bg-[#f4f6fb] min-h-screen space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-fade-in">
          <CheckCircle size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* ─── Top Header with Live Info ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Booking Area</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola reservasi / jadwal kedatangan pelanggan</p>
          
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Clock size={12} className="text-emerald-600 animate-pulse" />
              {clockString}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Sun size={12} className="text-amber-500" />
              Cuaca Karangklesem, Purwokerto Selatan: Cerah (29°C)
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs shadow-xs transition-all self-start md:self-auto"
        >
          <Plus size={15} />
          <span>+ Tambah Booking</span>
        </button>
      </div>

      {/* ─── 4 KPI Summary Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL BOOKING</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{totalBookings}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Semua reservasi terdaftar</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PELANGGAN BARU / LAMA</p>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {baruCount} <span className="text-xs font-semibold text-slate-500">Baru</span> / {lamaCount} <span className="text-xs font-semibold text-slate-500">Lama</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Berdasarkan kecocokan nomor WA</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BOOKING PENDING</p>
          <p className="text-3xl font-black text-amber-500 mt-1">{pendingBookings}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Perlu konfirmasi kedatangan</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SUDAH VISIT</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{visitBookings}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Telah datang & dibuatkan SPK</p>
        </div>
      </div>

      {/* ─── Main Section: Calendar (Left) + Schedules (Right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Kalender Booking */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-amber-500" />
                <h2 className="text-xs font-black text-slate-900 tracking-wider uppercase">KALENDER BOOKING</h2>
              </div>
              <div className="flex items-center gap-1 border border-slate-200 rounded px-1.5 py-1 bg-slate-50">
                <button onClick={prevMonth} className="p-1 text-slate-500 hover:text-slate-900"><ChevronLeft size={14} /></button>
                <span className="text-xs font-bold text-slate-800 px-2">{INDO_MONTHS[month]} {year}</span>
                <button onClick={nextMonth} className="p-1 text-slate-500 hover:text-slate-900"><ChevronRight size={14} /></button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="mt-4">
              <div className="grid grid-cols-7 text-center pb-2 text-[11px] font-black text-slate-400 border-b border-slate-100">
                {INDO_DAYS.map((d, i) => (
                  <span key={d} className={i === 6 ? 'text-red-500' : ''}>{d}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 mt-2">
                {calendarDays.map((item, idx) => {
                  if (!item) {
                    return <div key={`empty-${idx}`} className="h-16 rounded border border-transparent bg-slate-50/40" />;
                  }

                  const isSelected = item.dateStr === selectedCalendarDate;
                  const isToday = item.dateStr === todayStr;
                  const countForDay = orders.filter(o => (o.serviceDate || o.createdAt?.split('T')[0]) === item.dateStr).length;

                  return (
                    <div
                      key={item.dateStr}
                      onClick={() => {
                        setSelectedCalendarDate(item.dateStr);
                        setActiveTab('detail');
                      }}
                      className={`h-16 p-1 rounded border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50/80 ring-2 ring-amber-300'
                          : isToday
                          ? 'border-red-300 bg-red-50/30'
                          : 'border-slate-100 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${item.holiday || (idx % 7 === 6) ? 'text-red-500 font-black' : 'text-slate-700'}`}>
                          {item.day}
                        </span>
                        {countForDay > 0 && (
                          <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[9px] font-black flex items-center justify-center">
                            {countForDay}
                          </span>
                        )}
                      </div>

                      {item.holiday && (
                        <p className="text-[8px] font-extrabold text-red-600 line-clamp-1 leading-tight">{item.holiday}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Daftar Reservasi & Jadwal */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-black text-slate-900 tracking-wider uppercase">DAFTAR RESERVASI & JADWAL</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Pilih tab di bawah untuk melihat rincian tanggal atau rentang waktu.</p>

            {/* Sub-Tabs */}
            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-[11px] font-bold">
              <button
                onClick={() => setActiveTab('today')}
                className={`px-3 py-1.5 rounded transition-all whitespace-nowrap ${activeTab === 'today' ? 'bg-amber-400 text-slate-900 font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Hari Ini <span className="text-[10px] opacity-80 font-black">{tabCounts.today}</span>
              </button>
              <button
                onClick={() => setActiveTab('tomorrow')}
                className={`px-3 py-1.5 rounded transition-all whitespace-nowrap ${activeTab === 'tomorrow' ? 'bg-amber-400 text-slate-900 font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Besok <span className="text-[10px] opacity-80 font-black">{tabCounts.tomorrow}</span>
              </button>
              <button
                onClick={() => setActiveTab('7days')}
                className={`px-3 py-1.5 rounded transition-all whitespace-nowrap ${activeTab === '7days' ? 'bg-amber-400 text-slate-900 font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                7 Hari <span className="text-[10px] opacity-80 font-black">{tabCounts.sevenDays}</span>
              </button>
              <button
                onClick={() => setActiveTab('detail')}
                className={`px-3 py-1.5 rounded transition-all whitespace-nowrap ${activeTab === 'detail' ? 'bg-amber-400 text-slate-900 font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Detail: {selectedCalendarDate.slice(8, 10)} {INDO_MONTHS[parseInt(selectedCalendarDate.slice(5, 7)) - 1]?.slice(0, 3)} <span className="text-[10px] opacity-80 font-black">{tabCounts.detail}</span>
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-amber-400 text-slate-900 font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Semua <span className="text-[10px] opacity-80 font-black">{tabCounts.all}</span>
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-[360px]">
            {displayedTabOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                <CalendarIcon size={36} className="text-slate-300 mb-2" />
                <p className="font-bold text-slate-600 text-xs">Tidak ada jadwal booking.</p>
                <p className="text-[11px] text-slate-400">Tidak ada reservasi yang dijadwalkan untuk pilihan ini.</p>
              </div>
            ) : (
              displayedTabOrders.map(o => (
                <div key={o.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{o.customerName}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{o.carBrand} {o.carModel} • <span className="font-mono font-bold text-slate-700">{o.licensePlate}</span></p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${o.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : o.status === 'process' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {o.status === 'completed' ? 'Selesai' : o.status === 'process' ? 'Proses SPK' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-600">
                    <span className="flex items-center gap-1 font-bold text-slate-700">
                      <Clock size={11} className="text-amber-500" />
                      {o.serviceTime || '09:00 WIB'}
                    </span>
                    <span className="truncate max-w-[160px] text-slate-500">{o.serviceType}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <a
                      href={`https://wa.me/${o.phone?.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(o.customerName)}%2C%20kami%20dari%20FHR%20Car%20Service%20mengonfirmasi%20jadwal%20booking%20Anda.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <Phone size={11} /> Hubungi WhatsApp
                    </a>
                    
                    <button
                      onClick={() => onBuatSPK ? onBuatSPK(o) : onNavigate('crm-spk-create')}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] transition-colors"
                    >
                      + Buat SPK
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom Section: Daftar Reservasi Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarIcon size={16} className="text-amber-500" />
            <h2 className="text-xs font-black text-slate-900 tracking-wider uppercase">DAFTAR RESERVASI</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={periodFilter}
              onChange={e => setPeriodFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded bg-white text-slate-700 outline-none"
            >
              <option value="month">Periode Aktif Bulan Ini</option>
              <option value="all">Semua Waktu</option>
            </select>

            <div className="flex items-center gap-1">
              <input
                type="date"
                value={tableStartDate}
                onChange={e => setTableStartDate(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-200 rounded bg-white text-slate-700 outline-none"
              />
              <span className="text-xs text-slate-400">s/d</span>
              <input
                type="date"
                value={tableEndDate}
                onChange={e => setTableEndDate(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-200 rounded bg-white text-slate-700 outline-none"
              />
            </div>

            {(tableStartDate || tableEndDate) && (
              <button
                onClick={() => { setTableStartDate(''); setTableEndDate(''); }}
                className="px-2 py-1 text-[11px] font-bold text-red-600 bg-red-50 rounded border border-red-200 hover:bg-red-100"
              >
                RESET
              </button>
            )}

            <div className="relative min-w-[200px]">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded bg-white outline-none focus:border-amber-400"
              />
            </div>

            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors">
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Full Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3 whitespace-nowrap">ID</th>
                <th className="px-3 py-3 whitespace-nowrap">NAMA</th>
                <th className="px-3 py-3 whitespace-nowrap">WHATSAPP</th>
                <th className="px-3 py-3 whitespace-nowrap">LOKASI</th>
                <th className="px-3 py-3 whitespace-nowrap">CABANG</th>
                <th className="px-3 py-3 whitespace-nowrap">KENDARAAN</th>
                <th className="px-3 py-3 whitespace-nowrap">SUMBER</th>
                <th className="px-3 py-3 whitespace-nowrap">RENCANA DATANG</th>
                <th className="px-3 py-3 whitespace-nowrap">TANGGAL</th>
                <th className="px-3 py-3 text-right pr-4 whitespace-nowrap">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTableOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400 italic">
                    Tidak ditemukan data reservasi.
                  </td>
                </tr>
              ) : (
                filteredTableOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-slate-600 text-[11px]">
                      #{o.id?.slice(0, 6)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap font-bold text-slate-900">
                      {o.customerName}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap font-mono text-slate-600">
                      {o.phone || '—'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-slate-600 max-w-[140px] truncate" title={o.locationAddress}>
                      {o.locationAddress || 'Purwokerto'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-slate-600">
                      FHR Car Service
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap font-semibold text-slate-800">
                      {o.carBrand} {o.carModel} <span className="font-mono text-[10px] text-slate-400">({o.licensePlate})</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {o.isEmergency ? 'Emergency PWA' : 'Web Online'}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap font-bold text-amber-700">
                      {o.serviceTime || '09:00 WIB'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-slate-600">
                      {o.serviceDate || o.createdAt?.split('T')[0]}
                    </td>
                    <td className="px-3 py-3 text-right pr-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onBuatSPK ? onBuatSPK(o) : onNavigate('crm-spk-create')}
                          className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] transition-colors"
                        >
                          + SPK
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">TOTAL BOOKING</p>
            <p className="text-xl font-black text-slate-900">{filteredTableOrders.length}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">HALAMAN SAAT INI</p>
            <p className="text-xl font-black text-slate-900">1 <span className="text-xs font-normal text-slate-500">dari 1</span></p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">DATA PER HALAMAN</p>
            <p className="text-xl font-black text-slate-900">15</p>
          </div>
        </div>
      </div>

      {/* ─── Modal Tambah Booking ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="font-black text-slate-900 text-base">Tambah Booking Reservasi Baru</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Pelanggan *</label>
                  <input
                    value={modalForm.customerName}
                    onChange={e => setModalForm(p => ({ ...p, customerName: e.target.value }))}
                    placeholder="Nama Lengkap"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">No. WhatsApp *</label>
                  <input
                    value={modalForm.phone}
                    onChange={e => setModalForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Merek Mobil</label>
                  <input
                    value={modalForm.carBrand}
                    onChange={e => setModalForm(p => ({ ...p, carBrand: e.target.value }))}
                    placeholder="Toyota / Honda"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Model & Tahun</label>
                  <input
                    value={modalForm.carModel}
                    onChange={e => setModalForm(p => ({ ...p, carModel: e.target.value }))}
                    placeholder="Avanza 2021"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Plat Nomor</label>
                  <input
                    value={modalForm.licensePlate}
                    onChange={e => setModalForm(p => ({ ...p, licensePlate: e.target.value }))}
                    placeholder="R 1234 AB"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-amber-400 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Pilihan Layanan</label>
                  <input
                    value={modalForm.serviceType}
                    onChange={e => setModalForm(p => ({ ...p, serviceType: e.target.value }))}
                    placeholder="Servis Berkala / Tune Up"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal Rencana Datang</label>
                  <input
                    type="date"
                    value={modalForm.serviceDate}
                    onChange={e => setModalForm(p => ({ ...p, serviceDate: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Waktu / Jam Kedatangan</label>
                  <input
                    value={modalForm.serviceTime}
                    onChange={e => setModalForm(p => ({ ...p, serviceTime: e.target.value }))}
                    placeholder="09:00 WIB"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Lokasi / Alamat</label>
                <input
                  value={modalForm.locationAddress}
                  onChange={e => setModalForm(p => ({ ...p, locationAddress: e.target.value }))}
                  placeholder="Purwokerto"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold rounded border border-slate-200 text-slate-600">Batal</button>
                <button type="submit" className="px-5 py-2 text-xs font-black rounded bg-amber-400 hover:bg-amber-500 text-slate-900 transition-colors">Simpan Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
