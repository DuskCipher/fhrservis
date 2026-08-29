import React, { useState } from 'react';
import { GitMerge, Search, Plus, Car, ArrowRight, UserCheck, CheckCircle, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { CustomerItem } from '../../types';

interface Props {
  customers: CustomerItem[];
  onNavigate: (page: any) => void;
}

interface MutationRecord {
  id: string;
  plateNumber: string;
  carBrand: string;
  carModel: string;
  prevOwner: string;
  newOwner: string;
  mutationDate: string;
  notes: string;
}

export function CRMCustomerMutation({ customers, onNavigate }: Props) {
  const [search, setSearch] = useState('');
  const [mutations, setMutations] = useState<MutationRecord[]>([
    {
      id: 'MUT-001',
      plateNumber: 'B 1234 ABC',
      carBrand: 'Toyota',
      carModel: 'Avanza 1.3 G',
      prevOwner: 'Budi Santoso',
      newOwner: 'Hendrik Pratama',
      mutationDate: '2026-08-20',
      notes: 'Jual beli unit tangan kedua, riwayat servis diteruskan',
    }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    plateNumber: '',
    carBrand: '',
    carModel: '',
    prevOwner: '',
    newOwner: '',
    notes: '',
  });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plateNumber || !form.newOwner) {
      alert('Plat nomor dan pemilik baru wajib diisi!');
      return;
    }
    const newRecord: MutationRecord = {
      id: 'MUT-' + Math.floor(100 + Math.random() * 900),
      plateNumber: form.plateNumber.toUpperCase(),
      carBrand: form.carBrand || 'Kendaraan',
      carModel: form.carModel || '',
      prevOwner: form.prevOwner || 'Pemilik Sebelumnya',
      newOwner: form.newOwner,
      mutationDate: new Date().toISOString().split('T')[0],
      notes: form.notes || 'Peralihan data unit ke pemilik baru',
    };
    setMutations(prev => [newRecord, ...prev]);
    setShowModal(false);
    setForm({ plateNumber: '', carBrand: '', carModel: '', prevOwner: '', newOwner: '', notes: '' });
    showToast('Mutasi kepemilikan berhasil dicatat!');
  };

  const filtered = mutations.filter(m =>
    m.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
    m.prevOwner.toLowerCase().includes(search.toLowerCase()) ||
    m.newOwner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5 font-sans bg-[#f4f6fb] min-h-screen space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-fade-in">
          <CheckCircle size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <GitMerge size={20} className="text-amber-500" />
              <h1 className="text-xl font-black text-slate-900">Mutasi Kepemilikan Kendaraan</h1>
            </div>
            <p className="text-xs text-slate-500">Peralihan histori servis dan kepemilikan mobil antar pelanggan bengkel</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs shadow-sm transition-all"
          >
            <Plus size={15} />
            <span>+ Catat Mutasi Baru</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Mutasi Tercatat</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{mutations.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Riwayat peralihan unit</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Database Terhubung</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{customers.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pelanggan aktif bengkel</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Validasi</p>
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs mt-2">
            <ShieldCheck size={16} />
            <span>Histori Servis Terlindungi</span>
          </div>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari Plat Nomor, Pemilik Lama, Pemilik Baru..."
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-amber-400 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 tracking-wider">
                <th className="px-5 py-3">ID MUTASI</th>
                <th className="px-3 py-3">KENDARAAN</th>
                <th className="px-3 py-3">PERALIHAN KEPEMILIKAN</th>
                <th className="px-3 py-3">TANGGAL MUTASI</th>
                <th className="px-3 py-3">CATATAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <p className="font-bold text-slate-600">Belum ada data mutasi kepemilikan yang cocok.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{m.id}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="font-bold text-slate-900">{m.plateNumber}</p>
                      <p className="text-[11px] text-slate-400">{m.carBrand} {m.carModel}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-semibold">{m.prevOwner}</span>
                        <ArrowRight size={13} className="text-amber-500 shrink-0" />
                        <span className="text-slate-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{m.newOwner}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-600 font-semibold">
                      {m.mutationDate}
                    </td>
                    <td className="px-3 py-3.5 text-slate-500 text-[11px] max-w-xs truncate">
                      {m.notes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Mutasi */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="font-black text-slate-900 text-base">Form Mutasi Kepemilikan</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Plat Nomor Kendaraan *</label>
                <input
                  value={form.plateNumber}
                  onChange={e => setForm(p => ({ ...p, plateNumber: e.target.value }))}
                  placeholder="B 1234 ABC"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-amber-400 font-mono uppercase"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Merek Mobil</label>
                  <input
                    value={form.carBrand}
                    onChange={e => setForm(p => ({ ...p, carBrand: e.target.value }))}
                    placeholder="Toyota"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Model / Tipe</label>
                  <input
                    value={form.carModel}
                    onChange={e => setForm(p => ({ ...p, carModel: e.target.value }))}
                    placeholder="Avanza"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Pemilik Lama</label>
                  <input
                    value={form.prevOwner}
                    onChange={e => setForm(p => ({ ...p, prevOwner: e.target.value }))}
                    placeholder="Nama Pemilik Lama"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Pemilik Baru *</label>
                  <input
                    value={form.newOwner}
                    onChange={e => setForm(p => ({ ...p, newOwner: e.target.value }))}
                    placeholder="Nama Pemilik Baru"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Catatan</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  placeholder="Keterangan jual beli / perpindahan unit..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-amber-400 resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600">Batal</button>
                <button type="submit" className="px-5 py-2 text-xs font-black rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 transition-colors">Simpan Mutasi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
