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
import { CRMOrder, OrderStatus, CustomerItem, SPKDocument } from '../types';

const ORDERS_COLLECTION = 'orders';
const CUSTOMERS_COLLECTION = 'customers';
const SPK_COLLECTION = 'spk_documents';
const LOCAL_SPK_KEY = 'fhrcar_spk_store';
const LOCAL_CUSTOMERS_KEY = 'fhrcar_customers_store';
const LOCAL_ORDERS_KEY = 'fhrcar_orders_store';

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
