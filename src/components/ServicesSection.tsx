import { SERVICES_DATA, WHATSAPP_PHONE } from '../data/mockData';
import { ServiceItem } from '../types';
import { 
  ArrowRight, 
  MessageSquare,
  AlarmClock,
  Wrench,
  Droplet,
  ShieldAlert,
  Fan,
  Disc,
  Cpu,
  Layers,
  Search,
  Settings
} from 'lucide-react';

import { LucideIcon } from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (service: ServiceItem) => void;
  onOpenBooking?: (serviceName?: string) => void;
}

const iconMap: Record<string, LucideIcon> = {
  AlarmClock,
  Wrench,
  Droplet,
  ShieldAlert,
  Fan,
  Disc,
  Cpu,
  Layers,
  Search,
};

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  return (
    <section id="layanan" className="py-16 sm:py-24 bg-white relative overflow-hidden border-t border-slate-200/80">
      
      {/* Subtle fine mesh background grid matching Reference Image 1 */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#dc2626 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header matching Image 1 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="space-y-2">
            {/* Top Red Eyebrow */}
            <div className="inline-flex items-center gap-2">
              <span className="w-8 h-[2px] bg-red-600"></span>
              <span className="text-xs sm:text-sm font-extrabold tracking-widest text-red-600 uppercase">
                LAYANAN
              </span>
            </div>

            {/* Main Section Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight uppercase max-w-2xl leading-[1.1]">
              BENGKEL HOME SERVICE & PANGGILAN 24 JAM
            </h2>
          </div>

          {/* Right Subtext Description */}
          <div className="md:max-w-xs space-y-2">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Layanan spesialis terstandarisasi yang dapat dipesan langsung ke rumah atau panggilan darurat di jalan.
            </p>
            <div className="inline-flex items-center text-xs font-bold text-red-600">
              <span>Garansi Pengerjaan & Part Asli OEM</span>
            </div>
          </div>
        </div>

        {/* 9 Services Grid (01 - 09) matching Image 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {SERVICES_DATA.map((service) => {
            const IconComponent = iconMap[service.iconName] || Settings;

            return (
              <div
                key={service.id}
                id={`service-card-${service.id}`}
                onClick={() => onSelectService(service)}
                className="group relative bg-white rounded-none p-7 sm:p-8 border border-slate-200/90 hover:border-red-500 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Large Subtle Watermark Number at top right */}
                <div className="absolute top-4 right-5 text-4xl sm:text-5xl font-black text-slate-100 group-hover:text-red-50 font-mono select-none pointer-events-none transition-colors">
                  {service.number}
                </div>

                <div>
                  {/* Red Square Icon Box matching Image 1 */}
                  <div className="w-12 h-12 rounded-none bg-red-600 text-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                    <IconComponent className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  {/* Service Title */}
                  <h3 className="text-lg sm:text-xl font-black text-slate-950 group-hover:text-red-600 transition-colors uppercase tracking-tight mb-3">
                    {service.title}
                  </h3>

                  {/* Service Short Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-6 line-clamp-3">
                    {service.shortDesc}
                  </p>
                </div>

                {/* Bottom Row: Detail Trigger and Quick Info */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 group-hover:translate-x-1 transition-transform">
                    <span>Lihat Detail Layanan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400">
                    {service.startingPrice.split('/')[0]}
                  </span>
                </div>

                {/* Hover Accent Bottom Border Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom Fast Action Row */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-8 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-black text-slate-900 uppercase">
              Tidak Menemukan Masalah Mobil Anda di Atas?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              Konsultasikan keluhan suara aneh, mogok mendadak, atau kebocoran langsung ke Kepala Mekanik kami.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=Halo%20Kepala%20Mekanik%20FHRCAR,%20saya%20mau%20konsultasi%20kendala%20mobil`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-red-600/20"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Konsultasi Bebas Biaya</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
