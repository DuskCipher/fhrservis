import { useState } from 'react';
import { SERVICES_DATA, WHATSAPP_PHONE } from '../data/mockData';
import { ServiceItem } from '../types';
import { 
  ArrowRight, 
  MessageSquare, 
  AlarmClock, 
  Wrench, 
  Droplet, 
  Cpu, 
  Car, 
  Thermometer, 
  Settings, 
  Paintbrush, 
  Globe, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  HelpCircle,
  PhoneCall
} from 'lucide-react';

interface ServicesPageProps {
  onSelectService: (service: ServiceItem) => void;
  onOpenBooking: (serviceName?: string, notes?: string) => void;
}

export function ServicesPage({ onSelectService, onOpenBooking }: ServicesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'AlarmClock': return <AlarmClock className="w-5 h-5" />;
      case 'Wrench': return <Wrench className="w-5 h-5" />;
      case 'Droplet': return <Droplet className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Car': return <Car className="w-5 h-5" />;
      case 'Thermometer': return <Thermometer className="w-5 h-5" />;
      case 'Settings': return <Settings className="w-5 h-5" />;
      case 'Paintbrush': return <Paintbrush className="w-5 h-5" />;
      case 'Globe': return <Globe className="w-5 h-5" />;
      default: return <Wrench className="w-5 h-5" />;
    }
  };

  const categories = [
    { id: 'all', label: 'Semua Layanan' },
    { id: 'emergency', label: 'Darurat 24 Jam' },
    { id: 'mesin', label: 'Tune Up & Mesin' },
    { id: 'oli', label: 'Ganti Oli' },
    { id: 'kaki', label: 'Rem & Kaki-kaki' },
    { id: 'scanner', label: 'Kelistrikan & ECU' },
  ];

  const filteredServices = SERVICES_DATA.filter((srv) => {
    const matchesSearch = srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          srv.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          srv.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'emergency') return srv.id === 'emergency-24h';
    if (selectedCategory === 'mesin') return srv.id === 'service-mesin';
    if (selectedCategory === 'oli') return srv.id === 'ganti-oli';
    if (selectedCategory === 'kaki') return srv.id === 'rem-kaki-kaki';
    if (selectedCategory === 'scanner') return srv.id === 'scanning-ecu';
    return true;
  });

  const faqs = [
    {
      q: 'Apakah pengerjaan home service ada biaya tambahan transport?',
      a: 'Untuk area radius jangkauan kami di seluruh wilayah Purwokerto dan sekitarnya (Banyumas Raya), biaya kunjungan sudah termasuk dalam paket layanan servis atau gratis biaya transport pada promo tertentu. Kami mengedepankan transparansi harga di awal tanpa biaya tersembunyi.'
    },
    {
      q: 'Bagaimana dengan garansi setelah pengerjaan di rumah selesai?',
      a: 'Seluruh pengerjaan home service dan pergantian suku cadang mendapatkan Garansi Resmi FHRCAR hingga 30-90 hari (tergantung jenis pengerjaan & part). Invoice resmi digital akan dikirimkan langsung ke WhatsApp Anda.'
    },
    {
      q: 'Apakah sparepart yang digunakan asli OEM?',
      a: 'Ya, kami hanya menggunakan suku cadang original pabrikan (OEM) resmi dan oli original bersegel resmi dengan sertifikat keaslian. Kami juga siap menunjukkan kemasan segel asli sebelum dipasang di mobil Anda.'
    },
    {
      q: 'Bagaimana jika mobil membutuhkan penanganan berat yang tidak bisa di rumah?',
      a: 'Jika dari hasil diagnosa awal ditemukan kendala berat (misalnya turun mesin total/overhaul besar), armada towing kami siap mengevakuasi unit ke Workshop Utama FHRCAR dengan SOP pengawalan aman.'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-extrabold uppercase tracking-wider rounded-full">
            Katalog Layanan Komprehensif
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Layanan Servis & Home Service <span className="text-red-600">Terbaik</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Layanan otomotif spesialis terstandarisasi OEM dikerjakan langsung oleh Master Mekanik di garasi rumah, kantor, atau lokasi darurat di jalan.
          </p>
        </div>

        {/* Filter & Search Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Cari layanan (misal: AC, Oli, Rem)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-slate-50"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-red-300 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative group"
            >
              {service.popular && (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Layanan Favorit
                </div>
              )}

              <div className="space-y-4">
                {/* Header with Number & Icon */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-slate-300 group-hover:text-red-500 transition-colors">
                    {service.number}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    {getServiceIcon(service.iconName)}
                  </div>
                </div>

                {/* Title and Short Description */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {service.shortDesc}
                  </p>
                </div>

                {/* Price and Estimated Time Pill */}
                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    {service.startingPrice}
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{service.estimatedTime}</span>
                  </div>
                </div>

                {/* Key Features Checklist */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mencakup Pemeriksaan:</p>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {service.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSelectService(service)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <span>Detail</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onOpenBooking(service.title)}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition-all shadow-sm shadow-red-600/30 flex items-center justify-center gap-1"
                >
                  <span>Booking</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Standard Safety & Warranty Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-white">Garansi Pengerjaan Resmi</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Jaminan garansi kepuasan pengerjaan hingga 90 hari dan penggantian suku cadang asli OEM.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-white">Free 20 Titik General Check</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Setiap pemesanan layanan sudah termasuk cek menyeluruh rem, aki, cairan, ban & lampu tanpa biaya tambahan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-white">Penyelamat 24 Jam Non-Stop</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mekanik siaga dispatch ke lokasi Anda &lt; 30 menit saat terjadi kendala darurat di jalan maupun perumahan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs on Services */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Tanya Jawab Seputar Layanan</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Pertanyaan yang Sering Diajukan</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-start gap-2">
                  <span className="text-red-600 font-extrabold text-base">Q:</span>
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-red-600/20">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black">Butuh Konsultasi Servis Mobil Anda?</h3>
            <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
              Tim mekanik kami siap mendengarkan keluhan mobil Anda dan memberikan estimasi biaya transparan sebelum Anda memutuskan booking.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=Halo%20Admin%20FHRCAR,%20saya%20ingin%20konsultasi%20layanan%20servis`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white text-red-600 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Chat Konsultasi WhatsApp</span>
            </a>
            <button
              onClick={() => onOpenBooking()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-slate-900 text-white font-bold text-xs sm:text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <PhoneCall className="w-4 h-4 text-red-400" />
              <span>Booking Home Service</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
