import { DEFAULT_SEMARANG_LOGO } from '../data/initialData';
import React, { useState } from 'react';
import { RtProfile, MusyawarahRecord } from '../types';
import { formatDate } from '../utils/formatters';
import { Printer, FileText, CheckCircle2, Users, Calendar } from 'lucide-react';
import { executePrint } from '../utils/printHelper';

interface BaKesepakatanManagerProps {
  profile: RtProfile;
  records: MusyawarahRecord[];
  onAddRecord: (record: MusyawarahRecord) => void;
}

export const BaKesepakatanManager: React.FC<BaKesepakatanManagerProps> = ({
  profile,
  records,
  onAddRecord,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [participantCount, setParticipantCount] = useState(35);
  const [leader, setLeader] = useState(profile.ketuaRt);
  const [secretary, setSecretary] = useState(profile.sekretaris);
  const [nomorBA, setNomorBA] = useState(`001/BA-RAP/${profile.rtNumber}.${profile.rwNumber}/VIII/2026`);

  const handlePrint = () => {
    executePrint(`Berita Acara Kesepakatan RAP BOP RT ${profile.rtNumber} Tahun ${profile.year}`);
  };

  const handleSaveToMusyawarah = () => {
    const newRec: MusyawarahRecord = {
      id: Date.now().toString(),
      date: selectedDate,
      title: `Berita Acara Kesepakatan Rencana Anggaran Penggunaan BOP RT 04`,
      participantCount: participantCount,
      agenda: 'Musyawarah Warga Penetapan Rencana Anggaran Penggunaan Bantuan Operasional (BOP) RT Tahun Anggaran 2026',
      decisions: 'Warga secara mufakat menyetujui seluruh alokasi RAP sebesar Rp 25.000.000 tanpa alokasi untuk gaji/honor pengurus.',
      leader: leader,
      secretary: secretary,
    };
    onAddRecord(newRec);
    alert('Berita Acara Kesepakatan berhasil disimpan ke daftar musyawarah warga!');
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded-full border border-red-200 mb-2">
            <span>Tahap 1 dari Alur Sistem BOP RT</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-red-600" />
            <span>Berita Acara (BA) Kesepakatan Rencana Anggaran Penggunaan Bantuan Operasional</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumen wajib hasil musyawarah warga RT {profile.rtNumber} / RW {profile.rwNumber} dalam menentukan alokasi dana BOP RT.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveToMusyawarah}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-slate-300 text-xs flex items-center space-x-2 transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Simpan ke Arsip Musyawarah</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Berita Acara (PDF)</span>
          </button>
        </div>
      </div>

      {/* Editor Box (Hidden when printing) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs print:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Nomor Berita Acara
          </label>
          <input
            type="text"
            value={nomorBA}
            onChange={(e) => setNomorBA(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Tanggal Musyawarah
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
            Pimpinan Rapat (Ketua RT)
          </label>
          <input
            type="text"
            value={leader}
            onChange={(e) => setLeader(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Jumlah Warga Hadir
          </label>
          <input
            type="number"
            value={participantCount}
            onChange={(e) => setParticipantCount(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
          />
        </div>
      </div>

      {/* Official Printable BA Container */}
      <div className="bg-white p-10 sm:p-16 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto text-slate-900 leading-relaxed font-arial-narrow official-doc">
        {/* Header */}
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
              BERITA ACARA KESEPAKATAN
            </h2>
            <h3 className="text-xs font-bold uppercase text-red-700 mt-0.5">
              RENCANA ANGGARAN PENGGUNAAN BANTUAN OPERASIONAL (BOP) RT {profile.rtNumber} / RW {profile.rwNumber}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Tahun Anggaran {profile.year}
            </p>
            <div className="text-xs font-semibold mt-1 text-slate-700">Nomor: {nomorBA}</div>
          </div>
          <div className="w-24 h-24 print:w-24 print:h-24 flex-shrink-0" />
        </div>

        {/* Body Content */}
        <div className="space-y-4 text-sm text-justify">
          <p className="indent-8">
            Pada hari ini, <strong>{formatDate(selectedDate)}</strong>, bertempat di Balai Warga RT {profile.rtNumber} / RW {profile.rwNumber}, Kelurahan {profile.kelurahan}, Kecamatan {profile.kecamatan}, Kota Semarang, telah diselenggarakan Musyawarah Warga yang dihadiri oleh pengurus RT dan warga masyarakat sebagaimana daftar hadir terlampir.
          </p>

          <p className="indent-8">
            Musyawarah dipimpin oleh Bapak <strong>{leader}</strong> (Ketua RT {profile.rtNumber}) dan bertindak selaku sekretaris saudari/saudara <strong>{secretary}</strong>, dengan jumlah peserta yang hadir sebanyak <strong>{participantCount} orang</strong> warga.
          </p>

          <p className="indent-8">
            Setelah melalui pembahasan, musyawarah warga secara mufakat dan aklamasi menyetujui serta menetapkan <strong>Rencana Anggaran Penggunaan (RAP) Bantuan Operasional RT (BOP RT)</strong> Tahun Anggaran {profile.year} dengan total pagu sebesar <strong>Rp {profile.totalPagu.toLocaleString('id-ID')}</strong> yang bersumber dari APBD Kota Semarang.
          </p>

          <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold uppercase text-slate-800">Pokok-pokok Keputusan Musyawarah:</div>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>Pagu bantuan sebesar Rp 25.000.000 dialokasikan secara transparan untuk 5 bidang peruntukan (Kebersihan Lingkungan, Kegiatan Sosial, Pemberdayaan Warga, Ketahanan Pangan, dan Administrasi RT).</li>
              <li>Dana BOP RT <strong>TIDAK DIGUNAKAN</strong> untuk pembayaran gaji atau honorarium pengurus RT.</li>
              <li>Setiap pengeluaran wajib disertai nota/kwitansi sah dan dibahas/dilaporkan kembali pada pertemuan rutin warga berikutnya.</li>
            </ul>
          </div>

          <p className="indent-8">
            Demikian Berita Acara Kesepakatan ini dibuat dengan sebenarnya dan penuh tanggung jawab agar dapat dipergunakan sebagaimana mestinya dalam proses permohonan pencairan bantuan.
          </p>
        </div>

        {/* Signatures */}
        <div className="mt-12 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="font-semibold">Mengetahui,</p>
            <p className="font-bold uppercase">Ketua RW {profile.rwNumber}</p>
            <div className="h-20"></div>
            <p className="font-bold underline uppercase">{profile.rwChairman}</p>
          </div>
          <div>
            <p className="font-semibold">Semarang, {formatDate(selectedDate)}</p>
            <p className="font-bold uppercase">Ketua RT {profile.rtNumber}</p>
            <div className="h-20"></div>
            <p className="font-bold underline uppercase">{profile.ketuaRt}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
