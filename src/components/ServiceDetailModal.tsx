import { X, CheckCircle2, Clock, ShieldCheck, Tag, MessageSquare } from 'lucide-react';
import { ServiceItem } from '../types';
import { WHATSAPP_PHONE } from '../data/mockData';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onOpenBooking: (serviceTitle: string) => void;
}

export function ServiceDetailModal({ service, onClose, onOpenBooking }: ServiceDetailModalProps) {
  if (!service) return null;

  const handleOrderWhatsapp = () => {
    const text = `Halo Admin FHRCAR Auto Services, saya tertarik untuk memesan layanan *${service.number}. ${service.title}* (${service.startingPrice}). Mohon info jadwal ketersediaan mekanik ke lokasi saya.`;
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-8 animate-fadeIn">
        
        {/* Top Header */}
        <div className="bg-red-50 text-slate-900 p-6 relative border-b border-red-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-red-600 font-mono">
                {service.number}
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 bg-red-100/80 px-2 py-0.5 rounded border border-red-200">
                  LAYANAN RESMI FHRCAR
                </span>
                <h3 className="text-xl font-bold text-slate-950 mt-1">
                  {service.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Main Description */}
          <p className="text-sm text-slate-700 leading-relaxed">
            {service.fullDesc}
          </p>

          {/* Pricing & Time Info Box */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Tag className="w-3 h-3 text-red-600" />
                <span>Info & Paket Layanan</span>
              </div>
              <div className="text-sm sm:text-base font-black text-red-600 mt-0.5">
                {service.startingPrice}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Estimasi Durasi Kerja</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                {service.estimatedTime}
              </div>
            </div>
          </div>

          {/* Included Tasks */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Item Pekerjaan Termasuk:
            </h4>
            <div className="space-y-2">
              {service.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warranty Badge */}
          <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 text-slate-800 text-xs flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <span className="font-bold text-red-700">Garansi Layanan: </span>
              <span>Garansi resmi pengerjaan 14 - 30 hari & jaminan suku cadang original.</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenBooking(service.title);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Isi Form Booking
          </button>

          <button
            onClick={handleOrderWhatsapp}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/30 transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Pesan via WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
}
