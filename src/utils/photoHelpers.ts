import { DocumentationPhoto, MonthlySpjRecord } from '../types';

export const getTirakatanPhotos = (existingRecord?: Partial<MonthlySpjRecord>): DocumentationPhoto[] => {
  return [
    {
      id: `photo-tirakatan-1`,
      title: 'Malam Tirakatan HUT RI Ke 81',
      description: 'Kegiatan doa bersama, tahlil pejuang, renungan suci dan pemotongan tumpeng kemerdekaan bersama warga.',
      date: '16 Agustus 2026',
      location: 'Balai Warga RT 04 / RW 04 Ngabean',
      imageUrl: existingRecord?.meetingPhotoUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      orientation: 'landscape',
      fitMode: 'cover',
    },
    {
      id: `photo-tirakatan-2`,
      title: 'Sambutan Ketua RT & Tokoh Masyarakat',
      description: 'Sambutan dan pengarahan dari Ketua RT serta tokoh masyarakat dalam acara malam tirakatan.',
      date: '16 Agustus 2026',
      location: 'Balai Warga RT 04 / RW 04 Ngabean',
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
      orientation: 'landscape',
      fitMode: 'cover',
    },
    {
      id: `photo-tirakatan-3`,
      title: 'Pembelanjaan Konsumsi Tirakatan',
      description: 'Pengadaan bahan tumpeng tirakatan, snack warga, dan perlengkapan doa bersama.',
      date: '15 Agustus 2026',
      location: 'Wilayah RT 04 Ngabean',
      imageUrl: existingRecord?.itemPhotoUrl || 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80',
      orientation: 'landscape',
      fitMode: 'cover',
    },
    {
      id: `photo-tirakatan-4`,
      title: 'Dokumentasi Suasana Tirakatan',
      description: 'Warga berkumpul menikmati tumpeng dan hidangan dalam suasana kebersamaan malam tirakatan.',
      date: '16 Agustus 2026',
      location: 'Balai Warga RT 04 / RW 04 Ngabean',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      orientation: 'landscape',
      fitMode: 'cover',
    },
  ];
};

export const getResepsiPhotos = (existingRecord?: Partial<MonthlySpjRecord>): DocumentationPhoto[] => {
  return [
    {
      id: `photo-resepsi-1`,
      title: 'Malam Resepsi HUT RI Ke 81',
      description: 'Pentas seni kreasi pemuda, panggung gembira warga memeriahkan kemerdekaan.',
      date: '23 Agustus 2026',
      location: 'Panggung Kemerdekaan RT 04 Ngabean',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      orientation: 'landscape',
      fitMode: 'cover',
    },
    {
      id: `photo-resepsi-2`,
      title: 'Penyerahan Hadiah Lomba',
      description: 'Penyerahan hadiah lomba 17-an dan doorprize kepada warga yang berpartisipasi.',
      date: '23 Agustus 2026',
      location: 'Panggung Kemerdekaan RT 04 Ngabean',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      orientation: 'landscape',
      fitMode: 'cover',
    },
    {
      id: `photo-resepsi-3`,
      title: 'Pembelanjaan Keperluan Resepsi',
      description: 'Pembelanjaan perlengkapan panggung, sound system, hadiah lomba dan doorprize.',
      date: '20 Agustus 2026',
      location: 'Wilayah RT 04 Ngabean',
      imageUrl: existingRecord?.itemPhotoUrl || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
      orientation: 'landscape',
      fitMode: 'cover',
    },
    {
      id: `photo-resepsi-4`,
      title: 'Keseruan Warga & Ramah Tamah',
      description: 'Dokumentasi kebersamaan warga menikmati hiburan dan ramah tamah pada malam resepsi kemerdekaan.',
      date: '23 Agustus 2026',
      location: 'Panggung Kemerdekaan RT 04 Ngabean',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      orientation: 'landscape',
      fitMode: 'cover',
    },
  ];
};

export const getKarnavalPhotos = (existingRecord?: Partial<MonthlySpjRecord>): DocumentationPhoto[] => {
  return [
    {
      id: `photo-karnaval-1`,
      title: 'Pelepasan Kontingen di Lapangan Morokono (Start)',
      description: 'Pemberangkatan kontingen RW 04 (Kp. Ngabean) berbusana adat nusantara & kreasi budaya dari titik Start Lapangan Morokono menuju Finish Jalan Baru Gunungpati.',
      date: '30 Agustus 2026',
      location: 'Lapangan Morokono Gunungpati',
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
      orientation: 'landscape',
      fitMode: 'cover',
    },
    {
      id: `photo-karnaval-2`,
      title: 'Kirab Budaya di Garis Finish Jalan Baru Gunungpati',
      description: 'Aksi atraktif kontingen RW 04 (Kp. Ngabean) saat tiba di panggung kehormatan garis Finish Jalan Baru Gunungpati menampilkan seni budaya dan yel-yel kebangsaan.',
      date: '30 Agustus 2026',
      location: 'Jalan Baru Gunungpati (Garis Finish)',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
      orientation: 'landscape',
      fitMode: 'cover',
    },
    {
      id: `photo-karnaval-3`,
      title: 'Juara 1 Wali Kota & Hadiah Uang Pembinaan Ibu Wali Kota',
      description: 'Penyerahan Trofi Juara 1 Tingkat Wali Kota Semarang kepada RW 04 (Kp. Ngabean) serta penerimaan Hadiah Uang Pembinaan dari Ibu Wali Kota Semarang untuk seluruh kontingen.',
      date: '30 Agustus 2026',
      location: 'Panggung Utama Jalan Baru Gunungpati',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      orientation: 'landscape',
      fitMode: 'cover',
    },
    {
      id: `photo-karnaval-4`,
      title: 'Trofi Juara 2 Kelurahan & Dukungan Operasional BOP RT',
      description: 'Penerimaan Trofi Juara 2 Tingkat Kelurahan Gunungpati oleh kontingen RW 04 (Kp. Ngabean) dan pertanggungjawaban belanja operasional kontingen RT 04 yang didanai BOP RT.',
      date: '30 Agustus 2026',
      location: 'Wilayah RT 04 Ngabean',
      imageUrl: existingRecord?.itemPhotoUrl || 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80',
      orientation: 'landscape',
      fitMode: 'cover',
    },
  ];
};

export const getDefaultPhotosForMonth = (
  month: string,
  year: number = 2026,
  existingRecord?: Partial<MonthlySpjRecord>
): DocumentationPhoto[] => {
  // If record already has valid photos, return them
  if (existingRecord?.photos && existingRecord.photos.length > 0) {
    return existingRecord.photos;
  }

  // Special preset for August (Agustusan / HUT RI Ke-81)
  if (month.toLowerCase() === 'agustus') {
    return [
      {
        id: `photo-agustus-1`,
        title: 'Malam Tirakatan HUT RI Ke 81 Tahun 2026',
        description: 'Kegiatan doa bersama, tahlil pejuang, renungan suci dan pemotongan tumpeng kemerdekaan bersama warga.',
        date: '16 Agustus 2026',
        location: 'Balai Warga RT 04 / RW 04 Ngabean',
        imageUrl: existingRecord?.meetingPhotoUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
        orientation: 'landscape',
        fitMode: 'cover',
      },
      {
        id: `photo-agustus-2`,
        title: 'Malam Resepsi HUT RI Ke 81 Tahun 2026',
        description: 'Pentas seni kreasi pemuda, panggung gembira warga dan penyerahan hadiah aneka lomba 17-an.',
        date: '23 Agustus 2026',
        location: 'Panggung Kemerdekaan RT 04 Ngabean',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
        orientation: 'landscape',
        fitMode: 'cover',
      },
      {
        id: `photo-agustus-3`,
        title: 'Pembelanjaan Konsumsi & Logistik HUT RI',
        description: 'Pengadaan bahan tumpeng tirakatan, snack warga, sound system dan perlengkapan panggung.',
        date: '15 Agustus 2026',
        location: 'Wilayah RT 04 Ngabean',
        imageUrl: existingRecord?.itemPhotoUrl || 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80',
        orientation: 'landscape',
        fitMode: 'cover',
      },
      {
        id: `photo-agustus-4`,
        title: 'Bukti Nota / Kwitansi Pembelian Toko',
        description: 'Nota kontan sah berstempel toko untuk pembelanjaan konsumsi dan perlengkapan kegiatan.',
        date: '17 Agustus 2026',
        location: 'Toko / Rekanan Penyedia',
        imageUrl: existingRecord?.receiptPhotoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        orientation: 'portrait', // Exemplary portrait photo
        fitMode: 'contain',
      },
    ];
  }

  // Special preset for July (Menghias Kampung & Sosialisasi BOP)
  if (month.toLowerCase() === 'juli') {
    return [
      {
        id: `photo-juli-1`,
        title: 'Rapat Warga Sosialisasi BOP RT 2026',
        description: 'Musyawarah pembahasan rencana pembelanjaan lampu hias, cat kampung dan administrasi BOP.',
        date: '06 Juli 2026',
        location: 'Kediaman Bp. Sunarno RT 04',
        imageUrl: existingRecord?.meetingPhotoUrl || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        orientation: 'landscape',
        fitMode: 'cover',
      },
      {
        id: `photo-juli-2`,
        title: 'Barang Belanjaan Menghias Lingkungan',
        description: 'Lampu LED, cat tembok, cat kayu, kuas, tiner dan tiang bendera untuk menyemarakkan kampung.',
        date: '12 Juli 2026',
        location: 'Pos Kamling RT 04 Ngabean',
        imageUrl: existingRecord?.itemPhotoUrl || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
        orientation: 'portrait', // Exemplary portrait photo
        fitMode: 'cover',
      },
      {
        id: `photo-juli-3`,
        title: 'Nota / Kwitansi Pembelian Toko Bangunan',
        description: 'Nota asli pembelanjaan bahan cat dan perlengkapan lampu hias jalan RT 04.',
        date: '12 Juli 2026',
        location: 'Toko Bangunan & Listrik',
        imageUrl: existingRecord?.receiptPhotoUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        orientation: 'portrait',
        fitMode: 'contain',
      },
      {
        id: `photo-juli-4`,
        title: 'Gotong Royong Pemasangan Lampu & Pengecatan',
        description: 'Warga RT 04 kerja bakti memasang tiang bendera dan mengecat portal pintu masuk kampung.',
        date: '19 Juli 2026',
        location: 'Sepanjang Jalan RT 04 RW 04',
        imageUrl: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80',
        orientation: 'landscape',
        fitMode: 'cover',
      },
    ];
  }

  // Generic fallback for other months
  return [
    {
      id: `photo-${month.toLowerCase()}-1`,
      title: `Pertemuan Rutin Bulanan`,
      description: `Dokumentasi pertemuan rutin bulanan dan arisan warga.`,
      date: `Bulan ${month} ${year}`,
      location: `Ibu Tisnani Subandiyah`,
      imageUrl: existingRecord?.meetingPhotoUrl || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
      orientation: 'landscape',
      fitMode: 'cover',
    },
    {
      id: `photo-${month.toLowerCase()}-2`,
      title: `Pertemuan Rutin Bulanan`,
      description: `Dokumentasi kebersamaan warga dalam pertemuan rutin.`,
      date: `Bulan ${month} ${year}`,
      location: `Ibu Tisnani Subandiyah`,
      imageUrl: existingRecord?.itemPhotoUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      orientation: 'landscape',
      fitMode: 'cover',
    },
  ];
};
