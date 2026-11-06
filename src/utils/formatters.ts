export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateWithDay(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      '',
      'Januari',
      'Februari',
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
    const dayName = days[dateObj.getDay()];
    return `${dayName}, ${parseInt(day, 10)} ${months[parseInt(month, 10)]} ${year}`;
  } catch {
    return dateString;
  }
}

export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    const months = [
      '',
      'Januari',
      'Februari',
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
    return `${parseInt(day, 10)} ${months[parseInt(month, 10)]} ${year}`;
  } catch {
    return dateString;
  }
}
