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
import { CRMOrder, OrderStatus } from '../types';

const ORDERS_COLLECTION = 'orders';

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
