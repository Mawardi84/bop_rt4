import React, { useState, useMemo } from 'react';
import { Transaction, TransactionCategory, TransactionType, CategoryDefinition } from '../types';
import { defaultCategories, getCategoryDefinition, categoryColorPresets } from '../data/initialData';
import { formatRupiah, formatDate } from '../utils/formatters';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Calendar,
  Tags,
  Download,
  RotateCcw,
  X,
  PlusCircle,
  FolderPlus,
  Zap,
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  categories?: CategoryDefinition[];
  onAddCategory?: (cat: CategoryDefinition) => void;
  onDeleteCategory?: (id: string) => void;
  onAbsorbRapToTransactions?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  categories = defaultCategories,
  onAddCategory,
  onDeleteCategory,
  onAbsorbRapToTransactions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Date filter controls
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'month' | 'range' | 'rapel'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(new Date().getMonth() + 1).padStart(2, '0')
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Category Manager Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState(categoryColorPresets[0].value);
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);

  const monthsList = [
    { value: '01', name: 'Januari' },
    { value: '02', name: 'Februari' },
    { value: '03', name: 'Maret' },
    { value: '04', name: 'April' },
    { value: '05', name: 'Mei' },
    { value: '06', name: 'Juni' },
    { value: '07', name: 'Juli' },
    { value: '08', name: 'Agustus' },
    { value: '09', name: 'September' },
    { value: '10', name: 'Oktober' },
    { value: '11', name: 'November' },
    { value: '12', name: 'Desember' },
  ];

  // Filtering transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search matching
      const matchesSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.recipientOrDonor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.documentNumber && tx.documentNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category matching
      const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;

      // Type matching
      const matchesType = selectedType === 'all' || tx.type === selectedType;

      // Date matching
      let matchesDate = true;
      if (dateFilterMode === 'month' && selectedMonth) {
        // Date format YYYY-MM-DD
        const txMonth = tx.date.split('-')[1];
        matchesDate = txMonth === selectedMonth;
      } else if (dateFilterMode === 'rapel') {
        const txMonth = parseInt(tx.date.split('-')[1], 10);
        matchesDate = txMonth >= 1 && txMonth <= 8;
      } else if (dateFilterMode === 'range') {
        if (startDate && tx.date < startDate) matchesDate = false;
        if (endDate && tx.date > endDate) matchesDate = false;
      }

      return matchesSearch && matchesCategory && matchesType && matchesDate;
    });
  }, [transactions, searchTerm, selectedCategory, selectedType, dateFilterMode, selectedMonth, startDate, endDate]);

  // Sort by date descending
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredTransactions]);

  // Compute summary numbers for filtered transactions
  const summaryMetrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of sortedTransactions) {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
      }
    }
    return {
      count: sortedTransactions.length,
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    };
  }, [sortedTransactions]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedType('all');
    setDateFilterMode('all');
    setStartDate('');
    setEndDate('');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (sortedTransactions.length === 0) {
      alert('Tidak ada transaksi untuk diekspor.');
      return;
    }

    const headers = [
      'Tanggal',
      'No Dokumen/Nota',
      'Jenis',
      'Kategori',
      'Uraian Transaksi',
      'Pemberi/Toko/Penerima',
      'Nominal (Rp)',
      'Status Musyawarah',
      'Catatan',
    ];

    const rows = sortedTransactions.map((tx) => [
      tx.date,
      `"${(tx.documentNumber || '-').replace(/"/g, '""')}"`,
      tx.type === 'income' ? 'Kas Masuk' : 'Kas Keluar',
      `"${getCategoryDefinition(tx.category, categories).name.replace(/"/g, '""')}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      `"${tx.recipientOrDonor.replace(/"/g, '""')}"`,
      tx.amount,
      tx.hasMusyawarah ? 'Disetujui Warga' : 'Belum Musyawarah',
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Riwayat_Transaksi_BOP_RT_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add category handler from modal
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setCategoryFormError('Nama kategori wajib diisi!');
      return;
    }

    const catSlug = newCatName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    const newCatDef: CategoryDefinition = {
      id: catSlug || `cat_${Date.now()}`,
      name: newCatName.trim(),
      desc: newCatDesc.trim() || `Kategori kustom: ${newCatName.trim()}`,
      color: newCatColor,
      isCustom: true,
    };

    if (onAddCategory) {
      onAddCategory(newCatDef);
    }
    setNewCatName('');
    setNewCatDesc('');
    setCategoryFormError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header section with Action Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Riwayat Penggunaan Dana BOP RT</h2>
            <span className="bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-red-200">
              {transactions.length} Total Catatan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Riwayat lengkap transaksi penggunaan dana BOP RT dengan tanggal, uraian, nominal, dan pengkategorian wajib.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onAbsorbRapToTransactions && (
            <button
              onClick={onAbsorbRapToTransactions}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 text-xs transition-all"
              title="Serap seluruh data Rencana Anggaran Penggunaan (RAP) otomatis ke dalam transaksi kas keluar"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-200" />
              <span>Serap RAP ke Transaksi</span>
            </button>
          )}

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-3.5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 text-xs transition-all"
            title="Kelola & Tambah Kategori Pengeluaran"
          >
            <Tags className="w-4 h-4 text-slate-600" />
            <span>Kelola Kategori ({categories.length})</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-3.5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 text-xs transition-all"
            title="Ekspor data terfilter ke CSV/Excel"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={onAddTransaction}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Search, Date Filter, Category Filter, and Type */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Row 1: Search & Filter Mode Toggles */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari transaksi berdasarkan uraian kegiatan, toko/vendor, atau no. nota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Category */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-600 hidden sm:inline">Kategori:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <option value="all">Semua Kategori ({transactions.length})</option>
                <optgroup label="Kategori Standar BOP RT">
                  {defaultCategories.map((c) => {
                    const count = transactions.filter((t) => t.category === c.id).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} ({count})
                      </option>
                    );
                  })}
                </optgroup>
                {categories.filter((c) => c.isCustom).length > 0 && (
                  <optgroup label="Kategori Kustom">
                    {categories
                      .filter((c) => c.isCustom)
                      .map((c) => {
                        const count = transactions.filter((t) => t.category === c.id).length;
                        return (
                          <option key={c.id} value={c.id}>
                            ★ {c.name} ({count})
                          </option>
                        );
                      })}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Filter by Type */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-600 hidden sm:inline">Jenis:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <option value="all">Semua Jenis</option>
                <option value="income">Kas Masuk (Pencairan)</option>
                <option value="expense">Kas Keluar (Belanja)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Date Filters Controls */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 text-xs text-slate-500 font-semibold mr-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter Tanggal:</span>
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setDateFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  dateFilterMode === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Tanggal
              </button>
              <button
                type="button"
                onClick={() => setDateFilterMode('month')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  dateFilterMode === 'month'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pilih Bulan
              </button>
              <button
                type="button"
                onClick={() => setDateFilterMode('rapel')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  dateFilterMode === 'rapel'
                    ? 'bg-white text-red-700 shadow-xs font-bold ring-1 ring-red-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rapel Jan – Agu (8 Bln)
              </button>
              <button
                type="button"
                onClick={() => setDateFilterMode('range')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  dateFilterMode === 'range'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rentang Tanggal
              </button>
            </div>

            {/* If Month mode selected */}
            {dateFilterMode === 'month' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                {monthsList.map((m) => (
                  <option key={m.value} value={m.value}>
                    Bulan {m.name}
                  </option>
                ))}
              </select>
            )}

            {/* If Range mode selected */}
            {dateFilterMode === 'range' && (
              <div className="flex items-center space-x-2 text-xs">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                  title="Dari Tanggal"
                />
                <span className="text-slate-400">s/d</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                  title="Sampai Tanggal"
                />
              </div>
            )}
          </div>

          {/* Reset Filters button */}
          {(searchTerm ||
            selectedCategory !== 'all' ||
            selectedType !== 'all' ||
            dateFilterMode !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center space-x-1 ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all border ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua ({transactions.length})
          </button>
          {categories.map((cat) => {
            const count = transactions.filter((t) => t.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all border flex items-center space-x-1.5 ${
                  isSelected
                    ? `${cat.color} font-bold ring-2 ring-red-500/30 shadow-xs`
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Summary Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Transaksi Terfilter</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {summaryMetrics.count}{' '}
            <span className="text-xs font-normal text-slate-500">
              dari {transactions.length} transaksi
            </span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 uppercase flex items-center space-x-1">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Total Kas Masuk</span>
          </p>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {formatRupiah(summaryMetrics.totalIncome)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-red-600 uppercase flex items-center space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Total Pengeluaran</span>
          </p>
          <p className="text-xl font-bold text-red-600 mt-1">
            {formatRupiah(summaryMetrics.totalExpense)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Saldo Kas Periode</p>
          <p
            className={`text-xl font-bold mt-1 ${
              summaryMetrics.balance >= 0 ? 'text-slate-900' : 'text-amber-600'
            }`}
          >
            {formatRupiah(summaryMetrics.balance)}
          </p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Tanggal & Nota</th>
                <th className="py-3.5 px-4">Uraian & Keterangan</th>
                <th className="py-3.5 px-4">Kategori Peruntukan</th>
                <th className="py-3.5 px-4">Pemberi / Toko</th>
                <th className="py-3.5 px-4 text-right">Jumlah (Rp)</th>
                <th className="py-3.5 px-4 text-center">Musyawarah Warga</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {sortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400 text-sm">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-600">Tidak ada riwayat transaksi</p>
                      <p className="text-xs text-slate-400">
                        Tidak ada transaksi yang cocok dengan filter tanggal atau kategori yang dipilih.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
                      >
                        Reset semua filter
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const catDef = getCategoryDefinition(tx.category, categories);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Tanggal & Nota */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{formatDate(tx.date)}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {tx.documentNumber || '-'}
                        </div>
                      </td>

                      {/* Deskripsi */}
                      <td className="py-4 px-4 max-w-sm">
                        <div className="font-medium text-slate-900 leading-snug">
                          {tx.description}
                        </div>
                        {tx.notes && <div className="text-xs text-slate-500 mt-0.5">{tx.notes}</div>}
                      </td>

                      {/* Kategori with Tag Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${catDef.color}`}
                          title={catDef.desc}
                        >
                          {catDef.name}
                        </span>
                      </td>

                      {/* Pemberi / Toko */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-600 text-xs">
                        {tx.recipientOrDonor}
                      </td>

                      {/* Jumlah Nominal */}
                      <td
                        className={`py-4 px-4 whitespace-nowrap text-right font-bold font-mono ${
                          isIncome ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+ ' : '- '}
                        {formatRupiah(tx.amount)}
                      </td>

                      {/* Musyawarah Status */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        {tx.hasMusyawarah ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Disetujui Warga</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Belum Musyawarah</span>
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                            title="Edit Transaksi"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus transaksi "${tx.description}"?`)) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Manager Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center space-x-2">
                <Tags className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-900 text-lg">
                  Sistem Pengkategorian Dana BOP RT
                </h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Info text */}
              <div className="bg-blue-50 text-blue-800 p-3.5 rounded-xl text-xs leading-relaxed border border-blue-200">
                Setiap transaksi pengeluaran BOP RT wajib memiliki kategori yang jelas sesuai ketentuan Pemkot Semarang. Anda dapat menggunakan kategori standar (kebersihan, sosial, pemberdayaan, ketahanan pangan, administrasi) atau menambahkan kategori kustom baru sesuai kebutuhan warga.
              </div>

              {/* Form Tambah Kategori Baru */}
              <form onSubmit={handleAddCategorySubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center space-x-1.5">
                  <PlusCircle className="w-4 h-4 text-red-600" />
                  <span>Tambah Kategori Pengeluaran Baru</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Kategori *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Cth: Keamanan Lingkungan & Kamtibmas"
                    value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      setCategoryFormError(null);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Keterangan Peruntukan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Cth: Pengadaan perlengkapan pos ronda, patroli keamanan warga"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Warna Badge Label
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoryColorPresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setNewCatColor(preset.value)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${preset.value} ${
                          newCatColor === preset.value
                            ? 'ring-2 ring-red-500 font-bold scale-105 shadow-xs'
                            : 'opacity-75 hover:opacity-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {categoryFormError && (
                  <p className="text-xs text-red-600 font-medium">{categoryFormError}</p>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors"
                  >
                    Simpan Kategori Baru
                  </button>
                </div>
              </form>

              {/* Daftar Kategori Saat Ini */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase">
                  Daftar Kategori Terdaftar ({categories.length})
                </h4>

                <div className="space-y-2">
                  {categories.map((cat) => {
                    const usageCount = transactions.filter((t) => t.category === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cat.color}`}
                            >
                              {cat.name}
                            </span>
                            {cat.isCustom && (
                              <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.2 rounded-md font-medium border border-amber-200">
                                Kustom
                              </span>
                            )}
                          </div>
                          {cat.desc && <p className="text-xs text-slate-500">{cat.desc}</p>}
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-medium text-slate-400">
                            {usageCount} transaksi
                          </span>
                          {cat.isCustom && onDeleteCategory && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Hapus kategori "${cat.name}"? Pastikan tidak ada transaksi penting yang menggunakannya.`
                                  )
                                ) {
                                  onDeleteCategory(cat.id);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus Kategori Kustom"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
