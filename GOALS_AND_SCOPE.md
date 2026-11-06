# SI-BOP RT (Sistem Informasi Bantuan Operasional RT)
## Goals & Scope Dokumentasi Proyek

Dokumen ini mendefinisikan tujuan utama (*Goals*) dan cakupan fungsional (*Scope*) dari aplikasi **SI-BOP RT 04 / RW 04 Kelurahan Gunungpati, Kecamatan Gunungpati, Kota Semarang Tahun Anggaran 2026**. Dokumen ini digunakan sebagai acuan pengembangan, pemeliharaan, serta referensi pembaruan fitur di masa mendatang.

---

## 1. Tujuan Utama (Project Goals)
Aplikasi ini dibangun untuk mencapai tujuan-tujuan berikut:
- **Otomatisasi Administrasi Keuangan RT**: Menghilangkan kerepotan perhitungan manual dan rekapitulasi pelaporan dana Bantuan Operasional RT (Pagu Rp 25.000.000 APBD Kota Semarang Tahun 2026).
- **Efisiensi Alur Kerja Pengurus**: Memungkinkan Ketua, Sekretaris, dan Bendahara RT untuk menginput data sekali, yang kemudian secara otomatis menyusun seluruh berkas lampiran resmi.
- **Kepatuhan Regulasi Pemkot Semarang**: Menyesuaikan format dokumen (BKU, SPTJM, RAP, Berita Acara, Notulen, Daftar Hadir, dan Lampiran Foto) persis dengan ketentuan dan Juknis resmi Kota Semarang.
- **Siap Cetak & Unggah**: Menyediakan fitur cetak / ekspor PDF dengan layout yang **sama persis dengan tampilan di web**, sehingga pengurus tinggal mencetak, menandatangani, memberi stempel basah, lalu mengunggahnya ke portal **Ruang Warga Kota Semarang**.

---

## 2. Cakupan Fungsional (Project Scope)

### A. Data Wilayah & Kepengurusan (Profil RT)
- Wilayah: RT 04 / RW 04 Ngabean, Kelurahan Gunungpati, Kecamatan Gunungpati, Kota Semarang.
- Tahun Anggaran: 2026.
- Pagu Total: Rp 25.000.000.
- Kepengurusan: M. Wakhid Nurjanah (Ketua RT), Muh Zaenun (Sekretaris), Muhammad Ervan (Bendahara), Karto (Ketua RW), Ita Setiyaningsih, S.E. (Lurah Gunungpati).

### B. Modul Utama & Fitur Sistem
1. **Dashboard Utama & Grafik Recharts**
   - Ringkasan total pagu, penerimaan, pengeluaran, dan saldo kas akhir.
   - Grafik batang & pie chart perbandingan RAP vs Realisasi pengeluaran bulanan.
2. **Pencatatan Transaksi Kas**
   - Pencatatan kas masuk (pencairan dana) dan pengeluaran berdasarkan kategori peruntukan (Kebersihan, Sosial, Pemberdayaan, Ketahanan Pangan, Administrasi).
   - Pengurutan otomatis berdasarkan tanggal dan nomor bukti.
3. **Rencana Anggaran Penggunaan (RAP)**
   - Pengelolaan alokasi anggaran 12 bulan sesuai Perwal Kota Semarang.
   - Fitur cetak Berita Acara Kesepakatan RAP dan dokumen RAP.
4. **Buku Kas Umum (BKU) & Laporan Realisasi**
   - Rekapitulasi otomatis arus kas masuk dan keluar per bulan atau akumulasi setahun penuh / Rapel Jan-Agu.
   - Format standar laporan pertanggungjawaban ke Kelurahan.
5. **Surat Permohonan Pencairan & Pengambilan Bulanan**
   - Generator surat permohonan pencairan melalui Bank Jateng.
   - Format pengambilan operasional bulanan sesuai RAP.
6. **SPTJM (Surat Pernyataan Tanggung Jawab Mutlak)**
   - Dokumen legalitas pertanggungjawaban penggunaan dana yang ditandatangani Ketua RT bermaterai.
7. **Modul SPJ Bulanan & Bukti Fisik (Monthly SPJ Manager)**
   - Berkas naskah SPJ utama bulanan.
   - Notulen Rapat RT dan Rapat PKK.
   - Daftar Hadir Partisipasi Warga (mendukung format silang 1 lembar 100 warga / 2 kolom serta format reguler).
   - Dokumen Khusus LPJ Agustusan (Tirakatan & Resepsi HUT RI ke-81 Tahun 2026).
   - **Lampiran Foto Dokumentasi (Foto Kegiatan & Nota Belanja)**: Pengaturan orientasi foto (potret/lanskap), otomatisasi tata letak 2 foto postcard per lembar kertas A4, lengkap dengan keterangan tanggal, uraian, dan nominal.
8. **Sinkronisasi Cetak & Layout Web**
   - Pengoptimalan CSS print agar hasil cetak fisik maupun PDF memiliki warna, garis, padding, dan struktur yang **sama persis dengan tampilan di web**.

---

## 3. Panduan Pemeliharaan & Pembaruan (Maintenance Guide)
- **Struktur Kode**: Komponen modular terletak di `/src/components/`, data awal di `/src/data/`, dan utilitas di `/src/utils/`.
- **Styling**: Menggunakan Tailwind CSS dengan font standar dokumen resmi (`Arial Narrow`).
- **Verifikasi**: Setiap perubahan kode wajib divalidasi dengan menjalankan `compile_applet` dan `lint_applet` untuk memastikan zero error pada build produksi.
