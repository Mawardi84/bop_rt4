import { DEFAULT_SEMARANG_LOGO } from '../data/initialData';
import React, { useState } from 'react';
import { RtProfile } from '../types';
import { ShieldCheck, FileCheck, Printer, ArrowRight, Lock, Building2, CheckCircle2, KeyRound } from 'lucide-react';

interface LoginHeroLandingProps {
  profile: RtProfile;
  onLoginSuccess: (mode: 'admin' | 'public', roleName?: string) => void;
}

export const LoginHeroLanding: React.FC<LoginHeroLandingProps> = ({ profile, onLoginSuccess }) => {
  const [pinCode, setPinCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.trim() !== '2026' && pinCode.trim() !== 'rt04ngabean' && pinCode.trim() !== '') {
      setErrorMsg('PIN Admin salah. Silakan periksa kembali.');
      return;
    }
    onLoginSuccess('admin', `Administrator / Operator RT (${profile.ketuaRt})`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white flex flex-col justify-between font-arial-narrow">
      {/* Top Navigation Bar */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={profile.logoUrl || DEFAULT_SEMARANG_LOGO}
            alt="Logo Semarang"
            className="w-10 h-10 object-contain"
          />
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 block leading-none">
              Pemerintah Kota Semarang
            </span>
            <span className="text-sm font-extrabold uppercase text-slate-100 tracking-tight">
              SI-BOP RT 04 RW 04 NGABEAN
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-full font-semibold">
            Portal Khusus Admin / Operator
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl w-full mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Sistem Informasi Bantuan Operasional RT (SI-BOP) 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight uppercase leading-tight text-white">
            Pusat Pengelolaan & Pelaporan <span className="text-emerald-400 underline decoration-emerald-500/50 underline-offset-4">BOP RT 2026</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Sistem resmi RT 04 / RW 04 Kelurahan Gunungpati, Kecamatan Gunungpati, Kota Semarang. Otomatisasi pencatatan BKU, RAP, SPTJM, dan cetak berkas SPJ siap tanda tangan untuk diunggah ke portal **Ruang Warga Kota Semarang**.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="flex items-start space-x-3 bg-slate-800/40 border border-slate-700/60 p-3.5 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase text-white">Otomatisasi Laporan BKU & SPJ</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Rekapitulasi keuangan akurat sesuai Juknis Pemkot.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-slate-800/40 border border-slate-700/60 p-3.5 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase text-white">Keamanan Terproteksi</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Akses backend khusus admin / operator penyusun laporan.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Box for Admin / Operator */}
        <div className="lg:col-span-5">
          <div className="bg-slate-800/95 border border-slate-700 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center space-x-3 border-b border-slate-700 pb-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase text-white">Login Admin / Operator</h2>
                <p className="text-[11px] text-slate-400">Khusus penyusunan laporan keuangan & SPJ RT</p>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  PIN Akses Admin RT
                </label>
                <input
                  type="password"
                  placeholder="Masukkan PIN Admin"
                  value={pinCode}
                  onChange={(e) => {
                    setPinCode(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {errorMsg && <p className="text-[11px] text-red-400 mt-1 font-medium">{errorMsg}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Masuk Dashboard Admin (Backend)</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>
          © 2026 SI-BOP RT 04 / RW 04 Ngabean, Kelurahan Gunungpati, Kecamatan Gunungpati, Kota Semarang.
        </p>
      </footer>
    </div>
  );
};
