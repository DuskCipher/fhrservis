import { ARTICLES_DATA } from '../data/mockData';
import { ArticleItem, PageType } from '../types';
import { ChevronRight } from 'lucide-react';

interface ArticlesSectionProps {
  onSelectArticle: (article: ArticleItem) => void;
  onNavigate?: (page: PageType) => void;
}

export function ArticlesSection({ onSelectArticle, onNavigate }: ArticlesSectionProps) {
  return (
    <section id="artikel" className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching Image 5 */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 sm:mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
              Info & Tips Perawatan Mobil
            </h2>
            <button 
              onClick={() => onNavigate ? onNavigate('artikel') : onSelectArticle(ARTICLES_DATA[0])}
              className="text-xs sm:text-sm font-medium text-slate-500 hover:text-red-600 flex items-center gap-1 mt-1 group"
            >
              <span>Lihat semua artikel & tips</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="md:max-w-md text-xs sm:text-sm text-slate-500 md:text-right leading-relaxed">
            Baca artikel terbaru dari tim mekanik FHRCAR Auto Services tentang cara merawat mobil Anda agar tetap prima.
          </div>
        </div>

        {/* 4 Articles Grid matching Image 5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ARTICLES_DATA.map((article) => (
            <div
              key={article.id}
              id={`article-card-${article.id}`}
              onClick={() => onSelectArticle(article)}
              className="group cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Thumbnail Image Box (matching Image 5) */}
                <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-100 rounded-none mb-3 border border-slate-200/80">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Article Title matching Image 5 */}
                <h3 className="text-sm sm:text-base font-bold text-slate-950 group-hover:text-red-600 transition-colors leading-snug mb-2">
                  {article.title}
                </h3>

                {/* Article Snippet matching Image 5 */}
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {article.snippet}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
