import React, { useState } from 'react';
import { RtProfile, SpkRecord } from '../types';
import { DEFAULT_SEMARANG_LOGO } from '../data/initialData';
import { formatDate, formatRupiah } from '../utils/formatters';
import { 
  FileText, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ExternalLink,
  Loader2,
  Briefcase,
  Pencil,
  X
} from 'lucide-react';
import { downloadElementAsPdf, executePrint, openInNewTab } from '../utils/printHelper';

interface SpkGeneratorProps {
  profile: RtProfile;
  records: SpkRecord[];
  onAddRecord: (record: SpkRecord) => void;
  onUpdateRecord: (record: SpkRecord) => void;
  onDeleteRecord: (id: string) => void;
  onGenerateHonor: (record: SpkRecord) => void;
}

export const SpkGenerator: React.FC<SpkGeneratorProps> = ({ 
  profile, 
  records, 
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onGenerateHonor
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'view'>('list');
  const [selectedRecord, setSelectedRecord] = useState<SpkRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<SpkRecord | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showDeleteMode, setShowDeleteMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<SpkRecord>>({
    spkNumber: `001/SPK-RT.${profile.rtNumber}/XI/${profile.year}`,
    date: new Date().toISOString().split('T')[0],
    contractorAddress: '',
    workDescription: '',
    workLocation: `RT ${profile.rtNumber} RW ${profile.rwNumber} Ngabean`,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    costPerWorker: 150000,
    firstPartyName: profile.ketuaRt,
    workers: [],
  });

  const [newWorkerName, setNewWorkerName] = useState('');

  const handleAddWorker = () => {
    if (!newWorkerName.trim()) return;
    setFormData({
      ...formData,
      workers: [...(formData.workers || []), newWorkerName.trim()]
    });
    setNewWorkerName('');
  };

  const handleRemoveWorker = (index: number) => {
    setFormData({
      ...formData,
      workers: (formData.workers || []).filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    if (!formData.workers || formData.workers.length === 0 || !formData.workDescription) {
      alert('Mohon isi daftar pekerja dan deskripsi pekerjaan.');
      return;
    }

    if (editingRecord) {
      const updatedRecord: SpkRecord = {
        ...editingRecord,
        ...formData as SpkRecord,
      };
      onUpdateRecord(updatedRecord);
    } else {
      const newRecord: SpkRecord = {
        ...formData as SpkRecord,
        id: `spk-${Date.now()}`,
        contractorName: (formData.workers || [])[0] || '',
        secondPartyName: (formData.workers || []).join(', ') || '',
      };
      onAddRecord(newRecord);
    }

    setViewMode('list');
    resetForm();
  };

  const handleEdit = (rec: SpkRecord) => {
    setEditingRecord(rec);
    setFormData({
      ...rec,
      workers: rec.workers || [],
      costPerWorker: rec.costPerWorker || 150000
    });
    setViewMode('create');
  };

  const resetForm = () => {
    setEditingRecord(null);
    setFormData({
      spkNumber: `001/SPK-RT.${profile.rtNumber}/XI/${profile.year}`,
      date: new Date().toISOString().split('T')[0],
      contractorAddress: '',
      workDescription: '',
      workLocation: `RT ${profile.rtNumber} RW ${profile.rwNumber} Ngabean`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      costPerWorker: 150000,
      firstPartyName: profile.ketuaRt,
      workers: [],
    });
    setNewWorkerName('');
  };

  const handlePrint = () => {
    if (!selectedRecord) return;
    executePrint(`SPK - ${selectedRecord.spkNumber}`);
  };

  const handleDownloadPdf = async () => {
    if (!selectedRecord) return;
    setIsDownloadingPdf(true);
    const filename = `SPK_${selectedRecord.spkNumber.replace(/\//g, '_')}.pdf`;
    const success = await downloadElementAsPdf('.official-doc', filename);
    if (!success) {
      executePrint(`SPK - ${selectedRecord.spkNumber}`);
    }
    setIsDownloadingPdf(false);
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <span>Surat Perintah Kerja (SPK)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-arial-narrow">
              Daftar dokumen penugasan pekerjaan fisik atau jasa yang didanai oleh BOP RT.
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat SPK Baru</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.length === 0 ? (
            <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-slate-900 font-bold">Belum Ada SPK</h3>
              <p className="text-slate-500 text-xs mt-1">Gunakan tombol di atas untuk membuat Surat Perintah Kerja pertama Anda.</p>
            </div>
          ) : (
            records.map((rec) => (
              <div 
                key={rec.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleEdit(rec)}
                      className="text-slate-300 hover:text-indigo-600 transition-colors"
                      title="Edit SPK"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {(showDeleteMode || true) && (
                      <button 
                        onClick={() => onDeleteRecord(rec.id)}
                        className={`${showDeleteMode ? 'text-red-500 scale-110' : 'text-slate-300'} hover:text-red-600 transition-all`}
                        title="Hapus SPK"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{rec.spkNumber}</div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem]">
                    {rec.workDescription}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium truncate">
                    {rec.workers?.join(', ') || '-'}
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{(rec.workers?.length || 0)} Pekerja</div>
                    <button
                      onClick={() => {
                        setSelectedRecord(rec);
                        setViewMode('view');
                      }}
                      className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center space-x-1"
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
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <button
            onClick={() => setViewMode('list')}
            className="text-slate-600 hover:text-slate-900 flex items-center space-x-2 text-sm font-bold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Kembali ke Daftar SPK</span>
          </button>
          <h2 className="text-lg font-bold text-slate-900">{editingRecord ? 'Edit Data SPK' : 'Form Pembuatan SPK Baru'}</h2>
          <div className="w-24" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Detail Penugasan Pekerja</span>
            </h3>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nomor SPK</label>
                <input
                  type="text"
                  value={formData.spkNumber}
                  onChange={(e) => setFormData({ ...formData, spkNumber: e.target.value })}
                  placeholder="Contoh: 001/SPK-RT.04/XI/2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tanggal Surat</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Daftar Pekerja yang Ditunjuk</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newWorkerName}
                    onChange={(e) => setNewWorkerName(e.target.value)}
                    placeholder="Nama pekerja..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddWorker())}
                  />
                  <button
                    type="button"
                    onClick={handleAddWorker}
                    className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-bold shrink-0"
                  >
                    Tambah
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.workers || []).map((w, idx) => (
                    <div key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-2 border border-indigo-100">
                      <span>{w}</span>
                      <button onClick={() => handleRemoveWorker(idx)} className="text-indigo-400 hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(formData.workers || []).length === 0 && (
                    <div className="text-[10px] text-slate-400 italic">Belum ada pekerja ditambahkan</div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Biaya Per Pekerja (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Rp</span>
                  <input
                    type="number"
                    value={formData.costPerWorker}
                    onChange={(e) => setFormData({ ...formData, costPerWorker: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1 italic">* Digunakan sebagai dasar pembuatan tanda terima honor otomatis.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Alamat / Lingkungan Pekerja</label>
                <textarea
                  rows={2}
                  value={formData.contractorAddress}
                  onChange={(e) => setFormData({ ...formData, contractorAddress: e.target.value })}
                  placeholder="Contoh: RT 04 RW 04 Ngabean"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Uraian Pekerjaan</label>
                <textarea
                  rows={2}
                  value={formData.workDescription}
                  onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                  placeholder="Detail tugas yang diberikan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tgl Mulai</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tgl Selesai</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lokasi Pekerjaan</label>
                <input
                  type="text"
                  value={formData.workLocation}
                  onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center space-x-2"
            >
              <span>{editingRecord ? 'Simpan Perubahan' : 'Simpan & Terbitkan SPK'}</span>
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View & Print Mode
  if (viewMode === 'view' && selectedRecord) {
    return (
      <div className="space-y-6">
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
              onClick={() => onGenerateHonor(selectedRecord)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Tanda Terima Honor</span>
            </button>
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
                if (window.confirm('Hapus SPK ini?')) {
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

        {/* Printable Document */}
        <div className="bg-white p-10 sm:p-16 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto text-slate-900 leading-relaxed font-arial-narrow official-doc">
          {/* Kop Surat */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
            <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
              <img src={profile.logoUrl || DEFAULT_SEMARANG_LOGO} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-center flex-grow px-2">
              <div className="text-[14px] font-bold uppercase leading-tight text-slate-900">PEMERINTAH KOTA SEMARANG</div>
              <div className="text-[14px] font-bold uppercase leading-tight text-slate-900">KECAMATAN {profile.kecamatan}</div>
              <div className="text-[14px] font-bold uppercase leading-tight text-slate-900">KELURAHAN {profile.kelurahan}</div>
              <div className="text-[20px] font-bold uppercase leading-tight mt-1 text-slate-900">RUKUN TETANGGA {profile.rtNumber} RUKUN WARGA {profile.rwNumber}</div>
              <p className="text-[10px] text-slate-600">Alamat: Ngabean RT {profile.rtNumber} RW {profile.rwNumber} Kel. {profile.kelurahan} Kec. {profile.kecamatan} Kota Semarang</p>
            </div>
            <div className="w-24 h-24 flex-shrink-0" />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-base font-black uppercase underline underline-offset-2 text-slate-900">SURAT PERINTAH KERJA (SPK)</h2>
            <p className="text-sm font-bold mt-1 text-slate-900">Nomor: {selectedRecord.spkNumber}</p>
          </div>

          <div className="space-y-6 text-sm text-slate-900">
            <p>Pada hari ini, <strong>{formatDate(selectedRecord.date)}</strong>, yang bertanda tangan di bawah ini:</p>
            
            <div className="space-y-1">
              <div className="flex">
                <span className="w-8">I.</span>
                <div className="flex-1">
                  <div className="flex"><span className="w-32 font-bold">Nama</span><span>: {selectedRecord.firstPartyName}</span></div>
                  <div className="flex"><span className="w-32 font-bold">Jabatan</span><span>: Ketua RT {profile.rtNumber} RW {profile.rwNumber}</span></div>
                  <p className="mt-1">Selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong> (Pemberi Kerja).</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex">
                <span className="w-8">II.</span>
                <div className="flex-1">
                  <div className="flex">
                    <span className="w-32 font-bold">Nama Pekerja</span>
                    <div className="flex-1">
                      : {(selectedRecord.workers || []).map((w, i) => <div key={i}>{i+1}. {w}</div>)}
                      {(selectedRecord.workers || []).length === 0 && (selectedRecord as any).contractorName}
                    </div>
                  </div>
                  <div className="flex mt-1"><span className="w-32 font-bold">Alamat</span><span>: {selectedRecord.contractorAddress}</span></div>
                  <p className="mt-1">Selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong> (Pelaksana Kerja).</p>
                </div>
              </div>
            </div>

            <p className="indent-8">
              <strong>PIHAK PERTAMA</strong> memberikan perintah kerja kepada <strong>PIHAK KEDUA</strong>, dan <strong>PIHAK KEDUA</strong> menyatakan bersedia melaksanakan pekerjaan sesuai dengan ketentuan sebagai berikut:
            </p>

            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-40 py-1.5 font-bold align-top">Jenis Pekerjaan</td>
                  <td className="py-1.5 align-top">: {selectedRecord.workDescription}</td>
                </tr>
                <tr>
                  <td className="w-40 py-1.5 font-bold align-top">Lokasi Pekerjaan</td>
                  <td className="py-1.5 align-top">: {selectedRecord.workLocation}</td>
                </tr>
                <tr>
                  <td className="w-40 py-1.5 font-bold align-top">Waktu Pelaksanaan</td>
                  <td className="py-1.5 align-top">: {formatDate(selectedRecord.startDate)} s/d {formatDate(selectedRecord.endDate)}</td>
                </tr>
              </tbody>
            </table>

            <div className="space-y-4 pt-2">
              <p className="font-bold underline italic">Pasal 1: Lingkup Pekerjaan & Penyediaan Material</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>PIHAK KEDUA wajib melaksanakan pekerjaan dengan sebaik-baiknya, tepat waktu, dan sesuai dengan spesifikasi yang telah disepakati.</li>
                <li>Seluruh penyediaan <strong>bahan, material, dan peralatan kerja</strong> yang dibutuhkan untuk pekerjaan ini menjadi tanggung jawab dan disediakan sepenuhnya oleh <strong>PIHAK PERTAMA</strong>.</li>
                <li>Nilai pembayaran upah kerja akan diberikan sesuai dengan tanda terima honorarium terpisah.</li>
              </ul>
              
              <p className="font-bold underline italic text-xs mt-4">Pasal 2: Pembayaran</p>
              <p>Pembayaran akan dilakukan oleh PIHAK PERTAMA kepada PIHAK KEDUA secara tunai atau transfer setelah seluruh pekerjaan selesai dilaksanakan 100% dan diterima dengan baik oleh PIHAK PERTAMA, menggunakan dana Bantuan Operasional RT (BOP RT) Tahun Anggaran {profile.year}.</p>
            </div>

            <p className="pt-4 text-justify">Demikian Surat Perintah Kerja ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8 text-center">
            <div className="space-y-20">
              <div className="text-sm font-bold uppercase italic border-b border-slate-900 pb-1 inline-block text-slate-900">PIHAK KEDUA (PELAKSANA)</div>
              <div className="space-y-1">
                <div className="text-sm font-bold underline uppercase text-slate-900">
                   ( ................................... )
                </div>
                <p className="text-[10px] text-slate-500 italic mt-0.5">
                  Beserta {(selectedRecord.workers?.length || 0)} orang anggota tim
                </p>
                <p className="text-xs text-slate-500 uppercase">Pelaksana Kerja</p>
              </div>
            </div>
            <div className="space-y-20">
              <div className="space-y-1">
                <p className="text-sm text-slate-900">Semarang, {formatDate(selectedRecord.date)}</p>
                <div className="text-sm font-bold uppercase italic border-b border-slate-900 pb-1 inline-block text-slate-900">PIHAK PERTAMA (PEMBERI KERJA)</div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold underline uppercase text-slate-900">{selectedRecord.firstPartyName}</p>
                <p className="text-xs text-slate-500 uppercase">Ketua RT {profile.rtNumber} RW {profile.rwNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
