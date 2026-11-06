const fs = require('fs');

const initialDataFile = 'src/data/initialData.ts';
let content = fs.readFileSync(initialDataFile, 'utf8');

const pkkPresets = `
export const pkkNotulenPresets: NotulenPreset[] = [
  {
    id: 'pkk-notulen-januari',
    month: 'Januari',
    date: '2026-01-16',
    time: '15:30 - selesai',
    location: 'Kediaman Ibu ...',
    participantCount: 40,
    leader: 'TISNANI SUBANDIYAH',
    secretary: 'INDRIANAH',
    agendaItems: [
      'Rapat dibuka dengan bacaan basmallah, ucapan salam dan ucapan terima kasih atas kehadiran ibu ibu PKK',
      'Menyanyikan Mars PKK dan pembacaan 1 program pokok PKK',
      'Laporan Keuangan',
      'Lain-lain',
      'Mengingatkan untuk pelunasan simpan pinjam Bank sampah',
      'Jika ada kegiatan RT diharap ikut berpatisipasi',
      'Akan ada haul mbh kyai pati joyokusumo tanggal 13,14,15 januari untuk ikut berpartisipasi'
    ],
    discussionNotes: 'Pertemuan rutin PKK RT 04 bulan Januari diawali dengan pembukaan, menyanyikan Mars PKK, dan pembacaan program pokok PKK. Dalam sambutannya, Ketua PKK memaparkan rancangan program kerja awal tahun dan laporan keuangan kas. Ditekankan pula tenggat waktu pelunasan simpan pinjam Bank Sampah agar segera diselesaikan. Seluruh kader dan anggota PKK dihimbau untuk terus menjaga kekompakan, berpartisipasi aktif dalam setiap kegiatan lingkungan RT, serta turut menyemarakkan acara Haul Mbah Kyai Pati Joyokusumo yang akan diselenggarakan pada tanggal 13, 14, dan 15 Januari mendatang.',
    decisions: '1. Pelunasan simpan pinjam Bank Sampah disepakati untuk diselesaikan paling lambat pada pertemuan bulan depan.\\n2. Seluruh anggota PKK berkomitmen untuk selalu guyub rukun dan berpartisipasi aktif dalam kegiatan gotong royong maupun agenda RT lainnya.\\n3. Warga dan kader PKK sepakat untuk mendukung serta turut berpartisipasi dalam rangkaian acara Haul Mbah Kyai Pati Joyokusumo pada 13-15 Januari.'
  },
  {
    id: 'pkk-notulen-pebruari',
    month: 'Pebruari',
    date: '2026-02-16',
    time: '15:30 - selesai',
    location: 'Kediaman Ibu ...',
    participantCount: 40,
    leader: 'TISNANI SUBANDIYAH',
    secretary: 'INDRIANAH',
    agendaItems: [
      'Rapat dibuka dengan bacaan basmallah, ucapan salam dan ucapan terima kasih atas kehadiran ibu ibu PKK',
      'Menyanyikan Mars PKK dan pembacaan 1 program pokok PKK',
      'Laporan Keuangan',
      'Lain-lain'
    ],
    discussionNotes: 'Pertemuan rutin PKK RT 04 bulan Pebruari berjalan dengan lancar. Kegiatan diawali dengan menyanyikan lagu Mars PKK dan dilanjutkan dengan pembacaan program pokok PKK. Laporan keuangan bulanan dilaporkan dan disetujui bersama oleh anggota.',
    decisions: '1. Laporan keuangan bulanan diterima oleh seluruh anggota PKK.\\n2. Anggota PKK sepakat untuk terus meningkatkan partisipasi kegiatan.'
  },
  {
    id: 'pkk-notulen-maret',
    month: 'Maret',
    date: '2026-03-05',
    time: '15:30 - selesai',
    location: 'Kediaman Ibu ...',
    participantCount: 40,
    leader: 'TISNANI SUBANDIYAH',
    secretary: 'INDRIANAH',
    agendaItems: [
      'Rapat dibuka dengan bacaan basmallah, ucapan salam dan ucapan terima kasih atas kehadiran ibu ibu PKK',
      'Menyanyikan Mars PKK dan pembacaan 1 program pokok PKK',
      'Laporan Keuangan',
      'Lain-lain'
    ],
    discussionNotes: 'Pertemuan rutin PKK RT 04 bulan Maret berjalan dengan lancar. Kegiatan diawali dengan menyanyikan lagu Mars PKK dan dilanjutkan dengan pembacaan program pokok PKK. Laporan keuangan bulanan dilaporkan dan disetujui bersama oleh anggota.',
    decisions: '1. Laporan keuangan bulanan diterima oleh seluruh anggota PKK.\\n2. Anggota PKK sepakat untuk terus meningkatkan partisipasi kegiatan.'
  },
  {
    id: 'pkk-notulen-april',
    month: 'April',
    date: '2026-04-16',
    time: '15:30 - selesai',
    location: 'Kediaman Ibu ...',
    participantCount: 40,
    leader: 'TISNANI SUBANDIYAH',
    secretary: 'INDRIANAH',
    agendaItems: [
      'Rapat dibuka dengan bacaan basmallah, ucapan salam dan ucapan terima kasih atas kehadiran ibu ibu PKK',
      'Menyanyikan Mars PKK dan pembacaan 1 program pokok PKK',
      'Laporan Keuangan',
      'Lain-lain'
    ],
    discussionNotes: 'Pertemuan rutin PKK RT 04 bulan April berjalan dengan lancar. Kegiatan diawali dengan menyanyikan lagu Mars PKK dan dilanjutkan dengan pembacaan program pokok PKK. Laporan keuangan bulanan dilaporkan dan disetujui bersama oleh anggota.',
    decisions: '1. Laporan keuangan bulanan diterima oleh seluruh anggota PKK.\\n2. Anggota PKK sepakat untuk terus meningkatkan partisipasi kegiatan.'
  },
  {
    id: 'pkk-notulen-mei',
    month: 'Mei',
    date: '2026-05-16',
    time: '15:30 - selesai',
    location: 'Kediaman Ibu ...',
    participantCount: 40,
    leader: 'TISNANI SUBANDIYAH',
    secretary: 'INDRIANAH',
    agendaItems: [
      'Rapat dibuka dengan bacaan basmallah, ucapan salam dan ucapan terima kasih atas kehadiran ibu ibu PKK',
      'Menyanyikan Mars PKK dan pembacaan 1 program pokok PKK',
      'Laporan Keuangan',
      'Lain-lain'
    ],
    discussionNotes: 'Pertemuan rutin PKK RT 04 bulan Mei berjalan dengan lancar. Kegiatan diawali dengan menyanyikan lagu Mars PKK dan dilanjutkan dengan pembacaan program pokok PKK. Laporan keuangan bulanan dilaporkan dan disetujui bersama oleh anggota.',
    decisions: '1. Laporan keuangan bulanan diterima oleh seluruh anggota PKK.\\n2. Anggota PKK sepakat untuk terus meningkatkan partisipasi kegiatan.'
  },
  {
    id: 'pkk-notulen-juni',
    month: 'Juni',
    date: '2026-06-01',
    time: '15:30 - selesai',
    location: 'Kediaman Ibu ...',
    participantCount: 40,
    leader: 'TISNANI SUBANDIYAH',
    secretary: 'INDRIANAH',
    agendaItems: [
      'Rapat dibuka dengan bacaan basmallah, ucapan salam dan ucapan terima kasih atas kehadiran ibu ibu PKK',
      'Menyanyikan Mars PKK dan pembacaan 1 program pokok PKK',
      'Laporan Keuangan',
      'Lain-lain'
    ],
    discussionNotes: 'Pertemuan rutin PKK RT 04 bulan Juni berjalan dengan lancar. Kegiatan diawali dengan menyanyikan lagu Mars PKK dan dilanjutkan dengan pembacaan program pokok PKK. Laporan keuangan bulanan dilaporkan dan disetujui bersama oleh anggota.',
    decisions: '1. Laporan keuangan bulanan diterima oleh seluruh anggota PKK.\\n2. Anggota PKK sepakat untuk terus meningkatkan partisipasi kegiatan.'
  },
  {
    id: 'pkk-notulen-juli',
    month: 'Juli',
    date: '2026-07-06',
    time: '15:30 - selesai',
    location: 'Kediaman Ibu ...',
    participantCount: 40,
    leader: 'TISNANI SUBANDIYAH',
    secretary: 'INDRIANAH',
    agendaItems: [
      'Rapat dibuka dengan bacaan basmallah, ucapan salam dan ucapan terima kasih atas kehadiran ibu ibu PKK',
      'Menyanyikan Mars PKK dan pembacaan 1 program pokok PKK',
      'Laporan Keuangan',
      'Lain-lain'
    ],
    discussionNotes: 'Pertemuan rutin PKK RT 04 bulan Juli berjalan dengan lancar. Kegiatan diawali dengan menyanyikan lagu Mars PKK dan dilanjutkan dengan pembacaan program pokok PKK. Laporan keuangan bulanan dilaporkan dan disetujui bersama oleh anggota.',
    decisions: '1. Laporan keuangan bulanan diterima oleh seluruh anggota PKK.\\n2. Anggota PKK sepakat untuk terus meningkatkan partisipasi kegiatan.'
  },
  {
    id: 'pkk-notulen-agustus',
    month: 'Agustus',
    date: '2026-08-04',
    time: '15:30 - selesai',
    location: 'Kediaman Ibu ...',
    participantCount: 40,
    leader: 'TISNANI SUBANDIYAH',
    secretary: 'INDRIANAH',
    agendaItems: [
      'Rapat dibuka dengan bacaan basmallah, ucapan salam dan ucapan terima kasih atas kehadiran ibu ibu PKK',
      'Menyanyikan Mars PKK dan pembacaan 1 program pokok PKK',
      'Laporan Keuangan',
      'Lain-lain'
    ],
    discussionNotes: 'Pertemuan rutin PKK RT 04 bulan Agustus berjalan dengan lancar. Kegiatan diawali dengan menyanyikan lagu Mars PKK dan dilanjutkan dengan pembacaan program pokok PKK. Laporan keuangan bulanan dilaporkan dan disetujui bersama oleh anggota.',
    decisions: '1. Laporan keuangan bulanan diterima oleh seluruh anggota PKK.\\n2. Anggota PKK sepakat untuk terus meningkatkan partisipasi kegiatan.'
  }
];
`;

content = content + '\n' + pkkPresets;
fs.writeFileSync(initialDataFile, content);
