import React from 'react';
import { CRMOrder, OrderStatus, CustomerItem } from '../../types';
import { CRMServiceOrder } from './CRMServiceOrder';

interface CRMOrdersProps {
  orders: CRMOrder[];
  customers?: CustomerItem[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onDeleteOrder?: (orderId: string) => void;
  onNavigate?: (page: any) => void;
  onEditSPK?: (order: CRMOrder) => void;
}

export function CRMOrders({ orders, customers = [], onUpdateStatus, onDeleteOrder, onNavigate, onEditSPK }: CRMOrdersProps) {
  return (
    <CRMServiceOrder
      orders={orders}
      customers={customers}
      onUpdateStatus={onUpdateStatus}
      onDeleteOrder={onDeleteOrder}
      onNavigate={onNavigate}
      onEditSPK={onEditSPK}
    />
  );
}
