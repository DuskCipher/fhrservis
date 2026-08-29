import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Plus, Trash2, Edit, CheckCircle, X, Package,
  Clock, AlertTriangle, FileText, Phone, ChevronDown
} from 'lucide-react';
import { PurchaseOrder, POItem, InventoryItem } from '../../types';
import {
  subscribeToPurchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
  subscribeToInventory
} from '../../lib/firestoreService';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Draft',    color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' },
  ordered:   { label: 'Dikirim', color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200' },
  received:  { label: 'Diterima', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  cancelled: { label: 'Dibatal',  color: 'text-red-600',  bg: 'bg-red-50 border-red-200' },
};

const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

const EMPTY_PO: Omit<PurchaseOrder, 'id' | 'createdAt'> = {
  poNumber: '', supplier: '', supplierPhone: '', status: 'draft',
  items: [], totalAmount: 0, notes: '',
};

export function CRMPurchasing() {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [form, setForm] = useState<Omit<PurchaseOrder, 'id' | 'createdAt'>>(EMPTY_PO);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const u1 = subscribeToPurchaseOrders(setPos);
    const u2 = subscribeToInventory(setInventory);
    return () => { u1(); u2(); };
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const recalcTotal = (items: POItem[]) => items.reduce((sum, i) => sum + i.totalPrice, 0);

  const openAdd = () => {
    const poNum = 'PO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(Math.random() * 1000);
    setEditingPO(null);
    setForm({ ...EMPTY_PO, poNumber: poNum });
    setShowModal(true);
  };

  const openEdit = (po: PurchaseOrder) => {
    setEditingPO(po);
    setForm({ poNumber: po.poNumber, supplier: po.supplier, supplierPhone: po.supplierPhone || '', status: po.status, items: [...po.items], totalAmount: po.totalAmount, notes: po.notes || '' });
    setShowModal(true);
  };

  const addItem = () => {
    const newItem: POItem = { id: Date.now().toString(), inventoryId: '', name: '', qty: 1, unit: 'pcs', buyPrice: 0, totalPrice: 0 };
    const updated = [...form.items, newItem];
    setForm(p => ({ ...p, items: updated, totalAmount: recalcTotal(updated) }));
  };

  const updateItem = (idx: number, field: keyof POItem, value: any) => {
    const updated = form.items.map((item, i) => {
      if (i !== idx) return item;
      const newItem = { ...item, [field]: value };
      if (field === 'inventoryId') {
        const inv = inventory.find(iv => iv.id === value);
        if (inv) { newItem.name = inv.name; newItem.buyPrice = inv.buyPrice; newItem.unit = inv.unit; }
      }
      newItem.totalPrice = newItem.qty * newItem.buyPrice;
      return newItem;
    });
    setForm(p => ({ ...p, items: updated, totalAmount: recalcTotal(updated) }));
  };

  const removeItem = (idx: number) => {
    const updated = form.items.filter((_, i) => i !== idx);
    setForm(p => ({ ...p, items: updated, totalAmount: recalcTotal(updated) }));
  };

  const handleSave = async () => {
    if (!form.supplier || !form.poNumber) { alert('Nomor PO dan Supplier wajib diisi!'); return; }
    setSaving(true);
    try {
      if (editingPO) { await updatePurchaseOrder(editingPO.id, form); showToast('PO berhasil diperbarui!'); }
      else { await addPurchaseOrder(form); showToast('PO berhasil dibuat!'); }
      setShowModal(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, poNum: string) => {
    if (!window.confirm(`Hapus PO "${poNum}"?`)) return;
    await deletePurchaseOrder(id);
    showToast('PO berhasil dihapus.');
  };

  const handleStatusChange = async (po: PurchaseOrder, newStatus: string) => {
    await updatePurchaseOrder(po.id, { status: newStatus as any, ...(newStatus === 'received' ? { receivedAt: new Date().toISOString() } : {}) });
    showToast(`Status PO diubah ke "${STATUS_CONFIG[newStatus]?.label}"`);
  };

  const totalDraft = pos.filter(p => p.status === 'draft').length;
  const totalOrdered = pos.filter(p => p.status === 'ordered').length;
  const totalReceived = pos.filter(p => p.status === 'received').length;
  const totalAmount = pos.reduce((s, p) => s + (p.totalAmount || 0), 0);

  return (
    <div className="p-5 font-sans bg-[#f4f6fb] min-h-screen space-y-4">
      {toast && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold">
          <CheckCircle size={16} /><span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <ShoppingCart size={20} className="text-red-600" />
            <h1 className="text-xl font-black text-slate-900">Pembelian / Purchase Order</h1>
          </div>
          <p className="text-xs text-slate-500">Kelola pembelian sparepart dari supplier</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-all">
          <Plus size={15} />+ Buat Purchase Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total PO', value: pos.length, color: 'text-slate-900', bg: 'bg-slate-100', icon: FileText },
          { label: 'PO Draft', value: totalDraft, color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
          { label: 'Dikirim Supplier', value: totalOrdered, color: 'text-blue-700', bg: 'bg-blue-100', icon: ShoppingCart },
          { label: 'Sudah Diterima', value: totalReceived, color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase">{s.label}</p>
              <div className={`w-7 h-7 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={14} className={s.color} />
              </div>
            </div>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="px-5 py-3">NO. PO</th>
                <th className="px-3 py-3">SUPPLIER</th>
                <th className="px-3 py-3 text-center">JUMLAH ITEM</th>
                <th className="px-3 py-3 text-right">TOTAL</th>
                <th className="px-3 py-3 text-center">STATUS</th>
                <th className="px-3 py-3">TANGGAL</th>
                <th className="px-3 py-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <ShoppingCart size={32} className="text-slate-300" />
                      <p className="font-bold text-slate-600">Belum ada Purchase Order</p>
                      <button onClick={openAdd} className="px-4 py-2 rounded-xl bg-red-600 text-white font-black text-xs hover:bg-red-700 transition-colors">
                        + Buat PO Pertama
                      </button>
                    </div>
                  </td>
                </tr>
              ) : pos.map(po => {
                const cfg = STATUS_CONFIG[po.status] || STATUS_CONFIG.draft;
                return (
                  <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-blue-700 text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{po.poNumber}</span>
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-bold text-slate-800">{po.supplier}</p>
                      {po.supplierPhone && <p className="text-[11px] text-slate-400 flex items-center gap-1"><Phone size={10} />{po.supplierPhone}</p>}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className="font-bold text-slate-700">{po.items.length} item</span>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <span className="font-black text-slate-900">{formatRp(po.totalAmount)}</span>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <select
                        value={po.status}
                        onChange={e => handleStatusChange(po, e.target.value)}
                        className={`px-2.5 py-1 text-[10px] font-black rounded-lg border cursor-pointer outline-none ${cfg.bg} ${cfg.color}`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-4">
                      <p className="text-[11px] text-slate-600 font-semibold">{new Date(po.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(po)} className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"><Edit size={13} /></button>
                        <button onClick={() => handleDelete(po.id, po.poNumber)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="font-black text-slate-900">{editingPO ? 'Edit PO' : 'Buat Purchase Order Baru'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nomor PO *</label>
                  <input value={form.poNumber} onChange={e => setForm(p => ({ ...p, poNumber: e.target.value }))} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400 font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Supplier *</label>
                  <input value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} placeholder="PT. Sparepart Utama" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">No. HP Supplier</label>
                  <input value={form.supplierPhone || ''} onChange={e => setForm(p => ({ ...p, supplierPhone: e.target.value }))} placeholder="08xxxxxxxxxx" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400" />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-slate-600">Daftar Item</label>
                  <button onClick={addItem} className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
                    <Plus size={11} /> Tambah Item
                  </button>
                </div>
                <div className="space-y-2">
                  {form.items.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-xl">Belum ada item. Klik "Tambah Item" untuk menambah sparepart.</p>
                  )}
                  {form.items.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        <select value={item.inventoryId} onChange={e => updateItem(idx, 'inventoryId', e.target.value)} className="col-span-2 px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-red-400 bg-white">
                          <option value="">-- Pilih Sparepart --</option>
                          {inventory.filter(i => i.type === 'sparepart').map(i => <option key={i.id} value={i.id}>{i.name} ({i.skuCode})</option>)}
                        </select>
                        <input type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(idx, 'qty', Number(e.target.value))} className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-red-400 bg-white" />
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-emerald-700">{formatRp(item.totalPrice)}</span>
                        </div>
                      </div>
                      <button onClick={() => removeItem(idx)} className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"><X size={13} /></button>
                    </div>
                  ))}
                </div>
                {form.items.length > 0 && (
                  <div className="flex justify-end mt-2 pt-2 border-t border-slate-200">
                    <span className="text-sm font-black text-slate-900">Total: {formatRp(form.totalAmount)}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Catatan</label>
                <textarea value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-xs font-black rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60">
                {saving ? 'Menyimpan...' : (editingPO ? 'Simpan Perubahan' : 'Buat PO')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
