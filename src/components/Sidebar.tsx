import { DEFAULT_SEMARANG_LOGO } from '../data/initialData';
import React, { useState } from 'react';
import { ActiveTab, RtProfile } from '../types';
import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  FileCheck, 
  FileSpreadsheet, 
  Users, 
  Settings, 
  Building2, 
  ShieldAlert, 
  BookOpen, 
  Menu, 
  X,
  ChevronRight,
  ExternalLink,
  Printer
} from 'lucide-react';
import { isInIframe, openInNewTab } from '../utils/printHelper';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profile: RtProfile;
  totalExpense: number;
  onLogout?: () => void;
  authRole?: 'admin' | 'public';
  syncStatus?: 'synced' | 'syncing' | 'offline';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  totalExpense,
  onLogout,
  authRole = 'admin',
  syncStatus = 'synced',
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const remainingBudget = profile.totalPagu - totalExpense;

  const navGroups = [
    {
      title: 'Utama',
      items: [{ id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard }],
    },
    {
      title: 'Perencanaan',
      items: [
        { id: 'ba-kesepakatan', label: 'BA Kesepakatan Anggaran', icon: FileText },
        { id: 'rap', label: 'Rincian RAP (12 Bulan)', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'Pencairan Dana',
      items: [
        { id: 'sptjm', label: 'Surat Pernyataan (SPTJM)', icon: ShieldAlert },
        { id: 'surat', label: 'Surat Permohonan Pencairan', icon: FileCheck },
        { id: 'pengambilan', label: 'Pengambilan Bulanan', icon: FileCheck },
      ],
    },
    {
      title: 'Penatausahaan',
      items: [
        { id: 'transactions', label: 'Pencatatan Kas (BKU)', icon: Receipt },
        { id: 'musyawarah', label: 'Musyawarah Warga', icon: Users },
      ],
    },
    {
      title: 'Pelaporan & SPJ',
      items: [
        { id: 'reports', label: 'Laporan Buku Kas Umum', icon: FileText },
        { id: 'spj-bulanan', label: 'Bukti Fisik SPJ Bulanan', icon: FileText },
        { id: 'notulen', label: 'Undangan & Notulen', icon: BookOpen },
      ],
    },
    {
      title: 'Lainnya',
      items: [{ id: 'settings', label: 'Profil & Pengaturan', icon: Settings }],
    },
  ];

  return (
    <>
      {/* Mobile / Top Toggle Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3.5">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all md:hidden"
                aria-label="Toggle Menu"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="w-10 h-10 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center justify-center shrink-0">
                <img
                  src={profile.logoUrl || DEFAULT_SEMARANG_LOGO}
                  alt="Logo Kota Semarang"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900">
                    SI-BOP RT <span className="text-red-600">Semarang</span>
                  </h1>
                  <span className="bg-red-50 text-red-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-red-200">
                    RT {profile.rtNumber} / RW {profile.rwNumber}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Kel. {profile.kelurahan}, Kec. {profile.kecamatan} • Tahun {profile.year}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={openInNewTab}
                title="Buka aplikasi di Tab Baru Browser untuk mencetak dengan lancar (tanpa batasan preview/iframe)"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition-all shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Buka Tab Baru (Cetak Lancar)</span>
                <span className="sm:hidden">Tab Baru</span>
              </button>

              <div className="hidden lg:flex items-center space-x-4">
                <div className="bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200 text-right">
                  <div className="text-[11px] text-slate-500 font-medium">Sisa / Pagu Dana BOP RT</div>
                  <div className="text-xs font-bold text-slate-900">
                    Rp {remainingBudget.toLocaleString('id-ID')}{' '}
                    <span className="text-[10px] font-normal text-slate-500">
                      (dari Rp {profile.totalPagu.toLocaleString('id-ID')})
                    </span>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-amber-800 text-[11px]">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>Dilarang untuk Gaji/Honor Pengurus!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-[57px] md:top-[65px] h-[calc(100vh-57px)] md:h-[calc(100vh-65px)] w-72 bg-white border-r border-slate-200 z-30 transition-transform duration-300 ease-in-out flex flex-col print:hidden ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header / Toggle */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
            Menu Navigasi Utama
          </span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Items List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h4 className="px-3.5 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {group.title}
              </h4>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as ActiveTab);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-red-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
          {/* Cloud Database Sync Indicator */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px]">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-500 animate-pulse' : syncStatus === 'syncing' ? 'bg-amber-500 animate-spin' : 'bg-slate-400'}`}></span>
              Cloud Database
            </span>
            <span className={`font-bold ${syncStatus === 'synced' ? 'text-emerald-700' : syncStatus === 'syncing' ? 'text-amber-700' : 'text-slate-600'}`}>
              {syncStatus === 'synced' ? 'Terhubung (Online)' : syncStatus === 'syncing' ? 'Menyinkronkan...' : 'Offline (Cache)'}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                {authRole === 'admin' ? '🛡️ Admin / Operator' : '👁️ Mode Warga (Lihat)'}
              </span>
              <span className="text-[10px] text-slate-400">© {profile.year}</span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-1">{profile.ketuaRt} (Ketua RT)</div>
          </div>
          {authRole === 'admin' && (
            <button
              onClick={() => {
                const wargaUrl = window.location.origin + window.location.pathname + '#warga';
                navigator.clipboard.writeText(wargaUrl);
                alert('Tautan Mode Warga (Frontend) berhasil disalin ke clipboard! Silakan bagikan ke grup WhatsApp warga.');
              }}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold py-1.5 px-3 rounded-lg text-xs transition-all flex items-center justify-center space-x-1"
            >
              <span>🔗 Salin Link Warga</span>
            </button>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-1.5 px-3 rounded-lg text-xs transition-all flex items-center justify-center space-x-1"
            >
              <span>{authRole === 'admin' ? 'Keluar (Logout Admin)' : '← Kembali ke Beranda Landing'}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
