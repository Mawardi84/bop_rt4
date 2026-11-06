import { DEFAULT_SEMARANG_LOGO } from '../data/initialData';
import React, { useState } from 'react';
import { RtProfile } from '../types';
import { formatDate } from '../utils/formatters';
import { Printer, ShieldCheck, Download, ExternalLink, Loader2 } from 'lucide-react';
import { downloadElementAsPdf, executePrint, openInNewTab } from '../utils/printHelper';

interface SptjmGeneratorProps {
  profile: RtProfile;
}

export const SptjmGenerator: React.FC<SptjmGeneratorProps> = ({ profile }) => {
  const [nomorSptjm, setNomorSptjm] = useState(`003/SPTJM/${profile.rtNumber}.${profile.rwNumber}/VIII/2026`);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [nikKetua, setNikKetua] = useState('3374................');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handlePrint = () => {
    executePrint(`SPTJM BOP RT ${profile.rtNumber} - ${nomorSptjm}`);
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    const success = await downloadElementAsPdf('.official-doc', `SPTJM_BOP_RT_${profile.rtNumber}_RW_${profile.rwNumber}.pdf`);
    if (!success) {
      executePrint(`SPTJM BOP RT ${profile.rtNumber} RW ${profile.rwNumber}`);
    }
    setIsDownloadingPdf(false);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded-full border border-red-200 mb-2">
            <span>Tahap 3 dari Alur Sistem BOP RT</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-red-600" />
            <span>Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Surat pernyataan resmi bermaterai yang menyatakan tanggung jawab mutlak penggunaan dana bantuan operasional RT.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all cursor-pointer disabled:opacity-50"
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
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all cursor-pointer"
            title="Buka dialog cetak browser"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Print</span>
          </button>

          <button
            type="button"
            onClick={openInNewTab}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 text-xs transition-all cursor-pointer border border-slate-200"
            title="Buka aplikasi di tab baru jika cetak terhalang oleh frame preview"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>Buka Tab Baru</span>
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs print:hidden grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Nomor SPTJM
          </label>
          <input
            type="text"
            value={nomorSptjm}
            onChange={(e) => setNomorSptjm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Tanggal Surat
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            NIK Ketua RT
          </label>
          <input
            type="text"
            value={nikKetua}
            onChange={(e) => setNikKetua(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
          />
        </div>
      </div>

      {/* Official Printable SPTJM Container */}
      <div className="bg-white p-10 sm:p-16 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto text-slate-900 leading-relaxed font-arial-narrow official-doc">
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-8">
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
            <h2 className="text-sm font-bold uppercase text-slate-900 leading-tight">
              SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK (SPTJM)
            </h2>
            <h3 className="text-xs font-bold uppercase text-red-700 mt-0.5">
              BANTUAN OPERASIONAL RT {profile.rtNumber} / RW {profile.rwNumber} TAHUN {profile.year}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">Nomor: {nomorSptjm}</p>
          </div>
          <div className="w-24 h-24 print:w-24 print:h-24 flex-shrink-0" />
        </div>

        <div className="space-y-4 text-sm text-justify">
          <p>Yang bertanda tangan di bawah ini:</p>
          <div className="pl-6 space-y-1">
            <div className="flex"><span className="w-40 font-semibold">Nama Lengkap</span><span>: {profile.ketuaRt}</span></div>
            <div className="flex"><span className="w-40 font-semibold">Jabatan</span><span>: Ketua RT {profile.rtNumber} / RW {profile.rwNumber}</span></div>
            <div className="flex"><span className="w-40 font-semibold">NIK</span><span>: {nikKetua}</span></div>
            <div className="flex"><span className="w-40 font-semibold">Alamat</span><span>: RT {profile.rtNumber} / RW {profile.rwNumber}, Kel. {profile.kelurahan}, Kec. {profile.kecamatan}, Kota Semarang</span></div>
          </div>

          <p className="pt-2">
            Dengan ini menyatakan dengan sesungguhnya bahwa Bantuan Operasional Rukun Tetangga (BOP RT) Tahun Anggaran {profile.year} sebesar <strong>Rp {profile.totalPagu.toLocaleString('id-ID')}</strong> yang diterima dari Pemerintah Kota Semarang:
          </p>

          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Akan dipergunakan sesuai dengan Rencana Anggaran Penggunaan (RAP) yang telah disepakati dalam musyawarah warga dan ketentuan peraturan perundang-undangan yang berlaku.
            </li>
            <li>
              Tidak akan mempergunakan dana bantuan tersebut untuk pembayaran gaji atau honorarium pengurus RT.
            </li>
            <li>
              Bertanggung jawab penuh baik secara formal maupun material atas penggunaan dana bantuan operasional tersebut serta kelengkapan bukti-bukti pengeluaran (SPJ).
            </li>
            <li>
              Bersedia dilakukan pemeriksaan/audit oleh aparat pengawas fungsional yang berwenang apabila diperlukan.
            </li>
          </ol>

          <p className="indent-8 pt-2">
            Demikian surat pernyataan ini kami buat dengan sebenarnya, tanpa ada unsur paksaan dari pihak manapun, dan apabila di kemudian hari ternyata pernyataan ini tidak benar, kami bersedia dituntut sesuai dengan ketentuan hukum yang berlaku.
          </p>
        </div>

        {/* Signature & Materai */}
        <div className="mt-12 flex justify-between items-end">
          <div className="border border-slate-400 p-6 w-48 text-center text-[11px] text-slate-500 rounded-sm">
            <div>TEMPEL</div>
            <div>MATERAI</div>
            <div className="mt-8 font-bold">Rp 10.000</div>
          </div>
          <div className="text-center w-64">
            <p className="text-sm">Semarang, {formatDate(selectedDate)}</p>
            <p className="text-sm font-bold uppercase mt-1">Ketua RT {profile.rtNumber} RW {profile.rwNumber}</p>
            <div className="h-20"></div>
            <p className="text-sm font-bold underline uppercase">{profile.ketuaRt}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
