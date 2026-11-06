import React, { useState, useEffect } from 'react';
import { Transaction, TransactionCategory, TransactionType, CategoryDefinition } from '../types';
import { categoryColorPresets, defaultCategories, getCategoryDefinition } from '../data/initialData';
import { X, AlertCircle, CheckCircle2, Plus, Tag, Sparkles } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  editData?: Transaction | null;
  categories?: CategoryDefinition[];
  onAddCategory?: (cat: CategoryDefinition) => void;
  currentBalance?: number;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
  categories = defaultCategories,
  onAddCategory,
  currentBalance = 0,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<TransactionCategory>('kebersihan');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [recipientOrDonor, setRecipientOrDonor] = useState('');
  const [notes, setNotes] = useState('');
  const [hasMusyawarah, setHasMusyawarah] = useState(true);
  const [documentNumber, setDocumentNumber] = useState('');

  // State for creating new custom category
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState(categoryColorPresets[0].value);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Available expense categories (exclude 'lainnya' from expense recommendation unless chosen)
  const expenseCategories = categories.filter((c) => c.id !== 'lainnya');

  useEffect(() => {
    if (editData) {
      setDate(editData.date);
      setType(editData.type);
      setCategory(editData.category);
      setDescription(editData.description);
      setAmount(editData.amount);
      setRecipientOrDonor(editData.recipientOrDonor);
      setNotes(editData.notes || '');
      setHasMusyawarah(editData.hasMusyawarah);
      setDocumentNumber(editData.documentNumber || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setType('expense');
      setCategory('kebersihan');
      setDescription('');
      setAmount('');
      setRecipientOrDonor('');
      setNotes('');
      setHasMusyawarah(true);
      setDocumentNumber('');
    }
    setIsAddingNewCategory(false);
    setCategoryError(null);
  }, [editData, isOpen]);

  if (!isOpen) return null;

  // Check for forbidden honor/gaji keywords
  const isHonorSuspicious =
    description.toLowerCase().includes('honor') ||
    description.toLowerCase().includes('gaji') ||
    description.toLowerCase().includes('insentif') ||
    description.toLowerCase().includes('fee pengurus');

  const handleCreateCategory = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setCategoryError('Nama kategori tidak boleh kosong!');
      return;
    }

    const catSlug = newCatName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    const newCategoryDef: CategoryDefinition = {
      id: catSlug || `cat_${Date.now()}`,
      name: newCatName.trim(),
      desc: newCatDesc.trim() || `Kategori kustom BOP RT: ${newCatName.trim()}`,
      color: newCatColor,
      isCustom: true,
    };

    if (onAddCategory) {
      onAddCategory(newCategoryDef);
    }
    setCategory(newCategoryDef.id);
    setIsAddingNewCategory(false);
    setNewCatName('');
    setNewCatDesc('');
    setCategoryError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const txAmount = Number(amount);

    // Validation: Balance check
    if (type === 'expense' && currentBalance !== undefined && txAmount > currentBalance) {
      const confirmOverBudget = window.confirm(
        `PERINGATAN SALDO: Nominal pengeluaran (Rp ${txAmount.toLocaleString('id-ID')}) melebihi saldo kas saat ini (Rp ${currentBalance.toLocaleString('id-ID')}). Tetap lanjutkan?`
      );
      if (!confirmOverBudget) return;
    }

    // Mandatory category validation for expense
    if (type === 'expense') {
      if (!category || category.trim() === '') {
        setCategoryError('Setiap pengeluaran wajib memiliki kategori yang jelas!');
        alert('Setiap pengeluaran BOP RT wajib memiliki kategori yang jelas! Silakan pilih salah satu kategori.');
        return;
      }
    }

    if (!description || !amount || !recipientOrDonor) {
      alert('Mohon lengkapi kolom yang wajib diisi (Uraian, Nominal, dan Penerima/Toko)!');
      return;
    }

    if (isHonorSuspicious) {
      const confirmHonor = window.confirm(
        'PERINGATAN ATURAN BOP RT KOTA SEMARANG:\nDana BOP RT DILARANG KERAS untuk honor atau gaji pengurus RT. Yakin ingin melanjutkan?'
      );
      if (!confirmHonor) return;
    }

    const selectedCategoryFinal = type === 'income' ? 'lainnya' : category;

    const newTx: Transaction = {
      id: editData ? editData.id : `tx-${Date.now()}`,
      date,
      type,
      category: selectedCategoryFinal,
      description,
      amount: Number(amount),
      recipientOrDonor,
      notes,
      hasMusyawarah,
      documentNumber,
    };

    onSave(newTx);
    onClose();
  };

  const activeCategoryInfo = getCategoryDefinition(category, categories);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              {editData ? 'Edit Transaksi BOP RT' : 'Catat Transaksi Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              Setiap pengeluaran wajib tercatat dengan kategori resmi atau kategori kustom.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase mb-2">
              Jenis Transaksi *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  if (category === 'lainnya') setCategory('kebersihan');
                }}
                className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all flex items-center justify-center text-center leading-tight ${
                  type === 'expense'
                    ? 'bg-red-600 text-white border-red-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Kas Keluar (Pengeluaran)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory('lainnya');
                }}
                className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all flex items-center justify-center text-center leading-tight ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Kas Masuk (APBD)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase mb-1.5">
                Tanggal Transaksi *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase mb-1.5">
                Nomor Nota / Kwitansi
              </label>
              <input
                type="text"
                placeholder="Cth: NOTA-012/IV/2026"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          {/* Category Section with Option to Pick Existing or Add New */}
          {type === 'expense' && (
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-800 uppercase">
                  Kategori Peruntukan *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingNewCategory ? 'Batal' : '+ Kategori Baru'}</span>
                </button>
              </div>

              {!isAddingNewCategory ? (
                <>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setCategoryError(null);
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <optgroup label="Standar Juknis BOP RT">
                      {defaultCategories
                        .filter((c) => c.id !== 'lainnya')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </optgroup>
                    {categories.filter((c) => c.isCustom).length > 0 && (
                      <optgroup label="Kategori Kustom">
                        {categories
                          .filter((c) => c.isCustom)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              ★ {c.name}
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">Label:</span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${activeCategoryInfo.color}`}
                      >
                        {activeCategoryInfo.name}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                /* Inline Custom Category Creator */
                <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm space-y-3">
                  <div className="flex items-center space-x-1.5 text-sm font-bold text-red-800">
                    <Sparkles className="w-4 h-4 text-red-600" />
                    <span>Buat Kategori Baru</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Nama Kategori *
                    </label>
                    <input
                      type="text"
                      placeholder="Cth: Keamanan Lingkungan"
                      value={newCatName}
                      onChange={(e) => {
                        setNewCatName(e.target.value);
                        setCategoryError(null);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCategory(false)}
                      className="text-xs px-3 py-1.5 text-slate-500 font-semibold hover:text-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="text-xs px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm"
                    >
                      Simpan & Pakai
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase mb-1.5">
              Uraian Kegiatan *
            </label>
            <input
              type="text"
              required
              placeholder="Cth: Pembelian alat kebersihan gerobak sampah"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase mb-1.5">
                Nominal (Rp) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="Cth: 1500000"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value === '' ? '' : Number(e.target.value));
                  setCategoryError(null);
                }}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  type === 'expense' && amount && currentBalance !== undefined && Number(amount) > currentBalance
                    ? 'border-red-500 focus:ring-red-500/20 bg-red-50'
                    : 'border-slate-200 focus:ring-red-500/20 focus:border-red-500'
                }`}
              />
              {type === 'expense' && amount && currentBalance !== undefined && Number(amount) > currentBalance && (
                <div className="mt-1.5 text-xs text-red-600 font-bold flex items-center gap-1 bg-red-50 p-1.5 rounded-lg border border-red-100">
                  <AlertCircle className="w-4 h-4" />
                  <span>Melebihi Saldo (Rp {currentBalance.toLocaleString('id-ID')})</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase mb-1.5">
                {type === 'income' ? 'Sumber Dana *' : 'Toko / Penerima *'}
              </label>
              <input
                type="text"
                required
                placeholder={type === 'income' ? 'Cth: Pemkot Semarang' : 'Cth: Toko Makmur Jaya'}
                value={recipientOrDonor}
                onChange={(e) => setRecipientOrDonor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase mb-1.5">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Cth: Disetujui dalam rapat warga"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {type === 'expense' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start space-x-3">
              <input
                type="checkbox"
                id="musyawarahCheck"
                checked={hasMusyawarah}
                onChange={(e) => setHasMusyawarah(e.target.checked)}
                className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
              />
              <label htmlFor="musyawarahCheck" className="text-xs text-slate-700 cursor-pointer">
                <span className="font-bold text-slate-900 text-sm">
                  Disetujui dalam Musyawarah Warga
                </span>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Konfirmasi bahwa pengeluaran ini sudah disepakati dalam musyawarah warga RT 04 sesuai Juknis Pemkot Semarang.
                </p>
              </label>
            </div>
          )}

          {isHonorSuspicious && (
            <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="font-bold uppercase tracking-tight">
                Peringatan: Dana BOP RT dilarang keras untuk honor/gaji pengurus!
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-[2] px-6 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 shadow-sm transition-all active:scale-[0.98]"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
