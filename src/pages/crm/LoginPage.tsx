import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Lock, Mail, Eye, EyeOff, Wrench } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Email atau password tidak valid. Silakan coba lagi.');
      } else if (code === 'auth/too-many-requests') {
        setError('Terlalu banyak percobaan login. Coba lagi beberapa saat.');
      } else if (code === 'auth/network-request-failed') {
        setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[55%] bg-slate-900 flex-col relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-red-500 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500 blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col h-full px-14 py-12">
          <div>
            <img src="/logo-putih.png" alt="FHRCAR" className="h-12 w-auto object-contain" />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-semibold tracking-wider uppercase border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Sistem Aktif
              </span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              Kelola Bengkel<br />
              <span className="text-red-400">Panggilan 24 Jam</span><br />
              Lebih Efisien
            </h1>
            <p className="mt-5 text-slate-400 text-base leading-relaxed max-w-md">
              Platform manajemen terpadu untuk bengkel home service & panggilan. Pantau pesanan, mekanik, dan pelanggan dari satu dasbor.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
                { val: '6+', label: 'Modul Terintegrasi' },
                { val: '24/7', label: 'Monitoring Real-time' },
                { val: '100%', label: 'Berbasis Cloud' },
              ].map((s) => (
                <div key={s.label} className="border-l-2 border-red-500 pl-4">
                  <p className="text-2xl font-black text-white">{s.val}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500 text-xs">
            <Wrench size={14} />
            <span>FHRCAR Auto Services © 2026 — Bengkel Panggilan Profesional</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden mb-8 flex justify-center">
            <img src="/logo.png" alt="FHRCAR" className="h-14 w-auto object-contain" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900">Selamat Datang</h2>
            <p className="text-slate-500 text-sm mt-1">Masuk ke panel manajemen FHRCAR CRM</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <form className="space-y-5" onSubmit={handleLogin}>
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <span className="text-base leading-tight">⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
                    placeholder="admin@fhrcar.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input id="remember" type="checkbox" className="w-4 h-4 rounded accent-red-600" />
                <label htmlFor="remember" className="text-sm text-slate-600">Ingat saya di perangkat ini</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all
                  ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:scale-[0.98]'}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Memverifikasi...
                  </>
                ) : 'Masuk ke Dashboard'}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-slate-500 hover:text-red-600 font-medium transition-colors">
              ← Kembali ke Website FHRCAR
            </a>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Gunakan akun yang telah didaftarkan di Firebase Authentication
          </p>
        </div>
      </div>
    </div>
  );
}
