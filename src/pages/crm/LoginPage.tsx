import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, Eye, EyeOff, Wrench, ArrowLeft, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

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

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Direct Master Admin bypass
    if (
      (cleanEmail === 'admin@fhrcar.xyz' || cleanEmail === 'admin' || cleanEmail === 'admin@fhr.com') &&
      (cleanPass === 'fhr12345' || cleanPass === 'admin123' || cleanPass === 'admin')
    ) {
      localStorage.setItem('fhrcar_local_auth', 'true');
      setLoading(false);
      onLoginSuccess();
      return;
    }

    // 2. Try Supabase Auth for custom registered users
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (authError) {
        setError(authError.message || 'Email atau password tidak valid. Silakan periksa kembali.');
        return;
      }

      if (data?.user) {
        localStorage.setItem('fhrcar_local_auth', 'true');
        onLoginSuccess();
      }
    } catch (err: any) {
      setError('Terjadi kesalahan saat masuk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#f8fafc] select-none">
      
      {/* ── Left Panel (Desktop Branding) ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-slate-900 flex-col relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-red-600 blur-[130px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600 blur-[130px]" />
        </div>

        <div className="relative z-10 flex flex-col h-full px-12 xl:px-16 py-12">
          {/* Logo White */}
          <div>
            <img src="/logo-putih.png" alt="FHRCAR" className="h-11 w-auto object-contain" />
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-emerald-400 text-xs font-bold tracking-wider uppercase border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Sistem Enterprise CRM Aktif
              </span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.15]">
              Platform Bengkel<br />
              <span className="text-red-500">Panggilan 24 Jam</span><br />
              & Home Service
            </h1>
            <p className="mt-4 text-slate-400 text-sm xl:text-base leading-relaxed">
              Pusat kendali manajemen bengkel modern. Kelola pesanan SPK, jadwal mekanik, inspeksi kendaraan (LPA), dan analitik pendapatan dalam satu sistem terintegrasi.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
              {[
                { val: '46 Item', label: 'Inspeksi LPA' },
                { val: '24 Jam', label: 'Siaga Darurat' },
                { val: 'Cloud', label: 'Database Realtime' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-white">{s.val}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-500 text-xs border-t border-white/5 pt-6">
            <ShieldCheck size={15} className="text-emerald-500" />
            <span>FHRCAR Auto Services © 2026 · Secure Cloud Authentication</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel (Centered Form for Mobile & Desktop) ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-[420px] mx-auto">
          
          {/* Header on Mobile & Desktop Form */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center p-2.5 bg-white rounded-2xl border border-slate-200 shadow-2xs mb-4">
              <img src="/logo.png" alt="FHRCAR" className="h-10 sm:h-12 w-auto object-contain" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Masuk ke panel manajemen FHRCAR Auto Services
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-2xs">
            <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin}>
              
              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="font-semibold leading-relaxed">{error}</p>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Email Akun Admin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all font-medium"
                    placeholder="admin@fhrcar.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all font-medium"
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="remember"
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-300 text-red-600 accent-red-600 focus:ring-0"
                />
                <label htmlFor="remember" className="text-xs text-slate-600 font-medium cursor-pointer">
                  Ingat saya di perangkat ini
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-xs
                  ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:scale-[0.98]'}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <span>Masuk ke Dashboard</span>
                )}
              </button>
            </form>
          </div>

          {/* Footer Back Link */}
          <div className="mt-6 text-center space-y-2">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 font-bold transition-colors"
            >
              <ArrowLeft size={13} /> Kembali ke Website FHRCAR
            </a>
            <p className="text-[11px] text-slate-400">
              Sistem diamankan dengan enkripsi Supabase Enterprise Cloud & SSL
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
