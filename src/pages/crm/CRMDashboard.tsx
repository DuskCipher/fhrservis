import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, Wrench, Play, CheckCircle, Clock,
  ArrowUpRight, Users, Calendar, Car, MapPin,
  MoreHorizontal, DollarSign, Activity, Zap, FileSpreadsheet,
  Award, Filter, ShieldCheck, HelpCircle, Share2,
  PieChart as PieIcon, BarChart3, LineChart as LineIcon,
  Store, Banknote, Building2, ShoppingBag, Coins, Wallet,
  ArrowDownRight, ChevronRight, Layers, Tag, Percent
} from 'lucide-react';
import { CRMOrder, CustomerItem, InventoryItem } from '../../types';
import {
  subscribeToJournalEntries,
  JournalEntryModel,
  getLocalJournalEntries,
  subscribeToInventory
} from '../../lib/firestoreService';
import { getJasaMaterialSplit } from './CRMJurnal';

interface CRMDashboardProps {
  orders: CRMOrder[];
  customers?: CustomerItem[];
  onUpdateStatus: (id: string, status: any) => void;
  onNavigate: (page: any) => void;
  onBuatSPK?: () => void;
}

const formatRp = (n: number) => 'Rp ' + (Math.round(n || 0)).toLocaleString('id-ID');
const formatRpFull = (n: number) => 'Rp ' + (Math.round(n || 0)).toLocaleString('id-ID');

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  process:   'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu', process: 'Proses', completed: 'Selesai', cancelled: 'Batal'
};

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs shadow-xl font-sans">
        <p className="text-slate-500 mb-1.5 font-bold">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
              {p.name}:
            </span>
            <span className="font-bold text-slate-900">
              {p.name?.includes('Pendapatan') || p.name?.includes('Omset') || p.name?.includes('Revenue')
                ? formatRpFull(p.value)
                : `${p.value} Data`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function CRMDashboard({ orders, customers = [], onUpdateStatus, onNavigate, onBuatSPK }: CRMDashboardProps) {
  const [journalEntries, setJournalEntries] = useState<JournalEntryModel[]>(getLocalJournalEntries);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);

  // ─── Filter Rentang Tanggal (default = bulan ini) ───
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const getMonthDateRange = (yearMonth: string) => {
    const [y, m] = yearMonth.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    return {
      from: `${yearMonth}-01`,
      to: `${yearMonth}-${String(lastDay).padStart(2, '0')}`
    };
  };
  const initialRange = getMonthDateRange(`${currentYear}-${currentMonth}`);
  const [selectedMonth, setSelectedMonth] = useState<string>(`${currentYear}-${currentMonth}`);
  const [filterDateFrom, setFilterDateFrom] = useState<string>(initialRange.from);
  const [filterDateTo, setFilterDateTo] = useState<string>(initialRange.to);

  const handleMonthChange = (ym: string) => {
    setSelectedMonth(ym);
    if (ym) {
      const range = getMonthDateRange(ym);
      setFilterDateFrom(range.from);
      setFilterDateTo(range.to);
    }
  };

  useEffect(() => {
    const unsubJ = subscribeToJournalEntries(setJournalEntries);
    const unsubI = subscribeToInventory(setInventoryList);
    return () => {
      unsubJ();
      unsubI();
    };
  }, []);

  // Filter orders berdasarkan rentang tanggal
  const periodFilteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (o.status === 'cancelled') return false;
      const tgl = (o.createdAt ? o.createdAt.split('T')[0] : (o.serviceDate || ''));
      return tgl >= filterDateFrom && tgl <= filterDateTo;
    });
  }, [orders, filterDateFrom, filterDateTo]);

  const periodFilteredJournals = useMemo(() => {
    return journalEntries.filter(e => e.tanggal >= filterDateFrom && e.tanggal <= filterDateTo);
  }, [journalEntries, filterDateFrom, filterDateTo]);

  // ─── KALKULASI FINANSIAL TOKO & BENGKEL LENGKAP ───
  const financeMetrics = useMemo(() => {
    let tokoRevenueCash = 0;
    let tokoRevenueTF = 0;
    let tokoCostCash = 0;
    let tokoCostTF = 0;

    let bengkelRevenueCash = 0;
    let bengkelRevenueTF = 0;

    let sparepartCount = 0;
    let jasaCount = 0;

    for (const ord of periodFilteredOrders) {
      const isCash = (ord.metodePembayaran || 'cash').toLowerCase() === 'cash';

      // 1. Sparepart Fisik (Toko)
      const parts = ord.spareparts || [];
      for (const p of parts) {
        if (!p.nama || p.qty <= 0) continue;
        sparepartCount += p.qty;
        const sub = (p.hargaSatuan || 0) * p.qty;
        if (isCash) tokoRevenueCash += sub;
        else tokoRevenueTF += sub;

        // Modal beli (HPP)
        const key = p.nama.trim().toLowerCase();
        const matched = inventoryList.find(i => i.name?.trim().toLowerCase() === key || i.skuCode === p.id);
        const buyPrice = matched?.buyPrice && matched.buyPrice > 0 ? matched.buyPrice : Math.round((p.hargaSatuan || 0) * 0.7);
        const modalSub = buyPrice * p.qty;

        if (isCash) tokoCostCash += modalSub;
        else tokoCostTF += modalSub;
      }

      // 2. Jasa & Material Paket (Bengkel & Toko)
      const jasaList = ord.jasaList || [];
      for (const j of jasaList) {
        if (!j.nama || j.harga <= 0) continue;
        jasaCount += 1;

        // Gunakan pemisahan porsi Bengkel (Jasa Murni) & Toko (Material Paket)
        const { porsiMaterial, porsiBengkel } = getJasaMaterialSplit(j, inventoryList);

        // Porsi Bengkel (Jasa Murni)
        if (porsiBengkel > 0) {
          if (isCash) bengkelRevenueCash += porsiBengkel;
          else bengkelRevenueTF += porsiBengkel;
        }

        // Porsi Toko (Material Paket, Modal HPP = 0)
        if (porsiMaterial > 0) {
          if (isCash) tokoRevenueCash += porsiMaterial;
          else tokoRevenueTF += porsiMaterial;
          // Modal material paket = 0
        }
      }
    }

    const tokoCost = tokoCostCash + tokoCostTF;
    const totalTokoRevenue = tokoRevenueCash + tokoRevenueTF;
    const totalTokoGrossProfit = totalTokoRevenue - tokoCost;

    const totalBengkelRevenue = bengkelRevenueCash + bengkelRevenueTF;

    // Pengeluaran Operasional Beban dari Jurnal
    let tokoExpenseKas = 0;
    let tokoExpenseBank = 0;
    let bengkelExpenseKas = 0;
    let bengkelExpenseBank = 0;

    for (const e of periodFilteredJournals) {
      if (!e.isManual) continue;
      const amount = e.kredit || e.debet || 0;
      const kat = e.kategoriJurnal || 'toko';
      const isKas = e.sumberDana === 'kas_tangan';

      if (kat === 'toko') {
        if (isKas) tokoExpenseKas += amount;
        else tokoExpenseBank += amount;
      } else {
        if (isKas) bengkelExpenseKas += amount;
        else bengkelExpenseBank += amount;
      }
    }

    const totalTokoExpense = tokoExpenseKas + tokoExpenseBank;
    const totalBengkelExpense = bengkelExpenseKas + bengkelExpenseBank;

    const netProfitToko = totalTokoGrossProfit - totalTokoExpense;
    const netProfitBengkel = totalBengkelRevenue - totalBengkelExpense;

    // Total Uang Masuk
    const totalCashIn = tokoRevenueCash + bengkelRevenueCash;
    const totalTFIn = tokoRevenueTF + bengkelRevenueTF;

    // Total Uang Keluar (Pengeluaran Beban + Pembelian Sparepart HPP)
    const totalExpenseKas = tokoExpenseKas + bengkelExpenseKas + tokoCostCash;
    const totalExpenseBank = tokoExpenseBank + bengkelExpenseBank + tokoCostTF;

    // Saldo Bersih per Entitas (Toko & Bengkel) per Metode Bayar
    const saldoKasToko  = tokoRevenueCash   - (tokoCostCash + tokoExpenseKas);
    const saldoBankToko = tokoRevenueTF     - (tokoCostTF  + tokoExpenseBank);
    const saldoKasBengkel  = bengkelRevenueCash - bengkelExpenseKas;
    const saldoBankBengkel = bengkelRevenueTF   - bengkelExpenseBank;

    // Saldo Gabungan (untuk kompatibilitas)
    const saldoKas  = saldoKasToko  + saldoKasBengkel;
    const saldoBank = saldoBankToko + saldoBankBengkel;

    const grandRevenue = totalTokoRevenue + totalBengkelRevenue;
    const grandExpense = totalTokoExpense + totalBengkelExpense;
    const grandNetProfit = netProfitToko + netProfitBengkel;

    return {
      totalTokoRevenue,
      tokoCost,
      tokoCostCash,
      tokoCostTF,
      totalTokoGrossProfit,
      totalTokoExpense,
      tokoExpenseKas,
      tokoExpenseBank,
      netProfitToko,
      tokoRevenueCash,
      tokoRevenueTF,
      sparepartCount,

      totalBengkelRevenue,
      totalBengkelExpense,
      bengkelExpenseKas,
      bengkelExpenseBank,
      netProfitBengkel,
      bengkelRevenueCash,
      bengkelRevenueTF,
      jasaCount,

      totalCashIn,
      totalTFIn,
      totalExpenseKas,
      totalExpenseBank,
      saldoKasToko,
      saldoBankToko,
      saldoKasBengkel,
      saldoBankBengkel,
      saldoKas,
      saldoBank,

      grandRevenue,
      grandExpense,
      grandNetProfit,

      marginTokoPersen: totalTokoRevenue > 0 ? Math.round((totalTokoGrossProfit / totalTokoRevenue) * 100) : 0,
      tokoRatio: grandRevenue > 0 ? Math.round((totalTokoRevenue / grandRevenue) * 100) : 0,
      bengkelRatio: grandRevenue > 0 ? Math.round((totalBengkelRevenue / grandRevenue) * 100) : 0,
      cashRatio: (totalCashIn + totalTFIn) > 0 ? Math.round((totalCashIn / (totalCashIn + totalTFIn)) * 100) : 0,
      tfRatio: (totalCashIn + totalTFIn) > 0 ? Math.round((totalTFIn / (totalCashIn + totalTFIn)) * 100) : 0,
    };
  }, [periodFilteredOrders, periodFilteredJournals, inventoryList]);

  // Tren Perbandingan Harian Toko (Sparepart) vs Bengkel (Jasa)
  const dailyFinanceComparison = useMemo(() => {
    // Hitung selisih hari antara filterDateFrom dan filterDateTo
    const from = new Date(filterDateFrom);
    const to = new Date(filterDateTo);
    const diffDays = Math.min(Math.round((to.getTime() - from.getTime()) / 86400000) + 1, 31);
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const result = [];

    for (let i = 0; i < diffDays; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      const dayDateStr = d.toISOString().split('T')[0];
      const label = `${dayNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`;

      const dayOrders = orders.filter(o => {
        if (!o.createdAt || o.status === 'cancelled') return false;
        try {
          return (o.createdAt.split('T')[0] === dayDateStr) || (o.serviceDate === dayDateStr);
        } catch {
          return false;
        }
      });

      let dayTokoRevenue = 0;
      let dayBengkelRevenue = 0;

      for (const ord of dayOrders) {
        const parts = ord.spareparts || [];
        dayTokoRevenue += parts.reduce((s, p) => s + ((p.hargaSatuan || 0) * (p.qty || 0)), 0);

        const jasaList = ord.jasaList || [];
        for (const j of jasaList) {
          if (!j.nama || j.harga <= 0) continue;
          const { porsiMaterial, porsiBengkel } = getJasaMaterialSplit(j, inventoryList);
          dayBengkelRevenue += porsiBengkel;
          dayTokoRevenue += porsiMaterial;
        }
      }

      // Day expenses
      const dayJournals = journalEntries.filter(e => e.tanggal === dayDateStr && e.isManual);
      const dayExpense = dayJournals.reduce((s, e) => s + (e.kredit || e.debet || 0), 0);

      result.push({
        day: label,
        'Jurnal Toko (Sparepart)': dayTokoRevenue,
        'Jurnal Bengkel (Jasa)': dayBengkelRevenue,
        'Pengeluaran': dayExpense,
        'Total Pendapatan': dayTokoRevenue + dayBengkelRevenue,
      });
    }
    return result;
  }, [orders, journalEntries, filterDateFrom, filterDateTo, inventoryList]);

  // Donut Data: Komposisi Omset Toko vs Bengkel
  const sourceBreakdownData = useMemo(() => [
    { name: 'Jurnal Toko (Sparepart)', value: financeMetrics.totalTokoRevenue || 0, color: '#3b82f6' },
    { name: 'Jurnal Bengkel (Jasa)', value: financeMetrics.totalBengkelRevenue || 0, color: '#0d9488' },
  ].filter(d => d.value > 0), [financeMetrics]);

  // Donut Data: Arus Pembayaran Cash vs Bank
  const paymentBreakdownData = useMemo(() => [
    { name: 'Cash (Kas di Tangan)', value: financeMetrics.totalCashIn || 0, color: '#10b981' },
    { name: 'Bank (Transfer / QRIS)', value: financeMetrics.totalTFIn || 0, color: '#6366f1' },
  ].filter(d => d.value > 0), [financeMetrics]);

  // KPI Base Counts
  const total = orders.length;
  const pending = orders.filter(o => o.status === 'pending').length;
  const process = orders.filter(o => o.status === 'process').length;
  const completed = orders.filter(o => o.status === 'completed').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;
  const emergency = orders.filter(o => o.isEmergency && o.status !== 'completed').length;

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((a, b) => a + (b.totalPrice || 0), 0);
  const pendingRevenue = orders.filter(o => o.status === 'process').reduce((a, b) => a + (b.totalPrice || 0), 0);

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const avgOrderValue = completed > 0 ? Math.round(totalRevenue / completed) : 0;

  // ─── 1. REVENUE TREND (AREA CHART) ───
  const revenueTrend = useMemo(() => {
    const from = new Date(filterDateFrom);
    const to = new Date(filterDateTo);
    const diffDays = Math.max(1, Math.min(Math.round((to.getTime() - from.getTime()) / 86400000) + 1, 31));
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const result = [];

    for (let i = 0; i < diffDays; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      const dayDateStr = d.toISOString().split('T')[0];
      const label = `${dayNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`;

      const matchingOrders = orders.filter(o => {
        if (!o.createdAt || o.status === 'cancelled') return false;
        try {
          const cDate = o.createdAt.split('T')[0];
          return cDate === dayDateStr || o.serviceDate === dayDateStr;
        } catch {
          return false;
        }
      });

      const dayRevenue = matchingOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      const dayEstimated = matchingOrders
        .filter(o => o.status === 'process')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      const daySpkCount = matchingOrders.length;
      const dayEmergencyCount = matchingOrders.filter(o => o.isEmergency).length;

      result.push({
        day: label,
        Pendapatan: dayRevenue,
        Estimasi: dayEstimated,
        SPK: daySpkCount,
        Darurat: dayEmergencyCount,
      });
    }
    return result;
  }, [orders, filterDateFrom, filterDateTo]);

  // ─── 2. STATUS DISTRIBUTION (DONUT PIE) ───
  const statusData = useMemo(() => [
    { name: 'Menunggu', value: pending, color: '#f59e0b' },
    { name: 'Proses', value: process, color: '#3b82f6' },
    { name: 'Selesai', value: completed, color: '#10b981' },
    { name: 'Batal', value: cancelled, color: '#94a3b8' },
  ].filter(d => d.value > 0), [pending, process, completed, cancelled]);

  // ─── 3. TOP SERVICES (HORIZONTAL BAR) ───
  const topServices = useMemo(() => {
    const serviceCount: Record<string, number> = {};
    orders.forEach(o => {
      if (o.serviceType) {
        serviceCount[o.serviceType] = (serviceCount[o.serviceType] || 0) + 1;
      }
    });
    return Object.entries(serviceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name: name.length > 25 ? name.slice(0, 25) + '...' : name,
        fullName: name,
        count
      }));
  }, [orders]);

  // ─── 4. CUSTOMER CLASSIFICATION (LAMA VS BARU) ───
  const customerTypeData = useMemo(() => {
    const lama = customers.filter(c => c.customerType === 'LAMA').length;
    const baru = customers.filter(c => c.customerType === 'BARU' || !c.customerType).length;
    return [
      { name: 'Pelanggan Baru', value: baru || 1, color: '#10b981' },
      { name: 'Pelanggan Lama', value: lama || 0, color: '#f59e0b' },
    ].filter(d => d.value > 0);
  }, [customers]);

  // ─── 5. CUSTOMER ACQUISITION SOURCE (BAR CHART) ───
  const customerSourceData = useMemo(() => {
    const sourceCount: Record<string, number> = {};
    customers.forEach(c => {
      const src = c.source || 'Walk-in Langsung';
      sourceCount[src] = (sourceCount[src] || 0) + 1;
    });
    return Object.entries(sourceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, jumlah]) => ({
        name: name.replace('Rekomendasi Teman/Keluarga', 'Rekomendasi'),
        jumlah
      }));
  }, [customers]);

  const recentOrders = orders.slice(0, 6);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto font-sans bg-slate-50/50 min-h-screen">

      {/* ─── Page Header ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-xs">
              <Activity size={22} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900">Dashboard & Analitik Bengkel</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Pemantauan data operasional & performa bisnis secara realtime
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Periode Bulan */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
              <Calendar size={14} className="text-slate-400 shrink-0" />
              <input
                type="month"
                value={selectedMonth}
                onChange={e => handleMonthChange(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400">Dari</span>
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => { setFilterDateFrom(e.target.value); setSelectedMonth(''); }}
                className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer w-28"
              />
              <span className="text-[10px] font-bold text-slate-400">s/d</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={e => { setFilterDateTo(e.target.value); setSelectedMonth(''); }}
                className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer w-28"
              />
            </div>

            <button
              onClick={() => onNavigate('crm-customers')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
            >
              <Users size={14} className="text-red-600" />
              <span>Database Pelanggan</span>
            </button>

            <button
              onClick={() => onBuatSPK ? onBuatSPK() : onNavigate('crm-spk-create')}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-red-600/20"
            >
              + Buat SPK Baru
            </button>
          </div>
        </div>
      </div>

      {/* ─── Row 1: KPI Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total SPK Masuk</p>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Wrench size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 leading-none">{total}</p>
          <p className="text-[11px] text-slate-400 mt-1.5">Seluruh pesanan terdaftar</p>
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 p-4 sm:p-5 shadow-xs bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Dalam Proses</p>
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Play size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-700 mt-2 leading-none">{process}</p>
          <p className="text-[11px] text-blue-600/70 mt-1.5">Unit sedang dikerjakan mekanik</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100 p-4 sm:p-5 shadow-xs bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Antrean Inspeksi</p>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-2 leading-none">{pending}</p>
          <p className="text-[11px] text-amber-600/70 mt-1.5">Tahap SA Check & konfirmasi</p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Pekerjaan Selesai</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 leading-none">{completed}</p>
          <p className="text-[11px] text-emerald-600/70 mt-1.5">{completionRate}% tingkat penyelesaian</p>
        </div>
      </div>

      {/* ─── Row 2: Revenue & Financial Highlights ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Omset Penjualan (Real)</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{formatRpFull(financeMetrics.grandRevenue)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Toko: {formatRp(financeMetrics.totalTokoRevenue)} · Bengkel: {formatRp(financeMetrics.totalBengkelRevenue)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-xs flex items-center gap-4 bg-gradient-to-br from-white to-emerald-50/40">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">Total Laba Bersih (Net Profit)</p>
            <p className="text-xl font-black text-emerald-600 mt-0.5">{formatRpFull(financeMetrics.grandNetProfit)}</p>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5">Setelah dikurangi seluruh beban operasional</p>
          </div>
        </div>

        <div className={`rounded-2xl border p-5 shadow-xs flex items-center gap-4 transition-all ${
          emergency > 0
            ? 'bg-red-50/80 border-red-300 text-red-900'
            : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            emergency > 0 ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'bg-slate-100 text-slate-500'
          }`}>
            <Zap size={24} />
          </div>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${emergency > 0 ? 'text-red-700' : 'text-slate-400'}`}>
              Panggilan Darurat Aktif
            </p>
            <p className={`text-xl font-black mt-0.5 ${emergency > 0 ? 'text-red-700' : 'text-slate-900'}`}>
              {emergency} Panggilan SOS
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {emergency > 0 ? 'Mekanik perlu segera menuju lokasi' : 'Tidak ada panggilan darurat aktif'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── SUPER SECTION: ANALITIK KEUANGAN JURNAL TOKO & JURNAL BENGKEL ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              Rp
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Performa Keuangan: Jurnal Toko & Jurnal Bengkel
              </h2>
              <p className="text-xs text-slate-500">
                Pemisahan real-time pendapatan sparepart toko vs pendapatan jasa bengkel & arus kas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('crm-jurnal-toko')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all"
            >
              <Store size={14} /> Jurnal Toko ➔
            </button>
            <button
              onClick={() => onNavigate('crm-jurnal-bengkel')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold transition-all"
            >
              <Wrench size={14} /> Jurnal Bengkel ➔
            </button>
          </div>
        </div>

        {/* 2 Big Action Cards: Toko vs Bengkel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Card 1: Jurnal Toko (Sparepart) */}
          <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center shadow-md">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Jurnal Toko (Penjualan Sparepart)</h3>
                    <p className="text-[11px] text-blue-200">Margin laba barang dagangan</p>
                  </div>
                </div>
                <span className="bg-blue-400/20 border border-blue-300/30 text-blue-200 text-[10px] font-black px-2.5 py-1 rounded-full">
                  Margin {financeMetrics.marginTokoPersen}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">Total Omset Sparepart</span>
                  <span className="text-lg font-black text-white">{formatRpFull(financeMetrics.totalTokoRevenue)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">Laba Bersih Toko</span>
                  <span className="text-lg font-black text-emerald-300">{formatRpFull(financeMetrics.netProfitToko)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-b border-slate-100">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Modal Beli (HPP)</span>
                <span className="font-bold text-amber-700">{formatRp(financeMetrics.tokoCost)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Laba Kotor Part</span>
                <span className="font-bold text-emerald-700">+{formatRp(financeMetrics.totalTokoGrossProfit)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Beban Toko</span>
                <span className="font-bold text-red-600">-{formatRp(financeMetrics.totalTokoExpense)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Item Keluar</span>
                <span className="font-bold text-slate-800">{financeMetrics.sparepartCount} Pcs</span>
              </div>
            </div>

            <div className="px-5 py-3 bg-white flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Cash: <b>{formatRp(financeMetrics.tokoRevenueCash)}</b>
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Bank: <b>{formatRp(financeMetrics.tokoRevenueTF)}</b>
              </span>
              <button onClick={() => onNavigate('crm-jurnal-toko')} className="text-blue-600 font-bold hover:underline">
                Rincian Toko ➔
              </button>
            </div>
          </div>

          {/* Card 2: Jurnal Bengkel (Jasa Servis) */}
          <div className="bg-white rounded-3xl border border-teal-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-5 bg-gradient-to-r from-teal-900 to-emerald-950 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center shadow-md">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Jurnal Bengkel (Pendapatan Jasa)</h3>
                    <p className="text-[11px] text-teal-200">Pendapatan operasional servis & perbaikan</p>
                  </div>
                </div>
                <span className="bg-teal-400/20 border border-teal-300/30 text-teal-200 text-[10px] font-black px-2.5 py-1 rounded-full">
                  {financeMetrics.jasaCount} Tindakan Servis
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">Total Pendapatan Jasa</span>
                  <span className="text-lg font-black text-white">{formatRpFull(financeMetrics.totalBengkelRevenue)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">Laba Bersih Bengkel</span>
                  <span className="text-lg font-black text-teal-300">{formatRpFull(financeMetrics.netProfitBengkel)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs border-b border-slate-100">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Omset Jasa</span>
                <span className="font-bold text-teal-700">{formatRp(financeMetrics.totalBengkelRevenue)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Beban Operasional</span>
                <span className="font-bold text-red-600">-{formatRp(financeMetrics.totalBengkelExpense)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Sisa Laba Bengkel</span>
                <span className="font-bold text-emerald-600">+{formatRp(financeMetrics.netProfitBengkel)}</span>
              </div>
            </div>

            <div className="px-5 py-3 bg-white flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Cash: <b>{formatRp(financeMetrics.bengkelRevenueCash)}</b>
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" /> Bank: <b>{formatRp(financeMetrics.bengkelRevenueTF)}</b>
              </span>
              <button onClick={() => onNavigate('crm-jurnal-bengkel')} className="text-teal-600 font-bold hover:underline">
                Rincian Bengkel ➔
              </button>
            </div>
          </div>

        </div>

        {/* ─── Arus Kas & Saldo Bersih: TOKO vs BENGKEL (dipisah) ─── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                <Wallet size={15} />
              </div>
              <div>
                <span className="text-sm font-black text-slate-900">Arus Kas &amp; Saldo Bersih — Toko vs Bengkel</span>
                <span className="ml-2 text-[10px] text-slate-400 font-medium">Periode: {filterDateFrom} s/d {filterDateTo}</span>
              </div>
            </div>
            <div className="flex gap-2 text-[10px] font-bold">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Toko (Sparepart)</span>
              <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full">Bengkel (Jasa)</span>
            </div>
          </div>

          {/* TOKO ROW */}
          <div className="border-b border-slate-100">
            <div className="px-5 py-2 bg-blue-50/60 flex items-center gap-2">
              <Store size={13} className="text-blue-700" />
              <span className="text-[11px] font-black text-blue-800 uppercase tracking-wider">Jurnal Toko (Sparepart &amp; Material)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

              {/* TOKO: KAS */}
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Banknote size={13} className="text-emerald-600" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">Kas Toko</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">↑ Cash Masuk</span>
                    <span className="font-semibold text-emerald-600">+{formatRp(financeMetrics.tokoRevenueCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">↓ HPP (Modal Beli)</span>
                    <span className="font-semibold text-orange-500">-{formatRp(financeMetrics.tokoCostCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">↓ Beban Toko</span>
                    <span className="font-semibold text-red-500">-{formatRp(financeMetrics.tokoExpenseKas)}</span>
                  </div>
                  <div className="h-px bg-emerald-100 my-1" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Saldo Bersih Kas</span>
                    <span className={`font-black text-sm ${financeMetrics.saldoKasToko >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {formatRp(financeMetrics.saldoKasToko)}
                    </span>
                  </div>
                </div>
              </div>

              {/* TOKO: BANK */}
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Building2 size={13} className="text-blue-600" />
                  <span className="text-[10px] font-black text-blue-700 uppercase tracking-wide">Bank Toko</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">↑ TF/QRIS Masuk</span>
                    <span className="font-semibold text-blue-600">+{formatRp(financeMetrics.tokoRevenueTF)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">↓ HPP (Modal Beli)</span>
                    <span className="font-semibold text-orange-500">-{formatRp(financeMetrics.tokoCostTF)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">↓ Beban Toko</span>
                    <span className="font-semibold text-red-500">-{formatRp(financeMetrics.tokoExpenseBank)}</span>
                  </div>
                  <div className="h-px bg-blue-100 my-1" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Saldo Bersih Bank</span>
                    <span className={`font-black text-sm ${financeMetrics.saldoBankToko >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                      {formatRp(financeMetrics.saldoBankToko)}
                    </span>
                  </div>
                </div>
              </div>

              {/* TOKO: LABA BERSIH */}
              <div className="p-4 bg-blue-50/40">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={13} className="text-blue-700" />
                  <span className="text-[10px] font-black text-blue-800 uppercase tracking-wide">Laba Bersih Toko</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Saldo Kas</span>
                    <span className="font-semibold text-emerald-700">{formatRp(financeMetrics.saldoKasToko)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Saldo Bank</span>
                    <span className="font-semibold text-blue-700">{formatRp(financeMetrics.saldoBankToko)}</span>
                  </div>
                  <div className="h-px bg-blue-200 my-1" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Total Laba Toko</span>
                    <span className={`font-black text-base ${financeMetrics.netProfitToko >= 0 ? 'text-blue-800' : 'text-red-600'}`}>
                      {formatRpFull(financeMetrics.netProfitToko)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BENGKEL ROW */}
          <div className="border-b border-slate-100">
            <div className="px-5 py-2 bg-teal-50/60 flex items-center gap-2">
              <Wrench size={13} className="text-teal-700" />
              <span className="text-[11px] font-black text-teal-800 uppercase tracking-wider">Jurnal Bengkel (Jasa Servis)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

              {/* BENGKEL: KAS */}
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Banknote size={13} className="text-emerald-600" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">Kas Bengkel</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">↑ Jasa Cash Masuk</span>
                    <span className="font-semibold text-emerald-600">+{formatRp(financeMetrics.bengkelRevenueCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">↓ Beban Bengkel</span>
                    <span className="font-semibold text-red-500">-{formatRp(financeMetrics.bengkelExpenseKas)}</span>
                  </div>
                  <div className="h-px bg-emerald-100 my-1" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Saldo Bersih Kas</span>
                    <span className={`font-black text-sm ${financeMetrics.saldoKasBengkel >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {formatRp(financeMetrics.saldoKasBengkel)}
                    </span>
                  </div>
                </div>
              </div>

              {/* BENGKEL: BANK */}
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Building2 size={13} className="text-teal-600" />
                  <span className="text-[10px] font-black text-teal-700 uppercase tracking-wide">Bank Bengkel</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">↑ Jasa TF/QRIS Masuk</span>
                    <span className="font-semibold text-teal-600">+{formatRp(financeMetrics.bengkelRevenueTF)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">↓ Beban Bengkel</span>
                    <span className="font-semibold text-red-500">-{formatRp(financeMetrics.bengkelExpenseBank)}</span>
                  </div>
                  <div className="h-px bg-teal-100 my-1" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Saldo Bersih Bank</span>
                    <span className={`font-black text-sm ${financeMetrics.saldoBankBengkel >= 0 ? 'text-teal-700' : 'text-red-600'}`}>
                      {formatRp(financeMetrics.saldoBankBengkel)}
                    </span>
                  </div>
                </div>
              </div>

              {/* BENGKEL: LABA BERSIH */}
              <div className="p-4 bg-teal-50/40">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={13} className="text-teal-700" />
                  <span className="text-[10px] font-black text-teal-800 uppercase tracking-wide">Laba Bersih Bengkel</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Saldo Kas</span>
                    <span className="font-semibold text-emerald-700">{formatRp(financeMetrics.saldoKasBengkel)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Saldo Bank</span>
                    <span className="font-semibold text-teal-700">{formatRp(financeMetrics.saldoBankBengkel)}</span>
                  </div>
                  <div className="h-px bg-teal-200 my-1" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Total Laba Bengkel</span>
                    <span className={`font-black text-base ${financeMetrics.netProfitBengkel >= 0 ? 'text-teal-800' : 'text-red-600'}`}>
                      {formatRpFull(financeMetrics.netProfitBengkel)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TOTAL GABUNGAN */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/60">
            <div className="p-4 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Saldo Kas</p>
              <p className={`text-base font-black ${financeMetrics.saldoKas >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {formatRpFull(financeMetrics.saldoKas)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Toko + Bengkel (Cash)</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Saldo Bank</p>
              <p className={`text-base font-black ${financeMetrics.saldoBank >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                {formatRpFull(financeMetrics.saldoBank)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Toko + Bengkel (TF/QRIS)</p>
            </div>
            <div className="p-4 text-center bg-indigo-50/60">
              <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Grand Total Bersih</p>
              <p className={`text-lg font-black ${(financeMetrics.saldoKas + financeMetrics.saldoBank) >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>
                {formatRpFull(financeMetrics.saldoKas + financeMetrics.saldoBank)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Kas + Bank semua entitas</p>
            </div>
          </div>

        </div>

        {/* ─── Chart Bar Harian Toko vs Bengkel & 2 Donut Chart ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Main Bar Chart: Perbandingan Pendapatan Toko vs Bengkel */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-blue-600" />
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    Grafik Perbandingan: Toko (Sparepart) vs Bengkel (Jasa)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Tren harian omset sparepart, pendapatan jasa, dan pengeluaran</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  Toko: {financeMetrics.tokoRatio}%
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                  Bengkel: {financeMetrics.bengkelRatio}%
                </span>
              </div>
            </div>

            <div className="h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyFinanceComparison} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatRp(v)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#64748b', paddingTop: 8 }} />
                  <Bar dataKey="Jurnal Toko (Sparepart)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Jurnal Bengkel (Jasa)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2 Donut Charts: Proporsi Sumber & Pembayaran */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <PieIcon size={18} className="text-teal-600" />
                <h3 className="font-black text-slate-900 text-sm sm:text-base">Komposisi & Arus Kas</h3>
              </div>
              <p className="text-xs text-slate-400">Rasio toko vs bengkel & metode bayar</p>
            </div>

            {/* Donut 1: Toko vs Bengkel */}
            <div className="space-y-2 border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Proporsi Omset</span>
                <span className="text-[11px] text-slate-400">Toko vs Bengkel</span>
              </div>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceBreakdownData} cx="50%" cy="50%" innerRadius={35} outerRadius={52} paddingAngle={4} dataKey="value">
                      {sourceBreakdownData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-[11px] px-1">
                <span className="text-blue-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Toko ({financeMetrics.tokoRatio}%)
                </span>
                <span className="text-teal-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-600 inline-block"></span> Bengkel ({financeMetrics.bengkelRatio}%)
                </span>
              </div>
            </div>

            {/* Donut 2: Cash vs Bank */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Metode Pembayaran</span>
                <span className="text-[11px] text-slate-400">Cash vs Bank TF</span>
              </div>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentBreakdownData} cx="50%" cy="50%" innerRadius={35} outerRadius={52} paddingAngle={4} dataKey="value">
                      {paymentBreakdownData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-[11px] px-1">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Cash ({financeMetrics.cashRatio}%)
                </span>
                <span className="text-indigo-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span> Bank TF ({financeMetrics.tfRatio}%)
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ─── Row 3: Main Charts (Revenue Area Chart + Status Donut) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <LineIcon size={18} className="text-red-600" />
                <h2 className="font-black text-slate-900 text-sm sm:text-base">Tren Omset & Pendapatan Harian</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Grafik pendapatan real dan estimasi berdasarkan periode terpilih</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                <TrendingUp size={13} /> {formatRp(totalRevenue)} Akumulasi
              </span>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradEstimated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatRp(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#64748b', paddingTop: 10 }} />
                <Area type="monotone" dataKey="Pendapatan" name="Pendapatan Real" stroke="#ef4444" strokeWidth={2.5} fill="url(#gradRevenue)" dot={{ fill: '#ef4444', r: 3 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="Estimasi" name="Estimasi Dalam Proses" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" fill="url(#gradEstimated)" dot={{ fill: '#3b82f6', r: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Donut Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieIcon size={18} className="text-red-600" />
              <h2 className="font-black text-slate-900 text-sm sm:text-base">Distribusi Status SPK</h2>
            </div>
            <p className="text-xs text-slate-400">Rasio seluruh tahapan pengerjaan SPK</p>
          </div>

          <div className="h-[170px] my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {statusData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600 font-medium">{d.name}</span>
                </div>
                <span className="font-bold text-slate-900">
                  {d.value} SPK ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── Row 4: Volume SPK Bar Chart + Top Services Horizontal ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* SPK Volume Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-red-600" />
                <h2 className="font-black text-slate-900 text-sm sm:text-base">Volume Pesanan: Reguler vs Darurat SOS</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Perbandingan jumlah SPK servis rutin dengan panggilan darurat 24 jam</p>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#64748b', paddingTop: 8 }} />
                <Bar dataKey="SPK" name="SPK Reguler" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Darurat" name="Panggilan Darurat 24 Jam" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Services */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wrench size={18} className="text-red-600" />
              <h2 className="font-black text-slate-900 text-sm sm:text-base">Layanan Terpopuler</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">Jenis servis yang paling sering dipesan pelanggan</p>
          </div>

          <div className="space-y-3.5 flex-1">
            {topServices.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-12 border border-dashed border-slate-200 rounded-2xl">
                Belum ada data layanan
              </div>
            ) : (
              topServices.map((s, i) => {
                const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                const barColors = ['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500'];
                return (
                  <div key={s.fullName}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800 truncate max-w-[180px]" title={s.fullName}>
                        {s.name}
                      </span>
                      <span className="font-bold text-slate-600">{s.count} SPK ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColors[i % barColors.length]} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* ─── Row 5: Customer Analytics Charts (Acquisition Source + Type Donut) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Customer Acquisition Sources Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Share2 size={18} className="text-red-600" />
                <h2 className="font-black text-slate-900 text-sm sm:text-base">Sumber Kedatangan Pelanggan (Channel Marketing)</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Tracking efektivitas media akuisisi pelanggan bengkel</p>
            </div>
          </div>

          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerSourceData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={110} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="jumlah" name="Jumlah Pelanggan" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Classification Donut */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award size={18} className="text-red-600" />
              <h2 className="font-black text-slate-900 text-sm sm:text-base">Komposisi Pelanggan</h2>
            </div>
            <p className="text-xs text-slate-400">Rasio Pelanggan Baru vs Pelanggan Lama (Loyal)</p>
          </div>

          <div className="h-[160px] my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={customerTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={4} dataKey="value">
                  {customerTypeData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {customerTypeData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600 font-medium">{d.name}</span>
                </div>
                <span className="font-bold text-slate-900">
                  {d.value} Orang ({customers.length > 0 ? Math.round((d.value / customers.length) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── Row 6: Recent SPK Orders Table ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-black text-slate-900 text-sm sm:text-base">Aktivitas SPK Terbaru (Realtime)</h2>
            <p className="text-xs text-slate-400 mt-0.5">Daftar Surat Perintah Kerja yang baru masuk ke sistem</p>
          </div>
          <button
            onClick={() => onNavigate('crm-orders')}
            className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            <span>Semua SPK</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3.5">NOMOR SPK</th>
                <th className="px-4 py-3.5">PELANGGAN & KENDARAAN</th>
                <th className="px-4 py-3.5">JENIS LAYANAN</th>
                <th className="px-4 py-3.5">LOKASI SERVIS</th>
                <th className="px-4 py-3.5">JADWAL</th>
                <th className="px-4 py-3.5 text-right">TOTAL ESTIMASI</th>
                <th className="px-4 py-3.5 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    Belum ada data pesanan SPK. Klik <strong>"+ Buat SPK Baru"</strong> untuk membuat pesanan pertama.
                  </td>
                </tr>
              ) : (
                recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-mono text-xs font-bold text-slate-800">#{o.id?.slice(0, 8)}</p>
                      {o.isEmergency && (
                        <span className="text-[9px] font-black text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          DARURAT 24J
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 font-black text-xs flex items-center justify-center shrink-0">
                          {o.customerName?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{o.customerName || 'Pelanggan'}</p>
                          <p className="text-[10px] text-slate-400">{o.carBrand} {o.carModel} • {o.licensePlate}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-800 max-w-[160px] truncate">{o.serviceType}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin size={11} className="shrink-0 text-slate-400" />
                        <span className="truncate max-w-[140px] text-[11px]">{o.locationAddress || 'Bengkel'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-700">{o.serviceDate || '-'}</p>
                      <p className="text-[10px] text-slate-400">{o.serviceTime || '-'}</p>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <p className="font-mono font-bold text-slate-900 text-xs">
                        {o.totalPrice ? formatRpFull(o.totalPrice) : <span className="text-slate-300">—</span>}
                      </p>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border uppercase ${
                        STATUS_STYLE[o.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {STATUS_LABEL[o.status] || o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
