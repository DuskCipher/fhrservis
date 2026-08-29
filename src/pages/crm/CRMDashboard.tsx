import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, Wrench, Play, CheckCircle, Clock,
  ArrowUpRight, Users, Calendar, Car, MapPin,
  MoreHorizontal, DollarSign, Activity, Zap, FileSpreadsheet,
  Award, Filter, ShieldCheck, HelpCircle, Share2,
  PieChart as PieIcon, BarChart3, LineChart as LineIcon
} from 'lucide-react';
import { CRMOrder, CustomerItem } from '../../types';

interface CRMDashboardProps {
  orders: CRMOrder[];
  customers?: CustomerItem[];
  onUpdateStatus: (id: string, status: any) => void;
  onNavigate: (page: any) => void;
  onBuatSPK?: () => void;
}

const formatRp = (n: number) => {
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1) + 'jt';
  if (n >= 1000) return 'Rp ' + (n / 1000).toFixed(0) + 'rb';
  return 'Rp ' + n.toLocaleString('id-ID');
};

const formatRpFull = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  process:   'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu', process: 'Proses', completed: 'Selesai', cancelled: 'Batal'
};

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs shadow-xl font-sans">
        <p className="text-slate-500 mb-1.5 font-bold">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
              {p.name}:
            </span>
            <span className="font-bold text-slate-900">
              {p.name?.includes('Pendapatan') || p.name?.includes('Omset') || p.name?.includes('Revenue')
                ? formatRpFull(p.value)
                : `${p.value} Data`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function CRMDashboard({ orders, customers = [], onUpdateStatus, onNavigate, onBuatSPK }: CRMDashboardProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('7d');

  // KPI Base Counts
  const total = orders.length;
  const pending = orders.filter(o => o.status === 'pending').length;
  const process = orders.filter(o => o.status === 'process').length;
  const completed = orders.filter(o => o.status === 'completed').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;
  const emergency = orders.filter(o => o.isEmergency && o.status !== 'completed').length;

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((a, b) => a + (b.totalPrice || 0), 0);
  const pendingRevenue = orders.filter(o => o.status === 'process').reduce((a, b) => a + (b.totalPrice || 0), 0);

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const avgOrderValue = completed > 0 ? Math.round(totalRevenue / completed) : 0;

  // ─── 1. REVENUE TREND (AREA CHART) ───
  const revenueTrend = useMemo(() => {
    const daysCount = period === '7d' ? 7 : period === '30d' ? 30 : 14;
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const result = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayDateStr = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Hari Ini' : `${dayNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`;

      const matchingOrders = orders.filter(o => {
        if (!o.createdAt) return false;
        try {
          return new Date(o.createdAt).toISOString().split('T')[0] === dayDateStr;
        } catch {
          return false;
        }
      });

      const dayRevenue = matchingOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      const dayEstimated = matchingOrders
        .filter(o => o.status === 'process')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      const daySpkCount = matchingOrders.length;
      const dayEmergencyCount = matchingOrders.filter(o => o.isEmergency).length;

      result.push({
        day: label,
        Pendapatan: dayRevenue,
        Estimasi: dayEstimated,
        SPK: daySpkCount,
        Darurat: dayEmergencyCount,
      });
    }
    return result;
  }, [orders, period]);

  // ─── 2. STATUS DISTRIBUTION (DONUT PIE) ───
  const statusData = useMemo(() => [
    { name: 'Menunggu', value: pending, color: '#f59e0b' },
    { name: 'Proses', value: process, color: '#3b82f6' },
    { name: 'Selesai', value: completed, color: '#10b981' },
    { name: 'Batal', value: cancelled, color: '#94a3b8' },
  ].filter(d => d.value > 0), [pending, process, completed, cancelled]);

  // ─── 3. TOP SERVICES (HORIZONTAL BAR) ───
  const topServices = useMemo(() => {
    const serviceCount: Record<string, number> = {};
    orders.forEach(o => {
      if (o.serviceType) {
        serviceCount[o.serviceType] = (serviceCount[o.serviceType] || 0) + 1;
      }
    });
    return Object.entries(serviceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name: name.length > 25 ? name.slice(0, 25) + '...' : name,
        fullName: name,
        count
      }));
  }, [orders]);

  // ─── 4. CUSTOMER CLASSIFICATION (LAMA VS BARU) ───
  const customerTypeData = useMemo(() => {
    const lama = customers.filter(c => c.customerType === 'LAMA').length;
    const baru = customers.filter(c => c.customerType === 'BARU' || !c.customerType).length;
    return [
      { name: 'Pelanggan Baru', value: baru || 1, color: '#10b981' },
      { name: 'Pelanggan Lama', value: lama || 0, color: '#f59e0b' },
    ].filter(d => d.value > 0);
  }, [customers]);

  // ─── 5. CUSTOMER ACQUISITION SOURCE (BAR CHART) ───
  const customerSourceData = useMemo(() => {
    const sourceCount: Record<string, number> = {};
    customers.forEach(c => {
      const src = c.source || 'Walk-in Langsung';
      sourceCount[src] = (sourceCount[src] || 0) + 1;
    });
    return Object.entries(sourceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, jumlah]) => ({
        name: name.replace('Rekomendasi Teman/Keluarga', 'Rekomendasi'),
        jumlah
      }));
  }, [customers]);

  const recentOrders = orders.slice(0, 6);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto font-sans bg-slate-50/50 min-h-screen">

      {/* ─── Page Header ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-xs">
              <Activity size={22} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900">Dashboard & Analitik Bengkel</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Pemantauan data operasional & performa bisnis secara realtime
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Period Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setPeriod('7d')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === '7d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setPeriod('30d')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === '30d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                30 Hari
              </button>
              <button
                onClick={() => setPeriod('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semua
              </button>
            </div>

            <button
              onClick={() => onNavigate('crm-customers')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
            >
              <Users size={14} className="text-red-600" />
              <span>Database Pelanggan</span>
            </button>

            <button
              onClick={() => onBuatSPK ? onBuatSPK() : onNavigate('crm-spk-create')}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-red-600/20"
            >
              + Buat SPK Baru
            </button>
          </div>
        </div>
      </div>

      {/* ─── Row 1: KPI Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total SPK Masuk</p>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Wrench size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 leading-none">{total}</p>
          <p className="text-[11px] text-slate-400 mt-1.5">Seluruh pesanan terdaftar</p>
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 p-4 sm:p-5 shadow-xs bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Dalam Proses</p>
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Play size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-700 mt-2 leading-none">{process}</p>
          <p className="text-[11px] text-blue-600/70 mt-1.5">Unit sedang dikerjakan mekanik</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100 p-4 sm:p-5 shadow-xs bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Antrean Inspeksi</p>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-2 leading-none">{pending}</p>
          <p className="text-[11px] text-amber-600/70 mt-1.5">Tahap SA Check & konfirmasi</p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Pekerjaan Selesai</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 leading-none">{completed}</p>
          <p className="text-[11px] text-emerald-600/70 mt-1.5">{completionRate}% tingkat penyelesaian</p>
        </div>
      </div>

      {/* ─── Row 2: Revenue & Financial Highlights ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pendapatan Real (Selesai)</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{formatRpFull(totalRevenue)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Dari {completed} transaksi selesai</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimasi Omset Berjalan</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{formatRpFull(pendingRevenue)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Nilai {process} unit dalam pengerjaan</p>
          </div>
        </div>

        <div className={`rounded-2xl border p-5 shadow-xs flex items-center gap-4 transition-all ${
          emergency > 0
            ? 'bg-red-50/80 border-red-300 text-red-900'
            : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            emergency > 0 ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'bg-slate-100 text-slate-500'
          }`}>
            <Zap size={24} />
          </div>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${emergency > 0 ? 'text-red-700' : 'text-slate-400'}`}>
              Panggilan Darurat Aktif
            </p>
            <p className={`text-xl font-black mt-0.5 ${emergency > 0 ? 'text-red-700' : 'text-slate-900'}`}>
              {emergency} Panggilan SOS
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {emergency > 0 ? 'Mekanik perlu segera menuju lokasi' : 'Tidak ada panggilan darurat aktif'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Row 3: Main Charts (Revenue Area Chart + Status Donut) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <LineIcon size={18} className="text-red-600" />
                <h2 className="font-black text-slate-900 text-sm sm:text-base">Tren Omset & Pendapatan Harian</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Grafik pendapatan real dan estimasi berdasarkan periode terpilih</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                <TrendingUp size={13} /> {formatRp(totalRevenue)} Akumulasi
              </span>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradEstimated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatRp(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#64748b', paddingTop: 10 }} />
                <Area type="monotone" dataKey="Pendapatan" name="Pendapatan Real" stroke="#ef4444" strokeWidth={2.5} fill="url(#gradRevenue)" dot={{ fill: '#ef4444', r: 3 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="Estimasi" name="Estimasi Dalam Proses" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" fill="url(#gradEstimated)" dot={{ fill: '#3b82f6', r: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Donut Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieIcon size={18} className="text-red-600" />
              <h2 className="font-black text-slate-900 text-sm sm:text-base">Distribusi Status SPK</h2>
            </div>
            <p className="text-xs text-slate-400">Rasio seluruh tahapan pengerjaan SPK</p>
          </div>

          <div className="h-[170px] my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {statusData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600 font-medium">{d.name}</span>
                </div>
                <span className="font-bold text-slate-900">
                  {d.value} SPK ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── Row 4: Volume SPK Bar Chart + Top Services Horizontal ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* SPK Volume Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-red-600" />
                <h2 className="font-black text-slate-900 text-sm sm:text-base">Volume Pesanan: Reguler vs Darurat SOS</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Perbandingan jumlah SPK servis rutin dengan panggilan darurat 24 jam</p>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#64748b', paddingTop: 8 }} />
                <Bar dataKey="SPK" name="SPK Reguler" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Darurat" name="Panggilan Darurat 24 Jam" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Services */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wrench size={18} className="text-red-600" />
              <h2 className="font-black text-slate-900 text-sm sm:text-base">Layanan Terpopuler</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">Jenis servis yang paling sering dipesan pelanggan</p>
          </div>

          <div className="space-y-3.5 flex-1">
            {topServices.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-12 border border-dashed border-slate-200 rounded-2xl">
                Belum ada data layanan
              </div>
            ) : (
              topServices.map((s, i) => {
                const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                const barColors = ['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500'];
                return (
                  <div key={s.fullName}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800 truncate max-w-[180px]" title={s.fullName}>
                        {s.name}
                      </span>
                      <span className="font-bold text-slate-600">{s.count} SPK ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColors[i % barColors.length]} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* ─── Row 5: Customer Analytics Charts (Acquisition Source + Type Donut) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Customer Acquisition Sources Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Share2 size={18} className="text-red-600" />
                <h2 className="font-black text-slate-900 text-sm sm:text-base">Sumber Kedatangan Pelanggan (Channel Marketing)</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Tracking efektivitas media akuisisi pelanggan bengkel</p>
            </div>
          </div>

          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerSourceData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={110} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="jumlah" name="Jumlah Pelanggan" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Classification Donut */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award size={18} className="text-red-600" />
              <h2 className="font-black text-slate-900 text-sm sm:text-base">Komposisi Pelanggan</h2>
            </div>
            <p className="text-xs text-slate-400">Rasio Pelanggan Baru vs Pelanggan Lama (Loyal)</p>
          </div>

          <div className="h-[160px] my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={customerTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={4} dataKey="value">
                  {customerTypeData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {customerTypeData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600 font-medium">{d.name}</span>
                </div>
                <span className="font-bold text-slate-900">
                  {d.value} Orang ({customers.length > 0 ? Math.round((d.value / customers.length) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── Row 6: Recent SPK Orders Table ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-black text-slate-900 text-sm sm:text-base">Aktivitas SPK Terbaru (Realtime)</h2>
            <p className="text-xs text-slate-400 mt-0.5">Daftar Surat Perintah Kerja yang baru masuk ke sistem</p>
          </div>
          <button
            onClick={() => onNavigate('crm-orders')}
            className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            <span>Semua SPK</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3.5">NOMOR SPK</th>
                <th className="px-4 py-3.5">PELANGGAN & KENDARAAN</th>
                <th className="px-4 py-3.5">JENIS LAYANAN</th>
                <th className="px-4 py-3.5">LOKASI SERVIS</th>
                <th className="px-4 py-3.5">JADWAL</th>
                <th className="px-4 py-3.5 text-right">TOTAL ESTIMASI</th>
                <th className="px-4 py-3.5 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    Belum ada data pesanan SPK. Klik <strong>"+ Buat SPK Baru"</strong> untuk membuat pesanan pertama.
                  </td>
                </tr>
              ) : (
                recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-mono text-xs font-bold text-slate-800">#{o.id?.slice(0, 8)}</p>
                      {o.isEmergency && (
                        <span className="text-[9px] font-black text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          DARURAT 24J
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 font-black text-xs flex items-center justify-center shrink-0">
                          {o.customerName?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{o.customerName || 'Pelanggan'}</p>
                          <p className="text-[10px] text-slate-400">{o.carBrand} {o.carModel} • {o.licensePlate}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-800 max-w-[160px] truncate">{o.serviceType}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin size={11} className="shrink-0 text-slate-400" />
                        <span className="truncate max-w-[140px] text-[11px]">{o.locationAddress || 'Bengkel'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-700">{o.serviceDate || '-'}</p>
                      <p className="text-[10px] text-slate-400">{o.serviceTime || '-'}</p>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <p className="font-mono font-bold text-slate-900 text-xs">
                        {o.totalPrice ? formatRpFull(o.totalPrice) : <span className="text-slate-300">—</span>}
                      </p>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border uppercase ${
                        STATUS_STYLE[o.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {STATUS_LABEL[o.status] || o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
