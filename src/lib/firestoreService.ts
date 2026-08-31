import { supabase } from './supabase';
import {
  CRMOrder,
  OrderStatus,
  CustomerItem,
  EmployeeItem,
  InventoryItem,
  PurchaseOrder,
  ActivityPlan,
  DiscussionMessage,
  ArticleItem
} from '../types';
import { MASTER_JASA_DATA } from '../data/masterJasa';
import { ARTICLES_DATA } from '../data/mockData';

// LocalStorage cache keys
const LOCAL_CUSTOMERS_KEY = 'fhrcar_customers_store';
const LOCAL_ORDERS_KEY = 'fhrcar_orders_store';
const LOCAL_EMPLOYEES_KEY = 'fhrcar_employees_store';
const LOCAL_INVENTORY_KEY = 'fhrcar_inventory_store';
const LOCAL_PO_KEY = 'fhrcar_po_store';
const LOCAL_ACTIVITY_KEY = 'fhrcar_activity_store';
const LOCAL_ARTICLES_KEY = 'fhrcar_articles_store';

// Helper to remove undefined fields
function sanitizeData<T extends object>(data: T): any {
  const clean: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

// ═══════════════════════════════════════════════════════════════════
// 1. ORDERS / SPK SERVICE
// ═══════════════════════════════════════════════════════════════════

function getLocalOrders(): CRMOrder[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: CRMOrder[]) {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('fhrcar_orders_updated', { detail: orders }));
  } catch (e) {
    console.error('Failed to save orders locally:', e);
  }
}

// Map Supabase DB row to CRMOrder model
function mapOrderFromRow(row: any): CRMOrder {
  const raw = row.raw_data || {};
  return {
    ...raw,
    id: row.id || raw.id,
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || raw.updatedAt,
    status: (row.status || raw.status || 'pending') as OrderStatus,
    totalPrice: Number(row.total_price ?? raw.totalPrice ?? 0),
    customerName: row.customer_name || raw.customerName || '',
    phone: row.phone || raw.phone || '',
    serviceType: row.service_type || raw.serviceType || '',
    carBrand: row.car_brand || raw.carBrand || '',
    carModel: row.car_model || raw.carModel || '',
    carYear: row.car_year || raw.carYear || '',
    licensePlate: row.license_plate || raw.licensePlate || '',
    locationAddress: row.location_address || raw.locationAddress || '',
    isEmergency: Boolean(row.is_emergency ?? raw.isEmergency),
    notes: row.notes || raw.notes || '',
    serviceDate: row.service_date || raw.serviceDate,
    serviceTime: row.service_time || raw.serviceTime,
    serviceLocation: row.service_location || raw.serviceLocation,
    saName: row.sa_name || raw.saName,
    saId: row.sa_id || raw.saId,
    faName: row.fa_name || raw.faName,
    faId: row.fa_id || raw.faId,
    mekanikName: row.mekanik_name || raw.mekanikName,
    mekanikId: row.mekanik_id || raw.mekanikId,
    kasirName: row.kasir_name || raw.kasirName,
    kasirId: row.kasir_id || raw.kasirId,
    kilometer: row.kilometer || raw.kilometer,
    noRangka: row.no_rangka || raw.noRangka,
    noMesin: row.no_mesin || raw.noMesin,
    fuelType: row.fuel_type || raw.fuelType || 'Bensin',
    spareparts: row.spareparts || raw.spareparts || [],
    jasaList: row.jasa_list || raw.jasaList || [],
    saCheckEksterior: row.sa_check_eksterior || raw.saCheckEksterior || [],
    saCheckInterior: row.sa_check_interior || raw.saCheckInterior || [],
    saCheckMesin: row.sa_check_mesin || raw.saCheckMesin || [],
    saCheckKakiKaki: row.sa_check_kaki_kaki || raw.saCheckKakiKaki || [],
    lpaChecklist: row.lpa_checklist || raw.lpaChecklist || [],
    saCatatanUmum: row.sa_catatan_umum || raw.saCatatanUmum || '',
    lpaCatatan: row.lpa_catatan || raw.lpaCatatan || '',
    diskon: Number(row.diskon ?? raw.diskon ?? 0),
    pajakPersen: Number(row.pajak_persen ?? raw.pajakPersen ?? 0),
    metodePembayaran: row.metode_pembayaran || raw.metodePembayaran || 'cash',
    dibayar: Number(row.dibayar ?? raw.dibayar ?? 0),
    kembalian: Number(row.kembalian ?? raw.kembalian ?? 0),
    customerType: row.customer_type || raw.customerType || 'BARU',
    customerId: row.customer_id || raw.customerId,
    spkNumber: row.spk_number || raw.spkNumber || row.id,
  };
}

// Map CRMOrder model to Supabase DB row
function mapOrderToRow(order: Partial<CRMOrder>) {
  return {
    id: order.id,
    spk_number: order.spkNumber || order.id,
    status: order.status,
    total_price: order.totalPrice,
    customer_name: order.customerName,
    phone: order.phone,
    service_type: order.serviceType,
    car_brand: order.carBrand,
    car_model: order.carModel,
    car_year: order.carYear,
    license_plate: order.licensePlate,
    location_address: order.locationAddress,
    is_emergency: order.isEmergency,
    notes: order.notes,
    service_date: order.serviceDate,
    service_time: order.serviceTime,
    service_location: order.serviceLocation,
    sa_name: order.saName,
    sa_id: order.saId,
    fa_name: order.faName,
    fa_id: order.faId,
    mekanik_name: order.mekanikName,
    mekanik_id: order.mekanikId,
    kasir_name: order.kasirName,
    kasir_id: order.kasirId,
    kilometer: order.kilometer,
    no_rangka: order.noRangka,
    no_mesin: order.noMesin,
    fuel_type: order.fuelType,
    spareparts: order.spareparts || [],
    jasa_list: order.jasaList || [],
    sa_check_eksterior: order.saCheckEksterior || [],
    sa_check_interior: order.saCheckInterior || [],
    sa_check_mesin: order.saCheckMesin || [],
    sa_check_kaki_kaki: order.saCheckKakiKaki || [],
    lpa_checklist: order.lpaChecklist || [],
    sa_catatan_umum: order.saCatatanUmum,
    lpa_catatan: order.lpaCatatan,
    diskon: order.diskon,
    pajak_persen: order.pajakPersen,
    metode_pembayaran: order.metodePembayaran,
    dibayar: order.dibayar,
    kembalian: order.kembalian,
    customer_type: order.customerType,
    customer_id: order.customerId,
    raw_data: order,
    updated_at: new Date().toISOString(),
  };
}

export function subscribeToOrders(callback: (orders: CRMOrder[]) => void): () => void {
  const initialLocal = getLocalOrders();
  if (initialLocal.length > 0) {
    callback(initialLocal);
  }

  const handleLocalUpdate = (e: any) => {
    if (e.detail) callback(e.detail);
  };
  window.addEventListener('fhrcar_orders_updated', handleLocalUpdate);

  // Initial fetch from Supabase
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = data.map(mapOrderFromRow);
        saveLocalOrders(mapped);
        callback(mapped);
      } else {
        callback(getLocalOrders());
      }
    } catch (err) {
      console.warn('[Supabase] Orders fetch fallback to local:', err);
      callback(getLocalOrders());
    }
  };

  fetchOrders();

  // Realtime subscription via Supabase Channel
  const channel = supabase
    .channel('public:orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      fetchOrders();
    })
    .subscribe();

  return () => {
    window.removeEventListener('fhrcar_orders_updated', handleLocalUpdate);
    supabase.removeChannel(channel);
  };
}

export async function addOrder(order: Omit<CRMOrder, 'id' | 'createdAt'>): Promise<string> {
  const cleanOrder = sanitizeData(order);
  const tempId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const now = new Date().toISOString();
  const newOrder: CRMOrder = {
    id: tempId,
    ...cleanOrder,
    createdAt: now,
  };

  const list = getLocalOrders();
  list.unshift(newOrder);
  saveLocalOrders(list);

  try {
    const row = mapOrderToRow({ ...newOrder, id: tempId });
    const { data, error } = await supabase
      .from('orders')
      .insert([{ ...row, created_at: now }])
      .select()
      .single();

    if (error) throw error;
    if (data?.id) {
      const updated = list.map(o => o.id === tempId ? { ...o, id: data.id } : o);
      saveLocalOrders(updated);
      return data.id;
    }
  } catch (error) {
    console.warn('[Supabase] addOrder cloud sync failed, saved locally:', error);
  }
  return tempId;
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
  const list = getLocalOrders();
  const now = new Date().toISOString();
  const updated = list.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: now } : o);
  saveLocalOrders(updated);

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: now })
      .eq('id', orderId);
    if (error) throw error;
  } catch (error) {
    console.warn('[Supabase] updateOrderStatus cloud fallback:', error);
  }
}

export async function updateOrder(orderId: string, fields: Partial<CRMOrder>): Promise<void> {
  const cleanFields = sanitizeData(fields);
  const now = new Date().toISOString();

  const list = getLocalOrders();
  const existing = list.find(o => o.id === orderId) || {} as CRMOrder;
  const merged = { ...existing, ...cleanFields, updatedAt: now };
  const updated = list.map(o => o.id === orderId ? merged : o);
  saveLocalOrders(updated);

  try {
    const row = mapOrderToRow(merged);
    const { error } = await supabase
      .from('orders')
      .update(row)
      .eq('id', orderId);
    if (error) throw error;
  } catch (error) {
    console.warn('[Supabase] updateOrder cloud fallback:', error);
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  const list = getLocalOrders();
  const filtered = list.filter(o => o.id !== orderId);
  saveLocalOrders(filtered);

  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    if (error) throw error;
  } catch (error) {
    console.warn('[Supabase] deleteOrder cloud fallback:', error);
  }
}

export async function addSPK(spkData: any): Promise<string> {
  const clean = sanitizeData(spkData);
  const tempId = spkData.spkNumber || ('SPK-' + Math.random().toString(36).substring(2, 9).toUpperCase());
  const now = new Date().toISOString();

  const newOrder: CRMOrder = {
    id: tempId,
    createdAt: spkData.createdAt || now,
    status: spkData.status === 'draft' ? 'process' : (spkData.status === 'selesai' ? 'completed' : 'process'),
    totalPrice: spkData.grandTotal || spkData.totalPrice || 0,
    customerName: spkData.customerName || 'Pelanggan',
    phone: spkData.phone || '',
    serviceType: spkData.jasaList?.[0]?.nama || 'Servis & Perbaikan SPK',
    carBrand: spkData.carBrand || 'Toyota',
    carModel: spkData.carModel || '',
    carYear: spkData.carYear || '2022',
    licensePlate: spkData.licensePlate || '',
    locationAddress: spkData.address || '',
    isEmergency: false,
    notes: spkData.keluhan || spkData.saCatatanUmum || '',
    saName: spkData.saName || '',
    saId: spkData.saId || '',
    faName: spkData.faName || '',
    faId: spkData.faId || '',
    mekanikName: spkData.mekanikName || '',
    mekanikId: spkData.mekanikId || '',
    kasirName: spkData.kasirName || '',
    kasirId: spkData.kasirId || '',
    kilometer: spkData.kilometer || '',
    noRangka: spkData.noRangka || '',
    noMesin: spkData.noMesin || '',
    fuelType: spkData.fuelType || 'Bensin',
    spareparts: spkData.spareparts || [],
    jasaList: spkData.jasaList || [],
    saCheckEksterior: spkData.saCheckEksterior || [],
    saCheckInterior: spkData.saCheckInterior || [],
    saCheckMesin: spkData.saCheckMesin || [],
    saCheckKakiKaki: spkData.saCheckKakiKaki || [],
    lpaChecklist: spkData.lpaChecklist || [],
    saCatatanUmum: spkData.saCatatanUmum || '',
    lpaCatatan: spkData.lpaCatatan || '',
    diskon: spkData.diskon || 0,
    pajakPersen: spkData.pajakPersen || 0,
    metodePembayaran: spkData.metodePembayaran || 'cash',
    dibayar: spkData.dibayar || 0,
    kembalian: spkData.kembalian || 0,
    customerType: spkData.customerType || 'BARU',
    spkNumber: spkData.spkNumber || tempId,
  };

  const list = getLocalOrders();
  list.unshift(newOrder);
  saveLocalOrders(list);

  try {
    const row = mapOrderToRow({ ...clean, ...newOrder });
    const { data, error } = await supabase
      .from('orders')
      .insert([{ ...row, created_at: now }])
      .select()
      .single();

    if (error) throw error;
    if (data?.id) {
      const updated = list.map(o => o.id === tempId ? { ...o, id: data.id } : o);
      saveLocalOrders(updated);
      return data.id;
    }
  } catch (error) {
    console.warn('[Supabase] addSPK cloud save failed, saved locally:', error);
  }
  return tempId;
}

export async function updateSPK(spkId: string, spkData: any): Promise<void> {
  const clean = sanitizeData(spkData);
  const now = new Date().toISOString();

  const list = getLocalOrders();
  const updated = list.map(o => {
    if (o.id === spkId) {
      return {
        ...o,
        ...clean,
        status: spkData.status === 'draft' ? 'process' : (spkData.status === 'selesai' ? 'completed' : o.status),
        totalPrice: spkData.grandTotal || spkData.totalPrice || o.totalPrice,
        customerName: spkData.customerName || o.customerName,
        phone: spkData.phone || o.phone,
        carBrand: spkData.carBrand || o.carBrand,
        carModel: spkData.carModel || o.carModel,
        carYear: spkData.carYear || o.carYear,
        licensePlate: spkData.licensePlate || o.licensePlate,
        locationAddress: spkData.address || o.locationAddress,
        notes: spkData.keluhan || spkData.saCatatanUmum || o.notes,
        saName: spkData.saName || o.saName,
        saId: spkData.saId || o.saId,
        faName: spkData.faName || o.faName,
        faId: spkData.faId || o.faId,
        mekanikName: spkData.mekanikName || o.mekanikName,
        mekanikId: spkData.mekanikId || o.mekanikId,
        kasirName: spkData.kasirName || o.kasirName,
        kasirId: spkData.kasirId || o.kasirId,
        kilometer: spkData.kilometer !== undefined ? spkData.kilometer : o.kilometer,
        noRangka: spkData.noRangka !== undefined ? spkData.noRangka : o.noRangka,
        noMesin: spkData.noMesin !== undefined ? spkData.noMesin : o.noMesin,
        fuelType: spkData.fuelType || o.fuelType,
        spareparts: spkData.spareparts || o.spareparts,
        jasaList: spkData.jasaList || o.jasaList,
        saCheckEksterior: spkData.saCheckEksterior || o.saCheckEksterior,
        saCheckInterior: spkData.saCheckInterior || o.saCheckInterior,
        saCheckMesin: spkData.saCheckMesin || o.saCheckMesin,
        saCheckKakiKaki: spkData.saCheckKakiKaki || o.saCheckKakiKaki,
        lpaChecklist: spkData.lpaChecklist || o.lpaChecklist,
        saCatatanUmum: spkData.saCatatanUmum || o.saCatatanUmum,
        lpaCatatan: spkData.lpaCatatan || o.lpaCatatan,
        diskon: spkData.diskon !== undefined ? spkData.diskon : o.diskon,
        pajakPersen: spkData.pajakPersen !== undefined ? spkData.pajakPersen : o.pajakPersen,
        metodePembayaran: spkData.metodePembayaran || o.metodePembayaran,
        dibayar: spkData.dibayar !== undefined ? spkData.dibayar : o.dibayar,
        kembalian: spkData.kembalian !== undefined ? spkData.kembalian : o.kembalian,
        updatedAt: now,
      };
    }
    return o;
  });
  saveLocalOrders(updated);

  try {
    const row = mapOrderToRow({ ...clean, id: spkId, updatedAt: now });
    const { error } = await supabase
      .from('orders')
      .update(row)
      .eq('id', spkId);
    if (error) throw error;
  } catch (error) {
    console.warn('[Supabase] updateSPK cloud update fallback:', error);
  }
}

export async function deleteSPK(spkId: string): Promise<void> {
  await deleteOrder(spkId);
}

export async function seedInitialOrders(orders: Omit<CRMOrder, 'id'>[]): Promise<void> {
  for (const order of orders) {
    await addOrder(order);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 2. CUSTOMERS SERVICE
// ═══════════════════════════════════════════════════════════════════

function getLocalCustomers(): CustomerItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOMERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomers(customers: CustomerItem[]) {
  try {
    localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(customers));
    window.dispatchEvent(new CustomEvent('fhrcar-customers-updated'));
  } catch (e) {
    console.warn('[Storage] Could not save customers to localStorage:', e);
  }
}

function mapCustomerFromRow(row: any): CustomerItem {
  const raw = row.raw_data || {};
  return {
    ...raw,
    id: row.id || raw.id,
    name: row.name || raw.name || '',
    phone: row.phone || raw.phone || '',
    email: row.email || raw.email || '',
    address: row.address || raw.address || '',
    carBrand: row.car_brand || raw.carBrand || '',
    carModel: row.car_model || raw.carModel || '',
    carYear: row.car_year || raw.carYear || '',
    licensePlate: row.license_plate || raw.licensePlate || '',
    vinNumber: row.vin_number || raw.vinNumber || '',
    engineNumber: row.engine_number || raw.engineNumber || '',
    fuelType: row.fuel_type || raw.fuelType || 'Bensin',
    transmission: row.transmission || raw.transmission || 'Matic',
    customerType: row.customer_type || raw.customerType || 'BARU',
    notes: row.notes || raw.notes || '',
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || raw.updatedAt,
  };
}

function mapCustomerToRow(customer: Partial<CustomerItem>) {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    car_brand: customer.carBrand,
    car_model: customer.carModel,
    car_year: customer.carYear,
    license_plate: customer.licensePlate,
    vin_number: customer.vinNumber,
    engine_number: customer.engineNumber,
    fuel_type: customer.fuelType,
    transmission: customer.transmission,
    customer_type: customer.customerType || 'BARU',
    notes: customer.notes,
    raw_data: customer,
    updated_at: new Date().toISOString(),
  };
}

export function subscribeToCustomers(callback: (customers: CustomerItem[]) => void): () => void {
  const localList = getLocalCustomers();
  if (localList.length > 0) {
    callback(localList);
  }

  const handleLocalUpdate = () => {
    callback(getLocalCustomers());
  };
  window.addEventListener('fhrcar-customers-updated', handleLocalUpdate);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = data.map(mapCustomerFromRow);
        saveLocalCustomers(mapped);
        callback(mapped);
      } else {
        callback(getLocalCustomers());
      }
    } catch (err) {
      console.warn('[Supabase] Customers fetch fallback:', err);
      callback(getLocalCustomers());
    }
  };

  fetchCustomers();

  const channel = supabase
    .channel('public:customers')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
      fetchCustomers();
    })
    .subscribe();

  return () => {
    window.removeEventListener('fhrcar-customers-updated', handleLocalUpdate);
    supabase.removeChannel(channel);
  };
}

export async function addCustomer(customer: Omit<CustomerItem, 'id' | 'createdAt'>): Promise<string> {
  const cleanCustomer = sanitizeData(customer);
  const tempId = 'CUST-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const now = new Date().toISOString();
  const newCustomerObj: CustomerItem = {
    id: tempId,
    ...cleanCustomer,
    createdAt: now,
    updatedAt: now,
  };

  const currentList = getLocalCustomers();
  currentList.unshift(newCustomerObj);
  saveLocalCustomers(currentList);

  try {
    const row = mapCustomerToRow(newCustomerObj);
    const { data, error } = await supabase
      .from('customers')
      .insert([{ ...row, created_at: now }])
      .select()
      .single();

    if (error) throw error;
    if (data?.id) {
      const updatedList = currentList.map(c => c.id === tempId ? { ...c, id: data.id } : c);
      saveLocalCustomers(updatedList);
      return data.id;
    }
  } catch (error) {
    console.warn('[Supabase] addCustomer cloud sync failed, saved locally:', error);
  }
  return tempId;
}

export async function updateCustomer(customerId: string, fields: Partial<CustomerItem>): Promise<void> {
  const cleanFields = sanitizeData(fields);
  const now = new Date().toISOString();

  const currentList = getLocalCustomers();
  const existing = currentList.find(c => c.id === customerId) || {} as CustomerItem;
  const merged = { ...existing, ...cleanFields, updatedAt: now };
  const updatedList = currentList.map(c => c.id === customerId ? merged : c);
  saveLocalCustomers(updatedList);

  try {
    const row = mapCustomerToRow(merged);
    const { error } = await supabase
      .from('customers')
      .update(row)
      .eq('id', customerId);
    if (error) throw error;
  } catch (error) {
    console.warn('[Supabase] updateCustomer cloud update fallback:', error);
  }
}

export async function deleteCustomer(customerId: string): Promise<void> {
  const currentList = getLocalCustomers();
  const updatedList = currentList.filter(c => c.id !== customerId);
  saveLocalCustomers(updatedList);

  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);
    if (error) throw error;
  } catch (error) {
    console.warn('[Supabase] deleteCustomer cloud delete fallback:', error);
  }
}

export async function seedInitialCustomers(customers: Omit<CustomerItem, 'id'>[]): Promise<void> {
  for (const c of customers) {
    await addCustomer(c);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 3. EMPLOYEES / KARYAWAN SERVICE (100% Real from Database)
// ═══════════════════════════════════════════════════════════════════

export const DEFAULT_EMPLOYEES: EmployeeItem[] = [];

function getLocalEmployees(): EmployeeItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_EMPLOYEES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // If old cached dummy data exists (emp-1 to emp-9), discard it
    if (Array.isArray(parsed) && parsed.some(e => e.id === 'emp-1' && e.name === 'Budi Santoso')) {
      localStorage.removeItem(LOCAL_EMPLOYEES_KEY);
      return [];
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalEmployees(employees: EmployeeItem[]) {
  try {
    localStorage.setItem(LOCAL_EMPLOYEES_KEY, JSON.stringify(employees));
    window.dispatchEvent(new CustomEvent('fhrcar_employees_updated', { detail: employees }));
  } catch (e) {
    console.error('Failed to save employees locally:', e);
  }
}

function mapEmployeeFromRow(row: any): EmployeeItem {
  const raw = row.raw_data || {};
  return {
    ...raw,
    id: row.id || raw.id,
    name: row.name || raw.name || '',
    nik: row.nik || raw.nik || '',
    role: row.role || raw.role || 'Mekanik',
    phone: row.phone || raw.phone || '',
    email: row.email || raw.email || '',
    status: row.status || raw.status || 'active',
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || raw.updatedAt,
  };
}

function mapEmployeeToRow(emp: Partial<EmployeeItem>) {
  return {
    id: emp.id,
    name: emp.name,
    nik: emp.nik,
    role: emp.role,
    phone: emp.phone,
    email: emp.email,
    status: emp.status || 'active',
    raw_data: emp,
    updated_at: new Date().toISOString(),
  };
}

export function subscribeToEmployees(
  onUpdate: (employees: EmployeeItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const initialLocal = getLocalEmployees();
  onUpdate(initialLocal);

  const handleLocalUpdate = (e: any) => {
    if (e.detail) onUpdate(e.detail);
  };
  window.addEventListener('fhrcar_employees_updated', handleLocalUpdate);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = data.map(mapEmployeeFromRow);
        saveLocalEmployees(mapped);
        onUpdate(mapped);
      } else {
        saveLocalEmployees([]);
        onUpdate([]);
      }
    } catch (err: any) {
      console.warn('[Supabase] Employees fetch fallback:', err);
      onUpdate(getLocalEmployees());
      if (onError) onError(err);
    }
  };

  fetchEmployees();

  const channel = supabase
    .channel('public:employees')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => {
      fetchEmployees();
    })
    .subscribe();

  return () => {
    window.removeEventListener('fhrcar_employees_updated', handleLocalUpdate);
    supabase.removeChannel(channel);
  };
}

export async function addEmployee(employee: Omit<EmployeeItem, 'id' | 'createdAt'>): Promise<string> {
  const cleanEmp = sanitizeData(employee);
  const now = new Date().toISOString();
  const tempId = 'emp_' + Math.random().toString(36).substring(2, 9);
  const newEmp: EmployeeItem = {
    id: tempId,
    ...cleanEmp,
    createdAt: now,
    updatedAt: now,
  };

  const localList = getLocalEmployees();
  localList.unshift(newEmp);
  saveLocalEmployees(localList);

  try {
    const row = mapEmployeeToRow(newEmp);
    const { data, error } = await supabase
      .from('employees')
      .insert([{ ...row, created_at: now }])
      .select()
      .single();

    if (error) throw error;
    if (data?.id) {
      const updated = localList.map(e => e.id === tempId ? { ...e, id: data.id } : e);
      saveLocalEmployees(updated);
      return data.id;
    }
  } catch (error) {
    console.warn('[Supabase] Employee cloud add failed, saved locally:', error);
  }
  return tempId;
}

export async function updateEmployee(employeeId: string, data: Partial<EmployeeItem>): Promise<void> {
  const cleanData = sanitizeData(data);
  const now = new Date().toISOString();

  const localList = getLocalEmployees();
  const existing = localList.find(e => e.id === employeeId) || {} as EmployeeItem;
  const merged = { ...existing, ...cleanData, updatedAt: now };
  const updated = localList.map(e => e.id === employeeId ? merged : e);
  saveLocalEmployees(updated);

  try {
    const row = mapEmployeeToRow(merged);
    const { error } = await supabase
      .from('employees')
      .update(row)
      .eq('id', employeeId);
    if (error) throw error;
  } catch (error) {
    console.warn('[Supabase] Employee cloud update failed, updated locally:', error);
  }
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  const localList = getLocalEmployees();
  const filtered = localList.filter(e => e.id !== employeeId);
  saveLocalEmployees(filtered);

  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId);
    if (error) throw error;
  } catch (error) {
    console.warn('[Supabase] Employee cloud delete failed, deleted locally:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 4. INVENTORY / KELOLA PRODUK & JASA (100% Real from Database)
// ═══════════════════════════════════════════════════════════════════

function getLocalInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_INVENTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalInventory(items: InventoryItem[]) {
  try {
    localStorage.setItem(LOCAL_INVENTORY_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('fhrcar_inventory_updated', { detail: items }));
  } catch (e) {
    console.warn('Failed to save inventory:', e);
  }
}

function mapInventoryFromRow(row: any): InventoryItem {
  const raw = row.raw_data || {};
  return {
    ...raw,
    id: row.id || raw.id,
    skuCode: row.sku_code || raw.skuCode || '',
    name: row.name || raw.name || '',
    category: row.category || raw.category || '',
    type: (row.type || raw.type || 'sparepart') as any,
    unit: row.unit || raw.unit || 'pcs',
    stock: Number(row.stock ?? raw.stock ?? 0),
    minStock: Number(row.min_stock ?? raw.minStock ?? 0),
    buyPrice: Number(row.buy_price ?? raw.buyPrice ?? 0),
    sellPrice: Number(row.sell_price ?? raw.sellPrice ?? 0),
    durationMinutes: row.duration_minutes ? Number(row.duration_minutes) : raw.durationMinutes,
    warrantyDays: row.warranty_days ? Number(row.warranty_days) : raw.warrantyDays,
    notes: row.notes || raw.notes || '',
    isActive: Boolean(row.is_active ?? raw.isActive ?? true),
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || raw.updatedAt,
  };
}

function mapInventoryToRow(item: Partial<InventoryItem>) {
  return {
    id: item.id,
    sku_code: item.skuCode,
    name: item.name,
    category: item.category,
    type: item.type,
    unit: item.unit,
    stock: item.stock,
    min_stock: item.minStock,
    buy_price: item.buyPrice,
    sell_price: item.sellPrice,
    duration_minutes: item.durationMinutes,
    warranty_days: item.warrantyDays,
    notes: item.notes,
    is_active: item.isActive ?? true,
    raw_data: item,
    updated_at: new Date().toISOString(),
  };
}

export function subscribeToInventory(callback: (items: InventoryItem[]) => void): () => void {
  const local = getLocalInventory();
  if (local.length > 0) callback(local);

  const handleLocal = (e: any) => { if (e.detail) callback(e.detail); };
  window.addEventListener('fhrcar_inventory_updated', handleLocal);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = data.map(mapInventoryFromRow);
        saveLocalInventory(mapped);
        callback(mapped);
      } else {
        const local = getLocalInventory();
        if (local.length === 0) {
          const now = new Date().toISOString();
          const initial = MASTER_JASA_DATA.map((j, idx) => ({
            ...j,
            id: `INV-${String(idx + 1).padStart(3, '0')}`,
            createdAt: now,
          })) as InventoryItem[];
          saveLocalInventory(initial);
          callback(initial);
        } else {
          callback(local);
        }
      }
    } catch {
      const local = getLocalInventory();
      if (local.length === 0) {
        const now = new Date().toISOString();
        const initial = MASTER_JASA_DATA.map((j, idx) => ({
          ...j,
          id: `INV-${String(idx + 1).padStart(3, '0')}`,
          createdAt: now,
        })) as InventoryItem[];
        saveLocalInventory(initial);
        callback(initial);
      } else {
        callback(local);
      }
    }
  };

  fetchInventory();

  const channel = supabase
    .channel('public:inventory')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
      fetchInventory();
    })
    .subscribe();

  return () => {
    window.removeEventListener('fhrcar_inventory_updated', handleLocal);
    supabase.removeChannel(channel);
  };
}

export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt'>): Promise<string> {
  const tempId = 'INV-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const now = new Date().toISOString();
  const newItem: InventoryItem = { ...item, id: tempId, createdAt: now };
  const list = getLocalInventory();
  list.unshift(newItem);
  saveLocalInventory(list);

  try {
    const row = mapInventoryToRow(newItem);
    const { data, error } = await supabase
      .from('inventory')
      .insert([{ ...row, created_at: now }])
      .select()
      .single();

    if (error) throw error;
    if (data?.id) {
      const updated = list.map(i => i.id === tempId ? { ...i, id: data.id } : i);
      saveLocalInventory(updated);
      return data.id;
    }
  } catch {}
  return tempId;
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
  const list = getLocalInventory();
  const existing = list.find(i => i.id === id) || {} as InventoryItem;
  const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  const updated = list.map(i => i.id === id ? merged : i);
  saveLocalInventory(updated);

  try {
    const row = mapInventoryToRow(merged);
    await supabase.from('inventory').update(row).eq('id', id);
  } catch (e) {
    console.warn('updateInventoryItem cloud error:', e);
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const list = getLocalInventory();
  saveLocalInventory(list.filter(i => i.id !== id));
  try {
    await supabase.from('inventory').delete().eq('id', id);
  } catch (e) {
    console.warn('deleteInventoryItem:', e);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 5. PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════════

function getLocalPO(): PurchaseOrder[] {
  try {
    const raw = localStorage.getItem(LOCAL_PO_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPO(list: PurchaseOrder[]) {
  try {
    localStorage.setItem(LOCAL_PO_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('fhrcar_po_updated', { detail: list }));
  } catch (e) {
    console.warn('Failed to save PO:', e);
  }
}

function mapPOFromRow(row: any): PurchaseOrder {
  const raw = row.raw_data || {};
  return {
    ...raw,
    id: row.id || raw.id,
    poNumber: row.po_number || raw.poNumber || '',
    supplier: row.supplier || raw.supplier || '',
    supplierPhone: row.supplier_phone || raw.supplierPhone,
    status: row.status || raw.status || 'draft',
    items: row.items || raw.items || [],
    totalAmount: Number(row.total_amount ?? raw.totalAmount ?? 0),
    notes: row.notes || raw.notes,
    orderedAt: row.ordered_at || raw.orderedAt,
    receivedAt: row.received_at || raw.receivedAt,
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || raw.updatedAt,
  };
}

function mapPOToRow(po: Partial<PurchaseOrder>) {
  return {
    id: po.id,
    po_number: po.poNumber,
    supplier: po.supplier,
    supplier_phone: po.supplierPhone,
    status: po.status,
    items: po.items || [],
    total_amount: po.totalAmount,
    notes: po.notes,
    ordered_at: po.orderedAt,
    received_at: po.receivedAt,
    raw_data: po,
    updated_at: new Date().toISOString(),
  };
}

export function subscribeToPurchaseOrders(callback: (pos: PurchaseOrder[]) => void): () => void {
  const local = getLocalPO();
  if (local.length > 0) callback(local);

  const handleLocal = (e: any) => { if (e.detail) callback(e.detail); };
  window.addEventListener('fhrcar_po_updated', handleLocal);

  const fetchPO = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        const mapped = data.map(mapPOFromRow);
        saveLocalPO(mapped);
        callback(mapped);
      } else {
        callback(getLocalPO());
      }
    } catch {
      callback(getLocalPO());
    }
  };

  fetchPO();

  const channel = supabase
    .channel('public:purchase_orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_orders' }, () => {
      fetchPO();
    })
    .subscribe();

  return () => {
    window.removeEventListener('fhrcar_po_updated', handleLocal);
    supabase.removeChannel(channel);
  };
}

export async function addPurchaseOrder(po: Omit<PurchaseOrder, 'id' | 'createdAt'>): Promise<string> {
  const tempId = 'PO-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const now = new Date().toISOString();
  const newPO: PurchaseOrder = { ...po, id: tempId, createdAt: now };
  const list = getLocalPO();
  list.unshift(newPO);
  saveLocalPO(list);

  try {
    const row = mapPOToRow(newPO);
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert([{ ...row, created_at: now }])
      .select()
      .single();

    if (error) throw error;
    if (data?.id) {
      saveLocalPO(list.map(p => p.id === tempId ? { ...p, id: data.id } : p));
      return data.id;
    }
  } catch {}
  return tempId;
}

export async function updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): Promise<void> {
  const list = getLocalPO();
  const existing = list.find(p => p.id === id) || {} as PurchaseOrder;
  const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  saveLocalPO(list.map(p => p.id === id ? merged : p));

  try {
    const row = mapPOToRow(merged);
    await supabase.from('purchase_orders').update(row).eq('id', id);
  } catch (e) {
    console.warn('updatePO:', e);
  }
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  saveLocalPO(getLocalPO().filter(p => p.id !== id));
  try {
    await supabase.from('purchase_orders').delete().eq('id', id);
  } catch (e) {
    console.warn('deletePO:', e);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 6. ACTIVITY PLANS / DAP
// ═══════════════════════════════════════════════════════════════════

function getLocalActivity(): ActivityPlan[] {
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVITY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalActivity(list: ActivityPlan[]) {
  try {
    localStorage.setItem(LOCAL_ACTIVITY_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('fhrcar_activity_updated', { detail: list }));
  } catch (e) {
    console.warn('Failed to save activity plans:', e);
  }
}

function mapActivityFromRow(row: any): ActivityPlan {
  const raw = row.raw_data || {};
  return {
    ...raw,
    id: row.id || raw.id,
    date: row.date || raw.date || '',
    title: row.title || raw.title || '',
    division: row.division || raw.division || '',
    targetUnits: Number(row.target_units ?? raw.targetUnits ?? 0),
    targetOmset: Number(row.target_omset ?? raw.targetOmset ?? 0),
    tasks: row.tasks || raw.tasks || [],
    notes: row.notes || raw.notes,
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || raw.updatedAt,
  };
}

function mapActivityToRow(plan: Partial<ActivityPlan>) {
  return {
    id: plan.id,
    date: plan.date,
    title: plan.title,
    division: plan.division,
    target_units: plan.targetUnits,
    target_omset: plan.targetOmset,
    tasks: plan.tasks || [],
    notes: plan.notes,
    raw_data: plan,
    updated_at: new Date().toISOString(),
  };
}

export function subscribeToActivityPlans(callback: (plans: ActivityPlan[]) => void): () => void {
  const local = getLocalActivity();
  if (local.length > 0) callback(local);

  const handleLocal = (e: any) => { if (e.detail) callback(e.detail); };
  window.addEventListener('fhrcar_activity_updated', handleLocal);

  const fetchActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_plans')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        const mapped = data.map(mapActivityFromRow);
        saveLocalActivity(mapped);
        callback(mapped);
      } else {
        callback(getLocalActivity());
      }
    } catch {
      callback(getLocalActivity());
    }
  };

  fetchActivity();

  const channel = supabase
    .channel('public:activity_plans')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_plans' }, () => {
      fetchActivity();
    })
    .subscribe();

  return () => {
    window.removeEventListener('fhrcar_activity_updated', handleLocal);
    supabase.removeChannel(channel);
  };
}

export async function addActivityPlan(plan: Omit<ActivityPlan, 'id' | 'createdAt'>): Promise<string> {
  const tempId = 'DAP-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  const now = new Date().toISOString();
  const newPlan: ActivityPlan = { ...plan, id: tempId, createdAt: now };
  const list = getLocalActivity();
  list.unshift(newPlan);
  saveLocalActivity(list);

  try {
    const row = mapActivityToRow(newPlan);
    const { data, error } = await supabase
      .from('activity_plans')
      .insert([{ ...row, created_at: now }])
      .select()
      .single();

    if (error) throw error;
    if (data?.id) {
      saveLocalActivity(list.map(p => p.id === tempId ? { ...p, id: data.id } : p));
      return data.id;
    }
  } catch {}
  return tempId;
}

export async function updateActivityPlan(id: string, updates: Partial<ActivityPlan>): Promise<void> {
  const list = getLocalActivity();
  const existing = list.find(p => p.id === id) || {} as ActivityPlan;
  const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  saveLocalActivity(list.map(p => p.id === id ? merged : p));

  try {
    const row = mapActivityToRow(merged);
    await supabase.from('activity_plans').update(row).eq('id', id);
  } catch (e) {
    console.warn('updateActivityPlan:', e);
  }
}

export async function deleteActivityPlan(id: string): Promise<void> {
  saveLocalActivity(getLocalActivity().filter(p => p.id !== id));
  try {
    await supabase.from('activity_plans').delete().eq('id', id);
  } catch (e) {
    console.warn('deleteActivityPlan:', e);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 7. DISCUSSION / CHAT INTERNAL
// ═══════════════════════════════════════════════════════════════════

export function subscribeToDiscussion(callback: (msgs: DiscussionMessage[]) => void): () => void {
  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        const msgs: DiscussionMessage[] = data.map(d => ({
          id: d.id,
          senderId: d.sender_id,
          senderName: d.sender_name,
          senderRole: d.sender_role,
          senderAvatar: d.sender_avatar,
          message: d.message,
          category: d.category,
          attachments: d.attachments || [],
          createdAt: d.created_at,
          ...d.raw_data,
        }));
        callback(msgs);
      }
    } catch (e) {
      console.warn('subscribeToDiscussion fetch:', e);
    }
  };

  fetchDiscussions();

  const channel = supabase
    .channel('public:discussions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'discussions' }, () => {
      fetchDiscussions();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function sendDiscussionMessage(msg: Omit<DiscussionMessage, 'id' | 'createdAt'>): Promise<void> {
  try {
    await supabase.from('discussions').insert([{
      sender_id: msg.senderId,
      sender_name: msg.senderName,
      sender_role: msg.senderRole,
      sender_avatar: msg.senderAvatar,
      message: msg.message,
      category: msg.category || 'umum',
      attachments: msg.attachments || [],
      raw_data: msg,
      created_at: new Date().toISOString(),
    }]);
  } catch (e) {
    console.warn('sendDiscussionMessage:', e);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 8. ARTICLES / CMS TIPS & ARTIKEL
// ═══════════════════════════════════════════════════════════════════

function getLocalArticles(): ArticleItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_ARTICLES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    saveLocalArticles(ARTICLES_DATA);
    return ARTICLES_DATA;
  } catch {
    return ARTICLES_DATA;
  }
}

function saveLocalArticles(items: ArticleItem[]) {
  try {
    localStorage.setItem(LOCAL_ARTICLES_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('fhrcar_articles_updated', { detail: items }));
  } catch (e) {
    console.warn('saveLocalArticles:', e);
  }
}

function mapArticleFromRow(row: any): ArticleItem {
  const raw = row.raw_data || {};
  return {
    ...raw,
    id: row.id || raw.id,
    title: row.title || raw.title || '',
    slug: row.slug || raw.slug || '',
    category: row.category || raw.category || 'Tips Otomotif',
    date: row.date || raw.date || '',
    readTime: row.read_time || raw.readTime || '3 menit',
    author: row.author || raw.author || 'Tim FHR Car',
    authorAvatar: row.author_avatar || raw.authorAvatar,
    coverImage: row.cover_image || raw.coverImage || '',
    excerpt: row.excerpt || raw.excerpt || '',
    content: row.content || raw.content || '',
    tags: row.tags || raw.tags || [],
    featured: Boolean(row.featured ?? raw.featured),
    status: row.status || raw.status || 'published',
    createdAt: row.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || raw.updatedAt,
  };
}

function mapArticleToRow(article: Partial<ArticleItem>) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    category: article.category,
    date: article.date,
    read_time: article.readTime,
    author: article.author,
    author_avatar: article.authorAvatar,
    cover_image: article.coverImage,
    excerpt: article.excerpt,
    content: article.content,
    tags: article.tags || [],
    featured: article.featured,
    status: article.status || 'published',
    raw_data: article,
    updated_at: new Date().toISOString(),
  };
}

export function subscribeToArticles(callback: (articles: ArticleItem[]) => void): () => void {
  const local = getLocalArticles();
  callback(local);

  const handleLocal = (e: any) => { if (e.detail) callback(e.detail); };
  window.addEventListener('fhrcar_articles_updated', handleLocal);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        const mapped = data.map(mapArticleFromRow);
        saveLocalArticles(mapped);
        callback(mapped);
      } else {
        callback(getLocalArticles());
      }
    } catch {
      callback(getLocalArticles());
    }
  };

  fetchArticles();

  const channel = supabase
    .channel('public:articles')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, () => {
      fetchArticles();
    })
    .subscribe();

  return () => {
    window.removeEventListener('fhrcar_articles_updated', handleLocal);
    supabase.removeChannel(channel);
  };
}

export async function addArticle(article: Omit<ArticleItem, 'id'> & { id?: string }): Promise<string> {
  const clean = sanitizeData(article);
  const articleId = article.id || 'art-' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();
  const newArt: ArticleItem = {
    ...clean,
    id: articleId,
    createdAt: now,
  } as ArticleItem;

  const list = getLocalArticles();
  const updated = [newArt, ...list.filter(a => a.id !== articleId)];
  saveLocalArticles(updated);

  try {
    const row = mapArticleToRow(newArt);
    await supabase.from('articles').insert([{ ...row, created_at: now }]);
    return articleId;
  } catch (e) {
    console.warn('addArticle cloud failed, saved local:', e);
    return articleId;
  }
}

export async function updateArticle(id: string, updates: Partial<ArticleItem>): Promise<void> {
  const list = getLocalArticles();
  const existing = list.find(a => a.id === id) || {} as ArticleItem;
  const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  const updated = list.map(a => a.id === id ? merged : a);
  saveLocalArticles(updated);

  try {
    const row = mapArticleToRow(merged);
    await supabase.from('articles').update(row).eq('id', id);
  } catch (e) {
    console.warn('updateArticle cloud failed, saved local:', e);
  }
}

export async function deleteArticle(id: string): Promise<void> {
  const list = getLocalArticles();
  const updated = list.filter(a => a.id !== id);
  saveLocalArticles(updated);

  try {
    await supabase.from('articles').delete().eq('id', id);
  } catch (e) {
    console.warn('deleteArticle cloud failed, saved local:', e);
  }
}
