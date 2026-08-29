import React, { useMemo } from 'react';
import { BarChart3, Users, TrendingUp, DollarSign, Calendar, Star, Award, ArrowRight, Phone } from 'lucide-react';
import { CustomerItem, CRMOrder } from '../../types';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props { customers: CustomerItem[]; orders: CRMOrder[]; onNavigate: (page: any) => void; }

const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

export function CRMCustomerAnalysis({ customers, orders, onNavigate }: Props) {
  const totalBaru = customers.filter(c => c.customerType === 'BARU' || !c.customerType).length;
  const totalLama = customers.filter(c => c.customerType === 'LAMA').length;
  const totalRevenue = customers.reduce((s, c) => s + (c.totalSpent || 0), 0);
  const avgSpend = customers.length > 0 ? totalRevenue / customers.length : 0;

  // Monthly registration trend (last 6 months)
  const monthlyData = useMemo(() => {
    const months: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      months.push({ key: d.toISOString().slice(0, 7), label: d.toLocaleDateString('id-ID', { month: 'short' }) });
    }
    return months.map(m => ({
      label: m.label,
      baru: customers.filter(c => c.createdAt?.startsWith(m.key) && (c.customerType === 'BARU' || !c.customerType)).length,
      lama: customers.filter(c => c.createdAt?.startsWith(m.key) && c.customerType === 'LAMA').length,
    }));
  }, [customers]);

  // Top 10 customers by spending
  const topCustomers = useMemo(() =>
    [...customers].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0)).slice(0, 10),
    [customers]
  );

  // Car brand distribution
  const brandDist = useMemo(() => {
    const map: Record<string, number> = {};
    customers.forEach(c => { map[c.carBrand] = (map[c.carBrand] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [customers]);

  const COLORS = ['#DC2626', '#2563EB', '#059669', '#D97706', '#7C3AED', '#EC4899'];

  return (
    <div className="p-5 font-sans bg-[#f4f6fb] min-h-screen space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-0.5"><BarChart3 size={20} className="text-red-600" /><h1 className="text-xl font-black text-slate-900">Analisa Pelanggan</h1></div>
        <p className="text-xs text-slate-500">Statistik dan analisa mendalam data pelanggan bengkel</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pelanggan', value: customers.length, sub: 'Terdaftar di sistem', icon: Users, color: 'text-slate-900', bg: 'bg-slate-100' },
          { label: 'Pelanggan Baru', value: totalBaru, sub: 'Kunjungan pertama', icon: Star, color: 'text-emerald-700', bg: 'bg-emerald-100' },
          { label: 'Pelanggan Loyal', value: totalLama, sub: 'Repeat customer', icon: Award, color: 'text-amber-700', bg: 'bg-amber-100' },
          { label: 'Avg. Pengeluaran', value: formatRp(avgSpend), sub: 'Per pelanggan', icon: DollarSign, color: 'text-blue-700', bg: 'bg-blue-100' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">{k.label}</p>
              <div className={`w-7 h-7 rounded-xl ${k.bg} flex items-center justify-center`}><k.icon size={14} className={k.color} /></div>
            </div>
            <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 mb-4">📅 Tren Registrasi 6 Bulan Terakhir</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="baru" name="Pelanggan Baru" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lama" name="Pelanggan Lama" fill="#D97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Brand Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 mb-4">🚗 Distribusi Merek Kendaraan</h2>
          {brandDist.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-10">Belum ada data</p>
          ) : (
            <div className="space-y-3 mt-2">
              {brandDist.map((b, i) => (
                <div key={b.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-20 text-right">{b.name}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full transition-all" style={{ width: `${(b.value / (brandDist[0]?.value || 1)) * 100}%`, backgroundColor: COLORS[i] }} />
                  </div>
                  <span className="text-xs font-black text-slate-700 w-8">{b.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top 10 Customers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-black text-slate-900">🏆 Top 10 Pelanggan Berdasarkan Total Belanja</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead><tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
              <th className="px-5 py-3">#</th><th className="px-3 py-3">Nama Pelanggan</th><th className="px-3 py-3">Kendaraan</th>
              <th className="px-3 py-3 text-center">Total SPK</th><th className="px-3 py-3 text-right">Total Belanja</th><th className="px-3 py-3 text-center">Tipe</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {topCustomers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Belum ada data pelanggan</td></tr>
              ) : topCustomers.map((c, i) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-600' : 'bg-slate-200 text-slate-600'}`}>{i + 1}</span>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 font-black flex items-center justify-center text-xs">{c.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1"><Phone size={9} />{c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5"><p className="font-semibold text-slate-700">{c.carBrand} {c.carModel}</p><p className="text-[10px] text-slate-400">{c.licensePlate}</p></td>
                  <td className="px-3 py-3.5 text-center"><span className="font-bold text-blue-700">{c.totalOrdersCount || 0} SPK</span></td>
                  <td className="px-3 py-3.5 text-right"><span className="font-black text-emerald-700">{formatRp(c.totalSpent || 0)}</span></td>
                  <td className="px-3 py-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${c.customerType === 'LAMA' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>{c.customerType || 'BARU'}</span>
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
