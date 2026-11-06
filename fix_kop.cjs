const fs = require('fs');
// no glob // Note: we can just manually list files to avoid glob dependency if it's not there, but `glob` might not be installed. Let's use simple fs.readdirSync recursive.
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  let files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles('./src/components');
let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  // We want to replace the sequence of divs in the Kop Surat.
  // There are slight variations, e.g., font-semibold vs font-bold, text-[12px], uppercase etc.
  
  // A regex approach might be tricky if formatting differs.
  // Let's do a more robust string replacement for the common patterns.
  
  content = content.replace(/className="text-\[12px\][^>]+>\s*PEMERINTAH KOTA SEMARANG\s*<\/div>/g, 'className="text-[14px] font-bold uppercase text-slate-900 leading-tight">\n              PEMERINTAH KOTA SEMARANG\n            </div>');
  
  content = content.replace(/className="text-\[12px\][^>]+>\s*KECAMATAN \{profile\.kecamatan(\.toUpperCase\(\))?\}\s*<\/div>/g, 'className="text-[14px] font-bold uppercase text-slate-900 leading-tight">\n              KECAMATAN {profile.kecamatan}\n            </div>');
  
  content = content.replace(/className="text-\[12px\][^>]+>\s*KELURAHAN \{profile\.kelurahan(\.toUpperCase\(\))?\}\s*<\/div>/g, 'className="text-[14px] font-bold uppercase text-slate-900 leading-tight">\n              KELURAHAN {profile.kelurahan}\n            </div>');
  
  content = content.replace(/className="text-\[16px\][^>]+>\s*RT \{profile\.rtNumber\} RW \{profile\.rwNumber\}\s*<\/div>/g, 'className="text-[18px] font-bold uppercase text-slate-900 leading-tight mt-1">\n              RT {profile.rtNumber} RW {profile.rwNumber}\n            </div>');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
    updatedCount++;
  }
});
console.log('Total files updated:', updatedCount);
