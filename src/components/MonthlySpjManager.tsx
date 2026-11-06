import { DEFAULT_SEMARANG_LOGO } from '../data/initialData';
import React, { useState } from 'react';
import { MonthlySpjRecord, RtProfile, RapItem, DocumentationPhoto, Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { 
  FileCheck, 
  Printer, 
  Save, 
  Image, 
  Users, 
  FileText, 
  CheckCircle2, 
  Camera, 
  Layers,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  Info,
  Zap
} from 'lucide-react';
import { executePrint } from '../utils/printHelper';
import { FotoDokumentasiLampiran } from './FotoDokumentasiLampiran';
import { getDefaultPhotosForMonth } from '../utils/photoHelpers';

interface MonthlySpjManagerProps {
  profile: RtProfile;
  rapItems: RapItem[];
  spjRecords: MonthlySpjRecord[];
  transactions?: Transaction[];
  onSaveSpj: (records: MonthlySpjRecord[]) => void;
  onNavigateToNotulen?: () => void;
  onAbsorbRapToTransactions?: () => void;
}

export const MonthlySpjManager: React.FC<MonthlySpjManagerProps> = ({
  profile,
  rapItems,
  spjRecords,
  transactions = [],
  onSaveSpj,
  onNavigateToNotulen,
  onAbsorbRapToTransactions,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('Agustus');
  const [viewMode, setViewMode] = useState<'spj' | 'foto-terpisah' | 'all'>('foto-terpisah');
  const [photosPerPage, setPhotosPerPage] = useState<2 | 4>(() => {
    const saved = localStorage.getItem('si_bop_photos_per_page');
    return saved === '2' ? 2 : 4;
  });

  const handlePhotosPerPageChange = (count: 2 | 4) => {
    localStorage.setItem('si_bop_photos_per_page', String(count));
    setPhotosPerPage(count);
  };

  const months = [
    'Januari',
    'Pebruari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  // Find or create record for selected month
  const foundRecord = spjRecords.find((s) => s.month === selectedMonth);
  const initialPhotos = getDefaultPhotosForMonth(selectedMonth, profile.year, foundRecord);

  const currentRecord: MonthlySpjRecord = foundRecord || {
    id: `spj-${selectedMonth.toLowerCase()}`,
    month: selectedMonth,
    year: profile.year,
    notulenRt: `Notulen rapat rutin warga RT ${profile.rtNumber} bulan ${selectedMonth} ${profile.year}. Membahas kegiatan warga, kebersihan, dan pelaksanaan program BOP RT.`,
    notulenPkk: `Notulen rapat PKK bulan ${selectedMonth} ${profile.year}. Membahas arisan, pemberdayaan, dan konsumsi pertemuan.`,
    attendanceCount: 40,
    attendanceNotes: 'Daftar hadir warga terlampir.',
    meetingPhotoUrl: initialPhotos[0]?.imageUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    itemPhotoUrl: initialPhotos[1]?.imageUrl || 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80',
    receiptPhotoUrl: initialPhotos[2]?.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    photos: initialPhotos,
  };

  const [formState, setFormState] = useState<MonthlySpjRecord>({
    ...currentRecord,
    photos: currentRecord.photos && currentRecord.photos.length > 0 ? currentRecord.photos : initialPhotos,
  });

  // When selectedMonth changes, update formState
  const handleMonthChange = (m: string) => {
    setSelectedMonth(m);
    const found = spjRecords.find((s) => s.month === m);
    if (found) {
      const photos = found.photos && found.photos.length > 0
        ? found.photos
        : getDefaultPhotosForMonth(m, profile.year, found);
      setFormState({ ...found, photos });
    } else {
      const newPhotos = getDefaultPhotosForMonth(m, profile.year);
      setFormState({
        id: `spj-${m.toLowerCase()}`,
        month: m,
        year: profile.year,
        notulenRt: `Notulen rapat rutin warga RT ${profile.rtNumber} bulan ${m} ${profile.year}. Membahas kegiatan warga dan pelaksanaan anggaran.`,
        notulenPkk: `Notulen rapat PKK bulan ${m} ${profile.year}. Membahas program PKK dan konsumsi.`,
        attendanceCount: 40,
        attendanceNotes: 'Daftar hadir warga terlampir.',
        meetingPhotoUrl: newPhotos[0]?.imageUrl || '',
        itemPhotoUrl: newPhotos[1]?.imageUrl || '',
        receiptPhotoUrl: newPhotos[2]?.imageUrl || '',
        photos: newPhotos,
      });
    }
  };

  const handleUpdatePhotos = (newPhotos: DocumentationPhoto[]) => {
    setFormState((prev) => ({
      ...prev,
      photos: newPhotos,
      meetingPhotoUrl: newPhotos[0]?.imageUrl || prev.meetingPhotoUrl,
      itemPhotoUrl: newPhotos[1]?.imageUrl || prev.itemPhotoUrl,
      receiptPhotoUrl: newPhotos[2]?.imageUrl || prev.receiptPhotoUrl,
    }));
  };

  // Normalize month helper for matching
  const normalizeMonth = (m: string) => {
    if (!m) return '';
    const lower = m.toLowerCase().trim();
    if (lower === 'februari' || lower === 'pebruari') return 'pebruari';
    return lower;
  };

  const monthToIdx: Record<string, number> = {
    januari: 0,
    pebruari: 1,
    februari: 1,
    maret: 2,
    april: 3,
    mei: 4,
    juni: 5,
    juli: 6,
    agustus: 7,
    september: 8,
    oktober: 9,
    november: 10,
    desember: 11,
  };

  const selectedMonthIdx = monthToIdx[normalizeMonth(selectedMonth)] ?? 0;

  // RAP items for this month (Plafon Dana BOP)
  const monthRapItems = rapItems.filter(
    (item) => normalizeMonth(item.month) === normalizeMonth(selectedMonth)
  );
  const totalRapMonth = monthRapItems.reduce((acc, curr) => acc + (curr.total || 0), 0);

  // Actual expense transactions for selected month (Realisasi Pengeluaran)
  const monthExpenseTransactions = transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    if (!t.date) return false;
    const parts = t.date.split('-');
    if (parts.length < 2) return false;
    const mNum = parseInt(parts[1], 10) - 1;
    return mNum === selectedMonthIdx;
  });

  const totalExpenseMonth = monthExpenseTransactions.reduce(
    (acc, curr) => acc + (curr.amount || 0),
    0
  );

  // Automatic Validation Status
  const isOverbudget = totalRapMonth > 0 && totalExpenseMonth > totalRapMonth;
  const overbudgetAmount = isOverbudget ? totalExpenseMonth - totalRapMonth : 0;
  const remainingBudget = totalRapMonth > totalExpenseMonth ? totalRapMonth - totalExpenseMonth : 0;
  const budgetPercentage = totalRapMonth > 0 ? Math.round((totalExpenseMonth / totalRapMonth) * 100) : 0;

  // Summary validation status for all 12 months
  const monthlyValidationSummary = months.map((m) => {
    const mIdx = monthToIdx[normalizeMonth(m)] ?? 0;
    const rapAlloc = rapItems
      .filter((item) => normalizeMonth(item.month) === normalizeMonth(m))
      .reduce((acc, curr) => acc + (curr.total || 0), 0);
    const expenseRealized = transactions
      .filter((t) => {
        if (t.type !== 'expense' || !t.date) return false;
        const parts = t.date.split('-');
        return parts.length >= 2 && parseInt(parts[1], 10) - 1 === mIdx;
      })
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const isOver = rapAlloc > 0 && expenseRealized > rapAlloc;
    return {
      month: m,
      rapAlloc,
      expenseRealized,
      isOver,
      overAmount: isOver ? expenseRealized - rapAlloc : 0,
    };
  });

  const overbudgetMonthsCount = monthlyValidationSummary.filter((s) => s.isOver).length;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isOverbudget) {
      const confirmSave = window.confirm(
        `⚠️ PERINGATAN VALIDASI SPJ:\n\nTotal pengeluaran bulan ${selectedMonth} (${formatRupiah(totalExpenseMonth)}) MELEBIHI plafon dana RAP (${formatRupiah(totalRapMonth)}) sebesar ${formatRupiah(overbudgetAmount)}.\n\nApakah Anda tetap yakin ingin menyimpan berkas SPJ bulan ${selectedMonth}?`
      );
      if (!confirmSave) return;
    }

    const existingIndex = spjRecords.findIndex((s) => s.month === selectedMonth);
    let updated: MonthlySpjRecord[];
    if (existingIndex >= 0) {
      updated = [...spjRecords];
      updated[existingIndex] = formState;
    } else {
      updated = [...spjRecords, formState];
    }
    onSaveSpj(updated);
    alert(`Berkas Pelaporan SPJ & Lampiran Foto Bulan ${selectedMonth} berhasil disimpan!`);
  };

  const handlePrintCurrentView = () => {
    executePrint(`SPJ Pelaporan & Foto - Bulan ${selectedMonth} ${profile.year}`);
  };

  const handlePrintPhotosOnly = () => {
    setViewMode('foto-terpisah');
    setTimeout(() => {
      executePrint(`Lampiran Foto Dokumentasi - Bulan ${selectedMonth} ${profile.year}`);
    }, 200);
  };

  const handlePrintSpjOnly = () => {
    setViewMode('spj');
    setTimeout(() => {
      executePrint(`Dokumen SPJ Bulanan - Bulan ${selectedMonth} ${profile.year}`);
    }, 200);
  };

  const photosList = formState.photos || initialPhotos;
  const portraitCount = photosList.filter(p => p.orientation === 'portrait').length;
  const landscapeCount = photosList.filter(p => p.orientation !== 'portrait').length;

  const [docMeetingType, setDocMeetingType] = useState<'rt' | 'pkk'>(() => {
    const saved = localStorage.getItem('si_bop_spj_meeting_type');
    return (saved === 'rt' || saved === 'pkk') ? saved : 'rt';
  });

  const handleSetDocMeetingType = (type: 'rt' | 'pkk') => {
    setDocMeetingType(type);
    localStorage.setItem('si_bop_spj_meeting_type', type);
  };

  return (
    <div className="space-y-6">
      {/* Navigation & Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs print:hidden space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-red-600" />
              <span>Pelaporan & Bukti Fisik Bulanan (SPJ)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Berkas SPJ resmi Kelurahan: Notulen RT/PKK, Partisipasi Warga, serta <strong>Lampiran Foto Terpisah (Pilihan {photosPerPage} Foto / Lembar)</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className={`border rounded-xl px-3 py-2 text-xs font-semibold ${
                isOverbudget
                  ? 'bg-rose-50 border-rose-300 text-rose-900 font-extrabold'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {months.map((m) => {
                const summary = monthlyValidationSummary.find((s) => s.month === m);
                return (
                  <option key={m} value={m}>
                    {summary?.isOver ? `⚠️ Bulan: ${m} (Overbudget)` : `Bulan: ${m}`}
                  </option>
                );
              })}
            </select>

            {/* Quick Switcher 2 Foto vs 4 Foto */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 px-2">Format:</span>
              <button
                type="button"
                onClick={() => handlePhotosPerPageChange(2)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  photosPerPage === 2
                    ? 'bg-white text-red-700 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Format 2 Foto / Lembar"
              >
                2 Foto
              </button>
              <button
                type="button"
                onClick={() => handlePhotosPerPageChange(4)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  photosPerPage === 4
                    ? 'bg-white text-red-700 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Format 4 Foto / Lembar"
              >
                4 Foto
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrintPhotosOnly}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 text-xs transition-colors"
              title="Cetak khusus halaman foto dokumentasi terpisah"
            >
              <Camera className="w-4 h-4" />
              <span>Cetak Lampiran Foto (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handlePrintSpjOnly}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 text-xs transition-colors"
              title="Cetak berkas naskah SPJ utama"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Berkas SPJ (PDF)</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs">
            <button
              type="button"
              onClick={() => handleSetDocMeetingType('rt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                docMeetingType === 'rt'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👥 Kegiatan Warga (RT)
            </button>
            <button
              type="button"
              onClick={() => handleSetDocMeetingType('pkk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                docMeetingType === 'pkk'
                  ? 'bg-white text-rose-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌸 Kegiatan PKK
            </button>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('foto-terpisah')}
              className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === 'foto-terpisah'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-red-600" />
              <span>📸 Lampiran Foto ({photosPerPage} Foto / Lembar)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('spj')}
              className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === 'spj'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-red-600" />
              <span>📋 Berkas SPJ & Notulen (Lengkap)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-red-600" />
              <span>📑 Seluruh Berkas (SPJ + Lampiran Foto)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {onAbsorbRapToTransactions && (
              <button
                type="button"
                onClick={onAbsorbRapToTransactions}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center space-x-1 text-[11px] transition-all"
                title="Serap rincian RAP langsung ke pencatatan transaksi kas keluar secara otomatis"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-200" />
                <span>⚡ Serap RAP ke Transaksi</span>
              </button>
            )}
            <span>
              Foto Bulan {selectedMonth}: <strong>{photosList.length} Foto</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Format: <strong>{photosPerPage} Foto/Lembar</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Orientasi: <strong>{landscapeCount} Landscape</strong>, <strong>{portraitCount} Portrait</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AUTOMATIC VALIDATION BANNER & BUDGET CEILING CARD                        */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs print:hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-start sm:items-center space-x-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${isOverbudget ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {isOverbudget ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Validasi Otomatis SPJ & Plafon BOP (Bulan {selectedMonth})</h3>
                {isOverbudget ? (
                  <span className="bg-rose-100 text-rose-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 text-rose-600" />
                    <span>Melebihi Plafon RAP</span>
                  </span>
                ) : totalRapMonth > 0 ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Sesuai Plafon RAP</span>
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-amber-200">
                    Belum Ada Alokasi RAP
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Sistem otomatis membandingkan total transaksi kas keluar dengan plafon dana Rencana Anggaran Penggunaan (RAP).
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs shrink-0">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Plafon RAP</span>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{formatRupiah(totalRapMonth)}</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Realisasi Pengeluaran</span>
              <span className={`font-extrabold text-xs sm:text-sm ${isOverbudget ? 'text-rose-600' : 'text-slate-900'}`}>
                {formatRupiah(totalExpenseMonth)}
              </span>
            </div>

            <div className={`p-2.5 rounded-xl border col-span-2 sm:col-span-1 ${
              isOverbudget 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <span className="text-[10px] uppercase tracking-wider font-bold block opacity-80">
                {isOverbudget ? 'Selisih Overbudget' : 'Sisa Alokasi'}
              </span>
              <span className="font-extrabold text-xs sm:text-sm">
                {isOverbudget ? `+${formatRupiah(overbudgetAmount)}` : formatRupiah(remainingBudget)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        {totalRapMonth > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Penggunaan Anggaran Bulan {selectedMonth}:</span>
              <span className={isOverbudget ? 'text-rose-600 font-extrabold' : 'text-slate-800'}>
                {budgetPercentage}% ({formatRupiah(totalExpenseMonth)} dari {formatRupiah(totalRapMonth)})
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className={`h-full transition-all duration-500 ${
                  isOverbudget ? 'bg-rose-600' : budgetPercentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Prominent Warning Alert Box if Overbudget */}
        {isOverbudget && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-start space-x-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-rose-900 text-xs">
                ⚠️ PERINGATAN VALIDASI: TOTAL PENGELUARAN BULAN {selectedMonth.toUpperCase()} MELEBIHI PLAFON RAP
              </h4>
              <p className="leading-relaxed text-rose-800">
                Total transaksi pengeluaran (<strong>{formatRupiah(totalExpenseMonth)}</strong>) telah melampaui batas alokasi anggaran RAP (<strong>{formatRupiah(totalRapMonth)}</strong>) sebesar <strong className="text-rose-900 underline underline-offset-2">{formatRupiah(overbudgetAmount)}</strong> ({budgetPercentage}% dari plafon RAP).
              </p>
              <p className="text-[11px] text-rose-700 italic pt-0.5">
                💡 <strong>Rekomendasi Tindakan:</strong> Harap sesuaikan daftar pencatatan transaksi kas keluar pada bulan {selectedMonth} atau revisi data Rencana Anggaran Penggunaan (RAP) agar pertanggungjawaban SPJ di Kelurahan valid dan bebas dari temuan.
              </p>
            </div>
          </div>
        )}

        {/* 12-Month Quick Validation Status Bar */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <FileCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Ringkasan Validasi Plafon RAP 12 Bulan:</span>
            </span>
            {overbudgetMonthsCount > 0 ? (
              <span className="text-[10.5px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                ⚠️ {overbudgetMonthsCount} Bulan Melebihi Plafon
              </span>
            ) : (
              <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ✅ Seluruh Bulan Sesuai Plafon
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
            {monthlyValidationSummary.map((summary) => {
              const isSelected = summary.month === selectedMonth;
              return (
                <button
                  key={summary.month}
                  type="button"
                  onClick={() => handleMonthChange(summary.month)}
                  className={`p-1.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'ring-2 ring-red-500 font-bold shadow-xs'
                      : 'hover:bg-slate-50'
                  } ${
                    summary.isOver
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : summary.rapAlloc > 0 && summary.expenseRealized > 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                  title={`Bulan ${summary.month}: Realisasi ${formatRupiah(summary.expenseRealized)} / RAP ${formatRupiah(summary.rapAlloc)}`}
                >
                  <div className="text-[10px] font-bold truncate">{summary.month.slice(0, 3)}</div>
                  <div className="text-[9px] mt-0.5 font-medium">
                    {summary.isOver ? (
                      <span className="text-rose-700 font-extrabold flex items-center justify-center space-x-0.5">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>Over</span>
                      </span>
                    ) : summary.rapAlloc > 0 ? (
                      <span className="text-emerald-700 font-bold">OK</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: LAMPIRAN FOTO DOKUMENTASI TERPISAH (Pilihan 2 atau 4 Foto)         */}
      {/* ========================================================================= */}
      {viewMode === 'foto-terpisah' && (
        <div>
          <FotoDokumentasiLampiran
            profile={profile}
            month={selectedMonth}
            photos={photosList}
            onUpdatePhotos={handleUpdatePhotos}
            onPrint={handlePrintCurrentView}
            standalone={true}
            photosPerPage={photosPerPage}
            onPhotosPerPageChange={handlePhotosPerPageChange}
            meetingType={docMeetingType}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: BERKAS SPJ & NOTULEN UTAMA                                         */}
      {/* ========================================================================= */}
      {(viewMode === 'spj' || viewMode === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">
          {/* Editor Form (Hidden on print) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs print:hidden space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Input Berkas Bulan {selectedMonth}</h3>
              <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-md font-medium">
                Alokasi: {formatRupiah(totalRapMonth)}
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Notulen Rapat RT
                </label>
                <textarea
                  rows={3}
                  value={formState.notulenRt}
                  onChange={(e) => setFormState({ ...formState, notulenRt: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Notulen Rapat PKK
                </label>
                <textarea
                  rows={3}
                  value={formState.notulenPkk}
                  onChange={(e) => setFormState({ ...formState, notulenPkk: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Jumlah Hadir (Orang)
                  </label>
                  <input
                    type="number"
                    value={formState.attendanceCount}
                    onChange={(e) => setFormState({ ...formState, attendanceCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Keterangan Daftar Hadir
                  </label>
                  <input
                    type="text"
                    value={formState.attendanceNotes}
                    onChange={(e) => setFormState({ ...formState, attendanceNotes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              {/* Photos Management Shortcut */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>Lampiran Foto ({photosList.length} Foto)</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handlePhotosPerPageChange(2)}
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                        photosPerPage === 2 ? 'bg-amber-600 text-white font-bold' : 'bg-amber-200/80 text-amber-800'
                      }`}
                    >
                      2 Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePhotosPerPageChange(4)}
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                        photosPerPage === 4 ? 'bg-amber-600 text-white font-bold' : 'bg-amber-200/80 text-amber-800'
                      }`}
                    >
                      4 Foto
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Format aktif: <strong>{photosPerPage} Foto per lembar</strong>. Foto dokumentasi diatur pada lembar lampiran terpisah.
                </p>
                <button
                  type="button"
                  onClick={() => setViewMode('foto-terpisah')}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Editor & Pengaturan Foto ({photosPerPage} Foto / Lembar)</span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Berkas Pelaporan</span>
              </button>
            </form>
          </div>

          {/* Printable Official SPJ Evidence Dossier */}
          <div className="lg:col-span-2 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm text-slate-900 space-y-8 font-arial-narrow official-doc leading-relaxed print-page-break">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div className="w-24 h-24 print:w-24 print:h-24 flex-shrink-0 flex items-center justify-center">
                <img 
                  src={profile.logoUrl || DEFAULT_SEMARANG_LOGO} 
                  alt="Logo Kota Semarang" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center flex-grow px-4">
                <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
              PEMERINTAH KOTA SEMARANG
            </div>
                <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
              KECAMATAN {profile.kecamatan}
            </div>
                <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
              KELURAHAN {profile.kelurahan}
            </div>
                <div className="text-[18px] font-bold uppercase text-slate-900 leading-tight mt-1">
              RT {profile.rtNumber} RW {profile.rwNumber}
            </div>
                <p className="text-[10px] text-slate-600 leading-tight">
                  Alamat: Ngabean RT {profile.rtNumber} RW {profile.rwNumber} Kelurahan {profile.kelurahan}
                </p>
                <div className="h-px bg-slate-300 my-1"></div>
                <h1 className="text-base font-extrabold uppercase text-slate-900 leading-tight">
                  LAPORAN PERTANGGUNGJAWABAN BULANAN (SPJ) BOP RT
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Bulan {selectedMonth} Tahun Anggaran {profile.year}
                </p>
              </div>
              <div className="w-24 h-24 print:w-24 print:h-24 flex-shrink-0 flex items-center justify-end">
                <div className="text-right text-[10px] text-slate-500 font-mono hidden sm:block print:block">
                  SPJ/BOP/{selectedMonth.toUpperCase()}/{profile.year}
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-600">Alokasi Dana Sesuai RAP:</span>
                <span className="font-bold text-slate-900 ml-2 text-sm">{formatRupiah(totalRapMonth)}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Status Laporan:</span>
                <span className="font-bold text-emerald-700 ml-2">LENGKAP & TERTIB</span>
              </div>
            </div>

            {/* 1. Realisasi RAP Bulan Ini */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase bg-slate-100 p-2 border-l-4 border-red-600">
                1. Rincian Realisasi Penggunaan Dana Bulan {selectedMonth} (Sesuai RAP)
              </h3>
              {monthRapItems.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">Tidak ada pos anggaran RAP pada bulan {selectedMonth}.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2 border border-slate-200 w-8 text-center">No</th>
                        <th className="p-2 border border-slate-200">Uraian Kebutuhan</th>
                        <th className="p-2 border border-slate-200 w-16 text-center">Vol</th>
                        <th className="p-2 border border-slate-200 w-16 text-center">Satuan</th>
                        <th className="p-2 border border-slate-200 text-right">Harga Satuan</th>
                        <th className="p-2 border border-slate-200 text-right">Total Realisasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {monthRapItems.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="p-2 border border-slate-200 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border border-slate-200 font-medium">{item.activity}</td>
                          <td className="p-2 border border-slate-200 text-center">{item.volume}</td>
                          <td className="p-2 border border-slate-200 text-center">{item.unit}</td>
                          <td className="p-2 border border-slate-200 text-right font-mono">{formatRupiah(item.unitPrice)}</td>
                          <td className="p-2 border border-slate-200 text-right font-mono font-semibold">{formatRupiah(item.total)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold">
                        <td colSpan={5} className="p-2 border border-slate-200 text-right uppercase text-[10px]">
                          Total Pengeluaran Bulan {selectedMonth}:
                        </td>
                        <td className="p-2 border border-slate-200 text-right font-mono text-red-600">
                          {formatRupiah(totalRapMonth)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 2. Notulen Rapat */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase bg-slate-100 p-2 border-l-4 border-red-600">
                2. Berita Acara & Notulen Musyawarah / Rapat
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase mb-1 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    <span>A. Notulen Rapat Rutin Warga RT {profile.rtNumber}</span>
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {formState.notulenRt}
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase mb-1 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    <span>B. Notulen Rapat PKK RT {profile.rtNumber}</span>
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {formState.notulenPkk}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Daftar Hadir & Partisipasi */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase bg-slate-100 p-2 border-l-4 border-red-600">
                3. Daftar Hadir & Partisipasi Warga
              </h3>
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-xs text-slate-800">
                    Kegiatan musyawarah warga dihadiri oleh <strong className="font-bold text-slate-900">{formState.attendanceCount} orang</strong> warga RT {profile.rtNumber} RW {profile.rwNumber}.
                  </p>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">
                    {formState.attendanceNotes || 'Daftar presensi tanda tangan terlampir pada berkas LPJ.'}
                  </p>
                </div>

                {onNavigateToNotulen && (
                  <button
                    type="button"
                    onClick={onNavigateToNotulen}
                    className="print:hidden bg-red-50 hover:bg-red-100 text-red-700 font-semibold px-2.5 py-1.5 rounded-lg text-[11px] border border-red-200 flex items-center space-x-1.5 transition-colors shrink-0"
                  >
                    <Users className="w-3.5 h-3.5 text-red-600" />
                    <span>Buka / Cetak Format Daftar Hadir (Silang)</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4. Lampiran Foto Dokumentasi (Notice & Mini Gallery) */}
            <div className="space-y-3 print-avoid-break">
              <div className="flex justify-between items-center bg-slate-100 p-2 border-l-4 border-red-600">
                <h3 className="text-xs font-bold uppercase">
                  4. Lampiran Foto Dokumentasi
                </h3>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold">
                  Lampiran Terpisah
                </span>
              </div>

              {/* Informational banner about separate photo sheet */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <p className="font-bold text-amber-950 flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-amber-700" />
                    <span>Dibuat Lembar Terpisah: Lampiran Foto Dokumentasi Kegiatan</span>
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Sesuai petunjuk teknis pelaporan, dokumentasi foto dicetak terpisah agar kualitas cetak prima dan rapi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewMode('foto-terpisah')}
                  className="print:hidden bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 transition-colors shrink-0 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Lembar Foto Terpisah</span>
                </button>
              </div>

              {/* Mini Gallery Previews */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {photosList.slice(0, 4).map((photo, idx) => (
                  <div key={photo.id || idx} className="border border-slate-200 rounded-xl p-2 bg-slate-50">
                    <div className="flex justify-between items-center mb-1 text-[10px]">
                      <span className="font-bold text-slate-700">Foto {idx + 1}</span>
                      <span className={`px-1 rounded text-[9px] font-semibold uppercase ${
                        photo.orientation === 'portrait' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {photo.orientation === 'portrait' ? 'Tegak' : 'Mendatar'}
                      </span>
                    </div>
                    <div className="h-24 bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center border border-slate-300">
                      {photo.imageUrl ? (
                        <img 
                          src={photo.imageUrl} 
                          alt={photo.title} 
                          className={photo.fitMode === 'contain' ? 'max-w-full max-h-full object-contain' : 'w-full h-full object-cover'} 
                        />
                      ) : null}
                    </div>
                    <p className="text-[10px] font-semibold text-slate-800 truncate mt-1">
                      {photo.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-8 pt-4 grid grid-cols-3 gap-6 text-xs text-center print-avoid-break">
              <div>
                <p className="font-semibold">Sekretaris RT {profile.rtNumber}</p>
                <div className="h-16"></div>
                <p className="font-bold underline uppercase">{profile.sekretaris}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Semarang, akhir {selectedMonth} {profile.year}</p>
                <p className="font-semibold">Ketua RT {profile.rtNumber}</p>
                <div className="h-16"></div>
                <p className="font-bold underline uppercase">{profile.ketuaRt}</p>
              </div>
              <div>
                <p className="font-semibold">&nbsp;</p>
                <p className="font-semibold">Bendahara RT {profile.rtNumber}</p>
                <div className="h-16"></div>
                <p className="font-bold underline uppercase">{profile.bendaharaRt}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 grid grid-cols-2 gap-8 text-xs text-center print-avoid-break border-t border-slate-200">
              <div>
                <p className="font-semibold">Mengetahui,</p>
                <p className="font-semibold uppercase">Lurah {profile.kelurahan}</p>
                <div className="h-16"></div>
                <p className="font-bold underline uppercase">{profile.lurahName}</p>
              </div>
              <div>
                <p className="font-semibold">&nbsp;</p>
                <p className="font-semibold uppercase">Ketua RW {profile.rwNumber}</p>
                <div className="h-16"></div>
                <p className="font-bold underline uppercase">{profile.rwChairman}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: JIKA "SEMUA DOKUMEN", LAMPIRAN FOTO MENEMPEL DI HALAMAN TERPISAH  */}
      {/* ========================================================================= */}
      {viewMode === 'all' && (
        <div className="print-page-break-before pt-6">
          <div className="print:hidden pb-3 mb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Camera className="w-4 h-4 text-red-600" />
              <span>Halaman Lampiran Foto Terpisah (Akan otomatis dicetak pada lembar berikutnya)</span>
            </h3>
          </div>
          <FotoDokumentasiLampiran
            profile={profile}
            month={selectedMonth}
            photos={photosList}
            onUpdatePhotos={handleUpdatePhotos}
            onPrint={handlePrintCurrentView}
            standalone={false}
            photosPerPage={photosPerPage}
            onPhotosPerPageChange={handlePhotosPerPageChange}
            meetingType={docMeetingType}
          />
        </div>
      )}
    </div>
  );
};
