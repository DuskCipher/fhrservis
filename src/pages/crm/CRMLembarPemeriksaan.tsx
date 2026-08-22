import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Printer, Save, CheckCircle, Car, Calendar, User, Hash,
  History, Plus, Search, Trash2, Edit3, Clock, Eye, AlertCircle, RefreshCw,
  Check, X as XIcon, Gauge, Sparkles
} from 'lucide-react';
import {
  addDoc, updateDoc, deleteDoc, doc, collection,
  serverTimestamp, onSnapshot, query, orderBy, Timestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

// ─── Data Checklist 46 Item ─────────────────────────────────────────
const CHECKLIST_ITEMS = [
  // INTERIOR
  { no: 1,  category: 'INTERIOR',  label: 'Fungsi klakson' },
  { no: 2,  category: 'INTERIOR',  label: 'Fungsi audio / radio' },
  { no: 3,  category: 'INTERIOR',  label: 'Stel jam' },
  { no: 4,  category: 'INTERIOR',  label: 'Kondisi blower AC' },
  { no: 5,  category: 'INTERIOR',  label: 'Elektrik mirror / Retract (jika ada)' },
  { no: 6,  category: 'INTERIOR',  label: 'Setelan elektrik mirror (jika ada)' },
  { no: 7,  category: 'INTERIOR',  label: 'Pemeriksaan Kondisi Filter Kabin AC' },
  { no: 8,  category: 'INTERIOR',  label: 'Fungsi wiper & washer / nozle depan' },
  { no: 9,  category: 'INTERIOR',  label: 'Fungsi wiper & washer / nozle belakang' },
  { no: 10, category: 'INTERIOR',  label: 'Lampu kabin depan, tengah, belakang (jika ada)' },
  // EKSTERIOR
  { no: 11, category: 'EKSTERIOR', label: 'Fungsi lampu foglamp' },
  { no: 12, category: 'EKSTERIOR', label: 'Fungsi lampu pendek' },
  { no: 13, category: 'EKSTERIOR', label: 'Fungsi lampu dim / jauh' },
  { no: 14, category: 'EKSTERIOR', label: 'Fungsi lampu kota depan' },
  { no: 15, category: 'EKSTERIOR', label: 'Fungsi sign kanan / kiri' },
  { no: 16, category: 'EKSTERIOR', label: 'Fungsi Hazard' },
  { no: 17, category: 'EKSTERIOR', label: 'Fungsi lampu rem (atas, samping)' },
  { no: 18, category: 'EKSTERIOR', label: 'Fungsi lampu kota belakang' },
  { no: 19, category: 'EKSTERIOR', label: 'Fungsi lampu plat nomor' },
  { no: 20, category: 'EKSTERIOR', label: 'Fungsi lampu mundur & sensor mundur (jika ada)' },
  { no: 21, category: 'EKSTERIOR', label: 'Kondisi karet wiper depan belakang & selang-selangnya' },
  { no: 22, category: 'EKSTERIOR', label: 'Lumasi engsel pintu (agar tidak bunyi) & power window' },
  // ENGINE
  { no: 23, category: 'ENGINE', label: 'Level oli mesin' },
  { no: 24, category: 'ENGINE', label: 'Kondisi drive belt / V belt (stel jika perlu)' },
  { no: 25, category: 'ENGINE', label: 'Level coolant' },
  { no: 26, category: 'ENGINE', label: 'Level air washer (wiper)' },
  { no: 27, category: 'ENGINE', label: 'Level minyak rem' },
  { no: 28, category: 'ENGINE', label: 'Level minyak kopling' },
  { no: 29, category: 'ENGINE', label: 'Kondisi minyak rem' },
  { no: 30, category: 'ENGINE', label: 'Kondisi minyak kopling' },
  { no: 31, category: 'ENGINE', label: 'Level oli power steering' },
  { no: 32, category: 'ENGINE', label: 'Kualitas oli power steering' },
  { no: 33, category: 'ENGINE', label: 'Level air baterai (aki)' },
  { no: 34, category: 'ENGINE', label: 'Massa jenis kondisi air baterai (aki)' },
  { no: 35, category: 'ENGINE', label: 'Tegangan aki (baterai)' },
  { no: 36, category: 'ENGINE', label: 'Voltage drop saat stater (aki)' },
  { no: 37, category: 'ENGINE', label: 'Pengisian aki (ampere)' },
  { no: 38, category: 'ENGINE', label: 'Kondisi terminal baterai' },
  { no: 39, category: 'ENGINE', label: 'Kerja kompressor AC' },
  { no: 40, category: 'ENGINE', label: 'Semprot ruang mesin & sela-sela kap mesin dengan angin kompressor' },
  { no: 41, category: 'ENGINE', label: 'Level dan kondisi oli transmisi (bila matic)' },
  { no: 42, category: 'ENGINE', label: 'Kondisi cooling fan' },
  { no: 43, category: 'ENGINE', label: 'Kondisi extravan' },
  // UNDERSTEL
  { no: 44, category: 'UNDERSTEL', label: 'Tekanan angin ban (4 roda)' },
  { no: 45, category: 'UNDERSTEL', label: 'Kekencangan baut roda (4 roda)' },
  { no: 46, category: 'UNDERSTEL', label: 'Kondisi kampas rem (disc brake) visual' },
];

const CATEGORIES = ['INTERIOR', 'EKSTERIOR', 'ENGINE', 'UNDERSTEL'];
const CAT_COLORS: Record<string, string> = {
  INTERIOR: 'bg-blue-800 text-white',
  EKSTERIOR: 'bg-emerald-800 text-white',
  ENGINE: 'bg-amber-800 text-white',
  UNDERSTEL: 'bg-purple-800 text-white',
};

type ItemStatus = 'B' | 'R' | '';

interface LPAData {
  id?: string;
  tipeMobil: string;
  nopol: string;
  tanggal: string;
  mekanik: string;
  km: string;
  pelanggan: string;
  items: Record<number, { status: ItemStatus; catatan: string }>;
  saran: string;
  createdAt?: any;
}

const emptyFormState: LPAData = {
  tipeMobil: '',
  nopol: '',
  tanggal: new Date().toISOString().split('T')[0],
  mekanik: '',
  km: '',
  pelanggan: '',
  items: Object.fromEntries(CHECKLIST_ITEMS.map(i => [i.no, { status: '', catatan: '' }])),
  saran: '',
};

export function CRMLembarPemeriksaan() {
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState<LPAData>(emptyFormState);

  // History State
  const [historyList, setHistoryList] = useState<LPAData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Realtime Firestore Listener ──────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'lpa'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: LPAData[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          ...d,
          createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate() : d.createdAt,
        } as LPAData;
      });
      setHistoryList(data);
      setLoadingHistory(false);
    }, (error) => {
      console.error('Error fetching LPA:', error);
      setLoadingHistory(false);
    });

    return () => unsubscribe();
  }, []);

  const setItem = (no: number, field: 'status' | 'catatan', value: string) => {
    setForm(f => ({
      ...f,
      items: { ...f.items, [no]: { ...f.items[no], [field]: value } }
    }));
  };

  const countStatus = (s: ItemStatus, targetItems?: Record<number, { status: ItemStatus; catatan: string }>) => {
    const itemsToCount = targetItems || form.items;
    if (!itemsToCount) return 0;
    return Object.values(itemsToCount).filter(i => i?.status === s).length;
  };

  // ─── Reset / Form Baru ─────────────────────────────────
  const handleNewForm = () => {
    setForm({
      ...emptyFormState,
      tanggal: new Date().toISOString().split('T')[0],
      items: Object.fromEntries(CHECKLIST_ITEMS.map(i => [i.no, { status: '', catatan: '' }])),
    });
    setCurrentDocId(null);
    setActiveTab('form');
  };

  // ─── Load Document to Edit ─────────────────────────────
  const handleEditLPA = (item: LPAData) => {
    const mergedItems = Object.fromEntries(
      CHECKLIST_ITEMS.map(i => [
        i.no,
        item.items?.[i.no] || { status: '', catatan: '' }
      ])
    );

    setForm({
      tipeMobil: item.tipeMobil || '',
      nopol: item.nopol || '',
      tanggal: item.tanggal || new Date().toISOString().split('T')[0],
      mekanik: item.mekanik || '',
      km: item.km || '',
      pelanggan: item.pelanggan || '',
      items: mergedItems,
      saran: item.saran || '',
    });
    setCurrentDocId(item.id || null);
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Delete Document ───────────────────────────────────
  const handleDeleteLPA = async (id: string, nopol: string) => {
    if (window.confirm(`Yakin ingin menghapus riwayat pemeriksaan untuk ${nopol || 'dokumen ini'}?`)) {
      try {
        await deleteDoc(doc(db, 'lpa', id));
        if (currentDocId === id) {
          handleNewForm();
        }
      } catch (err) {
        alert('Gagal menghapus dokumen.');
      }
    }
  };

  // ─── Save / Update to Firestore ────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      if (currentDocId) {
        const docRef = doc(db, 'lpa', currentDocId);
        await updateDoc(docRef, {
          ...form,
          updatedAt: serverTimestamp(),
        });
      } else {
        const docRef = await addDoc(collection(db, 'lpa'), {
          ...form,
          createdAt: serverTimestamp(),
        });
        setCurrentDocId(docRef.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan. Pastikan koneksi internet aktif.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Print / PDF ───────────────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  // Filtered History
  const filteredHistory = historyList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.nopol || '').toLowerCase().includes(q) ||
      (item.pelanggan || '').toLowerCase().includes(q) ||
      (item.tipeMobil || '').toLowerCase().includes(q) ||
      (item.mekanik || '').toLowerCase().includes(q)
    );
  });

  // Group items for 2-column print layout
  const col1Items = CHECKLIST_ITEMS.filter(i => i.category === 'INTERIOR' || i.category === 'EKSTERIOR');
  const col2Items = CHECKLIST_ITEMS.filter(i => i.category === 'ENGINE' || i.category === 'UNDERSTEL');

  return (
    <div className="min-h-full font-sans bg-[#f4f6fb] print:bg-white print:p-0">
      
      {/* ── Top Action Header (hidden on print) ── */}
      <div className="print:hidden sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Title & Tabs */}
          <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                <FileText size={18} />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  Lembar Pemeriksaan (LPA)
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-400">Inspeksi 46 Komponen Kendaraan</p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setActiveTab('form')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md font-bold transition-all text-[11px] sm:text-xs
                  ${activeTab === 'form' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Edit3 size={12} />
                <span className="hidden sm:inline">{currentDocId ? 'Edit Form' : 'Form Baru'}</span>
                <span className="sm:hidden">Form</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md font-bold transition-all text-[11px] sm:text-xs
                  ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <History size={12} />
                <span>Riwayat ({historyList.length})</span>
              </button>
            </div>
          </div>

          {/* Action Buttons for Form Tab */}
          {activeTab === 'form' && (
            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
              {currentDocId && (
                <button
                  onClick={handleNewForm}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200"
                  title="Buka form kosong baru"
                >
                  <Plus size={13} />
                  <span className="hidden sm:inline">Form Baru</span>
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all text-white shadow-xs
                  ${saved ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800 active:scale-95'}`}
              >
                {saved ? <CheckCircle size={13} /> : <Save size={13} />}
                <span>
                  {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : currentDocId ? 'Simpan Update' : 'Simpan Database'}
                </span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                <Printer size={13} />
                <span>Cetak 1 Lembar (PDF)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── TAB 1: RIWAYAT / HISTORY LPA (Hidden on Print) ── */}
      {activeTab === 'history' && (
        <div className="print:hidden max-w-6xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pb-12">
          
          {/* Top Info Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs">
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total LPA Tersimpan</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 sm:mt-1">{historyList.length} Lembar</p>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Realtime Cloud Database</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs">
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">LPA Bulan Ini</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 sm:mt-1">
                {historyList.filter(h => (h.tanggal || '').startsWith(new Date().toISOString().slice(0, 7))).length} Dokumen
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Inspeksi berhasil</p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Input Pemeriksaan</p>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">46 checklist mobil</p>
              </div>
              <button
                onClick={handleNewForm}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
              >
                <Plus size={13} /> Buat LPA
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3.5 flex items-center gap-2 shadow-2xs">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Plat Nomor, Pelanggan, Tipe Mobil, atau Mekanik..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 sm:py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold px-2 py-1"
              >
                Reset
              </button>
            )}
          </div>

          {/* Mobile Card List (visible on small screens) */}
          <div className="block sm:hidden space-y-3">
            {loadingHistory ? (
              <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200 text-xs">
                <RefreshCw size={18} className="animate-spin text-red-600 mx-auto mb-2" />
                Memuat riwayat...
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200 text-xs">
                <FileText size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-700">Belum ada riwayat</p>
              </div>
            ) : (
              filteredHistory.map((item) => {
                const baikCount = countStatus('B', item.items);
                const rusakCount = countStatus('R', item.items);

                return (
                  <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.nopol || 'TANPA NOPOL'}
                        </span>
                        <p className="font-bold text-slate-800 text-sm mt-1">{item.pelanggan || 'Pelanggan Umum'}</p>
                        <p className="text-slate-500 text-xs flex items-center gap-1">
                          <Car size={11} /> {item.tipeMobil || 'Kendaraan tidak diisi'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                          <Calendar size={10} /> {item.tanggal || '-'}
                        </span>
                        <div className="flex items-center gap-1 mt-1.5 justify-end">
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                            {baikCount} B
                          </span>
                          <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${rusakCount > 0 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-500'}`}>
                            {rusakCount} R
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[11px] text-slate-500">Mekanik: {item.mekanik || '-'}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditLPA(item)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs"
                        >
                          <Edit3 size={11} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            handleEditLPA(item);
                            setTimeout(() => window.print(), 300);
                          }}
                          className="p-1 bg-slate-100 text-slate-700 rounded-lg"
                        >
                          <Printer size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteLPA(item.id!, item.nopol)}
                          className="p-1 bg-red-50 text-red-600 rounded-lg"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View (hidden on small screens) */}
          <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Tanggal & Nopol</th>
                    <th className="py-3 px-4">Pelanggan & Kendaraan</th>
                    <th className="py-3 px-4">KM & Mekanik</th>
                    <th className="py-3 px-4 text-center">Hasil Checklist</th>
                    <th className="py-3 px-4">Saran / Rekomendasi</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingHistory ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw size={16} className="animate-spin text-red-600" />
                          Memuat riwayat pemeriksaan dari database...
                        </div>
                      </td>
                    </tr>
                  ) : filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <FileText size={32} className="mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600">Belum ada riwayat LPA</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {searchQuery ? 'Tidak ada hasil yang sesuai dengan kata kunci pencarian.' : 'Data pemeriksaan yang Anda simpan akan muncul di sini.'}
                        </p>
                        <button
                          onClick={handleNewForm}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold"
                        >
                          <Plus size={13} /> Buat Sekarang
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((item) => {
                      const baikCount = countStatus('B', item.items);
                      const rusakCount = countStatus('R', item.items);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-black text-slate-900 text-sm bg-slate-100 px-2 py-0.5 rounded w-fit border border-slate-200">
                              {item.nopol || 'TANPA NOPOL'}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                              <Calendar size={11} /> {item.tanggal || '-'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800 text-sm">{item.pelanggan || 'Pelanggan Umum'}</p>
                            <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                              <Car size={11} /> {item.tipeMobil || 'Kendaraan tidak diisi'}
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-700">{item.km ? `${item.km}` : '-'}</p>
                            <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                              <User size={11} /> Mekanik: {item.mekanik || '-'}
                            </p>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[11px]">
                                {baikCount} B
                              </span>
                              {rusakCount > 0 ? (
                                <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[11px]">
                                  {rusakCount} R
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[11px]">
                                  0 R
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-[220px]">
                            <p className="text-slate-600 truncate text-[11px]">
                              {item.saran || <span className="text-slate-300 italic">Tidak ada catatan saran</span>}
                            </p>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditLPA(item)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors text-xs"
                                title="Buka dan Edit Formulir"
                              >
                                <Edit3 size={12} /> Buka / Edit
                              </button>
                              <button
                                onClick={() => {
                                  handleEditLPA(item);
                                  setTimeout(() => window.print(), 300);
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                title="Cetak PDF Langsung"
                              >
                                <Printer size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteLPA(item.id!, item.nopol)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                title="Hapus Data"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: INTERACTIVE FORM (Screen View Only - Hidden on Print) ── */}
      {activeTab === 'form' && (
        <div className="print:hidden max-w-4xl mx-auto p-2.5 sm:p-6 space-y-4 pb-16">

          {/* Edit Alert Bar */}
          {currentDocId && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <AlertCircle size={17} className="text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    Mode Edit: LPA #{currentDocId.slice(0, 8)} ({form.nopol || 'Tanpa Nopol'})
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-amber-700 hidden sm:block">
                    Perubahan akan memperbarui dokumen di Cloud Database.
                  </p>
                </div>
              </div>
              <button
                onClick={handleNewForm}
                className="text-xs font-bold text-amber-900 bg-amber-200/60 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
              >
                + Form Baru
              </button>
            </div>
          )}

          {/* Document Screen Card */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            
            {/* Header: Logo, Workshop Info & Document Title */}
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-white">
              <div className="flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-4">
                
                {/* Logo & Company Profile */}
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-5 text-center sm:text-left">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                    <img
                      src="/logo.png"
                      alt="FHRCAR"
                      className="h-12 sm:h-14 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
                      FHRCAR AUTO SERVICES
                    </h1>
                    <p className="text-xs sm:text-sm font-extrabold text-red-600 italic">
                      "Bengkel Mobil Home Service & Panggilan 24 Jam"
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                      Melayani Area Purwokerto, Banyumas, & Sekitarnya · Siaga 24 Jam
                    </p>
                  </div>
                </div>

                {/* Doc Tag Badge */}
                <div className="flex sm:flex-col items-center justify-center px-4 py-2 sm:py-0 bg-slate-50 border border-slate-200 rounded-xl text-center flex-shrink-0 min-w-[140px]">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dokumen Resmi</p>
                  <p className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                    LEMBAR<br className="hidden sm:inline" /> PEMERIKSAAN AKHIR
                  </p>
                  <p className="text-[10px] text-red-600 font-mono font-bold mt-0.5">
                    {currentDocId ? `#LPA-${currentDocId.slice(0, 6).toUpperCase()}` : `#LPA-${new Date().getFullYear()}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle & Customer Info Form Inputs */}
            <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: 'Nama Pelanggan', field: 'pelanggan', icon: User, placeholder: 'Contoh: Bapak Budi Santoso' },
                  { label: 'Tipe / Merk Mobil', field: 'tipeMobil', icon: Car, placeholder: 'Contoh: Toyota Avanza 1.5 MT' },
                  { label: 'Nomor Polisi (Nopol)', field: 'nopol', icon: Hash, placeholder: 'Contoh: R 1234 AB' },
                  { label: 'Kilometer (KM)', field: 'km', icon: Gauge, placeholder: 'Contoh: 45.200 KM' },
                  { label: 'Tanggal Pemeriksaan', field: 'tanggal', icon: Calendar, placeholder: '' },
                  { label: 'Nama Mekanik / Inspector', field: 'mekanik', icon: User, placeholder: 'Contoh: Mas Agus' },
                ].map(({ label, field, icon: Icon, placeholder }) => (
                  <div key={field} className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Icon size={11} className="text-red-500" /> {label}
                    </label>
                    <input
                      type={field === 'tanggal' ? 'date' : 'text'}
                      value={(form as any)[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full text-xs sm:text-sm font-bold text-slate-800 bg-transparent py-1 focus:outline-none focus:border-red-500 border-b border-slate-100 placeholder-slate-300 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Checklist 46 Item Interactive Table ── */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-900 text-white select-none">
                    <th className="text-center py-2.5 px-2 text-[10px] font-bold tracking-widest uppercase border-r border-white/10 w-9">
                      No
                    </th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-bold tracking-widest uppercase border-r border-white/10">
                      Pemeriksaan Komponen
                    </th>
                    <th className="text-center py-2.5 px-2 text-[10px] font-bold tracking-widest uppercase border-r border-white/10 w-14 bg-emerald-950/40 text-emerald-300">
                      B (Baik)
                    </th>
                    <th className="text-center py-2.5 px-2 text-[10px] font-bold tracking-widest uppercase border-r border-white/10 w-14 bg-red-950/40 text-red-300">
                      R (Rusak)
                    </th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-bold tracking-widest uppercase w-48 sm:w-56">
                      Catatan / Nilai Ukur
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map(cat => {
                    const catItems = CHECKLIST_ITEMS.filter(i => i.category === cat);
                    return (
                      <React.Fragment key={cat}>
                        <tr className="select-none">
                          <td colSpan={5} className={`py-1.5 px-3 text-[11px] font-black tracking-wider uppercase ${CAT_COLORS[cat]}`}>
                            {cat} ({catItems.length} Item)
                          </td>
                        </tr>
                        {catItems.map((item, idx) => {
                          const val = form.items[item.no] || { status: '', catatan: '' };
                          const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';

                          return (
                            <tr key={item.no} className={`${rowBg} border-b border-slate-100 hover:bg-blue-50/30 transition-colors`}>
                              <td className="text-center py-2 px-1 text-xs font-mono font-bold text-slate-400 border-r border-slate-100">
                                {item.no}
                              </td>
                              <td className="py-2 px-3 text-xs font-medium text-slate-800 border-r border-slate-100">
                                {item.label}
                              </td>
                              <td className="text-center py-1.5 px-1 border-r border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => setItem(item.no, 'status', val.status === 'B' ? '' : 'B')}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center mx-auto transition-all border font-black text-xs
                                    ${val.status === 'B'
                                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs scale-105'
                                      : 'border-slate-300 text-slate-300 hover:border-emerald-400 hover:text-emerald-500 bg-white'}`}
                                >
                                  {val.status === 'B' ? <Check size={14} strokeWidth={3} /> : 'B'}
                                </button>
                              </td>
                              <td className="text-center py-1.5 px-1 border-r border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => setItem(item.no, 'status', val.status === 'R' ? '' : 'R')}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center mx-auto transition-all border font-black text-xs
                                    ${val.status === 'R'
                                      ? 'bg-red-600 border-red-600 text-white shadow-2xs scale-105'
                                      : 'border-slate-300 text-slate-300 hover:border-red-400 hover:text-red-500 bg-white'}`}
                                >
                                  {val.status === 'R' ? <XIcon size={14} strokeWidth={3} /> : 'R'}
                                </button>
                              </td>
                              <td className="py-1 px-2.5">
                                <input
                                  type="text"
                                  value={val.catatan}
                                  onChange={e => setItem(item.no, 'catatan', e.target.value)}
                                  placeholder="Ketik catatan..."
                                  className="w-full text-xs text-slate-700 bg-transparent border-b border-slate-200 focus:outline-none focus:border-red-400 py-1 placeholder-slate-300 transition-colors"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Saran, Ringkasan & Tanda Tangan ── */}
            <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Saran & Rekomendasi */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 bg-red-600 rounded-full inline-block"></span>
                      Saran & Rekomendasi Mekanik
                    </h3>
                    <textarea
                      value={form.saran}
                      onChange={e => setForm(f => ({ ...f, saran: e.target.value }))}
                      rows={5}
                      placeholder="Tuliskan catatan perbaikan, part yang perlu diganti segera, atau anjuran servis berkala..."
                      className="w-full text-xs text-slate-800 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Ringkasan & Tanda Tangan */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3.5">
                  
                  {/* Status Badges */}
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 bg-slate-800 rounded-full inline-block"></span>
                      Ringkasan Inspeksi
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg p-2 text-center bg-slate-100 text-slate-700">
                        <p className="text-lg font-black leading-none">{CHECKLIST_ITEMS.length}</p>
                        <p className="text-[9px] font-bold mt-1 uppercase text-slate-500">Total Item</p>
                      </div>
                      <div className="rounded-lg p-2 text-center bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <p className="text-lg font-black leading-none">{countStatus('B')}</p>
                        <p className="text-[9px] font-bold mt-1 uppercase text-emerald-600">Kondisi Baik</p>
                      </div>
                      <div className="rounded-lg p-2 text-center bg-red-50 border border-red-200 text-red-700">
                        <p className="text-lg font-black leading-none">{countStatus('R')}</p>
                        <p className="text-[9px] font-bold mt-1 uppercase text-red-600">Perlu Servis</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                      <span>Kelengkapan Pengecekan</span>
                      <span>{Math.round(((countStatus('B') + countStatus('R')) / CHECKLIST_ITEMS.length) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${((countStatus('B') + countStatus('R')) / CHECKLIST_ITEMS.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Tanda Tangan */}
                  <div>
                    <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2">
                      Tanda Tangan Pengesahan
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-500 mb-1">Mekanik / Inspector</p>
                        <div className="h-14 border border-dashed border-slate-200 rounded-lg flex items-end justify-center pb-1 bg-slate-50/50">
                          <p className="text-[10px] font-semibold text-slate-600 truncate px-1">
                            ( {form.mekanik || 'Mekanik'} )
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-500 mb-1">Pelanggan / Konsumen</p>
                        <div className="h-14 border border-dashed border-slate-200 rounded-lg flex items-end justify-center pb-1 bg-slate-50/50">
                          <p className="text-[10px] font-semibold text-slate-600 truncate px-1">
                            ( {form.pelanggan || 'Pelanggan'} )
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* ── 📄 DEDICATED PRINT / PDF 1-PAGE A4 LAYOUT (ONLY ACTIVE ON PRINT) ── */}
      <div className="hidden print:block print-page text-slate-900 bg-white leading-tight">
        
        {/* Print Header: Logo + Title + Doc No */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1.5 mb-1.5">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="FHRCAR" className="h-9 w-auto object-contain" />
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase leading-none">
                FHRCAR AUTO SERVICES
              </h1>
              <p className="text-[9px] font-bold text-red-600 italic leading-none mt-0.5">
                "Bengkel Mobil Home Service & Panggilan 24 Jam"
              </p>
              <p className="text-[7.5px] text-slate-500 leading-none mt-0.5">
                Area Purwokerto, Banyumas, & Sekitarnya · Siaga 24 Jam
              </p>
            </div>
          </div>
          <div className="text-right border-l-2 border-slate-900 pl-3">
            <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest leading-none">DOKUMEN RESMI</p>
            <p className="text-xs font-black text-slate-900 leading-tight">LEMBAR PEMERIKSAAN AKHIR</p>
            <p className="text-[8.5px] font-mono font-bold text-red-600 leading-none">
              {currentDocId ? `#LPA-${currentDocId.slice(0, 6).toUpperCase()}` : `#LPA-${new Date().getFullYear()}`}
            </p>
          </div>
        </div>

        {/* Compact Vehicle Info Grid (1 neat bar) */}
        <div className="bg-slate-100 border border-slate-300 rounded px-2 py-1 mb-1.5 text-[8.5px] grid grid-cols-6 gap-1 font-semibold">
          <div>
            <span className="text-[7.5px] text-slate-500 uppercase block font-bold">Pelanggan</span>
            <span className="truncate block font-bold text-slate-900">{form.pelanggan || '-'}</span>
          </div>
          <div>
            <span className="text-[7.5px] text-slate-500 uppercase block font-bold">No. Polisi</span>
            <span className="truncate block font-black text-slate-900 font-mono">{form.nopol || '-'}</span>
          </div>
          <div>
            <span className="text-[7.5px] text-slate-500 uppercase block font-bold">Tipe Mobil</span>
            <span className="truncate block text-slate-900">{form.tipeMobil || '-'}</span>
          </div>
          <div>
            <span className="text-[7.5px] text-slate-500 uppercase block font-bold">KM Kendaraan</span>
            <span className="truncate block text-slate-900">{form.km || '-'}</span>
          </div>
          <div>
            <span className="text-[7.5px] text-slate-500 uppercase block font-bold">Tanggal</span>
            <span className="truncate block text-slate-900">{form.tanggal || '-'}</span>
          </div>
          <div>
            <span className="text-[7.5px] text-slate-500 uppercase block font-bold">Mekanik</span>
            <span className="truncate block text-slate-900">{form.mekanik || '-'}</span>
          </div>
        </div>

        {/* ── 2-Column Side-by-Side Table for 46 Items (Fits 1 page perfectly) ── */}
        <div className="grid grid-cols-2 gap-1.5 mb-1.5">
          
          {/* Column 1: Interior (1-10) & Eksterior (11-22) */}
          <div className="border border-slate-400 rounded overflow-hidden">
            <table className="w-full text-[8px] border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-[7.5px]">
                  <th className="py-0.5 px-1 text-center w-5 border-r border-slate-700">No</th>
                  <th className="py-0.5 px-1.5 text-left border-r border-slate-700">Komponen</th>
                  <th className="py-0.5 px-1 text-center w-5 border-r border-slate-700 bg-emerald-900 text-emerald-200">B</th>
                  <th className="py-0.5 px-1 text-center w-5 border-r border-slate-700 bg-red-900 text-red-200">R</th>
                  <th className="py-0.5 px-1 text-left w-20">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {['INTERIOR', 'EKSTERIOR'].map(cat => {
                  const catItems = CHECKLIST_ITEMS.filter(i => i.category === cat);
                  return (
                    <React.Fragment key={cat}>
                      <tr className="bg-slate-800 text-white font-black text-[7.5px]">
                        <td colSpan={5} className="py-0.5 px-1 tracking-wider uppercase">
                          {cat}
                        </td>
                      </tr>
                      {catItems.map((item, idx) => {
                        const val = form.items[item.no] || { status: '', catatan: '' };
                        const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50';
                        return (
                          <tr key={item.no} className={`${rowBg} border-b border-slate-200`}>
                            <td className="text-center py-0.5 px-0.5 font-mono font-bold text-slate-500 border-r border-slate-200">
                              {item.no}
                            </td>
                            <td className="py-0.5 px-1 font-medium text-slate-900 border-r border-slate-200 truncate max-w-[120px]">
                              {item.label}
                            </td>
                            <td className="text-center py-0.5 px-0.5 border-r border-slate-200 font-bold text-[8.5px]">
                              {val.status === 'B' ? <span className="text-emerald-700 font-black">✓</span> : ''}
                            </td>
                            <td className="text-center py-0.5 px-0.5 border-r border-slate-200 font-bold text-[8.5px]">
                              {val.status === 'R' ? <span className="text-red-700 font-black">✕</span> : ''}
                            </td>
                            <td className="py-0.5 px-1 text-slate-600 truncate max-w-[80px]">
                              {val.catatan || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Column 2: Engine (23-43) & Understel (44-46) */}
          <div className="border border-slate-400 rounded overflow-hidden">
            <table className="w-full text-[8px] border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-[7.5px]">
                  <th className="py-0.5 px-1 text-center w-5 border-r border-slate-700">No</th>
                  <th className="py-0.5 px-1.5 text-left border-r border-slate-700">Komponen</th>
                  <th className="py-0.5 px-1 text-center w-5 border-r border-slate-700 bg-emerald-900 text-emerald-200">B</th>
                  <th className="py-0.5 px-1 text-center w-5 border-r border-slate-700 bg-red-900 text-red-200">R</th>
                  <th className="py-0.5 px-1 text-left w-20">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {['ENGINE', 'UNDERSTEL'].map(cat => {
                  const catItems = CHECKLIST_ITEMS.filter(i => i.category === cat);
                  return (
                    <React.Fragment key={cat}>
                      <tr className="bg-slate-800 text-white font-black text-[7.5px]">
                        <td colSpan={5} className="py-0.5 px-1 tracking-wider uppercase">
                          {cat}
                        </td>
                      </tr>
                      {catItems.map((item, idx) => {
                        const val = form.items[item.no] || { status: '', catatan: '' };
                        const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50';
                        return (
                          <tr key={item.no} className={`${rowBg} border-b border-slate-200`}>
                            <td className="text-center py-0.5 px-0.5 font-mono font-bold text-slate-500 border-r border-slate-200">
                              {item.no}
                            </td>
                            <td className="py-0.5 px-1 font-medium text-slate-900 border-r border-slate-200 truncate max-w-[120px]">
                              {item.label}
                            </td>
                            <td className="text-center py-0.5 px-0.5 border-r border-slate-200 font-bold text-[8.5px]">
                              {val.status === 'B' ? <span className="text-emerald-700 font-black">✓</span> : ''}
                            </td>
                            <td className="text-center py-0.5 px-0.5 border-r border-slate-200 font-bold text-[8.5px]">
                              {val.status === 'R' ? <span className="text-red-700 font-black">✕</span> : ''}
                            </td>
                            <td className="py-0.5 px-1 text-slate-600 truncate max-w-[80px]">
                              {val.catatan || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* ── Compact Saran & Signatures (Bottom Row) ── */}
        <div className="grid grid-cols-3 gap-1.5 border border-slate-400 rounded p-1.5 text-[8.5px]">
          
          {/* Saran */}
          <div className="col-span-2 border-r border-slate-300 pr-2 flex flex-col justify-between">
            <div>
              <p className="font-bold uppercase text-[7.5px] text-slate-600 mb-0.5">Saran & Rekomendasi Mekanik:</p>
              <p className="text-slate-800 italic leading-snug min-h-[32px]">
                {form.saran || 'Seluruh komponen dalam batas normal atau telah disesuaikan sesuai rekomendasi.'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200 text-[8px] font-bold">
              <span>Hasil:</span>
              <span className="text-emerald-700">{countStatus('B')} Item Baik (✓)</span>
              <span>·</span>
              <span className="text-red-700">{countStatus('R')} Item Rusak/Perlu Servis (✕)</span>
            </div>
          </div>

          {/* Tanda Tangan */}
          <div className="grid grid-cols-2 gap-1 text-center">
            <div>
              <p className="text-[7.5px] font-bold text-slate-500 uppercase">Mekanik</p>
              <div className="h-9 border-b border-dashed border-slate-400 flex items-end justify-center pb-0.5">
                <span className="text-[7.5px] font-semibold text-slate-700 truncate">( {form.mekanik || 'Mekanik'} )</span>
              </div>
            </div>
            <div>
              <p className="text-[7.5px] font-bold text-slate-500 uppercase">Pelanggan</p>
              <div className="h-9 border-b border-dashed border-slate-400 flex items-end justify-center pb-0.5">
                <span className="text-[7.5px] font-semibold text-slate-700 truncate">( {form.pelanggan || 'Pelanggan'} )</span>
              </div>
            </div>
          </div>

        </div>

        {/* Print Note */}
        <div className="text-center text-[7px] text-slate-400 mt-1">
          FHRCAR Auto Services — Bengkel Mobil Panggilan 24 Jam · Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>

      </div>

      {/* ── Strict 1-Page A4 Print CSS Rules ── */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 4mm 6mm !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print-page {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            max-height: 285mm !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          button, input, textarea {
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
