import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Package, Search, Plus, Edit, Trash2, CheckCircle, X, AlertTriangle,
  Download, Upload, Printer, Tag, Clock, Shield, BarChart3, ChevronDown,
  Layers, ShoppingCart, TrendingUp, HelpCircle, Filter, Star
} from 'lucide-react';
import { InventoryItem, ProductCategory } from '../../types';
import {
  subscribeToInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem
} from '../../lib/firestoreService';

const CATEGORIES: (ProductCategory | string)[] = [
  'SERVICE AC', 'TUNE UP', 'GANTI OLI', 'REM & KAMPAS', 'KELISTRIKAN',
  'KAKI-KAKI', 'MESIN', 'TRANSMISI', 'BODY & CAT', 'SPAREPART UMUM', 'JASA LAINNYA'
];

const TABS = [
  { id: 'sparepart', label: 'Katalog Sparepart', icon: Package },
  { id: 'jasa', label: 'Daftar Jasa Service', icon: Tag },
  { id: 'analisa', label: 'Analisa Terlaris', icon: TrendingUp },
  { id: 'komisi', label: 'Paket Komisi', icon: Star },
  { id: 'import', label: 'Upload / Import', icon: Upload },
  { id: 'panduan', label: 'Panduan', icon: HelpCircle },
];

const formatTitleCase = (text?: string) => {
  if (!text) return '';
  // Convert ALL CAPS text into clean Title Case
  return text
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (['ac', 'spk', 'lpa', 'po', 'hpp', 'sku', 'hho', 'dap'].includes(word.toLowerCase())) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const formatRp = (n?: number | string) =>
  'Rp ' + (Number(n) || 0).toLocaleString('id-ID');

const EMPTY_FORM: Partial<InventoryItem> = {
  skuCode: '', name: '', category: 'SERVICE AC', type: 'jasa',
  unit: 'pekerjaan', stock: 0, minStock: 5, buyPrice: 0, sellPrice: 0,
  durationMinutes: 45, warrantyDays: 30, notes: '', isActive: true,
};

export function CRMInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('jasa');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const [showHppWarning, setShowHppWarning] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<Partial<InventoryItem>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToInventory(setItems);
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const currentType = activeTab === 'sparepart' ? 'sparepart' : 'jasa';

  const filtered = useMemo(() => {
    const s = (search || '').toLowerCase().trim();
    return (items || []).filter(item => {
      if (!item) return false;
      if (activeTab === 'sparepart' && item.type !== 'sparepart') return false;
      if (activeTab === 'jasa' && item.type !== 'jasa') return false;
      if (filterCategory !== 'Semua' && (item.category || '') !== filterCategory) return false;
      const buy = Number(item.buyPrice) || 0;
      const sell = Number(item.sellPrice) || 0;
      if (showHppWarning && buy <= sell) return false;
      const matchSearch = !s ||
        (item.name || '').toLowerCase().includes(s) ||
        (item.skuCode || '').toLowerCase().includes(s) ||
        (item.category || '').toLowerCase().includes(s);
      return matchSearch;
    });
  }, [items, activeTab, search, filterCategory, showHppWarning]);

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(prev => prev.length === filtered.length ? [] : filtered.map(i => i.id));

  const openAdd = () => {
    setEditingItem(null);
    setForm({ ...EMPTY_FORM, type: currentType });
    setShowModal(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({ ...item });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.skuCode) {
      alert('Nama dan Kode SKU wajib diisi!');
      return;
    }
    setSaving(true);
    const upperForm = {
      ...form,
      name: (form.name || '').toUpperCase().trim(),
      skuCode: (form.skuCode || '').toUpperCase().trim(),
      category: (form.category || 'SERVICE AC').toUpperCase().trim(),
    };
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, upperForm as Partial<InventoryItem>);
        showToast('Data berhasil diperbarui!');
      } else {
        await addInventoryItem(upperForm as Omit<InventoryItem, 'id' | 'createdAt'>);
        showToast('Item berhasil ditambahkan!');
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus "${name}"?`)) return;
    await deleteInventoryItem(id);
    showToast('Item berhasil dihapus.');
    setSelected(prev => prev.filter(s => s !== id));
  };

  const tabCounts = {
    sparepart: (items || []).filter(i => i && i.type === 'sparepart').length,
    jasa: (items || []).filter(i => i && i.type === 'jasa').length,
  };

  return (
    <div className="p-5 font-sans bg-[#f4f6fb] min-h-screen space-y-4">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold">
          <CheckCircle size={16} /><span>{toast}</span>
        </div>
      )}

      {/* ─── Page Header ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Package size={20} className="text-red-600" />
              <h1 className="text-xl font-black text-slate-900">Kelola Produk & Jasa</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 uppercase">FHR Car Service</span>
            </div>
            <p className="text-xs text-slate-500">Katalog daftar harga jual sparepart dan tarif jasa mekanik</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors">
              <Download size={13} />Download Template CSV ({activeTab === 'jasa' ? 'Jasa' : 'Sparepart'})
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors">
              <Upload size={13} />Import CSV
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors">
              <Download size={13} />Export CSV
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors">
              <Printer size={13} />PDF / Print
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs shadow-sm transition-all"
            >
              <Plus size={14} />+ Tambah {activeTab === 'jasa' ? 'Jasa' : 'Sparepart'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Tab + Filters ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {TABS.map(tab => {
            const count = tab.id === 'sparepart' ? tabCounts.sparepart : tab.id === 'jasa' ? tabCounts.jasa : null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-amber-400 bg-amber-50 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={13} className={activeTab === tab.id ? 'text-amber-500' : 'text-slate-400'} />
                {tab.label}
                {count !== null && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${activeTab === tab.id ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                    {count} item
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Row */}
        {(activeTab === 'jasa' || activeTab === 'sparepart') && (
          <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50/50">
            {/* Category filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">TAMPILKAN:</span>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white outline-none focus:border-red-400 min-w-[150px]"
              >
                <option value="Semua">Semua ({filtered.length})</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* HPP Warning toggle */}
            <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
              showHppWarning
                ? 'bg-orange-50 border-orange-300 text-orange-700'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                checked={showHppWarning}
                onChange={e => setShowHppWarning(e.target.checked)}
                className="accent-orange-500"
              />
              <AlertTriangle size={12} />
              HPP &gt; Harga Jual
            </label>

            {/* Search */}
            <div className="relative ml-auto min-w-[280px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari kode, nama, kategori service..."
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* ─── Table for Jasa & Sparepart ─── */}
        {(activeTab === 'jasa' || activeTab === 'sparepart') && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pl-5 pr-2 py-3 w-8">
                    <input type="checkbox"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="w-3.5 h-3.5 accent-red-600"
                    />
                  </th>
                  <th className="px-3 py-3 w-10">#</th>
                  <th className="px-3 py-3">KODE SKU</th>
                  <th className="px-3 py-3">NAMA PRODUK / JASA</th>
                  <th className="px-3 py-3">KATEGORI</th>
                  {activeTab === 'sparepart' && <th className="px-3 py-3 text-center">STOK</th>}
                  <th className="px-3 py-3">DURASI / GARANSI</th>
                  <th className="px-3 py-3 text-right">HARGA JUAL / TARIF</th>
                  <th className="px-3 py-3 text-center w-20">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <Package size={32} className="text-slate-300" />
                        <p className="font-bold text-slate-600">Belum ada data produk/jasa</p>
                        <button
                          onClick={openAdd}
                          className="px-4 py-2 rounded-xl bg-amber-400 text-slate-900 font-black text-xs hover:bg-amber-500 transition-colors"
                        >
                          + Tambah {activeTab === 'jasa' ? 'Jasa Pertama' : 'Sparepart Pertama'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => {
                    const isLowStock = item.type === 'sparepart' && item.stock <= item.minStock;
                    const isHppWarning = item.buyPrice > item.sellPrice;
                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors group ${selected.includes(item.id) ? 'bg-blue-50/30' : ''}`}>
                        <td className="pl-5 pr-2 py-3.5">
                          <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} className="w-3.5 h-3.5 accent-red-600" />
                        </td>
                        <td className="px-3 py-3.5 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="px-3 py-3.5">
                          <span className="font-mono font-bold text-blue-700 text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {item.skuCode}
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 uppercase tracking-wide">
                              {(item.name || '').toUpperCase()}
                            </span>
                            {isHppWarning && (
                              <AlertTriangle size={12} className="text-orange-500" title="HPP > Harga Jual!" />
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 rounded border border-slate-200">
                            {(item.category || '').toUpperCase()}
                          </span>
                        </td>
                        {activeTab === 'sparepart' && (
                          <td className="px-3 py-3.5 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isLowStock
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {item.stock} {item.unit}
                              {isLowStock && <AlertTriangle size={9} className="ml-1" />}
                            </span>
                          </td>
                        )}
                        <td className="px-3 py-3.5">
                          <div className="space-y-0.5">
                            {item.durationMinutes && (
                              <div className="flex items-center gap-1 text-slate-600">
                                <Clock size={11} className="text-blue-500" />
                                <span className="text-[11px] font-semibold">{item.durationMinutes} mnt</span>
                              </div>
                            )}
                            {item.warrantyDays && (
                              <div className="flex items-center gap-1 text-slate-500">
                                <Shield size={11} className="text-slate-400" />
                                <span className="text-[11px]">{item.warrantyDays} Hari</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <span className="font-black text-slate-900 text-sm">
                            {formatRp(item.sellPrice)}
                          </span>
                          {item.buyPrice > 0 && (
                            <p className={`text-[10px] ${isHppWarning ? 'text-orange-600 font-bold' : 'text-slate-400'}`}>
                              HPP: {formatRp(item.buyPrice)}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Hapus"
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
        )}

        {/* ─── Other Tabs Placeholder ─── */}
        {!['jasa', 'sparepart'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            {activeTab === 'analisa' && <BarChart3 size={40} className="text-blue-300" />}
            {activeTab === 'komisi' && <Star size={40} className="text-amber-300" />}
            {activeTab === 'import' && <Upload size={40} className="text-emerald-300" />}
            {activeTab === 'panduan' && <HelpCircle size={40} className="text-purple-300" />}
            <p className="text-slate-500 font-bold">
              {activeTab === 'analisa' && 'Analisa Terlaris'}
              {activeTab === 'komisi' && 'Paket Komisi'}
              {activeTab === 'import' && 'Upload / Import Massal'}
              {activeTab === 'panduan' && 'Panduan Penggunaan'}
            </p>
            <p className="text-slate-400 text-xs">Segera tersedia</p>
          </div>
        )}

        {/* Table Footer */}
        {['jasa', 'sparepart'].includes(activeTab) && (
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Baris per halaman:</span>
              <select className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white outline-none">
                <option>25</option><option>50</option><option>100</option>
              </select>
            </div>
            <span className="text-xs font-bold text-slate-600">
              Menampilkan {filtered.length} dari {activeTab === 'sparepart' ? tabCounts.sparepart : tabCounts.jasa} item
            </span>
            <div className="flex items-center gap-1.5">
              <button disabled className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-40">Sebelumnya</button>
              <button className="w-7 h-7 rounded-lg bg-amber-400 text-slate-900 text-xs font-black flex items-center justify-center">1</button>
              <button disabled className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-40">Berikutnya</button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Modal Tambah / Edit ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="font-black text-slate-900 text-base">
                {editingItem ? 'Edit' : 'Tambah'} {form.type === 'jasa' ? 'Jasa Service' : 'Sparepart'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Type toggle */}
              <div className="flex rounded-xl overflow-hidden border border-slate-200">
                <button
                  onClick={() => setForm(p => ({ ...p, type: 'jasa', unit: 'pekerjaan' }))}
                  className={`flex-1 py-2 text-xs font-bold transition-colors ${form.type === 'jasa' ? 'bg-amber-400 text-slate-900' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  <Tag size={12} className="inline mr-1" />Jasa Service
                </button>
                <button
                  onClick={() => setForm(p => ({ ...p, type: 'sparepart', unit: 'pcs' }))}
                  className={`flex-1 py-2 text-xs font-bold transition-colors ${form.type === 'sparepart' ? 'bg-amber-400 text-slate-900' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  <Package size={12} className="inline mr-1" />Sparepart
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Kode SKU *</label>
                  <input
                    value={form.skuCode || ''}
                    onChange={e => setForm(p => ({ ...p, skuCode: e.target.value }))}
                    placeholder="AC-001"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Kategori</label>
                  <select
                    value={form.category || 'SERVICE AC'}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Produk / Jasa *</label>
                <input
                  value={form.name || ''}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                  placeholder="Contoh: TUNE UP MATIC / LAS KONDENSOR"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400 uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">HPP / Harga Beli (Rp)</label>
                  <input
                    type="number"
                    value={form.buyPrice || 0}
                    onChange={e => setForm(p => ({ ...p, buyPrice: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Harga Jual / Tarif (Rp)</label>
                  <input
                    type="number"
                    value={form.sellPrice || 0}
                    onChange={e => setForm(p => ({ ...p, sellPrice: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Durasi Pengerjaan (menit)</label>
                  <input
                    type="number"
                    value={form.durationMinutes || 45}
                    onChange={e => setForm(p => ({ ...p, durationMinutes: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Garansi (Hari)</label>
                  <input
                    type="number"
                    value={form.warrantyDays || 30}
                    onChange={e => setForm(p => ({ ...p, warrantyDays: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400"
                  />
                </div>
              </div>

              {form.type === 'sparepart' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Satuan</label>
                    <input value={form.unit || 'pcs'} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Stok Awal</label>
                    <input type="number" value={form.stock || 0} onChange={e => setForm(p => ({ ...p, stock: Number(e.target.value) }))} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Min. Stok</label>
                    <input type="number" value={form.minStock || 5} onChange={e => setForm(p => ({ ...p, minStock: Number(e.target.value) }))} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Catatan (opsional)</label>
                <textarea
                  value={form.notes || ''}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  placeholder="Catatan tambahan..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400 resize-none"
                />
              </div>

              {/* HPP Warning */}
              {(form.buyPrice || 0) > (form.sellPrice || 0) && (form.buyPrice || 0) > 0 && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs font-bold text-orange-700">
                  <AlertTriangle size={14} />
                  Perhatian: HPP lebih besar dari Harga Jual. Anda akan rugi!
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-xs font-black rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 transition-colors disabled:opacity-60"
              >
                {saving ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Tambah Item')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
