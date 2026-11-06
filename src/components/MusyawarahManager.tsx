import React, { useState } from 'react';
import { MusyawarahRecord, RtProfile } from '../types';
import { formatDate } from '../utils/formatters';
import { Users, Plus, FileText, CheckCircle2, Calendar, UserCheck } from 'lucide-react';
import { executePrint } from '../utils/printHelper';

interface MusyawarahManagerProps {
  records: MusyawarahRecord[];
  onAddRecord: (record: MusyawarahRecord) => void;
  profile: RtProfile;
}

export const MusyawarahManager: React.FC<MusyawarahManagerProps> = ({
  records,
  onAddRecord,
  profile,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('Musyawarah Warga Penggunaan Dana BOP RT');
  const [participantCount, setParticipantCount] = useState<number>(30);
  const [agenda, setAgenda] = useState('');
  const [decisions, setDecisions] = useState('');
  const [leader, setLeader] = useState(profile.ketuaRt);
  const [secretary, setSecretary] = useState(profile.bendaharaRt);
  const [selectedRecord, setSelectedRecord] = useState<MusyawarahRecord | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agenda || !decisions) return;

    const newRecord: MusyawarahRecord = {
      id: `mus-${Date.now()}`,
      date,
      title,
      participantCount: Number(participantCount),
      agenda,
      decisions,
      leader,
      secretary,
    };

    onAddRecord(newRecord);
    setIsModalOpen(false);
    // Reset
    setAgenda('');
    setDecisions('');
  };

  const handlePrintBeritaAcara = (record: MusyawarahRecord) => {
    setSelectedRecord(record);
    setTimeout(() => {
      executePrint(`Berita Acara - ${record.title}`);
    }, 150);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Berita Acara Musyawarah Warga</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Setiap penggunaan dana BOP RT wajib diputuskan melalui musyawarah warga sesuai aturan Pemkot Semarang.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Berita Acara Baru</span>
        </button>
      </div>

      {/* List of Musyawarah Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {records.map((rec) => (
          <div
            key={rec.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-red-200 transition-all"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sah (Musyawarah Warga)</span>
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(rec.date)}</span>
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-2">{rec.title}</h3>
              <p className="text-xs text-slate-600 mb-3">
                <strong>Agenda:</strong> {rec.agenda}
              </p>
              <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <strong>Hasil Keputusan:</strong> {rec.decisions}
              </p>

              <div className="flex items-center space-x-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{rec.participantCount} Warga Hadir</span>
                </div>
                <div className="flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pimpinan: {rec.leader}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handlePrintBeritaAcara(rec)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center space-x-2 transition-all"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <span>Cetak Dokumen Resmi</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Musyawarah */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">Buat Berita Acara Musyawarah</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Judul / Topik Musyawarah *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Tanggal Musyawarah *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Jumlah Warga Hadir *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={participantCount}
                    onChange={(e) => setParticipantCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Agenda / Pembahasan *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Cth: Pembahasan alokasi dana BOP RT untuk kebersihan dan ketahanan pangan."
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Hasil Keputusan Warga *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Cth: Warga sepakat menggunakan anggaran untuk pembelian alat kebersihan dan bibit tanaman..."
                  value={decisions}
                  onChange={(e) => setDecisions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Pimpinan Rapat *
                  </label>
                  <input
                    type="text"
                    required
                    value={leader}
                    onChange={(e) => setLeader(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Sekretaris / Notulen *
                  </label>
                  <input
                    type="text"
                    required
                    value={secretary}
                    onChange={(e) => setSecretary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 shadow-xs"
                >
                  Simpan Berita Acara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Printable Berita Acara */}
      {selectedRecord && (
        <div className="hidden print:block bg-white p-12 text-slate-900 official-doc font-arial-narrow">
          <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
            <h2 className="text-lg font-bold uppercase">BERITA ACARA MUSYAWARAH WARGA</h2>
            <h3 className="text-base font-bold uppercase text-red-700">
              PENGGUNAAN DANA BANTUAN OPERASIONAL PENYELENGGARAAN (BOP) RT
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              RT {profile.rtNumber} / RW {profile.rwNumber}, Kel. {profile.kelurahan}, Kec. {profile.kecamatan}, Kota Semarang
            </p>
          </div>

          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              Pada hari ini tanggal <strong>{formatDate(selectedRecord.date)}</strong>, bertempat di wilayah RT {profile.rtNumber} RW {profile.rwNumber}, Kelurahan {profile.kelurahan}, telah diselenggarakan Musyawarah Warga yang dihadiri oleh <strong>{selectedRecord.participantCount} orang</strong> warga (daftar hadir terlampir).
            </p>

            <div>
              <p className="font-bold">1. Agenda Pembahasan:</p>
              <p className="pl-4 text-slate-700">{selectedRecord.agenda}</p>
            </div>

            <div>
              <p className="font-bold">2. Hasil Keputusan Musyawarah Warga:</p>
              <p className="pl-4 text-slate-700">{selectedRecord.decisions}</p>
            </div>

            <p>
              Demikian Berita Acara ini dibuat dengan sebenarnya dan penuh tanggung jawab agar dapat dipergunakan sebagaimana mestinya sebagai kelengkapan Laporan Pertanggungjawaban (SPJ) Dana BOP RT Tahun Anggaran {profile.year}.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <p className="font-semibold uppercase">Pimpinan Rapat / Ketua RT</p>
              <div className="h-20"></div>
              <p className="font-bold underline uppercase">{selectedRecord.leader}</p>
            </div>
            <div>
              <p className="font-semibold uppercase">Notulen / Sekretaris</p>
              <div className="h-20"></div>
              <p className="font-bold underline uppercase">{selectedRecord.secretary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
