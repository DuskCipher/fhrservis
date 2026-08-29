import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  ShieldAlert, 
  MessageSquare, 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Car, 
  Phone, 
  User, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowLeft,
  Info,
  BadgePercent
} from 'lucide-react';
import { CAR_BRANDS, SERVICES_DATA, WHATSAPP_PHONE, EMERGENCY_HOTLINE, COVERAGE_AREAS } from '../data/mockData';
import { BookingData, PageType } from '../types';
import { addOrder } from '../lib/firestoreService';

interface BookingPageProps {
  initialService?: string;
  initialNotes?: string;
  onNavigate: (page: PageType) => void;
}

const PURWOKERTO_QUICK_LOCATIONS = [
  'Purwokerto Timur (Alun-Alun / Jl. Soedirman)',
  'Purwokerto Utara (Area Kampus UNSOED)',
  'Purwokerto Selatan (Berkoh / Karangklesem)',
  'Purwokerto Barat (Rejasari / Pasirmuncang)',
  'Sokaraja (Jl. Suparjo Rustam)',
  'Baturraden (Jalur Wisata / Karangmangu)',
  'Karanglewas / Kedungbanteng',
  'Kembaran / Dukuhwaluh (Area Kampus UMP)'
];

export function BookingPage({ initialService = '', initialNotes = '', onNavigate }: BookingPageProps) {
  const [formData, setFormData] = useState<BookingData>({
    customerName: '',
    phone: '',
    serviceType: initialService || SERVICES_DATA[0].title,
    carBrand: 'Toyota',
    carModel: '',
    carYear: '2020',
    licensePlate: '',
    locationAddress: '',
    isEmergency: true,
    notes: initialNotes || '',
    serviceDate: new Date().toISOString().split('T')[0],
    serviceTime: 'Sekarang (Emergency Darurat)',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingTicket, setBookingTicket] = useState('');

  useEffect(() => {
    if (initialService) {
      setFormData(prev => ({ ...prev, serviceType: initialService }));
    }
    if (initialNotes) {
      setFormData(prev => ({ ...prev, notes: initialNotes }));
    }
  }, [initialService, initialNotes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketId = `FHR-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingTicket(ticketId);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Save automatically to Firestore so it reflects immediately in CRM Booking Area
    addOrder({
      ...formData,
      status: 'pending',
      spkNumber: ticketId,
    });

    // WhatsApp Message
    const waText = `*FORM BOOKING SERVIS - FHRCAR AUTO SERVICES PURWOKERTO*
No. Tiket: *${ticketId}*
----------------------------------
*Nama Pelanggan:* ${formData.customerName || '-'}
*No. WhatsApp/HP:* ${formData.phone || '-'}
*Tipe Panggilan:* ${formData.isEmergency ? 'EMERGENCY SEKARANG (<30 Mnt Purwokerto)' : 'Home Service Terjadwal'}
*Layanan:* ${formData.serviceType}
*Mobil:* ${formData.carBrand} ${formData.carModel} (${formData.carYear || '-'})
*Plat Nomor:* ${formData.licensePlate || '-'}
*Lokasi Servis:* ${formData.locationAddress || '-'}
*Waktu Pengerjaan:* ${formData.isEmergency ? 'SEKARANG (DARURAT)' : `${formData.serviceDate} (${formData.serviceTime})`}
*Keluhan / Catatan:* ${formData.notes || 'Pemeriksaan standar'}
----------------------------------
Mohon segera dikonfirmasi kedatangan mekanik. Terima kasih!`;

    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(waText)}`;
    
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 700);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      customerName: '',
      phone: '',
      serviceType: SERVICES_DATA[0].title,
      carBrand: 'Toyota',
      carModel: '',
      carYear: '2020',
      licensePlate: '',
      locationAddress: '',
      isEmergency: false,
      notes: '',
      serviceDate: new Date().toISOString().split('T')[0],
      serviceTime: 'Pagi (08:00 - 11:00)',
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* Top Breadcrumb & Back button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 flex-wrap">
            <button 
              onClick={() => onNavigate('beranda')}
              className="hover:text-red-600 font-medium transition-colors"
            >
              Beranda
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">
              Form Booking & Panggilan Mekanik
            </span>
          </div>

          <button
            onClick={() => onNavigate('beranda')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:text-red-600 hover:border-red-300 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>

        {/* Page Title & Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Respon Cepat Home Service & Emergency 24 Jam</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
              Form Booking & Panggilan Mekanik Mobil Purwokerto
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
              Isi data kendaraan dan alamat Anda di bawah ini. Tim mekanik FHRCAR segera menghubungi untuk konfirmasi dan meluncur langsung ke rumah, kantor, atau titik darurat di seluruh Purwokerto & Banyumas.
            </p>
          </div>

          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-12 translate-y-12">
            <Wrench className="w-80 h-80 text-slate-900" />
          </div>
        </div>

        {/* Main Grid: Form (8 Cols) + Guarantees & Hotline (4 Cols) */}
        {!isSubmitted ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            
            {/* Left Main Booking Form (8 Cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Mode Panggilan: Emergency vs Scheduled */}
                <div className="space-y-3">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                    1. Pilih Jenis Waktu Kunjungan
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Emergency Mode Card */}
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, isEmergency: true, serviceTime: 'Sekarang (Emergency Darurat)' }))}
                      className={`cursor-pointer p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                        formData.isEmergency
                          ? 'border-red-600 bg-red-50/70 shadow-sm ring-2 ring-red-500/20'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${formData.isEmergency ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">Panggilan Darurat / SOS</span>
                          <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase">24 Jam</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Mobil mogok, overheat, aki drop, atau ban bocor. Mekanik langsung meluncur (&lt;30 menit tiba di Purwokerto).
                        </p>
                      </div>
                    </div>

                    {/* Scheduled Mode Card */}
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, isEmergency: false, serviceTime: 'Pagi (08:00 - 11:00)' }))}
                      className={`cursor-pointer p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                        !formData.isEmergency
                          ? 'border-red-600 bg-red-50/70 shadow-sm ring-2 ring-red-500/20'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${!formData.isEmergency ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">Home Service Terjadwal</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Pilih tanggal dan jam servis sesuai waktu luang Anda untuk servis berkala di rumah (Tune Up, Ganti Oli, Rem).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date & Time (Shown only if scheduled) */}
                {!formData.isEmergency && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-red-600" />
                        <span>Tanggal Servis *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.serviceDate}
                        onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-red-600" />
                        <span>Sesi Waktu Kunjungan *</span>
                      </label>
                      <select
                        value={formData.serviceTime}
                        onChange={(e) => setFormData({ ...formData, serviceTime: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-red-500 outline-none"
                      >
                        <option value="Pagi (08:00 - 11:00)">Pagi (08:00 - 11:00)</option>
                        <option value="Siang (11:00 - 14:00)">Siang (11:00 - 14:00)</option>
                        <option value="Sore (14:00 - 17:00)">Sore (14:00 - 17:00)</option>
                        <option value="Malam (18:30 - 21:00)">Malam (18:30 - 21:00)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 2. Customer Information */}
                <div className="space-y-4 pt-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                    2. Data Kontak Pemesan
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Nama Lengkap *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Bpk. Budi Santoso"
                          value={formData.customerName}
                          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                          className="w-full pl-10 pr-3.5 py-3 text-sm rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Nomor WhatsApp / Telepon Aktif *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          required
                          placeholder="Contoh: 081234567890"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-3.5 py-3 text-sm rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Service Selection & Vehicle Details */}
                <div className="space-y-4 pt-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                    3. Detail Layanan & Kendaraan
                  </label>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Pilihan Layanan Servis *
                      </label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        className="w-full px-3.5 py-3 text-sm rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      >
                        {SERVICES_DATA.map(s => (
                          <option key={s.id} value={s.title}>{s.number}. {s.title}</option>
                        ))}
                        <option value="Free General Check Up (Klaim Slot 20 Titik)">Free General Check Up (5 Slot Harian - Gratis 20 Titik)</option>
                        <option value="Emergency Darurat Mobil Mogok di Jalan / Tol">Emergency Darurat Mobil Mogok di Jalan / Tol</option>
                        <option value="Pemeriksaan Kelistrikan & Sensor ECU">Pemeriksaan Kelistrikan & Sensor ECU</option>
                        <option value="Konsultasi & Penanganan Kerusakan Lainnya">Konsultasi & Penanganan Kerusakan Lainnya</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Merk Mobil *
                        </label>
                        <select
                          value={formData.carBrand}
                          onChange={(e) => setFormData({ ...formData, carBrand: e.target.value })}
                          className="w-full px-3.5 py-3 text-sm rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                        >
                          {CAR_BRANDS.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Tipe / Model Mobil *
                        </label>
                        <div className="relative">
                          <Car className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="text"
                            required
                            placeholder="Innova / Avanza / Jazz / Brio"
                            value={formData.carModel}
                            onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                            className="w-full pl-10 pr-3.5 py-3 text-sm rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Tahun Mobil
                        </label>
                        <input
                          type="text"
                          placeholder="2018 / 2021"
                          value={formData.carYear}
                          onChange={(e) => setFormData({ ...formData, carYear: e.target.value })}
                          className="w-full px-3.5 py-3 text-sm rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Nomor Plat Kendaraan (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: R 1234 AB"
                        value={formData.licensePlate}
                        onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                        className="w-full px-3.5 py-3 text-sm rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Location Details & Quick Purwokerto Chips */}
                <div className="space-y-4 pt-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                    4. Lokasi Kunjungan Servis di Purwokerto
                  </label>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Pilih Cepat Area / Wilayah:
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {PURWOKERTO_QUICK_LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            locationAddress: prev.locationAddress ? `${prev.locationAddress}, ${loc}` : loc
                          }))}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 text-slate-700 text-xs font-medium transition-colors"
                        >
                          + {loc}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <textarea
                        required
                        rows={3}
                        placeholder="Tuliskan nama jalan, nomor rumah / patokan lokasi parkiran / titik mogok di jalan raya atau perumahan..."
                        value={formData.locationAddress}
                        onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-3 text-sm rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Deskripsi Keluhan Mobil / Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Lampu check engine menyala, starter berbunyi klik-klik saja, AC tidak dingin, bunyi jedug di roda depan..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Data Anda aman & langsung terhubung ke WhatsApp Admin Resmi</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-red-600/30 transition-all active:scale-98"
                  >
                    <MessageSquare className="w-5 h-5 fill-white" />
                    <span>Kirim & Hubungkan ke WhatsApp</span>
                  </button>
                </div>

              </form>

            </div>

            {/* Right Sticky Sidebar: 24H Hotline & Guarantees (4 Cols) */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* Emergency Hotline Card */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Darurat Siaga 24 Jam Purwokerto</span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white leading-tight">
                    Mobil Mogok di Jalan / Perlu Bantuan Instan?
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Jangan panik! Hubungi hotline darurat kami untuk pengiriman armada mekanik terdekat ke posisi Anda sekarang.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Hotline Darurat</div>
                  <div className="text-2xl font-black text-red-400 tracking-wide">
                    {EMERGENCY_HOTLINE}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <a
                    href={`tel:${EMERGENCY_HOTLINE.replace(/[^0-9]/g, '')}`}
                    className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/30"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Telepon Hotline Sekarang</span>
                  </a>

                  <a
                    href={`https://wa.me/${WHATSAPP_PHONE}?text=Halo%20Admin%20FHRCAR,%20saya%20butuh%20mekanik%20darurat%20di%20Purwokerto`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat WhatsApp Admin</span>
                  </a>
                </div>
              </div>

              {/* Guarantees & Trust Factors */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                <h4 className="text-base font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                  <span>Keuntungan Servis di FHRCAR</span>
                </h4>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Gratis 20 Titik General Check-up</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">Pemeriksaan rem, aki, minyak, pendingin, dan kelistrikan tanpa biaya tambahan.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Mekanik Handal & Bersertifikat</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">Berpengalaman menangani mobil Jepang, Eropa, dan Korea dengan SOP rapi.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Transparansi Biaya & Nota Resmi</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">Estimasi dijelaskan di awal sebelum pengerjaan. Tidak ada biaya siluman.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Garansi Pengerjaan & Suku Cadang Asli</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">Garansi servis hingga 30 hari dan suku cadang asli OEM bermutu tinggi.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Area Coverage Badge */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 border border-red-200/80 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>Area Standby Purwokerto</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Melayani seluruh wilayah Purwokerto Kota, Baturraden, Sokaraja, Kembaran, Karanglewas, Kedungbanteng, Kalibagor, Patikraja, hingga seluruh Banyumas Raya.
                </p>
              </div>

            </aside>

          </div>
        ) : (
          /* Submission Confirmation View */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm max-w-2xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-12 h-12" />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-3.5 py-1.5 rounded-full border border-red-200">
                Pemesanan Berhasil Dikirim
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                Nomor Tiket: #{bookingTicket}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Admin dan Tim Mekanik FHRCAR Purwokerto telah menerima data Anda. Chat WhatsApp akan terbuka otomatis untuk konfirmasi keberangkatan mekanik ke lokasi.
              </p>
            </div>

            {/* Summary Ticket */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Nama Pelanggan:</span>
                <span className="font-bold text-slate-900">{formData.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">No. WhatsApp:</span>
                <span className="font-bold text-slate-900">{formData.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Layanan:</span>
                <span className="font-bold text-slate-900">{formData.serviceType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Mobil:</span>
                <span className="font-bold text-slate-900">{formData.carBrand} {formData.carModel} ({formData.carYear})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Status Waktu:</span>
                <span className="font-bold text-red-600">{formData.isEmergency ? 'Darurat / Emergency (<30 Mnt)' : `${formData.serviceDate} (${formData.serviceTime})`}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Lokasi:</span>
                <span className="font-bold text-slate-900 text-right max-w-xs">{formData.locationAddress}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Buat Pemesanan Baru
              </button>

              <button
                onClick={() => onNavigate('beranda')}
                className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
