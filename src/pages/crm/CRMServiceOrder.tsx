import React, { useState } from 'react';
import { 
  Search, Filter, Eye, Phone, Printer, X, CheckCircle, 
  AlertCircle, Clock, ChevronDown, MapPin, User, Car, 
  Calendar, MessageSquare, RefreshCw, Plus
} from 'lucide-react';
import { CRMOrder, OrderStatus } from '../../types';

interface CRMServiceOrderProps {
  orders: CRMOrder[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  compact?: boolean;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; classes: string; dot: string }> = {
  pending:   { label: 'DRAFT',   classes: 'bg-slate-100 text-slate-700',   dot: 'bg-slate-400' },
  process:   { label: 'PROSES',  classes: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500' },
  completed: { label: 'SELESAI', classes: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'BATAL',   classes: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
};

const TYPE_CONFIG: Record<string, string> = {
  LAMA:  'bg-slate-200 text-slate-700',
  BARU:  'bg-teal-100 text-teal-700',
};

export function CRMServiceOrder({ orders, onUpdateStatus, compact = false }: CRMServiceOrderProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [detailOrder, setDetailOrder] = useState<CRMOrder | null>(null);

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(prev => prev.length === filtered.length ? [] : filtered.map(o => o.id));

  const getCustomerType = (o: CRMOrder) => o.isEmergency ? 'BARU' : 'LAMA';

  const formatRp = (n?: number) => n ? 'Rp ' + n.toLocaleString('id-ID') : 'Rp 0';

  if (compact) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="px-4 py-2.5 text-left font-semibold">NO.</th>
              <th className="px-4 py-2.5 text-left font-semibold">NO. SPK</th>
              <th className="px-4 py-2.5 text-left font-semibold">CUSTOMER & MOBIL</th>
              <th className="px-4 py-2.5 text-left font-semibold">LAYANAN</th>
              <th className="px-4 py-2.5 text-left font-semibold">STATUS</th>
              <th className="px-4 py-2.5 text-right font-semibold">TOTAL BIAYA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o, idx) => {
              const cfg = STATUS_CONFIG[o.status];
              return (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-medium">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-700">{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{o.customerName}</p>
                    <p className="text-slate-400">{o.carBrand} {o.carModel} • {o.licensePlate}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{o.serviceType}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cfg.classes}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-700">{formatRp(o.totalPrice)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 space-y-4">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-black text-slate-900">Service Order</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manajemen Surat Perintah Kerja (SPK) Bengkel</p>
            {/* Revenue stats */}
            <div className="flex flex-wrap gap-4 mt-3">
              {[
                { label: 'SETORAN HARI INI', val: formatRp(orders.filter(o => o.status === 'completed').reduce((a, b) => a + (b.totalPrice || 0), 0)), sub: 'Bengkel FHRCAR Pan...' },
                { label: 'LABA', val: formatRp(orders.filter(o => o.status !== 'cancelled').reduce((a, b) => a + (b.totalPrice || 0) * 0.3, 0)) },
                { label: 'TAGIHAN', val: formatRp(orders.filter(o => o.status === 'process').reduce((a, b) => a + (b.totalPrice || 0), 0)) },
                { label: 'TOTAL', val: formatRp(orders.reduce((a, b) => a + (b.totalPrice || 0), 0)), highlight: true },
              ].map((s, i) => (
                <div key={i} className={`${s.highlight ? 'text-red-600' : 'text-slate-700'}`}>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">{s.label}</p>
                  {s.sub && <p className="text-[10px] text-slate-400 truncate max-w-[100px]">{s.sub}</p>}
                  <p className={`text-sm font-black ${s.highlight ? 'text-red-600' : 'text-slate-800'}`}>{s.val}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              <RefreshCw size={13} />
              Arsip Lama
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
              <Plus size={13} />
              Estimasi Cepat
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Plus size={13} />
              Buat SPK Baru
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'TOTAL AKTIF', val: orders.filter(o => o.status !== 'cancelled').length, sub: 'Filter Sub-Area', icon: '🔧', color: 'text-slate-900' },
          { label: 'DALAM PENGERJAAN', val: orders.filter(o => o.status === 'process').length, sub: 'Mekanik Pelaksana', suffix: ' SPK', icon: '▶', color: 'text-blue-600' },
          { label: 'TAHAP INSPEKSI', val: orders.filter(o => o.status === 'pending').length, sub: 'Permintaan Aksi', suffix: ' SPK', icon: '⏱', color: 'text-amber-500' },
          { label: 'SELESAI', val: orders.filter(o => o.status === 'completed').length, sub: 'Siap Diserahkan', suffix: ' SPK', icon: '✓', color: 'text-emerald-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 px-5 py-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.val}<span className="text-sm font-semibold">{s.suffix}</span></p>
            <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500">FILTER STATUS:</span>
          {(['all', 'pending', 'process', 'completed', 'cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors border ${
                filterStatus === s
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? `Semua (${orders.length})` : STATUS_CONFIG[s as OrderStatus]?.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <span>📍</span>
            Bengkel FHRCAR Panggilan
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-slate-400 outline-none w-48"
              placeholder="Cari Plat No, SPK, Customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="pl-4 pr-2 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded accent-red-600"
                  />
                </th>
                {['NO.', 'TIPE', 'NO. SPK', 'CUSTOMER & MOBIL', 'CABANG ASAL', 'SUMBER INFO', 'SA', 'MEKANIK', 'KEP. MEKANIK', 'TANGGAL MASUK', 'STATUS', 'ESTIMASI TIM', 'TOTAL BIAYA', 'AKSI'].map(h => (
                  <th key={h} className="px-3 py-3 text-left font-semibold text-[10px] tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={15} className="text-center py-16 text-slate-400 text-sm">
                    Tidak ada data pesanan yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((o, idx) => {
                  const cfg = STATUS_CONFIG[o.status];
                  const type = getCustomerType(o);
                  const isSelected = selected.includes(o.id);
                  return (
                    <tr key={o.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                      <td className="pl-4 pr-2 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(o.id)}
                          className="w-3.5 h-3.5 rounded accent-red-600"
                        />
                      </td>
                      <td className="px-3 py-3 text-slate-500 font-medium">{idx + 1}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${TYPE_CONFIG[type] || 'bg-slate-100 text-slate-600'}`}>
                          {type}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-mono font-semibold text-slate-700 whitespace-nowrap">{o.id}</p>
                        <p className="text-slate-400">{o.serviceDate}</p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-start gap-1.5">
                          <User size={11} className="text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-800 whitespace-nowrap">{o.customerName}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Car size={10} className="text-slate-400 flex-shrink-0" />
                              <p className="text-slate-400 whitespace-nowrap">{o.carBrand} {o.carModel} — {o.licensePlate}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-slate-600 font-medium whitespace-nowrap">FHRCAR Panggilan</p>
                        <p className="text-slate-400 text-[10px] whitespace-nowrap">{o.locationAddress?.slice(0, 18)}...</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${o.isEmergency ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'}`}>
                          {o.isEmergency ? '🚨 Darurat' : '📱 Booking SA'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600 font-medium">SA</td>
                      <td className="px-3 py-3 text-slate-500">—</td>
                      <td className="px-3 py-3 text-slate-500">—</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 text-slate-500 whitespace-nowrap">
                          <Calendar size={10} />
                          {o.serviceDate}
                        </div>
                        <p className="text-slate-400 text-[10px]">{o.serviceTime}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap ${cfg.classes}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-500">—</td>
                      <td className="px-3 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatRp(o.totalPrice)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDetailOrder(o)}
                            title="Detail"
                            className="w-7 h-7 rounded flex items-center justify-center bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            title="Hubungi"
                            className="w-7 h-7 rounded flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          >
                            <Phone size={13} />
                          </button>
                          <button
                            title="Cetak"
                            className="w-7 h-7 rounded flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Printer size={13} />
                          </button>
                          <button
                            onClick={() => {
                              const next: Record<OrderStatus, OrderStatus> = { pending: 'process', process: 'completed', completed: 'cancelled', cancelled: 'pending' };
                              onUpdateStatus(o.id, next[o.status]);
                            }}
                            title="Batalkan"
                            className="w-7 h-7 rounded flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <X size={13} />
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

      {/* Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDetailOrder(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">Detail SPK</h2>
                <p className="text-xs text-slate-400 font-mono">{detailOrder.id}</p>
              </div>
              <button onClick={() => setDetailOrder(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Data Pelanggan</p>
                  <p className="font-bold text-slate-800">{detailOrder.customerName}</p>
                  <p className="text-sm text-slate-500">{detailOrder.phone}</p>
                  <div className="flex items-start gap-1 mt-1">
                    <MapPin size={11} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-500">{detailOrder.locationAddress}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Kendaraan</p>
                  <p className="font-bold text-slate-800">{detailOrder.carBrand} {detailOrder.carModel} ({detailOrder.carYear})</p>
                  <p className="text-sm text-slate-500 font-mono">{detailOrder.licensePlate}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Layanan</p>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-800">{detailOrder.serviceType}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Jadwal: {detailOrder.serviceDate} • {detailOrder.serviceTime}</p>
                    {detailOrder.notes && <p className="text-xs text-slate-600 mt-2 bg-white p-2 rounded-lg border border-slate-200">{detailOrder.notes}</p>}
                  </div>
                  {detailOrder.isEmergency && (
                    <span className="px-2 py-1 rounded text-[10px] font-black bg-red-100 text-red-700 uppercase flex-shrink-0">🚨 Darurat</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Ubah Status</p>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'process', 'completed', 'cancelled'] as OrderStatus[]).map(s => {
                    const cfg = STATUS_CONFIG[s];
                    const isActive = detailOrder.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => { onUpdateStatus(detailOrder.id, s); setDetailOrder({ ...detailOrder, status: s }); }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${isActive ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 bg-slate-50 rounded-b-2xl border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setDetailOrder(null)} className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
