export type PageType = 'beranda' | 'layanan' | 'proses' | 'artikel' | 'artikel-detail' | 'testimoni' | 'about' | 'booking';

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  features: string[];
  startingPrice: string;
  estimatedTime: string;
  popular?: boolean;
}

export interface BookingData {
  customerName: string;
  phone: string;
  serviceType: string;
  carBrand: string;
  carModel: string;
  carYear: string;
  licensePlate: string;
  locationAddress: string;
  isEmergency: boolean;
  notes: string;
  serviceDate: string;
  serviceTime: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  snippet: string;
  image: string;
  content: string[];
  tips: string[];
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
  details: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  car: string;
  location: string;
  rating: number;
  comment: string;
  serviceUsed: string;
  date: string;
  avatar: string;
}

export interface DiagnosticOption {
  id: string;
  symptom: string;
  category: string;
  possibleCauses: string[];
  immediateAction: string;
  recommendedService: string;
  urgency: 'Tinggi (Segera Berhenti)' | 'Sedang' | 'Rendah (Pengecekan Berkala)';
}
