import { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Phone, 
  Wrench, 
  ShieldCheck, 
  Copy, 
  Check, 
  ChevronRight,
  UserCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ArticleItem, PageType } from '../types';
import { ARTICLES_DATA, EMERGENCY_HOTLINE, WHATSAPP_PHONE } from '../data/mockData';

interface ArticleDetailPageProps {
  article: ArticleItem;
  articles?: ArticleItem[];
  onBack: () => void;
  onSelectArticle: (article: ArticleItem) => void;
  onNavigate: (page: PageType) => void;
  onOpenBooking: (serviceName?: string) => void;
}

export function ArticleDetailPage({
  article,
  articles = ARTICLES_DATA,
  onBack,
  onSelectArticle,
  onNavigate,
  onOpenBooking
}: ArticleDetailPageProps) {
  const [copied, setCopied] = useState(false);

  const relatedArticles = articles.filter((a) => a.id !== article.id).slice(0, 3);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `Baca artikel bermanfaat dari FHRCAR Auto Services: "${article.title}"\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Top Breadcrumb & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 flex-wrap">
            <button 
              onClick={() => onNavigate('beranda')}
              className="hover:text-red-600 font-medium transition-colors"
            >
              Beranda
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button 
              onClick={onBack}
              className="hover:text-red-600 font-medium transition-colors"
            >
              Tips & Artikel
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold line-clamp-1 max-w-[200px] sm:max-w-xs">
              {article.title}
            </span>
          </div>

          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:text-red-600 hover:border-red-300 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Semua Artikel</span>
          </button>
        </div>

        {/* Article Header & Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Article Content (8 Cols) */}
          <article className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-10 space-y-8">
            
            {/* Category, Date, Author Meta */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider rounded-full">
                  {article.category}
                </span>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{article.date}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{article.readTime}</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-snug">
                {article.title}
              </h1>

              {/* Author Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Tim Master Mekanik FHRCAR</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Spesialis Bengkel Panggilan & Home Service 24 Jam
                    </div>
                  </div>
                </div>

                {/* Share Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors text-xs font-bold flex items-center gap-1.5"
                    title="Bagikan via WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Bagikan</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors text-xs font-bold flex items-center gap-1.5"
                    title="Salin tautan artikel"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Salin Link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-inner">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-64 sm:h-96 object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-[11px] font-medium px-3 py-1 rounded-lg border border-slate-700/60">
                Dokumentasi Servis FHRCAR Auto Services
              </div>
            </div>

            {/* Article Lead Excerpt */}
            <div className="p-5 sm:p-6 rounded-2xl bg-red-50/70 border-l-4 border-red-600 text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
              {article.snippet}
            </div>

            {/* Article Body Content Paragraphs */}
            <div className="space-y-5 text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
              {article.content && article.content.length > 0 ? (
                article.content.map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p>
                  Perawatan kendaraan secara rutin merupakan kunci utama menjaga performa mesin tetap bertenaga, hemat bahan bakar, dan terhindar dari mogok tiba-tiba di jalan raya maupun jalan tol.
                </p>
              )}

              <p>
                Banyak pemilik mobil menunda servis berkala karena kesibukan harian atau malas mengantri berjam-jam di bengkel. Dengan menghadirkan konsep <strong>Home Service & Bengkel Panggilan 24 Jam</strong>, FHRCAR memberikan kemudahan servis profesional langsung di garasi rumah atau penanganan cepat saat darurat di jalan.
              </p>
            </div>

            {/* Pro-Tips Callout Box */}
            {article.tips && article.tips.length > 0 && (
              <div className="p-6 sm:p-7 rounded-2xl bg-slate-900 text-white space-y-4 shadow-md">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-red-500" />
                  <span>Saran & Tips Perawatan dari Mekanik Ahli</span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold">
                  Poin Penting yang Perlu Diperhatikan:
                </h3>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                  {article.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-600/30 border border-red-500/50 flex items-center justify-center shrink-0 mt-0.5 text-red-400">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* In-Article CTA Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-red-600/20">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-red-200">
                  Konsultasi Gratis Tanpa Biaya
                </div>
                <h4 className="text-lg sm:text-xl font-black">
                  Mobil Anda Mengalami Kendala yang Sama?
                </h4>
                <p className="text-xs text-red-100 max-w-md">
                  Panggil tim mekanik kami sekarang ke rumah atau konsultasikan keluhan mobil Anda via WhatsApp.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => onOpenBooking(article.title)}
                  className="px-5 py-2.5 rounded-xl bg-white text-red-600 hover:bg-red-50 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  Booking Sekarang
                </button>
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=Halo%20Admin%20FHRCAR,%20saya%20membaca%20artikel%20"${encodeURIComponent(article.title)}"%20dan%20ingin%20konsultasi%20kondisi%20mobil.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Back to articles button */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Lihat Artikel Edukasi Lainnya</span>
              </button>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                ↑ Ke Atas
              </button>
            </div>

          </article>

          {/* Right Sticky Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Quick Contact & Emergency Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Siaga Darurat 24 Jam</span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white leading-tight">
                  Butuh Bantuan Mekanik Cepat?
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Layanan tanggap darurat mobil mogok, jumper aki, overheat, dan servis panggilan jalan raya/tol.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Hotline Darurat</div>
                <div className="text-xl sm:text-2xl font-black text-red-400 tracking-wide">
                  {EMERGENCY_HOTLINE}
                </div>
              </div>

              <div className="space-y-2.5">
                <a
                  href={`tel:${EMERGENCY_HOTLINE.replace(/[^0-9]/g, '')}`}
                  className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/30"
                >
                  <Phone className="w-4 h-4" />
                  <span>Telepon Hotline Sekarang</span>
                </a>

                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=Halo%20Admin%20FHRCAR,%20saya%20butuh%20mekanik%20panggilan%20darurat%20ke%20lokasi`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat WhatsApp 24 Jam</span>
                </a>
              </div>
            </div>

            {/* Home Service Booking Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                <Wrench className="w-5 h-5" />
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-950">
                  Jadwalkan Home Service
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pilih waktu dan tanggal sesuai kenyamanan Anda. Mekanik kami datang ke rumah dengan peralatan lengkap.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Gratis Pengecekan 20 Titik</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Garansi Resmi & Part OEM Asli</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Bebas Antre di Bengkel</span>
                </li>
              </ul>

              <button
                onClick={() => onOpenBooking()}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Buka Form Pemesanan
              </button>
            </div>

            {/* Related Articles in Sidebar */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Artikel Terkait Lainnya
              </h4>

              <div className="space-y-4">
                {relatedArticles.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectArticle(rel);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex gap-3 group cursor-pointer items-start"
                  >
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 group-hover:opacity-90 transition-opacity"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-red-600 uppercase">
                        {rel.category}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h5>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </aside>

        </div>

        {/* Bottom Related Articles Big Grid */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">Rekomendasi Bacaan</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950">Artikel Tips Otomotif Pilihan</h3>
            </div>

            <button
              onClick={onBack}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 transition-colors"
            >
              <span>Lihat Semua Artikel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectArticle(item);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group cursor-pointer bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {item.category}
                  </div>
                </div>

                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 mb-1">{item.date} • {item.readTime}</div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5">
                      {item.snippet}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-red-600">
                    <span>Baca Selengkapnya</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
