/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import {
  subscribeToOrders,
  subscribeToCustomers,
  subscribeToEmployees,
  updateOrderStatus,
  seedInitialOrders,
  seedInitialCustomers,
} from './lib/firestoreService';
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
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { ServiceItem, ArticleItem, PageType, CRMOrder, CustomerItem, EmployeeItem } from './types';
import { ARTICLES_DATA } from './data/mockData';

// CRM Components
import { LoginPage } from './pages/crm/LoginPage';
import { CRMLayout } from './pages/crm/CRMLayout';
import { CRMDashboard } from './pages/crm/CRMDashboard';
import { CRMOrders } from './pages/crm/CRMOrders';
import { CRMCustomers } from './pages/crm/CRMCustomers';
import { CRMCustomerDetail } from './pages/crm/CRMCustomerDetail';
import { CRMCustomerForm } from './pages/crm/CRMCustomerForm';
import { CRMKaryawan } from './pages/crm/CRMKaryawan';
import { CRMLembarPemeriksaan } from './pages/crm/CRMLembarPemeriksaan';
import { CRMSPKCreate } from './pages/crm/CRMSPKCreate';

export default function App() {
  const [activePage, setActivePage] = useState<PageType>('beranda');
  const [selectedBookingService, setSelectedBookingService] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<ServiceItem | null>(null);
  const [selectedArticleDetail, setSelectedArticleDetail] = useState<ArticleItem | null>(ARTICLES_DATA[0]);

  // CRM State — Firebase Auth + Firestore
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading
  const [crmOrders, setCrmOrders] = useState<CRMOrder[]>([]);
  const [crmCustomers, setCrmCustomers] = useState<CustomerItem[]>([]);
  const [crmEmployees, setCrmEmployees] = useState<EmployeeItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [editingSPKOrder, setEditingSPKOrder] = useState<CRMOrder | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore orders & customers in real-time (only when on CRM pages)
  useEffect(() => {
    const isCrmPage = activePage.startsWith('crm-');
    if (!isCrmPage || !isAuthenticated) return;

    setOrdersLoading(true);
    const unsubOrders = subscribeToOrders((orders) => {
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

    const unsubCustomers = subscribeToCustomers((customers) => {
      if (customers.length === 0) {
        const initialCustomers: Omit<CustomerItem, 'id'>[] = [
          { name: 'Budi Santoso', phone: '081234567890', email: 'budi.santoso@gmail.com', address: 'Jl. Sudirman No. 1, Jakarta Selatan', carBrand: 'Toyota', carModel: 'Avanza 1.3 G', carYear: '2019', licensePlate: 'B 1234 ABC', transmission: 'Matic', carColor: 'Silver Metallic', notes: 'Rutin ganti oli mesin tiap 5.000 KM', totalOrdersCount: 2, totalSpent: 850000, createdAt: new Date().toISOString() },
          { name: 'Siti Aminah', phone: '081298765432', email: 'siti.aminah@yahoo.com', address: 'Tol Dalam Kota KM 10, Jakarta', carBrand: 'Honda', carModel: 'Brio Satya E', carYear: '2021', licensePlate: 'D 5678 DEF', transmission: 'Matic', carColor: 'Putih', notes: 'Pernah minta emergency aki drop di tol', totalOrdersCount: 1, totalSpent: 450000, createdAt: new Date().toISOString() },
          { name: 'Cholili', phone: '081223456789', email: 'cholili.trans@gmail.com', address: 'Jl. Merdeka No. 5, Purwokerto', carBrand: 'Daihatsu', carModel: 'Gran Max 1.5', carYear: '2020', licensePlate: 'R 1927 SR', transmission: 'Manual', carColor: 'Hitam', notes: 'Mobil niaga, rutin cek AC dan kampas rem', totalOrdersCount: 3, totalSpent: 1250000, createdAt: new Date().toISOString() },
          { name: 'Galim', phone: '082112345678', email: 'galim.jaya@gmail.com', address: 'Jl. Raya Sokaraja, Banyumas', carBrand: 'Mitsubishi', carModel: 'L300', carYear: '2018', licensePlate: 'R 1785 GT', transmission: 'Manual', carColor: 'Coklat Tua', notes: 'Mesin bertenaga, perawatan rutin berkala', totalOrdersCount: 2, totalSpent: 1008000, createdAt: new Date().toISOString() },
          { name: 'Rizky Hidayat', phone: '081987654321', email: 'rizky.hidayat@gmail.com', address: 'Jl. Veteran No. 8, Yogyakarta', carBrand: 'Toyota', carModel: 'Innova Reborn V', carYear: '2022', licensePlate: 'AB 1122 CD', transmission: 'Matic', carColor: 'Hitam Metalik', notes: 'Mobil keluarga, sparepart selalu original', totalOrdersCount: 1, totalSpent: 650000, createdAt: new Date().toISOString() }
        ];
        seedInitialCustomers(initialCustomers);
      } else {
        setCrmCustomers(customers);
      }
    });

    const unsubEmployees = subscribeToEmployees((employees) => {
      setCrmEmployees(employees);
    });

    return () => {
      unsubOrders();
      unsubCustomers();
      unsubEmployees();
    };
  }, [activePage, isAuthenticated]);

  // Map URL pathname → PageType
  const pathToPage = (path: string): PageType | null => {
    const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    if (cleanPath === '/login') return 'crm-login';
    if (cleanPath === '/crm') return 'crm-dashboard';
    if (cleanPath === '/crm/orders') return 'crm-orders';
    if (cleanPath === '/crm/customers') return 'crm-customers';
    if (cleanPath === '/crm/customers/create' || cleanPath === '/crm/customers/tambah') return 'crm-customer-create';
    if (cleanPath.endsWith('/edit')) return 'crm-customer-edit';
    if (cleanPath.startsWith('/crm/customers/')) return 'crm-customer-detail';
    if (cleanPath === '/crm/lpa') return 'crm-lpa';
    if (cleanPath === '/crm/spk' || cleanPath === '/crm/spk-create' || cleanPath === '/crm/spk/create') return 'crm-spk-create';
    if (cleanPath === '/crm/employees') return 'crm-employees';
    return null;
  };

  // Map PageType → URL pathname
  const pageToPath = (page: PageType): string => {
    if (page === 'crm-login') return '/login';
    if (page === 'crm-dashboard') return '/crm';
    if (page === 'crm-orders') return '/crm/orders';
    if (page === 'crm-customers') return '/crm/customers';
    if (page === 'crm-customer-create') return '/crm/customers/create';
    if (page === 'crm-customer-edit') return selectedCustomer ? `/crm/customers/${selectedCustomer.id}/edit` : '/crm/customers/create';
    if (page === 'crm-customer-detail') return selectedCustomer ? `/crm/customers/${selectedCustomer.id}` : '/crm/customers';
    if (page === 'crm-lpa') return '/crm/lpa';
    if (page === 'crm-spk-create') return '/crm/spk';
    if (page === 'crm-employees') return '/crm/employees';
    return '/';
  };

  useEffect(() => {
    // On first load, read URL and set correct page
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const action = searchParams.get('action');

    const page = pathToPage(path);
    if (page) {
      setActivePage(page);
    } else if (action === 'booking') {
      setActivePage('booking');
    } else if (action === 'emergency') {
      handleOpenBooking('Emergency 24 Jam', 'Panggilan darurat dari shortcut PWA');
    } else if (action === 'layanan') {
      setActivePage('layanan');
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
  if (activePage === 'crm-login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (activePage.startsWith('crm-')) {
    // Show loading spinner if Firebase Auth is still resolving
    if (isAuthenticated === null) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans">
          <div className="flex flex-col items-center gap-4">
            <img src="/logo-putih.png" alt="FHRCAR" className="h-12 w-auto object-contain opacity-80" />
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <svg className="animate-spin h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Memuat sistem CRM...
            </div>
          </div>
        </div>
      );
    }

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
            customers={crmCustomers}
            onUpdateStatus={(id, status) => updateOrderStatus(id, status)}
            onNavigate={handleNavigate}
            onBuatSPK={() => {
              setEditingSPKOrder(null);
              handleNavigate('crm-spk-create');
            }}
          />
        )}
        {activePage === 'crm-orders' && (
          <CRMOrders
            orders={crmOrders}
            customers={crmCustomers}
            onUpdateStatus={(id, status) => updateOrderStatus(id, status)}
            onNavigate={handleNavigate}
            onBuatSPK={() => {
              setEditingSPKOrder(null);
              handleNavigate('crm-spk-create');
            }}
            onEditSPK={(order) => {
              setEditingSPKOrder(order);
              handleNavigate('crm-spk-create');
            }}
          />
        )}
        {activePage === 'crm-customers' && (
          <CRMCustomers
            customers={crmCustomers}
            orders={crmOrders}
            onNavigate={handleNavigate}
            onBuatSPK={() => {
              setEditingSPKOrder(null);
              handleNavigate('crm-spk-create');
            }}
            onViewCustomer={(customer) => {
              setSelectedCustomer(customer);
              handleNavigate('crm-customer-detail');
            }}
            onTambahCustomer={() => handleNavigate('crm-customer-create')}
            onEditCustomer={(customer) => {
              setSelectedCustomer(customer);
              handleNavigate('crm-customer-edit');
            }}
          />
        )}
        {activePage === 'crm-customer-detail' && selectedCustomer && (
          <CRMCustomerDetail
            customer={selectedCustomer}
            orders={crmOrders}
            onBack={() => handleNavigate('crm-customers')}
            onNavigate={handleNavigate}
            onBuatSPK={() => {
              setEditingSPKOrder(null);
              handleNavigate('crm-spk-create');
            }}
            onEdit={(customer) => {
              setSelectedCustomer(customer);
              handleNavigate('crm-customer-edit');
            }}
            onEditSPK={(order) => {
              setEditingSPKOrder(order);
              handleNavigate('crm-spk-create');
            }}
          />
        )}
        {activePage === 'crm-customer-create' && (
          <CRMCustomerForm
            customer={null}
            onBack={() => handleNavigate('crm-customers')}
            onNavigate={handleNavigate}
            onSaveSuccess={(newCust) => {
              setSelectedCustomer(newCust);
              handleNavigate('crm-customer-detail');
            }}
          />
        )}
        {activePage === 'crm-customer-edit' && (
          <CRMCustomerForm
            customer={selectedCustomer}
            onBack={() => handleNavigate(selectedCustomer ? 'crm-customer-detail' : 'crm-customers')}
            onNavigate={handleNavigate}
            onSaveSuccess={(updatedCust) => {
              setSelectedCustomer(updatedCust);
              handleNavigate('crm-customer-detail');
            }}
          />
        )}
        {activePage === 'crm-lpa' && (
          <CRMLembarPemeriksaan />
        )}
        {activePage === 'crm-employees' && (
          <CRMKaryawan
            employees={crmEmployees}
            onNavigate={handleNavigate}
          />
        )}
        {activePage === 'crm-spk-create' && (
          <CRMSPKCreate
            customers={crmCustomers}
            employees={crmEmployees}
            editingOrder={editingSPKOrder}
            onNavigate={(page) => {
              if (page !== 'crm-spk-create') setEditingSPKOrder(null);
              handleNavigate(page);
            }}
            onSaveSuccess={() => {
              setEditingSPKOrder(null);
              handleNavigate('crm-orders');
            }}
          />
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

      {/* Progressive Web App (PWA) Install Prompt & Offline Alerts */}
      <PWAInstallPrompt />

    </div>
  );
}
