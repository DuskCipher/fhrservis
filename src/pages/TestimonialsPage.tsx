import { useState, FormEvent } from 'react';
import { TESTIMONIALS_DATA, COVERAGE_AREAS, WHATSAPP_PHONE } from '../data/mockData';
import { TestimonialItem } from '../types';
import { 
  Star, 
  MapPin, 
  Car, 
  ShieldCheck, 
  MessageSquare, 
  CheckCircle2, 
  ThumbsUp, 
  Send,
  Clock,
  PhoneCall
} from 'lucide-react';

interface TestimonialsPageProps {
  onOpenBooking: () => void;
}

export function TestimonialsPage({ onOpenBooking }: TestimonialsPageProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Feedback form state
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackCar, setFeedbackCar] = useState('');
  const [feedbackService, setFeedbackService] = useState('Home Service Tune Up & Ganti Oli');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [testimonialsList, setTestimonialsList] = useState<TestimonialItem[]>([
    ...TESTIMONIALS_DATA,
    {
      id: '5',
      name: 'Bpk. Faisal Rahman',
      car: 'Innova Reborn Diesel',
      location: 'Karanglewas, Purwokerto',
      rating: 5,
      serviceUsed: 'Gurah Mesin & Purging Diesel',
      comment: 'Tarikan Innova diesel saya yang tadinya berat dan agak berasap langsung enteng banget setelah di-purging dan gurah mesin di rumah. Sangat recommended!',
      date: '3 hari yang lalu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: '6',
      name: 'Ibu Stephanie Tan',
      car: 'Mercedes-Benz C200 W205',
      location: 'Purwokerto Barat',
      rating: 5,
      serviceUsed: 'Service AC & Diagnosa Sensor',
      comment: 'Kabin mobil bau apek dan AC kurang dingin. Mekaniknya teliti, cuci evaporator pakai kamera endoskopik tanpa lepas dashboard. Hasilnya dingin sejuk dan wangi.',
      date: '1 minggu yang lalu',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: '7',
      name: 'Bpk. Dimas Wardhana',
      car: 'Honda HR-V 1.5 E',
      location: 'Kembaran, Dukuhwaluh',
      rating: 5,
      serviceUsed: 'Home Service Ganti Kampas Rem & Minyak Rem',
      comment: 'Gak sempat ke bengkel karena kerjaan padat. Pesan FHRCAR jam 10 pagi, jam 11 siang mekanik sudah datang ke rumah di Kembaran lengkap dengan kampas rem asli. Mantap!',
      date: '10 hari yang lalu',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80'
    }
  ]);

  const handleFeedbackSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!feedbackName || !feedbackComment) return;

    const newTestimonial: TestimonialItem = {
      id: String(Date.now()),
      name: feedbackName,
      car: feedbackCar || 'Kendaraan Pelanggan',
      location: 'Indonesia',
      rating: feedbackRating,
      serviceUsed: feedbackService,
      comment: feedbackComment,
      date: 'Baru saja',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    };

    setTestimonialsList([newTestimonial, ...testimonialsList]);
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackName('');
      setFeedbackCar('');
      setFeedbackComment('');
      setFeedbackSubmitted(false);
    }, 4000);
  };

  const filteredTestimonials = testimonialsList.filter((item) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'emergency') return item.serviceUsed.toLowerCase().includes('emergency') || item.serviceUsed.toLowerCase().includes('jumper');
    if (filterCategory === 'mesin') return item.serviceUsed.toLowerCase().includes('tune up') || item.serviceUsed.toLowerCase().includes('oli') || item.serviceUsed.toLowerCase().includes('gurah');
    if (filterCategory === 'kaki-ac') return item.serviceUsed.toLowerCase().includes('ac') || item.serviceUsed.toLowerCase().includes('rem');
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-extrabold uppercase tracking-wider rounded-full">
            Ulasan Nyata Pelanggan
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Testimoni & <span className="text-red-600">Kepercayaan Pelanggan</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Lebih dari 100+ pemilik kendaraan mempercayakan perawatan berkala dan situasi darurat mobil kepada FHRCAR Auto Services.
          </p>
        </div>

        {/* Rating Metrics & Social Proof Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="space-y-1 pt-2 md:pt-0">
            <div className="text-4xl sm:text-5xl font-black text-slate-900">4.9<span className="text-xl text-amber-500">/5.0</span></div>
            <div className="flex items-center justify-center gap-1 text-amber-400 py-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium">Berdasarkan 100+ Ulasan Puas</p>
          </div>

          <div className="space-y-1 pt-4 md:pt-0">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">99.4%</div>
            <p className="text-xs font-bold text-emerald-600">Tingkat Kepuasan</p>
            <p className="text-xs text-slate-500">Pelanggan puas dengan transparansi harga & hasil kerja</p>
          </div>

          <div className="space-y-1 pt-4 md:pt-0">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">&lt; 30 Mnt</div>
            <p className="text-xs font-bold text-red-600">Rata-rata Respon Darurat</p>
            <p className="text-xs text-slate-500">Armada siaga dispatch di berbagai titik strategis</p>
          </div>

          <div className="space-y-1 pt-4 md:pt-0">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">100%</div>
            <p className="text-xs font-bold text-slate-800">Garansi Pengerjaan</p>
            <p className="text-xs text-slate-500">Jaminan sparepart OEM dan invoice digital resmi</p>
          </div>
        </div>

        {/* Testimonials Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'all' ? 'bg-red-600 text-white shadow-sm shadow-red-600/30' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua Ulasan ({testimonialsList.length})
            </button>
            <button
              onClick={() => setFilterCategory('emergency')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'emergency' ? 'bg-red-600 text-white shadow-sm shadow-red-600/30' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Darurat & Jumper
            </button>
            <button
              onClick={() => setFilterCategory('mesin')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'mesin' ? 'bg-red-600 text-white shadow-sm shadow-red-600/30' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tune Up & Oli
            </button>
            <button
              onClick={() => setFilterCategory('kaki-ac')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'kaki-ac' ? 'bg-red-600 text-white shadow-sm shadow-red-600/30' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              AC & Kaki-kaki
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-900">{filteredTestimonials.length}</strong> ulasan
          </div>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-red-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Rating & Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">{t.date}</span>
                </div>

                {/* Service Tag */}
                <div className="inline-block px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-[11px] font-bold border border-red-100 line-clamp-1">
                  {t.serviceUsed}
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              {/* Customer Info */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{t.name}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                    <Car className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{t.car}</span>
                    <span>•</span>
                    <span className="truncate">{t.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coverage Areas Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-extrabold uppercase tracking-wider rounded-full">
              Jangkauan Layanan
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Wilayah Layanan Home Service & Emergency
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Armada motor quick response & mobil servis kami tersebar di berbagai kota untuk respon cepat ke tempat Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {COVERAGE_AREAS.map((area, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{area.name}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {area.desc}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mekanik Siaga 24 Jam</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Review Form */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-10 border border-slate-700 shadow-xl space-y-6">
          <div className="max-w-2xl">
            <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Suara Pelanggan</span>
            <h3 className="text-2xl sm:text-3xl font-black mt-1">Pernah Menggunakan Layanan FHRCAR?</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Bagikan pengalaman servis Anda untuk membantu pengendara lain mendapatkan pelayanan terbaik.
            </p>
          </div>

          {feedbackSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <span>Terima kasih! Ulasan Anda telah berhasil dikirim dan akan diverifikasi oleh sistem kami.</span>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    placeholder="Contoh: Bpk. Bambang"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mobil & Tipe</label>
                  <input
                    type="text"
                    value={feedbackCar}
                    onChange={(e) => setFeedbackCar(e.target.value)}
                    placeholder="Contoh: Toyota Avanza 2021"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Layanan yang Digunakan</label>
                  <select
                    value={feedbackService}
                    onChange={(e) => setFeedbackService(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Home Service Tune Up & Mesin">Home Service Tune Up & Mesin</option>
                    <option value="Home Service Ganti Oli & Filter">Home Service Ganti Oli & Filter</option>
                    <option value="Bengkel Panggilan 24 Jam & SOS">Bengkel Panggilan 24 Jam & SOS</option>
                    <option value="Home Service Rem & Kaki-kaki">Home Service Rem & Kaki-kaki</option>
                    <option value="Diagnosa Kelistrikan & Sensor ECU">Diagnosa Kelistrikan & Sensor ECU</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rating Kepuasan</label>
                  <div className="flex items-center gap-2 h-10">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setFeedbackRating(num)}
                        className="p-1 text-amber-400 focus:outline-none"
                      >
                        <Star className={`w-6 h-6 ${num <= feedbackRating ? 'fill-amber-400' : 'text-slate-600'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-2">{feedbackRating} Bintang</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ulasan Pengalaman Anda *</label>
                <textarea
                  required
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Ceritakan kepuasan pengerjaan mekanik, ketepatan waktu, dan kondisi mobil Anda setelah diservis..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-red-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Ulasan</span>
              </button>
            </form>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Ingin Mobil Anda Ditangani Ahlinya?</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Bergabunglah dengan ribuan pemilik mobil cerdas yang menikmati kemudahan servis langsung di garasi rumah.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenBooking}
              className="px-8 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-red-600/30"
            >
              Booking Servis Sekarang
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
