/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ProcessPage } from './pages/ProcessPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { AboutPage } from './pages/AboutPage';
import { BookingPage } from './pages/BookingPage';
import { Footer } from './components/Footer';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { FloatingEmergencyBar } from './components/FloatingEmergencyBar';
import { ServiceItem, ArticleItem, PageType } from './types';
import { ARTICLES_DATA } from './data/mockData';

export default function App() {
  const [activePage, setActivePage] = useState<PageType>('beranda');
  const [selectedBookingService, setSelectedBookingService] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<ServiceItem | null>(null);
  const [selectedArticleDetail, setSelectedArticleDetail] = useState<ArticleItem | null>(ARTICLES_DATA[0]);

  const handleOpenBooking = (serviceName?: string, notes?: string) => {
    setSelectedBookingService(serviceName || '');
    setBookingNotes(notes || '');
    setActivePage('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: PageType) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticle = (article: ArticleItem) => {
    setSelectedArticleDetail(article);
    setActivePage('artikel-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans bg-white text-slate-900 flex flex-col justify-between">
      
      {/* 1. Header Navigation Bar */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenBooking={handleOpenBooking}
      />

      {/* Main Content Area based on Active Page */}
      <main className="flex-grow">
        {activePage === 'beranda' && (
          <HomePage
            onOpenBooking={handleOpenBooking}
            onSelectService={(service) => setSelectedServiceDetail(service)}
            onSelectArticle={handleSelectArticle}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'layanan' && (
          <ServicesPage
            onSelectService={(service) => setSelectedServiceDetail(service)}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {activePage === 'proses' && (
          <ProcessPage
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {activePage === 'artikel' && (
          <ArticlesPage
            onSelectArticle={handleSelectArticle}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {activePage === 'artikel-detail' && selectedArticleDetail && (
          <ArticleDetailPage
            article={selectedArticleDetail}
            onBack={() => handleNavigate('artikel')}
            onSelectArticle={handleSelectArticle}
            onNavigate={handleNavigate}
            onOpenBooking={(serviceTitle) => handleOpenBooking(serviceTitle)}
          />
        )}

        {activePage === 'testimoni' && (
          <TestimonialsPage
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {activePage === 'about' && (
          <AboutPage
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {activePage === 'booking' && (
          <BookingPage
            initialService={selectedBookingService}
            initialNotes={bookingNotes}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* 2. Comprehensive Footer */}
      <Footer 
        onNavigate={handleNavigate}
        onOpenBooking={() => handleOpenBooking()} 
      />

      {/* Interactive Service Detail Modal */}
      <ServiceDetailModal
        service={selectedServiceDetail}
        onClose={() => setSelectedServiceDetail(null)}
        onOpenBooking={(serviceTitle) => handleOpenBooking(serviceTitle)}
      />

      {/* Floating 24H Emergency Hotline / SOS Widget */}
      <FloatingEmergencyBar
        onOpenBooking={() => handleOpenBooking('Emergency 24 Jam')}
      />

    </div>
  );
}
