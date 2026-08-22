import { useState } from 'react';
import { Phone, MessageSquare, ShieldAlert, X, Wrench, ChevronUp } from 'lucide-react';
import { WHATSAPP_PHONE, EMERGENCY_HOTLINE } from '../data/mockData';

interface FloatingEmergencyBarProps {
  onOpenBooking: () => void;
}

export function FloatingEmergencyBar({ onOpenBooking }: FloatingEmergencyBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3">
      
      {/* Expanded Quick Options Menu */}
      {isExpanded && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xl space-y-2.5 w-[calc(100vw-2rem)] max-w-xs animate-fadeIn text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <span className="text-xs font-black text-slate-900 uppercase">
                Bantuan Darurat 24 Jam
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
              aria-label="Tutup menu darurat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Mekanik terdekat siap meluncur ke alamat/titik GPS Anda dalam &lt; 30 menit.
          </p>

          <div className="flex flex-col gap-2 pt-1">
            {/* WhatsApp Quick SOS */}
            <a
              id="floating-wa-sos"
              href={`https://wa.me/${WHATSAPP_PHONE}?text=*EMERGENCY%20CALL%2024%20JAM%20FHRCAR*%0AMohon%20bantuan%20mekanik%20darurat%20sekarang.%20Mobil%20saya%20mogok%20di%20lokasi:`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Panggil via WhatsApp</span>
            </a>

            {/* Direct Phone Call */}
            <a
              id="floating-tel-sos"
              href={`tel:${EMERGENCY_HOTLINE.replace(/[^0-9]/g, '')}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Hotline: {EMERGENCY_HOTLINE}</span>
            </a>

            {/* Booking Form */}
            <button
              onClick={() => {
                setIsExpanded(false);
                onOpenBooking();
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 font-semibold text-xs transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-red-500" />
              <span>Buka Form Booking Servis</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Floating Buttons: Direct WhatsApp Chat + SOS Toggle */}
      <div className="flex items-center gap-2.5">
        {/* Direct WhatsApp Floating Button */}
        <a
          id="floating-direct-wa-btn"
          href={`https://wa.me/${WHATSAPP_PHONE}?text=Halo%20Admin%20FHRCAR,%20saya%20mau%20tanya%20layanan%20bengkel%20mobil`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-emerald-600/30 border-2 border-white/20 transition-all duration-300"
          aria-label="Chat WhatsApp Admin"
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
          <span className="hidden sm:inline font-bold">Chat WhatsApp</span>
        </a>

        {/* SOS Darurat Toggle Button */}
        <button
          id="floating-sos-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          className="group relative flex items-center gap-2 sm:gap-2.5 px-4 py-3 sm:py-3.5 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-2xl shadow-red-600/40 border-2 border-white/20 transition-all duration-300"
          aria-label="Tombol Emergency 24 Jam"
        >
          {/* Animated Glow Halo */}
          <span className="absolute -inset-1 rounded-full bg-red-500/40 animate-pulse pointer-events-none"></span>

          <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          <span className="font-bold">SOS Darurat 24 Jam</span>
          
          <ChevronUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

    </div>
  );
}
