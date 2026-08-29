import React, { useMemo } from 'react';
import { TrendingDown, AlertTriangle, Phone, Clock, Users, CheckCircle } from 'lucide-react';
import { CustomerItem } from '../../types';

interface Props { customers: CustomerItem[]; onNavigate: (page: any) => void; }

const daysSince = (iso?: string): number =>
  iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : 9999;

export function CRMCustomerRetention({ customers, onNavigate }: Props) {
  const [filter, setFilter] = React.useState<'all' | '30d' | '60d' | '90d' | '180d'>('90d');

  const inactive = useMemo(() => {
    const thresholds: Record<string, number> = { '30d': 30, '60d': 60, '90d': 90, '180d': 180, all: 0 };
    const minDays = thresholds[filter];
    return customers
      .map(c => ({ ...c, daysSinceLast: daysSince(c.lastServiceDate || c.createdAt) }))
      .filter(c => c.daysSinceLast >= minDays)
      .sort((a, b) => b.daysSinceLast - a.daysSinceLast);
  }, [customers, filter]);

  const churnRisk = inactive.filter(c => c.daysSinceLast >= 90).length;
  const totalInactive = inactive.length;
  const alreadyLost = inactive.filter(c => c.daysSinceLast >= 180).length;

  return (
    <div className="p-5 font-sans bg-[#f4f6fb] min-h-screen space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-0.5"><TrendingDown size={20} className="text-red-600" /><h1 className="text-xl font-black text-slate-900">Retensi & Churn Pelanggan</h1></div>
        <p className="text-xs text-slate-500">Pelanggan yang tidak aktif dan berpotensi churn — kirim reminder WhatsApp langsung</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Tidak Aktif', value: totalInactive, color: 'text-amber-700', bg: 'bg-amber-100' },
          { label: 'Risiko Churn (>90 hari)', value: churnRisk, color: 'text-orange-700', bg: 'bg-orange-100' },
          { label: 'Sudah Hilang (>180 hari)', value: alreadyLost, color: 'text-red-700', bg: 'bg-red-100' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-slate-500">Filter:</span>
          {[
            ['all', 'Semua Pelanggan'],
            ['30d', 'Tidak aktif > 30 hari'],
            ['60d', 'Tidak aktif > 60 hari'],
            ['90d', 'Tidak aktif > 90 hari'],
            ['180d', 'Tidak aktif > 180 hari'],
          ].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v as any)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filter === v ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{l}</button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead><tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
              <th className="px-5 py-3">PELANGGAN</th>
              <th className="px-3 py-3">KENDARAAN</th>
              <th className="px-3 py-3 text-center">TERAKHIR SERVIS</th>
              <th className="px-3 py-3 text-center">HARI TIDAK AKTIF</th>
              <th className="px-3 py-3 text-center">STATUS RISIKO</th>
              <th className="px-3 py-3 text-center">AKSI</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {inactive.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-600">Semua pelanggan masih aktif!</p>
                </td></tr>
              ) : inactive.map(c => {
                const days = c.daysSinceLast;
                const risk = days >= 180 ? { label: 'Hilang', color: 'text-red-700', bg: 'bg-red-50 border-red-200' }
                  : days >= 90 ? { label: 'Risiko Tinggi', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' }
                  : days >= 60 ? { label: 'Perlu Perhatian', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' }
                  : { label: 'Dipantau', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' };
                const waText = `Halo%20${encodeURIComponent(c.name)}%2C%20kami%20dari%20FHR%20Car%20Service.%20Sudah%20lama%20tidak%20servis%2C%20yuk%20jadwalkan%20servis%20kendaraan%20Anda!%20%F0%9F%94%A7%F0%9F%9A%97`;
                return (
                  <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${days >= 180 ? 'bg-red-50/30' : days >= 90 ? 'bg-orange-50/20' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 font-black flex items-center justify-center text-xs">{c.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1"><Phone size={9} />{c.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5"><p className="font-semibold text-slate-700">{c.carBrand} {c.carModel}</p><p className="text-[10px] text-slate-400">{c.licensePlate}</p></td>
                    <td className="px-3 py-3.5 text-center">
                      <p className="font-semibold text-slate-700 flex items-center justify-center gap-1">
                        <Clock size={11} className="text-slate-400" />
                        {c.lastServiceDate ? new Date(c.lastServiceDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </p>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span className={`font-black text-lg ${days >= 180 ? 'text-red-600' : days >= 90 ? 'text-orange-600' : 'text-amber-600'}`}>{days} hari</span>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${risk.bg} ${risk.color}`}>{risk.label}</span>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <a href={`https://wa.me/${c.phone?.replace(/[^0-9]/g, '')}?text=${waText}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-xs">
                        <Phone size={10} /> Kirim Reminder WA
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
