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
import { CRMOrder, OrderStatus, CustomerItem } from '../types';

const ORDERS_COLLECTION = 'orders';
const CUSTOMERS_COLLECTION = 'customers';

/**
 * Subscribe to all orders in real-time.
 * Returns an unsubscribe function.
 */
export function subscribeToOrders(
  callback: (orders: CRMOrder[]) => void
): () => void {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const orders: CRMOrder[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        // Convert Firestore Timestamp to string if needed
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt ?? new Date().toISOString(),
      } as CRMOrder;
    });
    callback(orders);
  });

  return unsubscribe;
}

/**
 * Add a new order to Firestore.
 */
export async function addOrder(
  order: Omit<CRMOrder, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...order,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update the status of an existing order.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(orderRef, { status: newStatus });
}

/**
 * Update any fields of an order.
 */
export async function updateOrder(
  orderId: string,
  fields: Partial<CRMOrder>
): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(orderRef, { ...fields });
}

/**
 * Delete an order.
 */
export async function deleteOrder(orderId: string): Promise<void> {
  await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
}

/**
 * Seed initial mock orders into Firestore (run once).
 * Only call this if the orders collection is empty.
 */
export async function seedInitialOrders(orders: Omit<CRMOrder, 'id'>[]): Promise<void> {
  for (const order of orders) {
    await addDoc(collection(db, ORDERS_COLLECTION), {
      ...order,
      createdAt: serverTimestamp(),
    });
  }
}

/**
 * Subscribe to all customers in real-time.
 * Returns an unsubscribe function.
 */
export function subscribeToCustomers(
  callback: (customers: CustomerItem[]) => void
): () => void {
  const q = query(
    collection(db, CUSTOMERS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const customers: CustomerItem[] = snapshot.docs.map((docSnap) => {
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
    callback(customers);
  });

  return unsubscribe;
}

/**
 * Add a new customer to Firestore.
 */
export async function addCustomer(
  customer: Omit<CustomerItem, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), {
    ...customer,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update an existing customer.
 */
export async function updateCustomer(
  customerId: string,
  fields: Partial<CustomerItem>
): Promise<void> {
  const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
  await updateDoc(customerRef, {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a customer.
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  await deleteDoc(doc(db, CUSTOMERS_COLLECTION, customerId));
}

/**
 * Seed initial mock customers into Firestore (run once).
 */
export async function seedInitialCustomers(customers: Omit<CustomerItem, 'id'>[]): Promise<void> {
  for (const customer of customers) {
    await addDoc(collection(db, CUSTOMERS_COLLECTION), {
      ...customer,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

