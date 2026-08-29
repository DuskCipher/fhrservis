import React, { useState, useMemo } from 'react';
import {
  Users, Search, Plus, Phone, MessageSquare, Car,
  Calendar, Edit, Trash2, CheckCircle, FileText,
  Filter, Eye, ChevronDown, X, Upload, Download,
  UserPlus, RefreshCw, MoreHorizontal, StarIcon,
  Repeat2, BarChart3, TrendingDown, GitMerge, UserCheck,
  Building2, Hash, Key, Clock, AlertTriangle
} from 'lucide-react';
import { CustomerItem } from '../../types';
import { deleteCustomer } from '../../lib/firestoreService';

interface CRMCustomersProps {
  customers: CustomerItem[];
  orders: any[];
  activePage?: string;
  onNavigate: (page: any) => void;
  onBuatSPK?: () => void;
  onViewCustomer?: (customer: CustomerItem) => void;
  onTambahCustomer?: () => void;
  onEditCustomer?: (customer: CustomerItem) => void;
}

const CAR_BRANDS = [
  'Semua Merek', 'Toyota', 'Honda', 'Daihatsu', 'Suzuki', 'Mitsubishi',
  'Nissan', 'Hyundai', 'Wuling', 'Isuzu', 'Mazda'
];

const COMING_SOON_PAGES = [
  'crm-customer-register',
  'crm-customer-profile',
  'crm-customer-mutation',
  'crm-customer-analysis',
  'crm-customer-rfm',
];

const PAGE_LABELS: Record<string, string> = {
  'crm-customer-register': 'Registrasi Pelanggan',
  'crm-customer-profile': 'Profil Customer',
  'crm-customer-mutation': 'Mutasi Kepemilikan',
  'crm-customer-analysis': 'Analisa Pelanggan',
  'crm-customer-rfm': 'Segmentasi RFM',
};

const PAGE_ICONS: Record<string, React.ReactNode> = {
  'crm-customer-register': <UserPlus size={32} className="text-blue-400" />,
  'crm-customer-profile': <UserCheck size={32} className="text-purple-400" />,
  'crm-customer-mutation': <GitMerge size={32} className="text-amber-400" />,
  'crm-customer-analysis': <BarChart3 size={32} className="text-cyan-400" />,
  'crm-customer-rfm': <StarIcon size={32} className="text-yellow-400" />,
};

export function CRMCustomers({
  customers,
  orders,
  activePage = 'crm-customers',
  onNavigate,
  onBuatSPK,
  onViewCustomer,
  onTambahCustomer,
  onEditCustomer,
}: CRMCustomersProps) {

  // --- Coming Soon pages ---
  if (COMING_SOON_PAGES.includes(activePage)) {
    return (
      <div className="p-6 font-sans flex flex-col items-center justify-center min-h-[70vh] gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 flex flex-col items-center gap-5 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            {PAGE_ICONS[activePage] || <Building2 size={32} className="text-slate-400" />}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-2">{PAGE_LABELS[activePage]}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Fitur ini sedang dalam tahap pengembangan.<br />
              Akan segera tersedia dalam pembaruan berikutnya.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700">
            <AlertTriangle size={14} />
            <span>Coming Soon</span>
          </div>
          <button
            onClick={() => onNavigate('crm-customers')}
            className="mt-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            ← Kembali ke Daftar Pelanggan
          </button>
        </div>
      </div>
    );
  }

  const [search, setSearch] = useState('');
  const [searchWilayah, setSearchWilayah] = useState('');
  const [filterBrand, setFilterBrand] = useState('Semua Merek');
  const [filterTipe, setFilterTipe] = useState('Semua Tipe');
  const [filterHistori, setFilterHistori] = useState('Semua Pelanggan');
  const [activeTab, setActiveTab] = useState<'list' | 'kendaraan' | 'member' | 'daftar-member'>('list');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return isoString; }
  };

  const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  // Stats
  const totalVehicles = customers.reduce((sum, c) => sum + (c.totalOrdersCount || 0), 0);
  const repeatCustomers = customers.filter(c => c.customerType === 'LAMA').length;
  const repeatRate = customers.length > 0 ? Math.round((repeatCustomers / customers.length) * 100) : 0;

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = !search ||
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search) ||
        c.licensePlate?.toLowerCase().includes(search.toLowerCase());

      const matchWilayah = !searchWilayah ||
        c.address?.toLowerCase().includes(searchWilayah.toLowerCase());

      const matchBrand = filterBrand === 'Semua Merek' ||
        c.carBrand?.toLowerCase() === filterBrand.toLowerCase();

      const matchTipe = filterTipe === 'Semua Tipe' ||
        (filterTipe === 'BARU' ? (c.customerType === 'BARU' || !c.customerType) : c.customerType === 'LAMA');

      let matchDate = true;
      if ((startDate || endDate) && c.createdAt) {
        try {
          const ds = new Date(c.createdAt).toISOString().split('T')[0];
          if (startDate && ds < startDate) matchDate = false;
          if (endDate && ds > endDate) matchDate = false;
        } catch {}
      }

      return matchSearch && matchWilayah && matchBrand && matchTipe && matchDate;
    });
  }, [customers, search, searchWilayah, filterBrand, filterTipe, startDate, endDate]);

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    setSelected(prev => prev.length === filteredCustomers.length ? [] : filteredCustomers.map(c => c.id));
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus data pelanggan "${name}"?`)) {
      try {
        await deleteCustomer(id);
        showToast('Data pelanggan berhasil dihapus.');
      } catch {
        alert('Gagal menghapus pelanggan.');
      }
    }
  };

  const handleViewClick = (c: CustomerItem) => {
    if (onViewCustomer) onViewCustomer(c);
    else onNavigate('crm-customer-detail');
  };

  const handleEditClick = (c: CustomerItem) => {
    if (onEditCustomer) onEditCustomer(c);
  };

  const handleAddClick = () => {
    if (onTambahCustomer) onTambahCustomer();
    else onNavigate('crm-customer-create');
  };

  const TABS = [
    { id: 'list', label: `Daftar Pelanggan (${customers.length})` },
    { id: 'kendaraan', label: `Master Kendaraan (${totalVehicles})` },
    { id: 'member', label: `Data Member Bengkel (0)` },
    { id: 'daftar-member', label: `Pendaftaran Member Baru` },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5 font-sans bg-[#f4f6fb] min-h-screen">

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold">
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Page Header ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900">Daftar Pelanggan & Kendaraan</h1>
            <p className="text-xs text-slate-500 mt-0.5">Database pelanggan bengkel dan master kendaraan terdaftar</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors shadow-xs">
              <Download size={14} />
              <span>Download Template CSV</span>
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors shadow-xs">
              <Upload size={14} />
              <span>Import CSV</span>
            </button>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-600/20 transition-all"
            >
              <Plus size={15} />
              <span>+ Registrasi Pelanggan</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pelanggan Terdaftar</p>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-900">{customers.length}</p>
          <p className="text-xs text-slate-400 mt-1">Kontak Aktif</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kendaraan Terdaftar</p>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Car size={16} />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-900">{customers.length}</p>
          <p className="text-xs text-slate-400 mt-1">Mobil & Motor</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rata-rata Repeat Order</p>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Repeat2 size={16} />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-900">{repeatRate}%</p>
          <p className="text-xs text-slate-400 mt-1">Bulan Terakhir</p>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-amber-400 bg-amber-50 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === tab.id ? 'bg-amber-400' : 'bg-slate-300'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Bar 1 - Search Inputs & Cabang */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row items-center gap-3">
            {/* Search Nama/WA/Plat */}
            <div className="relative flex-1 min-w-[230px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari Nama, No WA, Plat Nopol..."
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
              />
            </div>

            {/* Search Wilayah */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchWilayah}
                onChange={e => setSearchWilayah(e.target.value)}
                placeholder="Cari Wilayah / Domisili..."
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
              />
            </div>

            <div className="flex-1" />

            {/* Cabang Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">FILTER CABANG:</span>
              <select className="px-3 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:border-red-400">
                <option>FHR Car Service</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Bar 2 - Dropdown Filters */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Merek Mobil */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">MEREK MOBIL:</span>
              <select
                value={filterBrand}
                onChange={e => setFilterBrand(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 outline-none"
              >
                {CAR_BRANDS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>

            {/* Tipe Pelanggan */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">TIPE PELANGGAN:</span>
              <select
                value={filterTipe}
                onChange={e => setFilterTipe(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 outline-none"
              >
                <option>Semua Tipe</option>
                <option>BARU</option>
                <option>LAMA</option>
              </select>
            </div>

            {/* Status PIN */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">STATUS PIN:</span>
              <select className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 outline-none">
                <option>Semua PIN Portal</option>
                <option>Sudah Ada PIN</option>
                <option>Belum Ada PIN</option>
              </select>
            </div>

            {/* Histori Transaksi */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">HISTORI TRANSAKSI:</span>
              <select
                value={filterHistori}
                onChange={e => setFilterHistori(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 outline-none"
              >
                <option>Semua Pelanggan</option>
                <option>Pernah Transaksi</option>
                <option>Belum Pernah Transaksi</option>
              </select>
            </div>
          </div>

          {/* Date Range Row */}
          <div className="flex flex-wrap gap-3 items-center mt-3">
            <span className="text-[11px] font-bold text-slate-500">GABUNG DARI:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:border-red-400"
            />
            <span className="text-[11px] font-bold text-slate-500">SAMPAI:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:border-red-400"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-[11px] font-bold border border-red-200 hover:bg-red-100 transition-colors"
              >
                <X size={12} /> Reset
              </button>
            )}

            {/* Typo flag */}
            <button className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 text-[11px] font-bold hover:bg-amber-100 transition-colors">
              <AlertTriangle size={12} />
              <span>⚠ TYPO MEREK / MODEL</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="pl-4 pr-2 py-3 w-8 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selected.length === filteredCustomers.length && filteredCustomers.length > 0}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded accent-red-600"
                  />
                </th>
                <th className="px-3 py-3 w-10 text-center whitespace-nowrap">NO</th>
                <th className="px-3 py-3 whitespace-nowrap">NAMA PELANGGAN</th>
                <th className="px-3 py-3 text-center whitespace-nowrap">TIPE</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">SALDO DEPOSIT</th>
                <th className="px-3 py-3 whitespace-nowrap">NO. WA / TELEPON</th>
                <th className="px-3 py-3 whitespace-nowrap">ALAMAT DOMISILI</th>
                <th className="px-3 py-3 whitespace-nowrap">BENGKEL ASAL</th>
                <th className="px-3 py-3 text-center whitespace-nowrap">JUMLAH UNIT</th>
                <th className="px-3 py-3 whitespace-nowrap">PLAT NOMOR KENDARAAN</th>
                <th className="px-3 py-3 whitespace-nowrap">MEREK & MODEL</th>
                <th className="px-3 py-3 text-center whitespace-nowrap">PIN PORTAL</th>
                <th className="px-3 py-3 whitespace-nowrap">TANGGAL GABUNG</th>
                <th className="px-3 py-3 text-right pr-4 whitespace-nowrap">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={14} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Users size={24} className="text-slate-400" />
                      </div>
                      <p className="font-bold text-slate-700 text-sm">Tidak ditemukan data pelanggan.</p>
                      <p className="text-xs text-slate-400">Silakan ubah filter atau tambah pelanggan baru</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c, idx) => {
                  const isLama = c.customerType === 'LAMA';
                  const isSelected = selected.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/90 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(c.id)}
                          className="w-3.5 h-3.5 rounded accent-red-600"
                        />
                      </td>

                      {/* No */}
                      <td className="px-3 py-3.5 text-center text-slate-400 font-bold whitespace-nowrap">{idx + 1}</td>

                      {/* Nama Pelanggan */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {c.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <button
                            onClick={() => handleViewClick(c)}
                            className="font-bold text-slate-800 hover:text-red-600 transition-colors text-left text-xs whitespace-nowrap"
                          >
                            {c.name}
                          </button>
                        </div>
                      </td>

                      {/* Tipe */}
                      <td className="px-3 py-3.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border whitespace-nowrap ${
                          isLama
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {isLama ? 'LAMA' : 'BARU'}
                        </span>
                      </td>

                      {/* Saldo Deposit */}
                      <td className="px-3 py-3.5 text-right whitespace-nowrap">
                        <span className="font-bold text-slate-700 text-[11px] whitespace-nowrap">
                          {c.depositBalance ? formatRp(c.depositBalance) : (
                            <span className="text-slate-300 font-normal">—</span>
                          )}
                        </span>
                      </td>

                      {/* No WA / Telepon */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Phone size={11} className="text-slate-400 shrink-0" />
                          <span className="font-mono font-bold text-slate-700 text-[11px] whitespace-nowrap">{c.phone}</span>
                        </div>
                      </td>

                      {/* Alamat */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <p className="text-[11px] text-slate-600 max-w-[180px] truncate whitespace-nowrap" title={c.address}>
                          {c.address || <span className="text-slate-300">—</span>}
                        </p>
                      </td>

                      {/* Bengkel Asal */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <Building2 size={11} className="text-slate-400 shrink-0" />
                          <span className="text-[11px] text-slate-600 font-medium whitespace-nowrap">FHR Car Service</span>
                        </div>
                      </td>

                      {/* Jumlah Unit */}
                      <td className="px-3 py-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
                          {c.totalOrdersCount || 1} Unit
                        </span>
                      </td>

                      {/* Plat Nomor */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {c.licensePlate ? (
                          <span className="inline-block px-2 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold text-[10px] tracking-widest shadow-xs whitespace-nowrap">
                            {c.licensePlate}
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Merek & Model */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <p className="font-bold text-slate-800 text-[11px] whitespace-nowrap">{c.carBrand} {c.carModel}</p>
                        <p className="text-[10px] text-slate-400 whitespace-nowrap">{c.carYear} • {c.transmission || 'Matic'}</p>
                      </td>

                      {/* PIN Portal */}
                      <td className="px-3 py-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">
                          <Key size={9} />
                          —
                        </span>
                      </td>

                      {/* Tanggal Gabung */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-700 whitespace-nowrap">
                          <Calendar size={11} className="text-red-500 shrink-0" />
                          <span className="text-[11px] font-bold whitespace-nowrap">{formatDate(c.createdAt)}</span>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="px-3 py-3.5 pr-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewClick(c)}
                            title="Profil Pelanggan"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => onBuatSPK ? onBuatSPK() : onNavigate('crm-spk-create')}
                            title="Buat SPK"
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                          >
                            <FileText size={13} />
                          </button>
                          <a
                            href={`https://wa.me/${c.phone?.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(c.name)}%2C%20kami%20dari%20FHR%20Car%20Service.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat WhatsApp"
                            className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          >
                            <MessageSquare size={13} />
                          </a>
                          <button
                            onClick={() => handleEditClick(c)}
                            title="Edit"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            title="Hapus"
                            className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
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

        {/* Table Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Baris per halaman:</span>
            <select className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 outline-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          <span className="text-xs font-bold text-slate-600">
            MENAMPILKAN {filteredCustomers.length} DARI {customers.length} PELANGGAN
          </span>
          <div className="flex items-center gap-1.5">
            <button className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors" disabled>
              Sebelumnya
            </button>
            <button className="w-7 h-7 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center justify-center">1</button>
            <button className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors" disabled>
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
