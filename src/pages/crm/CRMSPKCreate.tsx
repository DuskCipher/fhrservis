import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Search, Car, User, Phone, MapPin,
  CheckCircle, AlertTriangle, XCircle, Plus, Trash2, Printer,
  Save, Clock, Wrench, FileText, ClipboardList, Receipt, CreditCard,
  Banknote, Check, ArrowLeft, Calendar, Hash, Gauge, Palette,
  Settings2, AlertCircle, Info, RefreshCw, DollarSign, Percent,
  ShoppingCart, BarChart3, ChevronDown
} from 'lucide-react';
import {
  CustomerItem, SACheckItem, SACheckResult,
  SPKSparepart, SPKJasa
} from '../../types';
import { addSPK } from '../../lib/firestoreService';

/* ─── PROPS ──────────────────────────────────────────────────────────── */
interface CRMSPKCreateProps {
  customers: CustomerItem[];
  onNavigate: (page: any) => void;
}

/* ─── HELPERS ────────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).substring(2, 9);
const formatRp = (n: number) =>
  'Rp ' + Math.round(n).toLocaleString('id-ID');

function makeCheck(label: string): SACheckItem {
  return { id: uid(), label, result: '', catatan: '' };
}

/* ─── CHECKLIST DATA ─────────────────────────────────────────────────── */
const EKSTERIOR_ITEMS = [
  'Body & Panel Pintu', 'Cat & Poles Bodi', 'Kaca Depan & Belakang',
  'Lampu Depan (Headlamp)', 'Lampu Belakang (Tailamp)',
  'Bumper Depan & Belakang', 'Spion Kiri & Kanan',
  'Wiper Depan & Belakang', 'Antena & Roof Rail', 'Handle Pintu',
].map(makeCheck);

const INTERIOR_ITEMS = [
  'Dashboard & Panel Instrumen', 'AC Kabin & Blower',
  'Audio / Head Unit', 'Kursi & Sandaran', 'Karpet & Plafon',
  'Power Window Semua Pintu', 'Sabuk Pengaman (Seatbelt)',
  'Central Lock & Alarm', 'Handle & Trim Pintu', 'Spidometer & Indikator',
].map(makeCheck);

const MESIN_ITEMS = [
  'Oli Mesin (Level & Kondisi)', 'Filter Oli', 'Filter Udara',
  'Air Radiator & Coolant', 'Aki / Baterai (Tegangan)',
  'Alternator & Dinamo Starter', 'V-Belt & Timing Belt',
  'Busi & Kabel Busi', 'Selang & Klem Radiator',
  'Sistem Bahan Bakar', 'Catalytic Converter & Knalpot', 'Kompresor AC',
].map(makeCheck);

const KAKI_ITEMS = [
  'Ban Depan (Tekanan & Keausan)', 'Ban Belakang (Tekanan & Keausan)',
  'Rem Depan (Kampas & Cakram)', 'Rem Belakang (Kampas & Tromol)',
  'Minyak Rem (Level & Kondisi)', 'Shock Absorber Depan',
  'Shock Absorber Belakang', 'Tie Rod & Ball Joint',
  'Sistem Kemudi (Steering)', 'Kopling / CVT Matic',
  'CV Joint & As Roda', 'Per / Pegas Suspensi',
].map(makeCheck);

const LPA_ITEMS = [
  'Kunci Kontak & Remote Kendaraan', 'Buku Servis & STNK',
  'Ban Serep & Toolkit', 'Dongkrak & Kunci Roda',
  'Kelengkapan Interior (Karpet, Plafon)', 'Kebersihan Eksterior',
  'Kebersihan Interior & Kabin', 'Semua Lampu Berfungsi Normal',
  'AC & Blower Berfungsi Normal', 'Audio & Elektronik Normal',
  'Power Window Semua Berfungsi', 'Rem Parkir Berfungsi',
  'Tekanan Ban Sesuai Standar', 'Tidak Ada Kebocoran Oli/Air',
].map(makeCheck);

/* ─── STEP CONFIG ────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Informasi Kendaraan', short: 'Kendaraan', icon: Car,           desc: 'Pilih pelanggan & data kendaraan' },
  { id: 2, label: 'Pengecekan SA',       short: 'Pengecekan', icon: ClipboardList, desc: 'Inspeksi 4 kategori komponen' },
  { id: 3, label: 'Nota & Biaya',        short: 'Nota',       icon: ShoppingCart,  desc: 'Sparepart, jasa & kalkulasi' },
  { id: 4, label: 'LPA',                 short: 'LPA',        icon: FileText,      desc: 'Lembar pemeriksaan akhir' },
  { id: 5, label: 'Nota Akhir',          short: 'Selesai',    icon: Receipt,       desc: 'Pembayaran & cetak nota' },
];

/* ─── STATUS BADGE ───────────────────────────────────────────────────── */
function StatusBadge({ result }: { result: SACheckResult }) {
  if (result === 'ok') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
      <CheckCircle size={10} /> OK
    </span>
  );
  if (result === 'perhatian') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
      <AlertTriangle size={10} /> Perhatian
    </span>
  );
  if (result === 'segera') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
      <XCircle size={10} /> Segera Ganti
    </span>
  );
  return <span className="text-[11px] text-slate-300 font-medium">— Belum dicek</span>;
}

/* ─── RESULT BUTTON GROUP ────────────────────────────────────────────── */
function ResultBtnGroup({ value, onChange }: { value: SACheckResult; onChange: (v: SACheckResult) => void }) {
  return (
    <div className="flex gap-1">
      {(['ok', 'perhatian', 'segera'] as SACheckResult[]).map(v => {
        const cfg = {
          ok:        { label: 'OK',      Icon: CheckCircle,   active: 'bg-emerald-500 text-white border-emerald-500', inactive: 'bg-white text-slate-400 border-slate-200 hover:border-emerald-300 hover:text-emerald-600' },
          perhatian: { label: 'Perlu',   Icon: AlertTriangle, active: 'bg-amber-500 text-white border-amber-500',     inactive: 'bg-white text-slate-400 border-slate-200 hover:border-amber-300 hover:text-amber-600' },
          segera:    { label: 'Ganti',   Icon: XCircle,       active: 'bg-red-500 text-white border-red-500',         inactive: 'bg-white text-slate-400 border-slate-200 hover:border-red-300 hover:text-red-600' },
        }[v];
        const active = value === v;
        return (
          <button key={v} type="button" onClick={() => onChange(active ? '' : v)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${active ? cfg.active : cfg.inactive}`}>
            <cfg.Icon size={11} /> {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── SA CHECK TABLE ─────────────────────────────────────────────────── */
function SACheckTable({ title, icon, items, onChange }: {
  title: string; icon: React.ReactNode;
  items: SACheckItem[]; onChange: (u: SACheckItem[]) => void;
}) {
  const upd = (i: number, p: Partial<SACheckItem>) => {
    const c = [...items]; c[i] = { ...c[i], ...p }; onChange(c);
  };
  const ok   = items.filter(x => x.result === 'ok').length;
  const warn = items.filter(x => x.result === 'perhatian').length;
  const bad  = items.filter(x => x.result === 'segera').length;
  const unchecked = items.filter(x => !x.result).length;
  const pct = Math.round(((items.length - unchecked) / items.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">{icon}</span>
          <div>
            <h4 className="text-sm font-black text-slate-800">{title}</h4>
            <p className="text-[11px] text-slate-400">{items.length} komponen diperiksa</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-[11px] font-bold">
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg"><CheckCircle size={10} />{ok}</span>
            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg"><AlertTriangle size={10} />{warn}</span>
            <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg"><XCircle size={10} />{bad}</span>
          </div>
          <div className="text-right hidden sm:block">
            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{pct}% diperiksa</p>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-50">
        {items.map((item, i) => (
          <div key={item.id} className={`px-5 py-3 transition-colors ${item.result === 'segera' ? 'bg-red-50/50' : item.result === 'perhatian' ? 'bg-amber-50/40' : item.result === 'ok' ? 'bg-emerald-50/20' : 'hover:bg-slate-50/50'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <div className="flex items-center gap-2.5 flex-1">
                <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold flex-shrink-0">{i + 1}</span>
                <span className="text-xs font-semibold text-slate-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-7 sm:ml-0">
                <ResultBtnGroup value={item.result} onChange={r => upd(i, { result: r })} />
              </div>
            </div>
            {(item.result === 'perhatian' || item.result === 'segera') && (
              <div className="mt-2 ml-7">
                <input type="text" value={item.catatan}
                  onChange={e => upd(i, { catatan: e.target.value })}
                  placeholder="Catatan detail kondisi..."
                  className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none font-medium ${item.result === 'segera' ? 'bg-red-50 border-red-200 placeholder-red-300 focus:border-red-400' : 'bg-amber-50 border-amber-200 placeholder-amber-300 focus:border-amber-400'}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── NOTA PRINT ─────────────────────────────────────────────────────── */
function NotaPrint({ spkData }: { spkData: any }) {
  const subParts = spkData.spareparts.reduce((s: number, p: SPKSparepart) => s + p.qty * p.hargaSatuan, 0);
  const subJasa  = spkData.jasaList.reduce((s: number, j: SPKJasa) => s + j.harga, 0);
  const sub = subParts + subJasa;
  const disc = sub * (spkData.diskon / 100);
  const tax  = (sub - disc) * (spkData.pajak / 100);
  const grand = Math.round(sub - disc + tax);

  return (
    <div id="nota-print-area" className="bg-white text-slate-900 p-6 font-sans text-sm rounded-2xl border-2 border-dashed border-slate-200">
      <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
        <h2 className="text-2xl font-black">FHR CAR SERVICE</h2>
        <p className="text-xs text-slate-500 mt-1">Bengkel & Home Service Profesional 24 Jam</p>
        <p className="text-xs text-slate-400">fhrcar.xyz</p>
      </div>
      <div className="flex justify-between mb-4">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Pelanggan</p>
          <p className="font-black text-base">{spkData.customerName}</p>
          <p className="text-xs text-slate-500">{spkData.phone}</p>
          <p className="text-xs text-slate-400">{spkData.address}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nomor SPK</p>
          <p className="font-black text-red-600">{spkData.spkNumber}</p>
          <p className="text-xs text-slate-400">{new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</p>
          <p className="text-xs text-slate-500 mt-1">SA: {spkData.saAdvisor || '—'}</p>
        </div>
      </div>
      <div className="bg-slate-50 rounded-xl p-3 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-100">
        <div><p className="text-slate-400 mb-0.5">Kendaraan</p><p className="font-bold">{spkData.carBrand} {spkData.carModel}</p></div>
        <div><p className="text-slate-400 mb-0.5">Plat Nomor</p><p className="font-black font-mono text-red-600">{spkData.licensePlate}</p></div>
        <div><p className="text-slate-400 mb-0.5">Tahun / KM</p><p className="font-bold">{spkData.carYear} / {spkData.kilometer || '—'}</p></div>
        <div><p className="text-slate-400 mb-0.5">Transmisi</p><p className="font-bold">{spkData.transmission}</p></div>
      </div>
      {spkData.spareparts.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Sparepart</p>
          <table className="w-full text-xs"><thead><tr className="bg-slate-100 text-slate-500 text-left"><th className="py-1.5 px-3 rounded-l font-bold">Nama Part</th><th className="py-1.5 px-3 text-center font-bold">Qty</th><th className="py-1.5 px-3 text-right font-bold">Harga</th><th className="py-1.5 px-3 text-right rounded-r font-bold">Sub</th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {spkData.spareparts.map((p: SPKSparepart) => (
              <tr key={p.id}><td className="py-1.5 px-3">{p.nama}</td><td className="py-1.5 px-3 text-center">{p.qty} {p.satuan}</td><td className="py-1.5 px-3 text-right">{formatRp(p.hargaSatuan)}</td><td className="py-1.5 px-3 text-right font-semibold">{formatRp(p.qty * p.hargaSatuan)}</td></tr>
            ))}
          </tbody></table>
        </div>
      )}
      {spkData.jasaList.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Jasa Pekerjaan</p>
          <table className="w-full text-xs"><thead><tr className="bg-slate-100 text-slate-500 text-left"><th className="py-1.5 px-3 rounded-l font-bold">Pekerjaan</th><th className="py-1.5 px-3 text-right rounded-r font-bold">Biaya</th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {spkData.jasaList.map((j: SPKJasa) => (
              <tr key={j.id}><td className="py-1.5 px-3">{j.nama}</td><td className="py-1.5 px-3 text-right font-semibold">{formatRp(j.harga)}</td></tr>
            ))}
          </tbody></table>
        </div>
      )}
      <div className="border-t-2 border-slate-200 pt-3 space-y-1.5 text-xs">
        <div className="flex justify-between text-slate-500"><span>Subtotal Part</span><span>{formatRp(subParts)}</span></div>
        <div className="flex justify-between text-slate-500"><span>Subtotal Jasa</span><span>{formatRp(subJasa)}</span></div>
        {spkData.diskon > 0 && <div className="flex justify-between text-amber-600 font-semibold"><span>Diskon ({spkData.diskon}%)</span><span>- {formatRp(disc)}</span></div>}
        {spkData.pajak > 0 && <div className="flex justify-between text-slate-500"><span>PPN ({spkData.pajak}%)</span><span>+ {formatRp(tax)}</span></div>}
        <div className="flex justify-between font-black text-lg border-t-2 border-slate-300 pt-2 mt-2">
          <span>GRAND TOTAL</span><span className="text-red-600">{formatRp(grand)}</span>
        </div>
        <div className="flex justify-between text-slate-500"><span>Metode Bayar</span><span className="capitalize font-semibold">{spkData.metodeBayar}</span></div>
        {spkData.dibayar > 0 && <><div className="flex justify-between"><span className="text-slate-500">Dibayar</span><span>{formatRp(spkData.dibayar)}</span></div><div className="flex justify-between text-emerald-600 font-bold"><span>Kembalian</span><span>{formatRp(Math.max(0, spkData.dibayar - grand))}</span></div></>}
      </div>
      <div className="mt-6 pt-4 border-t border-dashed border-slate-300 grid grid-cols-3 gap-4 text-center text-[10px] text-slate-400">
        <div><div className="border-b border-slate-300 mb-6"></div>Teknisi / Mekanik</div>
        <div><div className="border-b border-slate-300 mb-6"></div>Service Advisor</div>
        <div><div className="border-b border-slate-300 mb-6"></div>Pelanggan</div>
      </div>
      <p className="text-center text-[10px] text-slate-400 mt-4">Terima kasih — Garansi servis 7 hari · fhrcar.xyz</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE COMPONENT                                                    */
/* ═══════════════════════════════════════════════════════════════════════ */
export function CRMSPKCreate({ customers, onNavigate }: CRMSPKCreateProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [activeCheckTab, setActiveCheckTab] = useState(0);

  /* ── Step 1 ── */
  const [platSearch, setPlatSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [kilometer, setKilometer] = useState('');
  const [keluhan, setKeluhan] = useState('');

  /* ── Step 2 ── */
  const [eksterior, setEksterior]   = useState<SACheckItem[]>(EKSTERIOR_ITEMS.map(i => ({ ...i, id: uid() })));
  const [interior, setInterior]     = useState<SACheckItem[]>(INTERIOR_ITEMS.map(i => ({ ...i, id: uid() })));
  const [mesin, setMesin]           = useState<SACheckItem[]>(MESIN_ITEMS.map(i => ({ ...i, id: uid() })));
  const [kakiKaki, setKakiKaki]     = useState<SACheckItem[]>(KAKI_ITEMS.map(i => ({ ...i, id: uid() })));
  const [saAdvisor, setSaAdvisor]   = useState('');
  const [saCatatan, setSaCatatan]   = useState('');

  /* ── Step 3 ── */
  const [spareparts, setSpareparts] = useState<SPKSparepart[]>([]);
  const [jasaList, setJasaList]     = useState<SPKJasa[]>([{ id: uid(), nama: 'Biaya Jasa Servis', harga: 50000 }]);
  const [diskon, setDiskon]         = useState(0);
  const [pajak, setPajak]           = useState(0);

  /* ── Step 4 ── */
  const [lpaChecklist, setLpaChecklist] = useState<SACheckItem[]>(LPA_ITEMS.map(i => ({ ...i, id: uid() })));
  const [lpaTeknisi, setLpaTeknisi]     = useState('');
  const [lpaTestDrive, setLpaTestDrive] = useState(true);
  const [lpaCatatan, setLpaCatatan]     = useState('');

  /* ── Step 5 ── */
  const [metodeBayar, setMetodeBayar] = useState<'cash' | 'transfer' | 'kredit'>('cash');
  const [dibayar, setDibayar]         = useState(0);

  /* ── SPK Number ── */
  const spkNumber = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `SPK/${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}/${uid().toUpperCase()}`;
  }, []);

  /* ── Financials ── */
  const subParts  = spareparts.reduce((s, p) => s + p.qty * p.hargaSatuan, 0);
  const subJasa   = jasaList.reduce((s, j) => s + j.harga, 0);
  const subtotal  = subParts + subJasa;
  const discAmt   = subtotal * (diskon / 100);
  const taxAmt    = (subtotal - discAmt) * (pajak / 100);
  const grand     = Math.round(subtotal - discAmt + taxAmt);
  const kembalian = Math.max(0, dibayar - grand);

  /* ── Autocomplete ── */
  const platSuggestions = useMemo(() => {
    const q = platSearch.toLowerCase().replace(/\s/g, '');
    if (!q) return customers.slice(0, 10);
    return customers.filter(c =>
      c.licensePlate.toLowerCase().replace(/\s/g, '').includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.carBrand + ' ' + c.carModel).toLowerCase().includes(q)
    ).slice(0, 10);
  }, [platSearch, customers]);

  /* ── Sparepart CRUD ── */
  const addPart   = () => setSpareparts(p => [...p, { id: uid(), nama: '', qty: 1, satuan: 'pcs', hargaSatuan: 0 }]);
  const updPart   = (id: string, patch: Partial<SPKSparepart>) => setSpareparts(p => p.map(x => x.id === id ? { ...x, ...patch } : x));
  const delPart   = (id: string) => setSpareparts(p => p.filter(x => x.id !== id));
  const addJasa_  = () => setJasaList(j => [...j, { id: uid(), nama: '', harga: 0 }]);
  const updJasa   = (id: string, patch: Partial<SPKJasa>) => setJasaList(j => j.map(x => x.id === id ? { ...x, ...patch } : x));
  const delJasa   = (id: string) => setJasaList(j => j.filter(x => x.id !== id));

  /* ── Navigation validation ── */
  const canGoNext = () => {
    if (step === 1) return !!selectedCustomer;
    if (step === 3) return spareparts.length > 0 || jasaList.length > 0;
    return true;
  };

  /* ── SA summary counts across all tabs ── */
  const allChecks = [...eksterior, ...interior, ...mesin, ...kakiKaki];
  const allOk     = allChecks.filter(x => x.result === 'ok').length;
  const allWarn   = allChecks.filter(x => x.result === 'perhatian').length;
  const allBad    = allChecks.filter(x => x.result === 'segera').length;
  const allTotal  = allChecks.length;

  /* ── Save ── */
  const handleSave = async () => {
    if (!selectedCustomer) return;
    setSaving(true);
    try {
      const doc: any = {
        spkNumber, createdAt: new Date().toISOString(), status: 'selesai',
        customerId: selectedCustomer.id, customerName: selectedCustomer.name,
        phone: selectedCustomer.phone, address: selectedCustomer.address,
        carBrand: selectedCustomer.carBrand, carModel: selectedCustomer.carModel,
        carYear: selectedCustomer.carYear, licensePlate: selectedCustomer.licensePlate,
        transmission: selectedCustomer.transmission || 'Matic',
        carColor: selectedCustomer.carColor || '', kilometer, keluhan,
        saCheckEksterior: eksterior, saCheckInterior: interior,
        saCheckMesin: mesin, saCheckKakiKaki: kakiKaki,
        saAdvisorName: saAdvisor, saCatatanUmum: saCatatan,
        spareparts, jasaList, diskon, pajakPersen: pajak,
        lpaChecklist, lpaTeknisi, lpaTestDriveOk: lpaTestDrive, lpaCatatan,
        metodePembayaran: metodeBayar, grandTotal: grand, dibayar, kembalian,
      };
      const id = await addSPK(doc);
      setSavedId(id);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  /* ── Print ── */
  const handlePrint = () => {
    const el = document.getElementById('nota-print-area');
    if (!el) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Nota ${spkNumber}</title>
      <style>body{font-family:system-ui,sans-serif;margin:0;padding:24px;color:#0f172a}table{width:100%;border-collapse:collapse}th,td{padding:6px 12px;font-size:12px}.text-right{text-align:right}.text-center{text-align:center}@media print{.no-print{display:none}}</style>
    </head><body>${el.innerHTML}</body></html>`);
    w.document.close(); w.focus(); w.print();
  };

  const spkData = {
    spkNumber, customerName: selectedCustomer?.name || '', phone: selectedCustomer?.phone || '',
    address: selectedCustomer?.address || '', carBrand: selectedCustomer?.carBrand || '',
    carModel: selectedCustomer?.carModel || '', carYear: selectedCustomer?.carYear || '',
    licensePlate: selectedCustomer?.licensePlate || '', transmission: selectedCustomer?.transmission || '',
    kilometer, keluhan, saAdvisor, spareparts, jasaList, diskon, pajak, metodeBayar, dibayar,
  };

  /* ── CHECK TAB CONFIG ── */
  const checkTabs = [
    { label: 'Eksterior',   icon: <Car size={14} />,        count: EKSTERIOR_ITEMS.length, items: eksterior, set: setEksterior },
    { label: 'Interior',    icon: <Settings2 size={14} />,  count: INTERIOR_ITEMS.length,  items: interior,  set: setInterior },
    { label: 'Mesin & Kelistrikan', icon: <Wrench size={14} />, count: MESIN_ITEMS.length, items: mesin,  set: setMesin },
    { label: 'Kaki-kaki & Rem',     icon: <Gauge size={14} />,  count: KAKI_ITEMS.length,  items: kakiKaki, set: setKakiKaki },
  ];

  /* ════════════════════════════════════ RENDER ════════════════════════ */
  return (
    <div className="min-h-screen bg-[#f4f6fb] font-sans">

      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => onNavigate('crm-dashboard')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-semibold transition-colors">
            <ArrowLeft size={15} /> Dashboard
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400 text-xs">Buat SPK Baru</span>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">{spkNumber}</span>
            {savedId ? (
              <button onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all">
                <Printer size={13} /> Cetak Nota
              </button>
            ) : (
              <button onClick={() => onNavigate('crm-orders')}
                className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-600 text-xs font-semibold border border-slate-200 hover:border-red-200 rounded-xl transition-all">
                <XCircle size={13} /> Batalkan
              </button>
            )}
          </div>
        </div>

        {/* ── Step Bar ── */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-stretch overflow-x-auto">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done   = step > s.id;
                const active = step === s.id;
                return (
                  <div key={s.id} className={`flex items-center gap-2 px-4 py-3.5 flex-shrink-0 border-b-2 transition-all cursor-pointer
                    ${active ? 'border-red-600 text-red-600' : done ? 'border-emerald-400 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    onClick={() => done && setStep(s.id)}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0
                      ${active ? 'bg-red-600 text-white' : done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {done ? <Check size={12} /> : s.id}
                    </div>
                    <div className="hidden sm:block">
                      <p className={`text-xs font-bold ${active ? 'text-red-600' : done ? 'text-emerald-600' : 'text-slate-500'}`}>{s.label}</p>
                      <p className="text-[10px] text-slate-400">{s.desc}</p>
                    </div>
                    <span className={`sm:hidden text-xs font-bold ${active ? 'text-red-600' : done ? 'text-emerald-600' : ''}`}>{s.short}</span>
                    {i < STEPS.length - 1 && <ChevronRight size={14} className="text-slate-200 ml-2 flex-shrink-0 hidden sm:block" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Area ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">

          {/* ── LEFT: Step Sidebar (desktop) ── */}
          <div className="hidden xl:flex flex-col gap-3 w-56 flex-shrink-0 print:hidden">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Progress SPK</p>
              </div>
              {STEPS.map(s => {
                const Icon = s.icon;
                const done   = step > s.id;
                const active = step === s.id;
                return (
                  <button key={s.id} onClick={() => done && setStep(s.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all border-l-2 ${
                      active ? 'border-red-500 bg-red-50' : done ? 'border-emerald-400 bg-emerald-50/50 cursor-pointer hover:bg-emerald-50' : 'border-transparent'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5
                      ${active ? 'bg-red-600 text-white' : done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {done ? <Check size={13} /> : <Icon size={13} />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${active ? 'text-red-700' : done ? 'text-emerald-700' : 'text-slate-500'}`}>{s.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Info Card */}
            {selectedCustomer && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Kendaraan</p>
                <p className="font-black text-sm">{selectedCustomer.name}</p>
                <p className="text-xs text-slate-300 mt-0.5">{selectedCustomer.carBrand} {selectedCustomer.carModel}</p>
                <span className="inline-block mt-2 font-mono font-black text-xs bg-red-600 text-white px-2.5 py-1 rounded-lg">{selectedCustomer.licensePlate}</span>
                {step >= 3 && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Subtotal</span><span>{formatRp(subtotal)}</span></div>
                    <div className="flex justify-between text-sm font-black"><span>Total</span><span className="text-red-400">{formatRp(grand)}</span></div>
                  </div>
                )}
              </div>
            )}

            {/* SA Summary */}
            {step >= 2 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-3">Hasil Pengecekan SA</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold"><CheckCircle size={12} /> OK</span>
                    <span className="font-black text-emerald-600">{allOk}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-amber-500 font-semibold"><AlertTriangle size={12} /> Perhatian</span>
                    <span className="font-black text-amber-500">{allWarn}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-red-500 font-semibold"><XCircle size={12} /> Segera Ganti</span>
                    <span className="font-black text-red-500">{allBad}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.round((allOk + allWarn + allBad) / allTotal * 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400">{allTotal - allOk - allWarn - allBad} belum diperiksa</p>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Step Content ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* ══ STEP 1: Pilih Pelanggan ══════════════════════════════ */}
            {step === 1 && (
              <>
                {/* Section header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20 flex-shrink-0">
                    <Car size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Informasi Kendaraan</h2>
                    <p className="text-sm text-slate-400">Cari pelanggan berdasarkan plat nomor atau nama</p>
                  </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100">
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Cari Plat Nomor / Nama Pelanggan</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={platSearch}
                        onChange={e => { setPlatSearch(e.target.value); if (selectedCustomer) setSelectedCustomer(null); }}
                        placeholder="Ketik plat nomor atau nama pelanggan..."
                        autoFocus
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-red-400 focus:outline-none text-sm font-medium transition-colors bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {!selectedCustomer && (
                    <div className="p-5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                        {platSearch ? `${platSuggestions.length} hasil ditemukan` : `${customers.length} pelanggan terdaftar`}
                      </p>
                      {platSuggestions.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                          <Car size={40} className="mx-auto mb-3 opacity-20" />
                          <p className="font-semibold">Pelanggan tidak ditemukan</p>
                          <p className="text-xs mt-1">Tambahkan pelanggan baru di menu Data Pelanggan</p>
                          <button onClick={() => onNavigate('crm-customers')}
                            className="mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all">
                            Tambah Pelanggan Baru
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {platSuggestions.map(c => (
                            <button key={c.id} onClick={() => { setSelectedCustomer(c); setPlatSearch(c.licensePlate); }}
                              className="text-left p-4 rounded-xl border-2 border-slate-200 hover:border-red-400 hover:bg-red-50/30 transition-all group">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors">
                                  <Car size={16} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-black text-slate-900 text-sm truncate">{c.name}</p>
                                  <p className="text-xs text-slate-500 truncate">{c.carBrand} {c.carModel} · {c.carYear}</p>
                                  <span className="inline-block mt-1.5 font-mono text-xs font-black text-red-600 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-lg">{c.licensePlate}</span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected customer detail */}
                {selectedCustomer && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                          <User size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="font-black text-white text-base">{selectedCustomer.name}</p>
                          <p className="text-slate-300 text-sm">{selectedCustomer.phone}</p>
                        </div>
                      </div>
                      <button onClick={() => { setSelectedCustomer(null); setPlatSearch(''); }} className="text-slate-400 hover:text-white transition-colors text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">
                        Ganti Pelanggan
                      </button>
                    </div>
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { icon: Car,      label: 'Kendaraan',  value: `${selectedCustomer.carBrand} ${selectedCustomer.carModel}` },
                        { icon: Hash,     label: 'Plat Nomor', value: selectedCustomer.licensePlate, mono: true, red: true },
                        { icon: Calendar, label: 'Tahun / Transmisi', value: `${selectedCustomer.carYear} / ${selectedCustomer.transmission || 'Matic'}` },
                        { icon: Palette,  label: 'Warna',      value: selectedCustomer.carColor || '—' },
                      ].map((f, i) => (
                        <div key={i} className="bg-slate-50 rounded-xl p-3.5">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <f.icon size={12} className="text-slate-400" />
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{f.label}</p>
                          </div>
                          <p className={`font-black text-sm ${f.red ? 'text-red-600 font-mono' : 'text-slate-900'}`}>{f.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Kilometer Masuk Bengkel</label>
                        <div className="relative">
                          <Gauge size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="text" value={kilometer} onChange={e => setKilometer(e.target.value)}
                            placeholder="Contoh: 45.230 km"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-400 transition-colors" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Keluhan Pelanggan</label>
                        <input type="text" value={keluhan} onChange={e => setKeluhan(e.target.value)}
                          placeholder="Contoh: Mesin kasar, AC kurang dingin..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-400 transition-colors" />
                      </div>
                    </div>
                    {selectedCustomer.address && (
                      <div className="px-6 pb-6">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MapPin size={12} className="text-slate-400" />
                          <span>{selectedCustomer.address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ══ STEP 2: Pengecekan SA ══════════════════════════════════ */}
            {step === 2 && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                    <ClipboardList size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Pengecekan Service Advisor</h2>
                    <p className="text-sm text-slate-400">Inspeksi lengkap 4 kategori — {allTotal} komponen total</p>
                  </div>
                  <div className="ml-auto hidden sm:flex gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100"><CheckCircle size={12} /> {allOk} OK</span>
                    {allWarn > 0 && <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100"><AlertTriangle size={12} /> {allWarn} Perhatian</span>}
                    {allBad > 0 && <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100"><XCircle size={12} /> {allBad} Segera Ganti</span>}
                  </div>
                </div>

                {/* SA Info */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Nama Service Advisor</label>
                    <input value={saAdvisor} onChange={e => setSaAdvisor(e.target.value)} placeholder="Nama SA yang bertugas..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-400 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Catatan SA / Keluhan Tambahan</label>
                    <input value={saCatatan} onChange={e => setSaCatatan(e.target.value)} placeholder="Catatan umum dari SA..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-400 transition-colors" />
                  </div>
                </div>

                {/* Tab Nav */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex border-b border-slate-100 overflow-x-auto">
                    {checkTabs.map((tab, i) => {
                      const tabOk   = tab.items.filter(x => x.result === 'ok').length;
                      const tabWarn = tab.items.filter(x => x.result === 'perhatian').length;
                      const tabBad  = tab.items.filter(x => x.result === 'segera').length;
                      const isActive = activeCheckTab === i;
                      return (
                        <button key={i} onClick={() => setActiveCheckTab(i)}
                          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold flex-shrink-0 border-b-2 transition-all
                            ${isActive ? 'border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                          <span>{tab.icon}</span>
                          <span className="hidden sm:inline">{tab.label}</span>
                          <span className="sm:hidden">{['Ekst.','Int.','Mesin','Kaki'][i]}</span>
                          <div className="flex gap-1">
                            {tabOk > 0 && <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[9px] flex items-center justify-center font-black">{tabOk}</span>}
                            {tabWarn > 0 && <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[9px] flex items-center justify-center font-black">{tabWarn}</span>}
                            {tabBad > 0 && <span className="w-4 h-4 rounded-full bg-red-100 text-red-700 text-[9px] flex items-center justify-center font-black">{tabBad}</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-5">
                    {checkTabs.map((tab, i) => i === activeCheckTab && (
                      <SACheckTable
                        key={i}
                        title={`Tahap ${i+1} — ${tab.label}`}
                        icon={tab.icon}
                        items={tab.items}
                        onChange={tab.set}
                      />
                    ))}
                  </div>
                </div>

                {/* Quick nav between tabs */}
                <div className="flex justify-between items-center bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <button disabled={activeCheckTab === 0} onClick={() => setActiveCheckTab(t => t-1)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-xl transition-all">
                    <ChevronLeft size={13} /> Tahap Sebelumnya
                  </button>
                  <span className="text-xs text-slate-400 font-semibold">Tahap {activeCheckTab + 1} dari {checkTabs.length}</span>
                  <button disabled={activeCheckTab === checkTabs.length - 1} onClick={() => setActiveCheckTab(t => t+1)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-xl transition-all">
                    Tahap Berikutnya <ChevronRight size={13} />
                  </button>
                </div>
              </>
            )}

            {/* ══ STEP 3: Nota Sparepart & Jasa ════════════════════════ */}
            {step === 3 && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0">
                    <ShoppingCart size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Nota Sparepart & Jasa</h2>
                    <p className="text-sm text-slate-400">Input komponen, biaya jasa, dan kalkulasi total</p>
                  </div>
                </div>

                {/* Rekomendasi dari SA */}
                {allBad > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-700">Ada {allBad} komponen yang perlu segera diganti dari hasil pengecekan SA</p>
                      <p className="text-[11px] text-red-500 mt-0.5">Pastikan sudah ditambahkan ke daftar sparepart di bawah</p>
                    </div>
                  </div>
                )}

                {/* Sparepart Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Daftar Sparepart</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{spareparts.length} item · {formatRp(subParts)}</p>
                    </div>
                    <button onClick={addPart}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/20 active:scale-95">
                      <Plus size={13} /> Tambah Part
                    </button>
                  </div>

                  {spareparts.length === 0 ? (
                    <div className="py-10 text-center text-slate-400">
                      <ShoppingCart size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm font-semibold">Belum ada sparepart</p>
                      <p className="text-xs mt-1">Klik "+ Tambah Part" untuk menambahkan</p>
                    </div>
                  ) : (
                    <>
                      <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <div className="col-span-5">Nama Part / Kode</div>
                        <div className="col-span-1 text-center">Qty</div>
                        <div className="col-span-2">Satuan</div>
                        <div className="col-span-3 text-right">Harga / Satuan</div>
                        <div className="col-span-1"></div>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {spareparts.map(p => (
                          <div key={p.id} className="px-5 py-3 grid grid-cols-12 gap-2 items-center">
                            <input value={p.nama} onChange={e => updPart(p.id, { nama: e.target.value })} placeholder="Nama part atau kode..."
                              className="col-span-5 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 transition-colors" />
                            <input type="number" value={p.qty || ''} min={1} onChange={e => updPart(p.id, { qty: Number(e.target.value) })}
                              className="col-span-1 px-2 py-2 rounded-xl border border-slate-200 text-xs text-center focus:outline-none focus:border-red-400" />
                            <select value={p.satuan} onChange={e => updPart(p.id, { satuan: e.target.value })}
                              className="col-span-2 px-2 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 bg-white">
                              {['pcs','liter','set','meter','roll','botol','kaleng','pasang'].map(s => <option key={s}>{s}</option>)}
                            </select>
                            <input type="number" value={p.hargaSatuan || ''} min={0} onChange={e => updPart(p.id, { hargaSatuan: Number(e.target.value) })}
                              placeholder="0" className="col-span-3 px-3 py-2 rounded-xl border border-slate-200 text-xs text-right focus:outline-none focus:border-red-400" />
                            <button onClick={() => delPart(p.id)} className="col-span-1 flex justify-center text-slate-200 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <p className="text-xs font-bold text-slate-600">Subtotal Sparepart: <span className="text-red-600 text-sm">{formatRp(subParts)}</span></p>
                      </div>
                    </>
                  )}
                </div>

                {/* Jasa Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Biaya Jasa Pekerjaan</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{jasaList.length} pekerjaan · {formatRp(subJasa)}</p>
                    </div>
                    <button onClick={addJasa_}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all active:scale-95">
                      <Plus size={13} /> Tambah Jasa
                    </button>
                  </div>
                  {jasaList.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">Belum ada jasa. Klik "+ Tambah Jasa"</div>
                  ) : (
                    <>
                      <div className="divide-y divide-slate-50">
                        {jasaList.map(j => (
                          <div key={j.id} className="px-5 py-3 flex items-center gap-3">
                            <Wrench size={13} className="text-slate-300 flex-shrink-0" />
                            <input value={j.nama} onChange={e => updJasa(j.id, { nama: e.target.value })} placeholder="Nama pekerjaan / jasa..."
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 transition-colors" />
                            <input type="number" value={j.harga || ''} min={0} onChange={e => updJasa(j.id, { harga: Number(e.target.value) })}
                              placeholder="Biaya (Rp)"
                              className="w-40 px-3 py-2 rounded-xl border border-slate-200 text-xs text-right focus:outline-none focus:border-red-400" />
                            <button onClick={() => delJasa(j.id)} className="text-slate-200 hover:text-red-500 transition-colors flex-shrink-0">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <p className="text-xs font-bold text-slate-600">Subtotal Jasa: <span className="text-slate-800 text-sm">{formatRp(subJasa)}</span></p>
                      </div>
                    </>
                  )}
                </div>

                {/* Pricing Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-black text-slate-800 mb-4">Penyesuaian Harga</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Diskon (%)</label>
                        <div className="relative">
                          <Percent size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="number" value={diskon} min={0} max={100} onChange={e => setDiskon(Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-red-400 text-center" />
                        </div>
                        {diskon > 0 && <p className="text-xs text-amber-600 mt-1 font-semibold">Potongan: {formatRp(discAmt)}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">PPN / Pajak (%)</label>
                        <div className="relative">
                          <Percent size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="number" value={pajak} min={0} max={100} onChange={e => setPajak(Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-red-400 text-center" />
                        </div>
                        {pajak > 0 && <p className="text-xs text-slate-500 mt-1">PPN: {formatRp(taxAmt)}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-xl">
                    <h3 className="text-sm font-black text-slate-300 mb-4">Ringkasan Biaya</h3>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between text-slate-300"><span>Subtotal Part</span><span>{formatRp(subParts)}</span></div>
                      <div className="flex justify-between text-slate-300"><span>Subtotal Jasa</span><span>{formatRp(subJasa)}</span></div>
                      <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>{formatRp(subtotal)}</span></div>
                      {diskon > 0 && <div className="flex justify-between text-amber-400 font-semibold"><span>Diskon ({diskon}%)</span><span>- {formatRp(discAmt)}</span></div>}
                      {pajak > 0 && <div className="flex justify-between text-slate-400"><span>PPN ({pajak}%)</span><span>+ {formatRp(taxAmt)}</span></div>}
                      <div className="border-t border-white/15 pt-3 mt-1 flex justify-between items-center">
                        <span className="text-base font-black text-white">GRAND TOTAL</span>
                        <span className="text-2xl font-black text-red-400">{formatRp(grand)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ══ STEP 4: LPA ══════════════════════════════════════════ */}
            {step === 4 && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20 flex-shrink-0">
                    <FileText size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Lembar Pemeriksaan Akhir</h2>
                    <p className="text-sm text-slate-400">Verifikasi kondisi kendaraan sebelum diserahkan ke pelanggan</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                  <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 font-semibold">LPA wajib dilengkapi sebelum kendaraan diserahkan. Semua item harus diperiksa dan ditandai kondisinya.</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Nama Teknisi / Mekanik</label>
                    <input value={lpaTeknisi} onChange={e => setLpaTeknisi(e.target.value)} placeholder="Nama mekanik yang mengerjakan..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-400 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Hasil Test Drive</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setLpaTestDrive(true)}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold border-2 transition-all ${lpaTestDrive ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 text-slate-500 hover:border-emerald-300'}`}>
                        Normal & Aman
                      </button>
                      <button type="button" onClick={() => setLpaTestDrive(false)}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold border-2 transition-all ${!lpaTestDrive ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-200 text-slate-500 hover:border-amber-300'}`}>
                        Ada Catatan
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Catatan LPA</label>
                    <input value={lpaCatatan} onChange={e => setLpaCatatan(e.target.value)} placeholder="Catatan sebelum diserahkan..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-400 transition-colors" />
                  </div>
                </div>

                <SACheckTable
                  title="Checklist Kelengkapan & Kondisi Akhir Kendaraan"
                  icon={<CheckCircle size={16} className="text-purple-600" />}
                  items={lpaChecklist}
                  onChange={setLpaChecklist}
                />
              </>
            )}

            {/* ══ STEP 5: Nota Akhir ════════════════════════════════════ */}
            {step === 5 && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20 flex-shrink-0">
                    <Receipt size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Nota Akhir & Pembayaran</h2>
                    <p className="text-sm text-slate-400">Review, pembayaran, simpan SPK, dan cetak nota</p>
                  </div>
                </div>

                {savedId ? (
                  /* ── SUCCESS STATE ── */
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-8 text-center text-white">
                      <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={40} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-black mb-1">SPK Berhasil Disimpan!</h3>
                      <p className="text-emerald-100 text-sm">Nomor SPK: <span className="font-black text-white">{spkNumber}</span></p>
                    </div>
                    <div className="p-6 flex flex-col sm:flex-row gap-3 justify-center">
                      <button onClick={handlePrint}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all">
                        <Printer size={16} /> Cetak Nota
                      </button>
                      <button onClick={() => onNavigate('crm-orders')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all">
                        <FileText size={16} /> Lihat Daftar SPK
                      </button>
                      <button onClick={() => onNavigate('crm-dashboard')}
                        className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all">
                        Kembali ke Dashboard
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Pelanggan',  value: selectedCustomer?.name || '—', icon: User,     color: 'blue' },
                        { label: 'Kendaraan',  value: `${selectedCustomer?.carBrand} ${selectedCustomer?.carModel}`, icon: Car, color: 'slate' },
                        { label: 'Plat Nomor', value: selectedCustomer?.licensePlate || '—', icon: Hash, color: 'red', mono: true },
                        { label: 'Grand Total',value: formatRp(grand), icon: DollarSign, color: 'emerald', big: true },
                      ].map((c, i) => (
                        <div key={i} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 ${c.big ? 'col-span-2 sm:col-span-1' : ''}`}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{c.label}</p>
                          <p className={`font-black text-sm ${c.mono ? 'font-mono text-red-600' : c.big ? 'text-emerald-600 text-base' : 'text-slate-800'} truncate`}>{c.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* SA Summary */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                      <h3 className="text-sm font-black text-slate-800 mb-3">Ringkasan Pengecekan SA</h3>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-emerald-50 rounded-xl p-3">
                          <p className="text-2xl font-black text-emerald-600">{allOk}</p>
                          <p className="text-xs text-emerald-600 font-semibold mt-0.5">Kondisi OK</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-3">
                          <p className="text-2xl font-black text-amber-600">{allWarn}</p>
                          <p className="text-xs text-amber-600 font-semibold mt-0.5">Perlu Perhatian</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-3">
                          <p className="text-2xl font-black text-red-600">{allBad}</p>
                          <p className="text-xs text-red-600 font-semibold mt-0.5">Segera Ganti</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                      <h3 className="text-sm font-black text-slate-800 mb-4">Metode Pembayaran</h3>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {(['cash', 'transfer', 'kredit'] as const).map(m => (
                          <button key={m} type="button" onClick={() => setMetodeBayar(m)}
                            className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all font-bold text-xs capitalize ${metodeBayar === m ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                            {m === 'cash' ? <Banknote size={20} /> : m === 'transfer' ? <CreditCard size={20} /> : <RefreshCw size={20} />}
                            {m === 'cash' ? 'Cash Tunai' : m === 'transfer' ? 'Transfer Bank' : 'Kredit'}
                          </button>
                        ))}
                      </div>
                      {metodeBayar === 'cash' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Nominal Dibayar (Rp)</label>
                            <input type="number" value={dibayar || ''} onChange={e => setDibayar(Number(e.target.value))}
                              placeholder={String(grand)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-400 text-sm font-bold focus:outline-none transition-colors" />
                          </div>
                          {dibayar > 0 && (
                            <div className={`flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold ${kembalian >= 0 ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                              <span>{kembalian >= 0 ? 'Kembalian' : 'Kurang Bayar'}</span>
                              <span className="text-base">{formatRp(Math.abs(kembalian))}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Nota Preview */}
                    <NotaPrint spkData={spkData} />

                    {/* Save Button */}
                    <button onClick={handleSave} disabled={saving}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-600/30 transition-all active:scale-[0.98]">
                      {saving ? <><Clock size={18} className="animate-spin" /> Menyimpan SPK...</> : <><Save size={18} /> Simpan SPK & Selesai</>}
                    </button>
                  </>
                )}
              </>
            )}

            {/* ── BOTTOM NAVIGATION ─────────────────────────────────── */}
            {!savedId && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 flex items-center justify-between print:hidden">
                <button onClick={() => step === 1 ? onNavigate('crm-dashboard') : setStep(s => s - 1)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all">
                  <ChevronLeft size={15} />
                  {step === 1 ? 'Kembali ke Dashboard' : 'Langkah Sebelumnya'}
                </button>

                <div className="flex items-center gap-1">
                  {STEPS.map(s => (
                    <div key={s.id} className={`h-1.5 rounded-full transition-all ${step === s.id ? 'w-6 bg-red-600' : step > s.id ? 'w-1.5 bg-emerald-400' : 'w-1.5 bg-slate-200'}`} />
                  ))}
                </div>

                {step < 5 ? (
                  <button onClick={() => setStep(s => s + 1)} disabled={!canGoNext()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-red-600/20">
                    Langkah Berikutnya <ChevronRight size={15} />
                  </button>
                ) : (
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20">
                    {saving ? <><Clock size={14} className="animate-spin" /> Menyimpan...</> : <><Save size={14} /> Simpan SPK</>}
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
