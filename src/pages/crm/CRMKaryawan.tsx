import React, { useState, useMemo } from 'react';
import {
  Users, UserPlus, Search, Filter, Edit, Trash2, Phone, Mail,
  CheckCircle, AlertCircle, X, Shield, Wrench, UserCheck,
  UserX, Briefcase, ChevronRight, Sparkles, Building, Hash
} from 'lucide-react';
import { EmployeeItem, EmployeeRole } from '../../types';
import { addEmployee, updateEmployee, deleteEmployee } from '../../lib/firestoreService';

interface CRMKaryawanProps {
  employees: EmployeeItem[];
  onNavigate: (page: any) => void;
}

const ROLES: { role: EmployeeRole; label: string; desc: string; badgeColor: string }[] = [
  { role: 'SA', label: 'Service Advisor (SA)', desc: 'Penerima booking & inspeksi awal kendaraan', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  { role: 'FA', label: 'Front Advisor (FA)', desc: 'Customer service & administrasi depan', badgeColor: 'bg-teal-100 text-teal-800 border-teal-200' },
  { role: 'Foreman', label: 'Kepala Regu / Foreman', desc: 'Koordinator teknisi & quality control', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { role: 'Mekanik', label: 'Teknisi / Mekanik', desc: 'Pengerjaan servis & perbaikan unit', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { role: 'Kasir', label: 'Kasir / Finance', desc: 'Penerimaan pembayaran & cetak nota', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { role: 'Manager', label: 'Manager Bengkel', desc: 'Kepala operasional cabang', badgeColor: 'bg-slate-800 text-white border-slate-900' },
];

export function CRMKaryawan({ employees, onNavigate }: CRMKaryawanProps) {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    nik: string;
    role: EmployeeRole;
    phone: string;
    email: string;
    status: 'active' | 'inactive';
  }>({
    name: '',
    nik: '',
    role: 'Mekanik',
    phone: '',
    email: '',
    status: 'active',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered list
  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchSearch = !search ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.nik && e.nik.toLowerCase().includes(search.toLowerCase())) ||
        e.phone.includes(search);
      const matchRole = filterRole === 'all' || e.role === filterRole;
      const matchStatus = filterStatus === 'all' || e.status === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [employees, search, filterRole, filterStatus]);

  // Counts
  const totalCount = employees.length;
  const saCount = employees.filter(e => e.role === 'SA').length;
  const mekanikCount = employees.filter(e => e.role === 'Mekanik' || e.role === 'Foreman').length;
  const kasirCount = employees.filter(e => e.role === 'Kasir' || e.role === 'FA').length;

  const openAdd = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      nik: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
      role: 'Mekanik',
      phone: '',
      email: '',
      status: 'active',
    });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (emp: EmployeeItem) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      nik: emp.nik || '',
      role: emp.role,
      phone: emp.phone,
      email: emp.email || '',
      status: emp.status,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Nama karyawan wajib diisi');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Nomor telepon / WA wajib diisi');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, {
          name: formData.name.trim(),
          nik: formData.nik.trim(),
          role: formData.role,
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          status: formData.status,
        });
        showToast(`Data ${formData.name} berhasil diperbarui!`);
      } else {
        await addEmployee({
          name: formData.name.trim(),
          nik: formData.nik.trim(),
          role: formData.role,
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          status: formData.status,
        });
        showToast(`Karyawan baru ${formData.name} berhasil ditambahkan!`);
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError('Gagal menyimpan: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (emp: EmployeeItem) => {
    if (window.confirm(`Yakin ingin menghapus data karyawan ${emp.name}?`)) {
      try {
        await deleteEmployee(emp.id);
        showToast(`Karyawan ${emp.name} berhasil dihapus.`);
      } catch (err) {
        showToast('Gagal menghapus karyawan.');
      }
    }
  };

  const getRoleBadge = (role: EmployeeRole) => {
    const found = ROLES.find(r => r.role === role);
    return found ? found.badgeColor : 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans max-w-7xl mx-auto">

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-600/30 text-sm font-semibold animate-fade-in">
          <CheckCircle size={18} className="shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                <Users size={24} />
              </span>
              <div>
                <h1 className="text-xl font-black text-slate-900">Database Karyawan & Teknisi</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola staf bengkel (SA, FA, Mekanik, Foreman, Kasir) untuk penugasan SPK dan nota servis
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('crm-spk-create')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all"
            >
              <span>+ Buat SPK</span>
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all"
            >
              <UserPlus size={16} />
              <span>+ Tambah Karyawan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Karyawan</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Semua divisi operasional</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Advisor (SA)</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{saCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Frontliner & Inspektor SA</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mekanik & Foreman</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{mekanikCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Teknisi pengerjaan servis</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kasir & Front Advisor</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{kasirCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Administrasi & Pembayaran</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama karyawan, NIK, atau nomor telepon..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-400 transition-colors placeholder-slate-400"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-400 text-slate-700 font-semibold"
            >
              <option value="all">Semua Jabatan</option>
              {ROLES.map(r => (
                <option key={r.role} value={r.role}>{r.label}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-400 text-slate-700 font-semibold"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Non-Aktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">No.</th>
                <th className="py-3.5 px-4">Nama Karyawan</th>
                <th className="py-3.5 px-4">NIK / ID</th>
                <th className="py-3.5 px-4">Jabatan (Role)</th>
                <th className="py-3.5 px-4">No. Telepon / WA</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">Tidak ada data karyawan yang sesuai</p>
                  </td>
                </tr>
              ) : (
                filtered.map((emp, idx) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                          {emp.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{emp.name}</p>
                          {emp.email && <p className="text-[11px] text-slate-400">{emp.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                      {emp.nik || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getRoleBadge(emp.role)}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <a
                        href={`https://wa.me/${emp.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
                      >
                        <Phone size={12} className="text-slate-400" />
                        <span>{emp.phone}</span>
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {emp.status === 'active' ? <UserCheck size={11} /> : <UserX size={11} />}
                        {emp.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(emp)}
                          title="Edit Data"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          title="Hapus"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-50 text-red-600">
                  <UserPlus size={16} />
                </span>
                {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 font-semibold"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    NIK / ID Karyawan
                  </label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={e => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="SA-001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Jabatan / Posisi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 bg-white font-bold"
                  >
                    {ROLES.map(r => (
                      <option key={r.role} value={r.role}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    No. Telepon / WA <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="budi@fhrcar.xyz"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Status Kepegawaian
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData({ ...formData, status: 'active' })}
                      className="accent-red-600"
                    />
                    <span>Aktif (Dapat dipilih di SPK)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={() => setFormData({ ...formData, status: 'inactive' })}
                      className="accent-red-600"
                    />
                    <span>Non-Aktif</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all"
                >
                  {saving ? 'Menyimpan...' : editingEmployee ? 'Simpan Perubahan' : 'Tambah Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
