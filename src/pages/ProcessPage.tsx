import { useState } from 'react';
import { ORDER_STEPS, WHATSAPP_PHONE } from '../data/mockData';
import { 
  PhoneCall, 
  MessageSquare, 
  MapPin, 
  Calculator, 
  Wrench, 
  CheckCircle2, 
  ShieldCheck, 
  Receipt, 
  ArrowRight,
  Shield,
  Sparkles as _Sparkles,
  Award,
  Zap,
  Check,
  X
} from 'lucide-react';

interface ProcessPageProps {
  onOpenBooking: () => void;
}

export function ProcessPage({ onOpenBooking }: ProcessPageProps) {
  const [activeStepTab, setActiveStepTab] = useState<number>(0);

  const stepIcons = [
    <MessageSquare className="w-5 h-5" />,
    <Calculator className="w-5 h-5" />,
    <MapPin className="w-5 h-5" />,
    <Wrench className="w-5 h-5" />,
    <Receipt className="w-5 h-5" />
  ];

  const comparisons = [
    {
      feature: 'Waktu & Tenaga',
      fhrcar: 'Mekanik datang ke rumah Anda, tidak perlu buang waktu macet & antri di bengkel',
      traditional: 'Harus meluangkan waktu antri 3-5 jam di bengkel'
    },
    {
      feature: 'Transparansi Pengerjaan',
      fhrcar: 'Bisa dilihat langsung di garasi rumah, part bekas ditunjukkan secara terbuka',
      traditional: 'Mobil ditinggal di ruang tunggu, sulit memantau proses perbaikan'
    },
    {
      feature: 'Transparansi Biaya',
      fhrcar: 'Estimasi harga disepakati di awal tanpa markup terselubung',
      traditional: 'Seringkali ada pembengkakan biaya tambahan di akhir nota'
    },
    {
      feature: 'Kesiapan Darurat 24 Jam',
      fhrcar: 'Tim siaga dispatch 24 jam non-stop tiba dalam <30 menit',
      traditional: 'Hanya buka pada jam kerja normal (08.00 - 17.00)'
    },
    {
      feature: 'Pemeriksaan Keselamatan',
      fhrcar: 'Gratis 20-Point General Check-Up di setiap kunjungan',
      traditional: 'Pengecekan tambahan biasanya dikenakan biaya jasa diagnosa'
    },
    {
      feature: 'Garansi Pengerjaan',
      fhrcar: 'Garansi resmi digital hingga 90 hari dengan sistem invoice otomatis',
      traditional: 'Klaim garansi seringkali rumit dan harus datang ulang'
    }
  ];

  const sopChecklist = [
    'Pemasangan Fender Cover & Steering Cover pelindung bodi mobil',
    'Penggunaan Alas Karpet / Drip Tray kedap minyak agar lantai garasi tetap bersih',
    'Penggunaan Special Service Tools (SST) standar pabrikan',
    'Pembuangan oli bekas ke jeriken penampung limbah B3 khusus yang ramah lingkungan',
    'Test Drive & Uji Jalan bersama customer sebelum tanda tangan serah terima'
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-extrabold uppercase tracking-wider rounded-full">
            Cara Kerja & Standar Layanan
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Alur Proses Servis <span className="text-red-600">Mudah & Nyaman</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Hanya butuh 5 langkah sederhana dari konsultasi hingga mobil Anda kembali prima di garasi rumah dengan garansi resmi.
          </p>
        </div>

        {/* 5-Step Process Timeline Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          {/* Step Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-slate-100 pb-4">
            {ORDER_STEPS.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStepTab(idx)}
                className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 ${
                  activeStepTab === idx
                    ? 'bg-red-50 border-2 border-red-600 text-red-900 shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeStepTab === idx ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {step.number}
                </div>
                <div className="hidden sm:block">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Langkah {idx + 1}</div>
                  <div className="text-xs font-bold truncate max-w-[100px]">{step.title.split(':')[1] || step.title}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Active Step Deep Dive Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold">
                  Step {ORDER_STEPS[activeStepTab].number}
                </span>
                <span className="text-xs text-slate-500 font-semibold">Prosedur Standar Operasional</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                {ORDER_STEPS[activeStepTab].title}
              </h3>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                {ORDER_STEPS[activeStepTab].description}
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-600 space-y-2">
                <strong className="text-slate-900 block font-bold">Detail Pelaksanaan:</strong>
                <p>{ORDER_STEPS[activeStepTab].details}</p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={onOpenBooking}
                  className="px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-red-600/30 flex items-center gap-2"
                >
                  <span>Mulai Booking Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=Halo%20Admin%20FHRCAR,%20saya%20ingin%20tanya%20prosedur%20servis`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tanya Admin WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Visual Step Illustration Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Garansi Transparansi</span>
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
                    {stepIcons[activeStepTab]}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Standar Mutu FHRCAR</h4>
                    <p className="text-xs text-slate-300">Pengerjaan terstandarisasi ISO bengkel modern</p>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Estimasi Waktu Tiba:</span>
                    <strong className="text-white">&lt; 30 Menit (Emergency)</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Biaya Tambahan Transport:</span>
                    <strong className="text-emerald-400">Rp 0 (Radius Standar)</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Keahlian Mekanik:</span>
                    <strong className="text-white">Master Bersertifikat</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 text-center">
                Mekanik kami mematuhi protokol keselamatan dan perlindungan lantai garasi rumah Anda.
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Complete Cards View */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">5 Langkah Lengkap</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Rincian terstruktur dari awal hingga mobil selesai diservis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {ORDER_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-red-300 transition-all flex flex-col justify-between space-y-4 group hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-red-600">{step.number}</span>
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                      {stepIcons[idx]}
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                    {step.title.split(':')[1] || step.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                    {step.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  {step.details}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table Section: FHRCAR vs Bengkel Konvensional */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider rounded-full">
              Perbandingan Cerdas
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Mengapa Memilih Home Service FHRCAR?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Bandingkan kenyamanan servis di garasi rumah Anda dengan repotnya ke bengkel tradisional.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Fitur & Layanan</th>
                  <th className="py-4 px-4 text-xs font-extrabold text-red-600 uppercase tracking-wider w-3/8 bg-red-50/70 rounded-t-xl">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span>FHRCAR Auto Services</span>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-3/8">Bengkel Konvensional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {comparisons.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{item.feature}</td>
                    <td className="py-4 px-4 bg-red-50/30 text-slate-800 font-medium">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item.fhrcar}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span>{item.traditional}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SOP Kebersihan & Garasi Checklist */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-red-500 text-xs font-extrabold uppercase tracking-wider">Garasi Tetap Bersih & Aman</span>
              <h3 className="text-2xl sm:text-3xl font-black mt-1">Standar Kebersihan Home Service</h3>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-8 h-8 text-amber-400" />
              <div className="text-xs text-slate-300">
                <strong className="text-white block font-bold">100% Clean Garage Guarantee</strong>
                Bebas ceceran oli & kotoran
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sopChecklist.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Booking CTA */}
        <div className="text-center bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Siap Menikmati Servis Praktis di Rumah?</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Pesan slot mekanik sekarang dan klaim gratis 20 titik pemeriksaan keselamatan mobil Anda.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenBooking}
              className="px-8 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-red-600/30"
            >
              Booking Home Service Sekarang
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=Halo%20Admin%20FHRCAR,%20saya%20ingin%20jadwalkan%20servis`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all"
            >
              Hubungi via WhatsApp
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
