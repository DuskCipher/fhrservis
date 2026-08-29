import React, { useState } from 'react';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Car, Wrench,
  Calendar, DollarSign, MessageSquare, FileText, Edit,
  Trash2, CheckCircle, Star, Clock, TrendingUp, Shield,
  Hash, Fuel, Settings, BarChart2, Activity, Zap,
  Award, Target, ChevronRight, Share2
} from 'lucide-react';
import { CustomerItem, CRMOrder, CustomerSource, CustomerType } from '../../types';
import { deleteCustomer } from '../../lib/firestoreService';

interface CRMCustomerDetailProps {
  customer: CustomerItem;
  orders: CRMOrder[];
  onBack: () => void;
  onNavigate: (page: any) => void;
  onEdit?: (customer: CustomerItem) => void;
  onBuatSPK?: () => void;
}

const SOURCE_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  'Walk-in Langsung':           { color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200'  },
  'Rekomendasi Teman/Keluarga': { color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  'Google Maps':                { color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200'   },
  'Instagram':                  { color: 'text-pink-700',   bg: 'bg-pink-50',   border: 'border-pink-200'   },
  'TikTok':                     { color: 'text-slate-700',  bg: 'bg-slate-50',  border: 'border-slate-200'  },
  'WhatsApp':                   { color: 'text-emerald-700',bg: 'bg-emerald-50',border: 'border-emerald-200'},
  'Facebook':                   { color: 'text-sky-700',    bg: 'bg-sky-50',    border: 'border-sky-200'    },
  'Lainnya':                    { color: 'text-slate-600',  bg: 'bg-slate-100', border: 'border-slate-200'  },
};

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:   { label: 'Tahap Inspeksi / Pending', color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  process:   { label: 'Sedang Dikerjakan',         color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200'  },
  completed: { label: 'Selesai',                   color: 'text-emerald-700',bg: 'bg-emerald-50',border: 'border-emerald-200'},
  cancelled: { label: 'Dibatalkan',                color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200'   },
};

type TabId = 'profil' | 'kendaraan' | 'riwayat' | 'statistik';

export function CRMCustomerDetail({ customer, orders, onBack, onNavigate, onEdit, onBuatSPK }: CRMCustomerDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>('profil');

  // Filter orders for this customer
  const customerOrders = orders.filter(o =>
    o.phone === customer.phone ||
    o.customerName.toLowerCase() === customer.name.toLowerCase()
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Statistics
  const totalSpent = customer.totalSpent || customerOrders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.totalPrice || 0), 0);
  const completedOrders = customerOrders.filter(o => o.status === 'completed');
  const avgSpend = completedOrders.length ? Math.round(totalSpent / completedOrders.length) : 0;
  const totalOrders = customer.totalOrdersCount || customerOrders.length;

  const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  const srcConf = SOURCE_CONFIG[customer.source || 'Lainnya'] || SOURCE_CONFIG['Lainnya'];
  const isLama = customer.customerType === 'LAMA';

  const handleDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus data pelanggan "${customer.name}"? Data SPK terkait akan tetap tersimpan.`)) return;
    try {
      await deleteCustomer(customer.id);
      onBack();
    } catch {
      alert('Gagal menghapus pelanggan.');
    }
  };

  const TABS: { id: TabId; label: string; count?: number; icon: React.ReactNode }[] = [
    { id: 'profil',    label: 'Profil Lengkap',    icon: <User size={15} /> },
    { id: 'kendaraan', label: 'Spesifikasi Mobil',  icon: <Car size={15} /> },
    { id: 'riwayat',   label: 'Riwayat Servis & SPK', count: customerOrders.length, icon: <Wrench size={15} /> },
    { id: 'statistik', label: 'Statistik & Loyalitas', icon: <BarChart2 size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16 font-sans">

      {/* ─── Breadcrumb & Top Bar ─── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Daftar Pelanggan</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Profil Pelanggan</span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-extrabold text-slate-800 truncate max-w-[180px] sm:max-w-xs">{customer.name}</span>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit ? onEdit(customer) : onNavigate('crm-customer-edit')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
            >
              <Edit size={13} className="text-slate-500" />
              <span>Edit Data</span>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
              title="Hapus Pelanggan"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ─── Hero Profile Header (CLEAN WHITE & RED ACCENT, NO BLACK) ─── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Customer Details Left */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
              {/* Avatar Initial */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white font-black flex items-center justify-center text-2xl sm:text-3xl shadow-md shadow-red-500/20 shrink-0 select-none">
                {customer.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                    {customer.name}
                  </h1>

                  {/* Kategori LAMA / BARU Badge */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${
                    isLama
                      ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs'
                  }`}>
                    {isLama ? <Award size={13} /> : <Zap size={13} />}
                    {isLama ? 'PELANGGAN LAMA' : 'PELANGGAN BARU'}
                  </span>

                  {/* Sumber Badge */}
                  {customer.source && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${srcConf.bg} ${srcConf.color} ${srcConf.border}`}>
                      <span>📣 {customer.source}</span>
                    </span>
                  )}
                </div>

                {/* Contact Sub-info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1.5 font-mono font-bold text-slate-700">
                    <Phone size={13} className="text-slate-400" />
                    {customer.phone}
                  </span>
                  {customer.email && (
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Mail size={13} className="text-slate-400" />
                      {customer.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <MapPin size={13} className="text-slate-400" />
                    {customer.address || '—'}
                  </span>
                </div>

                {/* Vehicle Pill */}
                <div className="flex flex-wrap items-center gap-2 mt-3.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                    <Car size={13} className="text-red-600" />
                    <span>{customer.carBrand} {customer.carModel}</span>
                    <span className="text-slate-400">({customer.carYear})</span>
                  </div>

                  <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-xs tracking-wider text-slate-900 shadow-xs">
                    {customer.licensePlate}
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Terdaftar sejak: <span className="font-semibold text-slate-600">{formatDate(customer.createdAt)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action Counters & Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              
              {/* Quick stats mini cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="px-4 py-2.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                  <p className="text-lg sm:text-xl font-black text-blue-700 leading-none">{totalOrders}</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">Total SPK</p>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                  <p className="text-sm sm:text-base font-black text-emerald-700 leading-none truncate">{formatRp(totalSpent)}</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">Total Spending</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(customer.name)}%2C%20kami%20dari%20FHR%20Car%20Service.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <MessageSquare size={14} />
                  <span>WhatsApp</span>
                </a>
                <button
                  onClick={onBuatSPK}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all"
                >
                  <FileText size={14} />
                  <span>Buat SPK</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ─── Modern Tabs Navigation ─── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex gap-1 overflow-x-auto shadow-xs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── TAB 1: PROFIL LENGKAP ─── */}
        {activeTab === 'profil' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Box 1: Kontak & Identitas */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-red-600" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Identitas & Kontak</h3>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <DetailRow label="Nama Lengkap" value={customer.name} />
                <DetailRow label="Nomor Telepon / WA" value={customer.phone} isMono />
                <DetailRow label="Alamat Email" value={customer.email || '—'} />
                <DetailRow label="Alamat Domisili" value={customer.address} />
              </div>
            </div>

            {/* Box 2: Status & Loyalitas */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-red-600" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Status & Akuisisi</h3>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kategori Pelanggan</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border ${
                    isLama ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {isLama ? <Award size={14} className="text-amber-600" /> : <Zap size={14} className="text-emerald-600" />}
                    {isLama ? 'Pelanggan Lama (Langganan Bengkel)' : 'Pelanggan Baru (First Visit)'}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sumber Pelanggan</p>
                  {customer.source ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${srcConf.bg} ${srcConf.color} ${srcConf.border}`}>
                      <span>📣 {customer.source}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Belum ditentukan</span>
                  )}
                </div>

                <DetailRow label="Tanggal Terdaftar" value={formatDate(customer.createdAt)} />
                {customer.lastServiceDate && (
                  <DetailRow label="Servis Terakhir" value={formatDate(customer.lastServiceDate)} />
                )}
              </div>
            </div>

            {/* Box 3: Catatan Khusus */}
            {customer.notes && (
              <div className="lg:col-span-2 bg-amber-50/70 rounded-2xl border border-amber-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-amber-900 font-black text-xs uppercase tracking-wider">
                  <FileText size={14} className="text-amber-700" />
                  <span>Catatan Khusus Pelanggan</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {customer.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: SPESIFIKASI MOBIL ─── */}
        {activeTab === 'kendaraan' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
                <Car size={16} className="text-red-600" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Data Utama Kendaraan</h3>
              </div>
              <div className="p-5 space-y-4">
                <DetailRow label="Merek Mobil" value={customer.carBrand} />
                <DetailRow label="Model / Tipe" value={customer.carModel} />
                <DetailRow label="Tahun Pembuatan" value={customer.carYear} />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Plat Nomor</p>
                  <span className="inline-block px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 font-mono font-black text-sm tracking-widest text-slate-900 shadow-xs">
                    {customer.licensePlate}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
                <Settings size={16} className="text-red-600" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Rincian Teknis & Mesin</h3>
              </div>
              <div className="p-5 space-y-4">
                <DetailRow label="Transmisi" value={customer.transmission || 'Matic'} />
                <DetailRow label="Bahan Bakar" value={customer.fuelType || 'Bensin'} />
                <DetailRow label="Warna Kendaraan" value={customer.carColor || '—'} />
                <DetailRow label="Nomor Rangka (VIN)" value={customer.vinNumber || '—'} isMono />
                <DetailRow label="Nomor Mesin" value={customer.engineNumber || '—'} isMono />
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: RIWAYAT SERVIS & SPK ─── */}
        {activeTab === 'riwayat' && (
          <div className="space-y-4">
            {customerOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <Wrench size={36} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-black text-slate-800">Belum Ada Riwayat Servis</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Pelanggan ini belum memiliki catatan Surat Perintah Kerja (SPK) di sistem bengkel.
                </p>
                <button
                  onClick={onBuatSPK}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all"
                >
                  <FileText size={14} />
                  <span>Buat SPK Pertama Sekarang</span>
                </button>
              </div>
            ) : (
              customerOrders.map((order, idx) => {
                const st = STATUS_LABEL[order.status] || STATUS_LABEL.pending;
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-colors">
                    <div className="p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                      
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${st.bg} ${st.border}`}>
                          {order.status === 'completed' ? (
                            <CheckCircle size={18} className="text-emerald-600" />
                          ) : (
                            <Clock size={18} className={st.color} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900">{order.serviceType}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${st.bg} ${st.color} ${st.border}`}>
                              {st.label}
                            </span>
                            {order.isEmergency && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-600 border border-red-200">
                                🚨 Roadside SOS
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} className="text-slate-400" />
                              {order.serviceDate} {order.serviceTime ? `• ${order.serviceTime}` : ''}
                            </span>
                            {order.locationAddress && (
                              <span className="flex items-center gap-1">
                                <MapPin size={12} className="text-slate-400" />
                                {order.locationAddress}
                              </span>
                            )}
                          </div>

                          {order.notes && (
                            <p className="mt-2.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <span className="font-bold text-slate-500">Catatan Servis: </span>
                              {order.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="sm:text-right shrink-0">
                        <p className="text-xs text-slate-400 font-bold">Biaya Servis</p>
                        <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                          {order.totalPrice ? formatRp(order.totalPrice) : <span className="text-slate-400 font-normal">Belum ada nota</span>}
                        </p>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ─── TAB 4: STATISTIK & LOYALITAS ─── */}
        {activeTab === 'statistik' && (
          <div className="space-y-5">
            {/* Top 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total SPK"
                value={String(totalOrders)}
                desc="Kunjungan tercatat"
                bg="bg-blue-50/60"
                border="border-blue-100"
                textColor="text-blue-700"
                icon={<FileText size={18} className="text-blue-600" />}
              />
              <StatCard
                title="SPK Selesai"
                value={String(completedOrders.length)}
                desc={`${totalOrders > 0 ? Math.round((completedOrders.length / totalOrders) * 100) : 0}% Tingkat Selesai`}
                bg="bg-emerald-50/60"
                border="border-emerald-100"
                textColor="text-emerald-700"
                icon={<CheckCircle size={18} className="text-emerald-600" />}
              />
              <StatCard
                title="Total Spending"
                value={formatRp(totalSpent)}
                desc="Akumulasi pembayaran"
                bg="bg-amber-50/60"
                border="border-amber-100"
                textColor="text-amber-800"
                icon={<DollarSign size={18} className="text-amber-600" />}
              />
              <StatCard
                title="Rata-rata per Servis"
                value={formatRp(avgSpend)}
                desc="Per order selesai"
                bg="bg-violet-50/60"
                border="border-violet-100"
                textColor="text-violet-700"
                icon={<TrendingUp size={18} className="text-violet-600" />}
              />
            </div>

            {/* Breakdown Status Servis */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity size={15} className="text-red-600" />
                Status Pengerjaan Unit
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['pending', 'process', 'completed', 'cancelled'] as const).map(st => {
                  const count = customerOrders.filter(o => o.status === st).length;
                  const cfg = STATUS_LABEL[st];
                  return (
                    <div key={st} className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border} text-center`}>
                      <p className={`text-2xl font-black ${cfg.color}`}>{count}</p>
                      <p className={`text-xs font-bold mt-1 ${cfg.color}`}>{cfg.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Helper Components ───

function DetailRow({ label, value, isMono }: { label: string; value: string; isMono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-xs font-bold text-slate-800 ${isMono ? 'font-mono text-slate-900' : ''}`}>
        {value || '—'}
      </p>
    </div>
  );
}

function StatCard({ title, value, desc, bg, border, textColor, icon }: {
  title: string; value: string; desc: string; bg: string; border: string; textColor: string; icon: React.ReactNode;
}) {
  return (
    <div className={`p-4 rounded-2xl border ${border} ${bg} shadow-xs`}>
      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs mb-3">
        {icon}
      </div>
      <p className={`text-lg sm:text-xl font-black ${textColor} leading-tight truncate`}>{value}</p>
      <p className="text-xs font-bold text-slate-700 mt-1">{title}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
    </div>
  );
}
