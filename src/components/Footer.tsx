import { 
  Instagram, 
  Facebook, 
  Youtube, 
  Rss,
  Download
} from 'lucide-react';
import { EMERGENCY_HOTLINE, WHATSAPP_PHONE } from '../data/mockData';
import { PageType } from '../types';
import { triggerPWAInstall } from './PWAInstallPrompt';

interface FooterProps {
  onNavigate: (page: PageType) => void;
  onOpenBooking: () => void;
}

export function Footer({ onNavigate, onOpenBooking }: FooterProps) {
  const handleNav = (page: PageType) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white text-slate-600 text-xs border-t border-slate-200">
      
      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Col 1: Brand & Ecosystem */}
          <div className="lg:col-span-4 space-y-4">
            <button 
              onClick={() => handleNav('beranda')}
              className="flex items-center gap-3 text-left focus:outline-none"
            >
              <img
                src="https://i.ibb.co.com/JRGLV4Nx/LOGO-Univ.png"
                alt="FHRCAR Auto Services Logo"
                className="h-10 sm:h-12 w-auto max-w-[210px] object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
              />
            </button>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Hadirkan ekosistem perawatan mobil terbaik di Indonesia. Solusi terpercaya untuk kebutuhan perbaikan, perawatan, dan inspeksi kendaraan Anda langsung di lokasi.
            </p>

            <div className="space-y-2 pt-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-red-600">
                EKOSISTEM FHRCAR
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => handleNav('layanan')}
                  className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-red-600 transition-colors"
                >
                  FHRCAR RESCUE 24H
                </button>
                <button 
                  onClick={() => handleNav('layanan')}
                  className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-red-600 transition-colors"
                >
                  HOME SERVICE
                </button>
                <button 
                  onClick={() => handleNav('about')}
                  className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-red-600 transition-colors"
                >
                  AUTOPART OEM
                </button>
              </div>
            </div>
          </div>

          {/* Col 2: LAYANAN SERVIS */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-none inline-block"></span>
              <span>HALAMAN UTAMA</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <button onClick={() => handleNav('beranda')} className="hover:text-red-600 transition-colors text-left">Beranda Utama</button>
              </li>
              <li>
                <button onClick={() => handleNav('layanan')} className="hover:text-red-600 transition-colors text-left">Katalog Layanan Servis</button>
              </li>
              <li>
                <button onClick={() => handleNav('proses')} className="hover:text-red-600 transition-colors text-left">Alur Proses & SOP</button>
              </li>
              <li>
                <button onClick={() => handleNav('testimoni')} className="hover:text-red-600 transition-colors text-left">Testimoni & Jangkauan</button>
              </li>
              <li>
                <button onClick={() => handleNav('artikel')} className="hover:text-red-600 transition-colors text-left">Tips & Artikel Otomotif</button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-red-600 transition-colors text-left">Tentang Kami (About Us)</button>
              </li>
            </ul>
          </div>

          {/* Col 3: KELUARGA FHRCAR */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-none inline-block"></span>
              <span>LAYANAN SPESIALIS</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <button onClick={() => handleNav('layanan')} className="hover:text-red-600 transition-colors text-left">Bengkel Panggilan 24 Jam & SOS</button>
              </li>
              <li>
                <button onClick={() => handleNav('layanan')} className="hover:text-red-600 transition-colors text-left">Tune Up & Gurah Mesin</button>
              </li>
              <li>
                <button onClick={() => handleNav('layanan')} className="hover:text-red-600 transition-colors text-left">Ganti Oli Mesin di Rumah</button>
              </li>
              <li>
                <button onClick={() => handleNav('layanan')} className="hover:text-red-600 transition-colors text-left">Diagnosa Kelistrikan & Sensor ECU</button>
              </li>
              <li>
                <button onClick={() => handleNav('layanan')} className="hover:text-red-600 transition-colors text-left">Home Service Rem & Kaki-kaki</button>
              </li>
            </ul>
          </div>

          {/* Col 4: INFORMASI */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-none inline-block"></span>
              <span>BANTUAN & KONTAK</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <a href={`tel:${EMERGENCY_HOTLINE.replace(/[^0-9]/g, '')}`} className="hover:text-red-600 transition-colors font-medium block">
                  Hotline: {EMERGENCY_HOTLINE}
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${WHATSAPP_PHONE}`} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors font-medium block">
                  WhatsApp: +{WHATSAPP_PHONE}
                </a>
              </li>
              <li>
                <button onClick={onOpenBooking} className="text-red-600 font-bold hover:underline text-left">
                  Form Booking Online
                </button>
              </li>
              <li>
                <button 
                  onClick={triggerPWAInstall} 
                  className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-red-600 transition-colors text-left"
                >
                  <Download className="w-3.5 h-3.5 text-red-600" />
                  <span>Install Aplikasi PWA</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2026 FHRCAR Auto Services - All rights reserved. | <button onClick={() => handleNav('about')} className="hover:text-red-600 transition-colors">Tentang Kami</button>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-red-600 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-red-600 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-red-600 transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <button 
              onClick={() => handleNav('artikel')} 
              className="text-slate-400 hover:text-red-600 transition-colors"
              aria-label="RSS Feed"
            >
              <Rss className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
