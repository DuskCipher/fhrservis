import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Plus, Search, Edit3, Trash2, ExternalLink, Calendar,
  Clock, Tag, Image as ImageIcon, CheckCircle, Eye, FileText, Sparkles, X
} from 'lucide-react';
import { ArticleItem, PageType } from '../../types';
import { subscribeToArticles, addArticle, updateArticle, deleteArticle } from '../../lib/firestoreService';

interface CRMArticlesProps {
  onNavigate: (page: PageType) => void;
  onPreviewArticle?: (article: ArticleItem) => void;
}

const CATEGORY_OPTIONS = [
  'Emergency & Kelistrikan',
  'Emergency 24 Jam',
  'Perawatan Mesin',
  'AC & Kenyamanan',
  'Kaki-Kaki & Suspensi',
  'Service Rem',
  'Tips & Edukasi Otomotif',
];

const PRESET_IMAGES = [
  { label: 'Mesin & Aki', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Derek / Mobil Mogok', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Servis AC', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80' },
  { label: 'Ganti Oli & Tune Up', url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80' },
  { label: 'Kaki-kaki & Ban', url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80' },
];

export function CRMArticles({ onNavigate, onPreviewArticle }: CRMArticlesProps) {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [form, setForm] = useState({
    title: '',
    category: CATEGORY_OPTIONS[0],
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    readTime: '4 Menit Baca',
    snippet: '',
    image: PRESET_IMAGES[0].url,
    contentRaw: '',
    tipsRaw: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToArticles(setArticles);
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      const matchCat = selectedCategory === 'all' || art.category === selectedCategory;
      const matchQuery = !searchQuery ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [articles, selectedCategory, searchQuery]);

  const openCreateModal = () => {
    setEditingArticle(null);
    setForm({
      title: '',
      category: CATEGORY_OPTIONS[0],
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      readTime: '4 Menit Baca',
      snippet: '',
      image: PRESET_IMAGES[0].url,
      contentRaw: '',
      tipsRaw: '',
    });
    setShowModal(true);
  };

  const openEditModal = (article: ArticleItem) => {
    setEditingArticle(article);
    setForm({
      title: article.title,
      category: article.category,
      date: article.date,
      readTime: article.readTime,
      snippet: article.snippet,
      image: article.image,
      contentRaw: Array.isArray(article.content) ? article.content.join('\n\n') : '',
      tipsRaw: Array.isArray(article.tips) ? article.tips.join('\n') : '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.snippet.trim()) {
      alert('Judul dan ringkasan wajib diisi!');
      return;
    }

    setSaving(true);
    try {
      const contentParagraphs = form.contentRaw
        ? form.contentRaw.split('\n\n').map(p => p.trim()).filter(Boolean)
        : [form.snippet];

      const tipsList = form.tipsRaw
        ? form.tipsRaw.split('\n').map(t => t.trim()).filter(Boolean)
        : [];

      const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      if (editingArticle) {
        await updateArticle(editingArticle.id, {
          title: form.title,
          category: form.category,
          date: form.date,
          readTime: form.readTime,
          snippet: form.snippet,
          image: form.image,
          content: contentParagraphs,
          tips: tipsList,
        });
        showToast('Artikel berhasil diperbarui!');
      } else {
        await addArticle({
          id: slug,
          title: form.title,
          category: form.category,
          date: form.date,
          readTime: form.readTime,
          snippet: form.snippet,
          image: form.image,
          content: contentParagraphs,
          tips: tipsList,
        });
        showToast('Artikel baru berhasil dipublikasikan ke web utama!');
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (art: ArticleItem) => {
    if (!window.confirm(`Hapus artikel "${art.title}"?`)) return;
    await deleteArticle(art.id);
    showToast('Artikel berhasil dihapus.');
  };

  return (
    <div className="p-5 font-sans bg-[#f4f6fb] min-h-screen space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded shadow-xl text-xs font-bold animate-fade-in">
          <CheckCircle size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <BookOpen size={20} className="text-red-600" />
            <h1 className="text-xl font-black text-slate-900">Kelola Tips & Artikel (CMS)</h1>
          </div>
          <p className="text-xs text-slate-500">
            Tulis, edit, dan publikasikan artikel edukasi & tips otomotif — langsung tampil di website utama
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>+ Tulis Artikel Baru</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded border border-slate-200 p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL ARTIKEL TAYANG</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{articles.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Aktif di web utama</p>
        </div>

        <div className="bg-white rounded border border-slate-200 p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KATEGORI ARTIKEL</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{CATEGORY_OPTIONS.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Topik edukasi pelanggan</p>
        </div>

        <div className="bg-white rounded border border-slate-200 p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">STATUS PUBLIKASI</p>
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs mt-2">
            <CheckCircle size={15} />
            <span>Sinkronisasi Otomatis Firestore Real-Time</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari judul artikel, topik, atau kata kunci..."
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded bg-slate-50 focus:bg-white focus:border-red-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-bold text-[11px]">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded bg-white text-slate-700 outline-none focus:border-red-500"
            >
              <option value="all">Semua Kategori</option>
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full bg-white rounded border border-slate-200 p-16 text-center shadow-xs">
            <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700 text-sm">Tidak ada artikel yang sesuai pencarian</p>
            <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci atau buat artikel baru</p>
          </div>
        ) : (
          filteredArticles.map(art => (
            <div key={art.id} className="bg-white rounded border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all group">
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded text-[10px] font-black bg-slate-900/90 text-white backdrop-blur-xs">
                      {art.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {art.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {art.readTime}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {art.snippet}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between mt-3">
                <button
                  onClick={() => onPreviewArticle ? onPreviewArticle(art) : onNavigate('artikel')}
                  className="text-[11px] font-bold text-slate-600 hover:text-red-600 flex items-center gap-1"
                >
                  <Eye size={12} />
                  <span>Preview Web</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(art)}
                    className="p-1.5 rounded border border-slate-200 hover:bg-blue-50 text-blue-600 hover:border-blue-200 transition-colors"
                    title="Edit Artikel"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(art)}
                    className="p-1.5 rounded border border-slate-200 hover:bg-red-50 text-red-600 hover:border-red-200 transition-colors"
                    title="Hapus Artikel"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-fade-in my-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="font-black text-slate-900 text-base">
                {editingArticle ? 'Edit Artikel' : 'Tulis Artikel Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Judul Artikel *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Contoh: 5 Tanda Aki Mobil Lemah dan Harus Segera Diganti"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-red-500 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Kategori *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-red-500"
                  >
                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Estimasi Waktu Baca</label>
                  <input
                    type="text"
                    value={form.readTime}
                    onChange={e => setForm(p => ({ ...p, readTime: e.target.value }))}
                    placeholder="4 Menit Baca"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">URL Gambar Thumbnail</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-red-500 font-mono text-[11px]"
                />
                
                {/* Quick Preset Images */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400">Pilih Preset Cepat:</span>
                  {PRESET_IMAGES.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, image: p.url }))}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Ringkasan / Snippet Singkat *</label>
                <textarea
                  value={form.snippet}
                  onChange={e => setForm(p => ({ ...p, snippet: e.target.value }))}
                  rows={2}
                  placeholder="Ringkasan 1-2 kalimat yang tampil di kartu artikel..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-red-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Isi Paragraf Konten Lengkap (Pisahkan antar paragraf dengan 1 baris kosong)
                </label>
                <textarea
                  value={form.contentRaw}
                  onChange={e => setForm(p => ({ ...p, contentRaw: e.target.value }))}
                  rows={6}
                  placeholder="Tulis paragraf artikel lengkap di sini. Gunakan spasi enter 2x untuk memisahkan paragraf baru..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Poin Tips / Rekomendasi Penting (Pisahkan dengan baris baru / Enter)
                </label>
                <textarea
                  value={form.tipsRaw}
                  onChange={e => setForm(p => ({ ...p, tipsRaw: e.target.value }))}
                  rows={3}
                  placeholder="Tips 1: Bersihkan kutub aki secara berkala&#10;Tips 2: Periksa voltase aki setiap 3 bulan..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-black rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Menyimpan...' : (editingArticle ? 'Simpan Perubahan' : 'Publikasikan ke Web')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
