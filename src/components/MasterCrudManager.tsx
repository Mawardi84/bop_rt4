import React, { useState } from 'react';
import { 
  Transaction, 
  SpkRecord, 
  HonorReceipt, 
  RapItem, 
  MusyawarahRecord, 
  MonthlySpjRecord,
  RtProfile,
  CategoryDefinition
} from '../types';
import { 
  Database, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Filter, 
  Download, 
  FileText, 
  Briefcase, 
  Receipt, 
  Users, 
  FileSpreadsheet, 
  CheckCircle2,
  X
} from 'lucide-react';

interface MasterCrudManagerProps {
  profile: RtProfile;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  spkRecords: SpkRecord[];
  setSpkRecords: React.Dispatch<React.SetStateAction<SpkRecord[]>>;
  honorReceipts: HonorReceipt[];
  setHonorReceipts: React.Dispatch<React.SetStateAction<HonorReceipt[]>>;
  rapItems: RapItem[];
  setRapItems: React.Dispatch<React.SetStateAction<RapItem[]>>;
  musyawarahRecords: MusyawarahRecord[];
  setMusyawarahRecords: React.Dispatch<React.SetStateAction<MusyawarahRecord[]>>;
  spjRecords: MonthlySpjRecord[];
  setSpjRecords: React.Dispatch<React.SetStateAction<MonthlySpjRecord[]>>;
  categories: CategoryDefinition[];
}

export const MasterCrudManager: React.FC<MasterCrudManagerProps> = ({
  profile,
  transactions,
  setTransactions,
  spkRecords,
  setSpkRecords,
  honorReceipts,
  setHonorReceipts,
  rapItems,
  setRapItems,
  musyawarahRecords,
  setMusyawarahRecords,
  spjRecords,
  setSpjRecords,
  categories
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'transactions' | 'spk' | 'honor' | 'rap' | 'musyawarah' | 'spj'>('transactions');
  const [selectedYear, setSelectedYear] = useState<string>(String(profile.year || 2026));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingItemType, setEditingItemType] = useState<'transactions' | 'spk' | 'honor' | 'rap' | 'musyawarah' | 'spj' | null>(null);
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);

  // Years available
  const availableYears = ['2024', '2025', '2026', '2027', '2028', 'Semua Tahun'];

  // Filter functions based on selectedYear and searchQuery
  const filteredTransactions = transactions.filter(t => {
    const yearMatch = selectedYear === 'Semua Tahun' || t.date.startsWith(selectedYear);
    const queryMatch = searchQuery === '' || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.recipientOrDonor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return yearMatch && queryMatch;
  });

  const filteredSpk = spkRecords.filter(s => {
    const yearMatch = selectedYear === 'Semua Tahun' || s.date.startsWith(selectedYear);
    const queryMatch = searchQuery === '' ||
      s.spkNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.workDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contractorAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return yearMatch && queryMatch;
  });

  const filteredHonor = honorReceipts.filter(h => {
    const yearMatch = selectedYear === 'Semua Tahun' || String(h.year) === selectedYear || h.date.startsWith(selectedYear);
    const queryMatch = searchQuery === '' ||
      h.activityName.toLowerCase().includes(searchQuery.toLowerCase());
    return yearMatch && queryMatch;
  });

  const filteredRap = rapItems.filter(r => {
    const queryMatch = searchQuery === '' ||
      r.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    return queryMatch; // RAP is 12-month schedule
  });

  const filteredMusyawarah = musyawarahRecords.filter(m => {
    const yearMatch = selectedYear === 'Semua Tahun' || m.date.startsWith(selectedYear);
    const queryMatch = searchQuery === '' ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.agenda.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.leader.toLowerCase().includes(searchQuery.toLowerCase());
    return yearMatch && queryMatch;
  });

  const filteredSpj = spjRecords.filter(s => {
    const yearMatch = selectedYear === 'Semua Tahun' || String(s.year) === selectedYear;
    const queryMatch = searchQuery === '' ||
      s.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.notulenRt.toLowerCase().includes(searchQuery.toLowerCase());
    return yearMatch && queryMatch;
  });

  // Delete handlers
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Hapus pencatatan transaksi ini?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleDeleteSpk = (id: string) => {
    if (window.confirm('Hapus data SPK ini?')) {
      setSpkRecords(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleDeleteHonor = (id: string) => {
    if (window.confirm('Hapus tanda terima honor ini?')) {
      setHonorReceipts(prev => prev.filter(h => h.id !== id));
    }
  };

  const handleDeleteRap = (id: string) => {
    if (window.confirm('Hapus item RAP ini?')) {
      setRapItems(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleDeleteMusyawarah = (id: string) => {
    if (window.confirm('Hapus catatan musyawarah ini?')) {
      setMusyawarahRecords(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleDeleteSpj = (id: string) => {
    if (window.confirm('Hapus SPJ bulanan ini?')) {
      setSpjRecords(prev => prev.filter(s => s.id !== id));
    }
  };

  // Open Add modal
  const handleOpenAdd = (type: 'transactions' | 'spk' | 'honor' | 'rap' | 'musyawarah' | 'spj') => {
    setEditingItemType(type);
    setModalMode('add');
    if (type === 'transactions') {
      setCurrentEditItem({
        id: 'trx-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: 'kebersihan',
        description: '',
        amount: 0,
        recipientOrDonor: '',
        hasMusyawarah: true,
        documentNumber: ''
      });
    } else if (type === 'spk') {
      setCurrentEditItem({
        id: 'spk-' + Date.now(),
        spkNumber: `00${spkRecords.length + 1}/SPK-RT04/IX/${profile.year}`,
        date: new Date().toISOString().split('T')[0],
        contractorAddress: 'Ngabean, Gunungpati, Semarang',
        workDescription: 'Pekerjaan Kebersihan & Pemeliharaan Lingkungan RT 04',
        workLocation: 'Wilayah RT 04 RW 04 Ngabean',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7*86400000).toISOString().split('T')[0],
        costPerWorker: 150000,
        firstPartyName: profile.ketuaRt,
        secondPartyName: 'Mandor / Perwakilan Warga',
        workers: ['Warga 1', 'Warga 2', 'Warga 3'],
        reportProgress: 100,
        reportSecretaryName: profile.sekretaris
      });
    } else if (type === 'honor') {
      setCurrentEditItem({
        id: 'honor-' + Date.now(),
        activityName: 'Pengelolaan & Pelayanan Administrasi RT 04',
        date: new Date().toISOString().split('T')[0],
        year: Number(profile.year || 2026),
        firstPartyName: profile.ketuaRt,
        secondPartyName: profile.bendaharaRt,
        items: [
          { id: 'hi-1', name: profile.ketuaRt, position: 'Ketua RT 04', qty: 1, unit: 'Bulan', pricePerUnit: 250000, total: 250000 },
          { id: 'hi-2', name: profile.sekretaris, position: 'Sekretaris RT 04', qty: 1, unit: 'Bulan', pricePerUnit: 200000, total: 200000 },
          { id: 'hi-3', name: profile.bendaharaRt, position: 'Bendahara RT 04', qty: 1, unit: 'Bulan', pricePerUnit: 200000, total: 200000 }
        ]
      });
    } else if (type === 'rap') {
      setCurrentEditItem({
        id: 'rap-' + Date.now(),
        month: 'Januari',
        monthNumber: 1,
        category: 'kebersihan',
        description: 'Kerjabakti & Pengangkutan Sampah',
        qty: 4,
        unit: 'Kali',
        price: 150000,
        total: 600000
      });
    } else if (type === 'musyawarah') {
      setCurrentEditItem({
        id: 'mus-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        title: 'Musyawarah Bulanan Warga RT 04 / RW 04',
        participantCount: 30,
        agenda: 'Evaluasi kegiatan kebersihan dan pemanfaatan dana BOP RT',
        decisions: 'Mufakat untuk melaksanakan pengecoran jalan lingkungan dan gotong royong.',
        leader: profile.ketuaRt,
        secretary: profile.sekretaris
      });
    } else if (type === 'spj') {
      setCurrentEditItem({
        id: 'spj-' + Date.now(),
        month: 'Oktober',
        year: Number(profile.year || 2026),
        notulenRt: 'Notulen rapat RT telah disetujui bersama.',
        notulenPkk: 'Rapat PKK berjalan lancar.',
        attendanceCount: 28,
        attendanceNotes: 'Daftar hadir lengkap dilampirkan.',
        meetingPhotoUrl: '',
        itemPhotoUrl: '',
        receiptPhotoUrl: ''
      });
    }
  };

  // Open Edit modal
  const handleOpenEdit = (type: 'transactions' | 'spk' | 'honor' | 'rap' | 'musyawarah' | 'spj', item: any) => {
    setEditingItemType(type);
    setModalMode('edit');
    setCurrentEditItem(JSON.parse(JSON.stringify(item)));
  };

  // Save Modal Item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemType || !currentEditItem) return;

    if (editingItemType === 'transactions') {
      if (modalMode === 'add') {
        setTransactions(prev => [currentEditItem, ...prev]);
      } else {
        setTransactions(prev => prev.map(t => t.id === currentEditItem.id ? currentEditItem : t));
      }
    } else if (editingItemType === 'spk') {
      if (modalMode === 'add') {
        setSpkRecords(prev => [currentEditItem, ...prev]);
      } else {
        setSpkRecords(prev => prev.map(s => s.id === currentEditItem.id ? currentEditItem : s));
      }
    } else if (editingItemType === 'honor') {
      if (modalMode === 'add') {
        setHonorReceipts(prev => [currentEditItem, ...prev]);
      } else {
        setHonorReceipts(prev => prev.map(h => h.id === currentEditItem.id ? currentEditItem : h));
      }
    } else if (editingItemType === 'rap') {
      if (modalMode === 'add') {
        setRapItems(prev => [currentEditItem, ...prev]);
      } else {
        setRapItems(prev => prev.map(r => r.id === currentEditItem.id ? currentEditItem : r));
      }
    } else if (editingItemType === 'musyawarah') {
      if (modalMode === 'add') {
        setMusyawarahRecords(prev => [currentEditItem, ...prev]);
      } else {
        setMusyawarahRecords(prev => prev.map(m => m.id === currentEditItem.id ? currentEditItem : m));
      }
    } else if (editingItemType === 'spj') {
      if (modalMode === 'add') {
        setSpjRecords(prev => [currentEditItem, ...prev]);
      } else {
        setSpjRecords(prev => prev.map(s => s.id === currentEditItem.id ? currentEditItem : s));
      }
    }

    setModalMode(null);
    setEditingItemType(null);
    setCurrentEditItem(null);
  };

  return (
    <div className="space-y-6 pb-12 print:hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-800 to-red-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
          <Database className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-2">
            <span className="bg-red-600/60 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-red-500/40">
              Master Data & CRUD System
            </span>
            <span className="bg-white/10 text-slate-200 text-xs px-3 py-1 rounded-full">
              RT {profile.rtNumber} / RW {profile.rwNumber} • {profile.kelurahan}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pusat Pengelolaan Data & Filter Tahun Anggaran
          </h1>
          <p className="text-red-100 text-sm max-w-2xl mt-1">
            Kelola, tambah, ubah, dan hapus seluruh basis data sistem (Transaksi Kas, SPK, Tanda Terima Honor, RAP, Musyawarah Warga, dan SPJ Bulanan) dengan filter tahun yang fleksibel.
          </p>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Entity Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'transactions', label: 'Kas BKU', count: filteredTransactions.length, icon: Receipt },
            { id: 'spk', label: 'SPK', count: filteredSpk.length, icon: Briefcase },
            { id: 'honor', label: 'Honor', count: filteredHonor.length, icon: FileText },
            { id: 'rap', label: 'RAP', count: filteredRap.length, icon: FileSpreadsheet },
            { id: 'musyawarah', label: 'Musyawarah', count: filteredMusyawarah.length, icon: Users },
            { id: 'spj', label: 'SPJ Bulanan', count: filteredSpj.length, icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-red-700 text-white shadow-md shadow-red-700/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-red-900 text-white' : 'bg-slate-200 text-slate-800'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Year Filter & Search */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="relative flex-1 md:w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleOpenAdd(activeSubTab)}
            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Baru</span>
          </button>
        </div>
      </div>

      {/* Tables Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* TRANSACTIONS TABLE */}
        {activeSubTab === 'transactions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Jenis</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Uraian / Keterangan</th>
                  <th className="p-4">Pemberi / Penerima</th>
                  <th className="p-4 text-right">Jumlah (Rp)</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Tidak ada data transaksi ditemukan untuk tahun {selectedYear}.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-800 whitespace-nowrap">{t.date}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${t.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {t.type === 'income' ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-700 capitalize">{t.category.replace('_', ' ')}</td>
                      <td className="p-4 text-slate-900 max-w-xs truncate">{t.description}</td>
                      <td className="p-4 text-slate-600">{t.recipientOrDonor}</td>
                      <td className={`p-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit('transactions', t)}
                          className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* SPK TABLE */}
        {activeSubTab === 'spk' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="p-4">No. SPK</th>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Uraian Pekerjaan</th>
                  <th className="p-4">Lokasi</th>
                  <th className="p-4">Pihak Kedua / Mandor</th>
                  <th className="p-4 text-center">Pekerja</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSpk.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Tidak ada data SPK ditemukan untuk tahun {selectedYear}.
                    </td>
                  </tr>
                ) : (
                  filteredSpk.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{s.spkNumber}</td>
                      <td className="p-4 text-slate-600">{s.date}</td>
                      <td className="p-4 font-medium text-slate-800 max-w-xs truncate">{s.workDescription}</td>
                      <td className="p-4 text-slate-600">{s.workLocation}</td>
                      <td className="p-4 text-slate-700 font-medium">{s.secondPartyName}</td>
                      <td className="p-4 text-center">
                        <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full text-[10px]">
                          {s.workers.length} Orang
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit('spk', s)}
                          className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSpk(s.id)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* HONOR RECEIPTS TABLE */}
        {activeSubTab === 'honor' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="p-4">Nama Kegiatan</th>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Tahun</th>
                  <th className="p-4 text-center">Jumlah Penerima</th>
                  <th className="p-4 text-right">Total Honor (Rp)</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHonor.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Tidak ada data Tanda Terima Honor ditemukan untuk tahun {selectedYear}.
                    </td>
                  </tr>
                ) : (
                  filteredHonor.map((h) => {
                    const totalSum = h.items.reduce((acc, item) => acc + item.total, 0);
                    return (
                      <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{h.activityName}</td>
                        <td className="p-4 text-slate-600">{h.date}</td>
                        <td className="p-4 text-slate-600">{h.year}</td>
                        <td className="p-4 text-center">
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                            {h.items.length} Orang
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-slate-900">
                          Rp {totalSum.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit('honor', h)}
                            className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteHonor(h.id)}
                            className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* RAP TABLE */}
        {activeSubTab === 'rap' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="p-4">Bulan</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Uraian Kegiatan</th>
                  <th className="p-4 text-center">Volume</th>
                  <th className="p-4 text-right">Harga Satuan (Rp)</th>
                  <th className="p-4 text-right">Jumlah (Rp)</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRap.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Tidak ada item RAP ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredRap.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{r.month}</td>
                      <td className="p-4 capitalize text-slate-600">{r.category.replace('_', ' ')}</td>
                      <td className="p-4 font-medium text-slate-900 max-w-xs truncate">{r.description}</td>
                      <td className="p-4 text-center text-slate-700">{r.qty} {r.unit}</td>
                      <td className="p-4 text-right text-slate-600">Rp {r.price.toLocaleString('id-ID')}</td>
                      <td className="p-4 text-right font-bold text-slate-900">Rp {r.total.toLocaleString('id-ID')}</td>
                      <td className="p-4 text-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit('rap', r)}
                          className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRap(r.id)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* MUSYAWARAH TABLE */}
        {activeSubTab === 'musyawarah' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Judul Rapat</th>
                  <th className="p-4 text-center">Peserta</th>
                  <th className="p-4">Agenda Utama</th>
                  <th className="p-4">Pimpinan Rapat</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMusyawarah.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Tidak ada data musyawarah ditemukan untuk tahun {selectedYear}.
                    </td>
                  </tr>
                ) : (
                  filteredMusyawarah.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-800">{m.date}</td>
                      <td className="p-4 font-bold text-slate-900">{m.title}</td>
                      <td className="p-4 text-center">
                        <span className="bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-full text-[10px]">
                          {m.participantCount} Orang
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 max-w-xs truncate">{m.agenda}</td>
                      <td className="p-4 text-slate-600">{m.leader}</td>
                      <td className="p-4 text-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit('musyawarah', m)}
                          className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMusyawarah(m.id)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* SPJ BULANAN TABLE */}
        {activeSubTab === 'spj' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="p-4">Bulan</th>
                  <th className="p-4">Tahun</th>
                  <th className="p-4 text-center">Kehadiran</th>
                  <th className="p-4">Catatan Notulen RT</th>
                  <th className="p-4 text-center">Dokumentasi</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSpj.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Tidak ada bukti SPJ bulanan ditemukan untuk tahun {selectedYear}.
                    </td>
                  </tr>
                ) : (
                  filteredSpj.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{s.month}</td>
                      <td className="p-4 text-slate-600">{s.year}</td>
                      <td className="p-4 text-center">
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[10px]">
                          {s.attendanceCount} Warga
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 max-w-xs truncate">{s.notulenRt}</td>
                      <td className="p-4 text-center">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                          {(s.meetingPhotoUrl ? 1 : 0) + (s.itemPhotoUrl ? 1 : 0) + (s.receiptPhotoUrl ? 1 : 0) + (s.photos?.length || 0)} Foto
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit('spj', s)}
                          className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSpj(s.id)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT / ADD MODAL */}
      {modalMode && editingItemType && currentEditItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 capitalize">
                {modalMode === 'add' ? 'Tambah Data ' : 'Edit Data '} {editingItemType}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              {/* TRANSACTION FORM FIELDS */}
              {editingItemType === 'transactions' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                    <input
                      type="date"
                      required
                      value={currentEditItem.date}
                      onChange={e => setCurrentEditItem({ ...currentEditItem, date: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jenis</label>
                      <select
                        value={currentEditItem.type}
                        onChange={e => setCurrentEditItem({ ...currentEditItem, type: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                      >
                        <option value="income">Kas Masuk (Pencairan)</option>
                        <option value="expense">Kas Keluar (Pengeluaran)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                      <select
                        value={currentEditItem.category}
                        onChange={e => setCurrentEditItem({ ...currentEditItem, category: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl capitalize font-medium"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Uraian / Keterangan</label>
                    <input
                      type="text"
                      required
                      value={currentEditItem.description}
                      onChange={e => setCurrentEditItem({ ...currentEditItem, description: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      placeholder="Contoh: Belanja alat kebersihan"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jumlah (Rp)</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.amount}
                        onChange={e => setCurrentEditItem({ ...currentEditItem, amount: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pemberi / Toko / Penerima</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.recipientOrDonor}
                        onChange={e => setCurrentEditItem({ ...currentEditItem, recipientOrDonor: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                        placeholder="Contoh: Toko Maju Jaya"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* SPK FORM FIELDS */}
              {editingItemType === 'spk' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">No. SPK</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.spkNumber}
                        onChange={e => setCurrentEditItem({ ...currentEditItem, spkNumber: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                      <input
                        type="date"
                        required
                        value={currentEditItem.date}
                        onChange={e => setCurrentEditItem({ ...currentEditItem, date: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Uraian Pekerjaan</label>
                    <textarea
                      required
                      rows={2}
                      value={currentEditItem.workDescription}
                      onChange={e => setCurrentEditItem({ ...currentEditItem, workDescription: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Lokasi Pekerjaan</label>
                    <input
                      type="text"
                      required
                      value={currentEditItem.workLocation}
                      onChange={e => setCurrentEditItem({ ...currentEditItem, workLocation: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pihak Kedua / Mandor</label>
                    <input
                      type="text"
                      required
                      value={currentEditItem.secondPartyName}
                      onChange={e => setCurrentEditItem({ ...currentEditItem, secondPartyName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </>
              )}

              {/* HONOR FORM FIELDS */}
              {editingItemType === 'honor' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Kegiatan Honor</label>
                    <input
                      type="text"
                      required
                      value={currentEditItem.activityName}
                      onChange={e => setCurrentEditItem({ ...currentEditItem, activityName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                      <input
                        type="date"
                        required
                        value={currentEditItem.date}
                        onChange={e => setCurrentEditItem({ ...currentEditItem, date: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tahun Anggaran</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.year}
                        onChange={e => setCurrentEditItem({ ...currentEditItem, year: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* RAP FORM FIELDS */}
              {editingItemType === 'rap' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bulan</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.month}
                        onChange={e => setCurrentEditItem({ ...currentEditItem, month: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                      <select
                        value={currentEditItem.category}
                        onChange={e => setCurrentEditItem({ ...currentEditItem, category: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl capitalize font-medium"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Uraian / Deskripsi</label>
                    <input
                      type="text"
                      required
                      value={currentEditItem.description}
                      onChange={e => setCurrentEditItem({ ...currentEditItem, description: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Volume</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.qty}
                        onChange={e => {
                          const qty = Number(e.target.value);
                          setCurrentEditItem({ ...currentEditItem, qty, total: qty * currentEditItem.price });
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Satuan</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.unit}
                        onChange={e => setCurrentEditItem({ ...currentEditItem, unit: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Harga (Rp)</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.price}
                        onChange={e => {
                          const price = Number(e.target.value);
                          setCurrentEditItem({ ...currentEditItem, price, total: currentEditItem.qty * price });
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* MUSYAWARAH FORM FIELDS */}
              {editingItemType === 'musyawarah' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                      <input
                        type="date"
                        required
                        value={currentEditItem.date}
                        onChange={e => setCurrentEditItem({ ...currentEditItem, date: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jumlah Peserta</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.participantCount}
                        onChange={e => setCurrentEditItem({ ...currentEditItem, participantCount: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Judul Rapat</label>
                    <input
                      type="text"
                      required
                      value={currentEditItem.title}
                      onChange={e => setCurrentEditItem({ ...currentEditItem, title: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Agenda Utama</label>
                    <textarea
                      required
                      rows={2}
                      value={currentEditItem.agenda}
                      onChange={e => setCurrentEditItem({ ...currentEditItem, agenda: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hasil Keputusan Mufakat</label>
                    <textarea
                      required
                      rows={2}
                      value={currentEditItem.decisions}
                      onChange={e => setCurrentEditItem({ ...currentEditItem, decisions: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </>
              )}

              {/* SPJ BULANAN FORM FIELDS */}
              {editingItemType === 'spj' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bulan</label>
                      <input
                        type="text"
                        required
                        value={currentEditItem.month}
                        onChange={e => setCurrentEditItem({ ...currentEditItem, month: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tahun</label>
                      <input
                        type="number"
                        required
                        value={currentEditItem.year}
                        onChange={e => setCurrentEditItem({ ...currentEditItem, year: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Catatan Notulen RT</label>
                    <textarea
                      required
                      rows={2}
                      value={currentEditItem.notulenRt}
                      onChange={e => setCurrentEditItem({ ...currentEditItem, notulenRt: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jumlah Hadir</label>
                    <input
                      type="number"
                      required
                      value={currentEditItem.attendanceCount}
                      onChange={e => setCurrentEditItem({ ...currentEditItem, attendanceCount: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
