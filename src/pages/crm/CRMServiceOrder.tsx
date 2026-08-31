import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Eye, Phone, Printer, X, CheckCircle, 
  AlertCircle, Clock, ChevronDown, MapPin, User, Car, 
  Calendar, MessageSquare, RefreshCw, Plus, Wrench, PlayCircle,
  TrendingUp, DollarSign, Zap, Download, ArrowUpRight, ShieldCheck,
  CalendarRange, CheckSquare, Edit, Award, UserCheck, Trash2
} from 'lucide-react';
import { CRMOrder, OrderStatus, CustomerItem } from '../../types';

interface CRMServiceOrderProps {
  orders: CRMOrder[];
  customers?: CustomerItem[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onDeleteOrder?: (orderId: string) => void;
  onNavigate?: (page: any) => void;
  onEditSPK?: (order: CRMOrder) => void;
  compact?: boolean;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; border: string }> = {
  pending:   { label: 'Tahap Inspeksi', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  process:   { label: 'Dalam Pengerjaan', bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  completed: { label: 'Selesai',        bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  cancelled: { label: 'Dibatalkan',     bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200' },
};

const MONTH_NAMES = [
  { val: 'all', label: 'Semua Bulan' },
  { val: '01', label: 'Januari' },
  { val: '02', label: 'Februari' },
  { val: '03', label: 'Maret' },
  { val: '04', label: 'April' },
  { val: '05', label: 'Mei' },
  { val: '06', label: 'Juni' },
  { val: '07', label: 'Juli' },
  { val: '08', label: 'Agustus' },
  { val: '09', label: 'September' },
  { val: '10', label: 'Oktober' },
  { val: '11', label: 'November' },
  { val: '12', label: 'Desember' },
];

export function CRMServiceOrder({
  orders,
  customers = [],
  onUpdateStatus,
  onDeleteOrder,
  onNavigate,
  onEditSPK,
  compact = false
}: CRMServiceOrderProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'regular' | 'emergency'>('all');
  
  // Date Filtering Mode
  const [dateFilterMode, setDateFilterMode] = useState<'preset' | 'specific' | 'range' | 'month'>('preset');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [specificDate, setSpecificDate] = useState(''); // e.g. "2026-02-20"
  const [startDate, setStartDate] = useState('');      // e.g. "2026-01-01"
  const [endDate, setEndDate] = useState('');          // e.g. "2026-01-30"
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2026');

  const [selected, setSelected] = useState<string[]>([]);
  const [detailOrder, setDetailOrder] = useState<CRMOrder | null>(null);

  // Helper to extract ISO date YYYY-MM-DD
  const getOrderDateString = (o: CRMOrder): string => {
    if (o.createdAt) {
      try {
        return new Date(o.createdAt).toISOString().split('T')[0];
      } catch {}
    }
    return '';
  };

  // Find customer to determine LAMA / BARU
  const getCustomerType = (o: CRMOrder): 'BARU' | 'LAMA' => {
    if (o.customerType) return o.customerType;
    const found = customers.find(c =>
      c.phone === o.phone ||
      c.name.toLowerCase() === o.customerName.toLowerCase() ||
      c.licensePlate.toLowerCase() === o.licensePlate.toLowerCase()
    );
    if (found?.customerType) return found.customerType;
    return o.isEmergency ? 'BARU' : 'LAMA';
  };

  // Filtered orders with Comprehensive CRM Date Logic
  const filtered = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return orders.filter(o => {
      // 1. Search Query
      const matchSearch = !search ||
        o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        o.licensePlate?.toLowerCase().includes(search.toLowerCase()) ||
        o.id?.toLowerCase().includes(search.toLowerCase()) ||
        o.phone?.includes(search) ||
        o.saName?.toLowerCase().includes(search.toLowerCase()) ||
        o.mekanikName?.toLowerCase().includes(search.toLowerCase()) ||
        o.carModel?.toLowerCase().includes(search.toLowerCase()) ||
        o.serviceType?.toLowerCase().includes(search.toLowerCase());

      // 2. Status Filter
      const matchStatus = filterStatus === 'all' || o.status === filterStatus;

      // 3. Emergency / Type Filter
      const matchType =
        filterType === 'all' ||
        (filterType === 'emergency' && o.isEmergency) ||
        (filterType === 'regular' && !o.isEmergency);

      // 4. CRM Date Filtering Logic
      let matchDate = true;
      const orderDateStr = getOrderDateString(o);

      if (dateFilterMode === 'preset') {
        if (datePreset === 'today') {
          matchDate = orderDateStr ? orderDateStr === todayStr : (o.serviceDate?.toLowerCase().includes('hari ini') || false);
        } else if (datePreset === '7d' && o.createdAt) {
          try {
            const diffDays = (now.getTime() - new Date(o.createdAt).getTime()) / (1000 * 3600 * 24);
            matchDate = diffDays <= 7 && diffDays >= 0;
          } catch { matchDate = true; }
        } else if (datePreset === '30d' && o.createdAt) {
          try {
            const diffDays = (now.getTime() - new Date(o.createdAt).getTime()) / (1000 * 3600 * 24);
            matchDate = diffDays <= 30 && diffDays >= 0;
          } catch { matchDate = true; }
        }
      } else if (dateFilterMode === 'specific' && specificDate) {
        matchDate = orderDateStr === specificDate;
      } else if (dateFilterMode === 'range') {
        if (startDate && orderDateStr && orderDateStr < startDate) matchDate = false;
        if (endDate && orderDateStr && orderDateStr > endDate) matchDate = false;
      } else if (dateFilterMode === 'month') {
        if (orderDateStr) {
          const [yr, mo] = orderDateStr.split('-');
          if (selectedYear !== 'all' && yr !== selectedYear) matchDate = false;
          if (selectedMonth !== 'all' && mo !== selectedMonth) matchDate = false;
        }
      }

      return matchSearch && matchStatus && matchType && matchDate;
    });
  }, [orders, search, filterStatus, filterType, dateFilterMode, datePreset, specificDate, startDate, endDate, selectedMonth, selectedYear]);

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(prev => prev.length === filtered.length ? [] : filtered.map(o => o.id));

  const formatRp = (n?: number) => n ? 'Rp ' + Math.round(n).toLocaleString('id-ID') : 'Rp 0';
  
  const formatDateDisplay = (dateStr?: string, createdAt?: string) => {
    if (createdAt) {
      try {
        const d = new Date(createdAt);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch {}
    }
    return dateStr || '-';
  };

  const totalRevenueCompleted = filtered.filter(o => o.status === 'completed').reduce((s, o) => s + (o.totalPrice || 0), 0);
  const totalRevenuePending = filtered.filter(o => o.status === 'process').reduce((s, o) => s + (o.totalPrice || 0), 0);

  const handleEditClick = (o: CRMOrder) => {
    if (onEditSPK) {
      onEditSPK(o);
    } else if (onNavigate) {
      onNavigate('crm-spk-create');
    }
  };

  const handleDeleteOrder = (o: CRMOrder) => {
    const label = o.spkNumber || ('#' + o.id?.slice(0, 8));
    if (window.confirm(`Yakin ingin menghapus data SPK ${label} untuk pelanggan "${o.customerName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      if (onDeleteOrder) {
        onDeleteOrder(o.id);
      }
      if (detailOrder?.id === o.id) {
        setDetailOrder(null);
      }
    }
  };

  // Compact Mode (for embedding)
  if (compact) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px]">
              <th className="px-4 py-3 text-left">NO.</th>
              <th className="px-4 py-3 text-left">NO. SPK</th>
              <th className="px-4 py-3 text-left">TIPE</th>
              <th className="px-4 py-3 text-left">CUSTOMER & MOBIL</th>
              <th className="px-4 py-3 text-left">SA / MEKANIK</th>
              <th className="px-4 py-3 text-left">LAYANAN</th>
              <th className="px-4 py-3 text-left">TANGGAL MASUK</th>
              <th className="px-4 py-3 text-left">STATUS</th>
              <th className="px-4 py-3 text-right">TOTAL BIAYA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((o, idx) => {
              const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
              const type = getCustomerType(o);
              return (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-medium">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">#{o.id?.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      type === 'LAMA' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{o.customerName}</p>
                    <p className="text-[11px] text-slate-400">{o.carBrand} {o.carModel} • {o.licensePlate}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <span className="font-bold">{o.saName || '—'}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{o.serviceType}</td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{formatDateDisplay(o.serviceDate, o.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">{formatRp(o.totalPrice)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 font-sans bg-slate-50/50 min-h-screen">

      {/* ─── Page Header (Clean White Card) ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-xs">
              <Wrench size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900">Daftar SPK & Service Order</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                  {filtered.length} SPK
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring Surat Perintah Kerja, Service Advisor, estimasi biaya, status mekanik, dan edit SPK tersimpan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onNavigate && (
              <button
                onClick={() => onNavigate('crm-customers')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
              >
                <User size={14} className="text-slate-500" />
                <span>Data Pelanggan</span>
              </button>
            )}
            <button
              onClick={() => onNavigate ? onNavigate('crm-spk-create') : null}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs shadow-md shadow-red-600/20 transition-all"
            >
              <Plus size={16} />
              <span>+ Buat SPK Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Financial & Operational Summary Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total SPK Terfilter</p>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <CheckSquare size={14} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{filtered.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Dari total {orders.length} data sistem</p>
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Dalam Pengerjaan</p>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <PlayCircle size={14} />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2">
            {filtered.filter(o => o.status === 'process').length}
          </p>
          <p className="text-[11px] text-blue-600/70 mt-0.5">Estimasi Omset: {formatRp(totalRevenuePending)}</p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">SPK Selesai</p>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle size={14} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            {filtered.filter(o => o.status === 'completed').length}
          </p>
          <p className="text-[11px] text-emerald-600/70 mt-0.5">Omset Real: {formatRp(totalRevenueCompleted)}</p>
        </div>

        <div className="bg-white rounded-2xl border border-red-100 p-4 shadow-xs bg-gradient-to-br from-white to-red-50/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Panggilan Darurat</p>
            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <Zap size={14} />
            </div>
          </div>
          <p className="text-2xl font-black text-red-700 mt-2">
            {filtered.filter(o => o.isEmergency).length}
          </p>
          <p className="text-[11px] text-red-600/70 mt-0.5">Roadside SOS 24 Jam</p>
        </div>
      </div>

      {/* ─── CRM Date Filter Control Panel ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        
        {/* Date Filter Mode Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mr-1">
              <CalendarRange size={15} className="text-red-600" />
              <span>Pilihan Filter Tanggal:</span>
            </span>

            {/* Mode Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
              <button
                onClick={() => { setDateFilterMode('preset'); setDatePreset('all'); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateFilterMode === 'preset' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Preset Cepat
              </button>
              <button
                onClick={() => setDateFilterMode('specific')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateFilterMode === 'specific' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Pilih Tanggal Tertentu
              </button>
              <button
                onClick={() => setDateFilterMode('range')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateFilterMode === 'range' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Rentang Tanggal (Dari - Sampai)
              </button>
              <button
                onClick={() => setDateFilterMode('month')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateFilterMode === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Per Bulan & Tahun
              </button>
            </div>
          </div>

          {/* Reset Date Filter Button */}
          {(specificDate || startDate || endDate || datePreset !== 'all' || selectedMonth !== 'all') && (
            <button
              onClick={() => {
                setDateFilterMode('preset');
                setDatePreset('all');
                setSpecificDate('');
                setStartDate('');
                setEndDate('');
                setSelectedMonth('all');
              }}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 self-start lg:self-auto"
            >
              <RefreshCw size={12} />
              <span>Reset Filter Tanggal</span>
            </button>
          )}
        </div>

        {/* Date Filter Inputs based on active mode */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* 1. Preset Buttons */}
          {dateFilterMode === 'preset' && (
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { val: 'all', label: 'Semua Waktu' },
                { val: 'today', label: 'Hari Ini' },
                { val: '7d', label: '7 Hari Terakhir' },
                { val: '30d', label: 'Bulan Ini (30 Hari)' },
              ].map(p => (
                <button
                  key={p.val}
                  onClick={() => setDatePreset(p.val as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    datePreset === p.val
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* 2. Specific Single Date (e.g. 20 Feb) */}
          {dateFilterMode === 'specific' && (
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600">Pilih Tanggal:</span>
              <input
                type="date"
                value={specificDate}
                onChange={e => setSpecificDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white outline-none focus:border-red-500"
              />
              {specificDate && (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                  Menampilkan SPK Tanggal: {new Date(specificDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          )}

          {/* 3. Date Range (e.g. 1 Jan - 30 Jan) */}
          {dateFilterMode === 'range' && (
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-600 font-bold">Dari Tanggal:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white outline-none focus:border-red-500"
                />
              </div>
              <span className="text-slate-400 font-bold">-</span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-600 font-bold">Sampai Tanggal:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white outline-none focus:border-red-500"
                />
              </div>
              {(startDate || endDate) && (
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  Rentang Aktif
                </span>
              )}
            </div>
          )}

          {/* 4. Month & Year Selector */}
          {dateFilterMode === 'month' && (
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600">Bulan:</span>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white outline-none focus:border-red-500"
              >
                {MONTH_NAMES.map(m => (
                  <option key={m.val} value={m.val}>{m.label}</option>
                ))}
              </select>

              <span className="text-xs font-bold text-slate-600 ml-2">Tahun:</span>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white outline-none focus:border-red-500"
              >
                <option value="all">Semua Tahun</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          )}
        </div>

        {/* Secondary Status & Keyword Search Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pt-2">
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Filter size={13} /> Status:
            </span>
            {(['all', 'pending', 'process', 'completed', 'cancelled'] as const).map(s => {
              const cfg = s === 'all' ? null : STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    filterStatus === s
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s === 'all' ? 'Semua Status' : cfg?.label}
                </button>
              );
            })}

            <span className="text-slate-200 mx-1 hidden sm:inline">|</span>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-red-500"
            >
              <option value="all">Semua Tipe Servis</option>
              <option value="regular">Servis Reguler</option>
              <option value="emergency">Roadside Darurat 24 Jam</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="w-full pl-10 pr-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
              placeholder="Cari No SPK, customer, SA, mekanik, plat..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

        </div>

      </div>

      {/* ─── Main Complete SPK Table (With SA, Total Biaya, Tipe Baru/Lama & Edit Aksi) ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="pl-4 pr-2 py-4 w-8 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded accent-red-600"
                  />
                </th>
                <th className="px-3 py-4 w-10 text-center whitespace-nowrap">NO.</th>
                <th className="px-3 py-4 whitespace-nowrap">NOMOR SPK</th>
                <th className="px-3 py-4 text-center whitespace-nowrap">TIPE</th>
                <th className="px-3 py-4 whitespace-nowrap">PELANGGAN & KONTAK</th>
                <th className="px-3 py-4 whitespace-nowrap">KENDARAAN & PLAT</th>
                <th className="px-3 py-4 whitespace-nowrap">SERVICE ADVISOR (SA)</th>
                <th className="px-3 py-4 whitespace-nowrap">MEKANIK</th>
                <th className="px-3 py-4 whitespace-nowrap">TANGGAL MASUK</th>
                <th className="px-3 py-4 text-right whitespace-nowrap">TOTAL BIAYA</th>
                <th className="px-3 py-4 text-center whitespace-nowrap">STATUS</th>
                <th className="px-4 py-4 text-right whitespace-nowrap">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Wrench size={24} />
                      </div>
                      <p className="font-bold text-slate-700 text-sm">Tidak ada data SPK yang sesuai filter</p>
                      <p className="text-xs text-slate-400">Silakan ubah tanggal filter atau kata kunci pencarian</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((o, idx) => {
                  const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                  const type = getCustomerType(o);
                  const isSelected = selected.includes(o.id);
                  return (
                    <tr key={o.id} className={`hover:bg-slate-50/90 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                      <td className="pl-4 pr-2 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(o.id)}
                          className="w-3.5 h-3.5 rounded accent-red-600"
                        />
                      </td>

                      <td className="px-3 py-4 text-center text-slate-400 font-bold whitespace-nowrap">{idx + 1}</td>

                      {/* SPK Number */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-slate-900 text-xs bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 whitespace-nowrap">
                            #{o.id?.slice(0, 8)}
                          </span>
                          {o.isEmergency && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-red-100 text-red-700 uppercase border border-red-200 whitespace-nowrap">
                              Darurat 24J
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tipe Pelanggan (BARU / LAMA) */}
                      <td className="px-3 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border whitespace-nowrap ${
                          type === 'LAMA'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {type === 'LAMA' ? 'LAMA' : 'BARU'}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 font-black text-xs flex items-center justify-center shrink-0">
                            {o.customerName?.[0]?.toUpperCase() || 'P'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs whitespace-nowrap">{o.customerName}</p>
                            <p className="font-mono text-[11px] text-slate-500 font-bold whitespace-nowrap">{o.phone || '—'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle & Plate */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <p className="font-bold text-slate-800 text-xs whitespace-nowrap">
                          {o.carBrand} {o.carModel}
                        </p>
                        <span className="inline-block px-2 py-0.5 mt-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold text-[11px] border border-slate-300 whitespace-nowrap">
                          {o.licensePlate}
                        </span>
                      </td>

                      {/* Service Advisor (SA) */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold whitespace-nowrap">
                          <UserCheck size={12} className="text-red-500 shrink-0" />
                          <span>{o.saName || '—'}</span>
                        </div>
                      </td>

                      {/* Mekanik */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium whitespace-nowrap">
                          <Wrench size={11} className="text-blue-500 shrink-0" />
                          <span>{o.mekanikName || '—'}</span>
                        </div>
                      </td>

                      {/* Service Date */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-800 font-bold text-xs whitespace-nowrap">
                          <Calendar size={11} className="text-slate-400 shrink-0" />
                          <span>{formatDateDisplay(o.serviceDate, o.createdAt)}</span>
                        </div>
                        {o.serviceTime && (
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 whitespace-nowrap">
                            <Clock size={9} />
                            <span>Pukul {o.serviceTime}</span>
                          </p>
                        )}
                      </td>

                      {/* Total Biaya (Rupiah) */}
                      <td className="px-3 py-4 text-right whitespace-nowrap">
                        <span className="font-mono font-black text-slate-900 text-xs whitespace-nowrap">
                          {o.totalPrice ? formatRp(o.totalPrice) : <span className="text-slate-300 font-normal">—</span>}
                        </span>
                      </td>

                      {/* Status Selector Real-Time */}
                      <td className="px-3 py-4 text-center whitespace-nowrap">
                        <select
                          value={o.status}
                          onChange={(e) => onUpdateStatus(o.id, e.target.value as OrderStatus)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border transition-all cursor-pointer outline-none whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border} hover:shadow-xs`}
                          title="Klik untuk mengubah status pengerjaan secara langsung"
                        >
                          <option value="pending">Tahap Inspeksi</option>
                          <option value="process">Dalam Pengerjaan</option>
                          <option value="completed">Selesai</option>
                          <option value="cancelled">Dibatalkan</option>
                        </select>
                      </td>

                      {/* Actions (Edit SPK, Detail, WA, Hapus) */}
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* ✏️ EDIT SPK BUTTON (Opens SPK Wizard with existing data) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(o);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-all shadow-2xs"
                            title="Edit Jasa, Sparepart, SA Check & Detail SPK"
                          >
                            <Edit size={12} />
                            <span>Edit SPK</span>
                          </button>

                          {/* Quick Detail */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailOrder(o);
                            }}
                            title="Lihat Rincian Cepat"
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
                          >
                            <Eye size={13} />
                          </button>

                          {/* WhatsApp Chat */}
                          {o.phone && (
                            <a
                              href={`https://wa.me/${o.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(o.customerName)}%2C%20kami%20dari%20FHR%20Car%20Service%20mengenai%20SPK%20${o.id}%20kendaraan%20${o.licensePlate}.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              title="Chat WhatsApp Customer"
                            >
                              <MessageSquare size={13} />
                            </a>
                          )}

                          {/* 🗑️ Hapus SPK Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteOrder(o);
                            }}
                            title="Hapus Data SPK Ini"
                            className="p-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors shadow-2xs"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Detail Modal (Clean White & Light Design) ─── */}
      {detailOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setDetailOrder(null)} />
          <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black">
                  <Wrench size={18} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Rincian Surat Perintah Kerja (SPK)</h2>
                  <p className="text-xs text-slate-400 font-mono">ID: #{detailOrder.id}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-5">
              
              {/* Staff Assignments Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Service Advisor (SA)</p>
                  <p className="font-black text-slate-900 mt-0.5">{detailOrder.saName || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Mekanik Pelaksana</p>
                  <p className="font-black text-blue-700 mt-0.5">{detailOrder.mekanikName || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Tipe Pelanggan</p>
                  <p className="font-black text-emerald-700 mt-0.5">{getCustomerType(detailOrder)}</p>
                </div>
              </div>

              {/* Box 1: Customer & Vehicle Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Informasi Pemilik</p>
                  <p className="text-sm font-black text-slate-900">{detailOrder.customerName}</p>
                  <p className="text-xs font-mono font-bold text-slate-600">{detailOrder.phone || '-'}</p>
                  {detailOrder.locationAddress && (
                    <p className="text-xs text-slate-500 flex items-start gap-1 mt-1">
                      <MapPin size={12} className="shrink-0 mt-0.5 text-slate-400" />
                      <span>{detailOrder.locationAddress}</span>
                    </p>
                  )}
                </div>

                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data Kendaraan</p>
                  <p className="text-sm font-black text-slate-900">{detailOrder.carBrand} {detailOrder.carModel} ({detailOrder.carYear})</p>
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-white text-slate-900 font-mono font-black text-xs border border-slate-300 shadow-2xs">
                    {detailOrder.licensePlate}
                  </span>
                </div>
              </div>

              {/* Box 2: Service & Schedule Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detail Pekerjaan & Jadwal</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{detailOrder.serviceType}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Calendar size={13} className="text-red-500" />
                      <span>Tanggal Masuk: <strong>{formatDateDisplay(detailOrder.serviceDate, detailOrder.createdAt)}</strong></span>
                      {detailOrder.serviceTime && <span>• Pukul {detailOrder.serviceTime}</span>}
                    </p>
                  </div>
                  {detailOrder.isEmergency && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200">
                      Roadside SOS 24 Jam
                    </span>
                  )}
                </div>

                {detailOrder.notes && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    <span className="font-bold text-slate-500">Catatan Keluhan / Instruksi: </span>
                    {detailOrder.notes}
                  </div>
                )}
              </div>

              {/* Box 3: Update Status Selector */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ubah Status Pengerjaan</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['pending', 'process', 'completed', 'cancelled'] as OrderStatus[]).map(s => {
                    const cfg = STATUS_CONFIG[s];
                    const isActive = detailOrder.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          onUpdateStatus(detailOrder.id, s);
                          setDetailOrder({ ...detailOrder, status: s });
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                          isActive
                            ? 'bg-red-600 text-white border-red-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const o = detailOrder;
                    setDetailOrder(null);
                    handleEditClick(o);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
                >
                  <Edit size={13} />
                  <span>Buka Form Edit SPK Lengkap</span>
                </button>

                <button
                  onClick={() => handleDeleteOrder(detailOrder)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Hapus SPK</span>
                </button>
              </div>

              <button
                onClick={() => setDetailOrder(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
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
