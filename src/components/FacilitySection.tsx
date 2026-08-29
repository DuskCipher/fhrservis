import { useState } from 'react';
import { Check, ShieldAlert, Wrench, Clock, ShieldCheck } from 'lucide-react';
import { EMERGENCY_HOTLINE, WHATSAPP_PHONE } from '../data/mockData';

export function FacilitySection() {
  const [imgError, setImgError] = useState(false);

  const facilityPoints = [
    {
      title: 'HOME SERVICE DI GARASI RUMAH & KANTOR',
      desc: 'Mekanik ahli dan tersertifikasi datang langsung ke lokasi Anda lengkap dengan peralatan standar bengkel resmi. Hemat waktu tanpa perlu mengantri berjam-jam di bengkel.'
    },
    {
      title: 'BENGKEL PANGGILAN SIAGA 24 JAM (EMERGENCY)',
      desc: 'Respon cepat ke lokasi darurat jalan raya & jalan tol. Siaga 24 jam menangani mobil mogok, jumper aki tekor, ganti ban cadangan, overheat, hingga perbaikan kelistrikan di tempat.'
    },
    {
      title: 'PERALATAN BENGKEL LENGKAP & STANDAR OEM',
      desc: 'Dilengkapi special service tools (SST) presisi tinggi, alat hidrolik modern, dan jaminan suku cadang asli OEM 100% bergaransi.'
    }
  ];

  return (
    <section id="fasilitas" className="py-16 sm:py-24 bg-white relative overflow-hidden border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-[2px] bg-red-600"></span>
            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-red-600 uppercase">
              STANDAR LAYANAN PROFESIONAL
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 uppercase tracking-tight">
            BENGKEL HOME SERVICE & PANGGILAN 24 JAM
          </h2>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Image with Red Bracket Accents */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg">
              
              {/* Top-Left Red Bracket Line */}
              <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-12 sm:w-16 h-12 sm:h-16 border-t-3 sm:border-t-4 border-l-3 sm:border-l-4 border-red-600 pointer-events-none z-20"></div>

              {/* Bottom-Right Red Bracket Line */}
              <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-12 sm:w-16 h-12 sm:h-16 border-b-3 sm:border-b-4 border-r-3 sm:border-r-4 border-red-600 pointer-events-none z-20"></div>

              {/* Main Photo Frame Container */}
              <div className="relative overflow-hidden bg-slate-900 rounded-none border border-slate-200 shadow-md group">
                {!imgError ? (
                  <img
                    src="https://i.ibb.co.com/zVqWQ1Q4/Gemini-Generated-Image-izqby4izqby4izqb.jpg"
                    alt="Bengkel Home Service & Panggilan 24 Jam FHRCAR Auto Services"
                    className="w-full h-[340px] sm:h-[420px] object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-[340px] sm:h-[420px] bg-slate-900 p-8 flex flex-col justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black tracking-wider uppercase">FHRCAR Auto Services</div>
                        <div className="text-xs text-red-400 font-bold">Layanan Siaga 24 Jam Non-Stop</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Mekanik Tiba &lt; 30 Menit</span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black">Bengkel Home Service & Panggilan 24 Jam</h4>
                      <p className="text-xs text-slate-300">
                        Solusi terbaik perawatan mobil di rumah atau bantuan darurat mogok di perjalanan.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Hotline: <strong>{EMERGENCY_HOTLINE}</strong></span>
                      <span className="text-emerald-400 font-bold">WhatsApp: +{WHATSAPP_PHONE}</span>
                    </div>
                  </div>
                )}

                {/* Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-sm p-3.5 border border-slate-700/80 text-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-red-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wide">100% Garansi Servis</div>
                      <div className="text-[11px] text-slate-300">Pengerjaan Bersih & Suku Cadang Original</div>
                    </div>
                  </div>
                  <a
                    href={`tel:${EMERGENCY_HOTLINE.replace(/[^0-9]/g, '')}`}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>SOS 24H</span>
                  </a>
                </div>

              </div>

            </div>
          </div>

          {/* Right Column: Facility Bullet Points */}
          <div className="lg:col-span-6 space-y-7 sm:space-y-8">
            {facilityPoints.map((point) => (
              <div key={point.title} className="flex items-start gap-4 sm:gap-5">
                
                {/* Red Square Checkbox Icon Node */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-red-600 flex items-center justify-center flex-shrink-0 mt-0.5 bg-white text-red-600 shadow-sm">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                </div>

                {/* Point Content */}
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                    {point.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {point.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* Bottom Gray Divider Line */}
            <div className="w-full h-px bg-slate-200 pt-0"></div>
          </div>

        </div>

      </div>
    </section>
  );
}
