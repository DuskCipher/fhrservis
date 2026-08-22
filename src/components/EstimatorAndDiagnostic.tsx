import { useState } from 'react';
import { CAR_BRANDS, DIAGNOSTIC_OPTIONS, WHATSAPP_PHONE } from '../data/mockData';
import { Settings2, Stethoscope, AlertTriangle, MessageSquare, ShieldAlert, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { DiagnosticOption } from '../types';

interface EstimatorProps {
  onOpenBookingWithDetails: (notes: string, service: string) => void;
}

export function EstimatorAndDiagnostic({ onOpenBookingWithDetails }: EstimatorProps) {
  const [activeTab, setActiveTab] = useState<'estimator' | 'diagnostic'>('estimator');

  // Estimator Form State
  const [selectedBrand, setSelectedBrand] = useState('Toyota');
  const [carType, setCarType] = useState('MPV / SUV (Avanza, Innova, Rush, Fortuner, Xpander)');
  const [servicePackage, setServicePackage] = useState('ganti-oli');
  const [isEmergency, setIsEmergency] = useState(false);
  const [selectedOilType, setSelectedOilType] = useState('Shell Helix HX6 10W-40 (Semi Synthetic)');

  // Diagnostic State
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<DiagnosticOption>(DIAGNOSTIC_OPTIONS[0]);

  // Service package descriptions
  const getPackageDetails = () => {
    let title = '';
    let desc = '';
    let inclusions = [
      'Jasa mekanik langsung ke lokasi di Purwokerto & sekitarnya',
      'Free 20 Titik General Check-Up kendaraan',
      'Peralatan standar bengkel resmi & suku cadang original',
      'Garansi servis resmi pengerjaan'
    ];

    if (servicePackage === 'ganti-oli') {
      title = 'Paket Ganti Oli Mesin + Filter Original';
      desc = 'Penggantian oli mesin sesuai spesifikasi pabrikan, kuras oli bersih, filter oli baru, dan pengecekan menyeluruh 20 komponen keselamatan.';
    } else if (servicePackage === 'tune-up') {
      title = 'Paket Tune Up & Gurah Mesin Lengkap';
      desc = 'Pembersihan Injektor, Throttle Body, Carbon Cleaner Gurah Mesin, Cek Busi & Kalibrasi Sensor Kelistrikan.';
    } else if (servicePackage === 'emergency-jumper') {
      title = 'Layanan Emergency Jumper & Cek Kelistrikan';
      desc = 'Armada Emergency cepat siaga 24 jam, jumper aki profesional, pengecekan dinamo ampere/alternator di lokasi.';
    } else if (servicePackage === 'service-rem') {
      title = 'Paket Servis Rem 4 Roda & Kaki-Kaki';
      desc = 'Pembersihan 4 Roda, Ganti Kampas Rem, Pemeriksaan Piringan Cakram & Bleeding Minyak Rem.';
    } else if (servicePackage === 'scan-ecu') {
      title = 'Diagnosa Scanner Komputer & Sensor ECU';
      desc = 'Pemeriksaan Sistem Elektrikal Semua Modul, Reset DTC / Lampu Indikator Mesin & Analisa Data Sensor.';
    } else {
      title = 'Servis Umum & Pemeriksaan Komprehensif';
      desc = 'Pemeriksaan menyeluruh kaki-kaki atau mesin mobil di lokasi Anda.';
    }

    return { title, desc, inclusions };
  };

  const currentPackage = getPackageDetails();

  const handleBookFromEstimator = () => {
    const message = `Halo Admin FHRCAR, saya ingin konsultasi / pesan servis mobil di Purwokerto:
- Mobil: ${selectedBrand} (${carType})
- Paket Servis: ${currentPackage.title}
${servicePackage === 'ganti-oli' ? `- Pilihan Oli: ${selectedOilType}\n` : ''}- Mode Layanan: ${isEmergency ? 'Darurat / Emergency (<30 Mnt)' : 'Home Service Terjadwal'}
- Free Check: Termasuk 20 Titik General Check-up
Mohon info ketersediaan jadwal & mekanik. Terima kasih!`;

    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleBookFromDiagnostic = () => {
    const message = `Halo Admin FHRCAR, saya butuh bantuan mekanik untuk keluhan mobil saya di Purwokerto:
- Gejala Kerusakan: ${selectedDiagnostic.symptom}
- Kategori: ${selectedDiagnostic.category}
- Rekomendasi Penanganan: ${selectedDiagnostic.recommendedService}`;

    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="estimator" className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-red-600"></span>
            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-red-600 uppercase">
              INTERAKTIF & TRANSPARAN
            </span>
            <span className="w-8 h-[2px] bg-red-600"></span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight mb-3">
            Rencana Servis & Diagnosa Cepat
          </h2>

          <p className="text-sm sm:text-base text-slate-600">
            Pilih spesifikasi kendaraan dan paket servis yang Anda butuhkan, atau deteksi gejala kendala mobil sebelum mekanik meluncur ke lokasi di Purwokerto.
          </p>

          {/* Tab Switcher */}
          <div className="mt-8 inline-flex p-1.5 rounded-xl bg-slate-200 border border-slate-300/60 shadow-xs">
            <button
              onClick={() => setActiveTab('estimator')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'estimator'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-700 hover:text-red-600'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span>Pilihan Paket Servis</span>
            </button>

            <button
              onClick={() => setActiveTab('diagnostic')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'diagnostic'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-700 hover:text-red-600'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Diagnosa Gejala Kendala</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Interactive Service Package Selector */}
        {activeTab === 'estimator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Controls */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Settings2 className="w-5 h-5 text-red-600" />
                <span>Pilih Spesifikasi Mobil & Kebutuhan Servis</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    Merk Kendaraan
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    {CAR_BRANDS.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Car Segment */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    Tipe / Segmen Mobil
                  </label>
                  <select
                    value={carType}
                    onChange={(e) => setCarType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="City Car / Hatchback (Brio, Yaris, Jazz, Agya, Sirion)">City Car / Hatchback</option>
                    <option value="MPV / SUV (Avanza, Innova, Rush, Fortuner, Xpander)">MPV / SUV Keluarga</option>
                    <option value="Sedan / Luxury (Civic, Camry, Accord, BMW, Mercy)">Sedan / Premium</option>
                    <option value="Commercial / Pickup / Box">Niaga / Pick-Up / Box</option>
                  </select>
                </div>
              </div>

              {/* Service Package Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Pilih Layanan Utama
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'ganti-oli', label: 'Ganti Oli + Filter' },
                    { id: 'tune-up', label: 'Tune Up & Gurah' },
                    { id: 'emergency-jumper', label: 'Emergency Jumper' },
                    { id: 'service-rem', label: 'Servis Rem 4 Roda' },
                    { id: 'scan-ecu', label: 'Diagnosa Elektrikal' },
                  ].map(pkg => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setServicePackage(pkg.id)}
                      className={`p-3 rounded-lg text-xs font-bold border text-left transition-all ${
                        servicePackage === pkg.id
                          ? 'bg-red-50 border-red-500 text-red-600 ring-2 ring-red-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-red-300'
                      }`}
                    >
                      {pkg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Oil Option if Ganti Oli */}
              {servicePackage === 'ganti-oli' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    Pilihan Paket Oli Mesin (4 Liter)
                  </label>
                  <select
                    value={selectedOilType}
                    onChange={(e) => setSelectedOilType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="Shell Helix HX6 10W-40 (Semi Synthetic)">Shell Helix HX6 10W-40 (Semi Synthetic)</option>
                    <option value="Pertamina Fastron Gold 5W-30 (Full Synthetic)">Pertamina Fastron Gold 5W-30 (Full Synthetic)</option>
                    <option value="Castrol Magnatec Stop-Start 5W-30">Castrol Magnatec Stop-Start 5W-30</option>
                    <option value="Motul H-Tech 100 Plus 5W-30 (Premium Full Synthetic)">Motul H-Tech 100 Plus 5W-30 (Premium Full Synthetic)</option>
                  </select>
                </div>
              )}

              {/* Emergency Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Butuh Penanganan Darurat Sekarang? (Mogok di Jalan / Tol)
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Prioritas armada emergency siap meluncur dalam &lt;30 menit di Purwokerto
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>

            {/* Right Side: Service Plan Specification Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-red-50/50 via-white to-slate-50 text-slate-900 p-6 sm:p-8 rounded-2xl border border-red-100 shadow-xl space-y-6">
              <div className="border-b border-slate-200/80 pb-4">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600 bg-red-100/80 px-2.5 py-1 rounded border border-red-200">
                  Spesifikasi & Rencana Servis
                </span>
                <h4 className="text-xl font-bold mt-2 text-slate-900">Ringkasan Layanan</h4>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                  <span className="text-slate-500">Kendaraan:</span>
                  <span className="font-semibold text-slate-900">{selectedBrand}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                  <span className="text-slate-500">Tipe Servis:</span>
                  <span className="font-semibold text-slate-900 uppercase">{currentPackage.title}</span>
                </div>
                {servicePackage === 'ganti-oli' && (
                  <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                    <span className="text-slate-500">Pilihan Oli:</span>
                    <span className="font-semibold text-slate-900">{selectedOilType}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                  <span className="text-slate-500">Mode Kunjungan:</span>
                  <span className="font-semibold text-emerald-600">{isEmergency ? 'Emergency Siaga (<30 Mnt)' : 'Home Visit di Garasi'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                  <span className="text-slate-500">Pemeriksaan 20 Titik:</span>
                  <span className="font-bold text-emerald-600">GRATIS GENERAL CHECK-UP</span>
                </div>
              </div>

              {/* Specification Box */}
              <div className="p-4 rounded-xl bg-white border border-red-200/80 text-left shadow-xs space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Fasilitas Termasuk:</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentPackage.desc}
                </p>
                <div className="space-y-1.5 pt-1">
                  {currentPackage.inclusions.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book Button */}
              <div className="space-y-2.5">
                <button
                  id="book-from-calc-btn"
                  onClick={handleBookFromEstimator}
                  className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Konsultasi & Pesan via WhatsApp</span>
                </button>

                <p className="text-[11px] text-slate-500 text-center">
                  *Rincian pengerjaan & suku cadang diinfokan transparan sebelum servis. Garansi resmi 14 - 30 hari.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Interactive Problem Diagnosis Tool */}
        {activeTab === 'diagnostic' && (
          <div id="diagnosa" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Symptom Selector List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-bold uppercase text-slate-500 px-1">
                Pilih Gejala yang Sedang Dialami Mobil Anda:
              </div>

              {DIAGNOSTIC_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedDiagnostic(item)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    selectedDiagnostic.id === item.id
                      ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20'
                      : 'bg-white border-slate-200 text-slate-900 hover:border-red-400'
                  }`}
                >
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    selectedDiagnostic.id === item.id ? 'text-white' : 'text-red-500'
                  }`} />
                  <div>
                    <div className="text-xs sm:text-sm font-bold leading-snug">
                      {item.symptom}
                    </div>
                    <div className={`text-[11px] mt-1 font-medium ${
                      selectedDiagnostic.id === item.id ? 'text-red-100' : 'text-slate-500'
                    }`}>
                      Kategori: {item.category}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Right: Diagnosis Result & Advice */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded border border-red-200">
                    Hasil Diagnosa Mekanik
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {selectedDiagnostic.symptom}
                  </h3>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  selectedDiagnostic.urgency.includes('Tinggi') 
                    ? 'bg-red-100 text-red-600 border border-red-300'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  Tingkat Urgensi: {selectedDiagnostic.urgency}
                </span>
              </div>

              {/* Causes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Kemungkinan Penyebab Utama:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDiagnostic.possibleCauses.map((cause, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
                      <span>{cause}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Immediate Driver Action */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-1">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Tindakan Darurat Pengemudi Sebelum Mekanik Tiba:</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {selectedDiagnostic.immediateAction}
                </p>
              </div>

              {/* Recommended Service */}
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold text-red-600 uppercase">
                    Rekomendasi Layanan Panggilan:
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {selectedDiagnostic.recommendedService}
                  </div>
                </div>

                <button
                  onClick={handleBookFromDiagnostic}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/20"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Panggil Mekanik untuk Kasus Ini</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}

