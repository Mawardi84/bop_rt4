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
  X,
  CheckCircle2,
  ClipboardCheck,
  UserCheck,
  Eye,
  Save,
  FileCheck,
  Calendar,
  SlidersHorizontal
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
  
  // Document display mode in View: 'spk' (Surat Perintah Kerja) or 'laporan-sekretaris' (Laporan Pelaksanaan Kegiatan)
  const [activeDocType, setActiveDocType] = useState<'spk' | 'laporan-sekretaris'>('spk');
  const [reportOrientation, setReportOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isEditingReport, setIsEditingReport] = useState<boolean>(false);

  // States for customizing Laporan Pelaksanaan Kegiatan Sekretaris
  const [tempReportNumber, setTempReportNumber] = useState<string>('');
  const [tempReportDate, setTempReportDate] = useState<string>('');
  const [tempReportNotes, setTempReportNotes] = useState<string>('');
  const [tempReportProgress, setTempReportProgress] = useState<number>(100);
  const [tempReportSecretary, setTempReportSecretary] = useState<string>('');

  // Form State for creating/editing SPK
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

  const handleSelectRecord = (rec: SpkRecord, docType: 'spk' | 'laporan-sekretaris' = 'spk') => {
    setSelectedRecord(rec);
    setActiveDocType(docType);
    
    // Initialize temporary report values from record or intelligent defaults
    const spkNumParts = rec.spkNumber.split('/');
    const codePart = spkNumParts[0] || '001';
    const monthPart = spkNumParts[3] || 'XI';
    
    setTempReportNumber(rec.reportNumber || `${codePart}/LAP-SPK/RT.${profile.rtNumber}/${monthPart}/${profile.year}`);
    setTempReportDate(rec.reportDate || rec.endDate || rec.date);
    setTempReportNotes(
      rec.reportNotes || 
      'Pekerjaan fisik/jasa telah dilaksanakan secara swakelola dengan baik, tepat waktu, dan sesuai spesifikasi arahan Pengurus RT 04 RW 04 Ngabean. Seluruh kebutuhan material, peralatan, dan logistik pendukung disediakan oleh Pengurus RT dari dana BOP RT. Hasil pekerjaan telah ditinjau langsung di lokasi dan diserahterimakan dalam keadaan 100% tuntas.'
    );
    setTempReportProgress(rec.reportProgress ?? 100);
    setTempReportSecretary(rec.reportSecretaryName || profile.sekretaris || 'MUH ZAENUN');
    setIsEditingReport(false);
    setViewMode('view');
  };

  const handleSaveReportChanges = () => {
    if (!selectedRecord) return;
    
    const updatedRecord: SpkRecord = {
      ...selectedRecord,
      reportNumber: tempReportNumber.trim(),
      reportDate: tempReportDate,
      reportNotes: tempReportNotes.trim(),
      reportProgress: Number(tempReportProgress),
      reportSecretaryName: tempReportSecretary.trim()
    };

    setSelectedRecord(updatedRecord);
    onUpdateRecord(updatedRecord);
    setIsEditingReport(false);
  };

  const handleSaveSpk = () => {
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
        reportProgress: 100,
        reportSecretaryName: profile.sekretaris || 'MUH ZAENUN',
        reportDate: formData.endDate || formData.date,
        reportNumber: `${(formData.spkNumber || '').split('/')[0] || '001'}/LAP-SPK/RT.${profile.rtNumber}/${profile.year}`,
        reportNotes: 'Pekerjaan fisik/jasa telah selesai dilaksanakan secara swakelola dengan baik dan sesuai arahan. Material dan peralatan disediakan oleh kas RT. Seluruh hasil penugasan diserahterimakan dalam keadaan baik dan lengkap.'
      };
      onAddRecord(newRecord);
    }

    setViewMode('list');
    resetForm();
  };

  const handleEditSpk = (rec: SpkRecord) => {
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
    const docTitle = activeDocType === 'laporan-sekretaris'
      ? `Laporan Pelaksanaan SPK - ${selectedRecord.spkNumber}`
      : `SPK - ${selectedRecord.spkNumber}`;
    executePrint(docTitle);
  };

  const handleDownloadPdf = async () => {
    if (!selectedRecord) return;
    setIsDownloadingPdf(true);
    const prefix = activeDocType === 'laporan-sekretaris' ? 'Laporan_Pelaksanaan_SPK' : 'SPK';
    const filename = `${prefix}_${selectedRecord.spkNumber.replace(/\//g, '_')}.pdf`;
    const success = await downloadElementAsPdf('.official-doc', filename);
    if (!success) {
      executePrint(`${prefix} - ${selectedRecord.spkNumber}`);
    }
    setIsDownloadingPdf(false);
  };

  // Render Laporan Pelaksanaan Kegiatan SPK oleh Sekretaris
  const renderLaporanSekretaris = (rec: SpkRecord) => {
    const isLandscape = reportOrientation === 'landscape';
    const reportNum = rec.reportNumber || tempReportNumber;
    const reportDt = rec.reportDate || tempReportDate || rec.endDate || rec.date;
    const secretaryName = rec.reportSecretaryName || tempReportSecretary || profile.sekretaris || 'MUH ZAENUN';
    const progressVal = rec.reportProgress ?? tempReportProgress ?? 100;
    const notesVal = rec.reportNotes || tempReportNotes;
    const workerCount = rec.workers?.length || 1;
    const costPerPerson = rec.costPerWorker || 150000;
    const totalLaborCost = workerCount * costPerPerson;

    return (
      <div className={`bg-white p-8 sm:p-14 rounded-2xl border border-slate-200 shadow-sm mx-auto text-slate-900 leading-relaxed font-arial-narrow official-doc ${isLandscape ? 'landscape-doc max-w-5xl' : 'max-w-3xl'}`}>
        {/* Kop Surat Resmi */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
            <img src={profile.logoUrl || DEFAULT_SEMARANG_LOGO} alt="Logo Semarang" className="w-full h-full object-contain" />
          </div>
          <div className="text-center grow px-2">
            <div className="text-[13px] sm:text-[14px] font-bold uppercase leading-tight text-slate-900">PEMERINTAH KOTA SEMARANG</div>
            <div className="text-[13px] sm:text-[14px] font-bold uppercase leading-tight text-slate-900">KECAMATAN {profile.kecamatan}</div>
            <div className="text-[13px] sm:text-[14px] font-bold uppercase leading-tight text-slate-900">KELURAHAN {profile.kelurahan}</div>
            <div className="text-[18px] sm:text-[20px] font-bold uppercase leading-tight mt-1 text-slate-900">RUKUN TETANGGA {profile.rtNumber} RUKUN WARGA {profile.rwNumber}</div>
            <p className="text-[9px] sm:text-[10px] text-slate-600 mt-0.5">Alamat: Ngabean RT {profile.rtNumber} RW {profile.rwNumber} Kel. {profile.kelurahan} Kec. {profile.kecamatan} Kota Semarang</p>
          </div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0" />
        </div>

        {/* Judul Dokumen */}
        <div className="text-center mb-6">
          <h2 className="text-base sm:text-lg font-black uppercase underline underline-offset-4 text-slate-900">
            LAPORAN PELAKSANAAN KEGIATAN SURAT PERINTAH KERJA (SPK)
          </h2>
          <p className="text-xs sm:text-sm font-bold mt-1 text-slate-900">
            Nomor: {reportNum}
          </p>
        </div>

        {/* Informasi Ringkas / Pengantar */}
        <div className="space-y-5 text-xs sm:text-sm text-slate-900">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 text-xs">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-32 py-1 font-bold text-slate-700 align-top">Kepada Yth.</td>
                  <td className="py-1 align-top">: <strong>Ketua RT {profile.rtNumber} RW {profile.rwNumber} Ngabean</strong> ({rec.firstPartyName || profile.ketuaRt})</td>
                </tr>
                <tr>
                  <td className="w-32 py-1 font-bold text-slate-700 align-top">Dari</td>
                  <td className="py-1 align-top">: <strong>Sekretaris RT {profile.rtNumber} RW {profile.rwNumber} Ngabean</strong> ({secretaryName})</td>
                </tr>
                <tr>
                  <td className="w-32 py-1 font-bold text-slate-700 align-top">Perihal</td>
                  <td className="py-1 align-top">: Laporan Pertanggungjawaban Pelaksanaan SPK Swakelola Kegiatan RT</td>
                </tr>
                <tr>
                  <td className="w-32 py-1 font-bold text-slate-700 align-top">Rujukan SPK</td>
                  <td className="py-1 align-top">: Nomor: <strong>{rec.spkNumber}</strong> tertanggal <strong>{formatDate(rec.date)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-justify leading-relaxed">
            Bersama ini kami laporkan hasil monitoring dan pelaksanaan pekerjaan fisik / jasa swakelola yang telah ditugaskan melalui <strong>Surat Perintah Kerja (SPK)</strong> bersumber dari dana <strong>Bantuan Operasional Rukun Tetangga (BOP RT)</strong> Tahun Anggaran <strong>{profile.year}</strong> Kelurahan {profile.kelurahan}, dengan rincian sebagai berikut:
          </p>

          {/* I. Rincian Pekerjaan */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-1 flex items-center gap-1.5 uppercase text-xs tracking-wider">
              <span>I. URAIAN PEKERJAAN & LOKASI</span>
            </h3>
            <table className="w-full border-collapse text-xs sm:text-sm">
              <tbody>
                <tr>
                  <td className="w-40 py-1.5 font-bold align-top">Jenis / Uraian Tugas</td>
                  <td className="py-1.5 align-top">: <strong>{rec.workDescription}</strong></td>
                </tr>
                <tr>
                  <td className="w-40 py-1.5 font-bold align-top">Lokasi Pekerjaan</td>
                  <td className="py-1.5 align-top">: {rec.workLocation}</td>
                </tr>
                <tr>
                  <td className="w-40 py-1.5 font-bold align-top">Waktu Pelaksanaan</td>
                  <td className="py-1.5 align-top">: {formatDate(rec.startDate)} s/d {formatDate(rec.endDate)}</td>
                </tr>
                <tr>
                  <td className="w-40 py-1.5 font-bold align-top">Metode Pelaksanaan</td>
                  <td className="py-1.5 align-top">: Swakelola Partisipatif Warga RT {profile.rtNumber} RW {profile.rwNumber}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* II. Tenaga Kerja & Honorarium */}
          <div className="space-y-2 pt-1">
            <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-1 flex items-center justify-between uppercase text-xs tracking-wider">
              <span>II. TENAGA KERJA PELAKSANA & DUKUNGAN ANGGARAN</span>
              <span className="text-[11px] font-normal text-slate-500 normal-case">Total: {workerCount} Orang</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border border-slate-400 border-collapse text-xs mt-2 text-center">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-400">
                    <th className="border border-slate-400 px-2 py-1.5 w-10">No</th>
                    <th className="border border-slate-400 px-3 py-1.5 text-left">Nama Tenaga Kerja Ditunjuk</th>
                    <th className="border border-slate-400 px-3 py-1.5 text-left">Alamat / Lingkungan</th>
                    <th className="border border-slate-400 px-3 py-1.5 text-right w-32">Honorarium</th>
                    <th className="border border-slate-400 px-2 py-1.5 w-24">Status Kerja</th>
                  </tr>
                </thead>
                <tbody>
                  {(rec.workers || []).map((worker, idx) => (
                    <tr key={idx} className="border-b border-slate-300">
                      <td className="border border-slate-300 px-2 py-1.5">{idx + 1}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-left font-bold">{worker}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-left text-slate-600">
                        {rec.contractorAddress || `RT ${profile.rtNumber} RW ${profile.rwNumber} Ngabean`}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-medium">
                        {formatRupiah(costPerPerson)}
                      </td>
                      <td className="border border-slate-300 px-2 py-1.5 text-emerald-700 font-semibold">
                        Selesai
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold border-t border-slate-400">
                    <td colSpan={3} className="border border-slate-400 px-3 py-2 text-right uppercase">
                      Total Alokasi Honorarium Tenaga Kerja:
                    </td>
                    <td className="border border-slate-400 px-3 py-2 text-right text-indigo-950 font-black">
                      {formatRupiah(totalLaborCost)}
                    </td>
                    <td className="border border-slate-400 px-2 py-2 text-slate-600">
                      Lunas
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-900 leading-snug">
              <strong>Keterangan Swakelola:</strong> Seluruh penyediaan material, peralatan kerja, cat, semen, serta konsumsi kegiatan disediakan dan dibeli langsung oleh Pengurus RT dari pos belanja BOP RT (non-pihak ketiga/bukan borongan).
            </div>
          </div>

          {/* III. Evaluasi & Catatan Hasil Fisik */}
          <div className="space-y-2 pt-1">
            <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-1 flex items-center gap-1.5 uppercase text-xs tracking-wider">
              <span>III. HASIL PELAKSANAAN & EVALUASI SEKRETARIS RT</span>
            </h3>
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm leading-relaxed text-slate-800">
              <p className="whitespace-pre-line text-justify">{notesVal}</p>
            </div>
          </div>

          {/* Penutup */}
          <p className="pt-2 text-justify">
            Demikian laporan hasil pelaksanaan pekerjaan berdasarkan SPK ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagai bahan pertanggungjawaban fisik dan kelengkapan berkas Surat Pertanggungjawaban (SPJ) Bantuan Operasional RT (BOP RT) Kelurahan {profile.kelurahan} Tahun Anggaran {profile.year}.
          </p>
        </div>

        {/* Tanda Tangan Ganda: Mengetahui Ketua RT & Pelapor Sekretaris RT */}
        <div className="mt-10 grid grid-cols-2 gap-8 text-center text-xs sm:text-sm">
          <div className="space-y-16">
            <div className="space-y-1">
              <p className="text-slate-700">Mengetahui,</p>
              <div className="font-bold uppercase text-slate-900">
                Ketua RT {profile.rtNumber} RW {profile.rwNumber}
              </div>
            </div>
            <div>
              <p className="font-bold underline uppercase text-slate-900">
                {rec.firstPartyName || profile.ketuaRt}
              </p>
            </div>
          </div>

          <div className="space-y-16">
            <div className="space-y-1">
              <p className="text-slate-700">Semarang, {formatDate(reportDt)}</p>
              <div className="font-bold uppercase text-slate-900">
                Sekretaris RT {profile.rtNumber} RW {profile.rwNumber}
              </div>
            </div>
            <div>
              <p className="font-bold underline uppercase text-slate-900">
                {secretaryName}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Official SPK Document
  const renderSpkDocument = (rec: SpkRecord) => {
    return (
      <div className="bg-white p-10 sm:p-16 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto text-slate-900 leading-relaxed font-arial-narrow official-doc">
        {/* Kop Surat */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
          <div className="w-24 h-24 shrink-0 flex items-center justify-center">
            <img src={profile.logoUrl || DEFAULT_SEMARANG_LOGO} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-center grow px-2">
            <div className="text-[14px] font-bold uppercase leading-tight text-slate-900">PEMERINTAH KOTA SEMARANG</div>
            <div className="text-[14px] font-bold uppercase leading-tight text-slate-900">KECAMATAN {profile.kecamatan}</div>
            <div className="text-[14px] font-bold uppercase leading-tight text-slate-900">KELURAHAN {profile.kelurahan}</div>
            <div className="text-[20px] font-bold uppercase leading-tight mt-1 text-slate-900">RUKUN TETANGGA {profile.rtNumber} RUKUN WARGA {profile.rwNumber}</div>
            <p className="text-[10px] text-slate-600">Alamat: Ngabean RT {profile.rtNumber} RW {profile.rwNumber} Kel. {profile.kelurahan} Kec. {profile.kecamatan} Kota Semarang</p>
          </div>
          <div className="w-24 h-24 shrink-0" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-base font-black uppercase underline underline-offset-2 text-slate-900">SURAT PERINTAH KERJA (SPK)</h2>
          <p className="text-sm font-bold mt-1 text-slate-900">Nomor: {rec.spkNumber}</p>
        </div>

        <div className="space-y-6 text-sm text-slate-900">
          <p>Pada hari ini, <strong>{formatDate(rec.date)}</strong>, yang bertanda tangan di bawah ini:</p>
          
          <div className="space-y-1">
            <div className="flex">
              <span className="w-8">I.</span>
              <div className="flex-1">
                <div className="flex"><span className="w-32 font-bold">Nama</span><span>: {rec.firstPartyName}</span></div>
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
                    : {(rec.workers || []).map((w, i) => <div key={i}>{i+1}. {w}</div>)}
                    {(rec.workers || []).length === 0 && rec.contractorName}
                  </div>
                </div>
                <div className="flex mt-1"><span className="w-32 font-bold">Alamat</span><span>: {rec.contractorAddress || `RT ${profile.rtNumber} RW ${profile.rwNumber} Ngabean`}</span></div>
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
                <td className="py-1.5 align-top">: {rec.workDescription}</td>
              </tr>
              <tr>
                <td className="w-40 py-1.5 font-bold align-top">Lokasi Pekerjaan</td>
                <td className="py-1.5 align-top">: {rec.workLocation}</td>
              </tr>
              <tr>
                <td className="w-40 py-1.5 font-bold align-top">Waktu Pelaksanaan</td>
                <td className="py-1.5 align-top">: {formatDate(rec.startDate)} s/d {formatDate(rec.endDate)}</td>
              </tr>
            </tbody>
          </table>

          <div className="space-y-4 pt-2">
            <p className="font-bold underline italic">Pasal 1: Lingkup Pekerjaan & Penyediaan Material</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>PIHAK KEDUA wajib melaksanakan pekerjaan dengan sebaik-baiknya, tepat waktu, dan sesuai dengan spesifikasi yang telah disepakati.</li>
              <li>Seluruh penyediaan <strong>bahan, material, dan peralatan kerja</strong> yang dibutuhkan untuk pekerjaan ini menjadi tanggung jawab dan disediakan sepenuhnya oleh <strong>PIHAK PERTAMA</strong> melalui dana BOP RT.</li>
              <li>Nilai pembayaran upah kerja akan diberikan sesuai dengan tanda terima honorarium terpisah ({formatRupiah(rec.costPerWorker || 150000)} per orang).</li>
            </ul>
            
            <p className="font-bold underline italic text-xs mt-4">Pasal 2: Pembayaran</p>
            <p>Pembayaran akan dilakukan oleh PIHAK PERTAMA kepada PIHAK KEDUA secara tunai setelah seluruh pekerjaan selesai dilaksanakan 100% dan diterima dengan baik oleh PIHAK PERTAMA, menggunakan dana Bantuan Operasional RT (BOP RT) Tahun Anggaran {profile.year}.</p>
          </div>

          <p className="pt-4 text-justify">Demikian Surat Perintah Kerja ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-8 text-center">
          <div className="space-y-20">
            <div className="text-sm font-bold uppercase text-slate-900">
              Pelaksana Pekerjaan
            </div>
            <div>
              <div className="text-sm font-bold underline uppercase text-slate-900">
                 ( ................................... )
              </div>
            </div>
          </div>
          <div className="space-y-20">
            <div className="space-y-1">
              <p className="text-sm text-slate-900">Semarang, {formatDate(rec.date)}</p>
              <div className="text-sm font-bold uppercase text-slate-900">
                Ketua RT {profile.rtNumber} RW {profile.rwNumber}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold underline uppercase text-slate-900">
                {rec.firstPartyName}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 1. LIST VIEW MODE
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <span>Surat Perintah Kerja (SPK) & Laporan Pelaksanaan</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-arial-narrow">
              Dokumen penugasan pekerja swakelola dan laporan pelaksanaan kegiatan oleh Sekretaris RT untuk SPJ BOP RT.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDeleteMode(!showDeleteMode)}
              className={`font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all cursor-pointer border ${
                showDeleteMode 
                ? 'bg-red-50 text-red-600 border-red-200 ring-2 ring-red-400' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{showDeleteMode ? 'Tutup Mode Hapus' : 'Mode Hapus'}</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {records.length === 0 ? (
            <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-slate-900 font-bold">Belum Ada SPK</h3>
              <p className="text-slate-500 text-xs mt-1">Gunakan tombol di atas untuk membuat Surat Perintah Kerja pertama Anda.</p>
            </div>
          ) : (
            records.map((rec) => {
              const workerCount = rec.workers?.length || 1;
              const costPerPerson = rec.costPerWorker || 150000;
              const totalCost = workerCount * costPerPerson;

              return (
                <div 
                  key={rec.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{rec.spkNumber}</div>
                          <div className="text-[10px] text-slate-400">{formatDate(rec.date)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button 
                          onClick={() => handleEditSpk(rec)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit SPK"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Hapus SPK ${rec.spkNumber}?`)) {
                              onDeleteRecord(rec.id);
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-all ${
                            showDeleteMode 
                              ? 'text-white bg-red-600 hover:bg-red-700 shadow-sm animate-pulse' 
                              : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title="Hapus SPK"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem]">
                        {rec.workDescription}
                      </h3>
                      
                      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>Pekerja ({workerCount} orang):</span>
                          <span className="font-bold text-slate-700">{formatRupiah(totalCost)}</span>
                        </div>
                        <div className="text-slate-700 font-semibold truncate">
                          {rec.workers?.join(', ') || rec.contractorName || '-'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Lokasi: {rec.workLocation}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleSelectRecord(rec, 'spk')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-2.5 rounded-xl transition-all flex items-center justify-center space-x-1"
                        title="Buka Surat Perintah Kerja"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Dokumen SPK</span>
                      </button>

                      <button
                        onClick={() => handleSelectRecord(rec, 'laporan-sekretaris')}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2 px-2.5 rounded-xl transition-all flex items-center justify-center space-x-1 border border-indigo-200/60"
                        title="Buka Laporan Pelaksanaan Kegiatan oleh Sekretaris"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Lap. Sekretaris</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onGenerateHonor(rec)}
                      className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center space-x-1 border border-emerald-200"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{rec.isHonorGenerated ? 'Tanda Terima Honor Dibuat' : 'Buat Tanda Terima Honor'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // 2. CREATE / EDIT SPK FORM
  if (viewMode === 'create') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <button
            onClick={() => setViewMode('list')}
            className="text-slate-600 hover:text-slate-900 flex items-center space-x-2 text-sm font-bold transition-colors cursor-pointer"
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
              <span>Detail Penugasan Pekerja Swakelola</span>
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
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tanggal Surat SPK</label>
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
                    className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer hover:bg-slate-800"
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
                <p className="text-[9px] text-slate-400 mt-1 italic">* Default Rp 150.000 per pekerja, otomatis terintegrasi ke Tanda Terima Honor & Laporan Sekretaris.</p>
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
                  placeholder="Detail tugas yang diberikan (contoh: Perbaikan talud dan pengecatan gapura)..."
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
              onClick={handleSaveSpk}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>{editingRecord ? 'Simpan Perubahan' : 'Simpan & Terbitkan SPK'}</span>
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. VIEW & PRINT MODE
  if (viewMode === 'view' && selectedRecord) {
    return (
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('list')}
              className="text-slate-600 hover:text-slate-900 flex items-center space-x-2 text-sm font-bold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Daftar SPK</span>
            </button>

            {/* Document Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveDocType('spk')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeDocType === 'spk'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Dokumen SPK</span>
              </button>

              <button
                onClick={() => setActiveDocType('laporan-sekretaris')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeDocType === 'laporan-sekretaris'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Laporan Pelaksanaan (Sekretaris)</span>
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* If in Laporan Sekretaris: show edit report details & orientation toggle */}
            {activeDocType === 'laporan-sekretaris' && (
              <>
                <button
                  onClick={() => setIsEditingReport(!isEditingReport)}
                  className={`font-semibold px-3 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 text-xs transition-all cursor-pointer border ${
                    isEditingReport 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Sesuaikan Nomor, Tanggal, atau Catatan Evaluasi Laporan"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{isEditingReport ? 'Tutup Edit Laporan' : 'Edit Isi Laporan'}</span>
                </button>

                <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setReportOrientation('portrait')}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                      reportOrientation === 'portrait' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    onClick={() => setReportOrientation('landscape')}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                      reportOrientation === 'landscape' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => onGenerateHonor(selectedRecord)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 text-xs transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Tanda Terima Honor</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isDownloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{isDownloadingPdf ? 'Memproses...' : 'Unduh PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 text-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>

            <button
              onClick={openInNewTab}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl shadow-xs flex items-center space-x-1 text-xs transition-all cursor-pointer border border-slate-200"
              title="Buka Dokumen di Tab Bersih"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Tab Baru</span>
            </button>
          </div>
        </div>

        {/* Modal / Panel for customizing Laporan Pelaksanaan Kegiatan */}
        {isEditingReport && activeDocType === 'laporan-sekretaris' && (
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-6 shadow-sm print:hidden animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-indigo-700" />
                <h3 className="font-bold text-slate-900 text-sm">Sesuaikan Data Laporan Pelaksanaan (Sekretaris)</h3>
              </div>
              <button
                onClick={() => setIsEditingReport(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nomor Laporan</label>
                <input
                  type="text"
                  value={tempReportNumber}
                  onChange={(e) => setTempReportNumber(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Tanggal Laporan Pelaksanaan</label>
                <input
                  type="date"
                  value={tempReportDate}
                  onChange={(e) => setTempReportDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nama Sekretaris Pelapor</label>
                <input
                  type="text"
                  value={tempReportSecretary}
                  onChange={(e) => setTempReportSecretary(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Catatan Hasil Fisik & Evaluasi Pelaksanaan</label>
              <textarea
                rows={3}
                value={tempReportNotes}
                onChange={(e) => setTempReportNotes(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs leading-relaxed outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditingReport(false)}
                className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveReportChanges}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-700 flex items-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan Laporan</span>
              </button>
            </div>
          </div>
        )}

        {/* Printable View */}
        {activeDocType === 'spk' ? renderSpkDocument(selectedRecord) : renderLaporanSekretaris(selectedRecord)}
      </div>
    );
  }

  return null;
};
