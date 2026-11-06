import React, { useState, useRef } from 'react';
import { RtProfile } from '../types';
import { DEFAULT_SEMARANG_LOGO } from '../data/initialData';
import { 
  Building2, 
  Save, 
  ShieldCheck, 
  UploadCloud, 
  RotateCcw, 
  Image as ImageIcon, 
  Link2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  FileCheck
} from 'lucide-react';

interface SettingsModalProps {
  profile: RtProfile;
  onSaveProfile?: (profile: RtProfile) => void;
  onUpdateProfile?: (profile: RtProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  profile, 
  onSaveProfile,
  onUpdateProfile 
}) => {
  const [rtNumber, setRtNumber] = useState(profile.rtNumber);
  const [rwNumber, setRwNumber] = useState(profile.rwNumber);
  const [kelurahan, setKelurahan] = useState(profile.kelurahan);
  const [kecamatan, setKecamatan] = useState(profile.kecamatan);
  const [kota, setKota] = useState(profile.kota);
  const [ketuaRt, setKetuaRt] = useState(profile.ketuaRt);
  const [sekretaris, setSekretaris] = useState(profile.sekretaris || '');
  const [bendaharaRt, setBendaharaRt] = useState(profile.bendaharaRt);
  const [lurahName, setLurahName] = useState(profile.lurahName || '');
  const [rwChairman, setRwChairman] = useState(profile.rwChairman || '');
  const [year, setYear] = useState(profile.year);
  const [totalPagu, setTotalPagu] = useState(profile.totalPagu);
  const [bankName, setBankName] = useState(profile.bankName || 'Bank Jateng');
  const [bankAccountNumber, setBankAccountNumber] = useState(profile.bankAccountNumber || '');
  const [bankAccountName, setBankAccountName] = useState(profile.bankAccountName || '');
  
  // Logo state
  const [logoUrl, setLogoUrl] = useState<string>(profile.logoUrl || DEFAULT_SEMARANG_LOGO);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // PKK Logo state
  const [pkkLogoUrl, setPkkLogoUrl] = useState<string>(profile.pkkLogoUrl || '');
  const [isPkkDragging, setIsPkkDragging] = useState(false);
  const [pkkUploadError, setPkkUploadError] = useState<string | null>(null);
  const [showPkkUrlInput, setShowPkkUrlInput] = useState(false);
  const [customPkkUrlInput, setCustomPkkUrlInput] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pkkFileInputRef = useRef<HTMLInputElement>(null);

  // File processing with canvas optimization if image is large
  const processImageFile = (file: File) => {
    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa berkas gambar (PNG, JPG, JPEG, SVG, WebP).');
      return;
    }

    // If SVG, load directly as DataURL without compression
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setLogoUrl(e.target.result);
        }
      };
      reader.onerror = () => {
        setUploadError('Gagal membaca berkas gambar.');
      };
      reader.readAsDataURL(file);
      return;
    }

    // For ALL raster images, aggressively resize and compress to maintain high quality while keeping payload well under Firestore 1MB limits
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 300; // Small is fine for letterhead logo
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Force WebP at 85% quality to ensure very small payload (usually <50KB)
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.85);
          setLogoUrl(compressedDataUrl);
        } else {
          setLogoUrl(e.target?.result as string);
        }
      };
      img.onerror = () => {
        setUploadError('Format gambar tidak dapat diproses.');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setLogoUrl(customUrlInput.trim());
    setCustomUrlInput('');
    setShowUrlInput(false);
    setUploadError(null);
  };

  const handleResetToDefault = () => {
    setLogoUrl(DEFAULT_SEMARANG_LOGO);
    setUploadError(null);
  };

  // PKK file processing & handlers
  const processPkkImageFile = (file: File) => {
    setPkkUploadError(null);
    if (!file.type.startsWith('image/')) {
      setPkkUploadError('File harus berupa berkas gambar (PNG, JPG, JPEG, SVG, WebP).');
      return;
    }
    // If SVG, load directly as DataURL without compression
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setPkkLogoUrl(e.target.result);
        }
      };
      reader.onerror = () => {
        setPkkUploadError('Gagal membaca berkas gambar.');
      };
      reader.readAsDataURL(file);
      return;
    }
    
    // For ALL raster images, aggressively resize and compress to maintain high quality while keeping payload well under Firestore 1MB limits
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 300; // Small is fine for letterhead logo
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Force WebP at 85% quality to ensure very small payload (usually <50KB)
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.85);
          setPkkLogoUrl(compressedDataUrl);
        } else {
          setPkkLogoUrl(e.target?.result as string);
        }
      };
      img.onerror = () => {
        setPkkUploadError('Format gambar tidak dapat diproses.');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomPkkUrl = () => {
    if (!customPkkUrlInput.trim()) return;
    setPkkLogoUrl(customPkkUrlInput.trim());
    setCustomPkkUrlInput('');
    setShowPkkUrlInput(false);
    setPkkUploadError(null);
  };

  const handleResetPkkLogo = () => {
    setPkkLogoUrl('');
    setPkkUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: RtProfile = {
      rtNumber,
      rwNumber,
      kelurahan,
      kecamatan,
      kota,
      ketuaRt,
      sekretaris,
      bendaharaRt,
      lurahName,
      rwChairman,
      year: Number(year),
      totalPagu: Number(totalPagu),
      bankName,
      bankAccountNumber,
      bankAccountName,
      logoUrl: logoUrl || DEFAULT_SEMARANG_LOGO,
      pkkLogoUrl: pkkLogoUrl.trim() || undefined,
    };

    const saveFunction = onSaveProfile || onUpdateProfile;
    if (saveFunction) {
      saveFunction(updated);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-red-50 text-red-600 p-3 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Profil & Pengaturan Wilayah RT</h2>
            <p className="text-xs text-slate-500">
              Sesuaikan identitas RT, nama jajaran pengurus, logo kop surat, dan pagu dana BOP RT APBD Kota Semarang.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              Profil RT dan logo kop surat berhasil disimpan! Seluruh dokumen resmi langsung diperbarui.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ========================================================================= */}
          {/* SECTION: Upload Logo Kota Semarang untuk Kop Surat */}
          {/* ========================================================================= */}
          <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Logo Kota Semarang untuk Kop Surat Resmi
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Logo ini akan otomatis disematkan pada seluruh Kop Surat berkas cetak dan PDF.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs"
                  title="Kembalikan ke lambang resmi default Kota Semarang"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Gunakan Logo Default</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs"
                  title="Input tautan URL gambar secara langsung"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Input URL</span>
                </button>
              </div>
            </div>

            {/* Input URL Toggle Form */}
            {showUrlInput && (
              <div className="bg-white p-3.5 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-center gap-2 shadow-2xs">
                <input
                  type="url"
                  placeholder="https://example.com/logo-semarang.png"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Terapkan URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(false)}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Upload Area & Live Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left Column: Drag & Drop + File Upload */}
              <div className="md:col-span-6 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                    isDragging
                      ? 'border-red-500 bg-red-50/70 scale-[0.99]'
                      : 'border-slate-300 bg-white hover:border-red-400 hover:bg-red-50/20'
                  }`}
                >
                  <div className="p-3 bg-red-50 text-red-600 rounded-full mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 mb-1">
                    Tarik & Letakkan file logo di sini, atau <span className="text-red-600 underline">klik untuk memilih</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Format didukung: PNG, JPG, SVG, WebP (Maks. 3 MB)
                  </p>
                  <div className="mt-3 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold border border-slate-200 transition-colors">
                    Pilih File Gambar
                  </div>
                </div>

                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Live Pratinjau Kop Surat Miniatur */}
              <div className="md:col-span-6 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                    <Eye className="w-3.5 h-3.5 text-red-600" />
                    <span>Pratinjau Kop Surat Resmi</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Aktif</span>
                  </span>
                </div>

                {/* Mini Kop Surat Preview Box */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-900 font-arial-narrow shadow-inner">
                  <div className="flex items-center space-x-3 pb-2 border-b-2 border-slate-900">
                    <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                      <img
                        src={logoUrl}
                        alt="Logo Kop Surat"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).src = DEFAULT_SEMARANG_LOGO;
                        }}
                      />
                    </div>
                    <div className="text-center flex-1 min-w-0">
                      <div className="text-[10px] font-bold uppercase text-slate-900 leading-tight">
                        PEMERINTAH KOTA SEMARANG
                      </div>
                      <div className="text-[10px] font-bold uppercase text-slate-900 leading-tight">
                        KECAMATAN {kecamatan.toUpperCase()}
                      </div>
                      <div className="text-[10px] font-bold uppercase text-slate-900 leading-tight">
                        KELURAHAN {kelurahan.toUpperCase()}
                      </div>
                      <div className="text-[12px] font-bold uppercase text-slate-900 leading-tight mt-1">
                        RT {rtNumber} RW {rwNumber}
                      </div>
                      <div className="text-[8px] text-slate-800 leading-tight mt-1">
                        Alamat: Ngabean RT {rtNumber} RW {rwNumber} Kelurahan {kelurahan}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  * Tampil otomatis di Surat Pencairan Bank Jateng, SPJ Bulanan, BKU, Notulen Rapat, dan SPTJM.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION: Upload Logo PKK untuk Notulen & Kegiatan PKK */}
          {/* ========================================================================= */}
          <div className="bg-emerald-50/50 p-5 sm:p-6 rounded-2xl border border-emerald-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-200">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Logo PKK (Pemberdayaan Kesejahteraan Keluarga)
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Logo ini akan otomatis disematkan pada dokumen Pertemuan Rutin & Notulen PKK RT {rtNumber}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetPkkLogo}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs"
                  title="Hapus Logo PKK (Gunakan Logo Semarang)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Hapus Logo PKK</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPkkUrlInput(!showPkkUrlInput)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs"
                  title="Input tautan URL logo PKK secara langsung"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Input URL</span>
                </button>
              </div>
            </div>

            {/* Input URL Toggle Form for PKK */}
            {showPkkUrlInput && (
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center gap-2 shadow-2xs">
                <input
                  type="url"
                  placeholder="https://example.com/logo-pkk.png"
                  value={customPkkUrlInput}
                  onChange={(e) => setCustomPkkUrlInput(e.target.value)}
                  className="flex-1 w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleApplyCustomPkkUrl}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Terapkan URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPkkUrlInput(false)}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Upload Area & Live Preview Grid for PKK */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left Column: Drag & Drop + File Upload */}
              <div className="md:col-span-6 space-y-3">
                <input
                  ref={pkkFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      processPkkImageFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsPkkDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsPkkDragging(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsPkkDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      processPkkImageFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => pkkFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                    isPkkDragging
                      ? 'border-emerald-500 bg-emerald-100/70 scale-[0.99]'
                      : 'border-emerald-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/20'
                  }`}
                >
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 mb-1">
                    Tarik & Letakkan file Logo PKK di sini, atau <span className="text-emerald-700 underline">klik untuk memilih</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Format didukung: PNG, JPG, SVG, WebP (Maks. 3 MB)
                  </p>
                  <div className="mt-3 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[11px] font-semibold border border-emerald-300 transition-colors">
                    Pilih File Logo PKK
                  </div>
                </div>

                {pkkUploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pkkUploadError}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Live Pratinjau Kop Surat PKK Miniatur */}
              <div className="md:col-span-6 bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pratinjau Kop Notulen PKK</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center space-x-1 ${pkkLogoUrl ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{pkkLogoUrl ? 'Logo PKK Aktif' : 'Memakai Logo Default'}</span>
                  </span>
                </div>

                {/* Mini Kop PKK Preview Box */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-900 font-arial-narrow shadow-inner">
                  <div className="flex items-center space-x-3 pb-2 border-b-2 border-slate-900">
                    <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                      <img
                        src={pkkLogoUrl || DEFAULT_SEMARANG_LOGO}
                        alt="Logo PKK"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_SEMARANG_LOGO;
                        }}
                      />
                    </div>
                    <div className="text-center flex-1 min-w-0">
                      <div className="text-[10px] font-bold uppercase text-slate-900 leading-tight">
                        TIM PENGGERAK PKK RT {rtNumber} RW {rwNumber}
                      </div>
                      <div className="text-[10px] font-bold uppercase text-slate-900 leading-tight">
                        KECAMATAN {kecamatan.toUpperCase()}
                      </div>
                      <div className="text-[10px] font-bold uppercase text-slate-900 leading-tight">
                        KELURAHAN {kelurahan.toUpperCase()}
                      </div>
                      <div className="text-[12px] font-bold uppercase text-slate-900 leading-tight mt-1">
                        KOTA SEMARANG
                      </div>
                      <div className="text-[8px] text-slate-800 leading-tight mt-1">
                        Alamat: Ngabean RT {rtNumber} RW {rwNumber} Kelurahan {kelurahan}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 italic">
                  * Otomatis digunakan saat membuat Notulen Pertemuan Rutin & Rapat Kader PKK RT {rtNumber}.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION: Data Wilayah RT & RW */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
              1. Identitas Wilayah & Administrasi
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nomor RT *
                </label>
                <input
                  type="text"
                  required
                  value={rtNumber}
                  onChange={(e) => setRtNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nomor RW *
                </label>
                <input
                  type="text"
                  required
                  value={rwNumber}
                  onChange={(e) => setRwNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Kelurahan *
                </label>
                <input
                  type="text"
                  required
                  value={kelurahan}
                  onChange={(e) => setKelurahan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Kecamatan *
                </label>
                <input
                  type="text"
                  required
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Kota / Kabupaten *
                </label>
                <input
                  type="text"
                  required
                  value={kota}
                  onChange={(e) => setKota(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION: Jajaran Pengurus RT & Kelurahan */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
              2. Jajaran Pengurus & Pejabat Penandatangan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Ketua RT *
                </label>
                <input
                  type="text"
                  required
                  value={ketuaRt}
                  onChange={(e) => setKetuaRt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Sekretaris RT *
                </label>
                <input
                  type="text"
                  required
                  value={sekretaris}
                  onChange={(e) => setSekretaris(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Bendahara RT *
                </label>
                <input
                  type="text"
                  required
                  value={bendaharaRt}
                  onChange={(e) => setBendaharaRt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Lurah *
                </label>
                <input
                  type="text"
                  required
                  value={lurahName}
                  onChange={(e) => setLurahName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Ketua RW *
                </label>
                <input
                  type="text"
                  required
                  value={rwChairman}
                  onChange={(e) => setRwChairman(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION: Pagu Anggaran & Rekening Bank Jateng */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
              3. Pagu Anggaran & Rekening Bank Jateng
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Tahun Anggaran *
                </label>
                <input
                  type="number"
                  required
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Pagu Total BOP RT (Rp) *
                </label>
                <input
                  type="number"
                  required
                  value={totalPagu}
                  onChange={(e) => setTotalPagu(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Bank *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cth: Bank Jateng"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nomor Rekening Bank *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cth: 3-051-10056-3"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Pemilik Rekening *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cth: Ngabean RT 04 RW 04"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-400 flex items-center space-x-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Format dokumen otomatis menggunakan Arial Narrow standar Pemkot Semarang</span>
            </div>

            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 text-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
