const fs = require('fs');

const file = './src/components/NotulenGenerator.tsx';
let content = fs.readFileSync(file, 'utf-8');

const regexToReplace = /\{meetingType === 'rt' \? \([\s\S]*?'HUT RI Ke-81'\n\s*\) : \([\s\S]*?'Laporan Bulanan'\n\s*\)\}/g;

const fallbackReplacement = `{preset.agendaTitle || 
  (meetingType === 'rt' ? (
    preset.month === 'Januari' ? 'Persiapan Haul' :
    preset.month === 'Pebruari' ? 'Tabungan Warga' :
    preset.month === 'Maret' ? 'Buka Bersama' :
    preset.month === 'April' ? 'Halal Bi Halal' :
    preset.month === 'Mei' ? 'Taman TOGA PKK' :
    preset.month === 'Juni' ? 'Zarkasi Jogja' :
    preset.month === 'Juli' ? 'Sosialisasi BOP' :
    preset.month === 'Agustus' ? 'HUT RI Ke-81' : 'Rapat Rutin'
  ) : (
    preset.month === 'Januari' ? 'Proker PKK' :
    preset.month === 'Pebruari' || preset.month === 'Maret' || preset.month === 'April' || preset.month === 'Mei' || preset.month === 'Juni' || preset.month === 'Juli' || preset.month === 'Agustus' ? 'Laporan Bulanan' : 'Pertemuan PKK'
  ))
}`;

content = content.replace(regexToReplace, fallbackReplacement);

fs.writeFileSync(file, content);
console.log('Fixed fallback');
