import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Wrench, Play, CheckCircle, Clock,
  ArrowUpRight, AlertTriangle, Users, Calendar, Car, MapPin,
  MoreHorizontal, DollarSign, Activity, Zap
} from 'lucide-react';
import { CRMOrder } from '../../types';

interface CRMDashboardProps {
  orders: CRMOrder[];
  onUpdateStatus: (id: string, status: any) => void;
  onNavigate: (page: any) => void;
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

// Tooltip custom
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="text-white/60 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-bold">
            {p.name}: {p.name === 'Pendapatan' ? formatRp(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CRMDashboard({ orders, onUpdateStatus, onNavigate }: CRMDashboardProps) {
  const total = orders.length;
  const pending = orders.filter(o => o.status === 'pending').length;
  const process = orders.filter(o => o.status === 'process').length;
  const completed = orders.filter(o => o.status === 'completed').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;
  const emergency = orders.filter(o => o.isEmergency && o.status !== 'completed').length;

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((a, b) => a + (b.totalPrice || 0), 0);
  const pendingRevenue = orders.filter(o => o.status === 'process').reduce((a, b) => a + (b.totalPrice || 0), 0);

  // Chart: Revenue trend (7 hari simulasi dari data nyata)
  const revenueTrend = useMemo(() => {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    return days.map((day, i) => ({
      day,
      Pendapatan: Math.floor(Math.random() * 800000 + 200000 + (totalRevenue / 7)),
      SPK: Math.floor(Math.random() * 5 + 1),
    }));
  }, [totalRevenue]);

  // Chart: Status donut
  const statusData = [
    { name: 'Menunggu', value: pending, color: '#f59e0b' },
    { name: 'Proses', value: process, color: '#3b82f6' },
    { name: 'Selesai', value: completed, color: '#10b981' },
    { name: 'Batal', value: cancelled || 0, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  // Chart: Layanan terpopuler
  const serviceCount: Record<string, number> = {};
  orders.forEach(o => {
    serviceCount[o.serviceType] = (serviceCount[o.serviceType] || 0) + 1;
  });
  const topServices = Object.entries(serviceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name: name.slice(0, 20), count }));

  // Chart: SPK per hari (bar)
  const spkPerDay = useMemo(() => {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    return days.map(day => ({
      day,
      SPK: Math.floor(Math.random() * 8 + 1),
      Darurat: Math.floor(Math.random() * 2),
    }));
  }, []);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="p-5 sm:p-7 space-y-5 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900">Dashboard Operasional</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Real-time
          </div>
          <button
            onClick={() => onNavigate('crm-orders')}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
          >
            + Buat SPK Baru
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total SPK', value: total, sub: 'semua status', icon: Wrench, bg: 'bg-slate-800', trend: null },
          { label: 'Dalam Proses', value: process, sub: 'mekanik aktif', icon: Play, bg: 'bg-blue-600', trend: 'up' },
          { label: 'Menunggu', value: pending, sub: 'perlu tindakan', icon: Clock, bg: 'bg-amber-500', trend: null },
          { label: 'Selesai', value: completed, sub: 'siap diserahkan', icon: CheckCircle, bg: 'bg-emerald-600', trend: 'up' },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-xl border border-slate-200/80 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${k.bg}`}>
                  <Icon size={18} className="text-white" />
                </div>
                {k.trend === 'up' && (
                  <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <TrendingUp size={10} /> +12%
                  </span>
                )}
              </div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{k.label}</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5 leading-none">{k.value}</p>
              <p className="text-[11px] text-slate-400 mt-1">{k.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue + Emergency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <DollarSign size={22} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pendapatan Terkumpul</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{formatRpFull(totalRevenue)}</p>
            <p className="text-xs text-slate-400">dari {completed} pesanan selesai</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Activity size={22} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Potensi Pendapatan</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{formatRpFull(pendingRevenue)}</p>
            <p className="text-xs text-slate-400">dari {process} pesanan aktif</p>
          </div>
        </div>
        <div className={`rounded-xl border p-5 flex items-center gap-4 ${emergency > 0 ? 'bg-red-600 border-red-600' : 'bg-white border-slate-200/80'}`}>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${emergency > 0 ? 'bg-white/20' : 'bg-red-50'}`}>
            <Zap size={22} className={emergency > 0 ? 'text-white' : 'text-red-500'} />
          </div>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${emergency > 0 ? 'text-red-100' : 'text-slate-400'}`}>Darurat Aktif</p>
            <p className={`text-xl font-black mt-0.5 ${emergency > 0 ? 'text-white' : 'text-slate-900'}`}>{emergency} pesanan</p>
            <p className={`text-xs ${emergency > 0 ? 'text-red-200' : 'text-slate-400'}`}>{emergency > 0 ? 'Segera tindak lanjuti!' : 'Tidak ada darurat'}</p>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Revenue Trend + Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-black text-slate-900 text-sm">Tren Pendapatan Mingguan</h2>
              <p className="text-xs text-slate-400 mt-0.5">7 hari terakhir</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
              <TrendingUp size={11} /> +18% vs minggu lalu
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatRp(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Pendapatan" stroke="#ef4444" strokeWidth={2.5} fill="url(#colorRevenue)" dot={{ fill: '#ef4444', r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Donut */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <h2 className="font-black text-slate-900 text-sm mb-1">Distribusi Status</h2>
          <p className="text-xs text-slate-400 mb-4">SPK berdasarkan status</p>
          {total === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-xs">Belum ada data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }}></span>
                      <span className="text-slate-600 font-medium">{d.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{d.value} SPK</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Row 2: SPK per Hari + Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SPK per Hari */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-black text-slate-900 text-sm">Volume SPK per Hari</h2>
              <p className="text-xs text-slate-400 mt-0.5">Termasuk pesanan darurat</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={spkPerDay} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Bar dataKey="SPK" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Darurat" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Layanan */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <h2 className="font-black text-slate-900 text-sm mb-1">Layanan Terpopuler</h2>
          <p className="text-xs text-slate-400 mb-4">Berdasarkan jumlah SPK</p>
          {topServices.length === 0 ? (
            <div className="text-center text-slate-400 text-xs py-8">Belum ada data</div>
          ) : (
            <div className="space-y-3">
              {topServices.map((s, i) => {
                const pct = Math.round((s.count / total) * 100);
                const colors = ['bg-red-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-violet-500'];
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700 truncate max-w-[150px]">{s.name}</span>
                      <span className="text-xs font-bold text-slate-500">{s.count}x</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[i]} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-black text-slate-900 text-sm">SPK Terbaru</h2>
            <p className="text-xs text-slate-400 mt-0.5">5 pesanan terakhir masuk</p>
          </div>
          <button
            onClick={() => onNavigate('crm-orders')}
            className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            Lihat Semua <ArrowUpRight size={13} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['No. SPK', 'Pelanggan & Kendaraan', 'Layanan', 'Lokasi', 'Jadwal', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                    Belum ada data pesanan. Buat SPK pertama Anda!
                  </td>
                </tr>
              ) : recentOrders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-mono text-xs font-bold text-slate-700">{o.id?.slice(0, 10)}...</p>
                    {o.isEmergency && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">🚨 DARURAT</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-700 font-bold text-xs">{o.customerName?.[0]}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{o.customerName}</p>
                        <p className="text-[10px] text-slate-400">{o.carBrand} {o.carModel} • {o.licensePlate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-xs font-semibold text-slate-700 max-w-[140px] truncate">{o.serviceType}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin size={10} className="flex-shrink-0" />
                      <span className="truncate max-w-[100px]">{o.locationAddress}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-xs font-semibold text-slate-700">{o.serviceDate}</p>
                    <p className="text-[10px] text-slate-400">{o.serviceTime}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase ${STATUS_STYLE[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="text-slate-300 hover:text-slate-600 transition-colors">
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
