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
  { id: 'jasa', label: 'Daftar Jasa Service', icon: Tag },
  { id: 'komisi', label: 'Paket Promo & Komisi', icon: Star },
  { id: 'sparepart', label: 'Katalog Sparepart', icon: Package },
  { id: 'analisa', label: 'Analisa Terlaris', icon: TrendingUp },
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
  isPaketPromo: false, porsiJasa: 0, porsiMaterial: 0, materialDesc: '',
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
    const porsiJasa = form.isPaketPromo ? Number(form.porsiJasa) || 0 : undefined;
    const porsiMaterial = form.isPaketPromo ? Number(form.porsiMaterial) || 0 : undefined;
    const buyPrice = form.type === 'jasa' ? 0 : Number(form.buyPrice || 0);
    const sellPrice = form.isPaketPromo && (porsiJasa != null || porsiMaterial != null)
      ? ((porsiJasa || 0) + (porsiMaterial || 0))
      : Number(form.sellPrice || 0);

    const upperForm = {
      ...form,
      name: (form.name || '').toUpperCase().trim(),
      skuCode: (form.skuCode || '').toUpperCase().trim(),
      category: (form.category || 'SERVICE AC').toUpperCase().trim(),
      buyPrice,
      sellPrice,
      isPaketPromo: Boolean(form.isPaketPromo),
      porsiJasa,
      porsiMaterial,
      materialDesc: form.materialDesc?.trim() || '',
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
    komisi: (items || []).filter(i => i && (i.isPaketPromo || (i.name || '').toUpperCase().includes('PROMO') || (i.skuCode || '').toUpperCase().startsWith('PROMO') || (i.skuCode || '').toUpperCase().startsWith('PKT'))).length,
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
            <p className="text-xs text-slate-500">Katalog daftar harga jual sparepart, tarif jasa mekanik & paket promo servis</p>
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
              <Plus size={14} />+ Tambah {activeTab === 'jasa' ? 'Jasa' : activeTab === 'komisi' ? 'Paket Promo' : 'Sparepart'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Tab + Filters ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {TABS.map(tab => {
            const count = tab.id === 'sparepart' ? tabCounts.sparepart : tab.id === 'jasa' ? tabCounts.jasa : tab.id === 'komisi' ? tabCounts.komisi : null;
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-800 uppercase tracking-wide">
                              {(item.name || '').toUpperCase()}
                            </span>
                            {item.isPaketPromo && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                                🎁 PAKET PROMO
                              </span>
                            )}
                            {isHppWarning && !item.isPaketPromo && (
                              <AlertTriangle size={12} className="text-orange-500" title="HPP > Harga Jual!" />
                            )}
                          </div>
                          {item.isPaketPromo && item.materialDesc && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Bahan: {item.materialDesc}
                            </p>
                          )}
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
                          {item.isPaketPromo ? (
                            <div className="text-[10px] font-semibold mt-0.5 space-y-0.5">
                              <span className="text-emerald-600 block">Jasa: {formatRp(item.porsiJasa || 0)}</span>
                              <span className="text-amber-700 block">Material: {formatRp(item.porsiMaterial || 0)}</span>
                            </div>
                          ) : (
                            item.type !== 'jasa' && item.buyPrice > 0 && (
                              <p className={`text-[10px] ${isHppWarning ? 'text-orange-600 font-bold' : 'text-slate-400'}`}>
                                HPP: {formatRp(item.buyPrice)}
                              </p>
                            )
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

        {/* ─── TAB PAKET PROMO & KOMISI ─── */}
        {activeTab === 'komisi' && (
          <div className="p-5 space-y-6">
            {/* Header Banner & Preset Quick-Adds */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black tracking-wider uppercase backdrop-blur-xs">
                    Katalog Paket Bundling
                  </span>
                  <span className="text-xs text-amber-100">Alokasi Jasa Mekanik & Material Toko</span>
                </div>
                <h2 className="text-xl font-black tracking-tight">Manajemen Paket Promo & Servis Berkala</h2>
                <p className="text-xs text-amber-100 max-w-xl">
                  Atur paket bundling dengan pembagian transparan antara hak ongkos kerja teknisi dan modal bahan kimia habis pakai (cleaner, grease, foam).
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setForm({
                      ...EMPTY_FORM,
                      type: 'jasa',
                      name: 'TUNE UP PROMO',
                      skuCode: `PROMO-TU-${Math.floor(100 + Math.random() * 900)}`,
                      category: 'TUNE UP',
                      sellPrice: 119000,
                      porsiJasa: 75000,
                      porsiMaterial: 27000,
                      buyPrice: 27000,
                      materialDesc: 'Carb/Throttle Cleaner & Foam Gurah Mesin',
                      isPaketPromo: true,
                    });
                    setShowModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-amber-50 font-black text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Plus size={14} className="text-amber-600" />
                  + Tune Up Promo (119rb)
                </button>

                <button
                  onClick={() => {
                    setEditingItem(null);
                    setForm({
                      ...EMPTY_FORM,
                      type: 'jasa',
                      name: 'PAKET REM PROMO',
                      skuCode: `PROMO-REM-${Math.floor(100 + Math.random() * 900)}`,
                      category: 'REM & KAMPAS',
                      sellPrice: 149000,
                      porsiJasa: 99000,
                      porsiMaterial: 35000,
                      buyPrice: 35000,
                      materialDesc: 'Brake Cleaner Spray & Pelumas Kaliper Rem',
                      isPaketPromo: true,
                    });
                    setShowModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all active:scale-95 border border-white/20 cursor-pointer"
                >
                  <Plus size={14} className="text-amber-400" />
                  + Paket Rem (149rb)
                </button>

                <button
                  onClick={() => {
                    setEditingItem(null);
                    setForm({
                      ...EMPTY_FORM,
                      type: 'jasa',
                      isPaketPromo: true,
                    });
                    setShowModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <Plus size={14} />
                  + Paket Kustom
                </button>
              </div>
            </div>

            {/* 3 Summary Cards */}
            {(() => {
              const promoList = (items || []).filter(i =>
                i && (i.isPaketPromo || (i.name || '').toUpperCase().includes('PROMO') || (i.skuCode || '').toUpperCase().startsWith('PROMO') || (i.skuCode || '').toUpperCase().startsWith('PKT'))
              );
              const totalNilai = promoList.reduce((s, i) => s + (Number(i.sellPrice) || 0), 0);
              const totalJasa = promoList.reduce((s, i) => s + (Number(i.porsiJasa) || 0), 0);
              const totalMaterial = promoList.reduce((s, i) => s + (Number(i.porsiMaterial) || 0), 0);

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Total Paket Promo</span>
                    <p className="text-xl font-black text-slate-800">{promoList.length} Paket</p>
                    <span className="text-[10px] text-slate-400">Total Nilai Paket: {formatRp(totalNilai)}</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
                    <span className="text-[11px] font-bold text-emerald-800 block mb-1">Total Alokasi Jasa (Mekanik)</span>
                    <p className="text-xl font-black text-emerald-700">{formatRp(totalJasa)}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">Hak pendapatan teknisi / Jurnal Bengkel</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-xs">
                    <span className="text-[11px] font-bold text-amber-800 block mb-1">Total Alokasi Material (Bahan)</span>
                    <p className="text-xl font-black text-amber-700">{formatRp(totalMaterial)}</p>
                    <span className="text-[10px] text-amber-600 font-semibold">Cairan & cleaner habis pakai / Jurnal Toko</span>
                  </div>
                </div>
              );
            })()}

            {/* Tabel Rincian Paket Promo */}
            {(() => {
              const s = (search || '').toLowerCase().trim();
              const promoList = (items || []).filter(i => {
                if (!i) return false;
                const isPromo = i.isPaketPromo || (i.name || '').toUpperCase().includes('PROMO') || (i.skuCode || '').toUpperCase().startsWith('PROMO') || (i.skuCode || '').toUpperCase().startsWith('PKT');
                if (!isPromo) return false;
                if (!s) return true;
                return (i.name || '').toLowerCase().includes(s) || (i.skuCode || '').toLowerCase().includes(s) || (i.category || '').toLowerCase().includes(s);
              });

              return (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-slate-50/60">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-amber-500" />
                      <h3 className="text-sm font-black text-slate-800">Daftar Paket Promo Aktif</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {promoList.length} item
                      </span>
                    </div>

                    <div className="relative min-w-[240px]">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari paket promo..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                          <th className="px-3 py-3 text-center font-bold w-12">NO</th>
                          <th className="px-3 py-3 text-left font-bold w-28">KODE SKU</th>
                          <th className="px-3 py-3 text-left font-bold min-w-[200px]">NAMA PAKET & MATERIAL</th>
                          <th className="px-3 py-3 text-center font-bold w-28">KATEGORI</th>
                          <th className="px-3 py-3 text-right font-bold min-w-[120px] text-slate-900">TOTAL TARIF</th>
                          <th className="px-3 py-3 text-right font-bold min-w-[130px] text-emerald-800">PORSI JASA (BENGKEL)</th>
                          <th className="px-3 py-3 text-right font-bold min-w-[130px] text-amber-800">PORSI MATERIAL (TOKO)</th>
                          <th className="px-3 py-3 text-center font-bold min-w-[140px]">PROPORSI PEMBAGIAN</th>
                          <th className="px-3 py-3 text-center font-bold w-20">AKSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {promoList.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center py-12 text-slate-400">
                              Belum ada paket promo yang terdaftar. Klik "+ Tune Up Promo" atau "+ Paket Kustom" di atas!
                            </td>
                          </tr>
                        ) : (
                          promoList.map((item, idx) => {
                            const sPrice = Number(item.sellPrice) || 0;
                            const pJasa = Number(item.porsiJasa) || 0;
                            const pMat = Number(item.porsiMaterial) || 0;
                            const totalSplit = (pJasa + pMat) > 0 ? (pJasa + pMat) : sPrice;

                            const pctJasa = totalSplit > 0 ? Math.round((pJasa / totalSplit) * 100) : 0;
                            const pctMat = totalSplit > 0 ? 100 - pctJasa : 0;

                            return (
                              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-3 py-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                                <td className="px-3 py-3.5">
                                  <span className="font-mono font-bold text-blue-700 text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                    {item.skuCode}
                                  </span>
                                </td>
                                <td className="px-3 py-3.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-slate-800 uppercase tracking-wide">
                                      {item.name}
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black uppercase">
                                      PROMO
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {item.materialDesc || 'Termasuk cleaner & bahan kimia'}
                                  </p>
                                </td>
                                <td className="px-3 py-3.5 text-center">
                                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 rounded border border-slate-200">
                                    {item.category}
                                  </span>
                                </td>
                                <td className="px-3 py-3.5 text-right font-mono font-black text-slate-900 text-sm">
                                  {formatRp(sPrice)}
                                </td>
                                <td className="px-3 py-3.5 text-right">
                                  <span className="font-mono font-bold text-emerald-700 block">
                                    {formatRp(pJasa)}
                                  </span>
                                  <span className="text-[9px] text-emerald-600 font-medium">({pctJasa}%)</span>
                                </td>
                                <td className="px-3 py-3.5 text-right">
                                  <span className="font-mono font-bold text-amber-800 block">
                                    {formatRp(pMat)}
                                  </span>
                                  <span className="text-[9px] text-amber-600 font-medium">({pctMat}%)</span>
                                </td>
                                <td className="px-3 py-3.5">
                                  <div className="space-y-1">
                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                      <div style={{ width: `${pctJasa}%` }} className="bg-emerald-500 h-full transition-all" title={`Jasa: ${pctJasa}%`} />
                                      <div style={{ width: `${pctMat}%` }} className="bg-amber-500 h-full transition-all" title={`Material: ${pctMat}%`} />
                                    </div>
                                    <div className="flex justify-between text-[9px] font-semibold px-0.5">
                                      <span className="text-emerald-700">Jasa {pctJasa}%</span>
                                      <span className="text-amber-700">Material {pctMat}%</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-3.5 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => openEdit(item)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                                      title="Edit Pembagian"
                                    >
                                      <Edit size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(item.id, item.name)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
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
                </div>
              );
            })()}
          </div>
        )}

        {/* ─── Other Tabs Placeholder ─── */}
        {!['jasa', 'sparepart', 'komisi'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            {activeTab === 'analisa' && <BarChart3 size={40} className="text-blue-300" />}
            {activeTab === 'import' && <Upload size={40} className="text-emerald-300" />}
            {activeTab === 'panduan' && <HelpCircle size={40} className="text-purple-300" />}
            <p className="text-slate-500 font-bold">
              {activeTab === 'analisa' && 'Analisa Terlaris'}
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

              {form.type === 'part' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">HPP / Harga Beli (Rp) *</label>
                    <input
                      type="number"
                      value={form.buyPrice || 0}
                      onChange={e => setForm(p => ({ ...p, buyPrice: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Harga Jual Sparepart (Rp) *</label>
                    <input
                      type="number"
                      value={form.sellPrice || 0}
                      onChange={e => setForm(p => ({ ...p, sellPrice: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400 font-bold font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {form.isPaketPromo ? 'Total Tarif Promo ke Pelanggan (Rp) *' : 'Tarif Jasa Servis (Rp) *'}
                  </label>
                  <input
                    type="number"
                    value={form.sellPrice || 0}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setForm(p => {
                        if (p.isPaketPromo) {
                          const pMat = Math.min(val, Number(p.porsiMaterial) || 0);
                          const pJas = Math.max(0, val - pMat);
                          return { ...p, sellPrice: val, porsiJasa: pJas, porsiMaterial: pMat, buyPrice: 0 };
                        }
                        return { ...p, sellPrice: val, buyPrice: 0 };
                      });
                    }}
                    placeholder="Contoh: 119000"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400 font-bold font-mono text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Jasa tidak memiliki modal HPP / harga beli barang</span>
                </div>
              )}

              {/* ── OPSI PAKET PROMO & PEMBAGIAN JASA / MATERIAL ── */}
              {form.type === 'jasa' && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-50/90 border border-amber-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        🎁
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800">Paket Promo / Bundling Servis</p>
                        <p className="text-[10px] text-slate-500">Pembagian murni untuk Jasa Mekanik (Bengkel) & Material Bahan (Toko)</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!form.isPaketPromo}
                        onChange={e => {
                          const checked = e.target.checked;
                          const sPrice = Number(form.sellPrice) || 119000;
                          const defaultMat = sPrice === 119000 ? 27000 : Math.round(sPrice * 0.25);
                          const defaultJas = Math.max(0, sPrice - defaultMat);
                          setForm(p => ({
                            ...p,
                            isPaketPromo: checked,
                            sellPrice: checked ? sPrice : p.sellPrice,
                            porsiJasa: checked ? (p.porsiJasa || defaultJas) : 0,
                            porsiMaterial: checked ? (p.porsiMaterial || defaultMat) : 0,
                            buyPrice: 0,
                          }));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {form.isPaketPromo && (
                    <div className="space-y-3 pt-2 border-t border-amber-200/80">
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-500">Preset Cepat:</span>
                        <button
                          type="button"
                          onClick={() => setForm(p => ({
                            ...p,
                            name: p.name || 'TUNE UP PROMO',
                            skuCode: p.skuCode || 'PROMO-TU-119',
                            category: 'TUNE UP',
                            sellPrice: 119000,
                            porsiJasa: 92000,
                            porsiMaterial: 27000,
                            buyPrice: 0,
                            materialDesc: 'Carb/Throttle Cleaner & Foam Gurah Mesin',
                          }))}
                          className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-[10px] border border-amber-300 transition-colors cursor-pointer"
                        >
                          Tune Up Promo (119rb: Jasa 92rb + Material 27rb)
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm(p => ({
                            ...p,
                            name: p.name || 'PAKET REM PROMO',
                            skuCode: p.skuCode || 'PROMO-REM-149',
                            category: 'REM & KAMPAS',
                            sellPrice: 149000,
                            porsiJasa: 114000,
                            porsiMaterial: 35000,
                            buyPrice: 0,
                            materialDesc: 'Brake Cleaner Spray & Grease Kaliper Rem',
                          }))}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-slate-700 font-bold text-[10px] border border-slate-200 transition-colors cursor-pointer"
                        >
                          Paket Rem Promo (149rb: Jasa 114rb + Material 35rb)
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                            Porsi Jasa Mekanik (Rp) *
                          </label>
                          <input
                            type="number"
                            value={form.porsiJasa || ''}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setForm(p => ({
                                ...p,
                                porsiJasa: val,
                                sellPrice: val + (Number(p.porsiMaterial) || 0),
                              }));
                            }}
                            placeholder="Contoh: 92000"
                            className="w-full px-3 py-2 text-xs border border-emerald-300 rounded-xl outline-none focus:border-emerald-500 font-mono font-bold text-emerald-800 bg-white"
                          />
                          <span className="text-[10px] text-emerald-600">Hak pendapatan teknisi (Jurnal Bengkel)</span>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-amber-800 mb-1">
                            Porsi Material / Bahan (Rp) *
                          </label>
                          <input
                            type="number"
                            value={form.porsiMaterial || ''}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setForm(p => ({
                                ...p,
                                porsiMaterial: val,
                                buyPrice: 0,
                                sellPrice: (Number(p.porsiJasa) || 0) + val,
                              }));
                            }}
                            placeholder="Contoh: 27000"
                            className="w-full px-3 py-2 text-xs border border-amber-300 rounded-xl outline-none focus:border-amber-500 font-mono font-bold text-amber-900 bg-white"
                          />
                          <span className="text-[10px] text-amber-600">Nilai obat cleaner / cairan (Jurnal Toko)</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Rincian Material / Bahan (opsional)
                        </label>
                        <input
                          type="text"
                          value={form.materialDesc || ''}
                          onChange={e => setForm(p => ({ ...p, materialDesc: e.target.value }))}
                          placeholder="Misal: Cairan carb cleaner, DCS gurah mesin, grease"
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-amber-400 bg-white"
                        />
                      </div>

                      {/* Live Calculation Preview Card: Purely Jasa + Material, NO Margin */}
                      {(() => {
                        const pJasa = Number(form.porsiJasa) || 0;
                        const pMat = Number(form.porsiMaterial) || 0;
                        const total = pJasa + pMat;
                        const pctJasa = total > 0 ? Math.round((pJasa / total) * 100) : 0;
                        const pctMat = total > 0 ? 100 - pctJasa : 0;

                        return (
                          <div className="bg-white/95 rounded-xl p-3 border border-amber-200 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-700">Pembagian Paket (Jasa + Material):</span>
                              <span className="font-black text-slate-900 font-mono">{formatRp(total)}</span>
                            </div>

                            {/* Visual Progress Bar: Only Emerald (Jasa) & Amber (Material) */}
                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                              <div style={{ width: `${pctJasa}%` }} className="bg-emerald-500 h-full transition-all" title={`Jasa: ${pctJasa}%`} />
                              <div style={{ width: `${pctMat}%` }} className="bg-amber-500 h-full transition-all" title={`Material: ${pctMat}%`} />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-center pt-1">
                              <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                                <span className="text-[10px] text-emerald-700 block font-semibold">1. Jasa Mekanik ({pctJasa}%)</span>
                                <span className="text-sm font-black text-emerald-800 font-mono">{formatRp(pJasa)}</span>
                                <span className="text-[9px] text-emerald-600 block mt-0.5 font-medium">Masuk Jurnal Bengkel</span>
                              </div>
                              <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                                <span className="text-[10px] text-amber-700 block font-semibold">2. Material Bahan ({pctMat}%)</span>
                                <span className="text-sm font-black text-amber-800 font-mono">{formatRp(pMat)}</span>
                                <span className="text-[9px] text-amber-600 block mt-0.5 font-medium">Masuk Jurnal Toko</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

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
