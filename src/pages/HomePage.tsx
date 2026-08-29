import { Hero } from '../components/Hero';
import { ServicesSection } from '../components/ServicesSection';
import { FacilitySection } from '../components/FacilitySection';
import { OrderProcessSection } from '../components/OrderProcessSection';
import { EstimatorAndDiagnostic } from '../components/EstimatorAndDiagnostic';
import { TestimonialsAndCoverage } from '../components/TestimonialsAndCoverage';
import { ArticlesSection } from '../components/ArticlesSection';
import { BookingCtaBanner } from '../components/BookingCtaBanner';
import { ServiceItem, ArticleItem, PageType } from '../types';

interface HomePageProps {
  articles?: ArticleItem[];
  onOpenBooking: (serviceName?: string, notes?: string) => void;
  onSelectService: (service: ServiceItem) => void;
  onSelectArticle: (article: ArticleItem) => void;
  onNavigate: (page: PageType) => void;
}

export function HomePage({
  articles,
  onOpenBooking,
  onSelectService,
  onSelectArticle,
  onNavigate
}: HomePageProps) {
  return (
    <div>
      {/* Hero Section */}
      <Hero
        onOpenBooking={() => onOpenBooking()}
        onSelectServiceTab={() => onNavigate('layanan')}
      />

      {/* Services Section Preview */}
      <ServicesSection
        onSelectService={onSelectService}
        onOpenBooking={onOpenBooking}
      />

      {/* Facilities & Workshop Section */}
      <FacilitySection />

      {/* Order Process Steps Section */}
      <OrderProcessSection
        onOpenBooking={() => onOpenBooking()}
      />

      {/* Cost Estimator & Diagnostic Section */}
      <EstimatorAndDiagnostic
        onOpenBookingWithDetails={(notes, service) => onOpenBooking(service, notes)}
      />

      {/* Testimonials & Coverage Section */}
      <TestimonialsAndCoverage />

      {/* Info & Tips Articles Section */}
      <ArticlesSection
        articles={articles}
        onSelectArticle={onSelectArticle}
        onNavigate={onNavigate}
      />

      {/* Free General Check-Up Booking Banner */}
      <BookingCtaBanner
        onOpenBooking={() => onOpenBooking('Free General Check Up (Klaim Slot)')}
      />
    </div>
  );
}
