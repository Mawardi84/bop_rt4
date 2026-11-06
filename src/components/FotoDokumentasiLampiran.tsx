import { DEFAULT_SEMARANG_LOGO } from '../data/initialData';
import React, { useState } from 'react';
import { DocumentationPhoto, RtProfile } from '../types';
import { 
  Camera, 
  Printer, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  RotateCw, 
  Maximize2, 
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  MapPin,
  FileText,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { executePrint } from '../utils/printHelper';
import { getDefaultPhotosForMonth, getTirakatanPhotos, getResepsiPhotos, getKarnavalPhotos } from '../utils/photoHelpers';

interface FotoDokumentasiLampiranProps {
  profile: RtProfile;
  month: string;
  photos: DocumentationPhoto[];
  onUpdatePhotos: (photos: DocumentationPhoto[]) => void;
  onPrint?: () => void;
  standalone?: boolean;
  photosPerPage?: 2 | 4;
  onPhotosPerPageChange?: (count: 2 | 4) => void;
  meetingType?: 'rt' | 'pkk';
}

export const FotoDokumentasiLampiran: React.FC<FotoDokumentasiLampiranProps> = ({
  profile,
  month,
  photos,
  onUpdatePhotos,
  onPrint,
  standalone = false,
  photosPerPage: controlledPhotosPerPage,
  onPhotosPerPageChange,
  meetingType = 'rt',
}) => {
  const [internalPhotosPerPage, setInternalPhotosPerPage] = useState<2 | 4>(() => {
    const saved = localStorage.getItem('si_bop_photos_per_page');
    return saved === '2' ? 2 : 4;
  });

  const photosPerPage = controlledPhotosPerPage ?? internalPhotosPerPage;

  const handleSetPhotosPerPage = (val: 2 | 4) => {
    localStorage.setItem('si_bop_photos_per_page', String(val));
    setInternalPhotosPerPage(val);
    if (onPhotosPerPageChange) {
      onPhotosPerPageChange(val);
    }
  };

  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(0);
  const [showEditor, setShowEditor] = useState<boolean>(true);
  const [showKeterangan, setShowKeterangan] = useState<boolean>(() => {
    const saved = localStorage.getItem('si_bop_show_photo_keterangan');
    return saved !== null ? JSON.parse(saved) : false; // Default false (keterangan dihapus/disembunyikan)
  });

  const handleToggleKeterangan = () => {
    const next = !showKeterangan;
    setShowKeterangan(next);
    localStorage.setItem('si_bop_show_photo_keterangan', JSON.stringify(next));
  };

  // Split photos into chunks of 2 or 4 according to selected layout
  const chunkSize = photosPerPage;
  const sheets: DocumentationPhoto[][] = [];
  for (let i = 0; i < photos.length; i += chunkSize) {
    sheets.push(photos.slice(i, i + chunkSize));
  }

  const handleToggleOrientation = (index: number) => {
    const updated = [...photos];
    const current = updated[index].orientation || 'landscape';
    updated[index] = {
      ...updated[index],
      orientation: current === 'landscape' ? 'portrait' : 'landscape',
    };
    onUpdatePhotos(updated);
  };

  const handleToggleFitMode = (index: number) => {
    const updated = [...photos];
    const current = updated[index].fitMode || 'cover';
    updated[index] = {
      ...updated[index],
      fitMode: current === 'cover' ? 'contain' : 'cover',
    };
    onUpdatePhotos(updated);
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect image natural orientation if possible, or read as DataURL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const dataUrl = event.target.result;
        
        // Auto-detect orientation from image dimensions
        const img = new Image();
        img.onload = () => {
          const isVertical = img.naturalHeight > img.naturalWidth;
          const updated = [...photos];
          updated[index] = {
            ...updated[index],
            imageUrl: dataUrl,
            orientation: isVertical ? 'portrait' : 'landscape',
          };
          onUpdatePhotos(updated);
        };
        img.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateField = (index: number, field: keyof DocumentationPhoto, value: string) => {
    const updated = [...photos];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onUpdatePhotos(updated);
  };

  const handleAddPhoto = () => {
    const newNo = photos.length + 1;
    const newPhoto: DocumentationPhoto = {
      id: `photo-${Date.now()}`,
      title: `Foto ${newNo}: Dokumentasi Tambahan Bulan ${month}`,
      description: `Uraian kegiatan dokumentasi warga RT 04 RW 04 Kelurahan Gunungpati.`,
      date: `Bulan ${month} ${profile.year}`,
      location: `Wilayah RT 04 / RW 04 Ngabean`,
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      orientation: 'landscape',
      fitMode: 'cover',
    };
    onUpdatePhotos([...photos, newPhoto]);
    setActivePhotoIndex(photos.length);
  };

  const handleDeletePhoto = (index: number) => {
    if (photos.length <= 1) {
      alert('Minimal harus ada 1 foto dokumentasi.');
      return;
    }
    if (window.confirm(`Hapus foto ke-${index + 1}?`)) {
      const updated = photos.filter((_, idx) => idx !== index);
      onUpdatePhotos(updated);
      setActivePhotoIndex(0);
    }
  };

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= photos.length) return;
    const updated = [...photos];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onUpdatePhotos(updated);
    setActivePhotoIndex(targetIdx);
  };

  const handleLoadTirakatanPreset = () => {
    const defaults = getTirakatanPhotos();
    onUpdatePhotos(defaults);
    setActivePhotoIndex(0);
  };

  const handleLoadResepsiPreset = () => {
    const defaults = getResepsiPhotos();
    onUpdatePhotos(defaults);
    setActivePhotoIndex(0);
  };

  const handleLoadKarnavalPreset = () => {
    const defaults = getKarnavalPhotos();
    onUpdatePhotos(defaults);
    setActivePhotoIndex(0);
  };

  const handleLoadCurrentMonthDefaults = () => {
    const defaults = getDefaultPhotosForMonth(month, profile.year);
    onUpdatePhotos(defaults);
    setActivePhotoIndex(0);
  };

  const handlePrintDocument = () => {
    if (onPrint) {
      onPrint();
    } else {
      executePrint(`Lampiran Foto Dokumentasi SPJ Bulan ${month} ${profile.year}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header & Print Controls (Screen Only) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-red-50 text-red-600 rounded-xl">
                <Camera className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <span>Lampiran Foto Dokumentasi</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dokumentasi pelaksanaan kegiatan dan pembelanjaan operasional RT.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Pilihan Layout: 2 Foto vs 4 Foto */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center space-x-1">
                <LayoutGrid className="w-3.5 h-3.5 text-slate-600" />
                <span>Format Lembar:</span>
              </span>
              <button
                type="button"
                onClick={() => handleSetPhotosPerPage(2)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  photosPerPage === 2
                    ? 'bg-white text-red-700 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Format 2 Foto per Lembar (Ukuran Besar Postcard 10x15cm dengan Rincian Lengkap)"
              >
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span>2 Foto / Lembar</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetPhotosPerPage(4)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  photosPerPage === 4
                    ? 'bg-white text-red-700 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Format 4 Foto per Lembar (Grid 2x2 Hemat Kertas)"
              >
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>4 Foto / Lembar</span>
              </button>
            </div>

            {/* Opsi Keterangan (Opsional) */}
            <button
              type="button"
              onClick={handleToggleKeterangan}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                showKeterangan
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title="Aktifkan atau nonaktifkan tampilan keterangan di lembar foto"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Keterangan (Opsional):</span>
              <span className={`font-bold ${showKeterangan ? 'text-amber-700' : 'text-slate-500'}`}>
                {showKeterangan ? 'Aktif' : 'Dihapus'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowEditor(!showEditor)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>{showEditor ? 'Tutup Pengaturan Foto' : 'Edit Foto'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintDocument}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-xs transition-colors shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Lampiran Foto Saja (PDF)</span>
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium">Preset Khusus Agustusan:</span>
            <button
              type="button"
              onClick={handleLoadTirakatanPreset}
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>🇮🇩 Malam Tirakatan</span>
            </button>
            <button
              type="button"
              onClick={handleLoadResepsiPreset}
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>🇮🇩 Malam Resepsi</span>
            </button>
            <button
              type="button"
              onClick={handleLoadKarnavalPreset}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1.5 transition-colors shadow-xs"
              title="Preset Dokumentasi Karnaval Budaya Minggu, 30 Agustus 2026 Lapangan Morokono"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>🇮🇩 Karnaval Budaya (30 Ags)</span>
            </button>
            <button
              type="button"
              onClick={handleLoadCurrentMonthDefaults}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg font-medium transition-colors"
            >
              Reset Default Bulan {month}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-600 text-xs">
              Total: <strong>{photos.length} Foto</strong> ({sheets.length} Lembar Cetak • Format <strong>{photosPerPage} Foto</strong>/Lembar)
            </span>
            <button
              type="button"
              onClick={handleAddPhoto}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-3 py-1 rounded-lg flex items-center space-x-1 text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Foto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Panel (Screen Only, Collapsible) */}
      {showEditor && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs print:hidden space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-red-600" />
              <span>Pengaturan & Orientasi Tiap Foto Dokumentasi</span>
            </h4>
            <span className="text-xs text-slate-500">
              Pilih orientasi Landscape atau Portrait untuk tiap foto
            </span>
          </div>

          {/* Photo Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {photos.map((photo, idx) => (
              <button
                key={photo.id || idx}
                type="button"
                onClick={() => setActivePhotoIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                  activePhotoIndex === idx
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Foto {idx + 1}</span>
                <span className={`text-[10px] uppercase px-1.5 py-0.2 rounded-md ${
                  activePhotoIndex === idx
                    ? 'bg-red-700 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {photo.orientation === 'portrait' ? 'Tegak' : 'Mendatar'}
                </span>
              </button>
            ))}
          </div>

          {/* Active Photo Editing Form */}
          {activePhotoIndex !== null && photos[activePhotoIndex] && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                    {activePhotoIndex + 1}
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {photos[activePhotoIndex].title || `Foto Dokumentasi ${activePhotoIndex + 1}`}
                  </span>
                </div>

                {/* Actions: Move, Delete */}
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleMovePhoto(activePhotoIndex, 'up')}
                    disabled={activePhotoIndex === 0}
                    className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-200 rounded-lg text-slate-600"
                    title="Pindah ke Atas"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMovePhoto(activePhotoIndex, 'down')}
                    disabled={activePhotoIndex === photos.length - 1}
                    className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-200 rounded-lg text-slate-600"
                    title="Pindah ke Bawah"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(activePhotoIndex)}
                    className="p-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg"
                    title="Hapus Foto Ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Controls: Orientation & Fit Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    1. Orientasi Pengambilan Foto
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleOrientation(activePhotoIndex)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 border transition-all ${
                        photos[activePhotoIndex].orientation !== 'portrait'
                          ? 'bg-red-50 text-red-700 border-red-300 ring-2 ring-red-400/20'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base">📐</span>
                      <div className="text-left">
                        <div className="leading-none">Landscape</div>
                        <div className="text-[10px] font-normal opacity-80">Mendatar (3:2)</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleOrientation(activePhotoIndex)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 border transition-all ${
                        photos[activePhotoIndex].orientation === 'portrait'
                          ? 'bg-red-50 text-red-700 border-red-300 ring-2 ring-red-400/20'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base">📏</span>
                      <div className="text-left">
                        <div className="leading-none">Portrait</div>
                        <div className="text-[10px] font-normal opacity-80">Tegak (2:3)</div>
                      </div>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    {photos[activePhotoIndex].orientation === 'portrait'
                      ? 'Format Tegak: Foto ditampilkan tegak 2:3 dengan tabel keterangan di sebelahnya.'
                      : 'Format Mendatar: Foto ditampilkan lebar 3:2 dengan keterangan di bawahnya.'}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    2. Sumber Foto & Unggah Gambar
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center space-x-2 border border-slate-300 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>Unggah File dari HP / Laptop</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(activePhotoIndex, e)}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleToggleFitMode(activePhotoIndex)}
                      className="px-2.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 text-[11px] font-medium shrink-0"
                      title="Ganti Mode Potong/Penuh"
                    >
                      {photos[activePhotoIndex].fitMode === 'contain' ? 'Mode: Utuh' : 'Mode: Penuh'}
                    </button>
                  </div>
                  <div>
                    <input
                      type="url"
                      placeholder="Atau tempel Link URL Foto di sini..."
                      value={photos[activePhotoIndex].imageUrl}
                      onChange={(e) => handleUpdateField(activePhotoIndex, 'imageUrl', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Text Fields: Title, Description, Date, Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase text-[11px] mb-1">
                    Judul Foto / Kegiatan
                  </label>
                  <input
                    type="text"
                    value={photos[activePhotoIndex].title}
                    onChange={(e) => handleUpdateField(activePhotoIndex, 'title', e.target.value)}
                    placeholder="Contoh: Malam Tirakatan HUT RI Ke 81"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase text-[11px] mb-1">
                      Hari & Tanggal
                    </label>
                    <input
                      type="text"
                      value={photos[activePhotoIndex].date || ''}
                      onChange={(e) => handleUpdateField(activePhotoIndex, 'date', e.target.value)}
                      placeholder="Contoh: 16 Agustus 2026"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase text-[11px] mb-1">
                      Tempat / Lokasi
                    </label>
                    <input
                      type="text"
                      value={photos[activePhotoIndex].location || ''}
                      onChange={(e) => handleUpdateField(activePhotoIndex, 'location', e.target.value)}
                      placeholder="Contoh: Balai Warga RT 04"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 uppercase text-[11px] mb-1 flex items-center justify-between">
                    <span>Keterangan (Opsional)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Tidak wajib diisi</span>
                  </label>
                  <textarea
                    rows={2}
                    value={photos[activePhotoIndex].description || ''}
                    onChange={(e) => handleUpdateField(activePhotoIndex, 'description', e.target.value)}
                    placeholder="Opsional: Keterangan singkat aktivitas atau pembelanjaan..."
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                  ></textarea>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE DOSSIER: PILIHAN 2 FOTO ATAU 4 FOTO PER LEMBAR                  */}
      {/* ========================================================================= */}
      <div className="space-y-8 font-arial-narrow official-doc text-slate-900">
        {sheets.map((sheetPhotos, sheetIdx) => {
          const sheetNumber = sheetIdx + 1;
          const totalSheets = sheets.length;

          return (
            <div
              key={`sheet-${sheetIdx}`}
              className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm print-page-break flex flex-col justify-start"
              style={{ minHeight: '290mm' }}
            >
              {/* Official Header / KOP Surat Resmi */}
              <div className="pb-1 mb-3">
                <div className="flex items-center justify-between">
                  <div className="w-20 h-20 print:w-20 print:h-20 flex-shrink-0 flex items-center justify-center">
                    <img 
                      src={meetingType === 'pkk' ? (profile.pkkLogoUrl || profile.logoUrl || DEFAULT_SEMARANG_LOGO) : (profile.logoUrl || DEFAULT_SEMARANG_LOGO)} 
                      alt={meetingType === 'pkk' ? "Logo PKK" : "Logo Kota Semarang"} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-center flex-grow px-2">
                    {meetingType === 'pkk' ? (
                      <>
                        <div className="text-[16px] font-bold uppercase text-slate-900 leading-tight">
                          PEMBERDAYAAN KESEJAHTERAAN KELUARGA<br/>(PKK)
                        </div>
                        <div className="text-[16px] font-bold uppercase text-slate-900 leading-tight mt-1">
                          RUKUN TETANGGA {profile.rtNumber} RUKUN WARGA {profile.rwNumber}
                        </div>
                        <div className="text-[16px] font-bold uppercase text-slate-900 leading-tight">
                          KELURAHAN {profile.kelurahan} KECAMATAN {profile.kecamatan}
                        </div>
                        <div className="text-[16px] font-bold uppercase text-slate-900 leading-tight">
                          KOTA SEMARANG
                        </div>
                      </>
                    ) : (
                      <>
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
                          RT {profile.rtNumber} RW {profile.rwNumber} NGABEAN
                        </div>
                      </>
                    )}
                    <p className="text-[10px] text-slate-600 leading-tight mt-0.5">
                      Alamat: Ngabean RT {profile.rtNumber} RW {profile.rwNumber} Kelurahan {profile.kelurahan}
                    </p>
                  </div>
                  <div className="w-20 h-20 print:w-20 print:h-20 flex-shrink-0"></div>
                </div>
                <div className="h-0.5 bg-slate-900 mt-2"></div>
                <div className="h-px bg-slate-900 mt-0.5"></div>
              </div>

              {/* Title Section */}
              <div className="text-center mb-3">
                <h1 className="text-sm font-extrabold uppercase text-slate-900 inline-block border-b-[1.5px] border-slate-900 pb-0.5">
                  LAMPIRAN FOTO DOKUMENTASI KEGIATAN
                </h1>
                <p className="text-[10px] text-slate-600 font-medium mt-1">
                  Bulan {month} Tahun {profile.year} • Lembar ke-{sheetNumber} dari {totalSheets} (Format {photosPerPage} Foto/Lembar)
                </p>
              </div>

              {/* Layout Content: 2 Foto vs 4 Foto */}
              {photosPerPage === 2 ? (
                /* --- PILIHAN 1: FORMAT 2 FOTO PER LEMBAR (UKURAN BESAR POSTCARD 10X15 CM + RINCIAN) --- */
                <div className="space-y-4 flex-1 content-start mt-1">
                  {sheetPhotos.map((photo, photoInSheetIdx) => {
                    const globalPhotoNumber = sheetIdx * 2 + photoInSheetIdx + 1;

                    return (
// 2-Photo Mode Card Rendering
                      <div
                        key={photo.id || photoInSheetIdx}
                        className="border border-slate-200 rounded-xl p-3.5 bg-white print:border-slate-300 print-avoid-break min-h-[102mm] max-h-[114mm] flex flex-col justify-between shadow-2xs print:shadow-none"
                      >
                        {/* Top Bar for each photo */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-xs">
                          <div className="flex items-center space-x-2 truncate">
                            <span className="bg-slate-900 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shrink-0 tracking-wider">
                              FOTO {globalPhotoNumber}
                            </span>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {photo.title || `Dokumentasi Kegiatan ${globalPhotoNumber}`}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-600 font-medium shrink-0 flex items-center space-x-2">
                            {photo.date && (
                              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                                📅 {photo.date}
                              </span>
                            )}
                            {photo.location && (
                              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200 font-medium hidden sm:inline">
                                📍 {photo.location}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Side-by-Side Content: Foto Besar (Kiri) + Keterangan Lengkap (Kanan) */}
                        <div className="flex flex-col sm:flex-row gap-3.5 flex-1 items-stretch">
                          {/* Foto Container (Setara Postcard 10x15cm) */}
                          <div className="w-full sm:w-[58%] h-[78mm] sm:h-[88mm] bg-slate-50/80 border border-slate-300 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-2xs print:shadow-none">
                            {photo.imageUrl ? (
                              <img
                                src={photo.imageUrl}
                                alt={photo.title}
                                className={photo.fitMode === 'contain' ? 'max-w-full max-h-full object-contain' : 'w-full h-full object-cover'}
                              />
                            ) : (
                              <div className="text-center p-4 text-slate-400 text-xs">
                                <Camera className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                                <span>Foto Belum Diunggah</span>
                              </div>
                            )}
                          </div>

                          {/* Rincian Kegiatan di Kanan */}
                          <div className="w-full sm:w-[42%] flex flex-col justify-start bg-slate-50/90 border border-slate-200 rounded-lg p-3.5 text-xs leading-relaxed">
                            <div className="space-y-2.5">
                              <div>
                                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">
                                  Kegiatan / Pembelanjaan:
                                </span>
                                <div className="font-bold text-slate-900 text-xs mt-0.5 leading-snug">
                                  {photo.title || `Dokumentasi Kegiatan ${globalPhotoNumber}`}
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-200/80 space-y-1 text-[10.5px]">
                                {photo.date && (
                                  <div className="flex items-start space-x-1">
                                    <span className="text-slate-500 font-medium w-14 shrink-0">Tanggal:</span>
                                    <span className="font-semibold text-slate-800">{photo.date}</span>
                                  </div>
                                )}
                                {photo.location && (
                                  <div className="flex items-start space-x-1">
                                    <span className="text-slate-500 font-medium w-14 shrink-0">Lokasi:</span>
                                    <span className="font-semibold text-slate-800">{photo.location}</span>
                                  </div>
                                )}
                              </div>

                              {showKeterangan && photo.description?.trim() && (
                                <div className="pt-2 border-t border-slate-200/80">
                                  <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-0.5">
                                    Keterangan Detail:
                                  </span>
                                  <p className="text-[10.5px] text-slate-700 leading-relaxed text-justify line-clamp-4 print:line-clamp-none">
                                    {photo.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty slot jika ganjil (1 foto tersisa pada lembar ganjil) - Bersih tanpa watermark, tersembunyi saat cetak */}
                  {Array.from({ length: 2 - sheetPhotos.length }).map((_, emptyIdx) => (
                    <div
                      key={`empty-2-${emptyIdx}`}
                      className="print:hidden border border-dashed border-slate-200 rounded-lg p-6 text-center text-xs flex flex-col items-center justify-center min-h-[102mm] bg-slate-50/40 hover:bg-slate-50 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={handleAddPhoto}
                        className="bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-all"
                      >
                        + Tambah Foto Dokumentasi
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                /* --- PILIHAN 2: FORMAT 4 FOTO PER LEMBAR (GRID 2x2 RINGKAS & HEMAT KERTAS) --- */
                <div className="grid grid-cols-2 gap-3.5 flex-1 content-start mt-1">
                  {sheetPhotos.map((photo, photoInSheetIdx) => {
                    const globalPhotoNumber = sheetIdx * 4 + photoInSheetIdx + 1;

                    return (
                      <div
                        key={photo.id || photoInSheetIdx}
                        className="border border-slate-200 rounded-xl p-3 bg-white print:border-slate-300 print-avoid-break h-[96mm] flex flex-col justify-between shadow-2xs print:shadow-none"
                      >
                        {/* Top Bar for each photo */}
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200 text-[10px]">
                          <div className="flex items-center space-x-1.5 truncate">
                            <span className="bg-slate-900 text-white font-bold text-[9px] px-2 py-0.5 rounded-md shrink-0 tracking-wide">
                              FOTO {globalPhotoNumber}
                            </span>
                            <span className="font-bold text-slate-900 text-xs truncate max-w-[55mm]">
                              {photo.title || `Dokumentasi ${globalPhotoNumber}`}
                            </span>
                          </div>
                          {photo.date && (
                            <span className="text-[9.5px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-medium truncate shrink-0 hidden sm:inline">
                              📅 {photo.date}
                            </span>
                          )}
                        </div>

                        {/* Photo Layout */}
                        <div className="flex-1 flex flex-col h-full my-1">
                          <div 
                            className="w-full h-full bg-slate-50/80 border border-slate-300 rounded-lg flex items-center justify-center overflow-hidden shadow-2xs print:shadow-none"
                          >
                            {photo.imageUrl ? (
                              <img
                                src={photo.imageUrl}
                                alt={photo.title}
                                className={photo.fitMode === 'contain' ? 'max-w-full max-h-full object-contain' : 'w-full h-full object-cover'}
                              />
                            ) : (
                              <div className="text-center p-2 text-slate-400 text-[10px]">
                                <Camera className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                                <span>Foto Belum Diunggah</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Keterangan singkat bawah (Opsional) */}
                        {showKeterangan && photo.description?.trim() && (
                          <div className="pt-1.5 mt-1 border-t border-slate-200 text-[9.5px] text-slate-700 truncate">
                            <span className="font-bold text-slate-900">Ket: </span>
                            {photo.description}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Fill empty slots in the grid (up to 4) - Bersih tanpa watermark, tersembunyi saat cetak */}
                  {Array.from({ length: 4 - sheetPhotos.length }).map((_, emptyIdx) => (
                    <div
                      key={`empty-4-${emptyIdx}`}
                      className="print:hidden border border-dashed border-slate-200 rounded-lg p-4 text-center text-xs flex flex-col items-center justify-center h-[95mm] bg-slate-50/40 hover:bg-slate-50 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={handleAddPhoto}
                        className="bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-all"
                      >
                        + Tambah Foto
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
