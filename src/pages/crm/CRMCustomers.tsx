import React, { useState } from 'react';
import {
  Users, Search, Plus, Phone, MessageSquare, Car, MapPin,
  Calendar, Edit, Trash2, X, CheckCircle, FileText,
  Filter, Star, Zap, Eye, TrendingUp, DollarSign, Award
} from 'lucide-react';
import { CustomerItem, CustomerSource, CustomerType } from '../../types';
import { addCustomer, updateCustomer, deleteCustomer } from '../../lib/firestoreService';

interface CRMCustomersProps {
  customers: CustomerItem[];
  orders: any[];
  onNavigate: (page: any) => void;
  onBuatSPK?: () => void;
  onViewCustomer?: (customer: CustomerItem) => void;
}

const CAR_BRANDS = [
  'Toyota', 'Honda', 'Daihatsu', 'Suzuki', 'Mitsubishi',
  'Nissan', 'Hyundai', 'Wuling', 'Isuzu', 'Mazda',
  'BMW', 'Mercedes-Benz', 'Chevrolet', 'Kia', 'Lainnya'
];

const ALL_SOURCES: CustomerSource[] = [
  'Rekomendasi Teman/Keluarga', 'Google Maps', 'Instagram', 'TikTok',
  'WhatsApp', 'Walk-in Langsung', 'Facebook', 'Lainnya'
];

const SOURCE_EMOJI: Record<string, string> = {
  'Rekomendasi Teman/Keluarga': '🤝',
  'Google Maps': '🗺️',
  'Instagram': '📸',
  'TikTok': '🎵',
  'WhatsApp': '💬',
  'Walk-in Langsung': '🚶',
  'Facebook': '📘',
  'Lainnya': '📣',
};

export function CRMCustomers({ customers, orders, onNavigate, onBuatSPK, onViewCustomer }: CRMCustomersProps) {
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'BARU' | 'LAMA'>('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form state
  const defaultForm = {
    name: '', phone: '', email: '', address: '',
    carBrand: 'Toyota', carModel: '', carYear: new Date().getFullYear().toString(),
    licensePlate: '', transmission: 'Matic' as 'Manual' | 'Matic',
    carColor: '', vinNumber: '', engineNumber: '',
    fuelType: 'Bensin' as 'Bensin' | 'Diesel' | 'Hybrid' | 'EV',
    notes: '',
    source: 'Walk-in Langsung' as CustomerSource,
    customerType: 'BARU' as CustomerType,
  };
  const [formData, setFormData] = useState(defaultForm);

  // Filtered customers
  const filteredCustomers = customers.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      c.carModel.toLowerCase().includes(search.toLowerCase()) ||
      c.carBrand.toLowerCase().includes(search.toLowerCase());
    const matchBrand = filterBrand === 'all' || c.carBrand.toLowerCase() === filterBrand.toLowerCase();
    const matchType = filterType === 'all' || c.customerType === filterType;
    return matchSearch && matchBrand && matchType;
  });

  // Stats
  const lamaCount = customers.filter(c => c.customerType === 'LAMA').length;
  const baruCount = customers.filter(c => c.customerType === 'BARU' || !c.customerType).length;
  const totalSpent = customers.reduce((s, c) => s + (c.totalSpent || 0), 0);
  const activeOrdersCount = orders.filter(o => o.status === 'process' || o.status === 'pending').length;
  const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  // Open modal for adding
  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData(defaultForm);
    setShowModal(true);
  };

  // Open modal for editing
  const openEditModal = (c: CustomerItem) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name, phone: c.phone, email: c.email || '',
      address: c.address, carBrand: c.carBrand, carModel: c.carModel,
      carYear: c.carYear, licensePlate: c.licensePlate,
      transmission: c.transmission || 'Matic',
      carColor: c.carColor || '', vinNumber: c.vinNumber || '',
      engineNumber: c.engineNumber || '', fuelType: c.fuelType || 'Bensin',
      notes: c.notes || '',
      source: c.source || 'Lainnya',
      customerType: c.customerType || 'BARU',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const carModel = formData.carModel.trim();
    const licensePlate = formData.licensePlate.trim().toUpperCase();

    if (!name || !phone || !carModel || !licensePlate) {
      alert('Mohon lengkapi Nama, No. HP, Model Mobil, dan Plat Nomor.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name, phone,
        email: formData.email.trim() || '',
        address: formData.address.trim() || '—',
        carBrand: formData.carBrand || 'Toyota',
        carModel, carYear: formData.carYear.trim() || '2020',
        licensePlate,
        transmission: formData.transmission || 'Matic',
        carColor: formData.carColor.trim() || '',
        vinNumber: formData.vinNumber.trim() || '',
        engineNumber: formData.engineNumber.trim() || '',
        fuelType: formData.fuelType || 'Bensin',
        notes: formData.notes.trim() || '',
        source: formData.source,
        customerType: formData.customerType,
      };

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, payload);
        showToast('Data pelanggan berhasil diperbarui!');
      } else {
        await addCustomer({ ...payload, totalOrdersCount: 0, totalSpent: 0 });
        showToast('Pelanggan baru berhasil ditambahkan!');
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving customer:', err);
      showToast('Gagal menyimpan. Cek koneksi internet.');
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus data pelanggan "${name}"?`)) {
      try {
        await deleteCustomer(id);
        showToast('Data pelanggan dihapus.');
      } catch {
        alert('Gagal menghapus pelanggan.');
      }
    }
  };

  const handleViewCustomer = (c: CustomerItem) => {
    if (onViewCustomer) {
      onViewCustomer(c);
    } else {
      onNavigate('crm-customer-detail');
    }
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 font-sans">

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-600/30 text-sm font-semibold">
          <CheckCircle size={18} className="shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Page Header ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <Users size={20} />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900">Database Pelanggan</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola profil pelanggan, kendaraan, sumber akuisisi, dan riwayat servis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {onBuatSPK && (
              <button
                onClick={onBuatSPK}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs transition-all"
              >
                <FileText size={14} />
                <span>Buat SPK</span>
              </button>
            )}
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all"
            >
              <Plus size={16} />
              <span>+ Tambah Pelanggan</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pelanggan</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{customers.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Database terdaftar</p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1"><Award size={10} /> Pelanggan Lama</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{lamaCount}</p>
          <p className="text-[10px] text-amber-500 mt-0.5">Pelanggan loyal</p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1"><Zap size={10} /> Pelanggan Baru</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{baruCount}</p>
          <p className="text-[10px] text-emerald-500 mt-0.5">Akuisisi baru</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><DollarSign size={10} /> Total Revenue</p>
          <p className="text-sm font-black text-violet-700 mt-1 truncate">{formatRp(totalSpent)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Dari semua pelanggan</p>
        </div>
      </div>

      {/* ─── Filter & Search ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Filter size={13} /> FILTER:
            </span>
            {/* Type filter */}
            {(['all', 'LAMA', 'BARU'] as const).map(t => (
              <button key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                  filterType === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}>
                {t === 'all' ? 'Semua' : t === 'LAMA' ? '⭐ Lama' : '🆕 Baru'}
              </button>
            ))}
            <span className="text-slate-200">|</span>
            {/* Brand filter */}
            <button onClick={() => setFilterBrand('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${filterBrand === 'all' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
              Semua Merek
            </button>
            {['Toyota', 'Honda', 'Daihatsu', 'Mitsubishi', 'Suzuki'].map(b => (
              <button key={b} onClick={() => setFilterBrand(b)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${filterBrand.toLowerCase() === b.toLowerCase() ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                {b}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
              placeholder="Cari nama, no HP, plat, mobil..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Menampilkan <span className="font-bold text-slate-700">{filteredCustomers.length}</span> dari {customers.length} pelanggan
        </p>
      </div>

      {/* ─── Customer Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold">
                <th className="px-4 py-3.5 text-center w-12">NO</th>
                <th className="px-4 py-3.5">PELANGGAN</th>
                <th className="px-4 py-3.5">SUMBER</th>
                <th className="px-4 py-3.5">KENDARAAN</th>
                <th className="px-4 py-3.5">PLAT</th>
                <th className="px-4 py-3.5 text-center">SPK</th>
                <th className="px-4 py-3.5 text-center">SPENDING</th>
                <th className="px-4 py-3.5 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={32} className="text-slate-200" />
                      <p className="font-semibold text-slate-600">Belum ada data pelanggan yang cocok.</p>
                      <button onClick={openAddModal}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors">
                        + Tambah Pelanggan Baru
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c, idx) => {
                  const isLama = c.customerType === 'LAMA';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 py-3.5 text-center text-slate-400 font-semibold">{idx + 1}</td>

                      {/* Name + Contact */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white font-black flex items-center justify-center text-sm shrink-0 shadow-sm">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900">{c.name}</p>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${
                                isLama
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {isLama ? '⭐ LAMA' : '🆕 BARU'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                              <Phone size={10} className="text-slate-400" />
                              <span className="font-mono text-[11px]">{c.phone}</span>
                            </div>
                            {c.address && (
                              <div className="flex items-center gap-1 mt-0.5 text-slate-400">
                                <MapPin size={10} />
                                <span className="text-[10px] truncate max-w-[140px]">{c.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="px-4 py-3.5">
                        {c.source ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-600">
                            <span>{SOURCE_EMOJI[c.source] || '📣'}</span>
                            <span className="max-w-[100px] truncate">{c.source}</span>
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Vehicle */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Car size={14} className="text-red-500 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800">{c.carBrand} {c.carModel}</p>
                            <p className="text-[11px] text-slate-400">
                              {c.carYear} • {c.transmission || 'Matic'}
                              {c.carColor ? ` • ${c.carColor}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* License Plate */}
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2.5 py-1 rounded bg-slate-900 text-white font-mono font-bold text-xs tracking-wider border border-slate-700">
                          {c.licensePlate}
                        </span>
                      </td>

                      {/* Total SPK */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {c.totalOrdersCount || 0}x
                        </span>
                      </td>

                      {/* Spending */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-xs font-bold text-emerald-700">
                          {c.totalSpent ? formatRp(c.totalSpent) : <span className="text-slate-300">—</span>}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Profile */}
                          <button
                            onClick={() => handleViewCustomer(c)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs transition-all shadow-sm"
                            title="Lihat Profil Lengkap"
                          >
                            <Eye size={13} />
                            <span>Profil</span>
                          </button>

                          {/* Buat SPK */}
                          <button
                            onClick={() => onBuatSPK ? onBuatSPK() : onNavigate('crm-spk-create')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-sm shadow-red-600/30 transition-all"
                            title="Buat SPK dari pelanggan ini"
                          >
                            <FileText size={13} />
                            <span>SPK</span>
                          </button>

                          {/* WhatsApp */}
                          <a
                            href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(c.name)}%2C%20kami%20dari%20FHR%20Car%20Service.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Chat WhatsApp"
                          >
                            <MessageSquare size={14} />
                          </a>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            title="Edit Data"
                          >
                            <Edit size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
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

      {/* ─────────────── MODAL TAMBAH / EDIT ─────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    {editingCustomer ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {editingCustomer ? 'Perbarui data kontak & kendaraan' : 'Input data lengkap pelanggan & kendaraan'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors text-lg font-bold">
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-6">

              {/* Section 1: Informasi Pemilik */}
              <SectionHeader label="1. Informasi Pemilik Kendaraan" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormField label="Nama Lengkap" required>
                  <input type="text" required placeholder="Contoh: Budi Santoso"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </FormField>
                <FormField label="No. HP / WhatsApp" required>
                  <input type="tel" required placeholder="081234567890"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </FormField>
                <FormField label="Email (Opsional)">
                  <input type="email" placeholder="budi@gmail.com"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </FormField>
                <FormField label="Alamat Domisili" required>
                  <input type="text" required placeholder="Jl. Sudirman No. 12, Jakarta"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </FormField>
              </div>

              {/* Section 2: Kategori & Sumber */}
              <SectionHeader label="2. Kategori & Sumber Pelanggan" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormField label="Tipe Pelanggan">
                  <div className="flex gap-2">
                    {(['BARU', 'LAMA'] as CustomerType[]).map(t => (
                      <button type="button" key={t}
                        onClick={() => setFormData({...formData, customerType: t})}
                        className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                          formData.customerType === t
                            ? t === 'LAMA' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}>
                        {t === 'LAMA' ? '⭐ PELANGGAN LAMA' : '🆕 PELANGGAN BARU'}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="Sumber / Dari Mana Tahu Bengkel Ini">
                  <select value={formData.source}
                    onChange={e => setFormData({...formData, source: e.target.value as CustomerSource})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white">
                    {ALL_SOURCES.map(s => <option key={s} value={s}>{SOURCE_EMOJI[s]} {s}</option>)}
                  </select>
                </FormField>
              </div>

              {/* Section 3: Data Kendaraan */}
              <SectionHeader label="3. Data Spesifikasi Kendaraan" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <FormField label="Merek Mobil" required>
                  <select required value={formData.carBrand}
                    onChange={e => setFormData({...formData, carBrand: e.target.value})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white">
                    {CAR_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </FormField>
                <FormField label="Model / Tipe" required>
                  <input type="text" required placeholder="Avanza 1.3 G / Brio RS"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                    value={formData.carModel} onChange={e => setFormData({...formData, carModel: e.target.value})} />
                </FormField>
                <FormField label="Tahun" required>
                  <input type="number" required placeholder="2020"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono"
                    value={formData.carYear} onChange={e => setFormData({...formData, carYear: e.target.value})} />
                </FormField>
                <FormField label="Plat Nomor" required>
                  <input type="text" required placeholder="B 1234 ABC"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono uppercase font-bold"
                    value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})} />
                </FormField>
                <FormField label="Transmisi">
                  <select value={formData.transmission}
                    onChange={e => setFormData({...formData, transmission: e.target.value as any})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white">
                    <option value="Matic">Matic (AT / CVT)</option>
                    <option value="Manual">Manual (MT)</option>
                  </select>
                </FormField>
                <FormField label="Bahan Bakar">
                  <select value={formData.fuelType}
                    onChange={e => setFormData({...formData, fuelType: e.target.value as any})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white">
                    <option value="Bensin">Bensin</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="EV">EV (Listrik)</option>
                  </select>
                </FormField>
                <FormField label="Warna Mobil">
                  <input type="text" placeholder="Hitam Metalik"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                    value={formData.carColor} onChange={e => setFormData({...formData, carColor: e.target.value})} />
                </FormField>
                <FormField label="No. Rangka (VIN)">
                  <input type="text" placeholder="Opsional"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono"
                    value={formData.vinNumber} onChange={e => setFormData({...formData, vinNumber: e.target.value})} />
                </FormField>
                <FormField label="No. Mesin">
                  <input type="text" placeholder="Opsional"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono"
                    value={formData.engineNumber} onChange={e => setFormData({...formData, engineNumber: e.target.value})} />
                </FormField>
              </div>

              <FormField label="Catatan Khusus Pelanggan (Opsional)">
                <textarea rows={2}
                  placeholder="Preferensi oli, catatan teknis, keluhan berulang..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </FormField>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white font-black text-xs shadow-md shadow-red-600/30 transition-all flex items-center gap-2">
                  {isSubmitting ? 'Menyimpan...' : (
                    <><CheckCircle size={13} /> {editingCustomer ? 'Perbarui Data' : 'Simpan Pelanggan Baru'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper Components ───
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-100">
      <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
      <span>{label}</span>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
