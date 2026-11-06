const fs = require('fs');

const file = './src/data/initialData.ts';
let content = fs.readFileSync(file, 'utf-8');

// For RT
const rtMap = {
  'Januari': 'Persiapan Haul',
  'Pebruari': 'Tabungan Warga',
  'Maret': 'Buka Bersama',
  'April': 'Halal Bi Halal',
  'Mei': 'Taman TOGA PKK',
  'Juni': 'Zarkasi Jogja',
  'Juli': 'Sosialisasi BOP',
  'Agustus': 'HUT RI Ke-81'
};

// For PKK
const pkkMap = {
  'Januari': 'Proker PKK'
};

// A bit complex with regex. Let's just add it dynamically if missing when loading in NotulenGenerator, or we can patch initialData.ts.
// Actually, it's easier to just handle it in NotulenGenerator fallback!
