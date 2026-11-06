const fs = require('fs');
let content = fs.readFileSync('src/components/NotulenGenerator.tsx', 'utf8');

// 1. Update State
content = content.replace(
  `const [docViewMode, setDocViewMode] = useState<'daftar-hadir' | 'notulen'>('daftar-hadir');`,
  `const [docViewMode, setDocViewMode] = useState<'daftar-hadir' | 'notulen' | 'undangan'>('undangan');`
);

// 2. Add Mail icon
content = content.replace(
  `  Sparkles,`,
  `  Sparkles,\n  Mail,`
);

// 3. Update Switcher
const switcherTarget = `            <button
              onClick={() => setDocViewMode('notulen')}
              className={\`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all \${
                docViewMode === 'notulen' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }\`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {selectedPresetId === 'notulen-tirakatan-16agustus' || selectedPresetId === 'notulen-resepsi-23agustus'
                  ? 'Berita Acara Pelaksanaan'
                  : 'Notulen Rapat'}
              </span>
            </button>
          </div>`;
const switcherReplacement = `            <button
              onClick={() => setDocViewMode('notulen')}
              className={\`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all \${
                docViewMode === 'notulen' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }\`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {selectedPresetId === 'notulen-tirakatan-16agustus' || selectedPresetId === 'notulen-resepsi-23agustus'
                  ? 'Berita Acara Pelaksanaan'
                  : 'Notulen Rapat'}
              </span>
            </button>
            <button
              onClick={() => setDocViewMode('undangan')}
              className={\`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all \${
                docViewMode === 'undangan' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }\`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Surat Undangan</span>
            </button>
          </div>`;
content = content.replace(switcherTarget, switcherReplacement);

// 4. Update Cetak Button Title
const cetakTitleTarget = `            <span>{docViewMode === 'daftar-hadir' ? 'Cetak Daftar Hadir (PDF)' : 'Cetak Notulen (PDF)'}</span>`;
const cetakTitleReplacement = `            <span>{docViewMode === 'daftar-hadir' ? 'Cetak Daftar Hadir (PDF)' : docViewMode === 'undangan' ? 'Cetak Undangan (PDF)' : 'Cetak Notulen (PDF)'}</span>`;
content = content.replace(cetakTitleTarget, cetakTitleReplacement);

// 5. Update executePrint
const executePrintTarget = `    executePrint(\`\${docViewMode === 'daftar-hadir' ? 'Daftar Hadir' : 'Notulen'} - \${month} \${profile.year}\`);`;
const executePrintReplacement = `    executePrint(\`\${docViewMode === 'daftar-hadir' ? 'Daftar Hadir' : docViewMode === 'undangan' ? 'Surat Undangan' : 'Notulen'} - \${month} \${profile.year}\`);`;
content = content.replace(executePrintTarget, executePrintReplacement);

// 6. Editor logic adjustment
const editorTitleTarget = `            <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">
              {docViewMode === 'daftar-hadir' 
                 ? 'Pengaturan Daftar Hadir' 
                 : selectedPresetId === 'notulen-tirakatan-16agustus' || selectedPresetId === 'notulen-resepsi-23agustus'
                ? 'Formulir Berita Acara Pelaksanaan'
                : 'Formulir Notulen Rapat'}
            </span>`;
const editorTitleReplacement = `            <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">
              {docViewMode === 'daftar-hadir' 
                 ? 'Pengaturan Daftar Hadir' 
                 : docViewMode === 'undangan' 
                 ? 'Pengaturan Surat Undangan'
                 : selectedPresetId === 'notulen-tirakatan-16agustus' || selectedPresetId === 'notulen-resepsi-23agustus'
                ? 'Formulir Berita Acara Pelaksanaan'
                : 'Formulir Notulen Rapat'}
            </span>`;
content = content.replace(editorTitleTarget, editorTitleReplacement);

fs.writeFileSync('src/components/NotulenGenerator.tsx', content);
