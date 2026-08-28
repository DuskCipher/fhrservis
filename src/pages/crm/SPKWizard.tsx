import React, { useState, useMemo } from 'react';
import {
  X, ChevronRight, ChevronLeft, Search, Car, User, Phone,
  MapPin, CheckCircle, AlertTriangle, XCircle, Plus, Trash2,
  Printer, Save, Clock, Wrench, FileText, ClipboardList,
  Receipt, CreditCard, Banknote, ArrowRight, Check, Sparkles
} from 'lucide-react';
import {
  CustomerItem, SACheckItem, SACheckResult,
  SPKSparepart, SPKJasa, SPKDocument
} from '../../types';
import { addSPK } from '../../lib/firestoreService';

/* ─── PROPS ──────────────────────────────────────────────────────────── */
interface SPKWizardProps {
  customers: CustomerItem[];
  onClose: () => void;
  onSaved: (spkId: string) => void;
}

/* ─── HELPERS ────────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).substring(2, 9);
const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

function makeCheckItem(label: string): SACheckItem {
  return { id: uid(), label, result: '', catatan: '' };
}

/* ─── CHECKLIST TEMPLATES ─────────────────────────────────────────────── */
const DEFAULT_EKSTERIOR: SACheckItem[] = [
  'Body & Panel Pintu', 'Cat & Poles Bodi', 'Kaca Depan & Belakang',
  'Lampu Depan (Headlamp)', 'Lampu Belakang (Tailamp)', 'Bumper Depan & Belakang',
  'Spion Kiri & Kanan', 'Wiper Depan & Belakang', 'Antena & Roof Rail',
].map(makeCheckItem);

const DEFAULT_INTERIOR: SACheckItem[] = [
  'Dashboard & Panel Instrumen', 'AC Kabin & Blower', 'Audio / Head Unit',
  'Kursi & Sandaran', 'Karpet & Plafon', 'Power Window Semua Pintu',
  'Sabuk Pengaman (Seatbelt)', 'Central Lock & Alarm', 'Handle & Trim Pintu',
].map(makeCheckItem);

const DEFAULT_MESIN: SACheckItem[] = [
  'Oli Mesin (Level & Kondisi)', 'Filter Oli & Udara', 'Air Radiator & Coolant',
  'Aki / Baterai (Tegangan)', 'Alternator & Dinamo', 'V-Belt & Timing Belt',
  'Busi & Kabel Busi', 'Selang & Klem Radiator', 'Sistem Bahan Bakar (Fuel System)',
  'Catalytic Converter & Knalpot',
].map(makeCheckItem);

const DEFAULT_KAKI: SACheckItem[] = [
  'Ban Depan (Tekanan & Keausan)', 'Ban Belakang (Tekanan & Keausan)',
  'Rem Depan (Kampas & Cakram)', 'Rem Belakang (Kampas & Tromol)',
  'Minyak Rem (Level & Kondisi)', 'Shock Absorber Depan', 'Shock Absorber Belakang',
  'Tie Rod & Ball Joint', 'Sistem Kemudi (Steering)', 'Kopling (Manual) / CVT (Matic)',
].map(makeCheckItem);

const DEFAULT_LPA: SACheckItem[] = [
  'Kunci Kontak & Remote', 'Buku Servis & STNK', 'Ban Serep & Toolkit',
  'Dongkrak & Kunci Roda', 'Kelengkapan Interior (Karpet, dll)',
  'Kebersihan Eksterior', 'Kebersihan Interior & Kabin',
  'Semua Lampu Berfungsi', 'AC Berfungsi Normal', 'Audio Berfungsi Normal',
  'Power Window Berfungsi', 'Rem Parkir Berfungsi',
].map(makeCheckItem);

/* ─── STEP LABELS ────────────────────────────────────────────────────── */
const STEPS = [
  { label: 'Pelanggan', icon: User },
  { label: 'Pengecekan SA', icon: ClipboardList },
  { label: 'Nota & Biaya', icon: Wrench },
  { label: 'LPA', icon: FileText },
  { label: 'Nota Akhir', icon: Receipt },
];

/* ─── SA CHECK RESULT BUTTON ─────────────────────────────────────────── */
function ResultBtn({ value, current, onChange }: { value: SACheckResult; current: SACheckResult; onChange: (v: SACheckResult) => void }) {
  const cfg: Record<string, { label: string; active: string; inactive: string; icon: React.ReactNode }> = {
    ok: {
      label: 'OK', icon: <CheckCircle size={13} />,
      active: 'bg-emerald-500 text-white border-emerald-500',
      inactive: 'bg-white text-slate-400 border-slate-200 hover:border-emerald-300 hover:text-emerald-600',
    },
    perhatian: {
      label: 'Perhatian', icon: <AlertTriangle size={13} />,
      active: 'bg-amber-500 text-white border-amber-500',
      inactive: 'bg-white text-slate-400 border-slate-200 hover:border-amber-300 hover:text-amber-600',
    },
    segera: {
      label: 'Segera Ganti', icon: <XCircle size={13} />,
      active: 'bg-red-500 text-white border-red-500',
      inactive: 'bg-white text-slate-400 border-slate-200 hover:border-red-300 hover:text-red-600',
    },
  };
  const c = cfg[value];
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(isActive ? '' : value)}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${isActive ? c.active : c.inactive}`}
    >
      {c.icon} {c.label}
    </button>
  );
}

/* ─── SA CHECKLIST TABLE ─────────────────────────────────────────────── */
function SATable({ title, items, onChange }: {
  title: string;
  items: SACheckItem[];
  onChange: (updated: SACheckItem[]) => void;
}) {
  const updateItem = (idx: number, patch: Partial<SACheckItem>) => {
    const copy = [...items];
    copy[idx] = { ...copy[idx], ...patch };
    onChange(copy);
  };

  const okCount = items.filter(i => i.result === 'ok').length;
  const pCount = items.filter(i => i.result === 'perhatian').length;
  const sCount = items.filter(i => i.result === 'segera').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <h4 className="text-sm font-black text-slate-800">{title}</h4>
        <div className="flex gap-2 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle size={11} />{okCount}</span>
          <span className="flex items-center gap-1 text-amber-500 font-bold"><AlertTriangle size={11} />{pCount}</span>
          <span className="flex items-center gap-1 text-red-500 font-bold"><XCircle size={11} />{sCount}</span>
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {items.map((item, idx) => (
          <div key={item.id} className="px-4 py-2.5 hover:bg-slate-50/50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs text-slate-700 font-semibold flex-1">{item.label}</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <ResultBtn value="ok" current={item.result} onChange={r => updateItem(idx, { result: r })} />
                <ResultBtn value="perhatian" current={item.result} onChange={r => updateItem(idx, { result: r })} />
                <ResultBtn value="segera" current={item.result} onChange={r => updateItem(idx, { result: r })} />
              </div>
            </div>
            {(item.result === 'perhatian' || item.result === 'segera') && (
              <input
                type="text"
                placeholder="Catatan detail..."
                value={item.catatan}
                onChange={e => updateItem(idx, { catatan: e.target.value })}
                className="mt-2 w-full text-xs px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 placeholder-slate-400 focus:outline-none focus:border-amber-400 font-sans"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── NOTA PRINT VIEW ─────────────────────────────────────────────────── */
function NotaAkhirPrint({ data, customer }: { data: any; customer: CustomerItem | null }) {
  const subtotalParts = data.spareparts.reduce((s: number, p: SPKSparepart) => s + (p.qty * p.hargaSatuan), 0);
  const subtotalJasa = data.jasaList.reduce((s: number, j: SPKJasa) => s + j.harga, 0);
  const subtotal = subtotalParts + subtotalJasa;
  const diskonAmt = subtotal * (data.diskon / 100);
  const pajakAmt = (subtotal - diskonAmt) * (data.pajakPersen / 100);
  const grand = subtotal - diskonAmt + pajakAmt;

  return (
    <div id="nota-print" className="bg-white text-slate-900 p-6 font-sans text-sm rounded-2xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src="/logo.png" alt="FHR Car" className="h-10 w-auto object-contain" onError={e => (e.currentTarget.style.display='none')} />
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-none">FHR CAR SERVICE</h2>
            <p className="text-[11px] text-slate-500">Bengkel & Home Service 24 Jam</p>
          </div>
        </div>
        <p className="text-xs text-slate-500">Jl. Raya Sokaraja, Banyumas · 081xxx · fhrcar.xyz</p>
      </div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Nota untuk:</p>
          <p className="font-black text-base">{data.customerName}</p>
          <p className="text-xs text-slate-500">{data.phone}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-slate-500 font-semibold">No. SPK:</p>
          <p className="font-black text-red-600">{data.spkNumber}</p>
          <p className="text-[11px] text-slate-400">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Kendaraan */}
      <div className="bg-slate-50 rounded-xl p-3 mb-4 grid grid-cols-3 gap-2 text-xs">
        <div><span className="text-slate-400">Kendaraan</span><br /><strong>{data.carBrand} {data.carModel}</strong></div>
        <div><span className="text-slate-400">Plat Nomor</span><br /><strong>{data.licensePlate}</strong></div>
        <div><span className="text-slate-400">Tahun / KM</span><br /><strong>{data.carYear} / {data.kilometer || '—'}</strong></div>
      </div>

      {/* Sparepart */}
      {data.spareparts.length > 0 && (
        <>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Sparepart</p>
          <table className="w-full text-xs mb-3">
            <thead><tr className="bg-slate-100 text-slate-500"><th className="text-left py-1.5 px-2 rounded-l">Nama Part</th><th className="text-center py-1.5 px-2">Qty</th><th className="text-right py-1.5 px-2">Harga</th><th className="text-right py-1.5 px-2 rounded-r">Subtotal</th></tr></thead>
            <tbody>{data.spareparts.map((p: SPKSparepart) => (
              <tr key={p.id} className="border-b border-slate-50">
                <td className="py-1.5 px-2">{p.nama}</td>
                <td className="py-1.5 px-2 text-center">{p.qty} {p.satuan}</td>
                <td className="py-1.5 px-2 text-right">{formatRp(p.hargaSatuan)}</td>
                <td className="py-1.5 px-2 text-right font-semibold">{formatRp(p.qty * p.hargaSatuan)}</td>
              </tr>
            ))}</tbody>
          </table>
        </>
      )}

      {/* Jasa */}
      {data.jasaList.length > 0 && (
        <>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Jasa Pekerjaan</p>
          <table className="w-full text-xs mb-3">
            <thead><tr className="bg-slate-100 text-slate-500"><th className="text-left py-1.5 px-2 rounded-l">Pekerjaan</th><th className="text-right py-1.5 px-2 rounded-r">Biaya</th></tr></thead>
            <tbody>{data.jasaList.map((j: SPKJasa) => (
              <tr key={j.id} className="border-b border-slate-50">
                <td className="py-1.5 px-2">{j.nama}</td>
                <td className="py-1.5 px-2 text-right font-semibold">{formatRp(j.harga)}</td>
              </tr>
            ))}</tbody>
          </table>
        </>
      )}

      {/* Total */}
      <div className="border-t-2 border-slate-200 pt-3 space-y-1.5 text-xs">
        <div className="flex justify-between"><span className="text-slate-500">Subtotal Sparepart</span><span>{formatRp(subtotalParts)}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Subtotal Jasa</span><span>{formatRp(subtotalJasa)}</span></div>
        {data.diskon > 0 && <div className="flex justify-between text-amber-600"><span>Diskon ({data.diskon}%)</span><span>-{formatRp(diskonAmt)}</span></div>}
        {data.pajakPersen > 0 && <div className="flex justify-between text-slate-500"><span>Pajak ({data.pajakPersen}%)</span><span>{formatRp(pajakAmt)}</span></div>}
        <div className="flex justify-between font-black text-base border-t border-slate-200 pt-2 mt-2">
          <span>TOTAL</span><span className="text-red-600">{formatRp(grand)}</span>
        </div>
        <div className="flex justify-between text-slate-500"><span>Metode Bayar</span><span className="font-semibold capitalize">{data.metodePembayaran}</span></div>
        {data.dibayar > 0 && <>
          <div className="flex justify-between"><span className="text-slate-500">Dibayar</span><span>{formatRp(data.dibayar)}</span></div>
          <div className="flex justify-between text-emerald-600"><span className="font-semibold">Kembalian</span><span className="font-bold">{formatRp(Math.max(0, data.dibayar - grand))}</span></div>
        </>}
      </div>

      <div className="mt-5 pt-4 border-t border-dashed border-slate-300 text-center text-[11px] text-slate-400">
        <p>Terima kasih telah mempercayakan kendaraan Anda kepada <strong>FHR Car Service</strong></p>
        <p>Garansi servis 7 hari · fhrcar.xyz</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  MAIN WIZARD COMPONENT                                                  */
/* ═══════════════════════════════════════════════════════════════════════ */
export function SPKWizard({ customers, onClose, onSaved }: SPKWizardProps) {
  const [step, setStep] = useState(0); // 0-4

  /* ── Step 1: Pilih Pelanggan ── */
  const [platSearch, setPlatSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [kilometer, setKilometer] = useState('');

  /* ── Step 2: SA Check ── */
  const [eksterior, setEksterior] = useState<SACheckItem[]>(DEFAULT_EKSTERIOR.map(i => ({ ...i, id: uid() })));
  const [interior, setInterior] = useState<SACheckItem[]>(DEFAULT_INTERIOR.map(i => ({ ...i, id: uid() })));
  const [mesin, setMesin] = useState<SACheckItem[]>(DEFAULT_MESIN.map(i => ({ ...i, id: uid() })));
  const [kakiKaki, setKakiKaki] = useState<SACheckItem[]>(DEFAULT_KAKI.map(i => ({ ...i, id: uid() })));
  const [saAdvisor, setSaAdvisor] = useState('');
  const [saCatatan, setSaCatatan] = useState('');

  /* ── Step 3: Nota ── */
  const [spareparts, setSpareparts] = useState<SPKSparepart[]>([]);
  const [jasaList, setJasaList] = useState<SPKJasa[]>([
    { id: uid(), nama: 'Biaya Jasa Servis', harga: 50000 }
  ]);
  const [diskon, setDiskon] = useState(0);
  const [pajak, setPajak] = useState(0);

  /* ── Step 4: LPA ── */
  const [lpaChecklist, setLpaChecklist] = useState<SACheckItem[]>(DEFAULT_LPA.map(i => ({ ...i, id: uid() })));
  const [lpaTeknisi, setLpaTeknisi] = useState('');
  const [lpaTestDrive, setLpaTestDrive] = useState(true);
  const [lpaCatatan, setLpaCatatan] = useState('');

  /* ── Step 5: Nota Akhir ── */
  const [metodeBayar, setMetodeBayar] = useState<'cash' | 'transfer' | 'kredit'>('cash');
  const [dibayar, setDibayar] = useState(0);

  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showPrint, setShowPrint] = useState(false);

  /* ── Filtered customers by plat ── */
  const platSuggestions = useMemo(() => {
    if (!platSearch.trim()) return customers.slice(0, 8);
    const q = platSearch.toLowerCase().replace(/\s/g, '');
    return customers.filter(c =>
      c.licensePlate.toLowerCase().replace(/\s/g, '').includes(q) ||
      c.name.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [platSearch, customers]);

  /* ── Totals ── */
  const subtotalParts = spareparts.reduce((s, p) => s + p.qty * p.hargaSatuan, 0);
  const subtotalJasa = jasaList.reduce((s, j) => s + j.harga, 0);
  const subtotal = subtotalParts + subtotalJasa;
  const diskonAmt = subtotal * (diskon / 100);
  const pajakAmt = (subtotal - diskonAmt) * (pajak / 100);
  const grand = Math.round(subtotal - diskonAmt + pajakAmt);
  const kembalian = Math.max(0, dibayar - grand);

  /* ── SPK Number ── */
  const spkNumber = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `SPK-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${uid().toUpperCase()}`;
  }, []);

  /* ── Sparepart helpers ── */
  const addSparepart = () => setSpareparts(prev => [...prev, { id: uid(), nama: '', qty: 1, satuan: 'pcs', hargaSatuan: 0 }]);
  const updateSparepart = (id: string, patch: Partial<SPKSparepart>) =>
    setSpareparts(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  const removeSparepart = (id: string) => setSpareparts(prev => prev.filter(p => p.id !== id));

  const addJasa = () => setJasaList(prev => [...prev, { id: uid(), nama: '', harga: 0 }]);
  const updateJasa = (id: string, patch: Partial<SPKJasa>) =>
    setJasaList(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));
  const removeJasa = (id: string) => setJasaList(prev => prev.filter(j => j.id !== id));

  /* ── Can proceed ── */
  const canNext = () => {
    if (step === 0) return !!selectedCustomer;
    if (step === 1) return true; // SA check optional items
    if (step === 2) return spareparts.length > 0 || jasaList.length > 0;
    return true;
  };

  /* ── Save SPK ── */
  const handleSave = async () => {
    if (!selectedCustomer) return;
    setSaving(true);
    try {
      const doc: Omit<SPKDocument, 'id'> = {
        spkNumber,
        createdAt: new Date().toISOString(),
        status: 'selesai',
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        phone: selectedCustomer.phone,
        address: selectedCustomer.address,
        carBrand: selectedCustomer.carBrand,
        carModel: selectedCustomer.carModel,
        carYear: selectedCustomer.carYear,
        licensePlate: selectedCustomer.licensePlate,
        transmission: selectedCustomer.transmission || 'Matic',
        carColor: selectedCustomer.carColor || '',
        kilometer,
        saCheckEksterior: eksterior,
        saCheckInterior: interior,
        saCheckMesin: mesin,
        saCheckKakiKaki: kakiKaki,
        saAdvisorName: saAdvisor,
        saCatatanUmum: saCatatan,
        spareparts,
        jasaList,
        diskon,
        pajakPersen: pajak,
        lpaChecklist,
        lpaTeknisi,
        lpaTestDriveOk: lpaTestDrive,
        lpaCatatan,
        metodePembayaran: metodeBayar,
        grandTotal: grand,
        dibayar,
        kembalian,
      };
      const id = await addSPK(doc);
      setSavedId(id);
      onSaved(id);
    } catch (err) {
      console.error('Save SPK error:', err);
    } finally {
      setSaving(false);
    }
  };

  /* ── Print ── */
  const handlePrint = () => {
    const el = document.getElementById('nota-print');
    if (!el) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Nota SPK ${spkNumber}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; }
        * { box-sizing: border-box; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 4px 8px; font-size: 12px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: 700; }
        .bg-slate-100 { background: #f1f5f9; }
        @media print { button { display: none; } }
      </style>
      </head><body>${el.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  /* ────────────────────────────────────────────────── RENDER ────────── */
  const spkData = {
    spkNumber, customerName: selectedCustomer?.name || '', phone: selectedCustomer?.phone || '',
    carBrand: selectedCustomer?.carBrand || '', carModel: selectedCustomer?.carModel || '',
    carYear: selectedCustomer?.carYear || '', licensePlate: selectedCustomer?.licensePlate || '',
    kilometer, spareparts, jasaList, diskon, pajakPersen: pajak, metodePembayaran: metodeBayar,
    dibayar, grandTotal: grand,
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center shadow-md shadow-red-600/30">
                <FileText size={16} className="text-white" />
              </span>
              Buat SPK Baru
            </h2>
            {selectedCustomer && (
              <p className="text-xs text-slate-400 mt-0.5 ml-10">
                {selectedCustomer.carBrand} {selectedCustomer.carModel} · <span className="font-mono font-bold text-slate-600">{selectedCustomer.licensePlate}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        {/* ── STEP INDICATOR ── */}
        <div className="px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <React.Fragment key={i}>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-xs font-bold ${
                    done ? 'bg-emerald-50 text-emerald-600' : active ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-slate-400'
                  }`}>
                    {done ? <Check size={12} /> : <Icon size={12} />}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded-full ${i < step ? 'bg-emerald-300' : 'bg-slate-100'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ═══ STEP 0: Pilih Pelanggan ═══ */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Cari Plat Nomor / Nama Pelanggan
                </label>
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={platSearch}
                    onChange={e => { setPlatSearch(e.target.value); setSelectedCustomer(null); }}
                    placeholder="Contoh: B 1234 ABC atau Budi Santoso..."
                    className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-400 focus:outline-none text-sm font-medium transition-colors bg-slate-50"
                    autoFocus
                  />
                </div>
              </div>

              {/* Suggestions */}
              {!selectedCustomer && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {platSearch ? 'Hasil Pencarian' : 'Pelanggan Terdaftar'}
                  </p>
                  {platSuggestions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      <Car size={32} className="mx-auto mb-2 opacity-30" />
                      Tidak ditemukan. Pastikan pelanggan sudah ditambahkan di menu Data Pelanggan.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {platSuggestions.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setSelectedCustomer(c); setPlatSearch(c.licensePlate); }}
                          className="w-full text-left p-3.5 rounded-2xl border-2 border-slate-200 hover:border-red-400 hover:bg-red-50/50 transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors">
                              <Car size={16} className="text-slate-500 group-hover:text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-slate-900 text-sm truncate">{c.name}</p>
                              <p className="text-xs text-slate-500 truncate">{c.carBrand} {c.carModel} · {c.carYear}</p>
                              <span className="inline-block mt-1 font-mono text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">{c.licensePlate}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Customer Card */}
              {selectedCustomer && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Pelanggan Dipilih</p>
                      <h3 className="text-xl font-black">{selectedCustomer.name}</h3>
                      <p className="text-slate-300 text-sm">{selectedCustomer.phone}</p>
                    </div>
                    <button onClick={() => { setSelectedCustomer(null); setPlatSearch(''); }} className="text-slate-400 hover:text-white transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-semibold">Kendaraan</p>
                      <p className="font-black text-sm">{selectedCustomer.carBrand} {selectedCustomer.carModel}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-semibold">Plat Nomor</p>
                      <p className="font-black text-sm font-mono">{selectedCustomer.licensePlate}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-semibold">Tahun / Transmisi</p>
                      <p className="font-bold text-sm">{selectedCustomer.carYear} / {selectedCustomer.transmission}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-semibold">Warna</p>
                      <p className="font-bold text-sm">{selectedCustomer.carColor || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-300 font-semibold whitespace-nowrap">Kilometer Masuk:</label>
                    <input
                      type="text"
                      value={kilometer}
                      onChange={e => setKilometer(e.target.value)}
                      placeholder="cth: 45.230 km"
                      className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ STEP 1: Pengecekan SA ═══ */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                <Sparkles size={16} className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 font-semibold">Tandai setiap komponen sesuai kondisi aktual kendaraan. Item bertanda ⚠️ / 🔴 akan muncul di rekomendasi nota.</p>
              </div>
              <SATable title="🚗 Tahap 1 — Kondisi Eksterior" items={eksterior} onChange={setEksterior} />
              <SATable title="💺 Tahap 2 — Kondisi Interior" items={interior} onChange={setInterior} />
              <SATable title="⚙️ Tahap 3 — Mesin & Kelistrikan" items={mesin} onChange={setMesin} />
              <SATable title="🔩 Tahap 4 — Kaki-kaki & Rem" items={kakiKaki} onChange={setKakiKaki} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">Nama Service Advisor</label>
                  <input value={saAdvisor} onChange={e => setSaAdvisor(e.target.value)} placeholder="Nama SA yang bertugas..." className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">Catatan SA (Umum)</label>
                  <input value={saCatatan} onChange={e => setSaCatatan(e.target.value)} placeholder="Catatan atau keluhan pelanggan..." className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-400 transition-colors" />
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Nota Sparepart & Jasa ═══ */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Sparepart */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <h4 className="text-sm font-black text-slate-800">🔧 Daftar Sparepart</h4>
                  <button type="button" onClick={addSparepart} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all">
                    <Plus size={13} /> Tambah Part
                  </button>
                </div>
                {spareparts.length === 0 ? (
                  <div className="py-6 text-center text-sm text-slate-400">Belum ada sparepart. Klik "+ Tambah Part"</div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {spareparts.map(p => (
                      <div key={p.id} className="p-3 grid grid-cols-12 gap-2 items-center">
                        <input value={p.nama} onChange={e => updateSparepart(p.id, { nama: e.target.value })} placeholder="Nama Part / Kode" className="col-span-5 px-2.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-red-400" />
                        <input type="number" value={p.qty || ''} onChange={e => updateSparepart(p.id, { qty: Number(e.target.value) })} placeholder="Qty" className="col-span-1 px-2 py-2 rounded-lg border border-slate-200 text-xs text-center focus:outline-none focus:border-red-400" min={1} />
                        <select value={p.satuan} onChange={e => updateSparepart(p.id, { satuan: e.target.value })} className="col-span-2 px-1 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-red-400 bg-white">
                          {['pcs','liter','set','meter','roll','botol','kaleng'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <input type="number" value={p.hargaSatuan || ''} onChange={e => updateSparepart(p.id, { hargaSatuan: Number(e.target.value) })} placeholder="Harga/pcs" className="col-span-3 px-2.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-red-400" min={0} />
                        <button onClick={() => removeSparepart(p.id)} className="col-span-1 flex justify-center text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="px-3 py-2 bg-slate-50 flex justify-end">
                      <span className="text-xs font-bold text-slate-600">Subtotal Part: <span className="text-red-600">{formatRp(subtotalParts)}</span></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Jasa */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <h4 className="text-sm font-black text-slate-800">💰 Biaya Jasa Pekerjaan</h4>
                  <button type="button" onClick={addJasa} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all">
                    <Plus size={13} /> Tambah Jasa
                  </button>
                </div>
                {jasaList.length === 0 ? (
                  <div className="py-6 text-center text-sm text-slate-400">Belum ada jasa. Klik "+ Tambah Jasa"</div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {jasaList.map(j => (
                      <div key={j.id} className="p-3 flex items-center gap-2">
                        <input value={j.nama} onChange={e => updateJasa(j.id, { nama: e.target.value })} placeholder="Nama pekerjaan / jasa" className="flex-1 px-2.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-red-400" />
                        <input type="number" value={j.harga || ''} onChange={e => updateJasa(j.id, { harga: Number(e.target.value) })} placeholder="Biaya (Rp)" className="w-36 px-2.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-red-400" min={0} />
                        <button onClick={() => removeJasa(j.id)} className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="px-3 py-2 bg-slate-50 flex justify-end">
                      <span className="text-xs font-bold text-slate-600">Subtotal Jasa: <span className="text-slate-800">{formatRp(subtotalJasa)}</span></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Diskon & Pajak */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm">
                <h4 className="text-sm font-black text-slate-800">📊 Diskon & Pajak</h4>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-slate-500 mb-1 block">Diskon (%)</label>
                    <input type="number" value={diskon} onChange={e => setDiskon(Number(e.target.value))} min={0} max={100} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-400 text-center font-bold" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-slate-500 mb-1 block">Pajak / PPN (%)</label>
                    <input type="number" value={pajak} onChange={e => setPajak(Number(e.target.value))} min={0} max={100} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-400 text-center font-bold" />
                  </div>
                </div>
                <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-300"><span>Subtotal Part + Jasa</span><span>{formatRp(subtotal)}</span></div>
                  {diskon > 0 && <div className="flex justify-between text-xs text-amber-400"><span>Diskon ({diskon}%)</span><span>-{formatRp(diskonAmt)}</span></div>}
                  {pajak > 0 && <div className="flex justify-between text-xs text-slate-400"><span>PPN ({pajak}%)</span><span>+{formatRp(pajakAmt)}</span></div>}
                  <div className="flex justify-between font-black text-lg border-t border-white/20 pt-2">
                    <span>TOTAL</span><span className="text-red-400">{formatRp(grand)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: LPA ═══ */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                <ClipboardList size={16} className="text-blue-500 shrink-0" />
                <p className="text-xs text-blue-700 font-semibold">Lembar Pemeriksaan Akhir (LPA) — checklist sebelum kendaraan diserahkan kepada pelanggan.</p>
              </div>
              <SATable title="✅ Checklist Kelengkapan & Kondisi Akhir" items={lpaChecklist} onChange={setLpaChecklist} />
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5">Nama Teknisi / Mekanik</label>
                    <input value={lpaTeknisi} onChange={e => setLpaTeknisi(e.target.value)} placeholder="Nama mekanik yang mengerjakan..." className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5">Hasil Test Drive</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setLpaTestDrive(true)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${lpaTestDrive ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 text-slate-500 hover:border-emerald-300'}`}>
                        ✅ Normal & Aman
                      </button>
                      <button type="button" onClick={() => setLpaTestDrive(false)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${!lpaTestDrive ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-200 text-slate-500 hover:border-amber-300'}`}>
                        ⚠️ Ada Catatan
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">Catatan LPA</label>
                  <textarea value={lpaCatatan} onChange={e => setLpaCatatan(e.target.value)} rows={3} placeholder="Catatan khusus sebelum diserahkan ke pelanggan..." className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-400 resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 4: Nota Akhir ═══ */}
          {step === 4 && (
            <div className="space-y-4">
              {savedId ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">SPK Berhasil Disimpan!</h3>
                  <p className="text-sm text-slate-500 mb-2">No. SPK: <span className="font-mono font-black text-red-600">{spkNumber}</span></p>
                  <button onClick={handlePrint} className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-all mt-4">
                    <Printer size={15} /> Cetak Nota
                  </button>
                </div>
              ) : (
                <>
                  {/* Ringkasan */}
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-200">
                    <h4 className="font-black text-slate-800 text-sm mb-3">📋 Ringkasan SPK</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <div className="text-slate-400">Pelanggan</div><div className="font-semibold text-slate-800">{selectedCustomer?.name}</div>
                      <div className="text-slate-400">Kendaraan</div><div className="font-semibold">{selectedCustomer?.carBrand} {selectedCustomer?.carModel}</div>
                      <div className="text-slate-400">Plat Nomor</div><div className="font-mono font-bold text-red-600">{selectedCustomer?.licensePlate}</div>
                      <div className="text-slate-400">Sparepart</div><div className="font-semibold">{spareparts.length} item — {formatRp(subtotalParts)}</div>
                      <div className="text-slate-400">Jasa Pekerjaan</div><div className="font-semibold">{jasaList.length} item — {formatRp(subtotalJasa)}</div>
                    </div>
                    <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-center">
                      <span className="font-black text-base text-slate-900">GRAND TOTAL</span>
                      <span className="font-black text-xl text-red-600">{formatRp(grand)}</span>
                    </div>
                  </div>

                  {/* Pembayaran */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-sm">
                    <h4 className="font-black text-slate-800 text-sm">💳 Pembayaran</h4>
                    <div className="flex gap-2">
                      {(['cash', 'transfer', 'kredit'] as const).map(m => (
                        <button key={m} type="button" onClick={() => setMetodeBayar(m)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all capitalize ${metodeBayar === m ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                          {m === 'cash' ? '💵 Cash' : m === 'transfer' ? '🏦 Transfer' : '💳 Kredit'}
                        </button>
                      ))}
                    </div>
                    {metodeBayar === 'cash' && (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-600">Nominal Dibayar (Rp)</label>
                        <input type="number" value={dibayar || ''} onChange={e => setDibayar(Number(e.target.value))} placeholder={String(grand)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-red-400" />
                        {dibayar > 0 && (
                          <div className={`flex justify-between text-sm font-bold px-3.5 py-2 rounded-xl ${kembalian >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                            <span>Kembalian</span>
                            <span>{kembalian >= 0 ? formatRp(kembalian) : 'Kurang bayar!'}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Nota Preview */}
                  <NotaAkhirPrint data={spkData} customer={selectedCustomer} />
                </>
              )}
            </div>
          )}
        </div>

        {/* ── FOOTER NAVIGATION ── */}
        {!savedId && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
            <button
              onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold transition-all"
            >
              <ChevronLeft size={15} />
              {step === 0 ? 'Batal' : 'Kembali'}
            </button>

            <span className="text-xs text-slate-400 font-semibold">Langkah {step + 1} dari {STEPS.length}</span>

            {step < 4 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-md shadow-red-600/20"
              >
                Lanjut <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                {saving ? <><Clock size={14} className="animate-spin" /> Menyimpan...</> : <><Save size={14} /> Simpan SPK</>}
              </button>
            )}
          </div>
        )}

        {/* ── PRINT BUTTON when saved ── */}
        {savedId && (
          <div className="flex items-center justify-center gap-3 px-5 py-4 border-t border-slate-100 bg-white flex-shrink-0">
            <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-all">
              <Printer size={14} /> Cetak Nota
            </button>
            <button onClick={onClose} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all">
              <CheckCircle size={14} /> Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
