import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { CRMOrder, OrderStatus, CustomerItem, SPKDocument, EmployeeItem, EmployeeRole } from '../types';

const ORDERS_COLLECTION = 'orders';
const CUSTOMERS_COLLECTION = 'customers';
const SPK_COLLECTION = 'spk_documents';
const EMPLOYEES_COLLECTION = 'employees';
const LOCAL_SPK_KEY = 'fhrcar_spk_store';
const LOCAL_CUSTOMERS_KEY = 'fhrcar_customers_store';
const LOCAL_ORDERS_KEY = 'fhrcar_orders_store';
const LOCAL_EMPLOYEES_KEY = 'fhrcar_employees_store';

// Helper to remove undefined fields which Firestore rejects
function sanitizeData<T extends object>(data: T): any {
  const clean: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

// LocalStorage helpers for customers
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

/**
 * Subscribe to all orders in real-time.
 * Returns an unsubscribe function.
 */
export function subscribeToOrders(
  callback: (orders: CRMOrder[]) => void
): () => void {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders: CRMOrder[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt ?? new Date().toISOString(),
          } as CRMOrder;
        });
        // Cache to local
        try {
          localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
        } catch {}
        callback(orders);
      },
      (error) => {
        console.warn('[Firestore] Orders subscription error, using local fallback:', error);
        try {
          const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
          if (raw) callback(JSON.parse(raw));
        } catch {}
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] subscribeToOrders failed:', err);
    return () => {};
  }
}

/**
 * Add a new order to Firestore (with local fallback).
 */
export async function addOrder(
  order: Omit<CRMOrder, 'id' | 'createdAt'>
): Promise<string> {
  const cleanOrder = sanitizeData(order);
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...cleanOrder,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.warn('[Firestore] addOrder failed in cloud, saving locally:', error);
    const localId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const newOrder: CRMOrder = {
      id: localId,
      ...cleanOrder,
      createdAt: new Date().toISOString(),
    };
    try {
      const existing = localStorage.getItem(LOCAL_ORDERS_KEY);
      const list: CRMOrder[] = existing ? JSON.parse(existing) : [];
      list.unshift(newOrder);
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(list));
    } catch {}
    return localId;
  }
}

/**
 * Update the status of an existing order.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { status: newStatus });
  } catch (error) {
    console.warn('[Firestore] updateOrderStatus fallback:', error);
    try {
      const existing = localStorage.getItem(LOCAL_ORDERS_KEY);
      if (existing) {
        const list: CRMOrder[] = JSON.parse(existing);
        const updated = list.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
      }
    } catch {}
  }
}

/**
 * Update any fields of an order.
 */
export async function updateOrder(
  orderId: string,
  fields: Partial<CRMOrder>
): Promise<void> {
  const cleanFields = sanitizeData(fields);
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { ...cleanFields });
  } catch (error) {
    console.warn('[Firestore] updateOrder fallback:', error);
  }
}

/**
 * Delete an order.
 */
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
  } catch (error) {
    console.warn('[Firestore] deleteOrder fallback:', error);
    try {
      const existing = localStorage.getItem(LOCAL_ORDERS_KEY);
      if (existing) {
        const list: CRMOrder[] = JSON.parse(existing);
        const updated = list.filter(o => o.id !== orderId);
        localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
      }
    } catch {}
  }
}

/**
 * Seed initial mock orders into Firestore.
 */
export async function seedInitialOrders(orders: Omit<CRMOrder, 'id'>[]): Promise<void> {
  for (const order of orders) {
    const cleanOrder = sanitizeData(order);
    try {
      await addDoc(collection(db, ORDERS_COLLECTION), {
        ...cleanOrder,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('[Firestore] seedInitialOrders skipped cloud for 1 item:', e);
    }
  }
}

/**
 * Subscribe to all customers in real-time (with local sync & fallback).
 * Returns an unsubscribe function.
 */
export function subscribeToCustomers(
  callback: (customers: CustomerItem[]) => void
): () => void {
  // First, emit whatever we have locally for instant UI
  const localList = getLocalCustomers();
  if (localList.length > 0) {
    callback(localList);
  }

  // Listen to local update events
  const handleLocalUpdate = () => {
    const fresh = getLocalCustomers();
    callback(fresh);
  };
  window.addEventListener('fhrcar-customers-updated', handleLocalUpdate);

  let unsubscribeFirestore = () => {};

  try {
    const q = collection(db, CUSTOMERS_COLLECTION);
    unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudCustomers: CustomerItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
              createdAt:
                data.createdAt instanceof Timestamp
                  ? data.createdAt.toDate().toISOString()
                  : data.createdAt ?? new Date().toISOString(),
              updatedAt:
                data.updatedAt instanceof Timestamp
                  ? data.updatedAt.toDate().toISOString()
                  : data.updatedAt,
            } as CustomerItem;
          });

          // Sort client-side by createdAt desc
          cloudCustomers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          saveLocalCustomers(cloudCustomers);
          callback(cloudCustomers);
        } else {
          // If cloud is empty, check local
          const currentLocal = getLocalCustomers();
          callback(currentLocal);
        }
      },
      (error) => {
        console.warn('[Firestore] Customers snapshot error (using local storage):', error);
        callback(getLocalCustomers());
      }
    );
  } catch (err) {
    console.warn('[Firestore] subscribeToCustomers query failed:', err);
    callback(getLocalCustomers());
  }

  return () => {
    unsubscribeFirestore();
    window.removeEventListener('fhrcar-customers-updated', handleLocalUpdate);
  };
}

/**
 * Add a new customer (dual sync: Firestore + Local Storage).
 */
export async function addCustomer(
  customer: Omit<CustomerItem, 'id' | 'createdAt'>
): Promise<string> {
  const cleanCustomer = sanitizeData(customer);
  const tempId = 'CUST-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const newCustomerObj: CustomerItem = {
    id: tempId,
    ...cleanCustomer,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Always update local immediately so user experiences 0 lag and 100% reliability
  const currentList = getLocalCustomers();
  currentList.unshift(newCustomerObj);
  saveLocalCustomers(currentList);

  try {
    const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), {
      ...cleanCustomer,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // If Firestore succeeds with new ID, update the local ID
    if (docRef.id) {
      newCustomerObj.id = docRef.id;
      const updatedList = getLocalCustomers().map(c => c.id === tempId ? newCustomerObj : c);
      saveLocalCustomers(updatedList);
      return docRef.id;
    }
  } catch (error) {
    console.warn('[Firestore] addCustomer could not write to cloud, saved locally:', error);
  }

  return tempId;
}

/**
 * Update an existing customer.
 */
export async function updateCustomer(
  customerId: string,
  fields: Partial<CustomerItem>
): Promise<void> {
  const cleanFields = sanitizeData(fields);

  // Update local immediately
  const currentList = getLocalCustomers();
  const updatedList = currentList.map(c =>
    c.id === customerId ? { ...c, ...cleanFields, updatedAt: new Date().toISOString() } : c
  );
  saveLocalCustomers(updatedList);

  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    await updateDoc(customerRef, {
      ...cleanFields,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('[Firestore] updateCustomer cloud update fallback:', error);
  }
}

/**
 * Delete a customer.
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  // Update local immediately
  const currentList = getLocalCustomers();
  const updatedList = currentList.filter(c => c.id !== customerId);
  saveLocalCustomers(updatedList);

  try {
    await deleteDoc(doc(db, CUSTOMERS_COLLECTION, customerId));
  } catch (error) {
    console.warn('[Firestore] deleteCustomer cloud delete fallback:', error);
  }
}

/**
 * Seed initial mock customers.
 */
export async function seedInitialCustomers(customers: Omit<CustomerItem, 'id'>[]): Promise<void> {
  const localList = getLocalCustomers();
  if (localList.length === 0) {
    const seededList: CustomerItem[] = customers.map((c, i) => ({
      id: 'CUST-00' + (i + 1),
      ...sanitizeData(c),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    saveLocalCustomers(seededList);
  }

  // Also try seeding to Firestore in background
  for (const customer of customers) {
    const cleanCustomer = sanitizeData(customer);
    try {
      await addDoc(collection(db, CUSTOMERS_COLLECTION), {
        ...cleanCustomer,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      // Ignore background cloud seed error
    }
  }
}

/**
 * Add a new SPK document (dual-layer: Firestore + localStorage).
 */
export async function addSPK(
  spk: Omit<SPKDocument, 'id'>
): Promise<string> {
  const cleanSpk = sanitizeData(spk);
  const tempId = spk.spkNumber || ('SPK-' + Math.random().toString(36).substring(2, 9).toUpperCase());

  // Always save locally first
  try {
    const existing = localStorage.getItem(LOCAL_SPK_KEY);
    const list: SPKDocument[] = existing ? JSON.parse(existing) : [];
    list.unshift({ id: tempId, ...cleanSpk });
    localStorage.setItem(LOCAL_SPK_KEY, JSON.stringify(list));
  } catch {}

  try {
    const docRef = await addDoc(collection(db, SPK_COLLECTION), {
      ...cleanSpk,
      createdAt: serverTimestamp(),
    });
    // Update local with real Firestore ID
    try {
      const existing = localStorage.getItem(LOCAL_SPK_KEY);
      if (existing) {
        const list: SPKDocument[] = JSON.parse(existing);
        const updated = list.map(s => s.id === tempId ? { ...s, id: docRef.id } : s);
        localStorage.setItem(LOCAL_SPK_KEY, JSON.stringify(updated));
      }
    } catch {}
    return docRef.id;
  } catch (error) {
    console.warn('[Firestore] addSPK cloud save failed, kept locally:', error);
    return tempId;
  }
}

/**
 * Update an existing SPK document.
 */
export async function updateSPK(
  spkId: string,
  fields: Partial<SPKDocument>
): Promise<void> {
  const cleanFields = sanitizeData(fields);
  try {
    const existing = localStorage.getItem(LOCAL_SPK_KEY);
    if (existing) {
      const list: SPKDocument[] = JSON.parse(existing);
      const updated = list.map(s => (s.id === spkId || s.spkNumber === spkId) ? { ...s, ...cleanFields } : s);
      localStorage.setItem(LOCAL_SPK_KEY, JSON.stringify(updated));
    }
  } catch {}

  try {
    const docRef = doc(db, SPK_COLLECTION, spkId);
    await updateDoc(docRef, { ...cleanFields, updatedAt: serverTimestamp() });
  } catch (error) {
    console.warn('[Firestore] updateSPK fallback:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════
// EMPLOYEES / KARYAWAN SERVICE
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_EMPLOYEES: EmployeeItem[] = [
  { id: 'emp-1', name: 'Budi Santoso', nik: 'SA-001', role: 'SA', phone: '081234567891', email: 'budi.sa@fhrcar.xyz', status: 'active', createdAt: '2026-01-10T08:00:00.000Z' },
  { id: 'emp-2', name: 'Rendra Kurniawan', nik: 'SA-002', role: 'SA', phone: '081234567892', email: 'rendra.sa@fhrcar.xyz', status: 'active', createdAt: '2026-01-12T08:00:00.000Z' },
  { id: 'emp-3', name: 'Rizky Pratama', nik: 'FA-001', role: 'FA', phone: '081234567893', email: 'rizky.fa@fhrcar.xyz', status: 'active', createdAt: '2026-01-15T08:00:00.000Z' },
  { id: 'emp-4', name: 'Doni Kurniawan', nik: 'FR-001', role: 'Foreman', phone: '081234567894', email: 'doni.foreman@fhrcar.xyz', status: 'active', createdAt: '2026-01-05T08:00:00.000Z' },
  { id: 'emp-5', name: 'Agus Setiawan', nik: 'MK-001', role: 'Mekanik', phone: '081234567895', email: 'agus.mekanik@fhrcar.xyz', status: 'active', createdAt: '2026-01-15T08:00:00.000Z' },
  { id: 'emp-6', name: 'Hendra Wijaya', nik: 'MK-002', role: 'Mekanik', phone: '081234567896', email: 'hendra.mekanik@fhrcar.xyz', status: 'active', createdAt: '2026-02-01T08:00:00.000Z' },
  { id: 'emp-7', name: 'Fajar Nugroho', nik: 'MK-003', role: 'Mekanik', phone: '081234567897', email: 'fajar.mekanik@fhrcar.xyz', status: 'active', createdAt: '2026-02-10T08:00:00.000Z' },
  { id: 'emp-8', name: 'Siti Rahma', nik: 'KS-001', role: 'Kasir', phone: '081234567898', email: 'siti.kasir@fhrcar.xyz', status: 'active', createdAt: '2026-01-20T08:00:00.000Z' },
  { id: 'emp-9', name: 'Wahyudi S.', nik: 'MG-001', role: 'Manager', phone: '081234567899', email: 'wahyudi.mgr@fhrcar.xyz', status: 'active', createdAt: '2026-01-01T08:00:00.000Z' },
];

function getLocalEmployees(): EmployeeItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_EMPLOYEES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_EMPLOYEES_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
      return DEFAULT_EMPLOYEES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_EMPLOYEES;
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

/**
 * Subscribe to employees list in real-time.
 */
export function subscribeToEmployees(
  onUpdate: (employees: EmployeeItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  // Emit initial local cache immediately
  const initialLocal = getLocalEmployees();
  onUpdate(initialLocal);

  const handleLocalUpdate = (e: any) => {
    if (e.detail) onUpdate(e.detail);
  };
  window.addEventListener('fhrcar_employees_updated', handleLocalUpdate);

  try {
    const q = query(collection(db, EMPLOYEES_COLLECTION), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudEmployees: EmployeeItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              name: data.name || '',
              nik: data.nik || '',
              role: data.role || 'Mekanik',
              phone: data.phone || '',
              email: data.email || '',
              status: data.status || 'active',
              createdAt: data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate().toISOString()
                : data.updatedAt,
            };
          });
          saveLocalEmployees(cloudEmployees);
          onUpdate(cloudEmployees);
        } else {
          // Cloud collection is empty, seed defaults to cloud in background
          seedDefaultEmployeesToCloud();
          onUpdate(initialLocal);
        }
      },
      (error) => {
        console.warn('[Firestore] Employees subscription offline fallback:', error.message);
        onUpdate(getLocalEmployees());
        if (onError) onError(error);
      }
    );

    return () => {
      window.removeEventListener('fhrcar_employees_updated', handleLocalUpdate);
      unsubscribe();
    };
  } catch (err: any) {
    console.warn('[Firestore] Employees subscription init fallback:', err);
    return () => {
      window.removeEventListener('fhrcar_employees_updated', handleLocalUpdate);
    };
  }
}

/**
 * Add a new employee
 */
export async function addEmployee(
  employee: Omit<EmployeeItem, 'id' | 'createdAt'>
): Promise<string> {
  const cleanEmp = sanitizeData(employee);
  const now = new Date().toISOString();
  const tempId = 'emp_' + Math.random().toString(36).substring(2, 9);
  const newEmp: EmployeeItem = {
    id: tempId,
    ...cleanEmp,
    createdAt: now,
    updatedAt: now,
  };

  // 1. Always save to LocalStorage immediately
  const localList = getLocalEmployees();
  localList.unshift(newEmp);
  saveLocalEmployees(localList);

  // 2. Try Firestore cloud sync
  try {
    const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), {
      ...cleanEmp,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // Update local ID with real Firestore ID
    const updated = localList.map(e => e.id === tempId ? { ...e, id: docRef.id } : e);
    saveLocalEmployees(updated);
    return docRef.id;
  } catch (error) {
    console.warn('[Firestore] Employee cloud add failed, saved locally:', error);
    return tempId;
  }
}

/**
 * Update an existing employee
 */
export async function updateEmployee(
  employeeId: string,
  data: Partial<EmployeeItem>
): Promise<void> {
  const cleanData = sanitizeData(data);
  const now = new Date().toISOString();

  // 1. Update local store immediately
  const localList = getLocalEmployees();
  const updated = localList.map(e => e.id === employeeId ? { ...e, ...cleanData, updatedAt: now } : e);
  saveLocalEmployees(updated);

  // 2. Try Firestore cloud sync
  try {
    const empRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    await updateDoc(empRef, {
      ...cleanData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('[Firestore] Employee cloud update failed, updated locally:', error);
  }
}

/**
 * Delete an employee
 */
export async function deleteEmployee(employeeId: string): Promise<void> {
  // 1. Delete from local store immediately
  const localList = getLocalEmployees();
  const filtered = localList.filter(e => e.id !== employeeId);
  saveLocalEmployees(filtered);

  // 2. Try Firestore cloud delete
  try {
    const empRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    await deleteDoc(empRef);
  } catch (error) {
    console.warn('[Firestore] Employee cloud delete failed, deleted locally:', error);
  }
}

/**
 * Seed default employees to cloud
 */
async function seedDefaultEmployeesToCloud() {
  for (const emp of DEFAULT_EMPLOYEES) {
    try {
      const clean = sanitizeData(emp);
      await addDoc(collection(db, EMPLOYEES_COLLECTION), {
        ...clean,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch {}
  }
}
