import { ORDER_STEPS } from '../data/mockData';

interface OrderProcessSectionProps {
  onOpenBooking: () => void;
}

export function OrderProcessSection({ onOpenBooking }: OrderProcessSectionProps) {
  return (
    <section id="proses" className="py-16 sm:py-24 bg-white relative overflow-hidden border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching Image 3 */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-red-600"></span>
            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-red-600 uppercase">
              PROSES
            </span>
            <span className="w-8 h-[2px] bg-red-600"></span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight uppercase mb-3">
            ALUR PEMESANAN
          </h2>
          
          <p className="text-sm sm:text-base text-slate-600">
            Mudahnya pesan layanan di Bengkel Home Service & Panggilan 24 Jam FHRCAR Auto Services yang begitu praktis dimulai dari ponsel Anda.
          </p>
        </div>

        {/* 2-Column Layout matching Image 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: 5 Numbered Steps (matching Image 3) */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7">
            {ORDER_STEPS.map((step) => (
              <div 
                key={step.number}
                className="flex items-start gap-4 sm:gap-5 group"
              >
                {/* Red Circle Outline Number Node matching Image 3 */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-red-500 bg-white text-red-600 font-bold text-xs sm:text-sm flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-xs">
                  {step.number}
                </div>

                {/* Step Content matching Image 3 */}
                <div className="space-y-1 pt-1">
                  <h3 className="text-base font-bold text-slate-950 group-hover:text-red-600 transition-colors">
                    {step.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Photo Framing with Red Bracket Accents matching Image 3 */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg">
              
              {/* Top-Right Red Bracket Line from Image 3 */}
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-12 sm:w-16 h-12 sm:h-16 border-t-3 sm:border-t-4 border-r-3 sm:border-r-4 border-red-600 pointer-events-none z-20"></div>

              {/* Bottom-Left Red Bracket Line from Image 3 */}
              <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 w-12 sm:w-16 h-12 sm:h-16 border-b-3 sm:border-b-4 border-l-3 sm:border-l-4 border-red-600 pointer-events-none z-20"></div>

              {/* Main Image Frame Container */}
              <div className="relative overflow-hidden bg-slate-100 border border-slate-200 shadow-md group">
                <img
                  src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80"
                  alt="Mekanik FHRCAR Service Mobil Langsung di Lokasi Anda"
                  className="w-full h-[320px] sm:h-[400px] object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Bottom Red Accent Line from Image 3 */}
              <div className="w-full h-1 bg-red-600 mt-2"></div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
