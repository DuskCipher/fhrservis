export type PageType = 'beranda' | 'layanan' | 'proses' | 'artikel' | 'artikel-detail' | 'testimoni' | 'about' | 'booking' | 'crm-login' | 'crm-dashboard' | 'crm-orders' | 'crm-customers' | 'crm-customer-detail' | 'crm-lpa' | 'crm-spk-create' | 'crm-employees';

export type OrderStatus = 'pending' | 'process' | 'completed' | 'cancelled';

export type SACheckResult = 'ok' | 'perhatian' | 'segera' | '';

export interface SACheckItem {
  id: string;
  label: string;
  result: SACheckResult;
  catatan: string;
}

export interface SPKSparepart {
  id: string;
  nama: string;
  qty: number;
  satuan: string;
  hargaSatuan: number;
}

export interface SPKJasa {
  id: string;
  nama: string;
  harga: number;
}

export type EmployeeRole = 'SA' | 'FA' | 'Mekanik' | 'Foreman' | 'Kasir' | 'Manager';

export interface EmployeeItem {
  id: string;
  name: string;
  nik?: string;
  role: EmployeeRole;
  phone: string;
  email?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface SPKDocument {
  id: string;
  spkNumber: string;
  createdAt: string;
  updatedAt?: string;
  status: 'draft' | 'sa-check' | 'nota' | 'lpa' | 'selesai';

  // Pelanggan & kendaraan
  customerId: string;
  customerName: string;
  phone: string;
  address: string;
  carBrand: string;
  carModel: string;
  carYear: string;
  licensePlate: string;
  transmission: string;
  carColor: string;
  kilometer?: string;
  noRangka?: string;
  noMesin?: string;
  fuelType?: string;
  keluhan?: string;

  // Staf Penanggung Jawab
  saId?: string;
  saName: string;
  faId?: string;
  faName?: string;
  mekanikId?: string;
  mekanikName: string;
  kasirId?: string;
  kasirName?: string;

  // Step 2 — SA Check
  saCheckEksterior: SACheckItem[];
  saCheckInterior: SACheckItem[];
  saCheckMesin: SACheckItem[];
  saCheckKakiKaki: SACheckItem[];
  saAdvisorName: string;
  saCatatanUmum: string;

  // Step 3 — Nota Sparepart & Jasa
  spareparts: SPKSparepart[];
  jasaList: SPKJasa[];
  diskon: number;
  pajakPersen: number;

  // Step 4 — LPA
  lpaChecklist: SACheckItem[];
  lpaTeknisi: string;
  lpaTestDriveOk: boolean;
  lpaCatatan: string;

  // Step 5 — Nota Akhir & Garansi
  metodePembayaran: 'cash' | 'transfer' | 'kredit';
  grandTotal: number;
  dibayar?: number;
  kembalian?: number;
  garansiServis?: string;
  nextServiceKm?: string;
  nextServiceDate?: string;
}


export type CustomerSource = 'Rekomendasi Teman/Keluarga' | 'Google Maps' | 'Instagram' | 'TikTok' | 'WhatsApp' | 'Walk-in Langsung' | 'Facebook' | 'Lainnya';
export type CustomerType = 'BARU' | 'LAMA';

export interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  carBrand: string;
  carModel: string;
  carYear: string;
  licensePlate: string;
  transmission?: 'Manual' | 'Matic';
  carColor?: string;
  vinNumber?: string;
  engineNumber?: string;
  fuelType?: 'Bensin' | 'Diesel' | 'Hybrid' | 'EV';
  notes?: string;
  totalOrdersCount?: number;
  totalSpent?: number;
  // Enhanced profile fields
  source?: CustomerSource;
  customerType?: CustomerType;
  lastServiceDate?: string;
  firstServiceDate?: string;
  createdAt: string;
  updatedAt?: string;
}

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

export interface CRMOrder extends BookingData {
  id: string;
  createdAt: string;
  status: OrderStatus;
  totalPrice?: number;
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
