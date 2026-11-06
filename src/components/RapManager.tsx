import React, { useState } from 'react';
import { RapItem, RtProfile, TransactionCategory } from '../types';
import { formatRupiah } from '../utils/formatters';
import { FileSpreadsheet, Printer, Plus, Trash2, Calendar, CheckCircle2, Zap } from 'lucide-react';
import { executePrint } from '../utils/printHelper';

interface RapManagerProps {
  rapItems: RapItem[];
  onUpdateRap: (items: RapItem[]) => void;
  profile: RtProfile;
  onAbsorbRapToTransactions?: () => void;
}

export const RapManager: React.FC<RapManagerProps> = ({ rapItems, onUpdateRap, profile, onAbsorbRapToTransactions }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for new RAP item
  const [month, setMonth] = useState('Januari');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('administrasi');
  const [qty, setQty] = useState<number | ''>(40);
  const [unit, setUnit] = useState('Dos');
  const [price, setPrice] = useState<number | ''>(10000);

  const months = [
    'Januari',
    'Pebruari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || qty === '' || price === '') return;

    const monthIndex = months.indexOf(month) + 1;
    const newItem: RapItem = {
      id: `rap-${Date.now()}`,
      month,
      monthNumber: monthIndex > 0 ? monthIndex : 1,
      category,
      description,
      qty: Number(qty),
      unit,
      price: Number(price),
      total: Number(qty) * Number(price),
    };

    onUpdateRap([...rapItems, newItem]);
    setIsModalOpen(false);
    setDescription('');
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Hapus item Rencana Anggaran ini?')) {
      onUpdateRap(rapItems.filter((i) => i.id !== id));
    }
  };

  const handlePrint = () => {
    executePrint(`Rincian RAP BOP RT ${profile.rtNumber} Tahun ${profile.year} - ${selectedMonth === 'all' ? '12 Bulan' : selectedMonth}`);
  };

  const filteredItems = rapItems.filter(
    (item) => selectedMonth === 'all' || item.month === selectedMonth
  );

  const grandTotal = rapItems.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="space-y-6">
      {/* Controls Bar (Hidden when printing) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-red-600" />
            <span>Rencana Anggaran Penggunaan (RAP) BOP RT</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rincian alokasi dana BOP RT selama 1 tahun (Januari - Desember) sesuai hasil musyawarah warga RT {profile.rtNumber} RW {profile.rwNumber}.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700"
          >
            <option value="all">Semua Bulan (1 Tahun)</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {onAbsorbRapToTransactions && (
            <button
              onClick={onAbsorbRapToTransactions}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 text-xs transition-all"
              title="Serap rincian RAP ini langsung ke pencatatan transaksi kas keluar secara otomatis"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-200" />
              <span>Serap RAP ke Transaksi</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Item RAP</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center space-x-2 text-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak RAP (PDF)</span>
          </button>
        </div>
      </div>

      {/* Official Printable RAP Document Container */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto text-slate-900 official-doc font-arial-narrow">
        {/* Header Official */}
        <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
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
          <div className="h-px bg-slate-300 my-2"></div>
          <h2 className="text-sm sm:text-base font-bold uppercase text-slate-900 leading-tight">
            RENCANA ANGGARAN PENGGUNAAN BANTUAN OPERASIONAL RT
          </h2>
          <h3 className="text-xs font-bold text-red-700 uppercase mt-0.5">
            TAHUN ANGGARAN {profile.year}
          </h3>
        </div>

        {/* Monthly breakdown tables */}
        <div className="space-y-8">
          {(selectedMonth === 'all' ? months : [selectedMonth]).map((m) => {
            const itemsInMonth = filteredItems.filter((item) => item.month === m);
            if (selectedMonth === 'all' && itemsInMonth.length === 0) return null;

            const monthTotal = itemsInMonth.reduce((acc, curr) => acc + curr.total, 0);

            return (
              <div key={m} className="space-y-2">
                <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs uppercase text-slate-800 border-l-4 border-red-600 flex justify-between items-center">
                  <span>{m} {profile.year}</span>
                  <span>Subtotal: {formatRupiah(monthTotal)}</span>
                </div>

                <table className="w-full text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="border border-slate-300 py-2 px-2 text-center w-10">NO</th>
                      <th className="border border-slate-300 py-2 px-2 text-left">KETERANGAN</th>
                      <th className="border border-slate-300 py-2 px-2 text-center w-16">JUMLAH</th>
                      <th className="border border-slate-300 py-2 px-2 text-center w-20">SATUAN</th>
                      <th className="border border-slate-300 py-2 px-2 text-right w-24">HARGA (Rp)</th>
                      <th className="border border-slate-300 py-2 px-2 text-right w-28">TOTAL (Rp)</th>
                      <th className="border border-slate-300 py-2 px-2 text-center w-16 print:hidden">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsInMonth.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="border border-slate-300 py-4 text-center text-slate-400">
                          Tidak ada rincian anggaran untuk bulan {m}.
                        </td>
                      </tr>
                    ) : (
                      itemsInMonth.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="border border-slate-300 py-1.5 px-2 text-center">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-300 py-1.5 px-2 font-medium">
                            {item.description}
                          </td>
                          <td className="border border-slate-300 py-1.5 px-2 text-center">
                            {item.qty}
                          </td>
                          <td className="border border-slate-300 py-1.5 px-2 text-center">
                            {item.unit}
                          </td>
                          <td className="border border-slate-300 py-1.5 px-2 text-right">
                            {item.price.toLocaleString('id-ID')}
                          </td>
                          <td className="border border-slate-300 py-1.5 px-2 text-right font-bold">
                            {item.total.toLocaleString('id-ID')}
                          </td>
                          <td className="border border-slate-300 py-1.5 px-2 text-center print:hidden">
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={5} className="border border-slate-300 py-2 px-3 text-right">
                        Jumlah {m}:
                      </td>
                      <td colSpan={2} className="border border-slate-300 py-2 px-3 text-right text-red-700">
                        {formatRupiah(monthTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}

          {/* Grand Total Box */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center">
            <span className="font-bold text-sm uppercase">Total Rencana Anggaran (RAP) 1 Tahun:</span>
            <span className="font-extrabold text-lg text-emerald-400">{formatRupiah(grandTotal)}</span>
          </div>
        </div>

        {/* Official Signatures */}
        <div className="mt-12 pt-6 grid grid-cols-3 gap-6 text-xs text-center page-break-inside-avoid">
          <div>
            <p className="font-semibold">Sekretaris RT {profile.rtNumber}</p>
            <div className="h-16"></div>
            <p className="font-bold underline uppercase">{profile.sekretaris}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Semarang, 10 Juli {profile.year}</p>
            <p className="font-semibold">Ketua RT {profile.rtNumber}</p>
            <div className="h-16"></div>
            <p className="font-bold underline uppercase">{profile.ketuaRt}</p>
          </div>
          <div>
            <p className="font-semibold">&nbsp;</p>
            <p className="font-semibold">Bendahara RT {profile.rtNumber}</p>
            <div className="h-16"></div>
            <p className="font-bold underline uppercase">{profile.bendaharaRt}</p>
          </div>
        </div>
        <div className="mt-8 pt-4 grid grid-cols-2 gap-8 text-xs text-center page-break-inside-avoid border-t border-slate-200">
          <div>
            <p className="font-semibold">Mengetahui,</p>
            <p className="font-semibold uppercase">Lurah {profile.kelurahan}</p>
            <div className="h-16"></div>
            <p className="font-bold underline uppercase">{profile.lurahName}</p>
          </div>
          <div>
            <p className="font-semibold">&nbsp;</p>
            <p className="font-semibold uppercase">Ketua RW {profile.rwNumber}</p>
            <div className="h-16"></div>
            <p className="font-bold underline uppercase">{profile.rwChairman}</p>
          </div>
        </div>
      </div>

      {/* Modal Add RAP Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">Tambah Item Rencana Anggaran (RAP)</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Bulan Anggaran *
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
                  >
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Kategori Peruntukan *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
                  >
                    <option value="administrasi">Administrasi RT / Pertemuan</option>
                    <option value="kebersihan">Kebersihan Lingkungan</option>
                    <option value="sosial">Kegiatan Sosial</option>
                    <option value="pemberdayaan">Pemberdayaan Warga / PKK</option>
                    <option value="ketahanan_pangan">Ketahanan Pangan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Uraian Keterangan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cth: PERTEMUAN RUTIN WARGA - KONSUMSI"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Jumlah (Qty) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Satuan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Dos / Pcs / Keg"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Harga Satuan (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
                <span>Total Estimasi:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatRupiah(Number(qty || 0) * Number(price || 0))}
                </span>
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
                  Simpan Item RAP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
