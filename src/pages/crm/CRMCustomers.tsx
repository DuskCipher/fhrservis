import React, { useState } from 'react';
import {
  Users, Search, Plus, Phone, MessageSquare, Car, MapPin, 
  Calendar, Wrench, Edit, Trash2, X, CheckCircle, FileText, 
  Filter, Shield, ArrowRight, Clock, DollarSign, Sparkles
} from 'lucide-react';
import { CustomerItem, CRMOrder, OrderStatus } from '../../types';
import { addCustomer, updateCustomer, deleteCustomer, addOrder } from '../../lib/firestoreService';

interface CRMCustomersProps {
  customers: CustomerItem[];
  orders: CRMOrder[];
  onNavigate: (page: any) => void;
}

const CAR_BRANDS = [
  'Toyota', 'Honda', 'Daihatsu', 'Suzuki', 'Mitsubishi', 
  'Nissan', 'Hyundai', 'Wuling', 'Isuzu', 'Mazda', 
  'BMW', 'Mercedes-Benz', 'Chevrolet', 'Kia', 'Lainnya'
];

const SERVICE_TYPES = [
  'Ganti Oli Mesin & Filter',
  'Tune Up & Gurah Mesin (Carbon Clean)',
  'Servis AC Mobil & Isi Freon',
  'Ganti Kampas & Minyak Rem',
  'Ganti Aki & Kelistrikan / Alternator',
  'Servis Kaki-kaki & Suspensi',
  'General Check-up & Inspeksi 50 Titik',
  'Emergency Roadside / Mobil Mogok 24 Jam',
  'Overhaul / Turun Mesin',
  'Lainnya (Custom Servis)',
];

export function CRMCustomers({ customers, orders, onNavigate }: CRMCustomersProps) {
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  
  // Customer Modal state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
  
  // Create SPK Modal state
  const [showSpkModal, setShowSpkModal] = useState(false);
  const [targetCustomer, setTargetCustomer] = useState<CustomerItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSpkId, setSuccessSpkId] = useState<string | null>(null);

  // Customer Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    carBrand: 'Toyota',
    carModel: '',
    carYear: new Date().getFullYear().toString(),
    licensePlate: '',
    transmission: 'Matic' as 'Manual' | 'Matic',
    carColor: '',
    notes: '',
    createSpkDirectly: false,
  });

  // SPK Form State
  const [spkData, setSpkData] = useState({
    serviceType: SERVICE_TYPES[0],
    isEmergency: false,
    serviceDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    serviceTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    locationAddress: '',
    totalPrice: 0,
    status: 'process' as OrderStatus,
    notes: '',
  });

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      c.carModel.toLowerCase().includes(search.toLowerCase()) ||
      c.carBrand.toLowerCase().includes(search.toLowerCase());
    const matchBrand = filterBrand === 'all' || c.carBrand.toLowerCase() === filterBrand.toLowerCase();
    return matchSearch && matchBrand;
  });

  // Calculate stats
  const totalCustomers = customers.length;
  const activeOrdersCount = orders.filter(o => o.status === 'process' || o.status === 'pending').length;

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      carBrand: 'Toyota',
      carModel: '',
      carYear: new Date().getFullYear().toString(),
      licensePlate: '',
      transmission: 'Matic',
      carColor: '',
      notes: '',
      createSpkDirectly: false,
    });
    setShowCustomerModal(true);
  };

  const openEditModal = (c: CustomerItem) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      address: c.address,
      carBrand: c.carBrand,
      carModel: c.carModel,
      carYear: c.carYear,
      licensePlate: c.licensePlate,
      transmission: c.transmission || 'Matic',
      carColor: c.carColor || '',
      notes: c.notes || '',
      createSpkDirectly: false,
    });
    setShowCustomerModal(true);
  };

  const openSpkModalForCustomer = (c: CustomerItem) => {
    setTargetCustomer(c);
    setSpkData({
      serviceType: SERVICE_TYPES[0],
      isEmergency: false,
      serviceDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      serviceTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      locationAddress: c.address,
      totalPrice: 0,
      status: 'process',
      notes: '',
    });
    setSuccessSpkId(null);
    setShowSpkModal(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.carModel || !formData.licensePlate) {
      alert('Mohon lengkapi Nama, No. HP, Model Mobil, dan Plat Nomor.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          carBrand: formData.carBrand,
          carModel: formData.carModel,
          carYear: formData.carYear,
          licensePlate: formData.licensePlate.toUpperCase(),
          transmission: formData.transmission,
          carColor: formData.carColor,
          notes: formData.notes,
        });
        setShowCustomerModal(false);
      } else {
        const newCustId = await addCustomer({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          carBrand: formData.carBrand,
          carModel: formData.carModel,
          carYear: formData.carYear,
          licensePlate: formData.licensePlate.toUpperCase(),
          transmission: formData.transmission,
          carColor: formData.carColor,
          notes: formData.notes,
          totalOrdersCount: 0,
          totalSpent: 0,
        });

        setShowCustomerModal(false);

        if (formData.createSpkDirectly) {
          const createdCustomerObj: CustomerItem = {
            id: newCustId,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            carBrand: formData.carBrand,
            carModel: formData.carModel,
            carYear: formData.carYear,
            licensePlate: formData.licensePlate.toUpperCase(),
            transmission: formData.transmission,
            carColor: formData.carColor,
            notes: formData.notes,
            createdAt: new Date().toISOString(),
          };
          openSpkModalForCustomer(createdCustomerObj);
        }
      }
    } catch (err) {
      console.error('Error saving customer:', err);
      alert('Gagal menyimpan data pelanggan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus data pelanggan "${name}"?`)) {
      try {
        await deleteCustomer(id);
      } catch (err) {
        console.error('Error deleting customer:', err);
        alert('Gagal menghapus pelanggan.');
      }
    }
  };

  const handleCreateSPK = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomer) return;

    setIsSubmitting(true);
    try {
      const orderPayload: Omit<CRMOrder, 'id' | 'createdAt'> = {
        customerName: targetCustomer.name,
        phone: targetCustomer.phone,
        serviceType: spkData.serviceType,
        carBrand: targetCustomer.carBrand,
        carModel: targetCustomer.carModel,
        carYear: targetCustomer.carYear,
        licensePlate: targetCustomer.licensePlate,
        locationAddress: spkData.locationAddress || targetCustomer.address,
        isEmergency: spkData.isEmergency,
        notes: spkData.notes,
        serviceDate: spkData.serviceDate,
        serviceTime: spkData.serviceTime,
        status: spkData.status,
        totalPrice: Number(spkData.totalPrice) || 0,
      };

      const newOrderId = await addOrder(orderPayload);
      
      // Update customer total count
      await updateCustomer(targetCustomer.id, {
        totalOrdersCount: (targetCustomer.totalOrdersCount || 0) + 1,
        totalSpent: (targetCustomer.totalSpent || 0) + (Number(spkData.totalPrice) || 0),
      });

      setSuccessSpkId(newOrderId);
    } catch (err) {
      console.error('Error creating SPK:', err);
      alert('Gagal membuat SPK. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRp = (n?: number) => n ? 'Rp ' + n.toLocaleString('id-ID') : 'Rp 0';

  return (
    <div className="p-4 sm:p-5 space-y-4 font-sans">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                <Users size={20} />
              </span>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900">Database Pelanggan</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Input data pelanggan & kendaraan, lalu buat SPK (Surat Perintah Kerja) secara otomatis
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all"
            >
              <Plus size={16} />
              <span>+ Tambah Pelanggan Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pelanggan</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCustomers}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Database bengkel terdaftar</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SPK Aktif / Proses</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{activeOrdersCount} <span className="text-xs font-semibold">Mobil</span></p>
          <p className="text-[10px] text-slate-400 mt-0.5">Sedang dalam pengerjaan</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobil Terdaftar</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{customers.length} <span className="text-xs font-semibold">Unit</span></p>
          <p className="text-[10px] text-slate-400 mt-0.5">Unit siap servis & home service</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Merek Terbanyak</p>
          <p className="text-lg font-black text-slate-800 mt-1 truncate">Toyota / Honda</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Dominasi kendaraan pelanggan</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter size={13} /> MEREK:
          </span>
          <button
            onClick={() => setFilterBrand('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              filterBrand === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua ({customers.length})
          </button>
          {['Toyota', 'Honda', 'Daihatsu', 'Mitsubishi', 'Suzuki'].map(b => (
            <button
              key={b}
              onClick={() => setFilterBrand(b)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                filterBrand.toLowerCase() === b.toLowerCase()
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
            placeholder="Cari nama, no HP, plat no, mobil..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold">
                <th className="px-4 py-3.5 text-center w-12">NO</th>
                <th className="px-4 py-3.5">NAMA PELANGGAN & KONTAK</th>
                <th className="px-4 py-3.5">KENDARAAN</th>
                <th className="px-4 py-3.5">PLAT NOMOR</th>
                <th className="px-4 py-3.5">ALAMAT DOMISILI</th>
                <th className="px-4 py-3.5 text-center">TOTAL SPK</th>
                <th className="px-4 py-3.5 text-right font-bold">AKSI CEPAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users size={32} className="text-slate-300" />
                      <p className="font-semibold text-slate-600">Belum ada data pelanggan yang cocok.</p>
                      <button
                        onClick={openAddModal}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
                      >
                        + Input Data Pelanggan Baru
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c, idx) => {
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 text-center text-slate-400 font-semibold">{idx + 1}</td>
                      
                      {/* Name & Contact */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-black flex items-center justify-center text-xs shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-slate-500">
                              <span className="font-mono text-[11px]">{c.phone}</span>
                              {c.email && (
                                <>
                                  <span>•</span>
                                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{c.email}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Car Details */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Car size={15} className="text-red-600 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800">
                              {c.carBrand} {c.carModel}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Tahun {c.carYear} • {c.transmission || 'Matic'} {c.carColor ? `• ${c.carColor}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* License Plate Badge */}
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2.5 py-1 rounded bg-slate-900 text-white font-mono font-bold text-xs tracking-wider border border-slate-700 shadow-xs">
                          {c.licensePlate}
                        </span>
                      </td>

                      {/* Address */}
                      <td className="px-4 py-3.5 text-slate-600 max-w-xs">
                        <div className="flex items-start gap-1">
                          <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 text-xs">{c.address || '—'}</span>
                        </div>
                      </td>

                      {/* Total SPK */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {c.totalOrdersCount || 0} SPK
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* PRIMARY ACTION: BUAT SPK */}
                          <button
                            onClick={() => openSpkModalForCustomer(c)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-sm shadow-red-600/30 transition-all"
                            title="Buat Surat Perintah Kerja dari pelanggan ini"
                          >
                            <FileText size={13} />
                            <span>Buat SPK</span>
                          </button>

                          {/* WhatsApp Chat */}
                          <a
                            href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=Halo%20Bpk/Ibu%20${encodeURIComponent(c.name)},%20kami%20dari%20FHRCAR%20Auto%20Services.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Chat WhatsApp"
                          >
                            <MessageSquare size={14} />
                          </a>

                          {/* Edit Customer */}
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            title="Edit Data Pelanggan"
                          >
                            <Edit size={14} />
                          </button>

                          {/* Delete Customer */}
                          <button
                            onClick={() => handleDeleteCustomer(c.id, c.name)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            title="Hapus Data Pelanggan"
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

      {/* ---------------------------------------------------- */}
      {/* 1. MODAL TAMBAH / EDIT PELANGGAN                    */}
      {/* ---------------------------------------------------- */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCustomerModal(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-slideUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {editingCustomer ? 'Edit Data Pelanggan' : 'Tambah Data Pelanggan Baru'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Simpan data kontak & unit mobil pelanggan untuk kemudahan pembuatan SPK
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCustomer} className="p-5 sm:p-6 space-y-6">
              
              {/* Bagian 1: Informasi Pelanggan */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span>1. INFORMASI PEMILIK MOBIL</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap Pelanggan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor HP / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email (Opsional)
                    </label>
                    <input
                      type="email"
                      placeholder="Contoh: budi@gmail.com"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alamat / Lokasi Domisili <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Jl. Sudirman No. 12, Jakarta"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Informasi Kendaraan */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span>2. DATA SPESIFIKASI KENDARAAN</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Merek Mobil <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white"
                      value={formData.carBrand}
                      onChange={e => setFormData({ ...formData, carBrand: e.target.value })}
                    >
                      {CAR_BRANDS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Model / Tipe Mobil <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Avanza 1.3 G / Brio RS"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                      value={formData.carModel}
                      onChange={e => setFormData({ ...formData, carModel: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tahun Pembuatan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Contoh: 2020"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono"
                      value={formData.carYear}
                      onChange={e => setFormData({ ...formData, carYear: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Plat Nomor Polisi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: B 1234 ABC"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono uppercase font-bold"
                      value={formData.licensePlate}
                      onChange={e => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Transmisi
                    </label>
                    <select
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white"
                      value={formData.transmission}
                      onChange={e => setFormData({ ...formData, transmission: e.target.value as any })}
                    >
                      <option value="Matic">Matic (AT / CVT)</option>
                      <option value="Manual">Manual (MT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Warna Mobil
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Hitam Metalik"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                      value={formData.carColor}
                      onChange={e => setFormData({ ...formData, carColor: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Khusus / Riwayat Servis Pelanggan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Sering ganti oli Shell Helix 5W-30, rem depan agak berbunyi saat hujan..."
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              {/* Option to immediately create SPK */}
              {!editingCustomer && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="createSpkDirectly"
                    className="w-4 h-4 rounded text-red-600 accent-red-600 mt-0.5 cursor-pointer"
                    checked={formData.createSpkDirectly}
                    onChange={e => setFormData({ ...formData, createSpkDirectly: e.target.checked })}
                  />
                  <label htmlFor="createSpkDirectly" className="text-xs font-bold text-amber-900 cursor-pointer">
                    <span>Langsung buat SPK (Surat Perintah Kerja) setelah data pelanggan ini disimpan</span>
                    <p className="text-[11px] font-normal text-amber-700 mt-0.5">
                      Form SPK akan langsung terbuka otomatis dengan data pelanggan & mobil yang baru Anda masukkan.
                    </p>
                  </label>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : (editingCustomer ? 'Perbarui Data' : 'Simpan Data Pelanggan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. MODAL BUAT SPK DARI DATA PELANGGAN                */}
      {/* ---------------------------------------------------- */}
      {showSpkModal && targetCustomer && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSpkModal(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-slideUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-red-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-red-600/20">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900">Buat Surat Perintah Kerja (SPK)</h2>
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-extrabold">BARU</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Otomatis mengambil data dari pelanggan terpilih
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSpkModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* If SPK already successfully created */}
            {successSpkId ? (
              <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
                  <CheckCircle size={36} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">SPK Berhasil Diterbitkan!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Nomor ID SPK: <span className="font-mono font-bold text-slate-800">{successSpkId}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data SPK telah otomatis masuk ke antrean Service Order dan riwayat pelanggan diperbarui.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-3">
                  <button
                    onClick={() => {
                      setShowSpkModal(false);
                      onNavigate('crm-orders');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Lihat di Halaman Daftar SPK</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => setShowSpkModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            ) : (
              /* SPK Creation Form */
              <form onSubmit={handleCreateSPK} className="p-5 sm:p-6 space-y-5">
                
                {/* Pre-filled Customer Info Box */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 border border-slate-800">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">DATA PELANGGAN TERPILIH</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-black text-sm text-white">{targetCustomer.name}</p>
                      <p className="text-slate-300 font-mono text-[11px] mt-0.5">{targetCustomer.phone}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="font-black text-sm text-red-400">{targetCustomer.carBrand} {targetCustomer.carModel} ({targetCustomer.carYear})</p>
                      <span className="inline-block px-2 py-0.5 mt-1 rounded bg-red-600 text-white font-mono font-bold text-xs tracking-wider">
                        {targetCustomer.licensePlate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Fields for Service Order */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jenis Pekerjaan / Layanan Servis <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white font-semibold"
                        value={spkData.serviceType}
                        onChange={e => setSpkData({ ...spkData, serviceType: e.target.value })}
                      >
                        {SERVICE_TYPES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Status Awal SPK <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white font-bold"
                        value={spkData.status}
                        onChange={e => setSpkData({ ...spkData, status: e.target.value as OrderStatus })}
                      >
                        <option value="process">▶ DALAM PROSES PENGERJAAN</option>
                        <option value="pending">⏱ DRAFT / TAHAP INSPEKSI</option>
                        <option value="completed">✓ LANGSUNG SELESAI</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tanggal Pelaksanaan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                        value={spkData.serviceDate}
                        onChange={e => setSpkData({ ...spkData, serviceDate: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jam Servis <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono"
                        value={spkData.serviceTime}
                        onChange={e => setSpkData({ ...spkData, serviceTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Total Estimasi / Biaya Servis (Rp)
                      </label>
                      <input
                        type="number"
                        placeholder="Contoh: 350000"
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono font-bold"
                        value={spkData.totalPrice || ''}
                        onChange={e => setSpkData({ ...spkData, totalPrice: Number(e.target.value) })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lokasi Servis / Alamat Pengerjaan
                      </label>
                      <input
                        type="text"
                        placeholder="Alamat pengerjaan unit..."
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                        value={spkData.locationAddress}
                        onChange={e => setSpkData({ ...spkData, locationAddress: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Deskripsi Keluhan / Catatan Teknisi
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Masukkan keluhan dari customer atau instruksi suku cadang yang diganti..."
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                      value={spkData.notes}
                      onChange={e => setSpkData({ ...spkData, notes: e.target.value })}
                    />
                  </div>

                  {/* Emergency Toggle */}
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50/70 border border-red-200">
                    <input
                      type="checkbox"
                      id="spkEmergency"
                      className="w-4 h-4 rounded text-red-600 accent-red-600 cursor-pointer"
                      checked={spkData.isEmergency}
                      onChange={e => setSpkData({ ...spkData, isEmergency: e.target.checked })}
                    />
                    <label htmlFor="spkEmergency" className="text-xs font-bold text-red-900 cursor-pointer">
                      Tandai sebagai Layanan Panggilan Darurat (Roadside SOS 24 Jam)
                    </label>
                  </div>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSpkModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <FileText size={14} />
                    <span>{isSubmitting ? 'Memproses...' : 'Terbitkan SPK Sekarang'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
