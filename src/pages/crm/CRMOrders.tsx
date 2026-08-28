import React from 'react';
import { CRMOrder, OrderStatus, CustomerItem } from '../../types';
import { CRMServiceOrder } from './CRMServiceOrder';

interface CRMOrdersProps {
  orders: CRMOrder[];
  customers?: CustomerItem[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onNavigate?: (page: any) => void;
}

export function CRMOrders({ orders, customers = [], onUpdateStatus, onNavigate }: CRMOrdersProps) {
  return (
    <CRMServiceOrder
      orders={orders}
      customers={customers}
      onUpdateStatus={onUpdateStatus}
      onNavigate={onNavigate}
    />
  );
}

