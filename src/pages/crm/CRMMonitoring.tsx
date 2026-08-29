import React, { useState, useMemo } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Wrench,
  Users, CheckCircle, Clock, Calendar, Filter
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { CRMOrder, CustomerItem } from '../../types';

interface CRMMonitoringProps {
  orders: CRMOrder[];
  customers: CustomerItem[];
}

const COLORS = ['#DC2626', '#2563EB', '#059669', '#D97706', '#7C3AED'];
const formatRp = (n: number) => {
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1) + 'jt';
  if (n >= 1000) return 'Rp ' + (n / 1000).toFixed(0) + 'rb';
  return 'Rp ' + n.toLocaleString('id-ID');
};
const formatRpFull = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

const getLast6Months = () => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({ key: d.toISOString().slice(0, 7), label: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }) });
  }
  return months;
};

export function CRMMonitoring({ orders, customers }: CRMMonitoringProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '6m'>('7d');

  // ── KPI Stats ──
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.totalPrice || 0), 0);
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const processOrders = orders.filter(o => o.status === 'process').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const avgTicket = completedOrders > 0 ? totalRevenue / completedOrders : 0;

  // ── Revenue Chart Data ──
  const revenueData = useMemo(() => {
    if (period === '7d') {
      const days = getLast7Days();
      return days.map(day => {
        const dayOrders = orders.filter(o => o.status === 'completed' && o.createdAt?.startsWith(day));
        return {
          label: new Date(day).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
          revenue: dayOrders.reduce((s, o) => s + (o.totalPrice || 0), 0),
          spk: dayOrders.length,
        };
      });
    }
    if (period === '6m') {
      const months = getLast6Months();
      return months.map(m => {
        const mOrders = orders.filter(o => o.status === 'completed' && o.createdAt?.startsWith(m.key));
        return { label: m.label, revenue: mOrders.reduce((s, o) => s + (o.totalPrice || 0), 0), spk: mOrders.length };
      });
    }
    // 30d
    const result = [];
    for (let i = 29; i >= 0; i -= 3) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOrders = orders.filter(o => o.status === 'completed' && o.createdAt?.startsWith(dateStr));
      result.push({ label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), revenue: dayOrders.reduce((s, o) => s + (o.totalPrice || 0), 0), spk: dayOrders.length });
    }
    return result;
  }, [orders, period]);

  // ── Status Pie ──
  const statusData = [
    { name: 'Selesai', value: completedOrders, color: '#059669' },
    { name: 'Proses', value: processOrders, color: '#2563EB' },
    { name: 'Menunggu', value: pendingOrders, color: '#D97706' },
    { name: 'Dibatal', value: orders.filter(o => o.status === 'cancelled').length, color: '#94A3B8' },
  ].filter(d => d.value > 0);

  // ── Top Mekanik ──
  const mekanikStats = useMemo(() => {
    const map: Record<string, number> = {};
    orders.filter(o => o.status === 'completed' && o.mekanikName).forEach(o => {
      map[o.mekanikName!] = (map[o.mekanikName!] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  }, [orders]);

  // ── Service Type Chart ──
  const serviceTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => {
      const svc = o.serviceType || 'Lainnya';
      map[svc] = (map[svc] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs shadow-xl">
          <p className="text-slate-500 mb-1 font-bold">{label}</p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex justify-between gap-4">
              <span className="text-slate-600">{p.name}:</span>
              <span className="font-black text-slate-900">
                {p.name === 'Revenue' || p.name === 'Pendapatan' ? formatRpFull(p.value) : p.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 font-sans bg-[#f4f6fb] min-h-screen space-y-5">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <BarChart3 size={20} className="text-red-600" />
              <h1 className="text-xl font-black text-slate-900">Monitoring & Laporan</h1>
            </div>
            <p className="text-xs text-slate-500">Grafik kinerja bengkel secara real-time berdasarkan data SPK</p>
          </div>
          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {([['7d', '7 Hari'], ['30d', '30 Hari'], ['6m', '6 Bulan']] as const).map(([v, l]) => (
              <button key={v} onClick={() => setPeriod(v)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${period === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Revenue', value: formatRp(totalRevenue), sub: 'Dari SPK selesai', icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-100' },
          { label: 'SPK Selesai', value: completedOrders, sub: 'Total terkompletasi', icon: CheckCircle, color: 'text-blue-700', bg: 'bg-blue-100' },
          { label: 'Sedang Proses', value: processOrders, sub: 'SPK aktif dikerjakan', icon: Wrench, color: 'text-amber-700', bg: 'bg-amber-100' },
          { label: 'Menunggu', value: pendingOrders, sub: 'Belum diproses', icon: Clock, color: 'text-purple-700', bg: 'bg-purple-100' },
          { label: 'Rata-rata / SPK', value: formatRp(avgTicket), sub: 'Average ticket size', icon: TrendingUp, color: 'text-red-700', bg: 'bg-red-100' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{k.label}</p>
              <div className={`w-7 h-7 rounded-xl ${k.bg} flex items-center justify-center`}>
                <k.icon size={14} className={k.color} />
              </div>
            </div>
            <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-black text-slate-900 mb-4">📈 Grafik Pendapatan & Jumlah SPK</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => formatRp(v)} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="#DC2626" strokeWidth={2} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Status Pie */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 mb-4">🥧 Status SPK</h2>
          {statusData.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-10">Belum ada data</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v + ' SPK', n]} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Mekanik */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 mb-4">🔧 Top 5 Mekanik</h2>
          {mekanikStats.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-10">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {mekanikStats.map((m, i) => (
                <div key={m.name} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : 'bg-red-600'}`}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">{m.name}</span>
                      <span className="text-xs font-black text-red-600">{m.count} SPK</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-red-500 h-1.5 rounded-full transition-all" style={{ width: `${(m.count / (mekanikStats[0]?.count || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service Type */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 mb-4">🛠️ Jenis Layanan Terbanyak</h2>
          {serviceTypeData.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-10">Belum ada data</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={serviceTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={100} />
                <Tooltip />
                <Bar dataKey="value" name="SPK" radius={[0, 4, 4, 0]}>
                  {serviceTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
