import { DEFAULT_SEMARANG_LOGO } from '../data/initialData';
import React, { useState, useMemo } from 'react';
import { Transaction, RtProfile, CategoryDefinition } from '../types';
import { defaultCategories, getCategoryDefinition } from '../data/initialData';
import { formatRupiah, formatDate } from '../utils/formatters';
import {
  Printer,
  Download,
  ShieldCheck,
  Sliders,
  RefreshCw,
  Zap,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { downloadElementAsPdf, executePrint, openInNewTab } from '../utils/printHelper';

interface ReportGeneratorProps {
  transactions: Transaction[];
  profile: RtProfile;
  categories?: CategoryDefinition[];
  onAbsorbRapToTransactions?: () => void;
}

interface CategoryTotalItem {
  total: number;
  count: number;
  name: string;
  color: string;
  desc: string;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  transactions,
  profile,
  categories = defaultCategories,
  onAbsorbRapToTransactions,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('07'); // Default to current or July
  const [reportType, setReportType] = useState<'realisasi' | 'bku' | 'pengantar'>('realisasi');
  const [inputMode, setInputMode] = useState<'auto' | 'manual'>('auto');

  // Manual adjustment state for dynamic template entry per category
  const [manualCategoryValues, setManualCategoryValues] = useState<Record<string, number>>({});
  const [manualIncome, setManualIncome] = useState<number | ''>('');
  const [reportDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const monthsList = [
    { value: 'all', label: 'Satu Tahun Anggaran Penuh (2026)', roman: 'I-XII', name: 'Tahun 2026' },
    { value: 'jan-aug', label: '🌟 Rapel Januari - Agustus 2026 (8 Bulan)', roman: 'I-VIII', name: 'Januari - Agustus 2026' },
    { value: '01', label: 'Bulan Januari', roman: 'I', name: 'Januari' },
    { value: '02', label: 'Bulan Februari', roman: 'II', name: 'Februari' },
    { value: '03', label: 'Bulan Maret', roman: 'III', name: 'Maret' },
    { value: '04', label: 'Bulan April', roman: 'IV', name: 'April' },
    { value: '05', label: 'Bulan Mei', roman: 'V', name: 'Mei' },
    { value: '06', label: 'Bulan Juni', roman: 'VI', name: 'Juni' },
    { value: '07', label: 'Bulan Juli', roman: 'VII', name: 'Juli' },
    { value: '08', label: 'Bulan Agustus', roman: 'VIII', name: 'Agustus' },
    { value: '09', label: 'Bulan September', roman: 'IX', name: 'September' },
    { value: '10', label: 'Bulan Oktober', roman: 'X', name: 'Oktober' },
    { value: '11', label: 'Bulan November', roman: 'XI', name: 'November' },
    { value: '12', label: 'Bulan Desember', roman: 'XII', name: 'Desember' },
  ];

  const currentMonthInfo = monthsList.find((m) => m.value === selectedMonth) || monthsList[7];

  // Dynamic SPJ Number based on chosen month
  const dynamicSpjNumber = `04/SPJ-BOP/04.04/${currentMonthInfo.roman}/${profile.year}`;

  // Filter transactions by selected period
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedMonth === 'all') return true;
      const txMonth = tx.date.split('-')[1];
      if (selectedMonth === 'jan-aug') {
        const m = parseInt(txMonth, 10);
        return m >= 1 && m <= 8;
      }
      return txMonth === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredTransactions]);

  // Auto-calculated totals from transactions
  const autoCategoryTotals = useMemo(() => {
    const totals: Record<string, { total: number; count: number; items: Transaction[] }> = {};

    categories.forEach((cat) => {
      totals[cat.id] = { total: 0, count: 0, items: [] };
    });

    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (!totals[t.category]) {
          totals[t.category] = { total: 0, count: 0, items: [] };
        }
        totals[t.category].total += t.amount;
        totals[t.category].count += 1;
        totals[t.category].items.push(t);
      });

    return totals;
  }, [categories, filteredTransactions]);

  // Calculate Income: either from transactions or proportional pagu
  const autoIncome = useMemo(() => {
    const recordedIncomes = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);

    if (recordedIncomes > 0) return recordedIncomes;

    if (selectedMonth === 'all') return profile.totalPagu;
    if (selectedMonth === 'jan-aug') return 18800000;
    return Math.round(profile.totalPagu / 12);
  }, [filteredTransactions, selectedMonth, profile.totalPagu]);

  // Active category values (auto or manual)
  const activeCategoryTotals: Record<string, CategoryTotalItem> = useMemo(() => {
    const result: Record<string, CategoryTotalItem> = {};

    categories.forEach((cat) => {
      if (cat.id === 'lainnya') return; // Exclude income category from expense breakdown

      const autoData = autoCategoryTotals[cat.id] || { total: 0, count: 0 };
      const nominal =
        inputMode === 'manual' && manualCategoryValues[cat.id] !== undefined
          ? manualCategoryValues[cat.id]
          : autoData.total;

      result[cat.id] = {
        total: nominal,
        count: autoData.count,
        name: cat.name,
        color: cat.color,
        desc: cat.desc || '',
      };
    });

    return result;
  }, [categories, autoCategoryTotals, inputMode, manualCategoryValues]);

  // Overall Total Expenditure
  const totalExpense = useMemo(() => {
    const items: CategoryTotalItem[] = Object.values(activeCategoryTotals);
    return items.reduce((sum, c) => sum + c.total, 0);
  }, [activeCategoryTotals]);

  // Active Total Income
  const activeIncome = useMemo(() => {
    if (inputMode === 'manual' && manualIncome !== '') {
      return Number(manualIncome);
    }
    return autoIncome;
  }, [inputMode, manualIncome, autoIncome]);

  // Saldo Akhir (Final Balance)
  const saldoAkhir = activeIncome - totalExpense;

  // Handle manual input change for a category
  const handleManualValueChange = (catId: string, valStr: string) => {
    const val = valStr === '' ? 0 : Number(valStr);
    setManualCategoryValues((prev) => ({
      ...prev,
      [catId]: val,
    }));
  };

  // Reset manual overrides to current auto values
  const handleResetToAuto = () => {
    const initialManual: Record<string, number> = {};
    Object.keys(autoCategoryTotals).forEach((k) => {
      initialManual[k] = autoCategoryTotals[k].total;
    });
    setManualCategoryValues(initialManual);
    setManualIncome(autoIncome);
  };

  const handlePrint = () => {
    executePrint(`SPJ BOP RT - ${reportType === 'bku' ? 'BKU' : 'Laporan Realisasi'} ${currentMonthInfo.name} ${profile.year}`);
  };

  // Export report to CSV
  const handleExportCSV = () => {
    const headers = ['No', 'Kategori Peruntukan', 'Jumlah Pengeluaran (Rp)', 'Persentase (%)'];
    const rows = Object.entries(activeCategoryTotals).map(([_, c], idx) => {
      const pct = totalExpense > 0 ? Math.round((c.total / totalExpense) * 100) : 0;
      return [idx + 1, `"${c.name}"`, c.total, `${pct}%`];
    });

    rows.push(['', '"TOTAL PENGELUARAN"', totalExpense, '100%']);
    rows.push(['', '"TOTAL PENERIMAAN / PAGU"', activeIncome, '']);
    rows.push(['', '"SALDO AKHIR KAS"', saldoAkhir, '']);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Realisasi_BOP_RT_${currentMonthInfo.name}_${profile.year}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    await downloadElementAsPdf('.official-doc', `Laporan_BOP_RT_${currentMonthInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}_${profile.year}.pdf`);
    setIsDownloadingPdf(false);
  };

  return (
    <div className="space-y-6">
      {/* Controls & Customization Toolbar (Hidden when printing) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs print:hidden space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">
                Template Laporan Dinamis Penggunaan BOP RT
              </h2>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Otomatisasi Penuh
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Format baku dinamis siap cetak. Total pengeluaran per kategori, persentase, dan saldo akhir dihitung otomatis tanpa perlu mengubah teks dasar setiap bulan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onAbsorbRapToTransactions && (
              <button
                onClick={onAbsorbRapToTransactions}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 text-xs transition-all"
                title="Serap data RAP otomatis ke pencatatan transaksi kas keluar"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-200" />
                <span>Serap RAP ke Transaksi</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all cursor-pointer disabled:opacity-50"
              title="Unduh file PDF langsung ke perangkat"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isDownloadingPdf ? 'Memproses PDF...' : 'Unduh File PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all cursor-pointer"
              title="Buka dialog cetak browser"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Print</span>
            </button>

            <button
              type="button"
              onClick={openInNewTab}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 text-xs transition-all cursor-pointer border border-slate-200"
              title="Buka aplikasi di tab baru jika cetak terhalang oleh frame preview"
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
              <span>Buka Tab Baru</span>
            </button>
          </div>
        </div>

        {/* Toolbar Settings */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Tab Selection */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
            <button
              onClick={() => setReportType('realisasi')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                reportType === 'realisasi'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laporan Realisasi Per Kategori
            </button>
            <button
              onClick={() => setReportType('bku')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                reportType === 'bku'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Buku Kas Umum (BKU)
            </button>
            <button
              onClick={() => setReportType('pengantar')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                reportType === 'pengantar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Surat Pengantar SPJ
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Periode Month Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-600">Periode:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                {monthsList.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Input Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-600">Metode Data:</span>
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setInputMode('auto')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    inputMode === 'auto'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600'
                  }`}
                  title="Ambil nilai riil dari riwayat transaksi yang tercatat"
                >
                  Otomatis (Riwayat)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('manual');
                    handleResetToAuto();
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    inputMode === 'manual'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600'
                  }`}
                  title="Sesuaikan / ketik manual angka pengeluaran per kategori"
                >
                  Input Cepat Manual
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Category Input Table (When in Manual Mode) */}
        {inputMode === 'manual' && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>Input Pengeluaran Cepat Per Kategori (BOP RT)</span>
              </div>
              <button
                type="button"
                onClick={handleResetToAuto}
                className="text-xs text-amber-700 hover:text-amber-900 underline flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Salin dari Riwayat Transaksi</span>
              </button>
            </div>
            <p className="text-[11px] text-amber-800">
              Ubah angka pengeluaran di bawah ini untuk melihat simulasi laporan dan perhitungan saldo akhir secara instan.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {Object.entries(activeCategoryTotals).map(([catId, cat]) => (
                <div key={catId} className="bg-white p-2.5 rounded-lg border border-amber-200 shadow-xs">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 truncate">
                    {cat.name}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400">Rp</span>
                    <input
                      type="number"
                      min="0"
                      value={manualCategoryValues[catId] ?? cat.total}
                      onChange={(e) => handleManualValueChange(catId, e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              ))}

              <div className="bg-white p-2.5 rounded-lg border border-emerald-300 shadow-xs">
                <label className="block text-[11px] font-semibold text-emerald-800 mb-1 truncate">
                  Penerimaan Dana / Pagu Kas Masuk
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-emerald-600">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={manualIncome !== '' ? manualIncome : activeIncome}
                    onChange={(e) => setManualIncome(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50/50 border border-emerald-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Metrics Quick Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500">Penerimaan / Pagu:</span>
            <div className="text-base font-bold text-emerald-600 mt-0.5">
              {formatRupiah(activeIncome)}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500">Total Pengeluaran:</span>
            <div className="text-base font-bold text-red-600 mt-0.5">
              {formatRupiah(totalExpense)}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500">Saldo Akhir Kas:</span>
            <div
              className={`text-base font-bold mt-0.5 ${
                saldoAkhir >= 0 ? 'text-slate-900' : 'text-amber-600'
              }`}
            >
              {formatRupiah(saldoAkhir)}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Official Document Container */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto text-slate-900 font-arial-narrow official-doc leading-relaxed">
        {/* Kop Surat Resmi */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
          <div className="w-24 h-24 print:w-24 print:h-24 flex-shrink-0 flex items-center justify-center">
            <img
              src={profile.logoUrl || DEFAULT_SEMARANG_LOGO}
              alt="Logo Kota Semarang"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center flex-grow px-2">
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
            <h2 className="text-sm sm:text-base font-bold uppercase text-slate-900 leading-tight">
              {reportType === 'realisasi' && 'LAPORAN REALISASI PENGGUNAAN DANA BOP RT'}
              {reportType === 'bku' && 'BUKU KAS UMUM (BKU) OPERASIONAL RT'}
              {reportType === 'pengantar' && 'SURAT PENGANTAR LAPORAN PERTANGGUNGJAWABAN (SPJ)'}
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Tahun Anggaran {profile.year} • Periode: {currentMonthInfo.name}
            </p>
          </div>
          <div className="w-24 h-24 print:w-24 print:h-24 flex-shrink-0"></div>
        </div>

        {/* Metadata Banner Box */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-white print:border-slate-300">
          <div>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-semibold text-slate-600 py-0.5 w-32">Nomor SPJ</td>
                  <td className="font-mono">: {dynamicSpjNumber}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-slate-600 py-0.5">Ketua RT {profile.rtNumber}</td>
                  <td>: {profile.ketuaRt}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-slate-600 py-0.5">Bendahara RT</td>
                  <td>: {profile.bendaharaRt}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-semibold text-slate-600 py-0.5 w-32">Pagu Alokasi</td>
                  <td>: {formatRupiah(profile.totalPagu)}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-slate-600 py-0.5">Periode Laporan</td>
                  <td>: {currentMonthInfo.label}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-slate-600 py-0.5">Tanggal Cetak</td>
                  <td>: {formatDate(reportDate)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* VIEW 1: Laporan Realisasi Per Kategori Dinamis */}
        {reportType === 'realisasi' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-l-4 border-red-600 pl-2 mb-3">
                I. Rekapitulasi Realisasi Belanja BOP RT Per Kategori Peruntukan
              </h4>

              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="border border-slate-300 py-2.5 px-3 text-center w-10">No</th>
                    <th className="border border-slate-300 py-2.5 px-3 text-left">
                      Kategori Peruntukan
                    </th>
                    <th className="border border-slate-300 py-2.5 px-3 text-center w-24">
                      Jumlah Transaksi
                    </th>
                    <th className="border border-slate-300 py-2.5 px-3 text-right w-36">
                      Realisasi Belanja (Rp)
                    </th>
                    <th className="border border-slate-300 py-2.5 px-3 text-center w-20">
                      Persentase
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(activeCategoryTotals).map(([catId, cat], index) => {
                    const pct =
                      totalExpense > 0 ? Math.round((cat.total / totalExpense) * 100) : 0;

                    return (
                      <tr key={catId} className="hover:bg-slate-50">
                        <td className="border border-slate-300 py-2 px-3 text-center">
                          {index + 1}
                        </td>
                        <td className="border border-slate-300 py-2 px-3 font-medium">
                          <div>{cat.name}</div>
                          {cat.desc && (
                            <div className="text-[10px] text-slate-500 font-normal">{cat.desc}</div>
                          )}
                        </td>
                        <td className="border border-slate-300 py-2 px-3 text-center text-slate-600">
                          {cat.count > 0 ? `${cat.count} Nota/Kwitansi` : '-'}
                        </td>
                        <td className="border border-slate-300 py-2 px-3 text-right font-semibold font-mono">
                          {formatRupiah(cat.total)}
                        </td>
                        <td className="border border-slate-300 py-2 px-3 text-center font-medium">
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}

                  {/* Summary Totals */}
                  <tr className="bg-slate-100 font-bold">
                    <td colSpan={3} className="border border-slate-300 py-2.5 px-3 text-right uppercase">
                      Total Pengeluaran:
                    </td>
                    <td className="border border-slate-300 py-2.5 px-3 text-right text-red-700 font-mono">
                      {formatRupiah(totalExpense)}
                    </td>
                    <td className="border border-slate-300 py-2.5 px-3 text-center">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Ringkasan Saldo Akhir Kas */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-l-4 border-red-600 pl-2 mb-3">
                II. Ringkasan Kas & Perhitungan Saldo Akhir
              </h4>

              <table className="w-full text-xs border-collapse border border-slate-300">
                <tbody>
                  <tr>
                    <td className="border border-slate-300 py-2 px-3 font-medium w-8">A.</td>
                    <td className="border border-slate-300 py-2 px-3 font-semibold">
                      Total Penerimaan Kas Masuk / Pencairan BOP RT Periode Ini
                    </td>
                    <td className="border border-slate-300 py-2 px-3 text-right font-bold text-emerald-700 font-mono w-44">
                      {formatRupiah(activeIncome)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 py-2 px-3 font-medium">B.</td>
                    <td className="border border-slate-300 py-2 px-3 font-semibold">
                      Total Pengeluaran Belanja Operasional RT Periode Ini
                    </td>
                    <td className="border border-slate-300 py-2 px-3 text-right font-bold text-red-700 font-mono">
                      {formatRupiah(totalExpense)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-300 py-2.5 px-3 font-bold">C.</td>
                    <td className="border border-slate-300 py-2.5 px-3 font-bold text-slate-900">
                      SALDO AKHIR KAS (A - B)
                    </td>
                    <td className="border border-slate-300 py-2.5 px-3 text-right font-bold text-slate-900 font-mono text-sm">
                      {formatRupiah(saldoAkhir)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pernyataan Kepatuhan Baku */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Pernyataan Kepatuhan Baku:</strong> Seluruh penggunaan dana BOP RT di atas telah diputuskan melalui musyawarah warga RT {profile.rtNumber} dan dilaksanakan secara transparan dan akuntabel. Sesuai juknis resmi Pemkot Semarang, <strong>DILARANG KERAS</strong> menggunakan dana BOP RT untuk honor, gaji, ataupun insentif pengurus RT.
              </span>
            </div>
          </div>
        )}

        {/* VIEW 2: Buku Kas Umum (BKU) */}
        {reportType === 'bku' && (
          <div className="space-y-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-l-4 border-red-600 pl-2">
              Buku Kas Umum (BKU) - RT {profile.rtNumber} / RW {profile.rwNumber}
            </h4>

            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  <th className="border border-slate-300 py-2 px-2 text-center w-8">No</th>
                  <th className="border border-slate-300 py-2 px-2 text-center w-24">Tanggal</th>
                  <th className="border border-slate-300 py-2 px-2 text-left">Uraian / Keterangan</th>
                  <th className="border border-slate-300 py-2 px-2 text-center w-28">Kategori</th>
                  <th className="border border-slate-300 py-2 px-2 text-right w-28">Penerimaan (Rp)</th>
                  <th className="border border-slate-300 py-2 px-2 text-right w-28">Pengeluaran (Rp)</th>
                  <th className="border border-slate-300 py-2 px-2 text-right w-28">Saldo Kas (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="border border-slate-300 py-8 text-center text-slate-400">
                      Belum ada transaksi tercatat pada periode ini.
                    </td>
                  </tr>
                ) : (
                  (() => {
                    let runningSaldo = 0;
                    return sortedTransactions.map((tx, idx) => {
                      const isInc = tx.type === 'income';
                      if (isInc) runningSaldo += tx.amount;
                      else runningSaldo -= tx.amount;
                      const catDef = getCategoryDefinition(tx.category, categories);

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="border border-slate-300 py-2 px-2 text-center">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-300 py-2 px-2 text-center whitespace-nowrap">
                            {formatDate(tx.date)}
                          </td>
                          <td className="border border-slate-300 py-2 px-2">
                            <div className="font-semibold text-slate-900">{tx.description}</div>
                            <div className="text-[10px] text-slate-500">
                              {tx.documentNumber ? `No: ${tx.documentNumber}` : ''} • Pihak:{' '}
                              {tx.recipientOrDonor}
                            </div>
                          </td>
                          <td className="border border-slate-300 py-2 px-2 text-center">
                            <span className="text-[11px] font-medium text-slate-700">
                              {catDef.name}
                            </span>
                          </td>
                          <td className="border border-slate-300 py-2 px-2 text-right font-medium text-emerald-700 font-mono">
                            {isInc ? formatRupiah(tx.amount) : '-'}
                          </td>
                          <td className="border border-slate-300 py-2 px-2 text-right font-medium text-slate-900 font-mono">
                            {!isInc ? formatRupiah(tx.amount) : '-'}
                          </td>
                          <td className="border border-slate-300 py-2 px-2 text-right font-bold text-slate-900 font-mono">
                            {formatRupiah(runningSaldo)}
                          </td>
                        </tr>
                      );
                    });
                  })()
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 3: Surat Pengantar SPJ Bulanan */}
        {reportType === 'pengantar' && (
          <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
            <div className="flex justify-between items-start">
              <div>
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td className="w-20 font-semibold">Nomor</td>
                      <td>: {dynamicSpjNumber}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Lampiran</td>
                      <td>: 1 (satu) Berkas Lengkap</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Perihal</td>
                      <td className="font-bold">
                        : Laporan Pertanggungjawaban (SPJ) Bantuan Operasional RT (BOP RT) Bulan{' '}
                        {currentMonthInfo.name} {profile.year}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="text-right">
                <p>Semarang, {formatDate(reportDate)}</p>
                <p className="mt-4 font-semibold">Kepada Yth:</p>
                <p className="font-bold uppercase">Lurah {profile.kelurahan}</p>
                <p>Kecamatan {profile.kecamatan}</p>
                <p>Kota Semarang</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200">
              <p>Dengan hormat,</p>
              <p>
                Sehubungan dengan telah dilaksanakannya kegiatan operasional dan pelayanan kemasyarakatan di lingkungan RT {profile.rtNumber} / RW {profile.rwNumber} Kelurahan {profile.kelurahan}, bersama ini kami sampaikan Laporan Pertanggungjawaban (SPJ) penggunaan dana Bantuan Operasional RT (BOP RT) untuk periode <strong>{currentMonthInfo.name} {profile.year}</strong> dengan rincian ringkas sebagai berikut:
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span>1. Penerimaan Dana BOP RT Periode Ini:</span>
                  <strong className="font-mono">{formatRupiah(activeIncome)}</strong>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>2. Realisasi Pengeluaran Belanja Operasional:</span>
                  <strong className="font-mono">{formatRupiah(totalExpense)}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                  <span>3. Saldo Kas Akhir Periode:</span>
                  <strong className="font-mono text-sm">{formatRupiah(saldoAkhir)}</strong>
                </div>
              </div>

              <p>
                Sebagai kelengkapan berkas pertanggungjawaban, bersama surat ini kami lampirkan dokumen pendukung fisik dan digital berupa:
              </p>
              <ol className="list-decimal list-inside pl-2 space-y-1 text-slate-700">
                <li>Buku Kas Umum (BKU) dan Rincian Realisasi Belanja Per Kategori.</li>
                <li>Nota, kwitansi, dan faktur asli pembelian barang/jasa yang sah.</li>
                <li>Notulen Rapat Rutin Warga RT {profile.rtNumber} dan Notulen Rapat PKK.</li>
                <li>Daftar hadir partisipasi warga dalam musyawarah.</li>
                <li>Foto dokumentasi kegiatan dan foto barang hasil belanja.</li>
              </ol>

              <p>
                Demikian surat pengantar laporan pertanggungjawaban ini kami sampaikan untuk dapat dipergunakan sebagaimana mestinya. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.
              </p>
            </div>
          </div>
        )}

        {/* Signature Block (Standard 5-Party RT, RW, and Kelurahan) */}
        <div className="mt-12 pt-6 border-t-2 border-slate-900 page-break-inside-avoid">
          <div className="grid grid-cols-3 gap-6 text-xs text-center">
            <div>
              <p className="font-semibold text-slate-700">Sekretaris RT {profile.rtNumber}</p>
              <div className="h-16"></div>
              <p className="font-bold underline uppercase text-slate-900">{profile.sekretaris}</p>
            </div>

            <div>
              <p className="text-slate-500 mb-0.5">Semarang, {formatDate(reportDate)}</p>
              <p className="font-semibold text-slate-700">Ketua RT {profile.rtNumber}</p>
              <div className="h-16"></div>
              <p className="font-bold underline uppercase text-slate-900">{profile.ketuaRt}</p>
            </div>

            <div>
              <p className="font-semibold text-slate-700">Bendahara RT {profile.rtNumber}</p>
              <div className="h-16"></div>
              <p className="font-bold underline uppercase text-slate-900">{profile.bendaharaRt}</p>
            </div>
          </div>

          <div className="mt-8 pt-4 grid grid-cols-2 gap-8 text-xs text-center border-t border-slate-200">
            <div>
              <p className="font-semibold text-slate-700">Mengetahui,</p>
              <p className="font-semibold uppercase text-slate-900">Ketua RW {profile.rwNumber}</p>
              <div className="h-16"></div>
              <p className="font-bold underline uppercase text-slate-900">{profile.rwChairman}</p>
            </div>

            <div>
              <p className="font-semibold text-slate-700">Mengesahkan,</p>
              <p className="font-semibold uppercase text-slate-900">Lurah {profile.kelurahan}</p>
              <div className="h-16"></div>
              <p className="font-bold underline uppercase text-slate-900">{profile.lurahName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
