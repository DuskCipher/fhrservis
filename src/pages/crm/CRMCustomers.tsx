import React, { useState, useMemo } from 'react';
import {
  Users, Search, Plus, Phone, MessageSquare, Car, MapPin,
  Calendar, Edit, Trash2, CheckCircle, FileText,
  Filter, Eye, DollarSign, Award, Zap, ChevronRight, Share2,
  CalendarRange, X, Clock
} from 'lucide-react';
import { CustomerItem, CustomerSource, CustomerType } from '../../types';
import { deleteCustomer } from '../../lib/firestoreService';

interface CRMCustomersProps {
  customers: CustomerItem[];
  orders: any[];
  onNavigate: (page: any) => void;
  onBuatSPK?: () => void;
  onViewCustomer?: (customer: CustomerItem) => void;
  onTambahCustomer?: () => void;
  onEditCustomer?: (customer: CustomerItem) => void;
}

const CAR_BRANDS = [
  'Toyota', 'Honda', 'Daihatsu', 'Suzuki', 'Mitsubishi',
  'Nissan', 'Hyundai', 'Wuling', 'Isuzu', 'Mazda'
];

export function CRMCustomers({
  customers,
  orders,
  onNavigate,
  onBuatSPK,
  onViewCustomer,
  onTambahCustomer,
  onEditCustomer,
}: CRMCustomersProps) {
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'BARU' | 'LAMA'>('all');
  
  // Date Filtering for Customers
  const [datePreset, setDatePreset] = useState<'all' | 'today' | '7d' | '30d' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered customers with Date Logic
  const filteredCustomers = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return customers.filter(c => {
      const matchSearch = !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
        c.carModel.toLowerCase().includes(search.toLowerCase()) ||
        c.carBrand.toLowerCase().includes(search.toLowerCase());

      const matchBrand = filterBrand === 'all' || c.carBrand.toLowerCase() === filterBrand.toLowerCase();
      const matchType = filterType === 'all' || c.customerType === filterType;

      let matchDate = true;
      if (c.createdAt) {
        try {
          const custDate = new Date(c.createdAt);
          const custDateStr = custDate.toISOString().split('T')[0];

          if (datePreset === 'today') {
            matchDate = custDateStr === todayStr;
          } else if (datePreset === '7d') {
            const diffDays = (now.getTime() - custDate.getTime()) / (1000 * 3600 * 24);
            matchDate = diffDays <= 7 && diffDays >= 0;
          } else if (datePreset === '30d') {
            const diffDays = (now.getTime() - custDate.getTime()) / (1000 * 3600 * 24);
            matchDate = diffDays <= 30 && diffDays >= 0;
          } else if (datePreset === 'custom') {
            if (startDate && custDateStr < startDate) matchDate = false;
            if (endDate && custDateStr > endDate) matchDate = false;
          }
        } catch {}
      }

      return matchSearch && matchBrand && matchType && matchDate;
    });
  }, [customers, search, filterBrand, filterType, datePreset, startDate, endDate]);

  // Stats calculation
  const lamaCount = customers.filter(c => c.customerType === 'LAMA').length;
  const baruCount = customers.filter(c => c.customerType === 'BARU' || !c.customerType).length;
  const totalSpent = customers.reduce((s, c) => s + (c.totalSpent || 0), 0);
  const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus data pelanggan "${name}"?`)) {
      try {
        await deleteCustomer(id);
        showToast('Data pelanggan berhasil dihapus.');
      } catch {
        alert('Gagal menghapus pelanggan.');
      }
    }
  };

  const handleAddClick = () => {
    if (onTambahCustomer) onTambahCustomer();
    else onNavigate('crm-customer-create');
  };

  const handleEditClick = (c: CustomerItem) => {
    if (onEditCustomer) onEditCustomer(c);
    else onNavigate('crm-customer-edit');
  };

  const handleViewClick = (c: CustomerItem) => {
    if (onViewCustomer) onViewCustomer(c);
    else onNavigate('crm-customer-detail');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 font-sans bg-slate-50/50 min-h-screen">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-fade-in">
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Page Header (Clean White Card) ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-xs">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900">Database Pelanggan</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                  {filteredCustomers.length} Data
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola data pemilik mobil, riwayat tanggal servis, klasifikasi pelanggan, dan buat SPK baru
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {onBuatSPK && (
              <button
                onClick={onBuatSPK}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-700 font-bold text-xs transition-all shadow-xs"
              >
                <FileText size={14} className="text-slate-500" />
                <span>Buat SPK</span>
              </button>
            )}
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs shadow-md shadow-red-600/20 transition-all"
            >
              <Plus size={16} />
              <span>+ Tambah Pelanggan</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Summary Stats (Bright & Clean) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pelanggan</p>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
              <Users size={14} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{customers.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Unit terdata di bengkel</p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Pelanggan Baru</p>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Zap size={14} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{baruCount}</p>
          <p className="text-[11px] text-emerald-600/70 mt-0.5">Kunjungan pertama</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-xs bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pelanggan Lama</p>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award size={14} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{lamaCount}</p>
          <p className="text-[11px] text-amber-600/70 mt-0.5">Pelanggan loyal / tetap</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
              <DollarSign size={14} />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 mt-2 truncate">{formatRp(totalSpent)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Akumulasi seluruh transaksi</p>
        </div>
      </div>

      {/* ─── Filters & Search (With Date Range Filtering) ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* Date Filter Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mr-1">
              <CalendarRange size={14} className="text-red-600" />
              <span>Filter Tanggal Registrasi:</span>
            </span>

            {(['all', 'today', '7d', '30d', 'custom'] as const).map(p => {
              const labels = {
                all: 'Semua Waktu',
                today: 'Hari Ini',
                '7d': '7 Hari Terakhir',
                '30d': 'Bulan Ini',
                custom: 'Pilih Tanggal'
              };
              return (
                <button
                  key={p}
                  onClick={() => setDatePreset(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    datePreset === p
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          {datePreset === 'custom' && (
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500 font-semibold text-[11px]">Dari:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-lg bg-white outline-none focus:border-red-500"
                />
              </div>
              <span className="text-slate-300">-</span>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500 font-semibold text-[11px]">Sampai:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-lg bg-white outline-none focus:border-red-500"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  title="Reset Tanggal"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Secondary Category & Search Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Filter size={13} /> Kategori:
            </span>
            {(['all', 'BARU', 'LAMA'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  filterType === t
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t === 'all' ? 'Semua Status' : t === 'BARU' ? 'Pelanggan Baru' : 'Pelanggan Lama'}
              </button>
            ))}

            <span className="text-slate-200 mx-1 hidden sm:inline">|</span>

            {/* Merek Filter */}
            <select
              value={filterBrand}
              onChange={e => setFilterBrand(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-red-500"
            >
              <option value="all">Semua Merek Mobil</option>
              {CAR_BRANDS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="w-full pl-10 pr-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
              placeholder="Cari nama, nomor HP, plat no, mobil..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

      </div>

      {/* ─── Customer Table (With Date Display) ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-4 text-center w-12">NO</th>
                <th className="px-4 py-4">NAMA & KONTAK</th>
                <th className="px-4 py-4">TANGGAL MASUK</th>
                <th className="px-4 py-4">KATEGORI & SUMBER</th>
                <th className="px-4 py-4">UNIT KENDARAAN</th>
                <th className="px-4 py-4">PLAT NOMOR</th>
                <th className="px-4 py-4 text-center">SPK</th>
                <th className="px-4 py-4 text-center">TOTAL BELANJA</th>
                <th className="px-4 py-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Users size={24} />
                      </div>
                      <p className="font-bold text-slate-700 text-sm">Tidak ada data pelanggan yang sesuai filter</p>
                      <p className="text-xs text-slate-400">Silakan ubah rentang tanggal atau kata kunci pencarian</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c, idx) => {
                  const isLama = c.customerType === 'LAMA';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/90 transition-colors group">
                      <td className="px-4 py-4 text-center text-slate-400 font-bold">{idx + 1}</td>

                      {/* Name & Contact */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 font-black flex items-center justify-center text-xs shrink-0 shadow-2xs">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <button
                              onClick={() => handleViewClick(c)}
                              className="font-bold text-slate-900 text-xs hover:text-red-600 text-left transition-colors"
                            >
                              {c.name}
                            </button>
                            <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                              <Phone size={10} className="text-slate-400" />
                              <span className="font-mono text-[11px] font-bold text-slate-700">{c.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Registration / Entry Date */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                          <Calendar size={12} className="text-red-500 shrink-0" />
                          <span>{formatDate(c.createdAt)}</span>
                        </div>
                        {c.lastServiceDate && (
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock size={10} />
                            <span>Terakhir: {formatDate(c.lastServiceDate)}</span>
                          </p>
                        )}
                      </td>

                      {/* Category & Source */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border ${
                              isLama
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              {isLama ? 'LAMA' : 'BARU'}
                            </span>
                          </div>
                          {c.source && (
                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                              <Share2 size={10} className="text-slate-400" />
                              <span className="truncate max-w-[120px]">{c.source}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Car size={15} className="text-red-600 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800 text-xs">
                              {c.carBrand} {c.carModel}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {c.carYear} • {c.transmission || 'Matic'} {c.carColor ? `• ${c.carColor}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* License Plate */}
                      <td className="px-4 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono font-bold text-xs tracking-wider border border-slate-300 shadow-2xs">
                          {c.licensePlate}
                        </span>
                      </td>

                      {/* Total SPK Count */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {c.totalOrdersCount || 0} SPK
                        </span>
                      </td>

                      {/* Total Spending */}
                      <td className="px-4 py-4 text-center">
                        <span className="text-xs font-bold text-emerald-700">
                          {c.totalSpent ? formatRp(c.totalSpent) : <span className="text-slate-300">—</span>}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Profile */}
                          <button
                            onClick={() => handleViewClick(c)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all shadow-xs"
                            title="Buka Halaman Profil Pelanggan"
                          >
                            <Eye size={13} className="text-slate-500" />
                            <span>Profil</span>
                          </button>

                          {/* Buat SPK */}
                          <button
                            onClick={() => onBuatSPK ? onBuatSPK() : onNavigate('crm-spk-create')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
                            title="Buat SPK untuk pelanggan ini"
                          >
                            <FileText size={13} />
                            <span>SPK</span>
                          </button>

                          {/* WhatsApp Chat */}
                          <a
                            href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(c.name)}%2C%20kami%20dari%20FHR%20Car%20Service.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Chat WhatsApp"
                          >
                            <MessageSquare size={14} />
                          </a>

                          {/* Edit Form */}
                          <button
                            onClick={() => handleEditClick(c)}
                            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                            title="Edit Data Pelanggan"
                          >
                            <Edit size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            className="p-1.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                            title="Hapus Pelanggan"
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

    </div>
  );
}
