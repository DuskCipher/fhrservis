import React from 'react';
import { CRMOrder, OrderStatus } from '../../types';
import { CRMServiceOrder } from './CRMServiceOrder';

interface CRMOrdersProps {
  orders: CRMOrder[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export function CRMOrders({ orders, onUpdateStatus }: CRMOrdersProps) {
  return <CRMServiceOrder orders={orders} onUpdateStatus={onUpdateStatus} />;
}
