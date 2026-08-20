import { MessageSquare } from 'lucide-react';
import { WHATSAPP_PHONE } from '../data/mockData';

interface BookingCtaBannerProps {
  onOpenBooking: () => void;
}

export function BookingCtaBanner({ onOpenBooking }: BookingCtaBannerProps) {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-white border-t-2 border-b border-red-600">
      
      {/* Diagonal hatched striped pattern background matching Image 5 */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #dc2626,
            #dc2626 2px,
            transparent 2px,
            transparent 14px
          )`
        }}
      ></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        
        {/* Top Tag matching Image 5 */}
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="w-6 h-[2px] bg-red-600"></span>
          <span className="text-xs font-extrabold tracking-widest text-red-600 uppercase">
            BOOKING SEKARANG
          </span>
          <span className="w-6 h-[2px] bg-red-600"></span>
        </div>

        {/* Big Bold Headline matching Image 5 */}
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight uppercase max-w-3xl mx-auto leading-tight mb-4">
          BOOKING SLOT UNTUK FREE GENERAL CHECK UP DI FHRCAR!
        </h2>

        {/* Subtitle text matching Image 5 */}
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Lakukan pengecekan kondisi mobil kesayangan Anda segera dengan menghubungi kami sekarang. Jangan tunggu kondisi mobil memburuk. Gratis hanya untuk 5 mobil setiap harinya!
        </p>

        {/* WhatsApp Admin Red Button matching Image 5 */}
        <div className="flex justify-center">
          <a
            id="cta-whatsapp-admin"
            href={`https://wa.me/${WHATSAPP_PHONE}?text=Halo%20Admin%20FHRCAR,%20saya%20mau%20booking%20slot%20Free%20General%20Check-Up%20/%20Servis%20Mobil`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-md bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm shadow-md shadow-red-600/30 transition-transform active:scale-95"
          >
            <span>WhatsApp Admin</span>
            <MessageSquare className="w-4 h-4 fill-white" />
          </a>
        </div>

        {/* Bottom subtext matching Image 5 */}
        <div className="mt-8 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
          GRATIS GENERAL CHECK UP • HANYA 5 SLOT SETIAP HARINYA
        </div>

      </div>
    </section>
  );
}
