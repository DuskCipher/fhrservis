import { COVERAGE_AREAS, WHATSAPP_PHONE } from '../data/mockData';
import { Quote, MapPin, Navigation } from 'lucide-react';

export function TestimonialsAndCoverage() {
  const testimonials = [
    {
      id: 'testi-1',
      name: 'Juliani Tri Astuti',
      role: 'Pengusaha Kuliner',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
      comment: 'Cocok banget buat ibu-ibu yang ngga mau ribet kaya saya. Ga perlu lagi capek-capek dan lama nunggu di bengkel, tinggal kontak via WA dari rumah, mobil sudah terawat kembali. Dan yang ga kalah penting, edukasi dari tim FHRCAR sangat membantu saya mengetahui permasalahan-permasalahan di mobil saya.'
    },
    {
      id: 'testi-2',
      name: 'Sugiarto',
      role: 'Kontraktor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      comment: 'Pelayanan FHRCAR sangat bagus karena customer mendapat edukasi secara transparan terkait kerusakan dan estimasi biaya perbaikan mobil. Respon daruratnya luar biasa cepat saat mobil mogok di jalan tol. Maju terus FHRCAR!'
    },
    {
      id: 'testi-3',
      name: 'Hendrawan Pratama',
      role: 'Dokter & Profesional',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      comment: 'Home service ganti oli & tune-up sangat presisi dan bersih. Mekanik datang tepat waktu dengan seragam rapi dan membawa peralatan standar dealer resmi. Nota pengerjaan sangat rinci dan bergaransi resmi.'
    },
    {
      id: 'testi-4',
      name: 'Dewi Lestari',
      role: 'Karyawan Swasta',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      comment: 'Fitur free 20 point general check-up sangat membantu mendeteksi rem yang aus sebelum perjalanan mudik. Teknisi komunikatif dan tidak ada biaya tersembunyi. Benar-benar solusi bengkel modern!'
    }
  ];

  return (
    <section id="testimoni" className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Testimonials Header matching Image 4 */}
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-[2px] bg-red-600"></span>
            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-red-600 uppercase">
              TESTIMONI
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 uppercase tracking-tight">
            KATA MEREKA TENTANG FHRCAR
          </h2>
        </div>

        {/* Testimonials Cards Grid with Red Left Border matching Image 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-20">
          {testimonials.map((testi) => (
            <div
              key={testi.id}
              className="p-6 sm:p-8 bg-white border border-slate-200/90 border-l-4 border-l-red-600 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Quotation Mark Icon matching Image 4 */}
                <div className="text-slate-200 mb-3 select-none">
                  <Quote className="w-7 h-7 sm:w-8 sm:h-8 fill-slate-100 text-slate-200" />
                </div>

                {/* Comment Text matching Image 4 */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-6">
                  {testi.comment}
                </p>
              </div>

              {/* User Info with Divider matching Image 4 */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={testi.avatar}
                  alt={testi.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-950">
                    {testi.name}
                  </div>
                  <div className="text-[11px] sm:text-xs text-red-600 font-medium">
                    {testi.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Area Coverage Box */}
        <div id="area" className="rounded-2xl bg-slate-50 text-slate-900 p-6 sm:p-10 border border-slate-200/80 relative overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider">
                <Navigation className="w-3.5 h-3.5" />
                <span>Area Layanan Purwokerto & Sekitarnya</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black uppercase text-slate-950 tracking-tight">
                Wilayah Jangkauan Bengkel Panggilan Purwokerto
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Armada mekanik kami siaga di berbagai titik strategis kota Purwokerto dan sekitarnya untuk menjamin respon kilat saat Anda membutuhkan bantuan darurat mobil mogok maupun servis berkala langsung di rumah.
              </p>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=Halo%20Admin%20FHRCAR,%20apakah%20lokasi%20saya%20di%20Purwokerto%20/%20Banyumas%20terjangkau%20layanan%20bengkel%20panggilan?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-red-600/20"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Cek Ketersediaan Mekanik di Lokasi Anda</span>
                </a>
              </div>
            </div>

            {/* Right: Coverage Corridors */}
            <div className="lg:col-span-6 space-y-2.5">
              <div className="text-xs font-bold uppercase text-slate-500 mb-2">
                Titik Standby & Area Jangkauan Purwokerto:
              </div>

              {COVERAGE_AREAS.map((area) => (
                <div
                  key={area.name}
                  className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-4 shadow-xs"
                >
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>{area.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {area.desc}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 flex-shrink-0">
                    Standby 24/7
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
