import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Search, Car, User, Phone, MapPin,
  CheckCircle, AlertTriangle, XCircle, Plus, Trash2, Printer,
  Save, Clock, Wrench, FileText, ClipboardList, Receipt, CreditCard,
  Banknote, Check, ArrowLeft, Calendar, Hash, Gauge, Palette,
  Settings2, AlertCircle, Info, RefreshCw, DollarSign, Percent,
  ShoppingCart, BarChart3, ChevronDown, Fuel, UserCheck, ShieldCheck,
  Building, CheckSquare, Layers, Users
} from 'lucide-react';
import {
  CustomerItem, SACheckItem, SACheckResult,
  SPKSparepart, SPKJasa, EmployeeItem, CRMOrder
} from '../../types';
import { addSPK, updateSPK, updateOrder } from '../../lib/firestoreService';

/* ─── PROPS ──────────────────────────────────────────────────────────── */
interface CRMSPKCreateProps {
  customers?: CustomerItem[];
  employees?: EmployeeItem[];
  onNavigate: (page: any) => void;
  editingOrder?: CRMOrder | null;
  onSaveSuccess?: () => void;
}

/* ─── HELPERS ────────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).substring(2, 9);
const formatRp = (n: number) =>
  'Rp ' + Math.round(n || 0).toLocaleString('id-ID');

function makeCheck(label: string): SACheckItem {
  return { id: uid(), label, result: '', catatan: '' };
}

/* ─── CHECKLIST DATA ─────────────────────────────────────────────────── */
const EKSTERIOR_ITEMS = [
  'Body & Panel Pintu', 'Cat & Poles Bodi', 'Kaca Depan & Belakang',
  'Lampu Depan (Headlamp)', 'Lampu Belakang (Tailamp)',
  'Bumper Depan & Belakang', 'Spion Kiri & Kanan',
  'Wiper Depan & Belakang', 'Antena & Roof Rail', 'Handle Pintu & Kunci',
].map(makeCheck);

const INTERIOR_ITEMS = [
  'Dashboard & Panel Instrumen', 'AC Kabin & Blower',
  'Audio / Head Unit', 'Kursi & Sandaran', 'Karpet & Plafon',
  'Power Window Semua Pintu', 'Sabuk Pengaman (Seatbelt)',
  'Central Lock & Alarm', 'Handle & Trim Pintu', 'Spidometer & Indikator',
].map(makeCheck);

const MESIN_ITEMS = [
  'Oli Mesin (Level & Kondisi)', 'Filter Oli Mesin', 'Filter Udara',
  'Air Radiator & Coolant', 'Aki / Baterai (Tegangan)',
  'Alternator & Dinamo Starter', 'V-Belt & Timing Belt',
  'Busi & Kabel Busi', 'Selang & Klem Radiator',
  'Sistem Bahan Bakar & Injektor', 'Catalytic Converter & Knalpot', 'Kompresor & Extra Fan AC',
].map(makeCheck);

const KAKI_ITEMS = [
  'Ban Depan (Tekanan & Keausan)', 'Ban Belakang (Tekanan & Keausan)',
  'Rem Depan (Kampas & Cakram)', 'Rem Belakang (Kampas & Tromol)',
  'Minyak Rem (Level & Kondisi)', 'Shock Absorber Depan',
  'Shock Absorber Belakang', 'Tie Rod & Ball Joint',
  'Sistem Kemudi (Rack End / EPS)', 'Kopling / Transmisi Matic',
  'CV Joint & As Roda', 'Per / Pegas Suspensi',
].map(makeCheck);

const LPA_ITEMS = [
  'Kunci Kontak & Remote Kendaraan', 'Buku Servis & STNK Asli',
  'Ban Serep & Toolkit Lengkap', 'Dongkrak & Kunci Roda',
  'Kelengkapan Interior (Karpet, Barang Pelanggan)', 'Kebersihan Eksterior & Body',
  'Kebersihan Interior & Kabin Wangi', 'Semua Lampu & Indikator Berfungsi Normal',
  'AC Dingin & Blower Berfungsi Normal', 'Audio & Kelistrikan Normal',
  'Power Window & Central Lock Berfungsi', 'Rem Utama & Rem Parkir Pakem',
  'Tekanan Semua Ban Sesuai Standar', 'Tidak Ada Kebocoran Oli / Air / Minyak Rem',
].map(makeCheck);

/* ─── STEP CONFIG ────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Informasi Kendaraan & Staf', short: 'Kendaraan & Staf', icon: Car,           desc: 'Data mobil, pelanggan & penugasan staf' },
  { id: 2, label: 'Pengecekan SA (4 Tahap)',   short: 'Inspeksi SA',       icon: ClipboardList, desc: 'Pemeriksaan 44 titik komponen' },
  { id: 3, label: 'Nota Sparepart & Jasa',      short: 'Sparepart & Jasa',  icon: ShoppingCart,  desc: 'Rincian material, jasa & diskon' },
  { id: 4, label: 'Lembar LPA Akhir',           short: 'LPA Akhir',         icon: FileText,      desc: 'Quality control & uji jalan' },
  { id: 5, label: 'Nota Resmi & Pembayaran',    short: 'Nota & Selesai',    icon: Receipt,       desc: 'Pembayaran, simpan & cetak nota' },
];

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

/* ─── CORPORATE PRINTABLE NOTA / INVOICE ───────────────────────────────── */
function NotaCorporatePrint({ spkData }: { spkData: any }) {
  const subParts = spkData.spareparts.reduce((s: number, p: SPKSparepart) => s + p.qty * p.hargaSatuan, 0);
  const subJasa  = spkData.jasaList.reduce((s: number, j: SPKJasa) => s + j.harga, 0);
  const subTotal = subParts + subJasa;
  const discAmt  = subTotal * (spkData.diskon / 100);
  const dpp      = subTotal - discAmt;
  const taxAmt   = dpp * (spkData.pajak / 100);
  const grandTotal = Math.round(dpp + taxAmt);
  const kembalian = Math.max(0, (spkData.dibayar || 0) - grandTotal);

  return (
    <div id="nota-print-area" className="bg-white text-slate-900 p-8 font-sans text-xs rounded-2xl border border-slate-300 shadow-sm max-w-4xl mx-auto">
      
      {/* ── KOP SURAT RESMI ── */}
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 mb-5">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="FHR Car Service Logo"
            className="h-16 w-auto object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">FHR CAR SERVICE</h1>
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Bengkel Mobil Resmi & Layanan Emergency 24 Jam</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Jl. Raya Sokaraja - Banyumas, Jawa Tengah • Hotline: 0812-3456-7890 • Web: fhrcar.xyz
            </p>
            <p className="text-[10px] text-slate-400">
              Spesialis: Tune Up, Overhaul, Transmisi Matic/Manual, Kaki-kaki, Kelistrikan & AC Mobil
            </p>
          </div>
        </div>

        <div className="text-right flex-shrink-0 bg-slate-50 border border-slate-200 p-3 rounded-xl min-w-[200px]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FAKTUR / SURAT PERINTAH KERJA</p>
          <p className="text-base font-black font-mono text-red-600 mt-0.5">{spkData.spkNumber}</p>
          <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
            <p>Tgl: <strong className="text-slate-800">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
            <p>Waktu: <strong className="text-slate-800">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</strong></p>
          </div>
        </div>
      </div>

      {/* ── 2 COLUMN: DATA PELANGGAN & DATA KENDARAAN ── */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Box 1: Data Pelanggan */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <User size={12} className="text-red-600" /> IDENTITAS PELANGGAN
          </p>
          <div className="grid grid-cols-3 gap-1 pt-1">
            <span className="text-slate-400 font-semibold">Nama Pemilik</span>
            <span className="col-span-2 font-black text-slate-900 text-sm">: {spkData.customerName || '—'}</span>
            
            <span className="text-slate-400 font-semibold">No. Telepon / WA</span>
            <span className="col-span-2 font-bold text-slate-800">: {spkData.phone || '—'}</span>
            
            <span className="text-slate-400 font-semibold">Alamat Lengkap</span>
            <span className="col-span-2 text-slate-700 leading-tight">: {spkData.address || '—'}</span>

            <span className="text-slate-400 font-semibold">Keluhan Awal</span>
            <span className="col-span-2 text-red-600 font-semibold leading-tight">: {spkData.keluhan || 'General Service & Check-up'}</span>
          </div>
        </div>

        {/* Box 2: Data Kendaraan */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <Car size={12} className="text-red-600" /> SPESIFIKASI KENDARAAN
          </p>
          <div className="grid grid-cols-3 gap-1 pt-1">
            <span className="text-slate-400 font-semibold">No. Polisi / Plat</span>
            <span className="col-span-2 font-black font-mono text-red-600 text-sm">: {spkData.licensePlate || '—'}</span>
            
            <span className="text-slate-400 font-semibold">Merk & Model Unit</span>
            <span className="col-span-2 font-bold text-slate-800">: {spkData.carBrand} {spkData.carModel}</span>
            
            <span className="text-slate-400 font-semibold">Tahun / Transmisi</span>
            <span className="col-span-2 text-slate-700">: {spkData.carYear} • {spkData.transmission}</span>

            <span className="text-slate-400 font-semibold">Warna / Bahan Bakar</span>
            <span className="col-span-2 text-slate-700">: {spkData.carColor || '—'} • {spkData.fuelType || 'Bensin'}</span>

            <span className="text-slate-400 font-semibold">Kilometer Odometer</span>
            <span className="col-span-2 font-bold text-slate-800">: {spkData.kilometer || '—'}</span>

            <span className="text-slate-400 font-semibold">No. Rangka / Mesin</span>
            <span className="col-span-2 font-mono text-[10px] text-slate-600">: {spkData.noRangka || '—'} / {spkData.noMesin || '—'}</span>
          </div>
        </div>
      </div>

      {/* ── STAF PENANGGUNG JAWAB ── */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-3 mb-5 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Service Advisor (SA):</span>
          <span className="font-black text-slate-900">{spkData.saName || '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Front Advisor (FA):</span>
          <span className="font-bold text-slate-800">{spkData.faName || 'Admin'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Mekanik Pelaksana:</span>
          <span className="font-black text-blue-700">{spkData.mekanikName || '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Kasir / Keuangan:</span>
          <span className="font-bold text-slate-800">{spkData.kasirName || 'Kasir 1'}</span>
        </div>
      </div>

      {/* ── TABEL 1: SUKU CADANG / SPAREPART ── */}
      <div className="mb-5">
        <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-1.5 rounded-t-lg">
          <span className="font-black text-[11px] uppercase tracking-wider">A. SUKU CADANG & MATERIAL (SPAREPARTS)</span>
          <span className="text-[10px] text-slate-300">{spkData.spareparts.length} Item</span>
        </div>
        <table className="w-full border-x border-b border-slate-200 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold">
              <th className="py-2 px-3 text-center w-10">No.</th>
              <th className="py-2 px-3 text-left">Nama Part / Kode Barang</th>
              <th className="py-2 px-3 text-center w-16">Qty</th>
              <th className="py-2 px-3 text-center w-20">Satuan</th>
              <th className="py-2 px-3 text-right w-28">Harga Satuan</th>
              <th className="py-2 px-3 text-right w-28">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {spkData.spareparts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-2.5 text-slate-400 italic">Tidak ada penggunaan suku cadang baru</td>
              </tr>
            ) : (
              spkData.spareparts.map((p: SPKSparepart, idx: number) => (
                <tr key={p.id}>
                  <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{p.nama}</td>
                  <td className="py-2 px-3 text-center font-bold text-slate-700">{p.qty}</td>
                  <td className="py-2 px-3 text-center text-slate-500">{p.satuan}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700">{formatRp(p.hargaSatuan)}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatRp(p.qty * p.hargaSatuan)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
              <td colSpan={5} className="py-2 px-3 text-right text-slate-600">Subtotal Suku Cadang:</td>
              <td className="py-2 px-3 text-right font-mono text-slate-900">{formatRp(subParts)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── TABEL 2: JASA PEKERJAAN & BIAYA ── */}
      <div className="mb-5">
        <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-1.5 rounded-t-lg">
          <span className="font-black text-[11px] uppercase tracking-wider">B. ONGKOS JASA & PEKERJAAN SERVIS</span>
          <span className="text-[10px] text-slate-300">{spkData.jasaList.length} Item</span>
        </div>
        <table className="w-full border-x border-b border-slate-200 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold">
              <th className="py-2 px-3 text-center w-10">No.</th>
              <th className="py-2 px-3 text-left">Deskripsi Pekerjaan Servis</th>
              <th className="py-2 px-3 text-center w-36">Teknisi Pelaksana</th>
              <th className="py-2 px-3 text-right w-36">Biaya Jasa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {spkData.jasaList.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-2.5 text-slate-400 italic">Tidak ada item jasa tambahan</td>
              </tr>
            ) : (
              spkData.jasaList.map((j: SPKJasa, idx: number) => (
                <tr key={j.id}>
                  <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{j.nama}</td>
                  <td className="py-2 px-3 text-center text-slate-600">{spkData.mekanikName || 'Mekanik'}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatRp(j.harga)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
              <td colSpan={3} className="py-2 px-3 text-right text-slate-600">Subtotal Jasa Servis:</td>
              <td className="py-2 px-3 text-right font-mono text-slate-900">{formatRp(subJasa)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── FINANCIAL SUMMARY & GARANSI / KETENTUAN ── */}
      <div className="grid grid-cols-12 gap-5 mb-6">
        {/* Kiri: Ketentuan, Garansi & Servis Berikutnya */}
        <div className="col-span-7 space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[11px] space-y-2">
            <p className="font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-600" /> KETENTUAN GARANSI & CATATAN SERVIS
            </p>
            <ul className="text-slate-600 space-y-1 list-disc pl-4 leading-relaxed text-[10px]">
              <li>Garansi pekerjaan servis berlaku selama <strong>7 (tujuh) hari</strong> atau <strong>1.000 KM</strong> (mana tercapai lebih dahulu).</li>
              <li>Suku cadang asli bergaransi sesuai ketentuan pabrikan resmi.</li>
              <li>Garansi gugur apabila segel rusak, terjadi modifikasi non-standar, atau kesalahan pemakaian/kelalaian pengguna.</li>
              <li>Barang bekas/lama yang diganti telah diserahkan kembali kepada pemilik kendaraan.</li>
            </ul>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <p className="font-black text-amber-900">REKOMENDASI SERVIS BERIKUTNYA:</p>
              <p className="text-amber-800 text-[11px]">Lakukan servis berkala berikutnya pada:</p>
            </div>
            <div className="text-right font-bold text-amber-950">
              <p>KM: <span className="font-black font-mono text-red-600">{spkData.nextServiceKm || (Number(spkData.kilometer?.replace(/[^0-9]/g, '') || 0) + 5000) + ' KM'}</span></p>
              <p className="text-[10px] text-slate-500">atau 3 bulan mendatang</p>
            </div>
          </div>
        </div>

        {/* Kanan: Kalkulasi Finansial Total */}
        <div className="col-span-5 bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Total Sparepart:</span>
            <span className="font-mono font-semibold">{formatRp(subParts)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Total Jasa Servis:</span>
            <span className="font-mono font-semibold">{formatRp(subJasa)}</span>
          </div>
          <div className="flex justify-between text-slate-700 font-bold border-t border-slate-200 pt-1.5">
            <span>Jumlah Total Kotor:</span>
            <span className="font-mono">{formatRp(subTotal)}</span>
          </div>
          {spkData.diskon > 0 && (
            <div className="flex justify-between text-amber-600 font-semibold">
              <span>Diskon ({spkData.diskon}%):</span>
              <span className="font-mono">- {formatRp(discAmt)}</span>
            </div>
          )}
          {spkData.pajak > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>PPN ({spkData.pajak}%):</span>
              <span className="font-mono">+ {formatRp(taxAmt)}</span>
            </div>
          )}
          <div className="border-t-2 border-slate-800 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
            <span>TOTAL TAGIHAN:</span>
            <span className="text-base font-mono text-red-600">{formatRp(grandTotal)}</span>
          </div>
          
          <div className="border-t border-slate-200 pt-2 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Metode Pembayaran:</span>
              <span className="font-bold uppercase text-slate-900">{spkData.metodeBayar}</span>
            </div>
            {spkData.dibayar > 0 && (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Nominal Dibayar:</span>
                  <span className="font-mono font-semibold">{formatRp(spkData.dibayar)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Kembalian:</span>
                  <span className="font-mono">{formatRp(kembalian)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── 4 KOLOM TANDA TANGAN RESMI ── */}
      <div className="border-t-2 border-slate-800 pt-4 grid grid-cols-4 gap-4 text-center text-[10px]">
        <div>
          <p className="text-slate-400 uppercase font-semibold">Pelanggan / Pemilik</p>
          <div className="h-16 flex items-end justify-center">
            <span className="border-b border-slate-400 w-32 inline-block"></span>
          </div>
          <p className="font-bold text-slate-800 mt-1">{spkData.customerName || '( .............................. )'}</p>
        </div>

        <div>
          <p className="text-slate-400 uppercase font-semibold">Service Advisor (SA)</p>
          <div className="h-16 flex items-end justify-center">
            <span className="border-b border-slate-400 w-32 inline-block"></span>
          </div>
          <p className="font-bold text-slate-800 mt-1">{spkData.saName || '( .............................. )'}</p>
        </div>

        <div>
          <p className="text-slate-400 uppercase font-semibold">Mekanik Pelaksana</p>
          <div className="h-16 flex items-end justify-center">
            <span className="border-b border-slate-400 w-32 inline-block"></span>
          </div>
          <p className="font-bold text-slate-800 mt-1">{spkData.mekanikName || '( .............................. )'}</p>
        </div>

        <div>
          <p className="text-slate-400 uppercase font-semibold">Kasir / Keuangan</p>
          <div className="h-16 flex items-end justify-center">
            <span className="border-b border-slate-400 w-32 inline-block"></span>
          </div>
          <p className="font-bold text-slate-800 mt-1">{spkData.kasirName || '( .............................. )'}</p>
        </div>
      </div>

      <div className="text-center text-[9px] text-slate-400 mt-5 pt-3 border-t border-dashed border-slate-200">
        Dokumen ini sah dicetak oleh Sistem Manajemen Bengkel FHR Car Service • fhrcar.xyz
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE COMPONENT                                                    */
/* ═══════════════════════════════════════════════════════════════════════ */
export function CRMSPKCreate({ customers = [], employees = [], onNavigate, editingOrder, onSaveSuccess }: CRMSPKCreateProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [activeCheckTab, setActiveCheckTab] = useState(0);
  const [draftToast, setDraftToast] = useState(false);

  /* ── Step 1: Data Pelanggan & Kendaraan & Staf ── */
  const [platSearch, setPlatSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [kilometer, setKilometer] = useState('');
  const [noRangka, setNoRangka] = useState('');
  const [noMesin, setNoMesin] = useState('');
  const [fuelType, setFuelType] = useState('Bensin');
  const [keluhan, setKeluhan] = useState('');

  // Staff Dropdowns (Dynamic from Employee list)
  const [selectedSaId, setSelectedSaId] = useState('');
  const [saCustomName, setSaCustomName] = useState('');
  const [selectedFaId, setSelectedFaId] = useState('');
  const [faCustomName, setFaCustomName] = useState('');
  const [selectedMekanikId, setSelectedMekanikId] = useState('');
  const [mekanikCustomName, setMekanikCustomName] = useState('');
  const [selectedKasirId, setSelectedKasirId] = useState('');
  const [kasirCustomName, setKasirCustomName] = useState('');

  /* ── Step 2: SA Check ── */
  const [eksterior, setEksterior]   = useState<SACheckItem[]>(EKSTERIOR_ITEMS.map(i => ({ ...i, id: uid() })));
  const [interior, setInterior]     = useState<SACheckItem[]>(INTERIOR_ITEMS.map(i => ({ ...i, id: uid() })));
  const [mesin, setMesin]           = useState<SACheckItem[]>(MESIN_ITEMS.map(i => ({ ...i, id: uid() })));
  const [kakiKaki, setKakiKaki]     = useState<SACheckItem[]>(KAKI_ITEMS.map(i => ({ ...i, id: uid() })));
  const [saCatatan, setSaCatatan]   = useState('');

  /* ── Step 3: Sparepart & Jasa ── */
  const [spareparts, setSpareparts] = useState<SPKSparepart[]>([]);
  const [jasaList, setJasaList]     = useState<SPKJasa[]>([{ id: uid(), nama: 'Biaya Jasa Servis Rutin', harga: 75000 }]);
  const [diskon, setDiskon]         = useState(0);
  const [pajak, setPajak]           = useState(0);

  /* ── Step 4: LPA ── */
  const [lpaChecklist, setLpaChecklist] = useState<SACheckItem[]>(LPA_ITEMS.map(i => ({ ...i, id: uid() })));
  const [lpaTestDrive, setLpaTestDrive] = useState(true);
  const [lpaCatatan, setLpaCatatan]     = useState('');

  /* ── Step 5: Pembayaran & Nota Akhir ── */
  const [metodeBayar, setMetodeBayar] = useState<'cash' | 'transfer' | 'kredit'>('cash');
  const [dibayar, setDibayar]         = useState(0);

  const safeEmployees = employees || [];
  const safeCustomers = customers || [];

  // Initialize or Pre-fill when editing an existing Order/SPK
  React.useEffect(() => {
    if (editingOrder) {
      const existingCust = safeCustomers.find(c =>
        c.phone === editingOrder.phone ||
        c.name.toLowerCase() === editingOrder.customerName?.toLowerCase() ||
        c.licensePlate?.toLowerCase() === editingOrder.licensePlate?.toLowerCase()
      ) || {
        id: 'cust-' + editingOrder.id,
        name: editingOrder.customerName || 'Pelanggan',
        phone: editingOrder.phone || '',
        address: editingOrder.locationAddress || '',
        carBrand: editingOrder.carBrand || 'Toyota',
        carModel: editingOrder.carModel || '',
        carYear: editingOrder.carYear || '2022',
        licensePlate: editingOrder.licensePlate || '',
        customerType: editingOrder.customerType || 'BARU',
        createdAt: editingOrder.createdAt || new Date().toISOString(),
      };

      setSelectedCustomer(existingCust);
      setPlatSearch(existingCust.licensePlate || '');
      if (editingOrder.kilometer) setKilometer(editingOrder.kilometer);
      if (editingOrder.noRangka) setNoRangka(editingOrder.noRangka);
      if (editingOrder.noMesin) setNoMesin(editingOrder.noMesin);
      if (editingOrder.fuelType) setFuelType(editingOrder.fuelType);
      if (editingOrder.notes) setKeluhan(editingOrder.notes);
      if (editingOrder.saName) setSaCustomName(editingOrder.saName);
      if (editingOrder.mekanikName) setMekanikCustomName(editingOrder.mekanikName);
      if (editingOrder.faName) setFaCustomName(editingOrder.faName);
      if (editingOrder.kasirName) setKasirCustomName(editingOrder.kasirName);

      if (editingOrder.spareparts && editingOrder.spareparts.length > 0) {
        setSpareparts(editingOrder.spareparts);
      }
      if (editingOrder.jasaList && editingOrder.jasaList.length > 0) {
        setJasaList(editingOrder.jasaList);
      } else if (editingOrder.serviceType) {
        setJasaList([{ id: uid(), nama: editingOrder.serviceType, harga: editingOrder.totalPrice || 75000 }]);
      }

      if (editingOrder.saCheckEksterior && editingOrder.saCheckEksterior.length > 0) setEksterior(editingOrder.saCheckEksterior);
      if (editingOrder.saCheckInterior && editingOrder.saCheckInterior.length > 0) setInterior(editingOrder.saCheckInterior);
      if (editingOrder.saCheckMesin && editingOrder.saCheckMesin.length > 0) setMesin(editingOrder.saCheckMesin);
      if (editingOrder.saCheckKakiKaki && editingOrder.saCheckKakiKaki.length > 0) setKakiKaki(editingOrder.saCheckKakiKaki);
      if (editingOrder.lpaChecklist && editingOrder.lpaChecklist.length > 0) setLpaChecklist(editingOrder.lpaChecklist);
      if (editingOrder.saCatatanUmum) setSaCatatan(editingOrder.saCatatanUmum);
      if (editingOrder.lpaCatatan) setLpaCatatan(editingOrder.lpaCatatan);
      if (editingOrder.diskon) setDiskon(editingOrder.diskon);
      if (editingOrder.pajakPersen) setPajak(editingOrder.pajakPersen);
      if (editingOrder.metodePembayaran) setMetodeBayar(editingOrder.metodePembayaran);
      if (editingOrder.dibayar) setDibayar(editingOrder.dibayar);
    }
  }, [editingOrder, safeCustomers]);

  /* ── Filter Staff by Role ── */
  const saList = useMemo(() => safeEmployees.filter(e => e.role === 'SA' && e.status === 'active'), [safeEmployees]);
  const faList = useMemo(() => safeEmployees.filter(e => (e.role === 'FA' || e.role === 'Manager') && e.status === 'active'), [safeEmployees]);
  const mekanikList = useMemo(() => safeEmployees.filter(e => (e.role === 'Mekanik' || e.role === 'Foreman') && e.status === 'active'), [safeEmployees]);
  const kasirList = useMemo(() => safeEmployees.filter(e => (e.role === 'Kasir' || e.role === 'FA') && e.status === 'active'), [safeEmployees]);

  // Derive active names
  const effectiveSaName = useMemo(() => {
    if (selectedSaId === 'custom') return saCustomName;
    const found = safeEmployees.find(e => e.id === selectedSaId);
    return found ? found.name : saCustomName || (saList[0]?.name || 'Budi Santoso');
  }, [selectedSaId, saCustomName, safeEmployees, saList]);

  const effectiveFaName = useMemo(() => {
    if (selectedFaId === 'custom') return faCustomName;
    const found = safeEmployees.find(e => e.id === selectedFaId);
    return found ? found.name : faCustomName || (faList[0]?.name || 'Rizky Pratama');
  }, [selectedFaId, faCustomName, safeEmployees, faList]);

  const effectiveMekanikName = useMemo(() => {
    if (selectedMekanikId === 'custom') return mekanikCustomName;
    const found = safeEmployees.find(e => e.id === selectedMekanikId);
    return found ? found.name : mekanikCustomName || (mekanikList[0]?.name || 'Agus Setiawan');
  }, [selectedMekanikId, mekanikCustomName, safeEmployees, mekanikList]);

  const effectiveKasirName = useMemo(() => {
    if (selectedKasirId === 'custom') return kasirCustomName;
    const found = safeEmployees.find(e => e.id === selectedKasirId);
    return found ? found.name : kasirCustomName || (kasirList[0]?.name || 'Siti Rahma');
  }, [selectedKasirId, kasirCustomName, safeEmployees, kasirList]);

  /* ── SPK Number ── */
  const spkNumber = useMemo(() => {
    if (editingOrder?.spkNumber) return editingOrder.spkNumber;
    if (editingOrder?.id) return editingOrder.id;
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `SPK/${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}/${uid().toUpperCase()}`;
  }, [editingOrder]);

  /* ── Financials ── */
  const subParts  = spareparts.reduce((s, p) => s + (p.qty || 0) * (p.hargaSatuan || 0), 0);
  const subJasa   = jasaList.reduce((s, j) => s + (j.harga || 0), 0);
  const subtotal  = subParts + subJasa;
  const discAmt   = subtotal * (diskon / 100);
  const taxAmt    = (subtotal - discAmt) * (pajak / 100);
  const grand     = Math.round(subtotal - discAmt + taxAmt);
  const kembalian = Math.max(0, dibayar - grand);

  /* ── Autocomplete ── */
  const platSuggestions = useMemo(() => {
    const q = platSearch.toLowerCase().replace(/\s/g, '');
    if (!q) return safeCustomers.slice(0, 10);
    return safeCustomers.filter(c =>
      (c.licensePlate || '').toLowerCase().replace(/\s/g, '').includes(q) ||
      (c.name || '').toLowerCase().includes(q) ||
      (((c.carBrand || '') + ' ' + (c.carModel || '')).toLowerCase()).includes(q)
    ).slice(0, 10);
  }, [platSearch, safeCustomers]);

  /* ── Select Customer Callback ── */
  const handleSelectCustomer = (c: CustomerItem) => {
    setSelectedCustomer(c);
    setPlatSearch(c.licensePlate);
    if (c.vinNumber) setNoRangka(c.vinNumber);
    if (c.engineNumber) setNoMesin(c.engineNumber);
    if (c.fuelType) setFuelType(c.fuelType);
  };

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

  /* ── SA summary counts ── */
  const allChecks = [...eksterior, ...interior, ...mesin, ...kakiKaki];
  const allOk     = allChecks.filter(x => x.result === 'ok').length;
  const allWarn   = allChecks.filter(x => x.result === 'perhatian').length;
  const allBad    = allChecks.filter(x => x.result === 'segera').length;
  const allTotal  = allChecks.length;

  /* ── Save SPK (Draft or Final) ── */
  const handleSave = async (isDraft = false) => {
    if (!selectedCustomer) {
      alert('Pilih pelanggan dan unit kendaraan terlebih dahulu pada Langkah 1.');
      return;
    }
    setSaving(true);
    try {
      const docPayload: any = {
        spkNumber,
        createdAt: editingOrder?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: isDraft ? 'draft' : 'selesai',
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
        noRangka,
        noMesin,
        fuelType,
        keluhan,
        saId: selectedSaId,
        saName: effectiveSaName,
        faId: selectedFaId,
        faName: effectiveFaName,
        mekanikId: selectedMekanikId,
        mekanikName: effectiveMekanikName,
        kasirId: selectedKasirId,
        kasirName: effectiveKasirName,
        saCheckEksterior: eksterior,
        saCheckInterior: interior,
        saCheckMesin: mesin,
        saCheckKakiKaki: kakiKaki,
        saAdvisorName: effectiveSaName,
        saCatatanUmum: saCatatan,
        spareparts,
        jasaList,
        diskon,
        pajakPersen: pajak,
        lpaChecklist,
        lpaTeknisi: effectiveMekanikName,
        lpaTestDriveOk: lpaTestDrive,
        lpaCatatan,
        metodePembayaran: metodeBayar,
        grandTotal: grand,
        dibayar,
        kembalian,
      };

      const orderPayload: Partial<CRMOrder> = {
        customerName: selectedCustomer.name,
        phone: selectedCustomer.phone,
        carBrand: selectedCustomer.carBrand,
        carModel: selectedCustomer.carModel,
        carYear: selectedCustomer.carYear,
        licensePlate: selectedCustomer.licensePlate,
        locationAddress: selectedCustomer.address,
        serviceType: jasaList[0]?.nama || 'Servis & Perbaikan SPK',
        totalPrice: grand,
        status: isDraft ? 'process' : 'completed',
        saName: effectiveSaName,
        mekanikName: effectiveMekanikName,
        customerType: selectedCustomer.customerType || 'BARU',
        kilometer,
        noRangka,
        noMesin,
        fuelType,
        notes: keluhan || saCatatan,
        spareparts,
        jasaList,
        saCheckEksterior: eksterior,
        saCheckInterior: interior,
        saCheckMesin: mesin,
        saCheckKakiKaki: kakiKaki,
        lpaChecklist,
        saCatatanUmum: saCatatan,
        lpaCatatan,
        diskon,
        pajakPersen: pajak,
        metodePembayaran: metodeBayar,
        dibayar,
        kembalian,
      };

      if (editingOrder) {
        await updateOrder(editingOrder.id, orderPayload);
        await updateSPK(editingOrder.id, docPayload);
        setSavedId(editingOrder.id);
      } else {
        const id = await addSPK(docPayload);
        setSavedId(id);
      }

      setDraftToast(true);
      setTimeout(() => setDraftToast(false), 3500);

      if (!isDraft && onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan data SPK. Silakan coba kembali.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Print Handler with A4 Optimization ── */
  const handlePrint = () => {
    const el = document.getElementById('nota-print-area');
    if (!el) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html>
      <html>
        <head>
          <title>Nota SPK - ${spkNumber}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @page { size: A4; margin: 12mm 15mm; }
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #0f172a; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 5px 8px; font-size: 11px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
            .font-bold { font-weight: 700; }
            .font-black { font-weight: 900; }
            .border-b { border-bottom: 1px solid #e2e8f0; }
            .bg-slate-50 { background-color: #f8fafc; }
            .bg-slate-100 { background-color: #f1f5f9; }
            .bg-slate-800 { background-color: #1e293b; color: #fff; }
            .bg-slate-900 { background-color: #0f172a; color: #fff; }
            .text-red-600 { color: #dc2626; }
            .text-emerald-700 { color: #047857; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
            .gap-4 { gap: 1rem; }
            .gap-5 { gap: 1.25rem; }
            .col-span-7 { grid-column: span 7 / span 7; }
            .col-span-5 { grid-column: span 5 / span 5; }
            .col-span-2 { grid-column: span 2 / span 2; }
            .rounded-xl { border-radius: 0.75rem; }
            .rounded-lg { border-radius: 0.5rem; }
            .p-3 { padding: 0.75rem; }
            .p-4 { padding: 1rem; }
            .mb-5 { margin-bottom: 1.25rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .border { border: 1px solid #e2e8f0; }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${el.innerHTML}
        </body>
      </html>`);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
    }, 250);
  };

  const spkData = {
    spkNumber, customerName: selectedCustomer?.name || '', phone: selectedCustomer?.phone || '',
    address: selectedCustomer?.address || '', carBrand: selectedCustomer?.carBrand || '',
    carModel: selectedCustomer?.carModel || '', carYear: selectedCustomer?.carYear || '',
    licensePlate: selectedCustomer?.licensePlate || '', transmission: selectedCustomer?.transmission || 'Matic',
    carColor: selectedCustomer?.carColor || '', kilometer, noRangka, noMesin, fuelType, keluhan,
    saName: effectiveSaName, faName: effectiveFaName, mekanikName: effectiveMekanikName, kasirName: effectiveKasirName,
    spareparts, jasaList, diskon, pajak, metodeBayar, dibayar,
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
    <div className="min-h-screen bg-[#f4f6fb] font-sans pb-12">

      {/* Toast Notification */}
      {draftToast && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-2.5 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold animate-bounce">
          <CheckCircle size={16} />
          <span>Draf SPK & Jasa Tersimpan! Data aman dan tidak hilang saat diedit.</span>
        </div>
      )}

      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => onNavigate('crm-orders')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-semibold transition-colors">
            <ArrowLeft size={15} /> Daftar SPK
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400 text-xs">{editingOrder ? 'Edit SPK & Nota' : 'Formulir SPK Baru'}</span>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-bold">{spkNumber}</span>
            
            {/* Draft Save Button (Accessible anywhere) */}
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving || !selectedCustomer}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all shadow-2xs disabled:opacity-40"
              title="Simpan draf SPK sementara agar tidak hilang"
            >
              <Save size={13} />
              <span>{saving ? 'Menyimpan...' : 'Simpan Draf'}</span>
            </button>

            {savedId ? (
              <button onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-md">
                <Printer size={13} /> Cetak Nota Resmi
              </button>
            ) : (
              <button onClick={() => onNavigate('crm-orders')}
                className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-600 text-xs font-semibold border border-slate-200 hover:border-red-200 rounded-xl transition-all">
                <XCircle size={13} /> Tutup
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
                    ${active ? 'border-red-600 text-red-600' : done ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    onClick={() => done && setStep(s.id)}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0
                      ${active ? 'bg-red-600 text-white shadow-sm' : done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {done ? <Check size={12} /> : s.id}
                    </div>
                    <div className="hidden sm:block">
                      <p className={`text-xs font-bold ${active ? 'text-red-600' : done ? 'text-emerald-600' : 'text-slate-600'}`}>{s.label}</p>
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
          <div className="hidden xl:flex flex-col gap-3 w-60 flex-shrink-0 print:hidden">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Tahapan Pengerjaan</p>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{step}/5</span>
              </div>
              {STEPS.map(s => {
                const Icon = s.icon;
                const done   = step > s.id;
                const active = step === s.id;
                return (
                  <button key={s.id} onClick={() => done && setStep(s.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all border-l-2 ${
                      active ? 'border-red-600 bg-red-50/50' : done ? 'border-emerald-500 bg-emerald-50/30 cursor-pointer hover:bg-emerald-50' : 'border-transparent'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5
                      ${active ? 'bg-red-600 text-white' : done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {done ? <Check size={12} /> : s.id}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${active ? 'text-red-700' : done ? 'text-emerald-700' : 'text-slate-600'}`}>{s.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Kendaraan Info Card */}
            {selectedCustomer && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Unit Terpilih</p>
                  <span className="font-mono font-black text-xs bg-red-600 text-white px-2 py-0.5 rounded-md">{selectedCustomer.licensePlate}</span>
                </div>
                <p className="font-black text-sm text-white">{selectedCustomer.name}</p>
                <p className="text-xs text-slate-300 mt-0.5">{selectedCustomer.carBrand} {selectedCustomer.carModel} • {selectedCustomer.carYear}</p>
                
                <div className="mt-3 pt-3 border-t border-white/10 space-y-1 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mekanik:</span>
                    <span className="font-semibold text-white">{effectiveMekanikName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SA In Charge:</span>
                    <span className="font-semibold text-white">{effectiveSaName}</span>
                  </div>
                </div>

                {step >= 3 && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Total Biaya:</span><span className="text-red-400 font-black">{formatRp(grand)}</span></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Step Content ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* ══ STEP 1: Kendaraan, Pelanggan & Staf In Charge ════════════ */}
            {step === 1 && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20 flex-shrink-0">
                      <Car size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Informasi Kendaraan & Penugasan Staf</h2>
                      <p className="text-sm text-slate-400">Pilih kendaraan pelanggan dan atur petugas penanggung jawab (SA, FA, Mekanik, Kasir)</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate('crm-employees')}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Users size={13} className="text-red-600" />
                    <span>Kelola Data Karyawan</span>
                  </button>
                </div>

                {/* Search Pelanggan */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100">
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                      Cari Plat Nomor / Nama Pelanggan
                    </label>
                    <div className="relative">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={platSearch}
                        onChange={e => { setPlatSearch(e.target.value); if (selectedCustomer) setSelectedCustomer(null); }}
                        placeholder="Ketik plat nomor (cth: B 1234 ABC) atau nama pelanggan..."
                        autoFocus
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-red-400 focus:outline-none text-sm font-medium transition-colors bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {!selectedCustomer && (
                    <div className="p-5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                        {platSearch ? `${platSuggestions.length} hasil ditemukan` : `Pilih dari ${customers.length} data pelanggan terdaftar`}
                      </p>
                      {platSuggestions.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                          <Car size={36} className="mx-auto mb-2 opacity-20" />
                          <p className="font-semibold text-sm">Data kendaraan tidak ditemukan</p>
                          <p className="text-xs mt-1">Daftarkan pelanggan baru terlebih dahulu di Database Pelanggan</p>
                          <button onClick={() => onNavigate('crm-customers')}
                            className="mt-3 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all">
                            + Tambah Pelanggan Baru
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {platSuggestions.map(c => (
                            <button key={c.id} onClick={() => handleSelectCustomer(c)}
                              className="text-left p-3.5 rounded-xl border-2 border-slate-200 hover:border-red-400 hover:bg-red-50/30 transition-all group">
                              <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors">
                                  <Car size={16} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-black text-slate-900 text-xs truncate">{c.name}</p>
                                  <p className="text-[11px] text-slate-500 truncate">{c.carBrand} {c.carModel} • {c.carYear}</p>
                                  <span className="inline-block mt-1 font-mono text-xs font-black text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">{c.licensePlate}</span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected customer detail & Additional Vehicle Form */}
                {selectedCustomer && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                          <User size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="font-black text-white text-sm">{selectedCustomer.name}</p>
                          <p className="text-slate-300 text-xs">{selectedCustomer.phone} • {selectedCustomer.address || 'Alamat tidak terdata'}</p>
                        </div>
                      </div>
                      <button onClick={() => { setSelectedCustomer(null); setPlatSearch(''); }} className="text-slate-400 hover:text-white transition-colors text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">
                        Ganti Kendaraan
                      </button>
                    </div>

                    <div className="p-6 space-y-5">
                      {/* Vehicle Specs Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { icon: Car,      label: 'Kendaraan',  value: `${selectedCustomer.carBrand} ${selectedCustomer.carModel}` },
                          { icon: Hash,     label: 'Plat Nomor', value: selectedCustomer.licensePlate, red: true },
                          { icon: Calendar, label: 'Tahun / Transmisi', value: `${selectedCustomer.carYear} / ${selectedCustomer.transmission || 'Matic'}` },
                          { icon: Palette,  label: 'Warna Unit', value: selectedCustomer.carColor || '—' },
                        ].map((f, i) => (
                          <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{f.label}</p>
                            <p className={`font-black text-xs ${f.red ? 'text-red-600 font-mono' : 'text-slate-900'}`}>{f.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Extended Vehicle Info Form */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                        <div>
                          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                            Kilometer Masuk (Odo) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Gauge size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" value={kilometer} onChange={e => setKilometer(e.target.value)}
                              placeholder="cth: 45.200 km"
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 font-bold" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                            Nomor Rangka (VIN)
                          </label>
                          <input type="text" value={noRangka} onChange={e => setNoRangka(e.target.value)}
                            placeholder="MH1JF31..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 font-mono" />
                        </div>

                        <div>
                          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                            Jenis Bahan Bakar
                          </label>
                          <select value={fuelType} onChange={e => setFuelType(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 bg-white font-semibold">
                            <option value="Bensin">Bensin (Gasoline)</option>
                            <option value="Diesel">Diesel (Solar/DEX)</option>
                            <option value="Hybrid">Hybrid (HEV/PHEV)</option>
                            <option value="EV">Electric (EV / Listrik)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                          Keluhan / Permintaan Servis Pelanggan
                        </label>
                        <textarea value={keluhan} onChange={e => setKeluhan(e.target.value)} rows={2}
                          placeholder="Tuliskan keluhan yang dirasakan pelanggan, bunyi aneh, getaran, atau servis berkala..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 resize-none font-medium" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PENUGASAN STAF (SA, FA, MEKANIK, KASIR) ── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                        <Users size={16} />
                      </span>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">Penugasan Staf Operasional (Dropdown Karyawan)</h3>
                        <p className="text-[11px] text-slate-400">Pilih petugas yang bertanggung jawab pada SPK & Faktur ini</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Service Advisor */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                        1. Service Advisor (SA) <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedSaId}
                        onChange={e => setSelectedSaId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white font-bold text-slate-800"
                      >
                        <option value="">-- Pilih SA Bertugas --</option>
                        {saList.map(sa => (
                          <option key={sa.id} value={sa.id}>{sa.name} ({sa.nik || 'SA'})</option>
                        ))}
                        <option value="custom">+ Input Nama SA Manual</option>
                      </select>
                      {selectedSaId === 'custom' && (
                        <input
                          type="text"
                          value={saCustomName}
                          onChange={e => setSaCustomName(e.target.value)}
                          placeholder="Ketik nama SA..."
                          className="w-full mt-1.5 px-3 py-2 rounded-xl border border-blue-300 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      )}
                    </div>

                    {/* 2. Front Advisor */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                        2. Front Advisor (FA)
                      </label>
                      <select
                        value={selectedFaId}
                        onChange={e => setSelectedFaId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500 bg-white font-bold text-slate-800"
                      >
                        <option value="">-- Pilih Front Advisor --</option>
                        {faList.map(fa => (
                          <option key={fa.id} value={fa.id}>{fa.name} ({fa.role})</option>
                        ))}
                        <option value="custom">+ Input Nama FA Manual</option>
                      </select>
                      {selectedFaId === 'custom' && (
                        <input
                          type="text"
                          value={faCustomName}
                          onChange={e => setFaCustomName(e.target.value)}
                          placeholder="Ketik nama FA..."
                          className="w-full mt-1.5 px-3 py-2 rounded-xl border border-teal-300 text-xs focus:outline-none focus:border-teal-500 font-semibold"
                        />
                      )}
                    </div>

                    {/* 3. Mekanik Pelaksana */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                        3. Mekanik / Teknisi <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedMekanikId}
                        onChange={e => setSelectedMekanikId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 bg-white font-bold text-slate-800"
                      >
                        <option value="">-- Pilih Mekanik Pelaksana --</option>
                        {mekanikList.map(mk => (
                          <option key={mk.id} value={mk.id}>{mk.name} ({mk.role})</option>
                        ))}
                        <option value="custom">+ Input Nama Mekanik Manual</option>
                      </select>
                      {selectedMekanikId === 'custom' && (
                        <input
                          type="text"
                          value={mekanikCustomName}
                          onChange={e => setMekanikCustomName(e.target.value)}
                          placeholder="Ketik nama Mekanik..."
                          className="w-full mt-1.5 px-3 py-2 rounded-xl border border-amber-300 text-xs focus:outline-none focus:border-amber-500 font-semibold"
                        />
                      )}
                    </div>

                    {/* 4. Kasir */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                        4. Kasir / Keuangan
                      </label>
                      <select
                        value={selectedKasirId}
                        onChange={e => setSelectedKasirId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 bg-white font-bold text-slate-800"
                      >
                        <option value="">-- Pilih Kasir / Finance --</option>
                        {kasirList.map(ks => (
                          <option key={ks.id} value={ks.id}>{ks.name} ({ks.role})</option>
                        ))}
                        <option value="custom">+ Input Nama Kasir Manual</option>
                      </select>
                      {selectedKasirId === 'custom' && (
                        <input
                          type="text"
                          value={kasirCustomName}
                          onChange={e => setKasirCustomName(e.target.value)}
                          placeholder="Ketik nama Kasir..."
                          className="w-full mt-1.5 px-3 py-2 rounded-xl border border-emerald-300 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ══ STEP 2: Pengecekan SA (4 Tahap) ═══════════════════════ */}
            {step === 2 && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                      <ClipboardList size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Pengecekan Service Advisor (SA)</h2>
                      <p className="text-sm text-slate-400">Inspeksi komprehensif 4 kategori • SA In Charge: <strong className="text-slate-700">{effectiveSaName}</strong></p>
                    </div>
                  </div>

                  <div className="hidden sm:flex gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100"><CheckCircle size={12} /> {allOk} OK</span>
                    {allWarn > 0 && <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100"><AlertTriangle size={12} /> {allWarn} Perhatian</span>}
                    {allBad > 0 && <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100"><XCircle size={12} /> {allBad} Segera Ganti</span>}
                  </div>
                </div>

                {/* Tab Navigation */}
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

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Catatan Tambahan Service Advisor</label>
                  <input value={saCatatan} onChange={e => setSaCatatan(e.target.value)} placeholder="Catatan rekomendasi atau keluhan tambahan..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 font-medium" />
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
                    <h2 className="text-lg font-black text-slate-900">Rincian Sparepart & Jasa Servis</h2>
                    <p className="text-sm text-slate-400">Input kebutuhan suku cadang, ongkos kerja, dan hitung potongan harga</p>
                  </div>
                </div>

                {allBad > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-700">Terdapat {allBad} komponen berstatus "Segera Ganti" dari hasil pengecekan SA</p>
                      <p className="text-[11px] text-red-500 mt-0.5">Pastikan suku cadang pengganti sudah dimasukkan ke dalam daftar di bawah ini.</p>
                    </div>
                  </div>
                )}

                {/* Spareparts */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Daftar Suku Cadang / Material</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{spareparts.length} item • Total: {formatRp(subParts)}</p>
                    </div>
                    <button onClick={addPart}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/20 active:scale-95">
                      <Plus size={13} /> Tambah Part
                    </button>
                  </div>

                  {spareparts.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Belum ada sparepart. Klik "+ Tambah Part" jika terdapat pergantian suku cadang.
                    </div>
                  ) : (
                    <>
                      <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <div className="col-span-5">Nama Part / Kode Barang</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2">Satuan</div>
                        <div className="col-span-2 text-right">Harga Satuan</div>
                        <div className="col-span-1"></div>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {spareparts.map(p => (
                          <div key={p.id} className="px-5 py-3 grid grid-cols-12 gap-2 items-center">
                            <input value={p.nama} onChange={e => updPart(p.id, { nama: e.target.value })} placeholder="Nama sparepart..."
                              className="col-span-5 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 font-semibold" />
                            <input type="number" value={p.qty || ''} min={1} onChange={e => updPart(p.id, { qty: Number(e.target.value) })}
                              className="col-span-2 px-2 py-2 rounded-xl border border-slate-200 text-xs text-center focus:outline-none focus:border-red-400 font-bold" />
                            <select value={p.satuan} onChange={e => updPart(p.id, { satuan: e.target.value })}
                              className="col-span-2 px-2 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 bg-white">
                              {['pcs','liter','set','meter','botol','kaleng','pasang'].map(s => <option key={s}>{s}</option>)}
                            </select>
                            <input type="number" value={p.hargaSatuan || ''} min={0} onChange={e => updPart(p.id, { hargaSatuan: Number(e.target.value) })}
                              placeholder="0" className="col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-xs text-right focus:outline-none focus:border-red-400 font-mono" />
                            <button onClick={() => delPart(p.id)} className="col-span-1 flex justify-center text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <p className="text-xs font-bold text-slate-600">Subtotal Sparepart: <span className="text-red-600 font-mono text-sm">{formatRp(subParts)}</span></p>
                      </div>
                    </>
                  )}
                </div>

                {/* Jasa Pekerjaan */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Biaya Jasa Servis</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Mekanik Pelaksana: <strong>{effectiveMekanikName}</strong> • Total: {formatRp(subJasa)}</p>
                    </div>
                    <button onClick={addJasa_}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all active:scale-95">
                      <Plus size={13} /> Tambah Jasa
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {jasaList.map(j => (
                      <div key={j.id} className="px-5 py-3 flex items-center gap-3">
                        <Wrench size={13} className="text-slate-400 flex-shrink-0" />
                        <input value={j.nama} onChange={e => updJasa(j.id, { nama: e.target.value })} placeholder="Jenis pekerjaan servis..."
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 font-semibold" />
                        <input type="number" value={j.harga || ''} min={0} onChange={e => updJasa(j.id, { harga: Number(e.target.value) })}
                          placeholder="Biaya (Rp)"
                          className="w-40 px-3 py-2 rounded-xl border border-slate-200 text-xs text-right focus:outline-none focus:border-red-400 font-mono font-bold" />
                        <button onClick={() => delJasa(j.id)} className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <p className="text-xs font-bold text-slate-600">Subtotal Jasa Servis: <span className="text-slate-900 font-mono text-sm">{formatRp(subJasa)}</span></p>
                  </div>
                </div>

                {/* Diskon & Kalkulasi Total */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Potongan Harga & Pajak</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Diskon (%)</label>
                        <input type="number" value={diskon} min={0} max={100} onChange={e => setDiskon(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-red-400 text-center" />
                        {diskon > 0 && <p className="text-[11px] text-amber-600 mt-1 font-semibold">- {formatRp(discAmt)}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">PPN / Pajak (%)</label>
                        <input type="number" value={pajak} min={0} max={100} onChange={e => setPajak(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-red-400 text-center" />
                        {pajak > 0 && <p className="text-[11px] text-slate-500 mt-1">+ {formatRp(taxAmt)}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Ringkasan Biaya</h3>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between"><span>Subtotal Suku Cadang:</span><span className="font-mono">{formatRp(subParts)}</span></div>
                      <div className="flex justify-between"><span>Subtotal Jasa Servis:</span><span className="font-mono">{formatRp(subJasa)}</span></div>
                      {diskon > 0 && <div className="flex justify-between text-amber-400 font-semibold"><span>Diskon ({diskon}%):</span><span className="font-mono">- {formatRp(discAmt)}</span></div>}
                      {pajak > 0 && <div className="flex justify-between text-slate-400"><span>PPN ({pajak}%):</span><span className="font-mono">+ {formatRp(taxAmt)}</span></div>}
                      <div className="border-t border-white/15 pt-2 mt-1 flex justify-between items-center text-sm font-black text-white">
                        <span>TOTAL TAGIHAN:</span>
                        <span className="text-xl font-mono text-red-400">{formatRp(grand)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ══ STEP 4: Lembar LPA Akhir ══════════════════════════════ */}
            {step === 4 && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20 flex-shrink-0">
                    <FileText size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Lembar Pemeriksaan Akhir (LPA)</h2>
                    <p className="text-sm text-slate-400">Verifikasi kualitas dan kelengkapan unit sebelum diserahkan kepada pelanggan</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Hasil Uji Jalan (Test Drive)</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setLpaTestDrive(true)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${lpaTestDrive ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 text-slate-500 hover:border-emerald-300'}`}>
                        Normal & Layak Jalan
                      </button>
                      <button type="button" onClick={() => setLpaTestDrive(false)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${!lpaTestDrive ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-200 text-slate-500 hover:border-amber-300'}`}>
                        Ada Catatan
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Catatan Penyerahan Unit</label>
                    <input value={lpaCatatan} onChange={e => setLpaCatatan(e.target.value)} placeholder="Catatan kebersihan, barang bawaan, dll..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-400 font-medium" />
                  </div>
                </div>

                <SACheckTable
                  title="Checklist Kelengkapan & Kondisi Akhir Kendaraan (14 Poin QC)"
                  icon={<CheckCircle size={16} className="text-purple-600" />}
                  items={lpaChecklist}
                  onChange={setLpaChecklist}
                />
              </>
            )}

            {/* ══ STEP 5: Nota Resmi & Pembayaran ════════════════════════ */}
            {step === 5 && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20 flex-shrink-0">
                      <Receipt size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Nota Resmi & Faktur Bengkel</h2>
                      <p className="text-sm text-slate-400">Review faktur lengkap, penerimaan pembayaran, dan cetak dokumen resmi</p>
                    </div>
                  </div>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <Printer size={15} /> Cetak Nota / PDF
                  </button>
                </div>

                {/* Metode Bayar & Kasir */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Metode Pembayaran (Kasir: {effectiveKasirName})</h3>
                    <span className="text-xs font-bold text-slate-500">Total: <strong className="text-red-600 font-mono text-sm">{formatRp(grand)}</strong></span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {(['cash', 'transfer', 'kredit'] as const).map(m => (
                      <button key={m} type="button" onClick={() => setMetodeBayar(m)}
                        className={`flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all font-bold text-xs capitalize ${metodeBayar === m ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                        {m === 'cash' ? <Banknote size={18} /> : m === 'transfer' ? <CreditCard size={18} /> : <RefreshCw size={18} />}
                        {m === 'cash' ? 'Cash / Tunai' : m === 'transfer' ? 'Transfer Bank' : 'Debit / Kredit'}
                      </button>
                    ))}
                  </div>

                  {metodeBayar === 'cash' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">Nominal Diterima Kasir (Rp)</label>
                        <input type="number" value={dibayar || ''} onChange={e => setDibayar(Number(e.target.value))}
                          placeholder={String(grand)} className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-red-400 text-xs font-mono font-bold focus:outline-none" />
                      </div>
                      {dibayar > 0 && (
                        <div className={`flex flex-col justify-center px-4 py-2 rounded-xl text-xs font-bold ${kembalian >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                          <span className="text-[10px] uppercase">{kembalian >= 0 ? 'Uang Kembalian' : 'Kekurangan Bayar'}</span>
                          <span className="text-sm font-mono">{formatRp(Math.abs(kembalian))}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* NOTA RESMI PRINTABLE VIEW */}
                <div className="bg-slate-100 p-4 rounded-3xl border border-slate-200 overflow-x-auto">
                  <NotaCorporatePrint spkData={spkData} />
                </div>

                {/* Save Button */}
                {!savedId && (
                  <button onClick={handleSave} disabled={saving}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-600/30 transition-all active:scale-[0.98]">
                    {saving ? <><Clock size={18} className="animate-spin" /> Menyimpan SPK ke Database...</> : <><Save size={18} /> Simpan SPK & Terbitkan Faktur Resmi</>}
                  </button>
                )}

                {savedId && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                      <Check size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base">SPK & Faktur Berhasil Disimpan</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Nomor SPK: <span className="font-mono font-bold text-slate-800">{spkNumber}</span></p>
                    </div>
                    <div className="flex justify-center gap-3 pt-2">
                      <button onClick={handlePrint} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all">
                        Cetak Nota Sekarang
                      </button>
                      <button onClick={() => onNavigate('crm-orders')} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all">
                        Lihat Daftar SPK
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── BOTTOM NAVIGATION ─────────────────────────────────── */}
            {!savedId && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <button onClick={() => step === 1 ? onNavigate('crm-orders') : setStep(s => s - 1)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all">
                  <ChevronLeft size={14} />
                  {step === 1 ? 'Daftar SPK' : 'Tahap Sebelumnya'}
                </button>

                {/* Center: Save Draft & Steps indicator */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    disabled={saving || !selectedCustomer}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all shadow-xs disabled:opacity-40"
                    title="Simpan sementara draf SPK agar perubahan tidak hilang"
                  >
                    <Save size={13} />
                    <span>{saving ? 'Menyimpan...' : 'Simpan Draf'}</span>
                  </button>

                  <div className="hidden sm:flex items-center gap-1">
                    {STEPS.map(s => (
                      <div key={s.id} className={`h-1.5 rounded-full transition-all ${step === s.id ? 'w-6 bg-red-600' : step > s.id ? 'w-1.5 bg-emerald-500' : 'w-1.5 bg-slate-200'}`} />
                    ))}
                  </div>
                </div>

                {step < 5 ? (
                  <button onClick={() => setStep(s => s + 1)} disabled={!canGoNext()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/20">
                    Lanjut: {STEPS[step].short} <ChevronRight size={14} />
                  </button>
                ) : (
                  <button onClick={() => handleSave(false)} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20">
                    {saving ? <><Clock size={14} className="animate-spin" /> Menyimpan...</> : <><Save size={14} /> Terbitkan & Simpan SPK</>}
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
