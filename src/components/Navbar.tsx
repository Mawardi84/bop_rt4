import React from 'react';
import { ActiveTab, RtProfile } from '../types';
import { LayoutDashboard, Receipt, FileText, FileCheck, FileSpreadsheet, Users, Settings, Building2, ShieldAlert, BookOpen } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profile: RtProfile;
  totalExpense: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  totalExpense,
}) => {
  const remainingBudget = profile.totalPagu - totalExpense;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Pencatatan Kas', icon: Receipt },
    { id: 'reports', label: 'Laporan & SPJ', icon: FileText },
    { id: 'surat', label: 'Surat Permohonan', icon: FileCheck },
    { id: 'rap', label: 'Rencana Anggaran (RAP)', icon: FileSpreadsheet },
    { id: 'pengambilan', label: 'Pengambilan Bulanan', icon: FileCheck },
    { id: 'spj-bulanan', label: 'Pelaporan & Bukti SPJ', icon: FileText },
    { id: 'notulen', label: 'Notulen Rapat & PKK', icon: BookOpen },
    { id: 'musyawarah', label: 'Musyawarah Warga', icon: Users },
    { id: 'settings', label: 'Profil & Pengaturan', icon: Settings },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 text-white p-2.5 rounded-xl shadow-xs flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900">
                  SI-BOP RT <span className="text-red-600">Semarang</span>
                </h1>
                <span className="bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-red-200">
                  RT {profile.rtNumber} / RW {profile.rwNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Kel. {profile.kelurahan}, Kec. {profile.kecamatan} • Tahun {profile.year}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 text-right">
              <div className="text-xs text-slate-500 font-medium">Pagu Dana / Sisa BOP RT</div>
              <div className="text-sm font-bold text-slate-900">
                Rp {remainingBudget.toLocaleString('id-ID')}{' '}
                <span className="text-xs font-normal text-slate-500">
                  (dari Rp {profile.totalPagu.toLocaleString('id-ID')})
                </span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg flex items-center space-x-2 text-amber-800 text-xs max-w-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Dilarang untuk Gaji/Honor Pengurus RT!</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-100 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
