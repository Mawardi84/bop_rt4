export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'kebersihan'
  | 'sosial'
  | 'pemberdayaan'
  | 'ketahanan_pangan'
  | 'administrasi'
  | 'lainnya'
  | string;

export interface CategoryDefinition {
  id: string; // Identifier e.g. 'kebersihan', 'sosial', etc., or custom slug
  name: string; // Display label
  color: string; // Tailwind styling classes e.g. 'bg-emerald-50 text-emerald-700 border-emerald-200'
  desc?: string; // Description / peruntukan info
  isCustom?: boolean; // True if created by user
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  recipientOrDonor: string; // Pemberi (untuk kas masuk) atau Penerima/Toko (untuk kas keluar)
  notes?: string;
  hasMusyawarah: boolean; // Wajib diputuskan lewat musyawarah warga
  documentNumber?: string; // No. Kwitansi / Nota / SPJ
}

export interface RtProfile {
  rtNumber: string;
  rwNumber: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  ketuaRt: string;
  sekretaris: string;
  bendaharaRt: string;
  ketuaPkk?: string;
  sekretarisPkk?: string;
  lurahName: string;
  rwChairman: string;
  year: number;
  totalPagu: number; // Default 25000000 (Rp25 Juta)
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  logoUrl?: string; // URL atau base64 data-URI logo Kota Semarang untuk Kop Surat
  pkkLogoUrl?: string; // URL atau base64 data-URI logo PKK untuk Pertemuan & Notulen PKK
}

export interface RapItem {
  id: string;
  month: string; // 'Januari', 'Februari', dll
  monthNumber: number; // 1 to 12
  category: TransactionCategory;
  description: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
}

export interface MusyawarahRecord {
  id: string;
  date: string;
  title: string;
  participantCount: number;
  agenda: string;
  decisions: string;
  leader: string;
  secretary: string;
}

export interface DocumentationPhoto {
  id: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  imageUrl: string;
  orientation: 'landscape' | 'portrait';
  fitMode?: 'cover' | 'contain';
}

export interface MonthlySpjRecord {
  id: string;
  month: string; // 'Januari', 'Februari', dll
  year: number;
  notulenRt: string;
  notulenPkk: string;
  attendanceCount: number;
  attendanceNotes: string;
  meetingPhotoUrl: string;
  itemPhotoUrl: string;
  receiptPhotoUrl: string;
  photos?: DocumentationPhoto[];
}

export interface NotulenPreset {
  id: string;
  month: string;
  date: string;
  time: string;
  location: string;
  participantCount: number;
  leader: string;
  secretary: string;
  agendaTitle?: string;
  agendaItems: string[];
  discussionNotes: string;
  decisions: string;
  invitedCount?: number;
  absentNames?: string;
  arisanUang?: string;
  arisanBarang?: string;
}

export interface AttendeeItem {
  no: number;
  name: string;
  gender: 'L' | 'P';
}

export type ActiveTab = 'dashboard' | 'ba-kesepakatan' | 'rap' | 'sptjm' | 'surat' | 'pengambilan' | 'transactions' | 'reports' | 'spj-bulanan' | 'notulen' | 'musyawarah' | 'settings';
