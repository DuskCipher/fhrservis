import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Plus, Trash2, Printer, X,
  Wallet, CreditCard, Building2, AlertCircle, CheckCircle,
  Edit3, Save, ArrowUpRight, ArrowDownRight, FileText, Banknote, BarChart3,
  Eye, EyeOff
} from 'lucide-react';
import { CRMOrder } from '../../types';
import {
  subscribeToJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  JournalEntryModel,
  getLocalJournalEntries
} from '../../lib/firestoreService';

const uid = () => Math.random().toString(36).substring(2, 9);
const formatRp = (n: number) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');
const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};
const isoToday = () => new Date().toISOString().split('T')[0];

type SumberDana = 'kas_tangan' | 'bank_mandiri1' | 'bank_mandiri2';

type JurnalEntry = JournalEntryModel;

interface ManualForm {
  tanggal: string; keterangan: string; jumlah: string;
  tipe: 'pengeluaran' | 'pemasukan'; sumber: SumberDana;
}
const SUMBER_OPTIONS: { value: SumberDana; label: string; noAkun: string }[] = [
  { value: 'kas_tangan',    label: 'Kas di Tangan',    noAkun: '1-1120' },
  { value: 'bank_mandiri1', label: 'Bank - Mandiri 1', noAkun: '1-1210' },
  { value: 'bank_mandiri2', label: 'Bank - Mandiri 2', noAkun: '1-1220' },
];

function generateJurnalFromOrders(orders: CRMOrder[]): JurnalEntry[] {
  const entries: JurnalEntry[] = [];
  let refCounter = 1;
  const makeRef = () => 'JU-' + String(refCounter++).padStart(3, '0');
  const sorted = [...orders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  for (const order of sorted) {
    if (!order.totalPrice || order.totalPrice === 0) continue;
    if (order.status === 'cancelled') continue;
    const tanggal = order.createdAt?.split('T')[0] || isoToday();
    const metode = order.metodePembayaran || 'cash';
    const spkRef = order.spkNumber || order.id;
    const totalSparepart = (order.spareparts || []).reduce((s, p) => s + p.hargaSatuan * p.qty, 0);
    const totalJasa = (order.jasaList || []).reduce((s, j) => s + j.harga, 0);
    const grandTotal = Math.max(0, totalSparepart + totalJasa - (order.diskon || 0));
    if (grandTotal === 0) continue;
    let noAkunKas = '1-1120', namaAkunKas = 'Kas di Tangan', typeEntry = 'pendapatan_cash';
    if (metode === 'transfer') { noAkunKas = '1-1210'; namaAkunKas = 'Bank - Mandiri 1'; typeEntry = 'pendapatan_tf1'; }
    else if (metode === 'kredit') { noAkunKas = '1-1342'; namaAkunKas = 'Pelanggan Lain'; typeEntry = 'pendapatan_piutang'; }
    const lbl = metode === 'cash' ? 'Pendapatan Cash' : 'Pendapatan TF/Qris/EDC';
    if (totalSparepart > 0) {
      entries.push({ id: uid(), tanggal, ref: makeRef(), keterangan: lbl + ' - Sparepart SPK ' + spkRef + ' (' + (order.customerName || '') + ')', noAkunDebet: noAkunKas, namaAkunDebet: namaAkunKas, debet: totalSparepart, noAkunKredit: '4-1001', namaAkunKredit: 'Penjualan Sparepart', kredit: totalSparepart, type: typeEntry, spkId: order.id, spkNumber: spkRef });
      const hpp = Math.round((order.spareparts || []).reduce((s, p) => s + p.qty * p.hargaSatuan * 0.7, 0));
      if (hpp > 0) entries.push({ id: uid(), tanggal, ref: makeRef(), keterangan: 'HPP Sparepart SPK ' + spkRef, noAkunDebet: '5-1000', namaAkunDebet: 'Harga Pokok Penjualan (HPP)', debet: hpp, noAkunKredit: '1-1400', namaAkunKredit: 'Persediaan Barang Dagangan', kredit: hpp, type: 'hpp', isHPP: true, spkId: order.id, spkNumber: spkRef });
    }
    if (totalJasa > 0) entries.push({ id: uid(), tanggal, ref: makeRef(), keterangan: lbl + ' - Jasa SPK ' + spkRef + ' (' + (order.customerName || '') + ')', noAkunDebet: noAkunKas, namaAkunDebet: namaAkunKas, debet: totalJasa, noAkunKredit: '4-1002', namaAkunKredit: 'Penjualan Jasa', kredit: totalJasa, type: typeEntry, spkId: order.id, spkNumber: spkRef });
  }
  return entries;
}

interface CRMJurnalProps { orders: CRMOrder[]; onNavigate: (page: any) => void; }

export function CRMJurnal({ orders, onNavigate }: CRMJurnalProps) {
  const today = isoToday();
  const firstDayMonth = today.substring(0, 8) + '01';
  const [filterDateFrom, setFilterDateFrom] = useState<string>(firstDayMonth);
  const [filterDateTo, setFilterDateTo] = useState<string>(today);
  const [filterType, setFilterType] = useState<string>('semua');
  const [showHPP, setShowHPP] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingManual, setEditingManual] = useState<JurnalEntry | null>(null);
  const [manualEntries, setManualEntries] = useState<JurnalEntry[]>(getLocalJournalEntries);
  const [showSummary, setShowSummary] = useState(true);
  const [form, setForm] = useState<ManualForm>({ tanggal: today, keterangan: '', jumlah: '', tipe: 'pengeluaran', sumber: 'kas_tangan' });

  // Subscribe to cloud journal entries in real-time
  useEffect(() => {
    const unsub = subscribeToJournalEntries((entries) => {
      setManualEntries(entries);
    });
    return () => unsub();
  }, []);

  const spkEntries = useMemo(() => generateJurnalFromOrders(orders), [orders]);

  const allEntries = useMemo(() => {
    return [...spkEntries, ...manualEntries].sort((a, b) => {
      const dt = a.tanggal.localeCompare(b.tanggal); return dt !== 0 ? dt : a.ref.localeCompare(b.ref);
    });
  }, [spkEntries, manualEntries]);

  const entriesWithRef = useMemo(() => {
    let c = 1;
    return allEntries.map(e => ({ ...e, ref: 'JU-' + String(c++).padStart(3, '0') }));
  }, [allEntries]);

  const filtered = useMemo(() => entriesWithRef.filter(e => {
    if (e.tanggal < filterDateFrom || e.tanggal > filterDateTo) return false;
    if (!showHPP && e.isHPP) return false;
    if (filterType === 'cash' && e.type !== 'pendapatan_cash') return false;
    if (filterType === 'tf' && e.type !== 'pendapatan_tf1') return false;
    if (filterType === 'pengeluaran' && e.type !== 'manual_pengeluaran') return false;
    if (filterType === 'pemasukan' && e.type !== 'manual_pemasukan') return false;
    return true;
  }), [entriesWithRef, filterDateFrom, filterDateTo, filterType, showHPP]);

  const summary = useMemo(() => {
    let totalCash = 0, totalTF = 0, totalPKas = 0, totalPBank = 0;
    for (const e of filtered) {
      if (e.isHPP) continue;
      if (e.type === 'pendapatan_cash') totalCash += e.debet;
      if (e.type === 'pendapatan_tf1') totalTF += e.debet;
      if (e.type === 'manual_pengeluaran') { if (e.sumberDana === 'kas_tangan') totalPKas += e.kredit; else totalPBank += e.kredit; }
    }
    return { totalCash, totalTF, totalPKas, totalPBank, saldoKas: totalCash - totalPKas, saldoBank: totalTF - totalPBank };
  }, [filtered]);

  const handleSaveManual = async () => {
    if (!form.keterangan.trim() || !form.jumlah || isNaN(Number(form.jumlah)) || Number(form.jumlah) <= 0) return;
    const jumlah = Math.abs(Number(form.jumlah));
    const si = SUMBER_OPTIONS.find(s => s.value === form.sumber)!;
    const entryData = form.tipe === 'pengeluaran'
      ? { tanggal: form.tanggal, ref: '', keterangan: form.keterangan, noAkunDebet: '5-9999', namaAkunDebet: 'Beban Operasional', debet: jumlah, noAkunKredit: si.noAkun, namaAkunKredit: si.label, kredit: jumlah, type: 'manual_pengeluaran', sumberDana: form.sumber, isManual: true }
      : { tanggal: form.tanggal, ref: '', keterangan: form.keterangan, noAkunDebet: si.noAkun, namaAkunDebet: si.label, debet: jumlah, noAkunKredit: '4-9999', namaAkunKredit: 'Pendapatan Lain-lain', kredit: jumlah, type: 'manual_pemasukan', sumberDana: form.sumber, isManual: true };

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
    setForm({ tanggal: entry.tanggal, keterangan: entry.keterangan, jumlah: String(entry.type === 'manual_pengeluaran' ? entry.kredit : entry.debet), tipe: entry.type === 'manual_pengeluaran' ? 'pengeluaran' : 'pemasukan', sumber: entry.sumberDana || 'kas_tangan' });
    setShowAddModal(true);
  };
  const resetForm = () => setForm({ tanggal: isoToday(), keterangan: '', jumlah: '', tipe: 'pengeluaran', sumber: 'kas_tangan' });
  const totalDebet = filtered.reduce((s, e) => s + e.debet, 0);
  const totalKredit = filtered.reduce((s, e) => s + e.kredit, 0);
  const isBalanced = Math.abs(totalDebet - totalKredit) < 1;

  const typeColor = (e: JurnalEntry) => {
    if (e.isHPP) return 'bg-slate-50';
    if (e.type === 'pendapatan_cash') return 'bg-emerald-50/60';
    if (e.type === 'pendapatan_tf1') return 'bg-blue-50/60';
    if (e.type === 'manual_pengeluaran') return 'bg-red-50/60';
    if (e.type === 'manual_pemasukan') return 'bg-violet-50/60';
    return '';
  };

  const typeBadge = (e: JurnalEntry) => {
    if (e.isHPP) return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">HPP</span>;
    if (e.type === 'pendapatan_cash') return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">CASH</span>;
    if (e.type === 'pendapatan_tf1') return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">TF</span>;
    if (e.type === 'manual_pengeluaran') return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">KELUAR</span>;
    if (e.type === 'manual_pemasukan') return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-700">MASUK</span>;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pb-12">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800 leading-tight">Jurnal Transaksi</h1>
              <p className="text-[11px] text-slate-500">Catatan keuangan otomatis SPK & entri manual</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowSummary(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              {showSummary ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showSummary ? 'Sembunyikan' : 'Tampilkan'} Ringkasan
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              <Printer className="w-3.5 h-3.5" /> Cetak
            </button>
            <button onClick={() => { setEditingManual(null); resetForm(); setShowAddModal(true); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-black shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-blue-700 transition-all">
              <Plus className="w-3.5 h-3.5" /> Tambah Entri Manual
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 pt-5 space-y-4">
        {/* FILTER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3.5 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Dari Tanggal</label>
            <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Sampai Tanggal</label>
            <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Tipe Transaksi</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[160px]">
              <option value="semua">Semua Transaksi</option>
              <option value="cash">Cash Saja</option>
              <option value="tf">Transfer Saja</option>
              <option value="pengeluaran">Pengeluaran Saja</option>
              <option value="pemasukan">Pemasukan Manual</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
            <div onClick={() => setShowHPP(v => !v)} className={'w-9 h-5 rounded-full relative transition-colors cursor-pointer ' + (showHPP ? 'bg-indigo-500' : 'bg-slate-200')}>
              <div className={'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ' + (showHPP ? 'translate-x-4' : 'translate-x-0.5')} />
            </div>
            <span className="text-xs font-semibold text-slate-600">Tampilkan HPP</span>
          </label>
          <div className="ml-auto self-end pb-1">
            <span className="text-xs text-slate-400 font-medium"><span className="font-black text-slate-700">{filtered.length}</span> entri</span>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        {showSummary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Cash Masuk', value: summary.totalCash, Icon: Banknote, bg: 'bg-emerald-50', ring: 'ring-emerald-200', iconBg: 'bg-emerald-500', text: 'text-emerald-700', sub: 'SPK bayar cash' },
              { label: 'Transfer Masuk', value: summary.totalTF, Icon: CreditCard, bg: 'bg-blue-50', ring: 'ring-blue-200', iconBg: 'bg-blue-500', text: 'text-blue-700', sub: 'SPK bayar TF/EDC' },
              { label: 'Keluar Kas', value: summary.totalPKas, Icon: ArrowDownRight, bg: 'bg-red-50', ring: 'ring-red-200', iconBg: 'bg-red-500', text: 'text-red-700', sub: 'Pengeluaran tunai' },
              { label: 'Keluar Bank', value: summary.totalPBank, Icon: Building2, bg: 'bg-orange-50', ring: 'ring-orange-200', iconBg: 'bg-orange-500', text: 'text-orange-700', sub: 'Pengeluaran bank' },
              { label: 'Saldo Kas', value: summary.saldoKas, Icon: Wallet, bg: summary.saldoKas >= 0 ? 'bg-emerald-50' : 'bg-red-50', ring: summary.saldoKas >= 0 ? 'ring-emerald-200' : 'ring-red-200', iconBg: summary.saldoKas >= 0 ? 'bg-emerald-500' : 'bg-red-500', text: summary.saldoKas >= 0 ? 'text-emerald-700' : 'text-red-700', sub: 'Cash - keluar kas' },
              { label: 'Saldo Bank', value: summary.saldoBank, Icon: BarChart3, bg: summary.saldoBank >= 0 ? 'bg-blue-50' : 'bg-red-50', ring: summary.saldoBank >= 0 ? 'ring-blue-200' : 'ring-red-200', iconBg: summary.saldoBank >= 0 ? 'bg-blue-500' : 'bg-red-500', text: summary.saldoBank >= 0 ? 'text-blue-700' : 'text-red-700', sub: 'TF - keluar bank' },
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

        {/* JURNAL TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-black text-slate-800">
                Jurnal Transaksi — {formatDate(filterDateFrom)} s/d {formatDate(filterDateTo)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-200 inline-block" /> Cash SPK</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-200 inline-block" /> Transfer SPK</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-200 inline-block" /> Pengeluaran</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-violet-200 inline-block" /> Pemasukan Manual</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] whitespace-nowrap">TANGGAL</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] whitespace-nowrap">REF</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] min-w-[200px]">KETERANGAN</th>
                  <th className="px-3 py-2.5 text-center font-bold text-[11px]">TIPE</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] whitespace-nowrap">NO AKUN</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] min-w-[130px]">NAMA AKUN (D)</th>
                  <th className="px-3 py-2.5 text-right font-bold text-[11px] text-emerald-300 whitespace-nowrap">DEBET</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] whitespace-nowrap">NO AKUN</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] min-w-[130px]">NAMA AKUN (K)</th>
                  <th className="px-3 py-2.5 text-right font-bold text-[11px] text-red-300 whitespace-nowrap">KREDIT</th>
                  <th className="px-3 py-2.5 text-center font-bold text-[11px]">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={11} className="px-4 py-14 text-center text-slate-400 text-xs">
                    <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    Belum ada entri jurnal pada periode ini.<br />
                    <span className="text-[11px]">Selesaikan SPK atau tambahkan entri manual.</span>
                  </td></tr>
                )}
                {filtered.map((entry) => (
                  <tr key={entry.id} className={'border-b border-slate-100 hover:brightness-95 transition-all ' + typeColor(entry)}>
                    <td className="px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">{formatDate(entry.tanggal)}</td>
                    <td className="px-3 py-2 font-mono font-bold text-indigo-700 whitespace-nowrap">{entry.ref}</td>
                    <td className="px-3 py-2 text-slate-700 max-w-[260px]">
                      <div className="line-clamp-2">{entry.keterangan}</div>
                      {entry.spkNumber && <span className="text-[10px] text-slate-400"># {entry.spkNumber}</span>}
                    </td>
                    <td className="px-3 py-2 text-center">{typeBadge(entry)}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-400 whitespace-nowrap">{entry.noAkunDebet}</td>
                    <td className="px-3 py-2 text-slate-700 font-medium">{entry.namaAkunDebet}</td>
                    <td className="px-3 py-2 text-right font-bold text-emerald-700 whitespace-nowrap">{entry.debet > 0 ? formatRp(entry.debet) : '–'}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-400 whitespace-nowrap">{entry.noAkunKredit}</td>
                    <td className="px-3 py-2 text-slate-700 font-medium">{entry.namaAkunKredit}</td>
                    <td className="px-3 py-2 text-right font-bold text-red-600 whitespace-nowrap">{entry.kredit > 0 ? formatRp(entry.kredit) : '–'}</td>
                    <td className="px-3 py-2 text-center">
                      {entry.isManual ? (
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => editManual(entry)} className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 flex items-center justify-center transition-all" title="Edit"><Edit3 className="w-3 h-3" /></button>
                          <button onClick={() => delManual(entry.id)} className="w-6 h-6 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-all" title="Hapus"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ) : <span className="text-[10px] text-slate-300 font-medium">SPK</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-800 text-white">
                    <td colSpan={6} className="px-3 py-3 font-black text-sm text-right">TOTAL</td>
                    <td className="px-3 py-3 text-right font-black text-emerald-300 text-sm whitespace-nowrap">{formatRp(totalDebet)}</td>
                    <td colSpan={2} className="px-3 py-3" />
                    <td className="px-3 py-3 text-right font-black text-red-300 text-sm whitespace-nowrap">{formatRp(totalKredit)}</td>
                    <td className="px-3 py-3" />
                  </tr>
                  <tr className="bg-slate-50">
                    <td colSpan={11} className="px-3 py-2 text-right text-[11px]">
                      {isBalanced
                        ? <span className="inline-flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle className="w-3.5 h-3.5" /> Jurnal seimbang (balanced)</span>
                        : <span className="inline-flex items-center gap-1 text-red-600 font-bold"><AlertCircle className="w-3.5 h-3.5" /> Tidak seimbang — selisih {formatRp(Math.abs(totalDebet - totalKredit))}</span>
                      }
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* SALDO DETAIL */}
        {showSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kas */}
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center"><Banknote className="w-4 h-4 text-white" /></div>
                <div><h3 className="text-sm font-black text-slate-800">Kas di Tangan</h3><p className="text-[10px] text-slate-400">Cash masuk dari SPK & pengeluaran kas</p></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100"><span className="text-xs text-slate-500">Cash Masuk (SPK)</span><span className="text-xs font-bold text-emerald-700">{formatRp(summary.totalCash)}</span></div>
                <div className="flex justify-between py-1.5 border-b border-slate-100"><span className="text-xs text-slate-500">Pengeluaran Kas</span><span className="text-xs font-bold text-red-600">- {formatRp(summary.totalPKas)}</span></div>
                <div className={'flex justify-between py-2 rounded-xl px-3 ' + (summary.saldoKas >= 0 ? 'bg-emerald-50' : 'bg-red-50')}>
                  <span className="text-xs font-black text-slate-700">Saldo Kas di Tangan</span>
                  <span className={'text-sm font-black ' + (summary.saldoKas >= 0 ? 'text-emerald-700' : 'text-red-700')}>{formatRp(summary.saldoKas)}</span>
                </div>
              </div>
            </div>
            {/* Bank */}
            <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center"><Building2 className="w-4 h-4 text-white" /></div>
                <div><h3 className="text-sm font-black text-slate-800">Bank (Transfer)</h3><p className="text-[10px] text-slate-400">TF masuk dari SPK & pengeluaran bank</p></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100"><span className="text-xs text-slate-500">TF Masuk (SPK)</span><span className="text-xs font-bold text-blue-700">{formatRp(summary.totalTF)}</span></div>
                <div className="flex justify-between py-1.5 border-b border-slate-100"><span className="text-xs text-slate-500">Pengeluaran Bank</span><span className="text-xs font-bold text-red-600">- {formatRp(summary.totalPBank)}</span></div>
                <div className={'flex justify-between py-2 rounded-xl px-3 ' + (summary.saldoBank >= 0 ? 'bg-blue-50' : 'bg-red-50')}>
                  <span className="text-xs font-black text-slate-700">Saldo Bank</span>
                  <span className={'text-sm font-black ' + (summary.saldoBank >= 0 ? 'text-blue-700' : 'text-red-700')}>{formatRp(summary.saldoBank)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH/EDIT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h2 className="text-base font-black text-white">{editingManual ? 'Edit Entri Manual' : 'Tambah Entri Manual'}</h2>
                <p className="text-[11px] text-indigo-200">Pengeluaran atau pemasukan di luar SPK</p>
              </div>
              <button onClick={() => { setShowAddModal(false); setEditingManual(null); resetForm(); }}
                className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Tipe */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Tipe Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: 'pengeluaran', label: 'Pengeluaran', Icon: ArrowDownRight, c: 'red' }, { v: 'pemasukan', label: 'Pemasukan', Icon: ArrowUpRight, c: 'emerald' }].map(opt => {
                    const active = form.tipe === opt.v;
                    return (
                      <button key={opt.v} type="button" onClick={() => setForm(f => ({ ...f, tipe: opt.v as any }))}
                        className={'flex items-center gap-2 p-3 rounded-xl border-2 font-bold text-sm transition-all ' + (active ? (opt.c === 'red' ? 'border-red-500 bg-red-50 text-red-700' : 'border-emerald-500 bg-emerald-50 text-emerald-700') : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300')}>
                        <opt.Icon className="w-4 h-4" />{opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Tanggal */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              {/* Keterangan */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Keterangan / Deskripsi</label>
                <input type="text"
                  placeholder={form.tipe === 'pengeluaran' ? 'Beli bensin, Anggaran parkir, Beli sparepart...' : 'Setoran harian, Piutang masuk...'}
                  value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              {/* Jumlah */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Jumlah (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                  <input type="number" placeholder="0" value={form.jumlah} onChange={e => setForm(f => ({ ...f, jumlah: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300" min="0" />
                </div>
                {form.jumlah && !isNaN(Number(form.jumlah)) && <p className="text-[11px] text-slate-400 mt-1 ml-1">{formatRp(Number(form.jumlah))}</p>}
              </div>
              {/* Sumber Dana */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  {form.tipe === 'pengeluaran' ? '⬇ Ambil dari (Sumber Dana)' : '⬆ Masuk ke (Akun)'}
                </label>
                <div className="space-y-2">
                  {SUMBER_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, sumber: opt.value }))}
                      className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ' + (form.sumber === opt.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')}>
                      <div className={'w-7 h-7 rounded-lg flex items-center justify-center ' + (form.sumber === opt.value ? 'bg-indigo-500' : 'bg-slate-100')}>
                        {opt.value === 'kas_tangan' ? <Banknote className={'w-3.5 h-3.5 ' + (form.sumber === opt.value ? 'text-white' : 'text-slate-400')} /> : <Building2 className={'w-3.5 h-3.5 ' + (form.sumber === opt.value ? 'text-white' : 'text-slate-400')} />}
                      </div>
                      <div className="text-left flex-1">
                        <div className="text-xs font-black">{opt.label}</div>
                        <div className="text-[10px] text-slate-400">{form.tipe === 'pengeluaran' ? ('Mengurangi saldo ' + (opt.value === 'kas_tangan' ? 'kas di tangan' : 'rekening bank')) : ('Menambah saldo ' + (opt.value === 'kas_tangan' ? 'kas di tangan' : 'rekening bank'))}</div>
                      </div>
                      {form.sumber === opt.value && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>
              {/* Preview */}
              {form.jumlah && !isNaN(Number(form.jumlah)) && Number(form.jumlah) > 0 && (
                <div className={'rounded-xl p-3 text-xs font-medium ' + (form.tipe === 'pengeluaran' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100')}>
                  {form.tipe === 'pengeluaran'
                    ? ('⬇ ' + formatRp(Number(form.jumlah)) + ' akan dikurangi dari ' + (SUMBER_OPTIONS.find(s => s.value === form.sumber)?.label))
                    : ('⬆ ' + formatRp(Number(form.jumlah)) + ' akan ditambah ke ' + (SUMBER_OPTIONS.find(s => s.value === form.sumber)?.label))}
                </div>
              )}
              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button onClick={() => { setShowAddModal(false); setEditingManual(null); resetForm(); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all">Batal</button>
                <button onClick={handleSaveManual}
                  disabled={!form.keterangan.trim() || !form.jumlah || isNaN(Number(form.jumlah)) || Number(form.jumlah) <= 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-black shadow-md shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-blue-700 transition-all">
                  <Save className="w-4 h-4" />{editingManual ? 'Simpan Perubahan' : 'Simpan Entri'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
