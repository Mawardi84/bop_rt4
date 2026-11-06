import React, { useState, useEffect } from 'react';
import { ActiveTab, Transaction, RtProfile, MusyawarahRecord, RapItem, MonthlySpjRecord, CategoryDefinition } from './types';
import { initialTransactions, initialRtProfile, initialMusyawarah, initialRapItems, initialMonthlySpj, defaultCategories } from './data/initialData';
import { absorbRapToTransactions } from './utils/rapSync';
import { subscribeBopData, saveBopDataToCloud } from './lib/syncService';
import { testConnection } from './lib/firebase';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { ReportGenerator } from './components/ReportGenerator';
import { SuratPencairanGenerator } from './components/SuratPencairanGenerator';
import { RapManager } from './components/RapManager';
import { PengambilanBulananGenerator } from './components/PengambilanBulananGenerator';
import { MonthlySpjManager } from './components/MonthlySpjManager';
import { NotulenGenerator } from './components/NotulenGenerator';
import { MusyawarahManager } from './components/MusyawarahManager';
import { SettingsModal } from './components/SettingsModal';
import { BaKesepakatanManager } from './components/BaKesepakatanManager';
import { SptjmGenerator } from './components/SptjmGenerator';
import { LoginHeroLanding } from './components/LoginHeroLanding';

export default function App() {
  const [authRole, setAuthRole] = useState<'admin' | 'public' | null>(() => {
    if (window.location.hash === '#warga') {
      return 'public';
    }
    return null;
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Load from localStorage or defaults
  const [profile, setProfile] = useState<RtProfile>(() => {
    const saved = localStorage.getItem('bop_rt_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If logoUrl is the old broken/external URL or empty, replace with clean local logo
        if (!parsed.logoUrl || parsed.logoUrl.includes('Coat_of_arms_of_Semarang.svg')) {
          parsed.logoUrl = initialRtProfile.logoUrl;
        }
        return parsed;
      } catch {
        return initialRtProfile;
      }
    }
    return initialRtProfile;
  });

  const [categories, setCategories] = useState<CategoryDefinition[]>(() => {
    const saved = localStorage.getItem('bop_rt_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultCategories;
      }
    }
    return defaultCategories;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('bop_rt_transactions');
    if (saved) {
      try {
        const parsed: Transaction[] = JSON.parse(saved);
        // Clean up any future unrealized September-December expenses and absorb Jan-Aug
        return absorbRapToTransactions(initialRapItems, parsed, 8);
      } catch {
        return initialTransactions;
      }
    }
    return initialTransactions;
  });

  const [musyawarahRecords, setMusyawarahRecords] = useState<MusyawarahRecord[]>(() => {
    const saved = localStorage.getItem('bop_rt_musyawarah');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialMusyawarah;
      }
    }
    return initialMusyawarah;
  });

  const [rapItems, setRapItems] = useState<RapItem[]>(() => {
    const saved = localStorage.getItem('bop_rt_rap');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialRapItems;
      }
    }
    return initialRapItems;
  });

  const [spjRecords, setSpjRecords] = useState<MonthlySpjRecord[]>(() => {
    const saved = localStorage.getItem('bop_rt_spj');
    if (saved) {
      try {
        const parsed: MonthlySpjRecord[] = JSON.parse(saved);
        // Ensure all default 8 months from initialMonthlySpj are present
        const merged = [...parsed];
        for (const item of initialMonthlySpj) {
          if (!merged.some((m) => m.month.toLowerCase() === item.month.toLowerCase())) {
            merged.push(item);
          }
        }
        return merged;
      } catch {
        return initialMonthlySpj;
      }
    }
    return initialMonthlySpj;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('syncing');

  // Test Firestore connection on boot
  useEffect(() => {
    testConnection().then((connected) => {
      setSyncStatus(connected ? 'synced' : 'offline');
    });

    // Cleanup transactions on boot to remove any duplicates or future unrealized items
    setTransactions((prev) => {
      const cleaned = absorbRapToTransactions(initialRapItems, prev, 8);
      if (cleaned.length !== prev.length || JSON.stringify(cleaned) !== JSON.stringify(prev)) {
        persistToCloud({ transactions: cleaned });
      }
      return cleaned;
    });
  }, []);

  // Real-time Firestore Sync (Listen for Cloud Changes across devices)
  useEffect(() => {
    const unsubscribe = subscribeBopData((cloudData) => {
      if (cloudData.profile) setProfile(cloudData.profile);
      if (cloudData.transactions && cloudData.transactions.length > 0) {
        const cleaned = absorbRapToTransactions(initialRapItems, cloudData.transactions, 8);
        setTransactions(cleaned);
      }
      if (cloudData.categories) setCategories(cloudData.categories);
      if (cloudData.rapItems) setRapItems(cloudData.rapItems);
      if (cloudData.spjRecords) setSpjRecords(cloudData.spjRecords);
      if (cloudData.musyawarahRecords) setMusyawarahRecords(cloudData.musyawarahRecords);
      setSyncStatus('synced');
    }, () => {
      setSyncStatus('offline');
    });

    return () => unsubscribe();
  }, []);

  // Sync to localStorage as offline fast cache + debounced sync to Firestore
  useEffect(() => {
    localStorage.setItem('bop_rt_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('bop_rt_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('bop_rt_musyawarah', JSON.stringify(musyawarahRecords));
  }, [musyawarahRecords]);

  useEffect(() => {
    localStorage.setItem('bop_rt_rap', JSON.stringify(rapItems));
  }, [rapItems]);

  useEffect(() => {
    localStorage.setItem('bop_rt_spj', JSON.stringify(spjRecords));
  }, [spjRecords]);

  useEffect(() => {
    localStorage.setItem('bop_rt_categories', JSON.stringify(categories));
  }, [categories]);

  // Push updates to Firestore Cloud when admin performs any write/edit
  const persistToCloud = (updates: {
    profile?: RtProfile;
    transactions?: Transaction[];
    categories?: CategoryDefinition[];
    rapItems?: RapItem[];
    spjRecords?: MonthlySpjRecord[];
    musyawarahRecords?: MusyawarahRecord[];
  }) => {
    setSyncStatus('syncing');
    saveBopDataToCloud(updates)
      .then(() => setSyncStatus('synced'))
      .catch(() => setSyncStatus('offline'));
  };

  const handleAddCategory = (newCat: CategoryDefinition) => {
    setCategories((prev) => {
      if (prev.some((c) => c.id === newCat.id)) return prev;
      const updated = [...prev, newCat];
      persistToCloud({ categories: updated });
      return updated;
    });
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== catId);
      persistToCloud({ categories: updated });
      return updated;
    });
  };

  const handleSaveTransaction = (tx: Transaction) => {
    if (!guardAdminAction()) return;
    setTransactions((prev) => {
      const exists = prev.some((t) => t.id === tx.id);
      const updated = exists ? prev.map((t) => (t.id === tx.id ? tx : t)) : [tx, ...prev];
      persistToCloud({ transactions: updated });
      return updated;
    });
  };

  const handleDeleteTransaction = (id: string) => {
    if (!guardAdminAction()) return;
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      setTransactions((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        persistToCloud({ transactions: updated });
        return updated;
      });
    }
  };

  const handleEditTransaction = (tx: Transaction) => {
    if (!guardAdminAction()) return;
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleAddMusyawarah = (rec: MusyawarahRecord) => {
    if (!guardAdminAction()) return;
    setMusyawarahRecords((prev) => {
      const updated = [rec, ...prev];
      persistToCloud({ musyawarahRecords: updated });
      return updated;
    });
  };

  const handleUpdateRap = (items: RapItem[]) => {
    if (!guardAdminAction()) return;
    setRapItems(items);
    persistToCloud({ rapItems: items });
  };

  const handleAbsorbRapToTransactions = () => {
    if (!guardAdminAction()) return;
    const updated = absorbRapToTransactions(rapItems, transactions, 8);
    setTransactions(updated);
    persistToCloud({ transactions: updated });
    alert('⚡ Rincian Rencana Anggaran Penggunaan (RAP) periode Januari s/d Agustus (8 bulan) telah diserap otomatis ke dalam Pencatatan Transaksi Kas Keluar!\n\n(Catatan: Alokasi September - Desember belum diserap karena belum terealisasi).');
  };

  const handleUpdateProfile = (newProfile: RtProfile) => {
    if (!guardAdminAction()) return;
    setProfile(newProfile);
    persistToCloud({ profile: newProfile });
  };

  const handleUpdateSpj = (newSpj: MonthlySpjRecord[]) => {
    if (!guardAdminAction()) return;
    setSpjRecords(newSpj);
    persistToCloud({ spjRecords: newSpj });
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  // Guard helper for public mode
  const guardAdminAction = (): boolean => {
    if (authRole === 'public') {
      alert('Akses Terbatas: Anda berada dalam Mode Warga (Lihat Laporan Saja). Hanya Admin / Operator RT yang berhak menambah atau mengubah data.');
      return false;
    }
    return true;
  };

  if (!authRole) {
    return (
      <LoginHeroLanding
        profile={profile}
        onLoginSuccess={(mode) => {
          setAuthRole(mode);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-arial-narrow antialiased text-slate-800">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        totalExpense={totalExpense}
        onLogout={() => {
          window.location.hash = '';
          setAuthRole(null);
        }}
        authRole={authRole}
        syncStatus={syncStatus}
      />

      <div className="flex-1 md:pl-72 flex flex-col print:pl-0 print:m-0">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none print:w-full">
        {activeTab === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            profile={profile}
            rapItems={rapItems}
            onNavigate={setActiveTab}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {activeTab === 'ba-kesepakatan' && (
          <BaKesepakatanManager
            profile={profile}
            records={musyawarahRecords}
            onAddRecord={handleAddMusyawarah}
          />
        )}

        {activeTab === 'rap' && (
          <RapManager
            rapItems={rapItems}
            onUpdateRap={handleUpdateRap}
            profile={profile}
            onAbsorbRapToTransactions={handleAbsorbRapToTransactions}
          />
        )}

        {activeTab === 'sptjm' && (
          <SptjmGenerator profile={profile} />
        )}

        {activeTab === 'surat' && (
          <SuratPencairanGenerator profile={profile} rapItems={rapItems} />
        )}

        {activeTab === 'pengambilan' && (
          <PengambilanBulananGenerator
            profile={profile}
            rapItems={rapItems}
            onRecordIncome={handleSaveTransaction}
            onNavigateToTransactions={() => setActiveTab('transactions')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            onAddTransaction={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onAbsorbRapToTransactions={handleAbsorbRapToTransactions}
          />
        )}

        {activeTab === 'reports' && (
          <ReportGenerator
            transactions={transactions}
            profile={profile}
            categories={categories}
            onAbsorbRapToTransactions={handleAbsorbRapToTransactions}
          />
        )}

        {activeTab === 'spj-bulanan' && (
          <MonthlySpjManager
            profile={profile}
            rapItems={rapItems}
            spjRecords={spjRecords}
            transactions={transactions}
            onSaveSpj={handleUpdateSpj}
            onNavigateToNotulen={() => setActiveTab('notulen')}
            onAbsorbRapToTransactions={handleAbsorbRapToTransactions}
          />
        )}

        {activeTab === 'notulen' && (
          <NotulenGenerator profile={profile} />
        )}

        {activeTab === 'musyawarah' && (
          <MusyawarahManager
            records={musyawarahRecords}
            onAddRecord={handleAddMusyawarah}
            profile={profile}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModal profile={profile} onUpdateProfile={handleUpdateProfile} />
        )}
        </main>
      </div>

      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editData={editingTransaction}
        categories={categories}
        onAddCategory={handleAddCategory}
        currentBalance={currentBalance}
      />

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-[11px] text-slate-400 print:hidden mt-auto">
        <p className="font-medium">
          SI-BOP RT Kota Semarang • Sistem Pelaporan Mandiri & Transparan Berdasarkan Juknis APBD © {profile.year}
        </p>
      </footer>
    </div>
  );
}
