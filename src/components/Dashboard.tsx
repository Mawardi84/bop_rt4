import React from 'react';
import { Transaction, RtProfile, RapItem } from '../types';
import { categoryLabels } from '../data/initialData';
import { formatRupiah } from '../utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Wallet,
  TrendingUp,
  ArrowDownRight,
  PieChart as PieChartIcon,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  PlusCircle,
  Users,
  BarChart3,
  Activity,
  Award,
  TrendingDown,
} from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  profile: RtProfile;
  rapItems?: RapItem[];
  onNavigate: (tab: any) => void;
  onOpenAddModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  profile,
  rapItems = [],
  onNavigate,
  onOpenAddModal,
}) => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const saldoKas = totalIncome - totalExpense;
  const remainingPagu = profile.totalPagu - totalExpense;
  const percentageUsed = Math.min(100, Math.round((totalExpense / profile.totalPagu) * 100));

  // Category breakdown
  const categoryTotals: Record<string, number> = {
    kebersihan: 0,
    sosial: 0,
    pemberdayaan: 0,
    ketahanan_pangan: 0,
    administrasi: 0,
    lainnya: 0,
  };

  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      if (categoryTotals[t.category] !== undefined) {
        categoryTotals[t.category] += t.amount;
      }
    });

  // Pie chart data
  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];
  const pieData = Object.entries(categoryTotals)
    .filter(([key, val]) => val > 0)
    .map(([key, val]) => ({
      name: categoryLabels[key]?.label || key,
      value: val,
    }));

  // Monthly comparison data for Recharts
  const monthsList = [
    { name: 'Jan', fullName: 'Januari' },
    { name: 'Feb', fullName: 'Pebruari' },
    { name: 'Mar', fullName: 'Maret' },
    { name: 'Apr', fullName: 'April' },
    { name: 'Mei', fullName: 'Mei' },
    { name: 'Jun', fullName: 'Juni' },
    { name: 'Jul', fullName: 'Juli' },
    { name: 'Ags', fullName: 'Agustus' },
    { name: 'Sep', fullName: 'September' },
    { name: 'Okt', fullName: 'Oktober' },
    { name: 'Nov', fullName: 'November' },
    { name: 'Des', fullName: 'Desember' },
  ];

  const chartData = monthsList.map((m) => {
    const rapTotal = rapItems
      .filter((item) => item.month.toLowerCase() === m.fullName.toLowerCase())
      .reduce((acc, curr) => acc + curr.total, 0);

    const realisasiTotal = transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        if (!t.date) return false;
        const mStr = t.date.split('-')[1];
        if (!mStr) return false;
        const mIdx = parseInt(mStr, 10) - 1;
        const monthNames = [
          'januari',
          'pebruari',
          'maret',
          'april',
          'mei',
          'juni',
          'juli',
          'agustus',
          'september',
          'oktober',
          'november',
          'desember',
        ];
        const targetMonthName = m.fullName.toLowerCase();
        return monthNames[mIdx] === targetMonthName || (mIdx === 1 && targetMonthName === 'pebruari');
      })
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      bulan: m.name,
      'Anggaran RAP': rapTotal,
      'Realisasi Pengeluaran': realisasiTotal,
    };
  });

  // Find max spending category
  let maxCategoryKey = 'kebersihan';
  let maxCategoryAmount = -1;
  Object.entries(categoryTotals).forEach(([k, v]) => {
    if (v > maxCategoryAmount) {
      maxCategoryAmount = v;
      maxCategoryKey = k;
    }
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-700 to-red-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full pointer-events-none blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-red-800/80 text-red-100 text-xs font-semibold px-3 py-1 rounded-full border border-red-500 mb-2">
              <span>BOP RT Kota Semarang • APBD Tahun {profile.year}</span>
            </div>
            <h2 className="text-2xl font-bold">
              Dashboard Analitik • RT {profile.rtNumber} / RW {profile.rwNumber}
            </h2>
            <p className="text-red-100 text-sm mt-1 max-w-xl">
              Analisis keuangan komprehensif, perbandingan anggaran RAP vs realisasi, distribusi peruntukan dana, dan tingkat penyerapan anggaran operasional.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenAddModal}
              className="bg-white text-red-700 hover:bg-red-50 font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 text-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Transaksi</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="bg-red-900/60 hover:bg-red-900 text-white border border-red-500 font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-2 text-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Cetak Laporan SPJ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-xl shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-500 truncate">Pagu Anggaran BOP RT</div>
            <div className="text-lg font-bold text-slate-900 truncate">{formatRupiah(profile.totalPagu)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">Sumber: APBD Kota Semarang</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-500 truncate">Total Kas Masuk (Pencairan)</div>
            <div className="text-lg font-bold text-slate-900 truncate">{formatRupiah(totalIncome)}</div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5 truncate">Dana Masuk ke Rekening RT</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="bg-amber-50 text-amber-600 p-3.5 rounded-xl shrink-0">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-500 truncate">Total Realisasi Pengeluaran</div>
            <div className="text-lg font-bold text-slate-900 truncate">{formatRupiah(totalExpense)}</div>
            <div className="text-[10px] text-amber-600 font-medium mt-0.5 truncate">{percentageUsed}% dari Pagu</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="bg-purple-50 text-purple-600 p-3.5 rounded-xl shrink-0">
            <PieChartIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-500 truncate">Sisa Pagu Anggaran</div>
            <div className="text-lg font-bold text-slate-900 truncate">{formatRupiah(remainingPagu)}</div>
            <div className="text-[10px] text-purple-600 font-medium mt-0.5 truncate">Saldo Kas: {formatRupiah(saldoKas)}</div>
          </div>
        </div>
      </div>

      {/* Analytics Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Tingkat Penyerapan Anggaran</div>
            <div className="text-base font-bold text-slate-900">{percentageUsed}% Terserap</div>
            <div className="text-[10px] text-slate-400">Target Efisiensi Juknis: Optimal</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Peruntukan Pengeluaran Terbesar</div>
            <div className="text-base font-bold text-slate-900">
              {categoryLabels[maxCategoryKey]?.label || 'Belum Ada'}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">{formatRupiah(maxCategoryAmount)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Total Transaksi Tercatat</div>
            <div className="text-base font-bold text-slate-900">{transactions.length} Transaksi</div>
            <div className="text-[10px] text-blue-600 font-medium">BKU Terverifikasi Otomatis</div>
          </div>
        </div>
      </div>

      {/* Recharts Comparison Chart & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-red-600" />
                <span>Perbandingan Anggaran RAP vs Realisasi Bulanan</span>
              </h3>
              <p className="text-xs text-slate-500">
                Grafik perbandingan perencanaan (RAP) dan realisasi aktual pengeluaran tiap bulan (Januari - Desember)
              </p>
            </div>
            <button
              onClick={() => onNavigate('rap')}
              className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 transition-all"
            >
              Atur RAP →
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="bulan" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `Rp ${value / 1000}rb`}
                />
                <Tooltip
                  formatter={(value: any) => formatRupiah(Number(value))}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#cbd5e1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Anggaran RAP" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Realisasi Pengeluaran" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Proporsi Pengeluaran</h3>
            <p className="text-xs text-slate-500 mb-4">Distribusi alokasi dana per bidang</p>

            {pieData.length > 0 ? (
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatRupiah(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-slate-400">
                Belum ada data pengeluaran tercatat
              </div>
            )}
          </div>

          <div className="space-y-1.5 mt-4 pt-4 border-t border-slate-100">
            {pieData.map((entry, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-slate-700">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-900">{formatRupiah(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Category breakdown & Important Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Realisasi Peruntukan Dana BOP RT</h3>
              <p className="text-xs text-slate-500">Sesuai Peraturan Penggunaan Dana BOP RT Pemkot Semarang</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-red-600 hover:text-red-700 font-semibold"
            >
              Lihat Semua Transaksi →
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(categoryLabels).map(([key, cat]) => {
              if (key === 'lainnya') return null;
              const amount = categoryTotals[key] || 0;
              const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;

              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-800 flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.color.split(' ')[0]}`}></span>
                      <span>{cat.label}</span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatRupiah(amount)}{' '}
                      <span className="text-xs font-normal text-slate-500">({percent}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, percent)}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-400">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rules & Compliance Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-red-700 font-bold mb-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Aturan Penting BOP RT Semarang</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Besaran:</strong> Rp 25.000.000 per RT setiap tahun dari APBD Kota Semarang.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Wajib Musyawarah:</strong> Setiap penggunaan dana wajib diputuskan dan disetujui lewat musyawarah warga.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  ✕
                </div>
                <span>
                  <strong className="text-red-700">DILARANG KERAS:</strong> Dana BOP RT tidak boleh digunakan untuk honor atau gaji pengurus RT (Ketua, Sekretaris, Bendahara).
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Peruntukan:</strong> Kebersihan lingkungan, kegiatan sosial, pemberdayaan warga, ketahanan pangan, dan administrasi RT.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('musyawarah')}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold py-2.5 px-4 rounded-xl text-xs border border-slate-200 flex items-center justify-center space-x-2 transition-all"
            >
              <Users className="w-4 h-4 text-slate-600" />
              <span>Kelola Berita Acara Musyawarah</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
