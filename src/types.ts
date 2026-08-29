export type PageType = 
  // Landing
  | 'beranda' | 'layanan' | 'proses' | 'artikel' | 'artikel-detail' | 'testimoni' | 'about' | 'booking'
  // CRM Auth
  | 'crm-login'
  // CRM Core
  | 'crm-dashboard' | 'crm-orders' | 'crm-spk-create' | 'crm-lpa'
  // Customers
  | 'crm-customers' | 'crm-customer-detail' | 'crm-customer-create' | 'crm-customer-edit'
  | 'crm-customer-register' | 'crm-customer-profile' | 'crm-customer-mutation'
  | 'crm-customer-analysis' | 'crm-customer-rfm' | 'crm-customer-retention'
  // Staff / HRD
  | 'crm-employees'
  // Inventory / Products
  | 'crm-inventory'
  // Purchasing
  | 'crm-purchasing'
  // Monitoring / Reports
  | 'crm-monitoring'
  // Activity Plan
  | 'crm-activity-plan'
  // Discussion
  | 'crm-discussion';

// ─── Inventory / Kelola Produk & Jasa ───────────────────────────────────────
export type ProductCategory = 
  | 'SERVICE AC' | 'TUNE UP' | 'GANTI OLI' | 'REM & KAMPAS' | 'KELISTRIKAN'
  | 'KAKI-KAKI' | 'MESIN' | 'TRANSMISI' | 'BODY & CAT' | 'SPAREPART UMUM'
  | 'JASA LAINNYA';

export interface InventoryItem {
  id: string;
  skuCode: string;
  name: string;
  category: ProductCategory | string;
  type: 'sparepart' | 'jasa';
  unit: string;         // pcs, liter, set, dll
  stock: number;        // qty stok (untuk sparepart)
  minStock: number;     // batas stok minimum
  buyPrice: number;     // HPP / harga beli
  sellPrice: number;    // harga jual
  durationMinutes?: number;  // durasi pengerjaan (untuk jasa)
  warrantyDays?: number;     // garansi (hari)
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Purchase Order ──────────────────────────────────────────────────────────
export type POStatus = 'draft' | 'ordered' | 'received' | 'cancelled';

export interface POItem {
  id: string;
  inventoryId: string;
  name: string;
  qty: number;
  unit: string;
  buyPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  supplierPhone?: string;
  status: POStatus;
  items: POItem[];
  totalAmount: number;
  notes?: string;
  orderedAt?: string;
  receivedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Activity Plan / DAP ─────────────────────────────────────────────────────
export interface ActivityPlanTask {
  id: string;
  title: string;
  target: number;
  achieved: number;
  unit: string;
}

export interface ActivityPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  date: string;   // YYYY-MM-DD
  tasks: ActivityPlanTask[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Discussion / Chat Internal ──────────────────────────────────────────────
export interface DiscussionMessage {
  id: string;
  userId: string;
  userName: string;
  userInitial: string;
  message: string;
  createdAt: string;
}

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
  // Detailed SPK & Staff Fields
  spkNumber?: string;
  saId?: string;
  saName?: string;
  mekanikId?: string;
  mekanikName?: string;
  faId?: string;
  faName?: string;
  kasirId?: string;
  kasirName?: string;
  customerType?: CustomerType;
  kilometer?: string;
  noRangka?: string;
  noMesin?: string;
  fuelType?: string;
  spareparts?: SPKSparepart[];
  jasaList?: SPKJasa[];
  saCheckEksterior?: SACheckItem[];
  saCheckInterior?: SACheckItem[];
  saCheckMesin?: SACheckItem[];
  saCheckKakiKaki?: SACheckItem[];
  lpaChecklist?: SACheckItem[];
  saCatatanUmum?: string;
  lpaCatatan?: string;
  diskon?: number;
  pajakPersen?: number;
  metodePembayaran?: 'cash' | 'transfer' | 'kredit';
  dibayar?: number;
  kembalian?: number;
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
