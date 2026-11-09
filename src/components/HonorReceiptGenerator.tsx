import React, { useState } from 'react';
import { RtProfile, HonorReceipt, HonorReceiptItem } from '../types';
import { formatDate, formatRupiah } from '../utils/formatters';
import { 
  Receipt, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ExternalLink,
  Loader2,
  UserPlus,
  Save
} from 'lucide-react';
import { downloadElementAsPdf, executePrint, openInNewTab } from '../utils/printHelper';

interface HonorReceiptGeneratorProps {
  profile: RtProfile;
  records: HonorReceipt[];
  onAddRecord: (record: HonorReceipt) => void;
  onDeleteRecord: (id: string) => void;
}

export const HonorReceiptGenerator: React.FC<HonorReceiptGeneratorProps> = ({ 
  profile, 
  records, 
  onAddRecord,
  onDeleteRecord
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'view'>('list');
  const [selectedRecord, setSelectedRecord] = useState<HonorReceipt | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showDeleteMode, setShowDeleteMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<HonorReceipt>>({
    activityName: '',
    date: new Date().toISOString().split('T')[0],
    year: profile.year,
    items: [],
    firstPartyName: profile.ketuaRt,
    secondPartyName: profile.bendaharaRt,
  });

  const [newItem, setNewItem] = useState<Partial<HonorReceiptItem>>({
    name: '',
    position: '',
    qty: 1,
    unit: 'KEG',
    pricePerUnit: 0,
  });

  const handleAddItem = () => {
    if (!newItem.name || !newItem.position || !newItem.pricePerUnit) {
      alert('Mohon isi nama, jabatan, dan harga satuan.');
      return;
    }

    const item: HonorReceiptItem = {
      id: `hri-${Date.now()}`,
      name: newItem.name || '',
      position: newItem.position || '',
      qty: newItem.qty || 1,
      unit: newItem.unit || 'KEG',
      pricePerUnit: newItem.pricePerUnit || 0,
      total: (newItem.qty || 1) * (newItem.pricePerUnit || 0)
    };

    setFormData({
      ...formData,
      items: [...(formData.items || []), item]
    });

    setNewItem({
      name: '',
      position: '',
      qty: 1,
      unit: 'KEG',
      pricePerUnit: 0,
    });
  };

  const handleRemoveItem = (id: string) => {
    setFormData({
      ...formData,
      items: (formData.items || []).filter(i => i.id !== id)
    });
  };

  const handleCreate = () => {
    if (!formData.activityName || !formData.items || formData.items.length === 0) {
      alert('Mohon lengkapi nama kegiatan dan tambahkan minimal satu penerima honor.');
      return;
    }

    const newRecord: HonorReceipt = {
      ...formData as HonorReceipt,
      id: `hr-${Date.now()}`,
    };

    onAddRecord(newRecord);
    setViewMode('list');
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      activityName: '',
      date: new Date().toISOString().split('T')[0],
      year: profile.year,
      items: [],
      firstPartyName: profile.ketuaRt,
      secondPartyName: profile.bendaharaRt,
    });
  };

  const handlePrint = () => {
    if (!selectedRecord) return;
    executePrint(`Tanda Terima Honor - ${selectedRecord.activityName}`);
  };

  const handleDownloadPdf = async () => {
    if (!selectedRecord) return;
    setIsDownloadingPdf(true);
    const filename = `Tanda_Terima_Honor_${selectedRecord.activityName.replace(/\s+/g, '_').substring(0, 30)}.pdf`;
    const success = await downloadElementAsPdf('.official-doc', filename);
    if (!success) {
      executePrint(`Tanda Terima Honor - ${selectedRecord.activityName}`);
    }
    setIsDownloadingPdf(false);
  };

  const totalHonor = (formData.items || []).reduce((sum, item) => sum + item.total, 0);
  const selectedTotalHonor = (selectedRecord?.items || []).reduce((sum, item) => sum + item.total, 0);

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <span>Tanda Terima Honor Tukang / Pekerja</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-arial-narrow">
              Kelola tanda terima pembayaran jasa dan honorarium kegiatan operasional RT.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDeleteMode(!showDeleteMode)}
              className={`font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all cursor-pointer border ${
                showDeleteMode 
                ? 'bg-red-50 text-red-600 border-red-200' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{showDeleteMode ? 'Selesai Hapus' : 'Mode Hapus'}</span>
            </button>
            <button
              onClick={() => setViewMode('create')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Tanda Terima Baru</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.length === 0 ? (
            <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 text-slate-400">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-slate-900 font-bold">Belum Ada Tanda Terima</h3>
              <p className="text-slate-500 text-xs mt-1">Gunakan tombol di atas untuk membuat tanda terima honor pertama Anda.</p>
            </div>
          ) : (
            records.map((rec) => (
              <div 
                key={rec.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <button 
                    onClick={() => onDeleteRecord(rec.id)}
                    className={`${showDeleteMode ? 'text-red-500 scale-110' : 'text-slate-300'} hover:text-red-600 transition-all`}
                    title="Hapus Tanda Terima"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{formatDate(rec.date)}</div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem]">
                    {rec.activityName}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">{rec.items.length} Penerima Honor</div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-sm font-black text-slate-900">
                      {formatRupiah(rec.items.reduce((s, i) => s + i.total, 0))}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRecord(rec);
                        setViewMode('view');
                      }}
                      className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center space-x-1"
                    >
                      <span>Lihat & Cetak</span>
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'create') {
    return (
      <div className="space-y-6 font-arial-narrow">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <button
            onClick={() => setViewMode('list')}
            className="text-slate-600 hover:text-slate-900 flex items-center space-x-2 text-sm font-bold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Kembali ke Daftar</span>
          </button>
          <h2 className="text-lg font-bold text-slate-900">Input Tanda Terima Honor</h2>
          <div className="w-24" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Informasi Kegiatan</h3>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Kegiatan</label>
                <textarea
                  value={formData.activityName}
                  onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                  placeholder="Contoh: PEMELIHARAAN CCTV RT 04 RW 04"
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tanggal</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tahun Anggaran</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Tambah Penerima</h3>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Penerima</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jabatan / Peran</label>
                <input
                  type="text"
                  value={newItem.position}
                  onChange={(e) => setNewItem({ ...newItem, position: e.target.value })}
                  placeholder="Contoh: Tukang"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Qty</label>
                  <input
                    type="number"
                    value={newItem.qty}
                    onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Satuan</label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    placeholder="ORG/KEG"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Harga Satuan (Rp)</label>
                <input
                  type="number"
                  value={newItem.pricePerUnit}
                  onChange={(e) => setNewItem({ ...newItem, pricePerUnit: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none"
                />
              </div>
              <button
                onClick={handleAddItem}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambahkan ke Tabel</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full">
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Daftar Penerima Honor</h3>
                <div className="text-sm font-black text-emerald-700">Total: {formatRupiah(totalHonor)}</div>
              </div>
              
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 border-b border-slate-200">No</th>
                      <th className="px-6 py-3 border-b border-slate-200">Nama</th>
                      <th className="px-6 py-3 border-b border-slate-200">Jabatan</th>
                      <th className="px-6 py-3 border-b border-slate-200">Qty</th>
                      <th className="px-6 py-3 border-b border-slate-200 text-right">Total</th>
                      <th className="px-6 py-3 border-b border-slate-200">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(formData.items || []).map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">{index + 1}</td>
                        <td className="px-6 py-4 font-bold">{item.name}</td>
                        <td className="px-6 py-4">{item.position}</td>
                        <td className="px-6 py-4">{item.qty} {item.unit}</td>
                        <td className="px-6 py-4 text-right font-bold">{formatRupiah(item.total)}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(formData.items || []).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                          Belum ada penerima honor ditambahkan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={handleCreate}
                  disabled={(formData.items || []).length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:shadow-none"
                >
                  <Save className="w-5 h-5" />
                  <span>Simpan & Terbitkan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View & Print Mode
  if (viewMode === 'view' && selectedRecord) {
    return (
      <div className="space-y-6 font-arial-narrow">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <button
            onClick={() => setViewMode('list')}
            className="text-slate-600 hover:text-slate-900 flex items-center space-x-2 text-sm font-bold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Kembali ke Daftar</span>
          </button>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isDownloadingPdf ? 'Memproses PDF...' : 'Unduh PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Print</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('Hapus Tanda Terima Honor ini?')) {
                  onDeleteRecord(selectedRecord.id);
                  setViewMode('list');
                }
              }}
              className="bg-white hover:bg-red-50 text-red-600 font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all cursor-pointer border border-red-100"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus</span>
            </button>
            <button
              onClick={openInNewTab}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 text-xs transition-all cursor-pointer border border-slate-200"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Tab Baru</span>
            </button>
          </div>
        </div>

        {/* Printable Document (Matching PDF Screenshot) */}
        <div className="bg-white p-12 sm:p-16 rounded-2xl border border-slate-200 shadow-sm max-w-[1000px] mx-auto text-slate-900 leading-relaxed official-doc landscape-doc font-arial-narrow overflow-hidden">
          <div className="text-center mb-8 space-y-1">
            <h2 className="text-base font-bold uppercase">TANDA TERIMA HONOR</h2>
            <h2 className="text-base font-bold uppercase leading-tight">KEGIATAN {selectedRecord.activityName} RT {profile.rtNumber} RW {profile.rwNumber} NGABEAN</h2>
            <h2 className="text-base font-bold uppercase">KELURAHAN GUNUNGPATI TAHUN {selectedRecord.year}</h2>
          </div>

          <div className="mb-8 overflow-hidden border border-black">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white border-b border-black">
                  <th className="px-1 py-3 border-r border-black text-center text-[11px] font-bold w-[4%] uppercase">NO</th>
                  <th className="px-2 py-3 border-r border-black text-center text-[11px] font-bold w-[22%] uppercase">NAMA</th>
                  <th className="px-2 py-3 border-r border-black text-center text-[11px] font-bold w-[15%] uppercase">JABATAN</th>
                  <th className="px-1 py-3 border-r border-black text-center text-[11px] font-bold w-[5%] uppercase">QTY</th>
                  <th className="px-1 py-3 border-r border-black text-center text-[11px] font-bold w-[8%] uppercase">SATUAN</th>
                  <th className="px-2 py-3 border-r border-black text-center text-[11px] font-bold w-[12%] uppercase">HARGA SATUAN</th>
                  <th className="px-2 py-3 border-r border-black text-center text-[11px] font-bold w-[12%] uppercase">JUMLAH TERIMA</th>
                  <th className="px-2 py-3 text-center text-[11px] font-bold w-[22%] uppercase">TANDA TANGAN</th>
                </tr>
                {/* Column identifier row as in PDF */}
                <tr className="bg-slate-50/30 border-b border-black text-[10px] text-center">
                  <td className="px-1 border-r border-black font-bold">1</td>
                  <td className="px-1 border-r border-black font-bold">2</td>
                  <td className="px-1 border-r border-black"></td>
                  <td className="px-1 border-r border-black font-bold">5</td>
                  <td className="px-1 border-r border-black font-bold">6</td>
                  <td className="px-1 border-r border-black font-bold">7</td>
                  <td className="px-1 border-r border-black font-bold">8</td>
                  <td className="px-1 font-bold">9</td>
                </tr>
              </thead>
              <tbody>
                {selectedRecord.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-black min-h-[40px]">
                    <td className="px-1 py-3 border-r border-black text-center text-sm">{index + 1}</td>
                    <td className="px-2 py-3 border-r border-black text-sm font-bold uppercase">{item.name}</td>
                    <td className="px-2 py-3 border-r border-black text-sm uppercase">{item.position}</td>
                    <td className="px-1 py-3 border-r border-black text-center text-sm">{item.qty}</td>
                    <td className="px-1 py-3 border-r border-black text-center text-sm uppercase">{item.unit}</td>
                    <td className="px-2 py-3 border-r border-black text-right text-sm">
                      {item.pricePerUnit.toLocaleString('id-ID')}
                    </td>
                    <td className="px-2 py-3 border-r border-black text-right text-sm font-bold">
                      {item.total.toLocaleString('id-ID')}
                    </td>
                    <td className="px-2 py-3 min-h-[45px] relative">
                      <div className={`absolute top-2 ${index % 2 === 0 ? 'left-2' : 'right-10'} text-[11px] font-bold`}>
                        {index + 1}. .............
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Pad with empty rows to match look of typical form if short list */}
                {selectedRecord.items.length < 5 && Array.from({ length: 5 - selectedRecord.items.length }).map((_, idx) => (
                  <tr key={`empty-${idx}`} className="border-b border-black h-10">
                    <td className="px-1 py-3 border-r border-black"></td>
                    <td className="px-2 py-3 border-r border-black"></td>
                    <td className="px-2 py-3 border-r border-black"></td>
                    <td className="px-1 py-3 border-r border-black"></td>
                    <td className="px-1 py-3 border-r border-black"></td>
                    <td className="px-2 py-3 border-r border-black"></td>
                    <td className="px-2 py-3 border-r border-black"></td>
                    <td className="px-2 py-3"></td>
                  </tr>
                ))}
                <tr className="bg-slate-50/50 font-black h-12">
                  <td colSpan={4} className="border-r border-black"></td>
                  <td colSpan={2} className="px-4 py-3 border-r border-black text-center text-sm uppercase">JUMLAH</td>
                  <td className="px-3 py-3 border-r border-black text-right text-sm">
                    Rp {selectedTotalHonor.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-center text-sm"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8 text-center text-sm">
            <div className="space-y-24">
              <div className="font-bold uppercase leading-tight">
                KETUA RT. {profile.rtNumber} RW. {profile.rwNumber}
              </div>
              <div className="space-y-1">
                <p className="font-bold underline uppercase">({selectedRecord.firstPartyName})</p>
              </div>
            </div>
            <div className="space-y-24">
              <div className="font-bold uppercase leading-tight">
                BENDAHARA RT. {profile.rtNumber} RW. {profile.rwNumber}
              </div>
              <div className="space-y-1">
                <p className="font-bold underline uppercase">{selectedRecord.secondPartyName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
