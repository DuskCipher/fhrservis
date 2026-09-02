import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Plus, Trash2, Printer, X,
  Wallet, CreditCard, Building2, AlertCircle, CheckCircle,
  Edit3, Save, ArrowDownRight, FileText, Banknote, BarChart3,
  Eye, EyeOff, Store, Wrench, TrendingUp, TrendingDown, ShoppingBag, Coins,
  Tag, Percent, ChevronRight, Sparkles
} from 'lucide-react';
import { CRMOrder, PageType, InventoryItem } from '../../types';
import {
  subscribeToJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  JournalEntryModel,
  getLocalJournalEntries,
  subscribeToInventory
} from '../../lib/firestoreService';

const uid = () => Math.random().toString(36).substring(2, 9);
const formatRp = (n: number) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');
const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};
const isoToday = () => new Date().toISOString().split('T')[0];

type SumberDana = 'kas_tangan' | 'bank_mandiri';
type KategoriJurnal = 'toko' | 'bengkel';

type JurnalEntry = JournalEntryModel;

interface ManualExpenseForm {
  tanggal: string;
  keterangan: string;
  jumlah: string;
  sumber: SumberDana;
}

const SUMBER_OPTIONS: { value: SumberDana; label: string; noAkun: string }[] = [
  { value: 'kas_tangan',   label: 'Kas di Tangan', noAkun: '1-1120' },
  { value: 'bank_mandiri', label: 'Bank',          noAkun: '1-1210' },
];

function generateDailyJurnal(orders: CRMOrder[], kategori: KategoriJurnal, manualDates: string[] = []): JurnalEntry[] {
  const dateSet = new Set<string>();
  dateSet.add(isoToday());

  for (const d of manualDates) {
    if (d) dateSet.add(d);
  }

  const dateMap: Record<string, CRMOrder[]> = {};
  for (const order of orders) {
    if (!order.totalPrice || order.totalPrice === 0) continue;
    if (order.status === 'cancelled') continue;
    const tgl = order.createdAt?.split('T')[0] || isoToday();
    if (!dateMap[tgl]) dateMap[tgl] = [];
    dateMap[tgl].push(order);
    dateSet.add(tgl);
  }

  const sortedDates = Array.from(dateSet).sort();
  const entries: JurnalEntry[] = [];

  for (const tgl of sortedDates) {
    const dayOrders = dateMap[tgl] || [];

    if (kategori === 'toko') {
      let totalSparepartCash = 0;
      let totalSparepartTF = 0;

      for (const ord of dayOrders) {
        const spareparts = ord.spareparts || [];
        const subTotal = spareparts.reduce((s, p) => s + (p.hargaSatuan * p.qty), 0);
        if (subTotal <= 0) continue;

        const metode = ord.metodePembayaran || 'cash';
        if (metode === 'cash') {
          totalSparepartCash += subTotal;
        } else {
          totalSparepartTF += subTotal;
        }
      }

      // 1. Baris Paten: Pendapatan Cash
      entries.push({
        id: 'auto-toko-cash-' + tgl,
        tanggal: tgl,
        ref: '',
        keterangan: 'Pendapatan Cash',
        noAkunDebet: '1-1120',
        namaAkunDebet: 'Kas di Tangan',
        debet: totalSparepartCash,
        noAkunKredit: '4-1001',
        namaAkunKredit: 'Penjualan Sparepart',
        kredit: totalSparepartCash,
        type: 'pendapatan_cash',
        kategoriJurnal: 'toko',
        isManual: false,
      });

      // 2. Baris Paten: Pendapatan TF/Qris/EDC
      entries.push({
        id: 'auto-toko-tf-' + tgl,
        tanggal: tgl,
        ref: '',
        keterangan: 'Pendapatan TF/Qris/EDC',
        noAkunDebet: '1-1210',
        namaAkunDebet: 'Bank',
        debet: totalSparepartTF,
        noAkunKredit: '4-1001',
        namaAkunKredit: 'Penjualan Sparepart',
        kredit: totalSparepartTF,
        type: 'pendapatan_tf',
        kategoriJurnal: 'toko',
        isManual: false,
      });

      // 3. Baris HPP (jika ada)
      const totalHPP = Math.round((totalSparepartCash + totalSparepartTF) * 0.7);
      if (totalHPP > 0) {
        entries.push({
          id: 'auto-toko-hpp-' + tgl,
          tanggal: tgl,
          ref: '',
          keterangan: 'Pengambilan sparepart TOKO FHRCAR',
          noAkunDebet: '5-1000',
          namaAkunDebet: 'Harga Pokok Penjualan (HPP)',
          debet: totalHPP,
          noAkunKredit: '1-1400',
          namaAkunKredit: 'Persediaan Barang Dagangan',
          kredit: totalHPP,
          type: 'hpp',
          kategoriJurnal: 'toko',
          isHPP: true,
          isManual: false,
        });
      }
    } else {
      let totalJasaCash = 0;
      let totalJasaTF = 0;

      for (const ord of dayOrders) {
        const jasaList = ord.jasaList || [];
        const subTotal = jasaList.reduce((s, j) => s + j.harga, 0);
        if (subTotal <= 0) continue;

        const metode = ord.metodePembayaran || 'cash';
        if (metode === 'cash') {
          totalJasaCash += subTotal;
        } else {
          totalJasaTF += subTotal;
        }
      }

      // 1. Baris Paten: Pendapatan Cash
      entries.push({
        id: 'auto-bengkel-cash-' + tgl,
        tanggal: tgl,
        ref: '',
        keterangan: 'Pendapatan Cash',
        noAkunDebet: '1-1120',
        namaAkunDebet: 'Kas di Tangan',
        debet: totalJasaCash,
        noAkunKredit: '4-1002',
        namaAkunKredit: 'Pendapatan Jasa',
        kredit: totalJasaCash,
        type: 'pendapatan_cash',
        kategoriJurnal: 'bengkel',
        isManual: false,
      });

      // 2. Baris Paten: Pendapatan TF/Qris/EDC
      entries.push({
        id: 'auto-bengkel-tf-' + tgl,
        tanggal: tgl,
        ref: '',
        keterangan: 'Pendapatan TF/Qris/EDC',
        noAkunDebet: '1-1210',
        namaAkunDebet: 'Bank',
        debet: totalJasaTF,
        noAkunKredit: '4-1002',
        namaAkunKredit: 'Pendapatan Jasa',
        kredit: totalJasaTF,
        type: 'pendapatan_tf',
        kategoriJurnal: 'bengkel',
        isManual: false,
      });
    }
  }

  return entries;
}

interface CRMJurnalProps {
  orders: CRMOrder[];
  activeTab?: KategoriJurnal;
  onNavigate: (page: PageType) => void;
}

export function CRMJurnal({ orders, activeTab: propTab = 'toko', onNavigate }: CRMJurnalProps) {
  const [currentTab, setCurrentTab] = useState<KategoriJurnal>(propTab);

  useEffect(() => {
    if (propTab) setCurrentTab(propTab);
  }, [propTab]);

  const today = isoToday();
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const [selectedMonth, setSelectedMonth] = useState<string>(`${currentYear}-${currentMonth}`);

  const getMonthDateRange = (yearMonth: string) => {
    const [y, m] = yearMonth.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    return {
      from: `${yearMonth}-01`,
      to: `${yearMonth}-${String(lastDay).padStart(2, '0')}`
    };
  };

  const initialRange = getMonthDateRange(`${currentYear}-${currentMonth}`);
  const [filterDateFrom, setFilterDateFrom] = useState<string>(initialRange.from);
  const [filterDateTo, setFilterDateTo] = useState<string>(initialRange.to);
  const [filterType, setFilterType] = useState<string>('semua');
  const [showHPP, setShowHPP] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingManual, setEditingManual] = useState<JurnalEntry | null>(null);
  const [manualEntries, setManualEntries] = useState<JurnalEntry[]>(getLocalJournalEntries);
  const [showSummary, setShowSummary] = useState(true);

  const handleMonthChange = (ym: string) => {
    setSelectedMonth(ym);
    if (ym) {
      const range = getMonthDateRange(ym);
      setFilterDateFrom(range.from);
      setFilterDateTo(range.to);
    }
  };

  const [form, setForm] = useState<ManualExpenseForm>({
    tanggal: today,
    keterangan: '',
    jumlah: '',
    sumber: 'kas_tangan'
  });

  useEffect(() => {
    const unsub = subscribeToJournalEntries((entries) => {
      setManualEntries(entries);
    });
    return () => unsub();
  }, []);

  const tabManualEntries = useMemo(() => {
    return manualEntries.filter(e => {
      const kat = e.kategoriJurnal || 'toko';
      return kat === currentTab;
    });
  }, [manualEntries, currentTab]);

  const autoEntries = useMemo(() => {
    const manualDates = tabManualEntries.map(e => e.tanggal);
    return generateDailyJurnal(orders, currentTab, manualDates);
  }, [orders, currentTab, tabManualEntries]);

  const combinedEntries = useMemo(() => {
    const all = [...autoEntries, ...tabManualEntries];
    return all.sort((a, b) => {
      const dt = a.tanggal.localeCompare(b.tanggal);
      if (dt !== 0) return dt;
      const getPriority = (e: JurnalEntry) => {
        if (e.type === 'pendapatan_cash') return 1;
        if (e.type === 'pendapatan_tf') return 2;
        if (e.isHPP) return 3;
        return 4;
      };
      const pA = getPriority(a);
      const pB = getPriority(b);
      if (pA !== pB) return pA - pB;
      return (a.id || '').localeCompare(b.id || '');
    });
  }, [autoEntries, tabManualEntries]);

  const prefixRef = currentTab === 'toko' ? 'JU-' : 'JB-';

  // Filter berdasarkan periode tanggal terpilih
  const rawFiltered = useMemo(() => combinedEntries.filter(e => {
    if (e.tanggal < filterDateFrom || e.tanggal > filterDateTo) return false;
    if (!showHPP && e.isHPP) return false;
    if (filterType === 'cash' && e.type !== 'pendapatan_cash') return false;
    if (filterType === 'tf' && e.type !== 'pendapatan_tf') return false;
    if (filterType === 'pengeluaran' && e.type !== 'manual_pengeluaran') return false;
    return true;
  }), [combinedEntries, filterDateFrom, filterDateTo, filterType, showHPP]);

  // Beri nomor Ref berurutan mulai dari 001 untuk periode ini
  const filtered = useMemo(() => {
    let c = 1;
    return rawFiltered.map(e => ({
      ...e,
      ref: prefixRef + String(c++).padStart(3, '0')
    }));
  }, [rawFiltered, prefixRef]);

  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const unsub = subscribeToInventory((items) => {
      setInventoryList(items);
    });
    return () => unsub();
  }, []);

  // ─── KALKULASI DETAIL KEUNTUNGAN TOKO (HARGA JUAL - HARGA BELI) ───
  const profitDetailsToko = useMemo(() => {
    const periodOrders = orders.filter(o => {
      if (o.status === 'cancelled') return false;
      const tgl = (o.createdAt ? o.createdAt.split('T')[0] : (o.serviceDate || isoToday()));
      if (tgl < filterDateFrom || tgl > filterDateTo) return false;
      if (filterType === 'cash' && o.metodePembayaran !== 'cash') return false;
      if (filterType === 'tf' && o.metodePembayaran === 'cash') return false;
      return true;
    });

    const itemMap: Record<string, {
      nama: string;
      qty: number;
      hargaBeli: number;
      hargaJual: number;
      totalBeli: number;
      totalJual: number;
      keuntungan: number;
    }> = {};

    for (const ord of periodOrders) {
      const parts = ord.spareparts || [];
      for (const p of parts) {
        if (!p.nama || p.qty <= 0) continue;
        const key = p.nama.trim().toLowerCase();

        // Cari harga beli di database inventory
        const matchedInv = inventoryList.find(
          inv => inv.name?.trim().toLowerCase() === key || inv.skuCode === p.id
        );

        const buyPrice = matchedInv?.buyPrice && matchedInv.buyPrice > 0
          ? matchedInv.buyPrice
          : Math.round(p.hargaSatuan * 0.7); // Fallback jika belum diisi modalnya di inventory

        const sellPrice = p.hargaSatuan || 0;
        const qty = p.qty;

        if (!itemMap[key]) {
          itemMap[key] = {
            nama: p.nama,
            qty: 0,
            hargaBeli: buyPrice,
            hargaJual: sellPrice,
            totalBeli: 0,
            totalJual: 0,
            keuntungan: 0,
          };
        }

        itemMap[key].qty += qty;
        itemMap[key].totalBeli += (buyPrice * qty);
        itemMap[key].totalJual += (sellPrice * qty);
        itemMap[key].keuntungan += ((sellPrice - buyPrice) * qty);
      }
    }

    const items = Object.values(itemMap).sort((a, b) => b.keuntungan - a.keuntungan);
    const totalJual = items.reduce((s, i) => s + i.totalJual, 0);
    const totalBeli = items.reduce((s, i) => s + i.totalBeli, 0);
    const totalKeuntunganKotor = totalJual - totalBeli;

    return {
      items,
      totalJual,
      totalBeli,
      totalKeuntunganKotor,
      marginPersen: totalJual > 0 ? Math.round((totalKeuntunganKotor / totalJual) * 100) : 0
    };
  }, [orders, filterDateFrom, filterDateTo, filterType, inventoryList]);

  // ─── KALKULASI DETAIL PENDAPATAN JASA BENGKEL (PER JENIS JASA) ───
  const profitDetailsBengkel = useMemo(() => {
    const periodOrders = orders.filter(o => {
      if (o.status === 'cancelled') return false;
      const tgl = (o.createdAt ? o.createdAt.split('T')[0] : (o.serviceDate || isoToday()));
      if (tgl < filterDateFrom || tgl > filterDateTo) return false;
      if (filterType === 'cash' && o.metodePembayaran !== 'cash') return false;
      if (filterType === 'tf' && o.metodePembayaran === 'cash') return false;
      return true;
    });

    const jasaMap: Record<string, {
      nama: string;
      count: number;
      tarif: number;
      total: number;
    }> = {};

    for (const ord of periodOrders) {
      const jasaList = ord.jasaList || [];
      for (const j of jasaList) {
        if (!j.nama || j.harga <= 0) continue;
        const key = j.nama.trim().toLowerCase();

        if (!jasaMap[key]) {
          jasaMap[key] = {
            nama: j.nama,
            count: 0,
            tarif: j.harga,
            total: 0,
          };
        }

        jasaMap[key].count += 1;
        jasaMap[key].total += j.harga;
      }
    }

    const items = Object.values(jasaMap).sort((a, b) => b.total - a.total);
    const totalJasa = items.reduce((s, i) => s + i.total, 0);
    const totalCount = items.reduce((s, i) => s + i.count, 0);

    return {
      items,
      totalJasa,
      totalCount
    };
  }, [orders, filterDateFrom, filterDateTo, filterType]);

  const summary = useMemo(() => {
    let totalCash = 0, totalTF = 0, totalPKas = 0, totalPBank = 0;
    for (const e of filtered) {
      if (e.isHPP) continue;
      if (e.type === 'pendapatan_cash') totalCash += e.debet;
      if (e.type === 'pendapatan_tf') totalTF += e.debet;
      if (e.type === 'manual_pengeluaran') {
        if (e.sumberDana === 'kas_tangan') totalPKas += e.kredit;
        else totalPBank += e.kredit;
      }
    }
    return {
      totalCash,
      totalTF,
      totalPKas,
      totalPBank,
      saldoKas: totalCash - totalPKas,
      saldoBank: totalTF - totalPBank
    };
  }, [filtered]);

  const handleSaveExpense = async () => {
    if (!form.keterangan.trim() || !form.jumlah || isNaN(Number(form.jumlah)) || Number(form.jumlah) <= 0) return;
    const jumlah = Math.abs(Number(form.jumlah));
    const si = SUMBER_OPTIONS.find(s => s.value === form.sumber)!;

    const noAkunBeban = currentTab === 'toko' ? '2-1210' : '5-9999';
    const namaAkunBeban = currentTab === 'toko' ? 'TOKO FHRCAR / Beban Toko' : 'Beban Operasional Bengkel';

    const entryData = {
      tanggal: form.tanggal,
      ref: '',
      keterangan: form.keterangan,
      noAkunDebet: noAkunBeban,
      namaAkunDebet: namaAkunBeban,
      debet: jumlah,
      noAkunKredit: si.noAkun,
      namaAkunKredit: si.label,
      kredit: jumlah,
      type: 'manual_pengeluaran',
      sumberDana: form.sumber,
      kategoriJurnal: currentTab,
      isManual: true
    };

    if (editingManual) {
      await updateJournalEntry(editingManual.id, entryData);
    } else {
      await addJournalEntry(entryData);
    }

    setShowAddModal(false);
    setEditingManual(null);
    resetForm();
  };

  const delManual = async (id: string) => {
    await deleteJournalEntry(id);
  };

  const editManual = (entry: JurnalEntry) => {
    setEditingManual(entry);
    setForm({
      tanggal: entry.tanggal,
      keterangan: entry.keterangan,
      jumlah: String(entry.kredit || entry.debet),
      sumber: (entry.sumberDana === 'kas_tangan' ? 'kas_tangan' : 'bank_mandiri')
    });
    setShowAddModal(true);
  };

  const resetForm = () => setForm({ tanggal: isoToday(), keterangan: '', jumlah: '', sumber: 'kas_tangan' });

  const totalDebet = filtered.reduce((s, e) => s + e.debet, 0);
  const totalKredit = filtered.reduce((s, e) => s + e.kredit, 0);
  const isBalanced = Math.abs(totalDebet - totalKredit) < 1;

  // Background persis Excel user: Pendapatan Cash & TF berarsir merah muda/rose lembut
  const typeColor = (e: JurnalEntry) => {
    if (e.isHPP) return 'bg-slate-50';
    if (e.type === 'pendapatan_cash' || e.type === 'pendapatan_tf') return 'bg-rose-50/75 hover:bg-rose-100/70 border-b border-rose-100';
    if (e.type === 'manual_pengeluaran') return 'bg-white hover:bg-slate-50/80';
    return '';
  };

  const typeBadge = (e: JurnalEntry) => {
    if (e.isHPP) return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">HPP</span>;
    if (e.type === 'pendapatan_cash') return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-200/80 text-rose-800">CASH</span>;
    if (e.type === 'pendapatan_tf') return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-200/80 text-rose-800">TF</span>;
    if (e.type === 'manual_pengeluaran') return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">KELUAR</span>;
    return null;
  };

  const switchTab = (tab: KategoriJurnal) => {
    setCurrentTab(tab);
    onNavigate(tab === 'toko' ? 'crm-jurnal-toko' : 'crm-jurnal-bengkel');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pb-12">
      {/* ── TOP HEADER ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          
          <div className="flex items-center gap-3">
            <div className={'w-9 h-9 rounded-xl flex items-center justify-center shadow-md ' + (
              currentTab === 'toko'
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600'
                : 'bg-gradient-to-br from-emerald-600 to-teal-600'
            )}>
              {currentTab === 'toko' ? <Store className="w-5 h-5 text-white" /> : <Wrench className="w-5 h-5 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-800 leading-tight">
                  {currentTab === 'toko' ? 'Jurnal Toko (Penjualan Sparepart)' : 'Jurnal Bengkel (Pendapatan Jasa)'}
                </h1>
                <span className={'text-[10px] font-extrabold px-2 py-0.5 rounded-full ' + (
                  currentTab === 'toko' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                )}>
                  {currentTab === 'toko' ? 'SPAREPART' : 'JASA SERVIS'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {currentTab === 'toko'
                  ? 'Total penjualan sparepart per hari otomatis + pengeluaran toko'
                  : 'Total pendapatan jasa per hari otomatis + pengeluaran bengkel'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* TAB SWITCHER */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => switchTab('toko')}
                className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ' + (
                  currentTab === 'toko'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <Store className="w-3.5 h-3.5" /> Jurnal Toko
              </button>
              <button
                onClick={() => switchTab('bengkel')}
                className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ' + (
                  currentTab === 'bengkel'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <Wrench className="w-3.5 h-3.5" /> Jurnal Bengkel
              </button>
            </div>

            <button onClick={() => setShowSummary(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              {showSummary ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showSummary ? 'Sembunyikan' : 'Tampilkan'} Ringkasan
            </button>

            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              <Printer className="w-3.5 h-3.5" /> Cetak
            </button>

            <button
              onClick={() => { setEditingManual(null); resetForm(); setShowAddModal(true); }}
              className={'flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-black shadow-md transition-all ' + (
                currentTab === 'toko'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200 hover:from-blue-700 hover:to-indigo-700'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-200 hover:from-emerald-700 hover:to-teal-700'
              )}
            >
              <Plus className="w-3.5 h-3.5" /> + Tambah Pengeluaran
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 pt-5 space-y-4">
        {/* ── FILTER BAR ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3.5 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Pilih Periode Bulan</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => handleMonthChange(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Dari Tanggal</label>
            <input type="date" value={filterDateFrom} onChange={e => { setFilterDateFrom(e.target.value); setSelectedMonth(''); }} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Sampai Tanggal</label>
            <input type="date" value={filterDateTo} onChange={e => { setFilterDateTo(e.target.value); setSelectedMonth(''); }} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Tipe Transaksi</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-[160px]">
              <option value="semua">Semua Transaksi</option>
              <option value="cash">Cash Saja</option>
              <option value="tf">Transfer Saja</option>
              <option value="pengeluaran">Pengeluaran Saja</option>
            </select>
          </div>

          {currentTab === 'toko' && (
            <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
              <div onClick={() => setShowHPP(v => !v)} className={'w-9 h-5 rounded-full relative transition-colors cursor-pointer ' + (showHPP ? 'bg-blue-500' : 'bg-slate-200')}>
                <div className={'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ' + (showHPP ? 'translate-x-4' : 'translate-x-0.5')} />
              </div>
              <span className="text-xs font-semibold text-slate-600">Tampilkan HPP</span>
            </label>
          )}

          <div className="ml-auto self-end pb-1">
            <span className="text-xs text-slate-400 font-medium">
              Periode: <span className="font-bold text-slate-700">{formatDate(filterDateFrom)} — {formatDate(filterDateTo)}</span> ({filtered.length} baris)
            </span>
          </div>
        </div>

        {/* ── SUMMARY CARDS ── */}
        {showSummary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: 'Cash Masuk',
                value: summary.totalCash,
                Icon: Banknote,
                bg: 'bg-emerald-50',
                ring: 'ring-emerald-200',
                iconBg: 'bg-emerald-500',
                text: 'text-emerald-700',
                sub: currentTab === 'toko' ? 'Total sparepart cash' : 'Total jasa cash'
              },
              {
                label: 'Transfer Masuk',
                value: summary.totalTF,
                Icon: CreditCard,
                bg: 'bg-blue-50',
                ring: 'ring-blue-200',
                iconBg: 'bg-blue-500',
                text: 'text-blue-700',
                sub: currentTab === 'toko' ? 'Total sparepart TF' : 'Total jasa TF'
              },
              {
                label: 'Keluar Kas',
                value: summary.totalPKas,
                Icon: ArrowDownRight,
                bg: 'bg-red-50',
                ring: 'ring-red-200',
                iconBg: 'bg-red-500',
                text: 'text-red-700',
                sub: 'Pengeluaran kas di tangan'
              },
              {
                label: 'Keluar Bank',
                value: summary.totalPBank,
                Icon: Building2,
                bg: 'bg-orange-50',
                ring: 'ring-orange-200',
                iconBg: 'bg-orange-500',
                text: 'text-orange-700',
                sub: 'Pengeluaran transfer bank'
              },
              {
                label: 'Saldo Kas di Tangan',
                value: summary.saldoKas,
                Icon: Wallet,
                bg: summary.saldoKas >= 0 ? 'bg-emerald-50' : 'bg-red-50',
                ring: summary.saldoKas >= 0 ? 'ring-emerald-200' : 'ring-red-200',
                iconBg: summary.saldoKas >= 0 ? 'bg-emerald-500' : 'bg-red-500',
                text: summary.saldoKas >= 0 ? 'text-emerald-700' : 'text-red-700',
                sub: 'Cash - Keluar Kas'
              },
              {
                label: 'Saldo Bank',
                value: summary.saldoBank,
                Icon: BarChart3,
                bg: summary.saldoBank >= 0 ? 'bg-blue-50' : 'bg-red-50',
                ring: summary.saldoBank >= 0 ? 'ring-blue-200' : 'ring-red-200',
                iconBg: summary.saldoBank >= 0 ? 'bg-blue-500' : 'bg-red-500',
                text: summary.saldoBank >= 0 ? 'text-blue-700' : 'text-red-700',
                sub: 'TF - Keluar Bank'
              },
            ].map((c, i) => (
              <div key={i} className={'rounded-2xl p-3.5 ring-1 ' + c.bg + ' ' + c.ring}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide leading-tight">{c.label}</span>
                  <div className={'w-7 h-7 rounded-lg ' + c.iconBg + ' flex items-center justify-center'}>
                    <c.Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <p className={'text-sm font-black ' + c.text + ' leading-tight'}>{formatRp(c.value)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{c.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── JURNAL TABLE ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileText className={'w-4 h-4 ' + (currentTab === 'toko' ? 'text-blue-600' : 'text-emerald-600')} />
              <span className="text-sm font-black text-slate-800">
                {currentTab === 'toko' ? 'Jurnal Toko' : 'Jurnal Bengkel'} — {formatDate(filterDateFrom)} s/d {formatDate(filterDateTo)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-200 inline-block" /> Total Cash</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-200 inline-block" /> Total TF</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-200 inline-block" /> Pengeluaran Manual</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] whitespace-nowrap">TANGGAL</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] whitespace-nowrap">REF</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] min-w-[220px]">KETERANGAN</th>
                  <th className="px-3 py-2.5 text-center font-bold text-[11px]">TIPE</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] whitespace-nowrap">NO AKUN (D)</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] min-w-[130px]">NAMA AKUN (D)</th>
                  <th className="px-3 py-2.5 text-right font-bold text-[11px] text-emerald-300 whitespace-nowrap">DEBET</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] whitespace-nowrap">NO AKUN (K)</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] min-w-[130px]">NAMA AKUN (K)</th>
                  <th className="px-3 py-2.5 text-right font-bold text-[11px] text-red-300 whitespace-nowrap">KREDIT</th>
                  <th className="px-3 py-2.5 text-center font-bold text-[11px]">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={11} className="px-4 py-14 text-center text-slate-400 text-xs">
                    <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    Belum ada transaksi pada periode ini.<br />
                    <span className="text-[11px]">
                      {currentTab === 'toko'
                        ? 'Transaksi sparepart otomatis muncul dari SPK, atau klik "+ Tambah Pengeluaran".'
                        : 'Transaksi jasa otomatis muncul dari SPK, atau klik "+ Tambah Pengeluaran".'}
                    </span>
                  </td></tr>
                )}
                {filtered.map((entry, idx) => {
                  const isNewDate = idx === 0 || entry.tanggal !== filtered[idx - 1].tanggal;
                  return (
                    <tr
                      key={entry.id}
                      className={'hover:brightness-95 transition-all ' + typeColor(entry) + (isNewDate && idx > 0 ? ' border-t-2 border-slate-300' : ' border-b border-slate-100')}
                    >
                      <td className={'px-3 py-2.5 font-semibold whitespace-nowrap ' + (isNewDate ? 'text-slate-900 font-bold' : 'text-slate-500')}>
                        {formatDate(entry.tanggal)}
                      </td>
                      <td className="px-3 py-2.5 font-mono font-bold text-indigo-700 whitespace-nowrap">{entry.ref}</td>
                      <td className="px-3 py-2.5 text-slate-800 font-medium max-w-[280px]">
                        <div>{entry.keterangan}</div>
                      </td>
                      <td className="px-3 py-2.5 text-center">{typeBadge(entry)}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">{entry.noAkunDebet}</td>
                      <td className="px-3 py-2.5 text-slate-700 font-medium">{entry.namaAkunDebet}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-emerald-700 whitespace-nowrap">{entry.debet > 0 ? formatRp(entry.debet) : '–'}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">{entry.noAkunKredit}</td>
                      <td className="px-3 py-2.5 text-slate-700 font-medium">{entry.namaAkunKredit}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-red-600 whitespace-nowrap">{entry.kredit > 0 ? formatRp(entry.kredit) : '–'}</td>
                      <td className="px-3 py-2.5 text-center">
                        {entry.isManual ? (
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => editManual(entry)} className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 flex items-center justify-center transition-all" title="Edit"><Edit3 className="w-3 h-3" /></button>
                            <button onClick={() => delManual(entry.id)} className="w-6 h-6 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-all" title="Hapus"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 bg-slate-100 rounded">Otomatis</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-800 text-white border-t border-slate-700">
                    <td colSpan={6} className="px-3 py-3 font-black text-sm text-right">TOTAL MUTASI JURNAL</td>
                    <td className="px-3 py-3 text-right font-black text-emerald-300 text-sm whitespace-nowrap">{formatRp(totalDebet)}</td>
                    <td colSpan={2} className="px-3 py-3" />
                    <td className="px-3 py-3 text-right font-black text-red-300 text-sm whitespace-nowrap">{formatRp(totalKredit)}</td>
                    <td className="px-3 py-3" />
                  </tr>
                  <tr className="bg-slate-900 text-slate-200 text-xs">
                    <td colSpan={11} className="px-3 py-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <span>💵 Total Cash Masuk: <b className="text-emerald-400">{formatRp(summary.totalCash)}</b></span>
                          <span>💳 Total TF Masuk: <b className="text-blue-400">{formatRp(summary.totalTF)}</b></span>
                          <span>🔻 Total Pengeluaran: <b className="text-red-400">{formatRp(summary.totalPKas + summary.totalPBank)}</b></span>
                        </div>
                        <div>
                          {isBalanced
                            ? <span className="inline-flex items-center gap-1 text-emerald-400 font-bold"><CheckCircle className="w-3.5 h-3.5" /> Jurnal seimbang (balanced)</span>
                            : <span className="inline-flex items-center gap-1 text-red-400 font-bold"><AlertCircle className="w-3.5 h-3.5" /> Tidak seimbang — selisih {formatRp(Math.abs(totalDebet - totalKredit))}</span>
                          }
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* ── RINCIAN SALDO KAS & BANK ── */}
        {showSummary && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kas */}
              <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center"><Banknote className="w-4 h-4 text-white" /></div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Kas di Tangan ({currentTab === 'toko' ? 'Toko' : 'Bengkel'})</h3>
                      <p className="text-[10px] text-slate-400">Total Cash Masuk dikurangi Pengeluaran Kas di Tangan</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-xs text-slate-500">Cash Masuk ({currentTab === 'toko' ? 'Penjualan Sparepart' : 'Jasa'})</span>
                      <span className="text-xs font-bold text-emerald-700">{formatRp(summary.totalCash)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-xs text-slate-500">Pengeluaran Kas di Tangan</span>
                      <span className="text-xs font-bold text-red-600">- {formatRp(summary.totalPKas)}</span>
                    </div>
                    <div className={'flex justify-between py-2 rounded-xl px-3 ' + (summary.saldoKas >= 0 ? 'bg-emerald-50' : 'bg-red-50')}>
                      <span className="text-xs font-black text-slate-700">Saldo Kas di Tangan (Fisik)</span>
                      <span className={'text-sm font-black ' + (summary.saldoKas >= 0 ? 'text-emerald-700' : 'text-red-700')}>{formatRp(summary.saldoKas)}</span>
                    </div>
                  </div>
                </div>

                {currentTab === 'toko' && summary.totalCash > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 space-y-1.5 bg-slate-50 p-2.5 rounded-xl text-[11px]">
                    <div className="flex justify-between text-amber-800">
                      <span className="font-semibold">📦 Potongan Modal Sparepart (HPP):</span>
                      <span className="font-mono font-black">
                        - {formatRp(profitDetailsToko.totalJual > 0 ? Math.round((summary.totalCash / profitDetailsToko.totalJual) * profitDetailsToko.totalBeli) : 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-bold border-t border-slate-200 pt-1">
                      <span>💎 Estimasi Laba Bersih Kas:</span>
                      <span className="font-mono font-black">
                        {formatRp(
                          summary.saldoKas -
                          (profitDetailsToko.totalJual > 0 ? Math.round((summary.totalCash / profitDetailsToko.totalJual) * profitDetailsToko.totalBeli) : 0)
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bank */}
              <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center"><Building2 className="w-4 h-4 text-white" /></div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Bank Transfer ({currentTab === 'toko' ? 'Toko' : 'Bengkel'})</h3>
                      <p className="text-[10px] text-slate-400">Total TF Masuk dikurangi Pengeluaran Bank</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-xs text-slate-500">TF Masuk ({currentTab === 'toko' ? 'Penjualan Sparepart' : 'Jasa'})</span>
                      <span className="text-xs font-bold text-blue-700">{formatRp(summary.totalTF)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-xs text-slate-500">Pengeluaran Transfer Bank (Alat/Beban)</span>
                      <span className="text-xs font-bold text-red-600">- {formatRp(summary.totalPBank)}</span>
                    </div>
                    <div className={'flex justify-between py-2 rounded-xl px-3 ' + (summary.saldoBank >= 0 ? 'bg-blue-50' : 'bg-red-50')}>
                      <span className="text-xs font-black text-slate-700">Saldo Bank (Fisik Rekening)</span>
                      <span className={'text-sm font-black ' + (summary.saldoBank >= 0 ? 'text-blue-700' : 'text-red-700')}>{formatRp(summary.saldoBank)}</span>
                    </div>
                  </div>
                </div>

                {currentTab === 'toko' && summary.totalTF > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-dashed border-blue-200 space-y-1.5 bg-blue-50/50 p-2.5 rounded-xl text-[11px]">
                    <div className="flex justify-between text-amber-800">
                      <span className="font-semibold">📦 Potongan Modal Sparepart (HPP):</span>
                      <span className="font-mono font-black">
                        - {formatRp(profitDetailsToko.totalJual > 0 ? Math.round((summary.totalTF / profitDetailsToko.totalJual) * profitDetailsToko.totalBeli) : 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-blue-900 font-bold border-t border-blue-200/60 pt-1">
                      <span>💎 Estimasi Laba Bersih di Bank:</span>
                      <span className="font-mono font-black text-emerald-700">
                        {formatRp(
                          summary.saldoBank -
                          (profitDetailsToko.totalJual > 0 ? Math.round((summary.totalTF / profitDetailsToko.totalJual) * profitDetailsToko.totalBeli) : 0)
                        )}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      *Modal sparepart wajib disisihkan untuk restok part SPK berikutnya.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── KOTAK ANALISIS: ARUS KAS vs KEUNTUNGAN BERSIH YANG BOLEH DIAMBIL ── */}
            <div className="bg-gradient-to-br from-slate-900 via-[#101b38] to-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-slate-800 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Analisis Alokasi Saldo & Keuntungan Bersih</h4>
                    <p className="text-[11px] text-slate-300">Membedakan uang modal berjalan (kulakan) dengan profit murni yang aman ditarik</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Uang Fisik (Kas + Bank)</span>
                  <span className="text-base font-black font-mono text-white">
                    {formatRp(summary.saldoKas + summary.saldoBank)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* 1. Modal Berjalan */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center justify-between text-amber-300 mb-1">
                    <span className="font-bold text-[11px]">1. Modal Kulakan (HPP)</span>
                    <Coins size={14} />
                  </div>
                  <p className="text-sm font-black font-mono text-white">
                    {formatRp(currentTab === 'toko' ? profitDetailsToko.totalBeli : 0)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                    ⚠️ <strong>Jangan ditarik.</strong> Uang ini wajib diputar kembali untuk membeli stok sparepart baru saat ada SPK masuk.
                  </p>
                </div>

                {/* 2. Pengeluaran Toko */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center justify-between text-rose-300 mb-1">
                    <span className="font-bold text-[11px]">2. Beban / Alat Toko</span>
                    <TrendingDown size={14} />
                  </div>
                  <p className="text-sm font-black font-mono text-rose-300">
                    {formatRp(summary.totalPKas + summary.totalPBank)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                    Biaya operasional (alat cleaning, bensin, operasional bengkel) yang sudah keluar dari saldo.
                  </p>
                </div>

                {/* 3. Keuntungan Bersih Riil */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                  <div className="flex items-center justify-between text-emerald-400 mb-1">
                    <span className="font-bold text-[11px]">3. Keuntungan Bersih (Profit)</span>
                    <Wallet size={14} />
                  </div>
                  <p className="text-sm font-black font-mono text-emerald-400">
                    {formatRp(
                      currentTab === 'toko'
                        ? profitDetailsToko.totalKeuntunganKotor - (summary.totalPKas + summary.totalPBank)
                        : summary.totalPendapatan - (summary.totalPKas + summary.totalPBank)
                    )}
                  </p>
                  <p className="text-[10px] text-emerald-300/80 mt-1 leading-tight">
                    ✅ <strong>Aman Ditarik.</strong> Ini adalah profit murni toko/bengkel Anda setelah modal & beban operasional lunas.
                  </p>
                </div>
              </div>

              {/* Tips Edukasi */}
              <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 font-black">💡 Rumus Putaran:</span>
                <span>
                  Saat ada order SPK baru, gunakan uang dari <strong>Modal Kulakan</strong> untuk beli part. Saat SPK selesai dan dibayar pelanggan, uang modal akan kembali lagi ke saldo Bank + margin keuntungan baru otomatis bertambah ke <strong>Keuntungan Bersih</strong>.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── LAPORAN KEUNTUNGAN TOKO (MARGIN SPAREPART: HARGA JUAL - HARGA BELI) ── */}
        {currentTab === 'toko' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 text-white flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-black tracking-tight">Laporan Keuntungan Toko (Sparepart)</h2>
                    <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      Margin: {profitDetailsToko.marginPersen}%
                    </span>
                    <span className="bg-white/10 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Periode: {formatDate(filterDateFrom)} — {formatDate(filterDateTo)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Perhitungan keuntungan per item: (Harga Jual - Harga Beli) × Qty Terjual pada periode tanggal terpilih
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Keuntungan Kotor Toko</span>
                <span className="text-xl font-black text-emerald-400">
                  {formatRp(profitDetailsToko.totalKeuntunganKotor)}
                </span>
              </div>
            </div>

            {/* 4 KPI Summary Cards */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-500">Total Harga Jual (Omset)</span>
                  <ShoppingBag className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-base font-black text-slate-800">{formatRp(profitDetailsToko.totalJual)}</div>
                <span className="text-[10px] text-slate-400">Semua item sparepart</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-500">Total Harga Beli (Modal)</span>
                  <Coins className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-base font-black text-amber-700">{formatRp(profitDetailsToko.totalBeli)}</div>
                <span className="text-[10px] text-slate-400">HPP modal pengadaan</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black text-emerald-800">Total Keuntungan Sparepart</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-base font-black text-emerald-600">{formatRp(profitDetailsToko.totalKeuntunganKotor)}</div>
                <span className="text-[10px] text-emerald-700 font-semibold">Harga Jual - Harga Beli</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black text-indigo-800">Laba Bersih Toko</span>
                  <Wallet className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-base font-black text-indigo-600">
                  {formatRp(profitDetailsToko.totalKeuntunganKotor - (summary.totalPKas + summary.totalPBank))}
                </div>
                <span className="text-[10px] text-indigo-600 font-semibold">Setelah Beban Toko</span>
              </div>
            </div>

            {/* Rincian Per Item Sparepart */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-center font-bold w-12">NO</th>
                    <th className="px-3 py-2.5 text-left font-bold min-w-[200px]">NAMA SPAREPART</th>
                    <th className="px-3 py-2.5 text-center font-bold w-20">QTY</th>
                    <th className="px-3 py-2.5 text-right font-bold min-w-[120px] text-amber-800">HARGA BELI (MODAL)</th>
                    <th className="px-3 py-2.5 text-right font-bold min-w-[120px] text-blue-800">HARGA JUAL</th>
                    <th className="px-3 py-2.5 text-right font-bold min-w-[130px] text-emerald-700">KEUNTUNGAN / PCS</th>
                    <th className="px-3 py-2.5 text-right font-bold min-w-[140px] text-emerald-700">TOTAL KEUNTUNGAN</th>
                  </tr>
                </thead>
                <tbody>
                  {profitDetailsToko.items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        Belum ada data penjualan sparepart pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    profitDetailsToko.items.map((item, idx) => {
                      const untungPerPcs = item.hargaJual - item.hargaBeli;
                      return (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                          <td className="px-3 py-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-2.5 font-bold text-slate-800">{item.nama}</td>
                          <td className="px-3 py-2.5 text-center font-bold">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">{item.qty}</span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium text-amber-800">{formatRp(item.hargaBeli)}</td>
                          <td className="px-3 py-2.5 text-right font-medium text-blue-800">{formatRp(item.hargaJual)}</td>
                          <td className="px-3 py-2.5 text-right font-bold text-emerald-700">
                            +{formatRp(untungPerPcs)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-black text-emerald-700 bg-emerald-50/30">
                            {formatRp(item.keuntungan)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {profitDetailsToko.items.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-800 text-white font-black">
                      <td colSpan={2} className="px-3 py-3 text-right text-xs">TOTAL KESELURUHAN</td>
                      <td className="px-3 py-3 text-center text-xs">
                        {profitDetailsToko.items.reduce((s, i) => s + i.qty, 0)}
                      </td>
                      <td className="px-3 py-3 text-right text-xs text-amber-300">{formatRp(profitDetailsToko.totalBeli)}</td>
                      <td className="px-3 py-3 text-right text-xs text-blue-300">{formatRp(profitDetailsToko.totalJual)}</td>
                      <td className="px-3 py-3 text-right text-xs text-emerald-300">Total Untung</td>
                      <td className="px-3 py-3 text-right text-sm text-emerald-300 whitespace-nowrap bg-slate-900">
                        {formatRp(profitDetailsToko.totalKeuntunganKotor)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        ) : (
          /* Tab Bengkel - Laporan Keuntungan & Rincian Jasa */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
            <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-4 text-white flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-black tracking-tight">Laporan Pendapatan Jasa Bengkel</h2>
                    <span className="bg-teal-500/20 border border-teal-400/40 text-teal-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      JASA SERVIS
                    </span>
                    <span className="bg-white/10 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Periode: {formatDate(filterDateFrom)} — {formatDate(filterDateTo)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Total pendapatan pengerjaan jasa servis dikurangi operasional bengkel pada periode terpilih
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Laba Bersih Bengkel</span>
                <span className="text-xl font-black text-teal-400">
                  {formatRp(summary.totalCash + summary.totalTF - (summary.totalPKas + summary.totalPBank))}
                </span>
              </div>
            </div>

            {/* 4 KPI Summary Cards */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-500">Total Pendapatan Jasa</span>
                  <Wrench className="w-4 h-4 text-teal-500" />
                </div>
                <div className="text-base font-black text-teal-700">{formatRp(summary.totalCash + summary.totalTF)}</div>
                <span className="text-[10px] text-slate-400">Cash + TF Jasa</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-500">Biaya Operasional Bengkel</span>
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-base font-black text-red-600">{formatRp(summary.totalPKas + summary.totalPBank)}</div>
                <span className="text-[10px] text-slate-400">Pengeluaran Kas & Bank</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-teal-200 bg-teal-50/40 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black text-teal-800">Laba Bersih Bengkel</span>
                  <Coins className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-base font-black text-teal-600">
                  {formatRp(summary.totalCash + summary.totalTF - (summary.totalPKas + summary.totalPBank))}
                </div>
                <span className="text-[10px] text-teal-700 font-semibold">Pendapatan - Beban Bengkel</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black text-blue-800">Pekerjaan Jasa</span>
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-base font-black text-blue-700">
                  {profitDetailsBengkel.totalCount} <span className="text-xs font-semibold text-slate-500">Tindakan</span>
                </div>
                <span className="text-[10px] text-blue-600 font-semibold">Total pengerjaan servis</span>
              </div>
            </div>

            {/* Rincian Jenis Jasa Servis yang Dikerjakan */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-center font-bold w-12">NO</th>
                    <th className="px-3 py-2.5 text-left font-bold min-w-[220px]">NAMA JASA SERVIS</th>
                    <th className="px-3 py-2.5 text-center font-bold w-28">JUMLAH SPK/TINDAKAN</th>
                    <th className="px-3 py-2.5 text-right font-bold min-w-[140px] text-teal-800">RATA-RATA TARIF</th>
                    <th className="px-3 py-2.5 text-right font-bold min-w-[160px] text-teal-800">TOTAL PENDAPATAN JASA</th>
                  </tr>
                </thead>
                <tbody>
                  {profitDetailsBengkel.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        Belum ada data pengerjaan jasa servis pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    profitDetailsBengkel.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                        <td className="px-3 py-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-2.5 font-bold text-slate-800">{item.nama}</td>
                        <td className="px-3 py-2.5 text-center font-bold">
                          <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg">{item.count}x</span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-slate-600">
                          {formatRp(Math.round(item.total / item.count))}
                        </td>
                        <td className="px-3 py-2.5 text-right font-black text-teal-700 bg-teal-50/30">
                          {formatRp(item.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {profitDetailsBengkel.items.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-800 text-white font-black">
                      <td colSpan={2} className="px-3 py-3 text-right text-xs">TOTAL KESELURUHAN JASA</td>
                      <td className="px-3 py-3 text-center text-xs">
                        {profitDetailsBengkel.totalCount} Tindakan
                      </td>
                      <td className="px-3 py-3 text-right text-xs text-slate-300">-</td>
                      <td className="px-3 py-3 text-right text-sm text-teal-300 whitespace-nowrap bg-slate-900">
                        {formatRp(profitDetailsBengkel.totalJasa)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL TAMBAH PENGELUARAN MANUAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className={'px-5 py-4 flex items-center justify-between sticky top-0 z-10 text-white ' + (
              currentTab === 'toko'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600'
            )}>
              <div>
                <h2 className="text-base font-black">
                  {editingManual ? 'Edit Pengeluaran' : ('+ Tambah Pengeluaran ' + (currentTab === 'toko' ? 'Toko' : 'Bengkel'))}
                </h2>
                <p className="text-[11px] opacity-80">Catat biaya operasional & belanja manual</p>
              </div>
              <button onClick={() => { setShowAddModal(false); setEditingManual(null); resetForm(); }}
                className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Tanggal */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Keterangan / Pengeluaran</label>
                <input
                  type="text"
                  placeholder={currentTab === 'toko' ? 'Contoh: BELI PER, BEI SPAREPART CASH, ANGGARAN BENSIN...' : 'Contoh: BELI MAJUN, OLI TES, MAKAN SIANG MEKANIK...'}
                  value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>

              {/* Jumlah */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Jumlah Pengeluaran (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                  <input type="number" placeholder="0" value={form.jumlah} onChange={e => setForm(f => ({ ...f, jumlah: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300" min="0" />
                </div>
                {form.jumlah && !isNaN(Number(form.jumlah)) && <p className="text-[11px] text-slate-400 mt-1 ml-1">{formatRp(Number(form.jumlah))}</p>}
              </div>

              {/* Sumber Dana (Ambil Dari) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">⬇ Ambil dari (Sumber Dana)</label>
                <div className="space-y-2">
                  {SUMBER_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, sumber: opt.value }))}
                      className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ' + (form.sumber === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')}>
                      <div className={'w-7 h-7 rounded-lg flex items-center justify-center ' + (form.sumber === opt.value ? 'bg-blue-500' : 'bg-slate-100')}>
                        {opt.value === 'kas_tangan' ? <Banknote className={'w-3.5 h-3.5 ' + (form.sumber === opt.value ? 'text-white' : 'text-slate-400')} /> : <Building2 className={'w-3.5 h-3.5 ' + (form.sumber === opt.value ? 'text-white' : 'text-slate-400')} />}
                      </div>
                      <div className="text-left flex-1">
                        <div className="text-xs font-black">{opt.label}</div>
                        <div className="text-[10px] text-slate-400">
                          {opt.value === 'kas_tangan' ? 'Mengurangi saldo Kas di Tangan (Cash)' : 'Mengurangi saldo rekening Bank (TF)'}
                        </div>
                      </div>
                      {form.sumber === opt.value && <CheckCircle className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {form.jumlah && !isNaN(Number(form.jumlah)) && Number(form.jumlah) > 0 && (
                <div className="rounded-xl p-3 text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                  ⬇ {formatRp(Number(form.jumlah))} akan dikurangi dari {SUMBER_OPTIONS.find(s => s.value === form.sumber)?.label}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button onClick={() => { setShowAddModal(false); setEditingManual(null); resetForm(); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all">Batal</button>
                <button
                  onClick={handleSaveExpense}
                  disabled={!form.keterangan.trim() || !form.jumlah || isNaN(Number(form.jumlah)) || Number(form.jumlah) <= 0}
                  className={'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-black shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all ' + (
                    currentTab === 'toko'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200 hover:from-blue-700 hover:to-indigo-700'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-200 hover:from-emerald-700 hover:to-teal-700'
                  )}
                >
                  <Save className="w-4 h-4" />{editingManual ? 'Simpan Perubahan' : 'Simpan Pengeluaran'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
