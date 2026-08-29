import React, { useMemo } from 'react';
import { Star, Crown, AlertTriangle, Users, TrendingDown, Phone } from 'lucide-react';
import { CustomerItem, CRMOrder } from '../../types';

interface Props { customers: CustomerItem[]; orders: CRMOrder[]; onNavigate: (page: any) => void; }

type RFMSegment = 'Champion' | 'Loyal' | 'Potential' | 'At Risk' | 'Lost';

const SEGMENT_CONFIG: Record<RFMSegment, { label: string; color: string; bg: string; border: string; icon: any; desc: string }> = {
  Champion: { label: 'Champion', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-300', icon: Crown, desc: 'Pelanggan terbaik — sering beli, belanja banyak, baru saja' },
  Loyal:    { label: 'Loyal',    color: 'text-blue-800',  bg: 'bg-blue-50',  border: 'border-blue-300',  icon: Star, desc: 'Pelanggan setia — belanja cukup sering' },
  Potential:{ label: 'Potential',color: 'text-emerald-800',bg:'bg-emerald-50',border:'border-emerald-300',icon: Star, desc: 'Potensi besar — satu atau dua kali servis' },
  'At Risk': { label: 'At Risk', color: 'text-orange-800', bg: 'bg-orange-50', border: 'border-orange-300', icon: AlertTriangle, desc: 'Mulai tidak aktif — perlu follow-up segera' },
  Lost:     { label: 'Hilang',   color: 'text-red-800',   bg: 'bg-red-50',   border: 'border-red-300',   icon: TrendingDown, desc: 'Sudah lama tidak servis — kemungkinan pindah bengkel' },
};

const getRFMSegment = (customer: CustomerItem): RFMSegment => {
  const daysSinceLast = customer.lastServiceDate
    ? Math.floor((Date.now() - new Date(customer.lastServiceDate).getTime()) / (1000 * 86400))
    : 999;
  const freq = customer.totalOrdersCount || 0;
  const monetary = customer.totalSpent || 0;
  if (daysSinceLast <= 30 && freq >= 3 && monetary >= 500000) return 'Champion';
  if (freq >= 2 && monetary >= 200000) return 'Loyal';
  if (daysSinceLast > 90 && freq >= 2) return 'At Risk';
  if (daysSinceLast > 180) return 'Lost';
  return 'Potential';
};

const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
const daysSince = (iso?: string) => iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : null;

export function CRMCustomerRFM({ customers, orders, onNavigate }: Props) {
  const [filterSeg, setFilterSeg] = React.useState<RFMSegment | 'Semua'>('Semua');

  const rfmData = useMemo(() =>
    customers.map(c => ({ ...c, segment: getRFMSegment(c) })),
    [customers]
  );

  const filtered = filterSeg === 'Semua' ? rfmData : rfmData.filter(c => c.segment === filterSeg);

  const segCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rfmData.forEach(c => { counts[c.segment] = (counts[c.segment] || 0) + 1; });
    return counts;
  }, [rfmData]);

  return (
    <div className="p-5 font-sans bg-[#f4f6fb] min-h-screen space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-0.5"><Star size={20} className="text-amber-500" /><h1 className="text-xl font-black text-slate-900">Segmentasi RFM Pelanggan</h1></div>
        <p className="text-xs text-slate-500">Recency, Frequency, Monetary — klasifikasi otomatis berdasarkan perilaku servis</p>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(SEGMENT_CONFIG) as RFMSegment[]).map(seg => {
          const cfg = SEGMENT_CONFIG[seg];
          const count = segCounts[seg] || 0;
          return (
            <button
              key={seg}
              onClick={() => setFilterSeg(prev => prev === seg ? 'Semua' : seg)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${filterSeg === seg ? `${cfg.bg} ${cfg.border}` : 'bg-white border-slate-200 hover:border-slate-300'}`}
            >
              <div className={`w-8 h-8 rounded-xl ${filterSeg === seg ? cfg.bg : 'bg-slate-100'} flex items-center justify-center mb-2`}>
                <cfg.icon size={16} className={filterSeg === seg ? cfg.color : 'text-slate-500'} />
              </div>
              <p className={`text-2xl font-black ${filterSeg === seg ? cfg.color : 'text-slate-900'}`}>{count}</p>
              <p className={`text-[11px] font-bold ${filterSeg === seg ? cfg.color : 'text-slate-500'}`}>{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <p className="text-sm font-black text-slate-900">
            {filterSeg === 'Semua' ? `Semua Pelanggan (${rfmData.length})` : `${SEGMENT_CONFIG[filterSeg as RFMSegment]?.label} (${filtered.length})`}
          </p>
          {filterSeg !== 'Semua' && (
            <p className="text-xs text-slate-500">{SEGMENT_CONFIG[filterSeg as RFMSegment]?.desc}</p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead><tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
              <th className="px-5 py-3">PELANGGAN</th>
              <th className="px-3 py-3 text-center">SEGMEN</th>
              <th className="px-3 py-3 text-center">RECENCY (hari)</th>
              <th className="px-3 py-3 text-center">FREQUENCY (SPK)</th>
              <th className="px-3 py-3 text-right">MONETARY</th>
              <th className="px-3 py-3 text-center">AKSI</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Tidak ada pelanggan di segmen ini</td></tr>
              ) : filtered.map(c => {
                const cfg = SEGMENT_CONFIG[c.segment];
                const recency = daysSince(c.lastServiceDate);
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 font-black flex items-center justify-center text-xs">{c.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <p className="text-[10px] text-slate-400">{c.carBrand} {c.carModel} • {c.licensePlate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        <cfg.icon size={9} />{cfg.label}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      {recency !== null ? (
                        <span className={`font-bold ${recency > 90 ? 'text-red-600' : recency > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {recency} hari
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-3.5 text-center"><span className="font-bold text-blue-700">{c.totalOrdersCount || 0}x</span></td>
                    <td className="px-3 py-3.5 text-right"><span className="font-black text-emerald-700">{formatRp(c.totalSpent || 0)}</span></td>
                    <td className="px-3 py-3.5 text-center">
                      <a href={`https://wa.me/${c.phone?.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(c.name)}%2C%20kami%20dari%20FHR%20Car%20Service%20mengundang%20Anda%20untuk%20servis%20berkala.`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] hover:bg-emerald-100 transition-colors">
                        <Phone size={10} /> WA
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
