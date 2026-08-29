import { MessageSquare, ArrowRight, ShieldCheck, Clock, CheckCircle2, Star } from 'lucide-react';
import { WHATSAPP_PHONE } from '../data/mockData';

interface HeroProps {
  onOpenBooking: () => void;
  onSelectServiceTab: () => void;
}

export function Hero({ onOpenBooking }: HeroProps) {
  return (
    <section id="beranda" className="relative overflow-hidden pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-14 lg:pb-24 bg-white">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 right-0 -z-10 w-full lg:w-3/5 h-full opacity-35 pointer-events-none">
        <div className="absolute -top-32 right-0 w-[300px] sm:w-[550px] h-[300px] sm:h-[550px] bg-gradient-to-bl from-red-500/20 via-rose-500/10 to-transparent rounded-full blur-3xl transform rotate-12"></div>
        <div className="absolute bottom-0 right-10 sm:right-20 w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] bg-red-600/10 rounded-full blur-2xl"></div>
      </div>

      {/* Diagonal Accent Strip from mockup */}
      <div className="hidden lg:block absolute -right-24 top-1/4 w-[480px] h-[650px] bg-gradient-to-bl from-red-600/10 via-rose-500/5 to-transparent transform rotate-12 rounded-3xl -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Text Content */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
            
            {/* Top Eyebrow Tag */}
            <div className="inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-[11px] sm:text-xs md:text-sm font-extrabold tracking-wider sm:tracking-widest text-red-600 uppercase">
                HOME SERVICE & BENGKEL PANGGILAN 24 JAM
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black tracking-tight text-slate-950 leading-[1.12] sm:leading-[1.08]">
                BENGKEL <br />
                HOME SERVICE <br />
                <span className="text-red-600">& PANGGILAN 24 JAM</span>
              </h1>
              
              {/* Hollow / Outline typography */}
              <div 
                className="text-xl sm:text-3xl xl:text-5xl font-black tracking-wide uppercase font-mono select-none"
                style={{
                  WebkitTextStroke: '1.5px #0f172a',
                  color: 'transparent',
                  lineHeight: '1.15'
                }}
              >
                FHRCAR AUTO SERVICES
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
              Mekanik profesional berpengalaman datang langsung ke lokasi Anda (Rumah, Kantor, Parkiran, Jalan Raya, maupun Tol). Bebas antri di bengkel — solusi cepat ganti oli, tune up, servis rem, perbaikan kelistrikan, hingga bantuan darurat 24 jam.
            </p>

            {/* Highlighted Red Notification Box */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm font-semibold shadow-xs">
              <span>
                <strong>Solusi Servis Mobil Tanpa Repot ke Bengkel</strong> — Mekanik bawa tools lengkap & sparepart OEM resmi ke garasi Anda dalam waktu &lt;30 menit untuk panggilan darurat.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-1 sm:pt-2">
              <a
                id="hero-whatsapp-cta"
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Halo%20Admin%20FHRCAR%20Auto%20Services,%20saya%20mau%20order%20Home%20Service%20/%20Mekanik%20Panggilan%20ke%20lokasi%20saya`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl sm:rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-600/25 transition-all duration-200"
              >
                <span>Panggil Mekanik (WhatsApp)</span>
                <MessageSquare className="w-4 h-4 fill-white" />
              </a>

              <a
                id="hero-services-cta"
                href="#layanan"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl sm:rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-200 shadow-xs transition-all duration-200"
              >
                <span>Lihat Layanan Home Service</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>

              <button
                id="hero-booking-modal-cta"
                onClick={onOpenBooking}
                className="hidden md:inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 font-bold text-sm border border-slate-200 transition-all"
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Jadwalkan di Rumah</span>
              </button>
            </div>

            {/* Bottom 3 Metrics */}
            <div className="pt-4 sm:pt-6 border-t border-slate-200 grid grid-cols-3 gap-2 sm:gap-6 text-center sm:text-left">
              <div className="p-1 sm:p-0">
                <div className="text-xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  100+
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Mobil Ditangani
                </div>
              </div>

              <div className="p-1 sm:p-0">
                <div className="text-xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  5
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Jenis Layanan
                </div>
              </div>

              <div className="p-1 sm:p-0">
                <div className="text-xl sm:text-3xl font-black text-red-600 tracking-tight flex items-center justify-center sm:justify-start gap-1">
                  24 Jam
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Emergency Siaga
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end mt-2 sm:mt-0">
            <div className="relative w-full max-w-md lg:max-w-none">
              
              {/* Stylized Red Badge */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-red-600 text-white text-[10px] sm:text-[11px] font-black tracking-wider uppercase px-2.5 py-1 rounded shadow-md">
                FHRCAR SERVICE
              </div>

              {/* Main Visual Card */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-200/80 p-1.5 sm:p-2 shadow-xl">
                
                {/* Mechanic Team & Service Image */}
                <div className="relative h-[290px] xs:h-[340px] sm:h-[480px] rounded-xl sm:rounded-2xl overflow-hidden group">
                  <img
                    src="https://i.ibb.co.com/5xFhbvNq/34dcf4d9-b420-431e-a394-48b0773371b2.jpg"
                    alt="Mekanik Profesional FHRCAR Auto Services Siaga 24 Jam"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                  
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>

                  {/* Floating Mechanic Badge Inside */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-white/40 shadow-lg">
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-xs sm:text-sm shrink-0">
                          FHR
                        </div>
                        <div className="text-left">
                          <div className="text-[11px] sm:text-xs font-bold text-slate-900 flex items-center gap-1">
                            <span>Mekanik Bersertifikat</span>
                            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-500">
                            Pengalaman 10+ Thn • Standar OEM
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-1 text-amber-500 font-bold text-[11px] sm:text-xs">
                          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                          <span>4.9/5</span>
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-slate-500">2.4k+ Ulasan</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Floating Emergency Badge / Pill */}
              <div className="absolute -bottom-3 left-2 sm:-bottom-5 sm:-left-6 bg-white text-slate-900 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 flex items-center gap-2.5 sm:gap-3 z-30">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-left pr-1">
                  <div className="text-[11px] sm:text-xs font-black text-slate-900">Garansi Pengerjaan</div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium">Jaminan Part Asli</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
