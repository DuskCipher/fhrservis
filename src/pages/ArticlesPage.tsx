import { useState } from 'react';
import { ARTICLES_DATA, WHATSAPP_PHONE } from '../data/mockData';
import { ArticleItem } from '../types';
import { 
  Search, 
  Calendar, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  MessageSquare,
  Car
} from 'lucide-react';

interface ArticlesPageProps {
  onSelectArticle: (article: ArticleItem) => void;
  onOpenBooking: () => void;
}

export function ArticlesPage({ onSelectArticle, onOpenBooking }: ArticlesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'Semua Artikel' },
    { id: 'Emergency & Kelistrikan', label: 'Aki & Kelistrikan' },
    { id: 'Emergency 24 Jam', label: 'Derek & Tol' },
    { id: 'Perawatan Mesin', label: 'Perawatan Mesin' },
    { id: 'AC & Kenyamanan', label: 'AC & Kenyamanan' },
  ];

  const filteredArticles = ARTICLES_DATA.filter((art) => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;
    return art.category === selectedCategory;
  });

  const maintenanceSchedule = [
    {
      km: '5.000 KM',
      title: 'Pemeriksaan Rutin Awal',
      items: ['Cek level & kualitas oli mesin', 'Cek tekanan angin & ketebalan ban', 'Pembersihan filter udara', 'Pemeriksaan minyak rem & radiator']
    },
    {
      km: '10.000 KM',
      title: 'Servis Ringan & Ganti Oli',
      items: ['Ganti oli mesin & filter oli', 'Rotasi ban & balancing', 'Pembersihan kampas rem (brake clean)', 'Tune up ringan & cek busi']
    },
    {
      km: '20.000 KM',
      title: 'Tune Up & Filter Kabin',
      items: ['Tune up injektor & throttle body', 'Penggantian filter kabin AC', 'Ganti filter udara mesin', 'Cek aki & sistem pengisian']
    },
    {
      km: '40.000 KM',
      title: 'Major Service & Fluida',
      items: ['Kuras minyak rem & kopling', 'Kuras cairan radiator (coolant)', 'Ganti oli transmisi / matic', 'Gurah mesin (carbon clean)']
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-extrabold uppercase tracking-wider rounded-full">
            Edukasi & Tips Otomotif
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Tips Perawatan Mobil & <span className="text-red-600">Panduan Darurat</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Kumpulan artikel terpercaya dari Master Mekanik FHRCAR untuk membantu Anda merawat kendaraan dan menangani kendala darurat di jalan.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari tips & masalah mobil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-slate-50"
            />
          </div>
        </div>

        {/* Featured Article Banner (First article) */}
        {filteredArticles.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md hover:shadow-xl transition-all grid grid-cols-1 lg:grid-cols-12 gap-0 group">
            <div className="lg:col-span-6 relative overflow-hidden h-64 lg:h-auto min-h-[280px]">
              <img
                src={filteredArticles[0].image}
                alt={filteredArticles[0].title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Artikel Utama
              </div>
            </div>

            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-bold text-red-600">{filteredArticles[0].category}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{filteredArticles[0].date}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{filteredArticles[0].readTime}</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 group-hover:text-red-600 transition-colors">
                  {filteredArticles[0].title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {filteredArticles[0].snippet}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectArticle(filteredArticles[0])}
                  className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-red-600/30 flex items-center gap-2"
                >
                  <span>Baca Artikel Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-red-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {article.category}
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {article.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                    {article.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {article.snippet}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-red-600">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Guide: Jadwal Servis Berkala Digital */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold uppercase tracking-wider rounded-full">
              Panduan Pemilik Kendaraan
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Jadwal Servis Berkala Mobil yang Tepat
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Cegah kerusakan mendadak di jalan dengan mengikuti panduan kilometer perawatan rutin berikut.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {maintenanceSchedule.map((sched, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="inline-block px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-black">
                    {sched.km}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{sched.title}</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
                    {sched.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Quick Action Callout */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Butuh Bantuan Cepat Sekarang?</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">Mobil Mengalami Gejala Tidak Normal?</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Konsultasikan bunyi aneh, lampu indikator menyala, atau keluhan mesin dengan mekanik kami secara gratis.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=Halo%20Admin%20FHRCAR,%20mobil%20saya%20ada%20kendala`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Konsultasi Gejala via WhatsApp</span>
            </a>
            <button
              onClick={onOpenBooking}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
            >
              <Car className="w-4 h-4" />
              <span>Panggil Mekanik ke Rumah</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
