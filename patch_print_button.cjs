const fs = require('fs');

const file = './src/components/NotulenGenerator.tsx';
let content = fs.readFileSync(file, 'utf-8');

const target = `<div className="flex flex-wrap gap-2 items-center bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button`;

const replacement = `<div className="flex flex-wrap gap-2 items-center bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm mr-2"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{docViewMode === 'daftar-hadir' ? 'Cetak Daftar Hadir (PDF)' : docViewMode === 'undangan' ? 'Cetak Undangan (PDF)' : 'Cetak Notulen (PDF)'}</span>
            </button>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
console.log('Patched print button');
