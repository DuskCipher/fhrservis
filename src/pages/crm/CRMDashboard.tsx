import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, Wrench, Play, CheckCircle, Clock,
  ArrowUpRight, Users, Calendar, Car, MapPin,
  MoreHorizontal, DollarSign, Activity, Zap, FileSpreadsheet
} from 'lucide-react';
import { CRMOrder } from '../../types';

interface CRMDashboardProps {
  orders: CRMOrder[];
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
  pending:   'bg-amber-100 text-amber-700',
  process:   'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500',
};
const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu', process: 'Proses', completed: 'Selesai', cancelled: 'Batal'
};

// Custom Recharts Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl font-sans">
        <p className="text-white/60 mb-1 font-semibold">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-bold">
            {p.name}: {p.name === 'Pendapatan' ? formatRpFull(p.value) : `${p.value} pesanan`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CRMDashboard({ orders, onUpdateStatus, onNavigate, onBuatSPK }: CRMDashboardProps) {
  const total = orders.length;
  const pending = orders.filter(o => o.status === 'pending').length;
  const process = orders.filter(o => o.status === 'process').length;
  const completed = orders.filter(o => o.status === 'completed').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;
  const emergency = orders.filter(o => o.isEmergency && o.status !== 'completed').length;

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((a, b) => a + (b.totalPrice || 0), 0);
  const pendingRevenue = orders.filter(o => o.status === 'process').reduce((a, b) => a + (b.totalPrice || 0), 0);

  // ─── REAL CALCULATION: 7 HARI TERAKHIR DARI DATA SEBENARNYA ──────────
  const { revenueTrend, spkPerDay } = useMemo(() => {
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const resultRevenue = [];
    const resultSpk = [];

    const now = new Date();
    // Build 7 calendar days from 6 days ago up to today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayDateStr = d.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      const label = i === 0 ? 'Hari Ini' : `${dayNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`;

      // Filter orders on this specific date
      const matchingOrders = orders.filter(o => {
        if (!o.createdAt) return false;
        try {
          const orderDateStr = new Date(o.createdAt).toISOString().split('T')[0];
          return orderDateStr === dayDateStr;
        } catch {
          return false;
        }
      });

      // Real completed revenue on this date
      const dayRevenue = matchingOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      // Real SPK volume & Emergency count
      const daySpkCount = matchingOrders.length;
      const dayEmergencyCount = matchingOrders.filter(o => o.isEmergency).length;

      resultRevenue.push({
        day: label,
        Pendapatan: dayRevenue,
        SPK: daySpkCount,
      });

      resultSpk.push({
        day: label,
        SPK: daySpkCount,
        Darurat: dayEmergencyCount,
      });
    }

    return { revenueTrend: resultRevenue, spkPerDay: resultSpk };
  }, [orders]);

  // ─── REAL STATUS PIE DONUT DATA ────────────────────────────────────
  const statusData = useMemo(() => [
    { name: 'Menunggu', value: pending, color: '#f59e0b' },
    { name: 'Proses', value: process, color: '#3b82f6' },
    { name: 'Selesai', value: completed, color: '#10b981' },
    { name: 'Batal', value: cancelled, color: '#94a3b8' },
  ].filter(d => d.value > 0), [pending, process, completed, cancelled]);

  // ─── REAL TOP SERVICES DATA ────────────────────────────────────────
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
      .map(([name, count]) => ({ name, count }));
  }, [orders]);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="p-4 sm:p-7 space-y-5 max-w-[1600px] mx-auto font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900">Dashboard Operasional</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Data Realtime Database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('crm-customers')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-slate-200"
          >
            <Users size={14} className="text-red-600" />
            <span>Data Pelanggan</span>
          </button>
          <button
            onClick={() => onBuatSPK ? onBuatSPK() : onNavigate('crm-customers')}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/20"
          >
            + Buat SPK Baru
          </button>
        </div>
      </div>

      {/* KPI Row (Real Numbers) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total SPK', value: total, sub: 'Semua Pesanan Masuk', icon: Wrench, bg: 'bg-slate-800' },
          { label: 'Dalam Proses', value: process, sub: 'Mekanik Sedang Menangani', icon: Play, bg: 'bg-blue-600' },
          { label: 'Menunggu Antrean', value: pending, sub: 'Perlu Konfirmasi', icon: Clock, bg: 'bg-amber-500' },
          { label: 'Pekerjaan Selesai', value: completed, sub: 'Telah Dituntaskan', icon: CheckCircle, bg: 'bg-emerald-600' },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${k.bg} shadow-xs`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{k.label}</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5 leading-none">{k.value}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">{k.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue + Emergency Row (Real Numbers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <DollarSign size={22} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pendapatan Real (Selesai)</p>
            <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">{formatRpFull(totalRevenue)}</p>
            <p className="text-xs text-slate-400">Total dari {completed} pesanan berstatus selesai</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Activity size={22} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimasi Omset Aktif</p>
            <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">{formatRpFull(pendingRevenue)}</p>
            <p className="text-xs text-slate-400">Total nilai {process} pesanan sedang dikerjakan</p>
          </div>
        </div>
        
        <div className={`rounded-xl border p-4 sm:p-5 flex items-center gap-4 shadow-2xs transition-colors ${emergency > 0 ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-200/80'}`}>
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs ${emergency > 0 ? 'bg-white/20' : 'bg-red-50'}`}>
            <Zap size={22} className={emergency > 0 ? 'text-white' : 'text-red-500'} />
          </div>
          <div>
            <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${emergency > 0 ? 'text-red-100' : 'text-slate-400'}`}>Panggilan Darurat Aktif</p>
            <p className={`text-lg sm:text-xl font-black mt-0.5 ${emergency > 0 ? 'text-white' : 'text-slate-900'}`}>{emergency} SPK Darurat</p>
            <p className={`text-xs ${emergency > 0 ? 'text-red-200' : 'text-slate-400'}`}>{emergency > 0 ? 'Perlu tindakan mekanik cepat!' : 'Tidak ada panggilan darurat aktif'}</p>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Real Revenue Trend + Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-black text-slate-900 text-sm">Tren Pendapatan Harian (Real)</h2>
              <p className="text-xs text-slate-400 mt-0.5">Akumulasi transaksi 7 hari terakhir berdasarkan database</p>
            </div>
            {totalRevenue > 0 && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1">
                <TrendingUp size={11} /> {formatRp(totalRevenue)} Total
              </span>
            )}
          </div>

          {totalRevenue === 0 && orders.length === 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
              <FileSpreadsheet size={24} className="text-slate-300 mb-1" />
              <p className="font-semibold text-slate-600">Belum ada transaksi di database</p>
              <p className="text-[11px] text-slate-400">Grafik akan terisi otomatis saat SPK dibuat & diselesaikan</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatRp(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Pendapatan" stroke="#ef4444" strokeWidth={2.5} fill="url(#colorRevenue)" dot={{ fill: '#ef4444', r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Donut Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="font-black text-slate-900 text-sm mb-0.5">Distribusi Status SPK</h2>
            <p className="text-xs text-slate-400 mb-3">Persentase status pesanan aktif</p>
          </div>

          {total === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
              Belum ada pesanan SPK
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }}></span>
                      <span className="text-slate-600 font-medium">{d.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{d.value} SPK ({Math.round((d.value / total) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Row 2: Real Volume SPK per Hari + Real Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* SPK per Hari Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-black text-slate-900 text-sm">Volume Pesanan SPK (Real)</h2>
              <p className="text-xs text-slate-400 mt-0.5">Jumlah SPK reguler vs panggilan darurat per hari</p>
            </div>
          </div>

          {total === 0 ? (
            <div className="h-[180px] flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
              <p className="font-semibold text-slate-600">Belum ada aktivitas pesanan</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={spkPerDay} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                <Bar dataKey="SPK" name="Total SPK" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Darurat" name="Darurat 24 Jam" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Real Top Layanan */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
          <h2 className="font-black text-slate-900 text-sm mb-0.5">Layanan Terpopuler</h2>
          <p className="text-xs text-slate-400 mb-3">Berdasarkan data pesanan nyata</p>
          
          {topServices.length === 0 ? (
            <div className="text-center text-slate-400 text-xs py-10 border border-dashed border-slate-200 rounded-lg">
              Belum ada data layanan
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {topServices.map((s, i) => {
                const pct = Math.round((s.count / total) * 100);
                const colors = ['bg-red-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-violet-500'];
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700 truncate max-w-[170px]">{s.name}</span>
                      <span className="text-xs font-bold text-slate-600">{s.count} pesanan ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table (Real Firestore Orders) */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100">
          <div>
            <h2 className="font-black text-slate-900 text-sm">Pesanan SPK Terbaru (Realtime)</h2>
            <p className="text-xs text-slate-400 mt-0.5">Daftar pesanan terbaru dari database</p>
          </div>
          <button
            onClick={() => onNavigate('crm-orders')}
            className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            Lihat Semua SPK <ArrowUpRight size={13} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                {['No. SPK', 'Pelanggan & Kendaraan', 'Layanan', 'Lokasi', 'Jadwal', 'Nilai', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 text-xs">
                    Belum ada pesanan di database. Klik tombol <strong>"+ Buat SPK Baru"</strong> untuk membuat pesanan pertama!
                  </td>
                </tr>
              ) : recentOrders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="font-mono text-xs font-bold text-slate-700">#{o.id?.slice(0, 8)}</p>
                    {o.isEmergency && (
                      <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                        DARURAT 24J
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-100 to-red-200 text-red-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {o.customerName?.[0]?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{o.customerName || 'Pelanggan'}</p>
                        <p className="text-[10px] text-slate-400">{o.carBrand} {o.carModel} • {o.licensePlate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-semibold text-slate-700 max-w-[140px] truncate">{o.serviceType}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin size={11} className="flex-shrink-0 text-slate-400" />
                      <span className="truncate max-w-[120px]">{o.locationAddress}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-semibold text-slate-700">{o.serviceDate || '-'}</p>
                    <p className="text-[10px] text-slate-400">{o.serviceTime || '-'}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-800 font-mono text-xs">{o.totalPrice ? formatRp(o.totalPrice) : '-'}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_STYLE[o.status] || 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_LABEL[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => onNavigate('crm-orders')}
                      className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                      title="Lihat Detail"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
