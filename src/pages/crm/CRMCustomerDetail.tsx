import React, { useState } from 'react';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Car, Wrench,
  Calendar, DollarSign, MessageSquare, FileText, Edit,
  Trash2, CheckCircle, Star, Clock, TrendingUp, Shield,
  Hash, Fuel, Settings, BarChart2, Activity, Zap,
  RefreshCw, Award, Target, ChevronRight
} from 'lucide-react';
import { CustomerItem, CRMOrder, CustomerSource, CustomerType } from '../../types';
import { updateCustomer, deleteCustomer } from '../../lib/firestoreService';

interface CRMCustomerDetailProps {
  customer: CustomerItem;
  orders: CRMOrder[];
  onBack: () => void;
  onNavigate: (page: any) => void;
  onBuatSPK?: () => void;
}

const SOURCE_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  'Rekomendasi Teman/Keluarga': { color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  'Google Maps':                { color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200'   },
  'Instagram':                  { color: 'text-pink-700',   bg: 'bg-pink-50',   border: 'border-pink-200'   },
  'TikTok':                     { color: 'text-slate-700',  bg: 'bg-slate-50',  border: 'border-slate-200'  },
  'WhatsApp':                   { color: 'text-emerald-700',bg: 'bg-emerald-50',border: 'border-emerald-200'},
  'Walk-in Langsung':           { color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200'  },
  'Facebook':                   { color: 'text-sky-700',    bg: 'bg-sky-50',    border: 'border-sky-200'    },
  'Lainnya':                    { color: 'text-slate-600',  bg: 'bg-slate-100', border: 'border-slate-200'  },
};

const ALL_SOURCES: CustomerSource[] = [
  'Rekomendasi Teman/Keluarga', 'Google Maps', 'Instagram', 'TikTok',
  'WhatsApp', 'Walk-in Langsung', 'Facebook', 'Lainnya'
];

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: 'text-amber-700',  bg: 'bg-amber-50'  },
  process:   { label: 'Proses',    color: 'text-blue-700',   bg: 'bg-blue-50'   },
  completed: { label: 'Selesai',   color: 'text-emerald-700',bg: 'bg-emerald-50'},
  cancelled: { label: 'Batal',     color: 'text-red-700',    bg: 'bg-red-50'    },
};

type TabId = 'profil' | 'kendaraan' | 'riwayat' | 'statistik';

export function CRMCustomerDetail({ customer, orders, onBack, onNavigate, onBuatSPK }: CRMCustomerDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>('profil');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Edit form state — initialized from customer
  const [editForm, setEditForm] = useState({
    name: customer.name,
    phone: customer.phone,
    email: customer.email || '',
    address: customer.address,
    source: (customer.source || 'Lainnya') as CustomerSource,
    customerType: (customer.customerType || 'BARU') as CustomerType,
    notes: customer.notes || '',
    carBrand: customer.carBrand,
    carModel: customer.carModel,
    carYear: customer.carYear,
    licensePlate: customer.licensePlate,
    transmission: customer.transmission || 'Matic' as 'Manual' | 'Matic',
    carColor: customer.carColor || '',
    vinNumber: customer.vinNumber || '',
    engineNumber: customer.engineNumber || '',
    fuelType: customer.fuelType || 'Bensin' as 'Bensin' | 'Diesel' | 'Hybrid' | 'EV',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filter orders belonging to this customer (match by phone or name)
  const customerOrders = orders.filter(o =>
    o.phone === customer.phone ||
    o.customerName.toLowerCase() === customer.name.toLowerCase()
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Stats
  const totalSpent = customer.totalSpent || customerOrders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.totalPrice || 0), 0);
  const completedOrders = customerOrders.filter(o => o.status === 'completed');
  const avgSpend = completedOrders.length ? Math.round(totalSpent / completedOrders.length) : 0;
  const totalOrders = customer.totalOrdersCount || customerOrders.length;

  const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return iso; }
  };

  const srcConf = SOURCE_CONFIG[customer.source || 'Lainnya'] || SOURCE_CONFIG['Lainnya'];
  const isLama = customer.customerType === 'LAMA';

  // --- Save Edit ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateCustomer(customer.id, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim(),
        address: editForm.address.trim(),
        source: editForm.source,
        customerType: editForm.customerType,
        notes: editForm.notes.trim(),
        carBrand: editForm.carBrand,
        carModel: editForm.carModel.trim(),
        carYear: editForm.carYear.trim(),
        licensePlate: editForm.licensePlate.trim().toUpperCase(),
        transmission: editForm.transmission,
        carColor: editForm.carColor.trim(),
        vinNumber: editForm.vinNumber.trim(),
        engineNumber: editForm.engineNumber.trim(),
        fuelType: editForm.fuelType,
      });
      setIsEditing(false);
      showToast('Profil pelanggan berhasil diperbarui!');
    } catch {
      showToast('Gagal menyimpan. Cek koneksi internet.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Delete ---
  const handleDelete = async () => {
    if (!window.confirm(`Hapus data pelanggan "${customer.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await deleteCustomer(customer.id);
      onBack();
    } catch {
      showToast('Gagal menghapus pelanggan.');
    }
  };

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'profil',    label: 'Profil',          icon: <User size={14} /> },
    { id: 'kendaraan', label: 'Kendaraan',        icon: <Car size={14} /> },
    { id: 'riwayat',   label: `Riwayat (${customerOrders.length})`, icon: <Wrench size={14} /> },
    { id: 'statistik', label: 'Statistik',        icon: <BarChart2 size={14} /> },
  ];

  const CAR_BRANDS = ['Toyota','Honda','Daihatsu','Suzuki','Mitsubishi','Nissan','Hyundai','Wuling','Isuzu','Mazda','BMW','Mercedes-Benz','Chevrolet','Kia','Lainnya'];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-600/30 text-sm font-semibold animate-pulse">
          <CheckCircle size={18} className="shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ─────────────── HEADER HERO ─────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 pb-3 border-b border-white/10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-semibold"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Daftar Pelanggan</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10"
            >
              <Edit size={13} /> Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold transition-all border border-red-500/20"
            >
              <Trash2 size={13} /> Hapus
            </button>
          </div>
        </div>

        {/* Profile Hero */}
        <div className="px-4 sm:px-6 pt-5 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-red-700 text-white font-black flex items-center justify-center text-3xl shadow-xl shadow-red-900/40 select-none">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              {/* Online pulse indicator */}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 relative" />
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-2xl font-black text-white truncate">{customer.name}</h1>
                {/* LAMA / BARU badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                  isLama
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                    : 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                }`}>
                  {isLama ? '⭐ PELANGGAN LAMA' : '🆕 PELANGGAN BARU'}
                </span>
                {/* Source badge */}
                {customer.source && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/10">
                    📣 {customer.source}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300">
                <span className="flex items-center gap-1.5"><Phone size={13} /> {customer.phone}</span>
                {customer.email && <span className="flex items-center gap-1.5"><Mail size={13} /> {customer.email}</span>}
                <span className="flex items-center gap-1.5"><MapPin size={13} /> {customer.address}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-300">
                  <Car size={13} className="text-red-400" />
                  <span className="font-semibold text-white">{customer.carBrand} {customer.carModel}</span>
                  <span className="text-slate-400">• {customer.licensePlate}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-300">
                  <Calendar size={13} className="text-slate-400" />
                  <span>Bergabung: {formatDate(customer.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex sm:flex-col gap-3 shrink-0">
              <div className="text-center px-4 py-2.5 rounded-2xl bg-white/10 border border-white/10 min-w-[80px]">
                <p className="text-2xl font-black text-white">{totalOrders}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Total SPK</p>
              </div>
              <div className="text-center px-4 py-2.5 rounded-2xl bg-white/10 border border-white/10 min-w-[80px]">
                <p className="text-sm font-black text-emerald-400">{formatRp(totalSpent)}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Total Spending</p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/10">
            <a
              href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(customer.name)}%2C%20kami%20dari%20FHR%20Car%20Service.%20Ada%20yang%20bisa%20kami%20bantu%3F`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-900/30"
            >
              <MessageSquare size={14} /> Chat WhatsApp
            </a>
            <button
              onClick={onBuatSPK}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-lg shadow-red-900/30"
            >
              <FileText size={14} /> Buat SPK
            </button>
            <a
              href={`tel:${customer.phone.replace(/[^0-9]/g, '')}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10"
            >
              <Phone size={14} /> Telepon
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 sm:px-6 gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 border-transparent'
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────── TAB CONTENT ─────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* ── TAB: PROFIL ── */}
        {activeTab === 'profil' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Informasi Kontak */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <User size={15} className="text-red-600" />
                <h3 className="text-sm font-black text-slate-800">Informasi Kontak</h3>
              </div>
              <div className="p-5 space-y-3.5">
                <InfoRow icon={<User size={14} className="text-slate-400" />} label="Nama Lengkap" value={customer.name} />
                <InfoRow icon={<Phone size={14} className="text-slate-400" />} label="No. HP / WhatsApp" value={customer.phone} mono />
                <InfoRow icon={<Mail size={14} className="text-slate-400" />} label="Email" value={customer.email || '—'} />
                <InfoRow icon={<MapPin size={14} className="text-slate-400" />} label="Alamat Domisili" value={customer.address} />
              </div>
            </div>

            {/* Status Pelanggan */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <Shield size={15} className="text-red-600" />
                <h3 className="text-sm font-black text-slate-800">Status & Sumber Pelanggan</h3>
              </div>
              <div className="p-5 space-y-3.5">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Kategori Pelanggan</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border ${
                    isLama ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {isLama ? <Award size={13} /> : <Zap size={13} />}
                    {isLama ? 'Pelanggan Lama (Loyal)' : 'Pelanggan Baru'}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sumber / Asal Pelanggan</p>
                  {customer.source ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${srcConf.bg} ${srcConf.color} ${srcConf.border}`}>
                      📣 {customer.source}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Belum diisi</span>
                  )}
                </div>
                <InfoRow icon={<Calendar size={14} className="text-slate-400" />} label="Tanggal Daftar" value={formatDate(customer.createdAt)} />
                {customer.lastServiceDate && (
                  <InfoRow icon={<Clock size={14} className="text-slate-400" />} label="Servis Terakhir" value={formatDate(customer.lastServiceDate)} />
                )}
              </div>
            </div>

            {/* Catatan */}
            {customer.notes && (
              <div className="bg-amber-50 rounded-2xl border border-amber-200 shadow-sm p-5 lg:col-span-2">
                <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText size={13} /> Catatan Khusus Pelanggan
                </p>
                <p className="text-sm text-amber-900 leading-relaxed">{customer.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: KENDARAAN ── */}
        {activeTab === 'kendaraan' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <Car size={15} className="text-red-600" />
                <h3 className="text-sm font-black text-slate-800">Identitas Kendaraan</h3>
              </div>
              <div className="p-5 space-y-3.5">
                <InfoRow icon={<Car size={14} className="text-red-500" />} label="Merek" value={customer.carBrand} />
                <InfoRow icon={<Car size={14} className="text-slate-400" />} label="Model / Tipe" value={customer.carModel} />
                <InfoRow icon={<Calendar size={14} className="text-slate-400" />} label="Tahun Pembuatan" value={customer.carYear} />
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Plat Nomor Polisi</p>
                  <span className="inline-block px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-black text-sm tracking-widest border border-slate-700">
                    {customer.licensePlate}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <Settings size={15} className="text-red-600" />
                <h3 className="text-sm font-black text-slate-800">Spesifikasi Teknis</h3>
              </div>
              <div className="p-5 space-y-3.5">
                <InfoRow icon={<RefreshCw size={14} className="text-slate-400" />} label="Transmisi" value={customer.transmission || 'Matic'} />
                <InfoRow icon={<Fuel size={14} className="text-slate-400" />} label="Bahan Bakar" value={customer.fuelType || 'Bensin'} />
                <InfoRow icon={<Car size={14} className="text-slate-400" />} label="Warna Kendaraan" value={customer.carColor || '—'} />
                <InfoRow icon={<Hash size={14} className="text-slate-400" />} label="No. Rangka (VIN)" value={customer.vinNumber || '—'} mono />
                <InfoRow icon={<Hash size={14} className="text-slate-400" />} label="No. Mesin" value={customer.engineNumber || '—'} mono />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: RIWAYAT SERVIS ── */}
        {activeTab === 'riwayat' && (
          <div className="space-y-3">
            {customerOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Wrench size={36} className="text-slate-200 mx-auto mb-3" />
                <p className="font-bold text-slate-500">Belum ada riwayat servis tercatat</p>
                <p className="text-xs text-slate-400 mt-1">Buat SPK baru untuk mencatat servis pelanggan ini</p>
                <button
                  onClick={onBuatSPK}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs mx-auto transition-all"
                >
                  <FileText size={13} /> Buat SPK Sekarang
                </button>
              </div>
            ) : (
              customerOrders.map((order, idx) => {
                const st = STATUS_LABEL[order.status] || STATUS_LABEL.pending;
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-start gap-4 p-5">
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${
                          order.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          order.status === 'process'   ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          order.status === 'pending'   ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {order.status === 'completed' ? <CheckCircle size={16} /> : <Clock size={16} />}
                        </div>
                        {idx < customerOrders.length - 1 && (
                          <div className="w-0.5 h-4 bg-slate-100 mt-1" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-black text-slate-900 text-sm">{order.serviceType}</p>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <Calendar size={11} /> {order.serviceDate} {order.serviceTime && `• ${order.serviceTime}`}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${st.bg} ${st.color}`}>
                              {st.label}
                            </span>
                            {order.totalPrice !== undefined && order.totalPrice > 0 && (
                              <p className="text-xs font-black text-emerald-700 mt-1">{formatRp(order.totalPrice)}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                          {order.isEmergency && (
                            <span className="text-red-600 font-bold flex items-center gap-1">
                              <Zap size={11} /> Emergency
                            </span>
                          )}
                          {order.locationAddress && (
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-slate-400" /> {order.locationAddress}
                            </span>
                          )}
                        </div>

                        {order.notes && (
                          <p className="mt-2 text-xs text-slate-500 italic bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                            "{order.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── TAB: STATISTIK ── */}
        {activeTab === 'statistik' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<FileText size={18} className="text-blue-600" />}
              bg="bg-blue-50"
              border="border-blue-100"
              label="Total SPK Dibuat"
              value={String(totalOrders)}
              sub="Semua status"
            />
            <StatCard
              icon={<CheckCircle size={18} className="text-emerald-600" />}
              bg="bg-emerald-50"
              border="border-emerald-100"
              label="SPK Selesai"
              value={String(completedOrders.length)}
              sub={`${totalOrders ? Math.round(completedOrders.length / totalOrders * 100) : 0}% completion rate`}
            />
            <StatCard
              icon={<DollarSign size={18} className="text-amber-600" />}
              bg="bg-amber-50"
              border="border-amber-100"
              label="Total Pengeluaran"
              value={formatRp(totalSpent)}
              sub="Dari semua transaksi selesai"
            />
            <StatCard
              icon={<TrendingUp size={18} className="text-violet-600" />}
              bg="bg-violet-50"
              border="border-violet-100"
              label="Rata-rata per Servis"
              value={formatRp(avgSpend)}
              sub="Per kunjungan selesai"
            />

            {/* SPK by Status breakdown */}
            <div className="sm:col-span-2 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <Activity size={15} className="text-red-600" /> Breakdown Status SPK
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['pending','process','completed','cancelled'] as const).map(s => {
                  const count = customerOrders.filter(o => o.status === s).length;
                  const st = STATUS_LABEL[s];
                  return (
                    <div key={s} className={`rounded-xl border p-3 text-center ${st.bg}`}>
                      <p className={`text-2xl font-black ${st.color}`}>{count}</p>
                      <p className={`text-xs font-bold mt-0.5 ${st.color}`}>{st.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Servis types */}
            {customerOrders.length > 0 && (
              <div className="sm:col-span-2 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                  <Target size={15} className="text-red-600" /> Jenis Servis yang Pernah Dilakukan
                </h3>
                <div className="space-y-2">
                  {Object.entries(
                    customerOrders.reduce((acc, o) => {
                      acc[o.serviceType] = (acc[o.serviceType] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).sort(([,a],[,b]) => b - a).map(([type, cnt]) => (
                    <div key={type} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Wrench size={12} className="text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-700 font-semibold truncate">{type}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${(cnt / customerOrders.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-slate-700 w-6 text-right">{cnt}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─────────────── EDIT MODAL ─────────────── */}
      {isEditing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Edit size={18} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Edit Profil Pelanggan</h2>
                  <p className="text-xs text-slate-400">Perbarui data kontak, kendaraan, dan kategori</p>
                </div>
              </div>
              <button onClick={() => setIsEditing(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors text-lg font-bold">×</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-6">
              {/* Section: Info Pelanggan */}
              <SectionHeader label="1. Informasi Pemilik" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormField label="Nama Lengkap" required>
                  <input type="text" required value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                </FormField>
                <FormField label="No. HP / WhatsApp" required>
                  <input type="tel" required value={editForm.phone}
                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono" />
                </FormField>
                <FormField label="Email (Opsional)">
                  <input type="email" value={editForm.email}
                    onChange={e => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                </FormField>
                <FormField label="Alamat Domisili" required>
                  <input type="text" required value={editForm.address}
                    onChange={e => setEditForm({...editForm, address: e.target.value})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                </FormField>
              </div>

              {/* Section: Kategori & Sumber */}
              <SectionHeader label="2. Kategori & Sumber Pelanggan" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormField label="Tipe Pelanggan">
                  <div className="flex gap-2">
                    {(['BARU', 'LAMA'] as CustomerType[]).map(t => (
                      <button type="button" key={t}
                        onClick={() => setEditForm({...editForm, customerType: t})}
                        className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                          editForm.customerType === t
                            ? t === 'LAMA' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {t === 'LAMA' ? '⭐ PELANGGAN LAMA' : '🆕 PELANGGAN BARU'}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="Sumber / Asal Pelanggan">
                  <select value={editForm.source}
                    onChange={e => setEditForm({...editForm, source: e.target.value as CustomerSource})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white">
                    {ALL_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>
              </div>
              <FormField label="Catatan Khusus (Opsional)">
                <textarea rows={2} value={editForm.notes}
                  onChange={e => setEditForm({...editForm, notes: e.target.value})}
                  placeholder="Preferensi oli, catatan teknis, dll..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
              </FormField>

              {/* Section: Kendaraan */}
              <SectionHeader label="3. Data Kendaraan" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <FormField label="Merek Mobil" required>
                  <select required value={editForm.carBrand}
                    onChange={e => setEditForm({...editForm, carBrand: e.target.value})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white">
                    {CAR_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </FormField>
                <FormField label="Model / Tipe" required>
                  <input type="text" required value={editForm.carModel}
                    onChange={e => setEditForm({...editForm, carModel: e.target.value})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                </FormField>
                <FormField label="Tahun" required>
                  <input type="number" required value={editForm.carYear}
                    onChange={e => setEditForm({...editForm, carYear: e.target.value})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono" />
                </FormField>
                <FormField label="Plat Nomor" required>
                  <input type="text" required value={editForm.licensePlate}
                    onChange={e => setEditForm({...editForm, licensePlate: e.target.value.toUpperCase()})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono uppercase font-bold" />
                </FormField>
                <FormField label="Transmisi">
                  <select value={editForm.transmission}
                    onChange={e => setEditForm({...editForm, transmission: e.target.value as any})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white">
                    <option value="Matic">Matic (AT/CVT)</option>
                    <option value="Manual">Manual (MT)</option>
                  </select>
                </FormField>
                <FormField label="Bahan Bakar">
                  <select value={editForm.fuelType}
                    onChange={e => setEditForm({...editForm, fuelType: e.target.value as any})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white">
                    <option value="Bensin">Bensin</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="EV">EV (Listrik)</option>
                  </select>
                </FormField>
                <FormField label="Warna Mobil">
                  <input type="text" value={editForm.carColor}
                    onChange={e => setEditForm({...editForm, carColor: e.target.value})}
                    placeholder="Hitam Metalik"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                </FormField>
                <FormField label="No. Rangka (VIN)">
                  <input type="text" value={editForm.vinNumber}
                    onChange={e => setEditForm({...editForm, vinNumber: e.target.value})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono" />
                </FormField>
                <FormField label="No. Mesin">
                  <input type="text" value={editForm.engineNumber}
                    onChange={e => setEditForm({...editForm, engineNumber: e.target.value})}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono" />
                </FormField>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-black text-xs shadow-md shadow-red-600/20 transition-all">
                  {isSaving ? (
                    <><RefreshCw size={13} className="animate-spin" /> Menyimpan...</>
                  ) : (
                    <><CheckCircle size={13} /> Simpan Perubahan</>
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

// ─── Helper sub-components ───

function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-semibold text-slate-800 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, bg, border, label, value, sub }: {
  icon: React.ReactNode; bg: string; border: string; label: string; value: string; sub: string;
}) {
  return (
    <div className={`rounded-2xl border ${border} ${bg} p-4 shadow-sm`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
          {icon}
        </div>
      </div>
      <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
      <p className="text-xs font-bold text-slate-600 mt-1">{label}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

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
