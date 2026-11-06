import { RapItem, Transaction } from '../types';

export function absorbRapToTransactions(
  rapItems: RapItem[],
  existingTransactions: Transaction[],
  maxMonthNumber: number = 8
): Transaction[] {
  const monthToNum: Record<string, string> = {
    januari: '01',
    pebruari: '02',
    februari: '02',
    maret: '03',
    april: '04',
    mei: '05',
    juni: '06',
    juli: '07',
    agustus: '08',
    september: '09',
    oktober: '10',
    november: '11',
    desember: '12',
  };

  // 1. Clean existing transactions:
  // - Remove tx-rap- auto-generated transactions to prevent accumulation
  // - Remove any future unrealized expenses (month > maxMonthNumber)
  // - Strict deduplication by ID and by signature (type + date + category + description + amount)
  const seenIds = new Set<string>();
  const seenSignatures = new Set<string>();

  const cleanedTransactions: Transaction[] = [];

  for (const t of existingTransactions) {
    if (!t) continue;

    // Remove old auto-generated tx-rap- items so we don't accumulate stale duplicates
    if (t.id && t.id.startsWith('tx-rap-')) {
      continue;
    }

    // Filter out future unrealized expenses (month > maxMonthNumber)
    if (t.type === 'expense' && t.date) {
      const parts = t.date.split('-');
      const mNum = parseInt(parts[1], 10);
      if (!isNaN(mNum) && mNum > maxMonthNumber) {
        continue; // Skip future unrealized expense
      }
    }

    // Deduplicate by ID
    if (t.id && seenIds.has(t.id)) {
      continue;
    }

    // Deduplicate by content signature
    const sig = `${t.type}_${t.date}_${t.category}_${(t.description || '').trim().toLowerCase()}_${t.amount}`;
    if (seenSignatures.has(sig)) {
      continue;
    }

    if (t.id) seenIds.add(t.id);
    seenSignatures.add(sig);
    cleanedTransactions.push(t);
  }

  const newTransactions: Transaction[] = [...cleanedTransactions];

  // 2. Ensure income total is exactly 25.000.000 (18.800.000 + 6.200.000)
  // Filter out any extra duplicate income entries from old Bank Jateng sync attempts
  const incomeTxList = newTransactions.filter((t) => t.type === 'income');
  const totalIncome = incomeTxList.reduce((acc, curr) => acc + curr.amount, 0);

  if (totalIncome !== 25000000 || incomeTxList.length > 2) {
    // Keep standard 2 income transactions
    const nonIncomeTx = newTransactions.filter((t) => t.type !== 'income');
    const income1: Transaction = {
      id: 'tx-1',
      date: '2026-08-10',
      type: 'income',
      category: 'lainnya',
      description: 'Pencairan Dana BOP RT (Rapel Periode Januari - Agustus 2026)',
      amount: 18800000,
      recipientOrDonor: 'BPPKAD / Pemkot Semarang',
      notes: 'Masuk Rekening Bank Jateng (Pencairan Rapel 8 Bulan)',
      hasMusyawarah: true,
      documentNumber: 'BPD-01/VIII/2026',
    };
    const income2: Transaction = {
      id: 'tx-2-inc',
      date: '2026-08-10',
      type: 'income',
      category: 'lainnya',
      description: 'Pencairan Alokasi Dana BOP RT 2026 (Sisa Pagu APBD)',
      amount: 6200000,
      recipientOrDonor: 'BPPKAD / Pemkot Semarang',
      notes: 'Masuk Rekening Bank Jateng (Total Pagu Rp 25.000.000)',
      hasMusyawarah: true,
      documentNumber: 'BPD-02/VIII/2026',
    };
    newTransactions.length = 0;
    newTransactions.push(income1, income2, ...nonIncomeTx);
  }

  // 3. Find which months already have recorded expense transactions
  const monthsWithExpenses = new Set<string>();
  newTransactions.forEach((t) => {
    if (t.type === 'expense' && t.date) {
      const mStr = t.date.split('-')[1];
      if (mStr) monthsWithExpenses.add(mStr);
    }
  });

  // 4. Absorb RAP items ONLY for months that do not have recorded expense transactions yet!
  rapItems.forEach((rap) => {
    if (!rap.month) return;
    const mLower = rap.month.toLowerCase().trim();
    const monthNumStr = monthToNum[mLower] || String(rap.monthNumber || 1).padStart(2, '0');
    const mNum = parseInt(monthNumStr, 10);

    if (mNum > maxMonthNumber) return; // Skip future unrealized months
    if (monthsWithExpenses.has(monthNumStr)) return; // Skip months that already have transactions

    const day = rap.category === 'pemberdayaan' ? '18' : '15';
    const year = 2026;
    const dateStr = `${year}-${monthNumStr}-${day}`;

    let recipient = 'Konsumsi Warga RT 04';
    if (rap.category === 'pemberdayaan') recipient = 'PKK RT 04';
    else if (rap.category === 'kebersihan') recipient = 'Toko Bahan / Material RT';
    else if (rap.category === 'sosial') recipient = 'Panitia HUT RI / Warga RT';
    else if (rap.category === 'ketahanan_pangan') recipient = 'Kelompok Toga RT 04';

    newTransactions.push({
      id: `tx-rap-${rap.id}`,
      date: dateStr,
      type: 'expense',
      category: rap.category,
      description: rap.description,
      amount: rap.total || rap.qty * rap.price,
      recipientOrDonor: recipient,
      notes: `Diserap otomatis dari RAP Bulan ${rap.month}`,
      hasMusyawarah: true,
      documentNumber: `NOTA-RAP/${monthNumStr}/2026`,
    });
  });

  return newTransactions;
}
