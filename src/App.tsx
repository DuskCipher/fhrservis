/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { subscribeToOrders, updateOrderStatus, seedInitialOrders } from './lib/firestoreService';
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
import { ServiceItem, ArticleItem, PageType, CRMOrder } from './types';
import { ARTICLES_DATA } from './data/mockData';

// CRM Components
import { LoginPage } from './pages/crm/LoginPage';
import { CRMLayout } from './pages/crm/CRMLayout';
import { CRMDashboard } from './pages/crm/CRMDashboard';
import { CRMOrders } from './pages/crm/CRMOrders';
import { CRMLembarPemeriksaan } from './pages/crm/CRMLembarPemeriksaan';

export default function App() {
  const [activePage, setActivePage] = useState<PageType>('beranda');
  const [selectedBookingService, setSelectedBookingService] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<ServiceItem | null>(null);
  const [selectedArticleDetail, setSelectedArticleDetail] = useState<ArticleItem | null>(ARTICLES_DATA[0]);

  // CRM State — Firebase Auth + Firestore
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading
  const [crmOrders, setCrmOrders] = useState<CRMOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore orders in real-time (only when on CRM pages)
  useEffect(() => {
    const isCrmPage = activePage.startsWith('crm-');
    if (!isCrmPage || !isAuthenticated) return;

    setOrdersLoading(true);
    const unsubscribe = subscribeToOrders((orders) => {
      // If Firestore is empty, seed with initial data
      if (orders.length === 0) {
        const initialOrders: Omit<CRMOrder, 'id'>[] = [
          { createdAt: new Date().toISOString(), status: 'pending', totalPrice: 0, customerName: 'Budi Santoso', phone: '081234567890', serviceType: 'Ganti Oli & Filter', carBrand: 'Toyota', carModel: 'Avanza', carYear: '2019', licensePlate: 'B 1234 ABC', locationAddress: 'Jl. Sudirman No. 1, Jakarta Selatan', isEmergency: false, notes: 'Oli bawa sendiri, filter juga', serviceDate: '22 Agustus 2026', serviceTime: '10:00' },
          { createdAt: new Date().toISOString(), status: 'process', totalPrice: 0, customerName: 'Siti Aminah', phone: '081298765432', serviceType: 'Emergency 24 Jam', carBrand: 'Honda', carModel: 'Brio', carYear: '2021', licensePlate: 'D 5678 DEF', locationAddress: 'Tol Dalam Kota KM 10, Jakarta', isEmergency: true, notes: 'Mobil mogok, indikator aki menyala', serviceDate: 'Hari Ini', serviceTime: 'Segera' },
          { createdAt: new Date().toISOString(), status: 'completed', totalPrice: 265000, customerName: 'Cholili', phone: '081223456789', serviceType: 'Servis AC Mobil', carBrand: 'Daihatsu', carModel: 'Gran Max', carYear: '2020', licensePlate: 'R 1927 SR', locationAddress: 'Jl. Merdeka No. 5, Purwokerto', isEmergency: false, notes: 'AC tidak dingin sama sekali', serviceDate: '22 Agustus 2026', serviceTime: '14:20' },
          { createdAt: new Date().toISOString(), status: 'process', totalPrice: 1008000, customerName: 'Galim', phone: '082112345678', serviceType: 'Tune Up & Servis Mesin', carBrand: 'Mitsubishi', carModel: 'L300', carYear: '2018', licensePlate: 'R 1785 GT', locationAddress: 'Jl. Raya Sokaraja, Banyumas', isEmergency: false, notes: 'Mesin terasa berat dan boros bahan bakar', serviceDate: '22 Agustus 2026', serviceTime: '14:26' },
          { createdAt: new Date().toISOString(), status: 'completed', totalPrice: 1638000, customerName: 'Amir', phone: '087612345678', serviceType: 'Ganti Rem & Kampas', carBrand: 'Suzuki', carModel: 'Carry', carYear: '2017', licensePlate: 'B 2374 BT', locationAddress: 'Jl. Setia Budi No. 12, Jakarta Selatan', isEmergency: true, notes: 'Rem blong, sangat berbahaya', serviceDate: '22 Agustus 2026', serviceTime: '13:40' },
          { createdAt: new Date().toISOString(), status: 'pending', totalPrice: 0, customerName: 'Rizky Hidayat', phone: '081987654321', serviceType: 'Ganti Aki & Alternator', carBrand: 'Toyota', carModel: 'Innova', carYear: '2022', licensePlate: 'AB 1122 CD', locationAddress: 'Jl. Veteran No. 8, Yogyakarta', isEmergency: false, notes: 'Aki lemah, mesin susah dinyalakan pagi hari', serviceDate: '23 Agustus 2026', serviceTime: '09:00' },
        ];
        seedInitialOrders(initialOrders);
      } else {
        setCrmOrders(orders);
        setOrdersLoading(false);
      }
    });

    return () => unsubscribe();
  }, [activePage, isAuthenticated]);

  // Map URL pathname → PageType
  const pathToPage = (path: string): PageType | null => {
    if (path === '/login') return 'crm-login';
    if (path === '/crm' || path === '/crm/') return 'crm-dashboard';
    if (path === '/crm/orders') return 'crm-orders';
    if (path === '/crm/lpa') return 'crm-lpa';
    return null;
  };

  // Map PageType → URL pathname
  const pageToPath = (page: PageType): string => {
    if (page === 'crm-login') return '/login';
    if (page === 'crm-dashboard') return '/crm';
    if (page === 'crm-orders') return '/crm/orders';
    if (page === 'crm-lpa') return '/crm/lpa';
    return '/';
  };

  useEffect(() => {
    // On first load, read URL and set correct page
    const path = window.location.pathname;
    const page = pathToPage(path);
    if (page) {
      setActivePage(page);
    }

    // Handle browser back/forward buttons
    const handlePopState = () => {
      const p = pathToPage(window.location.pathname);
      if (p) setActivePage(p);
      else setActivePage('beranda');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenBooking = (serviceName?: string, notes?: string) => {
    setSelectedBookingService(serviceName || '');
    setBookingNotes(notes || '');
    setActivePage('booking');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: PageType) => {
    setActivePage(page);
    // Update URL to match page
    const newPath = pageToPath(page);
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticle = (article: ArticleItem) => {
    setSelectedArticleDetail(article);
    setActivePage('artikel-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    handleNavigate('crm-dashboard');
  };

  const handleLogout = async () => {
    await signOut(auth);
    handleNavigate('beranda');
  };

  // CRM Rendering Logic
  // null = Firebase Auth still loading
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo-putih.png" alt="FHRCAR" className="h-12 w-auto object-contain opacity-80" />
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Memuat sistem...
          </div>
        </div>
      </div>
    );
  }

  if (activePage === 'crm-login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (activePage.startsWith('crm-')) {
    if (!isAuthenticated) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    return (
      <CRMLayout
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        {activePage === 'crm-dashboard' && (
          <CRMDashboard
            orders={crmOrders}
            onUpdateStatus={(id, status) => updateOrderStatus(id, status)}
            onNavigate={handleNavigate}
          />
        )}
        {activePage === 'crm-orders' && (
          <CRMOrders
            orders={crmOrders}
            onUpdateStatus={(id, status) => updateOrderStatus(id, status)}
          />
        )}
        {activePage === 'crm-lpa' && (
          <CRMLembarPemeriksaan />
        )}
      </CRMLayout>
    );
  }

  // Main Landing Page Rendering
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
