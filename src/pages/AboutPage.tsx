import { 
  ShieldCheck, 
  Award, 
  Wrench, 
  Users, 
  Target, 
  Compass, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare,
  Clock,
  Car
} from 'lucide-react';
import { WHATSAPP_PHONE, EMERGENCY_HOTLINE, EMAIL_ADDRESS } from '../data/mockData';

interface AboutPageProps {
  onOpenBooking: () => void;
}

export function AboutPage({ onOpenBooking }: AboutPageProps) {
  const pillars = [
    {
      icon: <Award className="w-6 h-6 text-red-600" />,
      title: 'Master Mekanik Bersertifikat',
      desc: 'Seluruh teknisi kami telah melewati standarisasi uji kompetensi otomotif modern dengan pengalaman menangani mobil Jepang, Eropa, dan Amerika.'
    },
    {
      icon: <Wrench className="w-6 h-6 text-red-600" />,
      title: 'Peralatan Canggih & Modern',
      desc: 'Dilengkapi special service tools standar pabrikan, flushing machine, serta alat penampung oli ramah lingkungan.'
    },
    {
      icon: <Clock className="w-6 h-6 text-red-600" />,
      title: 'Siaga 24 Jam & Transparan',
      desc: 'Respon cepat ke lokasi darurat di jalan dan estimasi biaya transparan di awal tanpa ada biaya siluman atau tak terduga.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-red-600" />,
      title: 'Garansi Servis Resmi',
      desc: 'Memberikan jaminan garansi pengerjaan dan kepuasan pelanggan pada setiap layanan perawatan dan perbaikan kendaraan Anda.'
    }
  ];

  const milestones = [
    { 
      year: '2026', 
      title: 'Awal Berdiri & Pelayanan', 
      desc: 'Hadir melayani masyarakat Purwokerto & sekitarnya dengan layanan home service mekanik panggilan ke rumah dan bantuan darurat jalanan 24 jam.' 
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-extrabold uppercase tracking-wider rounded-full">
            Profil Perusahaan
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Tentang <span className="text-red-600">FHRCAR Auto Services</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Menghadirkan kenyamanan, kepraktisan, dan standar mutu bengkel resmi langsung ke depan pintu rumah Anda serta pertolongan darurat 24 jam di jalan.
          </p>
        </div>

        {/* Story / About Us Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Dedikasi & Integritas</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Solusi Cerdas Perawatan Mobil Modern Tanpa Repot
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              FHRCAR Auto Services lahir dari kebutuhan pemilik kendaraan di era mobilitas tinggi yang seringkali kesulitan meluangkan waktu berjam-jam untuk mengantri di bengkel konvensional, serta kekhawatiran saat mengalami mobil mogok di jalan raya.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Kami mentransformasikan pengalaman servis mobil menjadi lebih menyenangkan, transparan, dan efisien. Dengan armada servis bergerak yang dilengkapi peralatan komplit berstandar pabrikan (OEM), mekanik ahli kami siap meluncur ke alamat Anda kapan pun dibutuhkan.
            </p>
            
            <div className="pt-2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Legalitas & Sertifikasi Resmi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Garansi Pengerjaan Nyata</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80"
                alt="Bengkel FHRCAR Master Mekanik"
                className="w-full h-80 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-6 text-white">
                <div>
                  <h4 className="font-bold text-base">Standar Bengkel Modern</h4>
                  <p className="text-xs text-slate-300">Pengerjaan presisi, bersih, dan berorientasi kepuasan pelanggan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Visi Kami</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Menjadi jaringan penyedia layanan bengkel panggilan, home service, dan bantuan darurat otomotif nomor satu di Indonesia yang paling dipercaya karena kejujuran, kecepatan, dan kualitas pengerjaan setara pabrikan resmi.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Misi Kami</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>Memberikan rasa aman bagi pengendara dengan kesiagaan tanggap darurat 24 jam non-stop di mana pun berada.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>Menerapkan transparansi penuh terhadap rincian biaya, diagnosa kondisi kendaraan, dan suku cadang yang digunakan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>Terus meningkatkan keahlian teknisi sesuai dengan perkembangan teknologi mobil listrik, hybrid, dan sistem injeksi terkini.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">4 Pilar Keunggulan Utama</h3>
            <p className="text-xs sm:text-sm text-slate-600">Prinsip dasar yang selalu kami jaga dalam setiap pengerjaan unit kendaraan Anda</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-red-300 transition-all">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
                  {p.icon}
                </div>
                <h4 className="text-base font-bold text-slate-900">{p.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones / Journey */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-extrabold uppercase tracking-wider rounded-full">
              Perjalanan Kami
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Jejak Langkah & Dedikasi</h3>
          </div>

          <div className="max-w-xl mx-auto pt-2">
            {milestones.map((m, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-gradient-to-r from-red-50/70 via-slate-50 to-white border border-red-100 shadow-xs text-center space-y-2">
                <div className="inline-block px-3 py-1 bg-red-600 text-white font-black text-lg rounded-full shadow-sm shadow-red-600/30">
                  {m.year}
                </div>
                <h4 className="font-black text-base text-slate-900">{m.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Workshop Info Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Pusat Layanan & Kontak</span>
            <h3 className="text-2xl sm:text-3xl font-black">Hubungi Kami Kapan Saja</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tim Customer Support dan Mekanik Siaga kami aktif 24 jam non-stop melayani konsultasi masalah mobil, reservasi jadwal servis di rumah, hingga panggilan darurat.
            </p>

            <div className="space-y-3 pt-2 text-xs sm:text-sm">
              <div className="flex items-center gap-3 text-slate-200">
                <div className="w-8 h-8 rounded-lg bg-red-600/30 text-red-400 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Hotline Emergency 24 Jam:</span>
                  <a href={`tel:${EMERGENCY_HOTLINE.replace(/[^0-9]/g, '')}`} className="font-bold hover:text-red-400 transition-colors">
                    {EMERGENCY_HOTLINE}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Chat WhatsApp Konsultasi:</span>
                  <a href={`https://wa.me/${WHATSAPP_PHONE}`} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-emerald-400 transition-colors">
                    +{WHATSAPP_PHONE} (Admin Fast Response)
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-200">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email Resmi:</span>
                  <a href={`mailto:${EMAIL_ADDRESS}`} className="font-bold hover:text-blue-400 transition-colors">
                    {EMAIL_ADDRESS}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4 text-center">
            <h4 className="font-bold text-base text-white">Butuh Jadwal Servis Mobil?</h4>
            <p className="text-xs text-slate-300">
              Pilih waktu yang cocok untuk Anda, mekanik kami yang akan datang langsung ke alamat Anda.
            </p>
            <button
              onClick={onOpenBooking}
              className="w-full py-3.5 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30"
            >
              Booking Home Service Sekarang
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
