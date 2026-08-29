import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardList, Plus, Edit, Trash2, CheckCircle, X, ChevronDown, Target, TrendingUp, User, Calendar } from 'lucide-react';
import { ActivityPlan, ActivityPlanTask, EmployeeItem } from '../../types';
import { subscribeToActivityPlans, addActivityPlan, updateActivityPlan, deleteActivityPlan } from '../../lib/firestoreService';

interface CRMActivityPlanProps { employees: EmployeeItem[]; }

const today = new Date().toISOString().split('T')[0];

const DEFAULT_TASKS: Omit<ActivityPlanTask, 'id'>[] = [
  { title: 'Panggilan / Follow-up Customer', target: 10, achieved: 0, unit: 'panggilan' },
  { title: 'Booking SPK Baru', target: 3, achieved: 0, unit: 'booking' },
  { title: 'Upselling Jasa Tambahan', target: 2, achieved: 0, unit: 'item' },
  { title: 'Review / Testimoni Customer', target: 1, achieved: 0, unit: 'review' },
];

export function CRMActivityPlan({ employees }: CRMActivityPlanProps) {
  const [plans, setPlans] = useState<ActivityPlan[]>([]);
  const [filterDate, setFilterDate] = useState(today);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ActivityPlan | null>(null);
  const [form, setForm] = useState({ employeeId: '', employeeName: '', employeeRole: '', date: today, tasks: DEFAULT_TASKS.map((t, i) => ({ ...t, id: i.toString() })), notes: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { const u = subscribeToActivityPlans(setPlans); return () => u(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const filtered = useMemo(() => plans.filter(p => !filterDate || p.date === filterDate), [plans, filterDate]);

  const openAdd = () => {
    setEditing(null);
    setForm({ employeeId: '', employeeName: '', employeeRole: '', date: today, tasks: DEFAULT_TASKS.map((t, i) => ({ ...t, id: i.toString() })), notes: '' });
    setShowModal(true);
  };

  const openEdit = (p: ActivityPlan) => {
    setEditing(p);
    setForm({ employeeId: p.employeeId, employeeName: p.employeeName, employeeRole: p.employeeRole, date: p.date, tasks: [...p.tasks], notes: p.notes || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.employeeName) { alert('Pilih karyawan terlebih dahulu!'); return; }
    setSaving(true);
    try {
      if (editing) { await updateActivityPlan(editing.id, form); showToast('DAP diperbarui!'); }
      else { await addActivityPlan(form); showToast('DAP berhasil dibuat!'); }
      setShowModal(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus DAP untuk "${name}"?`)) return;
    await deleteActivityPlan(id);
    showToast('DAP dihapus.');
  };

  const updateAchieved = async (plan: ActivityPlan, taskId: string, val: number) => {
    const tasks = plan.tasks.map(t => t.id === taskId ? { ...t, achieved: Math.min(val, t.target) } : t);
    await updateActivityPlan(plan.id, { tasks });
  };

  const getProgress = (tasks: ActivityPlanTask[]) => {
    if (!tasks.length) return 0;
    const total = tasks.reduce((s, t) => s + t.target, 0);
    const done = tasks.reduce((s, t) => s + Math.min(t.achieved, t.target), 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const totalPlans = filtered.length;
  const onTrack = filtered.filter(p => getProgress(p.tasks) >= 70).length;
  const avgProgress = totalPlans > 0 ? Math.round(filtered.reduce((s, p) => s + getProgress(p.tasks), 0) / totalPlans) : 0;

  return (
    <div className="p-5 font-sans bg-[#f4f6fb] min-h-screen space-y-4">
      {toast && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold">
          <CheckCircle size={16} /><span>{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5"><ClipboardList size={20} className="text-red-600" /><h1 className="text-xl font-black text-slate-900">Activity Plan Harian (DAP)</h1></div>
          <p className="text-xs text-slate-500">Target dan pencapaian harian per karyawan</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400" />
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-sm transition-all">
            <Plus size={14} />+ Buat DAP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total DAP Hari Ini', value: totalPlans, color: 'text-slate-900', bg: 'bg-slate-100' },
          { label: 'On Track (≥70%)', value: onTrack, color: 'text-emerald-700', bg: 'bg-emerald-100' },
          { label: 'Rata-rata Progress', value: avgProgress + '%', color: 'text-blue-700', bg: 'bg-blue-100' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <ClipboardList size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-600">Belum ada Activity Plan untuk tanggal ini</p>
            <button onClick={openAdd} className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white font-black text-xs hover:bg-red-700 transition-colors">
              + Buat DAP Sekarang
            </button>
          </div>
        ) : filtered.map(plan => {
          const progress = getProgress(plan.tasks);
          return (
            <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                    {plan.employeeName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">{plan.employeeName}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">{plan.employeeRole} • {plan.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${progress >= 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : progress >= 70 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {progress}% {progress >= 100 ? '✓' : ''}
                  </div>
                  <button onClick={() => openEdit(plan)} className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"><Edit size={13} /></button>
                  <button onClick={() => handleDelete(plan.id, plan.employeeName)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="px-4 pt-3 pb-1">
                <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                  <div className={`h-2 rounded-full transition-all ${progress >= 100 ? 'bg-emerald-500' : progress >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
              </div>
              <div className="px-4 pb-4 space-y-2">
                {plan.tasks.map(task => {
                  const taskPct = task.target > 0 ? Math.min(Math.round((task.achieved / task.target) * 100), 100) : 0;
                  return (
                    <div key={task.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[11px] font-semibold text-slate-700 truncate">{task.title}</p>
                          <span className="text-[11px] font-black text-slate-600 ml-2 shrink-0">{task.achieved}/{task.target}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${taskPct >= 100 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${taskPct}%` }} />
                        </div>
                      </div>
                      <input type="number" value={task.achieved} min={0} max={task.target}
                        onChange={e => updateAchieved(plan, task.id, Number(e.target.value))}
                        className="w-12 px-1.5 py-1 text-[11px] font-bold border border-slate-200 rounded-lg text-center outline-none focus:border-red-400"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="font-black text-slate-900">{editing ? 'Edit DAP' : 'Buat Activity Plan Baru'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Karyawan *</label>
                  <select
                    value={form.employeeId}
                    onChange={e => {
                      const emp = employees.find(em => em.id === e.target.value);
                      setForm(p => ({ ...p, employeeId: e.target.value, employeeName: emp?.name || '', employeeRole: emp?.role || '' }));
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400"
                  >
                    <option value="">-- Pilih Karyawan --</option>
                    {employees.filter(e => e.status === 'active').map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-slate-600">Target Tugas</label>
                  <button onClick={() => setForm(p => ({ ...p, tasks: [...p.tasks, { id: Date.now().toString(), title: '', target: 1, achieved: 0, unit: 'item' }] }))} className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1">
                    <Plus size={11} /> Tambah Target
                  </button>
                </div>
                <div className="space-y-2">
                  {form.tasks.map((task, idx) => (
                    <div key={task.id} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <input value={task.title} onChange={e => { const ts = [...form.tasks]; ts[idx] = { ...ts[idx], title: e.target.value }; setForm(p => ({ ...p, tasks: ts })); }} placeholder="Nama target..." className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none bg-white focus:border-red-400" />
                      <input type="number" value={task.target} onChange={e => { const ts = [...form.tasks]; ts[idx] = { ...ts[idx], target: Number(e.target.value) }; setForm(p => ({ ...p, tasks: ts })); }} className="w-14 px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none text-center bg-white focus:border-red-400" />
                      <input value={task.unit} onChange={e => { const ts = [...form.tasks]; ts[idx] = { ...ts[idx], unit: e.target.value }; setForm(p => ({ ...p, tasks: ts })); }} placeholder="satuan" className="w-16 px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none bg-white focus:border-red-400" />
                      <button onClick={() => setForm(p => ({ ...p, tasks: p.tasks.filter((_, i) => i !== idx) }))} className="p-1 text-slate-400 hover:text-red-600"><X size={13} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Catatan</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600">Batal</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-xs font-black rounded-xl bg-red-600 text-white disabled:opacity-60">
                {saving ? 'Menyimpan...' : (editing ? 'Simpan' : 'Buat DAP')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
