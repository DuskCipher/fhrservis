import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Users, Car, Phone, Mail, MapPin, CheckCircle,
  Save, Sparkles, Shield, Award, Zap, Fuel, Settings,
  Hash, Calendar, FileText, AlertCircle
} from 'lucide-react';
import { CustomerItem, CustomerSource, CustomerType } from '../../types';
import { addCustomer, updateCustomer } from '../../lib/firestoreService';

interface CRMCustomerFormProps {
  customer?: CustomerItem | null; // If provided, edit mode
  onBack: () => void;
  onNavigate: (page: any) => void;
  onSaveSuccess?: (customer: CustomerItem) => void;
}

const CAR_BRANDS = [
  'Toyota', 'Honda', 'Daihatsu', 'Suzuki', 'Mitsubishi',
  'Nissan', 'Hyundai', 'Wuling', 'Isuzu', 'Mazda',
  'BMW', 'Mercedes-Benz', 'Chevrolet', 'Kia', 'Lainnya'
];

const ALL_SOURCES: CustomerSource[] = [
  'Walk-in Langsung', 'Rekomendasi Teman/Keluarga', 'Google Maps',
  'Instagram', 'TikTok', 'WhatsApp', 'Facebook', 'Lainnya'
];

const SOURCE_EMOJI: Record<string, string> = {
  'Walk-in Langsung': '🚶',
  'Rekomendasi Teman/Keluarga': '🤝',
  'Google Maps': '🗺️',
  'Instagram': '📸',
  'TikTok': '🎵',
  'WhatsApp': '💬',
  'Facebook': '📘',
  'Lainnya': '📣',
};

export function CRMCustomerForm({ customer, onBack, onNavigate, onSaveSuccess }: CRMCustomerFormProps) {
  const isEdit = !!customer;

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
    vinNumber: '',
    engineNumber: '',
    fuelType: 'Bensin' as 'Bensin' | 'Diesel' | 'Hybrid' | 'EV',
    notes: '',
    source: 'Walk-in Langsung' as CustomerSource,
    customerType: 'BARU' as CustomerType,
    createSpkDirectly: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        carBrand: customer.carBrand || 'Toyota',
        carModel: customer.carModel || '',
        carYear: customer.carYear || new Date().getFullYear().toString(),
        licensePlate: customer.licensePlate || '',
        transmission: customer.transmission || 'Matic',
        carColor: customer.carColor || '',
        vinNumber: customer.vinNumber || '',
        engineNumber: customer.engineNumber || '',
        fuelType: customer.fuelType || 'Bensin',
        notes: customer.notes || '',
        source: customer.source || 'Walk-in Langsung',
        customerType: customer.customerType || 'BARU',
        createSpkDirectly: false,
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const carModel = formData.carModel.trim();
    const licensePlate = formData.licensePlate.trim().toUpperCase();

    if (!name || !phone || !carModel || !licensePlate) {
      setErrorMsg('Mohon lengkapi Nama, No. HP, Model Kendaraan, dan Plat Nomor.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        phone,
        email: formData.email.trim() || '',
        address: formData.address.trim() || '—',
        carBrand: formData.carBrand || 'Toyota',
        carModel,
        carYear: formData.carYear.trim() || '2020',
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

      if (isEdit && customer) {
        await updateCustomer(customer.id, payload);
        const updatedObj: CustomerItem = {
          ...customer,
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        if (onSaveSuccess) onSaveSuccess(updatedObj);
        else onBack();
      } else {
        const newId = await addCustomer({
          ...payload,
          totalOrdersCount: 0,
          totalSpent: 0,
        });

        const newObj: CustomerItem = {
          id: newId,
          ...payload,
          totalOrdersCount: 0,
          totalSpent: 0,
          createdAt: new Date().toISOString(),
        };

        if (formData.createSpkDirectly) {
          onNavigate('crm-spk-create');
        } else if (onSaveSuccess) {
          onSaveSuccess(newObj);
        } else {
          onBack();
        }
      }
    } catch (err) {
      console.error('Error saving customer:', err);
      setErrorMsg('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans">
      
      {/* ─── Top Navigation Bar ─── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Kembali</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Database Pelanggan</span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-extrabold text-red-600">
                  {isEdit ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight mt-0.5">
                {isEdit ? `Edit: ${customer?.name}` : 'Form Registrasi Pelanggan & Unit'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-60 text-white text-xs font-black shadow-md shadow-red-600/20 transition-all"
            >
              {isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Save size={14} />
                  <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Pelanggan'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Form Container ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 animate-shake">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
            <div className="text-xs font-semibold">
              <p className="font-bold">Periksa Kembali Data Anda</p>
              <p className="mt-0.5 text-red-600">{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. INFORMASI PEMILIK */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-black text-xs">
                  1
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Informasi Pemilik Kendaraan</h2>
                  <p className="text-[11px] text-slate-400">Data identitas & kontak pelanggan untuk konfirmasi servis</p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Lengkap Pelanggan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      className="w-full pl-3.5 pr-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nomor WhatsApp / HP <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      className="w-full pl-3.5 pr-3 py-2.5 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all text-slate-800"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Pelanggan (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="Contoh: budi@gmail.com"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alamat Domisili <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jl. Sudirman No. 12, Jakarta"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. KATEGORI & SUMBER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-black text-xs">
                  2
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Kategori & Sumber Akuisisi</h2>
                  <p className="text-[11px] text-slate-400">Analisis profil loyalitas dan asal kedatangan pelanggan</p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Tipe Pelanggan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Kategori Pelanggan
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, customerType: 'BARU' })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.customerType === 'BARU'
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black flex items-center gap-1.5">
                          <Zap size={14} className={formData.customerType === 'BARU' ? 'text-emerald-600' : 'text-slate-400'} />
                          PELANGGAN BARU
                        </span>
                        {formData.customerType === 'BARU' && <CheckCircle size={14} className="text-emerald-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Kunjungan servis pertama kali</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, customerType: 'LAMA' })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.customerType === 'LAMA'
                          ? 'border-amber-500 bg-amber-50/70 text-amber-900 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black flex items-center gap-1.5">
                          <Award size={14} className={formData.customerType === 'LAMA' ? 'text-amber-600' : 'text-slate-400'} />
                          PELANGGAN LAMA
                        </span>
                        {formData.customerType === 'LAMA' && <CheckCircle size={14} className="text-amber-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Pelanggan tetap / langganan</p>
                    </button>
                  </div>
                </div>

                {/* Sumber Pelanggan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Sumber / Dari Mana Tahu Bengkel Ini
                  </label>
                  <select
                    value={formData.source}
                    onChange={e => setFormData({ ...formData, source: e.target.value as CustomerSource })}
                    className="w-full px-3.5 py-3 text-xs font-semibold border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none bg-white text-slate-800 transition-all"
                  >
                    {ALL_SOURCES.map(s => (
                      <option key={s} value={s}>
                        {SOURCE_EMOJI[s]} {s}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Data ini membantu tracking efektivitas promosi & channel marketing bengkel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. DATA KENDARAAN */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-black text-xs">
                  3
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Spesifikasi Kendaraan</h2>
                  <p className="text-[11px] text-slate-400">Rincian unit mobil untuk pembuatan Surat Perintah Kerja (SPK)</p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Merek Mobil <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.carBrand}
                    onChange={e => setFormData({ ...formData, carBrand: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none bg-white transition-all"
                  >
                    {CAR_BRANDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Model / Tipe Mobil <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Avanza 1.3 G / Brio RS"
                    className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    value={formData.carModel}
                    onChange={e => setFormData({ ...formData, carModel: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tahun Pembuatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="2021"
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    value={formData.carYear}
                    onChange={e => setFormData({ ...formData, carYear: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Plat Nomor Polisi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: B 1234 ABC"
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-black uppercase tracking-widest border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-slate-900 transition-all"
                    value={formData.licensePlate}
                    onChange={e => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Transmisi
                  </label>
                  <select
                    value={formData.transmission}
                    onChange={e => setFormData({ ...formData, transmission: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none bg-white transition-all"
                  >
                    <option value="Matic">Matic (AT / CVT)</option>
                    <option value="Manual">Manual (MT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Jenis Bahan Bakar
                  </label>
                  <select
                    value={formData.fuelType}
                    onChange={e => setFormData({ ...formData, fuelType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none bg-white transition-all"
                  >
                    <option value="Bensin">Bensin</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="EV">EV (Listrik)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Warna Mobil
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Hitam Metalik"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    value={formData.carColor}
                    onChange={e => setFormData({ ...formData, carColor: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    No. Rangka / VIN (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Nomor rangka kendaraan"
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    value={formData.vinNumber}
                    onChange={e => setFormData({ ...formData, vinNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    No. Mesin (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Nomor mesin kendaraan"
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    value={formData.engineNumber}
                    onChange={e => setFormData({ ...formData, engineNumber: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Catatan Khusus Pelanggan / Riwayat Servis (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Oli mesin preferensi 5W-30, rem depan agak berdecit saat hujan, dsb..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Quick SPK Option (only for new customer) */}
          {!isEdit && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="createSpkDirectly"
                className="w-4 h-4 rounded text-red-600 accent-red-600 mt-0.5 cursor-pointer"
                checked={formData.createSpkDirectly}
                onChange={e => setFormData({ ...formData, createSpkDirectly: e.target.checked })}
              />
              <label htmlFor="createSpkDirectly" className="text-xs font-bold text-amber-900 cursor-pointer">
                <span>Langsung Lanjut Buat SPK setelah Data Disimpan</span>
                <p className="text-[11px] font-normal text-amber-700 mt-0.5">
                  Setelah menyimpan, sistem akan langsung membuka halaman SPK Wizard untuk mulai inspeksi.
                </p>
              </label>
            </div>
          )}

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all"
            >
              Batal & Kembali
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-60 text-white text-xs font-black shadow-md shadow-red-600/25 transition-all"
            >
              {isSubmitting ? (
                <span>Menyimpan Data...</span>
              ) : (
                <>
                  <CheckCircle size={15} />
                  <span>{isEdit ? 'Perbarui Profil Pelanggan' : 'Simpan Data Pelanggan'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
